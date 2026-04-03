import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

// Ensure we don't use the string "undefined" which can happen with some build setups
const finalUrl = (supabaseUrl && supabaseUrl !== 'undefined') ? supabaseUrl : 'https://hbzexecpgszkxkvjvqqb.supabase.co';
const finalKey = (supabaseAnonKey && supabaseAnonKey !== 'undefined') ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhienhlY3Bnc3preGt2anZxcWIiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcxMTg5Mjg5NCwiZXhwIjoyMDI3NDY4ODk0fQ';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'undefined') {
  console.warn('Supabase credentials missing or invalid. Using fallback for testing.');
}

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'undefined' && supabaseAnonKey !== 'undefined');

export const supabase = createClient(finalUrl, finalKey);

/**
 * Safe fetch wrapper for Supabase queries with error handling and default values.
 */
export async function safeFetch<T>(
  query: any,
  defaultValue: T,
  errorMessage: string = 'Supabase fetch error'
): Promise<T> {
  try {
    const { data, error } = await query;
    if (error) {
      console.error(`${errorMessage}:`, error);
      return defaultValue;
    }
    return (data as T) || defaultValue;
  } catch (err) {
    console.error(`${errorMessage} (exception):`, err);
    return defaultValue;
  }
}
