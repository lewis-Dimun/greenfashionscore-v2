import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { computeUserDashboardScores } from '../../../lib/scoring/compute';
import { hasCompletedGeneralSurvey } from '../../../lib/survey/guards';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use anon key for user token verification
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// Use service key for database operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      console.error('No authorization header provided');
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    console.log('Token length:', token.length);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError) {
      console.error('Auth error details:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    if (!user) {
      console.error('No user found in token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // If no general survey completed, short-circuit and return CTA flag
    const completed = await hasCompletedGeneralSurvey(user.id);
    if (!completed) {
      return NextResponse.json({ hasGeneralSurvey: false });
    }

    // Compute dashboard scores using admin client
    const scores = await computeUserDashboardScores(user.id, supabaseAdmin);

    // Format response for dashboard
    const response = {
      general: scores.general ? {
        total: scores.general.total,
        category: scores.general.category,
        breakdown: scores.general.breakdown
      } : null,
      specific: scores.specific.map(score => ({
        total: score.total,
        category: score.category,
        breakdown: score.breakdown,
        productName: (score as any).productName
      })),
      summary: {
        hasGeneral: !!scores.general,
        specificCount: scores.specific.length,
        averageSpecific: scores.specific.length > 0 
          ? Math.round(scores.specific.reduce((sum, s) => sum + s.total, 0) / scores.specific.length * 100) / 100
          : 0
      }
    };

    return NextResponse.json({ hasGeneralSurvey: true, ...response });
    
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
