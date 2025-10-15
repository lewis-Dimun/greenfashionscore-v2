import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    const body = await req.json();
    const { surveyId, answers } = body;

    if (!surveyId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Missing surveyId or answers' }, { status: 400 });
    }

    // Validate that all required answers are provided
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id')
      .eq('is_specific', false);

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return NextResponse.json({ error: 'Failed to validate answers' }, { status: 500 });
    }

    if (answers.length !== questions.length) {
      return NextResponse.json({ 
        error: `Expected ${questions.length} answers, got ${answers.length}` 
      }, { status: 400 });
    }

    // Insert user answers
    const userAnswers = answers.map((answer: any) => ({
      user_id: user.id,
      question_id: answer.questionId,
      answer_id: answer.answerId,
      points_obtained: answer.points,
      general_survey_id: surveyId
    }));

    const { error: answersError } = await supabase
      .from('user_answers')
      .insert(userAnswers);

    if (answersError) {
      console.error('Error inserting answers:', answersError);
      return NextResponse.json({ error: 'Failed to save answers' }, { status: 500 });
    }

    // Mark survey as completed
    const { error: updateError } = await supabase
      .from('general_surveys')
      .update({ 
        completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', surveyId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating survey:', updateError);
      return NextResponse.json({ error: 'Failed to complete survey' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'General survey completed successfully' 
    });
  } catch (error) {
    console.error('Complete general survey API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
