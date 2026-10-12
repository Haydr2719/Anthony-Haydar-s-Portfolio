"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LIMITS, getClientIp, hashId, rateLimit, waitText } from "@/lib/rate-limit";
import { requireAdmin } from "@/lib/cms/auth";
import { SETTINGS_FIELDS, getCollection, type FieldDef } from "@/lib/cms/collections";
import { isSupabaseConfigured } from "@/lib/supabase/clients";
import { createAuthClient } from "@/lib/supabase/server";
import { LEAD_STATUSES } from "@/lib/options";
import { isPushConfigured, sendPushToAdmins } from "@/lib/push";

export interface SaveResult {
  ok: boolean;
  id?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

type Values = Record<string, unknown>;

/** Refresh every public page after a content change. */
function refreshSite() {
  revalidatePath("/", "layout");
}

// -----------------------------------------------------------------------------
// Auth
// -----------------------------------------------------------------------------
export async function signIn(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return { error: "Supabase is not configured. Add the keys to .env.local first." };
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  // Rate limit FAILED attempts per IP and per email. The login runs on our
  // server, so Supabase only sees the server's IP - this is the per-visitor protection.
  const ip = getClientIp(await headers());
  const ipKey = ip ? `login:ip:${hashId(ip)}` : null;
  const emailKey = `login:email:${hashId(email || "-")}`;
  const peek = await Promise.all([
    ipKey ? rateLimit(ipKey, LIMITS.loginIp, { increment: false }) : null,
    rateLimit(emailKey, LIMITS.loginEmail, { increment: false }),
  ]);
  const blocked = peek.find((c) => c && !c.allowed);
  if (blocked) return { error: `Too many failed sign-in attempts. Please try again in ${waitText(blocked.retryAfter)}.` };

  const supabase = await createAuthClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    await Promise.all([ipKey ? rateLimit(ipKey, LIMITS.loginIp) : null, rateLimit(emailKey, LIMITS.loginEmail)]);
    return { error: "Incorrect email or password." };
  }
  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin");
}

export async function signOut() {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// -----------------------------------------------------------------------------
// Value coercion (form JSON -> database row)
// -----------------------------------------------------------------------------
function coerce(fields: FieldDef[], values: Values, isNew: boolean) {
  const row: Values = {};
  const fieldErrors: Record<string, string> = {};

  for (const f of fields) {
    if (f.readOnly && !isNew) continue;
    const v = values[f.name];
    let out: unknown;
    switch (f.type) {
      case "boolean":
        out = Boolean(v);
        break;
      case "number":
        out = v === "" || v === null || v === undefined ? null : Number(v);
        if (out !== null && Number.isNaN(out)) fieldErrors[f.name] = "Must be a number";
        break;
      case "list":
      case "multiselect":
        out = Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : [];
        break;
      case "faq":
        out = Array.isArray(v)
          ? (v as Values[]).map((x) => ({ question: String(x.question ?? "").trim(), answer: String(x.answer ?? "").trim() })).filter((x) => x.question)
          : [];
        break;
      case "schedule":
        out = Array.isArray(v)
          ? (v as Values[])
              .map((x) => ({ time: String(x.time ?? "").trim(), title: String(x.title ?? "").trim(), detail: String(x.detail ?? "").trim() }))
              .filter((x) => x.title)
          : [];
        break;
      case "datetime": {
        const s = typeof v === "string" ? v.trim() : "";
        out = s ? new Date(s).toISOString() : null;
        break;
      }
      default: {
        const s = typeof v === "string" ? v.trim() : v == null ? "" : String(v);
        out = s === "" ? null : s;
        if (f.type === "slug" && typeof out === "string" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(out)) {
          fieldErrors[f.name] = "Use lowercase letters, numbers and hyphens only";
        }
        if (f.options && out !== null && !f.options.some((o) => o.value === out)) fieldErrors[f.name] = "Invalid option";
      }
    }
    if (f.required && (out === null || out === "")) fieldErrors[f.name] = "Required";
    row[f.name] = out;
  }
  return { row, fieldErrors };
}

function friendlyError(message: string, code?: string) {
  if (code === "23505") return "Another entry already uses this URL slug (or unique value). Please change it.";
  if (code === "42501" || /row-level security/i.test(message)) return "You don't have permission to do this.";
  return message;
}

// -----------------------------------------------------------------------------
// Collections
// -----------------------------------------------------------------------------
export async function saveRecord(key: string, id: string | null, values: Values): Promise<SaveResult> {
  const col = getCollection(key);
  if (!col) return { ok: false, error: "Unknown collection" };
  const { supabase } = await requireAdmin();
  const idField = col.idField ?? "id";

  const { row, fieldErrors } = coerce(col.fields, values, !id);
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };

  if (col.publishable) {
    row.status = values.status === "published" ? "published" : "draft";
    row.publish_at = typeof values.publish_at === "string" && values.publish_at ? new Date(values.publish_at).toISOString() : new Date().toISOString();
  }

  if (!id && col.sortable) {
    const { data } = await supabase.from(col.table).select("sort_order").order("sort_order", { ascending: false }).limit(1);
    row.sort_order = ((data?.[0]?.sort_order as number | undefined) ?? 0) + 1;
  }

  const query = id
    ? supabase.from(col.table).update(row).eq(idField, id).select(idField).single()
    : supabase.from(col.table).insert(row).select(idField).single();
  const { data, error } = await query;
  if (error) return { ok: false, error: friendlyError(error.message, error.code) };

  refreshSite();
  return { ok: true, id: String((data as unknown as Values)[idField]) };
}

