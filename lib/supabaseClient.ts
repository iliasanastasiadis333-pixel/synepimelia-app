import { createClient } from '@supabase/supabase-js';

// Singleton Supabase client for browser
// This ensures only one client instance exists throughout the app
// Prevents infinite re-render loops and memory leaks

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
