import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Check environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

    // For now, return mock response until Edge Functions are deployed
    // TODO: Replace with actual Edge Function call
    const mockResponse = {
      surveyId: 'mock-survey-id',
      score: {
        people: 10,
        planet: 8,
        materials: 15,
        circularity: 7,
        total: 40,
        grade: 'C'
      }
    };

    return NextResponse.json(mockResponse);
    
  } catch (error) {
    console.error('Scoring API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
