import { Session } from '@supabase/supabase-js';

export function isAdmin(session: Session | null | undefined): boolean {
  if (!session?.user) return false;
  const email = session.user.email?.toLowerCase();
  const role = (session.user.app_metadata as any)?.role;
  if (role === 'admin') return true;
  if (email === 'admin@example.com') return true;
  return false;
}


