import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fvphwceryseoupjdtsfs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cGh3Y2VyeXNlb3VwamR0c2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDc5MTMsImV4cCI6MjA2NTgyMzkxM30.NEXyisNKomfxGzpP_BqLl3yCrY49m3Sf5CcwBhgUv8Q';

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    global: {
      headers: { 'Accept': 'application/json' }
    }
  }
);
