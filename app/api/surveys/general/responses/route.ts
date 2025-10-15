import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use anon key for user token verification
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// Use service key for database operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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

    // Get user's general survey
    const { data: generalSurvey, error: surveyError } = await supabaseAdmin
      .from('general_surveys')
      .select('id, completed, created_at')
      .eq('user_id', user.id)
      .single();

    if (surveyError) {
      if (surveyError.code === 'PGRST116') {
        return NextResponse.json({ error: 'No general survey found' }, { status: 404 });
      }
      console.error('Error fetching general survey:', surveyError);
      return NextResponse.json({ error: 'Failed to fetch survey' }, { status: 500 });
    }

    // Get user's answers with question and answer details
    const { data: userAnswers, error: answersError } = await supabaseAdmin
      .from('user_answers')
      .select(`
        id,
        points_obtained,
        question:questions(
          id,
          text,
          is_specific,
          dimension:dimensions(id, name, weight_percent, max_points)
        ),
        answer:answers(
          id,
          text,
          points
        )
      `)
      .eq('user_id', user.id)
      .eq('general_survey_id', generalSurvey.id)
      .order('question_id');

    if (answersError) {
      console.error('Error fetching user answers:', answersError);
      return NextResponse.json({ error: 'Failed to fetch answers' }, { status: 500 });
    }

    // Group answers by dimension for easier frontend handling
    const responsesByDimension: Record<string, any[]> = {};
    
    userAnswers.forEach(answer => {
      const dimensionName = answer.question.dimension.name;
      if (!responsesByDimension[dimensionName]) {
        responsesByDimension[dimensionName] = [];
      }
      
      responsesByDimension[dimensionName].push({
        id: answer.id,
        questionId: answer.question.id,
        questionText: answer.question.text,
        answerId: answer.answer.id,
        answerText: answer.answer.text,
        points: answer.points_obtained,
        maxPoints: answer.question.dimension.max_points,
        weightPercent: answer.question.dimension.weight_percent
      });
    });

    return NextResponse.json({
      survey: generalSurvey,
      responses: responsesByDimension,
      totalResponses: userAnswers.length
    });

  } catch (error) {
    console.error('General survey responses API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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
    const { responses } = body;

    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json({ error: 'Invalid responses format' }, { status: 400 });
    }

    // Validate that all responses have required fields
    for (const response of responses) {
      if (!response.questionId || !response.answerId || response.points === undefined) {
        return NextResponse.json({ 
          error: 'Each response must have questionId, answerId, and points' 
        }, { status: 400 });
      }
    }

    // Get user's general survey
    const { data: generalSurvey, error: surveyError } = await supabaseAdmin
      .from('general_surveys')
      .select('id, completed')
      .eq('user_id', user.id)
      .single();

    if (surveyError) {
      return NextResponse.json({ error: 'No general survey found' }, { status: 404 });
    }

    // Update each response
    const updatePromises = responses.map(response => 
      supabaseAdmin
        .from('user_answers')
        .update({
          answer_id: response.answerId,
          points_obtained: response.points
        })
        .eq('id', response.id)
        .eq('user_id', user.id)
        .eq('general_survey_id', generalSurvey.id)
    );

    const results = await Promise.all(updatePromises);
    
    // Check for any errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Errors updating responses:', errors);
      return NextResponse.json({ error: 'Failed to update some responses' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Responses updated successfully',
      updatedCount: responses.length
    });

  } catch (error) {
    console.error('Update responses API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

