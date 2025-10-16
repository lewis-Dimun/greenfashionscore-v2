import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateCompleteSurveyScore } from '../../../lib/scoring/engine';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Check environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    // Create Supabase client with service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { scope, product_type, answers } = body;

    // Validate required fields
    if (!scope || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
    }

    if (scope === 'product' && !product_type) {
      return NextResponse.json({ error: 'product_type required for product scope' }, { status: 400 });
    }

    // Calculate score using the scoring engine
    const surveyScore = calculateCompleteSurveyScore(answers, scope, product_type);

    if (scope === 'general') {
      // Create or update general survey
      const { data: survey, error: surveyError } = await supabase
        .from('general_surveys')
        .upsert({
          user_id: user.id,
          completed: true
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (surveyError) {
        console.error('Error creating/updating general survey:', surveyError);
        return NextResponse.json({ error: 'Failed to save survey' }, { status: 500 });
      }

      // Save user answers
      for (const answer of answers) {
        const { error: answerError } = await supabase
          .from('user_answers')
          .upsert({
            user_id: user.id,
            question_id: Number(answer.questionId),
            answer_id: Number(answer.answerId),
            points_obtained: answer.numericValue,
            general_survey_id: survey.id
          }, { onConflict: 'user_id,question_id,general_survey_id' });

        if (answerError) {
          console.error('Error saving user answer:', answerError);
          return NextResponse.json({ error: 'Failed to save answers' }, { status: 500 });
        }
      }

      return NextResponse.json({
        success: true,
        status: 'completed',
        surveyId: survey.id,
        score: {
          people: surveyScore.scores.people,
          planet: surveyScore.scores.planet,
          materials: surveyScore.scores.materials,
          circularity: surveyScore.scores.circularity,
          total: surveyScore.total,
          grade: surveyScore.grade
        }
      });
    } else {
      // Handle product-specific surveys
      // First, get the user's general survey
      const { data: generalSurvey, error: generalError } = await supabase
        .from('general_surveys')
        .select('id')
        .eq('user_id', user.id)
        .eq('completed', true)
        .single();

      if (generalError || !generalSurvey) {
        return NextResponse.json({ error: 'General survey must be completed first' }, { status: 400 });
      }

      // Create specific survey
      const { data: specificSurvey, error: specificError } = await supabase
        .from('specific_surveys')
        .insert({
          user_id: user.id,
          general_survey_id: generalSurvey.id,
          product_name: product_type || 'Producto'
        })
        .select()
        .single();

      if (specificError) {
        console.error('Error creating specific survey:', specificError);
        return NextResponse.json({ error: 'Failed to create specific survey' }, { status: 500 });
      }

      // Save user answers for specific survey
      for (const answer of answers) {
        const { error: answerError } = await supabase
          .from('user_answers')
          .insert({
            user_id: user.id,
            question_id: Number(answer.questionId),
            answer_id: Number(answer.answerId),
            points_obtained: answer.numericValue,
            specific_survey_id: specificSurvey.id
          });

        if (answerError) {
          console.error('Error saving specific survey answer:', answerError);
          return NextResponse.json({ error: 'Failed to save answers' }, { status: 500 });
        }
      }

      return NextResponse.json({
        success: true,
        status: 'completed',
        surveyId: specificSurvey.id,
        score: {
          people: surveyScore.scores.people,
          planet: surveyScore.scores.planet,
          materials: surveyScore.scores.materials,
          circularity: surveyScore.scores.circularity,
          total: surveyScore.total,
          grade: surveyScore.grade
        }
      });
    }
    
  } catch (error) {
    console.error('Scoring API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
