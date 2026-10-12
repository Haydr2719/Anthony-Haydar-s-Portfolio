import { createHash } from "node:crypto";
import { getServiceClient } from "@/lib/supabase/clients";

// SERVER ONLY. Rate limiting backed by Supabase (see the rate_limit function in supabase/migrations/01_schema.sql).
// Counters are shared by every server instance, and check + count is one atomic
// database statement, so it works reliably on serverless hosting (Vercel).

/** All limits in one place. */
export const LIMITS = {
  /** failed admin logins per IP */
  loginIp: { limit: 5, windowSeconds: 15 * 60 },
  /** failed admin logins per email address */
  loginEmail: { limit: 10, windowSeconds: 60 * 60 },
  /** enquiries per IP */
  enquiryIp: { limit: 5, windowSeconds: 10 * 60 },
  /** enquiries per email address */
  enquiryEmail: { limit: 3, windowSeconds: 60 * 60 },
  /** counted clicks per IP per banner */
  bannerClick: { limit: 1, windowSeconds: 60 * 60 },
} as const;

export interface RateLimitResult {
  allowed: boolean;
  /** seconds until the limit resets (0 when allowed) */
  retryAfter: number;
}

/**
 * Visitor IP. On Vercel these headers are set by Vercel itself and cannot be
 * spoofed by the visitor. Behind another host/proxy, check how it sets them.
 */
export function getClientIp(h: Headers): string | null {
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip")?.trim() || null;
}

/** One-way hash so raw IPs / emails are never stored. */
export function hashId(value: string): string {
  return createHash("sha256").update(`${value.toLowerCase()}:${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}`).digest("hex");
}

/**
 * Checks (and by default counts) one attempt for `key`.
 * If Supabase is unavailable or the SQL hasn't been run yet, the request is
 * allowed (and logged) so a setup problem never locks people out.
 */
export async function rateLimit(
  key: string,
  rule: { limit: number; windowSeconds: number },
  opts: { increment?: boolean } = {},
): Promise<RateLimitResult> {
  const db = getServiceClient();
  if (!db) return { allowed: true, retryAfter: 0 };

  const { data, error } = await db.rpc("rate_limit", {
    p_key: key,
    p_limit: rule.limit,
    p_window_seconds: rule.windowSeconds,
    p_increment: opts.increment ?? true,
  });
  if (error) {
    console.error(`[rate-limit] ${key}: ${error.message} - allowing request`);
    return { allowed: true, retryAfter: 0 };
  }

  const row = (Array.isArray(data) ? data[0] : data) as { allowed: boolean; reset_at: string } | undefined;
  if (!row || row.allowed) return { allowed: true, retryAfter: 0 };
  const retryAfter = Math.max(1, Math.ceil((Date.parse(row.reset_at) - Date.now()) / 1000));
  console.warn(`[rate-limit] blocked ${key.split(":").slice(0, 2).join(":")} for ${retryAfter}s`);
  return { allowed: false, retryAfter };
}

/** "3 minutes", "1 minute" */
export function waitText(seconds: number) {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}
