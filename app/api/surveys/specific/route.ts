import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hasCompletedGeneralSurvey } from '../../../lib/survey/guards';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Guard: general survey must be completed
    const completed = await hasCompletedGeneralSurvey(user.id);
    if (!completed) {
      return NextResponse.json({ error: 'General survey must be completed first', code: 'GENERAL_SURVEY_REQUIRED' }, { status: 409 });
    }

    const body = await req.json();
    const { productName } = body as { productName: string };
    if (!productName) return NextResponse.json({ error: 'productName required' }, { status: 400 });

    // Get completed general survey id
    const { data: general } = await supabase
      .from('general_surveys')
      .select('id')
      .eq('user_id', user.id)
      .eq('completed', true)
      .single();

    const { data: created, error } = await supabase
      .from('specific_surveys')
      .insert({ user_id: user.id, general_survey_id: general?.id, product_name: productName })
      .select()
      .single();

    if (error) {
      console.error('Create specific survey error:', error);
      return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }

    return NextResponse.json(created);
  } catch (error) {
    console.error('Specific survey POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { surveyId, completed, answers } = body as { surveyId: number; completed: boolean; answers: Array<{ questionId: string; answerId: string; numericValue: number }>; };
    if (!surveyId) return NextResponse.json({ error: 'surveyId required' }, { status: 400 });

    if (Array.isArray(answers)) {
      for (const a of answers) {
        const { error: upsertError } = await supabase
          .from('user_answers')
          .upsert({
            user_id: user.id,
            question_id: Number(a.questionId),
            answer_id: Number(a.answerId),
            points_obtained: Number(a.numericValue) || 0,
            specific_survey_id: surveyId
          }, { onConflict: 'user_id,question_id,specific_survey_id' });
        if (upsertError) {
          console.error('Upsert specific answer error:', upsertError);
          return NextResponse.json({ error: 'Failed to save answers' }, { status: 500 });
        }
      }
    }

    const { error: updateError } = await supabase
      .from('specific_surveys')
      .update({})
      .eq('id', surveyId);
    if (updateError) {
      console.error('Update specific survey error:', updateError);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json({ id: surveyId, completed: !!completed });
  } catch (error) {
    console.error('Specific survey PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    await supabase.from('user_answers').delete().eq('specific_survey_id', id).eq('user_id', user.id);
    await supabase.from('specific_surveys').delete().eq('id', id).eq('user_id', user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Specific survey DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


