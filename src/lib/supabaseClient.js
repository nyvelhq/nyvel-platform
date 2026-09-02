import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fails loudly in dev rather than silently falling back to mock
  // behavior — F-01's whole point is that auth is no longer optional.
  // eslint-disable-next-line no-console
  console.error(
    'Missing REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY. ' +
    'Copy .env.example to .env.local and fill in your Supabase project values.'
  );
}

// createClient throws synchronously if either value is falsy/malformed —
// that happens at module-load time, before React ever mounts, so it takes
// down the ENTIRE app (landing page included) with a blank white screen,
// not just the login flow. Fall back to a syntactically valid placeholder
// so the app always boots; auth calls simply fail until real env vars are
// set (locally in .env.local, or in Vercel -> Project Settings ->
// Environment Variables for deployed environments).
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key-not-real',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
