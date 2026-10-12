"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";
import { deletePushSubscription, savePushSubscription, sendTestPush } from "@/app/admin/actions";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

type State = "loading" | "unsupported" | "ios-install" | "not-configured" | "denied" | "off" | "on";

function base64UrlToUint8Array(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function getRegistration() {
  return navigator.serviceWorker.register("/sw.js", { scope: "/admin/" });
}

/** "Enable notifications" control for new-enquiry push notifications on this device. */
export function PushToggle() {
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    (async () => {
      const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      if (!supported) {
        // iPhone/iPad only support web push once the site is added to the Home Screen.
        const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
        setState(isIos ? "ios-install" : "unsupported");
        return;
      }
      if (!PUBLIC_KEY) return setState("not-configured");
      if (Notification.permission === "denied") return setState("denied");
      const reg = await getRegistration();
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "on" : "off");
    })().catch(() => setState("unsupported"));
  }, []);

  const enable = () =>
    start(async () => {
      setMessage(null);
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        return;
      }
      try {
        const reg = await getRegistration();
        const sub =
          (await reg.pushManager.getSubscription()) ??
          (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlToUint8Array(PUBLIC_KEY!) }));
        const res = await savePushSubscription(sub.toJSON(), navigator.userAgent);
        if (!res.ok) throw new Error(res.error);
        setState("on");
        setMessage("Enabled on this device.");
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Could not enable notifications.");
      }
    });

  const disable = () =>
    start(async () => {
      setMessage(null);
      const reg = await getRegistration();
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await deletePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setState("off");
    });

  const test = () =>
    start(async () => {
      const res = await sendTestPush();
      setMessage(res.ok ? "Test sent - check your notifications." : (res.error ?? "Test failed."));
    });

  const btn = "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-paper/65 hover:bg-paper/5 hover:text-paper disabled:opacity-60";

  return (
    <div className="text-sm">
      {state === "loading" && (
        <p className="flex items-center gap-3 px-3 py-2 text-paper/40">
          <Loader2 className="size-4 animate-spin" /> Notifications
        </p>
      )}
      {state === "off" && (
        <button type="button" onClick={enable} disabled={pending} className={btn}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Bell className="size-4" />} Enable notifications
        </button>
      )}
      {state === "on" && (
        <>
          <p className="flex items-center gap-3 px-3 py-2 text-paper">
            <BellRing className="size-4 text-olive" /> Notifications on
          </p>
          <div className="flex gap-3 px-3 pb-1 text-xs">
            <button type="button" onClick={test} disabled={pending} className="text-paper/60 underline-offset-2 hover:text-paper hover:underline">
              Send test
            </button>
            <button type="button" onClick={disable} disabled={pending} className="text-paper/60 underline-offset-2 hover:text-paper hover:underline">
              Turn off
            </button>
          </div>
        </>
      )}
      {state === "denied" && (
        <p className="flex gap-3 px-3 py-2 text-xs leading-relaxed text-paper/50">
          <BellOff className="mt-0.5 size-4 shrink-0" /> Notifications are blocked. Allow them in your browser&apos;s site settings, then reload.
        </p>
      )}
      {state === "ios-install" && (
        <p className="flex gap-3 px-3 py-2 text-xs leading-relaxed text-paper/50">
          <Bell className="mt-0.5 size-4 shrink-0" /> To get notifications on iPhone: Share → &quot;Add to Home Screen&quot;, then open the admin from that icon.
        </p>
      )}
      {state === "unsupported" && (
        <p className="flex gap-3 px-3 py-2 text-xs text-paper/50">
          <BellOff className="mt-0.5 size-4 shrink-0" /> This browser doesn&apos;t support notifications.
        </p>
      )}
      {state === "not-configured" && (
        <p className="flex gap-3 px-3 py-2 text-xs leading-relaxed text-paper/50">
          <BellOff className="mt-0.5 size-4 shrink-0" /> Notifications need the VAPID keys in the environment (see README).
        </p>
      )}
      {message && <p className="px-3 pb-1 text-xs text-paper/60">{message}</p>}
    </div>
  );
}
