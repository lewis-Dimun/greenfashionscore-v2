import 'server-only';
import { createServerSupabaseClient } from '../supabase-server';

// Use server client for guards as they need to check user-specific data
const supabase = createServerSupabaseClient();

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


