import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function hasCompletedGeneralSurvey(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('general_surveys')
    .select('id, completed')
    .eq('user_id', userId)
    .eq('completed', true)
    .maybeSingle();

  if (error) return false;
  return !!data?.completed;
}


