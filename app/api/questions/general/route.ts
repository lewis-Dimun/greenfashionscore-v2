import { NextRequest, NextResponse } from 'next/server';
import { getAllQuestionsByCategory } from '../../../../lib/survey/questions-service';

export async function GET(_req: NextRequest) {
  try {
    // Return ALL questions (general + specific) grouped by dimension
    const data = await getAllQuestionsByCategory();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Questions general API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



