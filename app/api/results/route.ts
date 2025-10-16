import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase-server';
import { computeScoresForSurvey } from '../../../lib/scoring/compute';

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
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

    const { searchParams } = new URL(req.url);
    const surveyId = searchParams.get('surveyId');
    const type = searchParams.get('type') as 'general' | 'specific';

    if (!surveyId || !type) {
      return NextResponse.json({ 
        error: 'Missing surveyId or type parameter' 
      }, { status: 400 });
    }

    if (!['general', 'specific'].includes(type)) {
      return NextResponse.json({ 
        error: 'Type must be "general" or "specific"' 
      }, { status: 400 });
    }

    // Compute scores for the survey
    const scores = await computeScoresForSurvey(supabase, user.id, parseInt(surveyId), type);

    return NextResponse.json(scores);
  } catch (error) {
    console.error('Results API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
