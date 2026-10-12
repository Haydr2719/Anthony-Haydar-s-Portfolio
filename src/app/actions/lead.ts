"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { sendPushToAdmins } from "@/lib/push";
import { LIMITS, getClientIp, hashId, rateLimit, waitText } from "@/lib/rate-limit";
import { getServiceClient } from "@/lib/supabase/clients";
import { BUSINESS_TYPES, LEAD_TYPES, labelOf } from "@/lib/options";

export interface LeadState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || null);

const schema = z.object({
  lead_type: z.enum(LEAD_TYPES.map((t) => t.value) as [string, ...string[]]).default("consultation"),
  name: z.string().trim().min(2, "Please enter your name").max(120),
  company: optional(160),
  job_title: optional(120),
  email: z.string().trim().email("Please enter a valid email").max(200),
  phone: optional(40),
  country: optional(80),
  business_type: z
    .enum(BUSINESS_TYPES.map((t) => t.value) as [string, ...string[]])
    .optional()
    .or(z.literal("").transform(() => undefined)),
  service_interest: optional(160),
  message: optional(5000),
  source_page: optional(300),
  event_id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  program_id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  consent: z.literal("on", { message: "Please confirm you agree to be contacted" }),
});

// Bots submit instantly; people (even with autofill) take longer than this.
const MIN_FILL_MS = 1500;

export async function submitLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  // 1. Spam signals: hidden honeypot field filled, or submitted too fast.
  //    These are NOT dropped - a real visitor's autofill or password manager can
  //    trigger them. Suspicious enquiries are saved as Archived + "Possible spam"
  //    with no notifications, so nothing genuine is ever lost.
  const started = Number(formData.get("started"));
  const elapsed = started ? Date.now() - started : 0;
  const spamReason = formData.get("hp_extra")
    ? "the hidden anti-spam field was filled"
    : !started || elapsed < MIN_FILL_MS
      ? `the form was sent ${started ? `${(elapsed / 1000).toFixed(1)}s` : "immediately"} after the page loaded`
      : null;

  // 2. Validate
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    if (spamReason) {
      // Invalid AND suspicious: almost certainly a bot. Pretend success, but log it.
      console.warn(`[lead] rejected likely bot (${spamReason}; invalid fields)`);
      return { ok: true };
    }
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { ok: false, message: "Please check the highlighted fields.", errors };
  }
  const data = parsed.data;

  const h = await headers();
  const ip = getClientIp(h);
  const ipHash = ip ? hashId(ip) : null; // raw IPs are never stored

  // 3. Rate limit: every valid submission attempt counts (saved or not),
  //    per IP and per email address. Atomic, so parallel requests can't slip through.
  const checks = await Promise.all([
    ipHash ? rateLimit(`enquiry:ip:${ipHash}`, LIMITS.enquiryIp) : null,
    rateLimit(`enquiry:email:${hashId(data.email)}`, LIMITS.enquiryEmail),
  ]);
  const blocked = checks.find((c) => c && !c.allowed);
  if (blocked) {
    return { ok: false, message: `Too many enquiries in a short time. Please try again in ${waitText(blocked.retryAfter)}.` };
  }

  // 4. Optional Cloudflare Turnstile
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const token = String(formData.get("cf-turnstile-response") ?? "");
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: turnstileSecret, response: token, ...(ip ? { remoteip: ip } : {}) }),
    }).then((r) => r.json() as Promise<{ success: boolean }>).catch(() => ({ success: false }));
    if (!res.success) return { ok: false, message: "Spam check failed - please try again." };
  }

  const db = getServiceClient();
  if (!db) {
    console.warn("[lead] Supabase is not configured - enquiry not stored:", data);
    return {
      ok: false,
      message: "The enquiry form is not connected yet. Please contact Anthony directly by email.",
    };
  }

  // 5. Store
  const { consent, ...fields } = data;
  const { data: saved, error } = await db.from("leads").insert({
    ...fields,
    business_type: fields.business_type ?? null,
    event_id: fields.event_id ?? null,
    program_id: fields.program_id ?? null,
    consent: consent === "on",
    consent_at: new Date().toISOString(),
    ip_hash: ipHash,
    user_agent: h.get("user-agent")?.slice(0, 300) ?? null,
    ...(spamReason ? { status: "archived", notes: `Possible spam: ${spamReason}. Check it - it may be a real enquiry.` } : {}),
  }).select("id").single();
  if (error) {
    console.error("[lead] insert failed:", error.message);
    return { ok: false, message: "Something went wrong sending your enquiry. Please try again or email directly." };
  }

  if (spamReason) {
    console.warn(`[lead] saved as possible spam (${spamReason}): ${saved.id}`);
    return { ok: true }; // no notifications for suspected spam
  }

  // 6. Notify Anthony - email + browser push (optional, never blocks the visitor)
  await Promise.all([
    notify(data).catch((e) => console.error("[lead] email failed:", e)),
    sendPushToAdmins({
      title: `New enquiry: ${labelOf(LEAD_TYPES, data.lead_type)}`,
      body: [data.name, data.company].filter(Boolean).join(" · "),
      url: `/admin/leads/${saved.id}`,
      tag: `lead-${saved.id}`,
    }),
  ]);

  return { ok: true };
}

async function notify(d: z.infer<typeof schema>) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAIL;
  if (!key || !to) return;
  const rows: [string, string | null | undefined][] = [
    ["Type", labelOf(LEAD_TYPES, d.lead_type)],
    ["Name", d.name],
    ["Company", d.company],
    ["Job title", d.job_title],
    ["Email", d.email],
    ["Phone / WhatsApp", d.phone],
    ["Country", d.country],
    ["Business type", labelOf(BUSINESS_TYPES, d.business_type)],
    ["Service of interest", d.service_interest],
    ["Page", d.source_page],
    ["Message", d.message],
  ];
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  const html = `<h2>New website enquiry</h2><table cellpadding="6">${rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td><b>${k}</b></td><td>${esc(String(v)).replace(/\n/g, "<br>")}</td></tr>`)
    .join("")}</table>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.LEAD_FROM_EMAIL || "Website <onboarding@resend.dev>",
      to: to.split(",").map((s) => s.trim()),
      reply_to: d.email,
      subject: `New enquiry: ${labelOf(LEAD_TYPES, d.lead_type)} - ${d.name}`,
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}
