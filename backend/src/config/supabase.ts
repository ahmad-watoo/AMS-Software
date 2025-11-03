import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Admin client with service role key (for server-side operations)
export const supabaseAdmin = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Public client with anon key (for client-side operations)
export const supabase = createClient(env.supabase.url, env.supabase.anonKey);

export default supabaseAdmin;

