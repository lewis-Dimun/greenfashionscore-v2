import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hasCompletedGeneralSurvey } from '../../../lib/survey/guards';

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

    // Guard: ensure general survey completed before listing/creating specifics
    const completed = await hasCompletedGeneralSurvey(user.id);
    if (!completed) {
      return NextResponse.json({ requiresGeneralSurvey: true }, { status: 403 });
    }

    // Get user's specific surveys
    const { data: surveys, error } = await supabase
      .from('specific_surveys')
      .select(`
        id,
        product_name,
        created_at,
        general_survey:general_surveys(id, completed)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching specific surveys:', error);
      return NextResponse.json({ error: 'Failed to fetch surveys' }, { status: 500 });
    }

    return NextResponse.json(surveys);
  } catch (error) {
    console.error('Specific surveys API error:', error);
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

    const body = await req.json();
    const { productName } = body;

    if (!productName) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    // GUARD: Check if user has completed general survey
    const completed = await hasCompletedGeneralSurvey(user.id);

    if (!completed) {
      return NextResponse.json({ 
        error: 'General survey must be completed first',
        code: 'GENERAL_SURVEY_REQUIRED'
      }, { status: 409 });
    }

    // Create new specific survey
    // We need the general survey id for FK; fetch it (completed one)
    const { data: generalSurvey } = await supabase
      .from('general_surveys')
      .select('id')
      .eq('user_id', user.id)
      .eq('completed', true)
      .single();

    if (!generalSurvey) {
      return NextResponse.json({ error: 'No completed general survey found' }, { status: 400 });
    }

    const { data: newSurvey, error: createError } = await supabase
      .from('specific_surveys')
      .insert({
        user_id: user.id,
        general_survey_id: generalSurvey.id,
        product_name: productName
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating specific survey:', createError);
      return NextResponse.json({ error: 'Failed to create survey' }, { status: 500 });
    }

    return NextResponse.json(newSurvey);
  } catch (error) {
    console.error('Specific survey API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