export async function deleteRecord(key: string, id: string): Promise<SaveResult> {
  const col = getCollection(key);
  if (!col?.canDelete) return { ok: false, error: "Not allowed" };
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from(col.table).delete().eq(col.idField ?? "id", id);
  if (error) return { ok: false, error: friendlyError(error.message, error.code) };
  refreshSite();
  revalidatePath(`/admin/${key}`);
  return { ok: true };
}

export async function moveRecord(key: string, id: string, direction: "up" | "down"): Promise<SaveResult> {
  const col = getCollection(key);
  if (!col?.sortable) return { ok: false, error: "Not sortable" };
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from(col.table).select("id, sort_order").order("sort_order").order("created_at");
  if (error || !data) return { ok: false, error: error?.message };

  const ids = data.map((r) => r.id as string);
  const i = ids.indexOf(id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return { ok: true };
  [ids[i], ids[j]] = [ids[j], ids[i]];

  // Renumber everything so the order stays clean
  const updates = ids
    .map((rowId, index) => ({ rowId, index, current: data.find((r) => r.id === rowId)?.sort_order }))
    .filter((u) => u.current !== u.index);
  for (const u of updates) {
    const { error: e } = await supabase.from(col.table).update({ sort_order: u.index }).eq("id", u.rowId);
    if (e) return { ok: false, error: e.message };
  }
  refreshSite();
  revalidatePath(`/admin/${key}`);
  return { ok: true };
}

// -----------------------------------------------------------------------------
// Settings & text blocks
// -----------------------------------------------------------------------------
export async function saveSettings(values: Values): Promise<SaveResult> {
  const { supabase } = await requireAdmin();
  const { row, fieldErrors } = coerce(SETTINGS_FIELDS, values, false);
  if (Object.keys(fieldErrors).length) return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  const { error } = await supabase.from("site_settings").upsert({ id: 1, ...row });
  if (error) return { ok: false, error: friendlyError(error.message, error.code) };
  refreshSite();
  return { ok: true };
}

export async function saveBlocks(
  page: string,
  blocks: { key: string; label: string; value: string; kind: string; sort_order: number }[],
): Promise<SaveResult> {
  const { supabase } = await requireAdmin();
  const rows = blocks.map((b) => ({ page, key: b.key, label: b.label, value: b.value ?? "", kind: b.kind, sort_order: b.sort_order }));
  const { error } = await supabase.from("content_blocks").upsert(rows, { onConflict: "page,key" });
  if (error) return { ok: false, error: friendlyError(error.message, error.code) };
  refreshSite();
  return { ok: true };
}

// -----------------------------------------------------------------------------
// Leads
// -----------------------------------------------------------------------------
export async function updateLead(id: string, status: string, notes: string): Promise<SaveResult> {
  if (!LEAD_STATUSES.some((s) => s.value === status)) return { ok: false, error: "Invalid status" };
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("leads").update({ status, notes: notes.trim() || null }).eq("id", id);
  if (error) return { ok: false, error: friendlyError(error.message, error.code) };
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { ok: true };
}

// -----------------------------------------------------------------------------
// Browser push notifications
// -----------------------------------------------------------------------------
export async function savePushSubscription(sub: { endpoint?: string; keys?: { p256dh?: string; auth?: string } }, userAgent: string): Promise<SaveResult> {
  if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) return { ok: false, error: "Invalid subscription" };
  const { supabase, user } = await requireAdmin();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      user_agent: userAgent.slice(0, 300),
    },
    { onConflict: "endpoint" },
  );
  if (error) return { ok: false, error: friendlyError(error.message, error.code) };
  return { ok: true };
}

export async function deletePushSubscription(endpoint: string): Promise<SaveResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  if (error) return { ok: false, error: friendlyError(error.message, error.code) };
  return { ok: true };
}

export async function sendTestPush(): Promise<SaveResult> {
  const { user } = await requireAdmin();
  if (!isPushConfigured) return { ok: false, error: "Push keys are missing in the environment variables (see README)." };
  const { sent } = await sendPushToAdmins(
    { title: "Notifications are working", body: "You'll be notified here when a new enquiry arrives.", url: "/admin/leads", tag: "test" },
    { userId: user.id },
  );
  return sent ? { ok: true } : { ok: false, error: "No device received it. Try turning notifications off and on again." };
}

export async function deleteLead(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("leads").delete().eq("id", id);
  revalidatePath("/admin/leads");
  redirect("/admin/leads");
}
