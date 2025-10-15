import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch general survey and specifics
    const [{ data: general }, { data: specific }] = await Promise.all([
      supabase.from('general_surveys').select('id, completed, created_at').eq('user_id', user.id).limit(1),
      supabase.from('specific_surveys').select('id, product_name, created_at').eq('user_id', user.id).order('created_at', { ascending: false })
    ]);

    return NextResponse.json({ general: general?.[0] || null, specific: specific || [] });
  } catch (error) {
    console.error('Surveys me API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


