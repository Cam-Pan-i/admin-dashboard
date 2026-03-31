import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.warn('Supabase credentials missing or invalid. Please set SUPABASE_URL and SUPABASE_KEY in your environment.');
}

export const supabase = createClient(
  supabaseUrl || 'https://hbzexecpgszkxkvjvqqb.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhienhlY3Bnc3preGt2anZxcWIiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcxMTg5Mjg5NCwiZXhwIjoyMDI3NDY4ODk0fQ.placeholder'
);
