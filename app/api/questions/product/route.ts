import { NextRequest, NextResponse } from 'next/server';
import { getProductQuestionsByCategory } from '../../../../lib/survey/questions-service';

export async function GET(_req: NextRequest) {
  try {
    const data = await getProductQuestionsByCategory();
    // Validate that data is an object (grouped by dimension). If not, return empty array
    if (!data || (typeof data !== 'object')) {
      console.error('Invalid product questions payload shape:', data);
      return NextResponse.json([]);
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Questions product API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



