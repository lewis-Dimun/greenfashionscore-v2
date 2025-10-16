import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// PUT - Guardar/actualizar encuesta específica (borrador o completa)
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
    const { surveyId, completed, answers, productType } = body;

    let specificSurveyId = surveyId;

    if (surveyId && surveyId > 0) {
      // Update existing survey
      const { error: updateError } = await supabase
        .from('specific_surveys')
        .update({ completed: !!completed })
        .eq('id', surveyId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating specific survey:', updateError);
        return NextResponse.json({ error: 'Failed to update survey' }, { status: 500 });
      }
    } else {
      // Create new survey
      const { data: newSurvey, error: createError } = await supabase
        .from('specific_surveys')
        .insert({
          user_id: user.id,
          product_name: productType || 'Producto',
          completed: !!completed
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating specific survey:', createError);
        return NextResponse.json({ error: 'Failed to create survey' }, { status: 500 });
      }
      specificSurveyId = newSurvey.id;
    }

    // Delete existing answers for this survey
    const { error: deleteError } = await supabase
      .from('user_answers')
      .delete()
      .eq('user_id', user.id)
      .eq('specific_survey_id', specificSurveyId);

    if (deleteError) {
      console.error('Error deleting old answers:', deleteError);
      return NextResponse.json({ error: 'Failed to clear old answers' }, { status: 500 });
    }

    // Insert new user answers
    if (Array.isArray(answers) && answers.length > 0) {
      const answersToInsert = answers.map((answer: any) => ({
        user_id: user.id,
        question_id: Number(answer.questionId),
        answer_id: Number(answer.answerId),
        points_obtained: Number(answer.numericValue) || 0,
        specific_survey_id: specificSurveyId
      }));

      const { error: insertError } = await supabase
        .from('user_answers')
        .insert(answersToInsert);

      if (insertError) {
        console.error('Error inserting new answers:', insertError);
        return NextResponse.json({ error: 'Failed to save answers' }, { status: 500 });
      }
    }

    return NextResponse.json({ id: specificSurveyId, completed: !!completed, success: true });
  } catch (error) {
    console.error('Specific survey PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Renombrar encuesta específica
export async function PATCH(req: NextRequest) {
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
    const { surveyId, product_name } = body;

    if (!surveyId || !product_name) {
      return NextResponse.json({ error: 'Survey ID and product name are required' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('specific_surveys')
      .update({ product_name })
      .eq('id', surveyId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error renaming specific survey:', updateError);
      return NextResponse.json({ error: 'Failed to rename survey' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Specific survey PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Eliminar encuesta específica
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
    const surveyId = searchParams.get('id');

    if (!surveyId) {
      return NextResponse.json({ error: 'Survey ID is required' }, { status: 400 });
    }

    // Delete user answers first due to foreign key constraints
    const { error: deleteAnswersError } = await supabase
      .from('user_answers')
      .delete()
      .eq('specific_survey_id', Number(surveyId))
      .eq('user_id', user.id);

    if (deleteAnswersError) {
      console.error('Error deleting user answers:', deleteAnswersError);
      return NextResponse.json({ error: 'Failed to delete survey answers' }, { status: 500 });
    }

    // Then delete the specific survey
    const { error: deleteSurveyError } = await supabase
      .from('specific_surveys')
      .delete()
      .eq('id', Number(surveyId))
      .eq('user_id', user.id);

    if (deleteSurveyError) {
      console.error('Error deleting specific survey:', deleteSurveyError);
      return NextResponse.json({ error: 'Failed to delete specific survey' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Specific survey and answers deleted successfully' });
  } catch (error) {
    console.error('Specific survey DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}