import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
  try {
    // Get user ID from JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get or create general survey for user
    const { data: existingSurvey, error: fetchError } = await supabase
      .from('general_surveys')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching general survey:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch survey' }, { status: 500 });
    }

    if (existingSurvey) {
      return NextResponse.json(existingSurvey);
    }

    // Create new general survey
    const { data: newSurvey, error: createError } = await supabase
      .from('general_surveys')
      .insert({
        user_id: user.id,
        completed: false
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating general survey:', createError);
      return NextResponse.json({ error: 'Failed to create survey' }, { status: 500 });
    }

    return NextResponse.json(newSurvey);
  } catch (error) {
    console.error('General survey API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get user ID from JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Create new general survey
    const { data: newSurvey, error: createError } = await supabase
      .from('general_surveys')
      .insert({
        user_id: user.id,
        completed: false
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating general survey:', createError);
      return NextResponse.json({ error: 'Failed to create survey' }, { status: 500 });
    }

    return NextResponse.json(newSurvey);
  } catch (error) {
    console.error('General survey API error:', error);
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
    const { completed, answers } = body as { completed: boolean; answers: Array<{ questionId: string; answerId: string; numericValue: number }>; };

    // Ensure a general survey exists
    const { data: survey, error: surveyError } = await supabase
      .from('general_surveys')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (surveyError && surveyError.code !== 'PGRST116') {
      console.error('Error fetching general survey:', surveyError);
      return NextResponse.json({ error: 'Failed to fetch survey' }, { status: 500 });
    }

    let surveyId = survey?.id as number | undefined;
    if (!surveyId) {
      const { data: created, error: createError } = await supabase
        .from('general_surveys')
        .insert({ user_id: user.id, completed: false })
        .select('id')
        .single();
      if (createError) {
        console.error('Error creating general survey:', createError);
        return NextResponse.json({ error: 'Failed to create survey' }, { status: 500 });
      }
      surveyId = created.id;
    }

    // Upsert user answers for draft save
    if (Array.isArray(answers)) {
      for (const a of answers) {
        const { error: upsertError } = await supabase
          .from('user_answers')
          .upsert({
            user_id: user.id,
            question_id: Number(a.questionId),
            answer_id: Number(a.answerId),
            points_obtained: Number(a.numericValue) || 0,
            general_survey_id: surveyId
          }, { onConflict: 'user_id,question_id,general_survey_id' });
        if (upsertError) {
          console.error('Error upserting answer:', upsertError);
          return NextResponse.json({ error: 'Failed to save answers' }, { status: 500 });
        }
      }
    }

    // Update completion flag
    const { error: updateError } = await supabase
      .from('general_surveys')
      .update({ completed: !!completed })
      .eq('id', surveyId);

    if (updateError) {
      console.error('Error updating survey:', updateError);
      return NextResponse.json({ error: 'Failed to update survey' }, { status: 500 });
    }

    return NextResponse.json({ id: surveyId, completed: !!completed });
  } catch (error) {
    console.error('General survey PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
