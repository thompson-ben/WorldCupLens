import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Create a Supabase client from environment variables, or return null when the
 * project isn't configured (in which case the app falls back to seed data).
 */
export function createServerSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
