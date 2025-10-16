import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client for server-side operations with user authentication.
 * This client respects Row Level Security (RLS) policies and user permissions.
 * Use this for most API route operations.
 */
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Creates a Supabase client with service role key for admin operations.
 * This client bypasses RLS and should ONLY be used for:
 * - Admin operations that require elevated permissions
 * - System-level operations (not user-initiated)
 * - Operations that must work regardless of user authentication
 * 
 * ⚠️ SECURITY WARNING: Never use this in client-side code!
 */
export function createAdminSupabaseClient() {
  // Prevent usage in client-side code
  if (typeof window !== 'undefined') {
    throw new Error('Admin client cannot be used on client side');
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Helper function to check if we're in a server environment
 */
export function isServerSide() {
  return typeof window === 'undefined';
}
