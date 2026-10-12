import webpush from "web-push";
import { getServiceClient } from "@/lib/supabase/clients";

// SERVER ONLY. Sends browser push notifications to every admin device that
// enabled them in /admin. Keys: `npx web-push generate-vapid-keys`.

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

export const isPushConfigured = Boolean(PUBLIC_KEY && PRIVATE_KEY);

let configured = false;
function setup() {
  if (!configured && PUBLIC_KEY && PRIVATE_KEY) {
    webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY);
    configured = true;
  }
}

export interface PushPayload {
  title: string;
  body: string;
  /** page to open when the notification is clicked */
  url: string;
  /** notifications with the same tag replace each other */
  tag?: string;
}

/** Sends to all admin devices (or one user's devices). Never throws. */
export async function sendPushToAdmins(payload: PushPayload, opts: { userId?: string } = {}) {
  if (!isPushConfigured) return { sent: 0, failed: 0 };
  const db = getServiceClient();
  if (!db) return { sent: 0, failed: 0 };
  setup();

  let query = db.from("push_subscriptions").select("id, endpoint, p256dh, auth");
  if (opts.userId) query = query.eq("user_id", opts.userId);
  const { data: subs, error } = await query;
  if (error || !subs?.length) {
    if (error) console.error("[push] load subscriptions:", error.message);
    return { sent: 0, failed: 0 };
  }

  const body = JSON.stringify(payload);
  let sent = 0;
  let failed = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body, { TTL: 60 * 60 * 24 });
        sent++;
        await db.from("push_subscriptions").update({ last_used_at: new Date().toISOString() }).eq("id", s.id);
      } catch (e) {
        failed++;
        const status = (e as { statusCode?: number }).statusCode;
        // 404 / 410: the browser unsubscribed or the device is gone - forget it.
        if (status === 404 || status === 410) await db.from("push_subscriptions").delete().eq("id", s.id);
        else console.error("[push] send failed:", status, (e as Error).message);
      }
    }),
  );
  return { sent, failed };
}
