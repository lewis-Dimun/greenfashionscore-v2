import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get('questionId');

    if (!questionId) {
      return NextResponse.json({ error: 'Missing questionId parameter' }, { status: 400 });
    }

    // Get all answer options for the specific question
    const { data: answers, error } = await supabase
      .from('answers')
      .select('id, text, points')
      .eq('question_id', parseInt(questionId))
      .order('points', { ascending: false });

    if (error) {
      console.error('Error fetching answer options:', error);
      return NextResponse.json({ error: 'Failed to fetch answer options' }, { status: 500 });
    }

    return NextResponse.json(answers);
  } catch (error) {
    console.error('Answer options API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

