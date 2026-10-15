import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// The "publishable" key (sb_publishable_...). The legacy "anon" variable name still works.
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let publicClient: SupabaseClient | null = null;

/** Cookie-less client for public, cacheable reads (RLS limits it to published content). */
export function getPublicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  publicClient ??= createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return publicClient;
}

/**
 * Privileged client using the secret / service-role key. SERVER ONLY.
 * Used to store leads and banner clicks after spam checks - never import into client components.
 */
export function getServiceClient(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !key) return null;
  return createSupabaseClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
