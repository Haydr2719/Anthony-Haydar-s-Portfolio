"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type Status = "connecting" | "live" | "reconnecting" | "offline";

/**
 * Keeps the admin up to date with enquiries in real time (Supabase Realtime
 * "Postgres Changes" on the leads table - RLS means only admins get events).
 *
 *  - Any insert / update / delete -> re-read the current page from the server
 *    (inbox list, sidebar "New" badge and dashboard all update together).
 *  - Catch-up refresh after any gap: tab visible again, internet back, or the
 *    live connection re-established - so nothing missed while offline is lost.
 */
export function LiveLeads() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("connecting");
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    let channel: RealtimeChannel | null = null;
    let disposed = false;
    let hasBeenLive = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    // Several events can arrive together - refresh once.
    const refresh = () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => router.refresh(), 300);
    };

    const connect = async () => {
      if (disposed) return;
      if (channel) {
        const old = channel;
        channel = null; // its late "CLOSED" callback is ignored below
        await supabase.removeChannel(old);
      }
      await supabase.realtime.setAuth(); // use the signed-in admin's session (auto-refreshed)
      if (disposed) return; // unmounted while awaiting

      // Unique name per connection: supabase.channel() returns an EXISTING channel
      // with the same name, which may still be subscribed (React dev mounts effects
      // twice; reconnects overlap with removal) - adding listeners to it throws.
      const current = supabase
        .channel(`admin-leads-${crypto.randomUUID()}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, refresh);
      channel = current;

      current.subscribe((state) => {
        // Ignore events from a channel we've already replaced or removed.
        if (disposed || channel !== current) return;
        if (state === "SUBSCRIBED") {
          setStatus("live");
          // Reconnected after a drop: fetch anything that arrived meanwhile.
          if (hasBeenLive) refresh();
          hasBeenLive = true;
        } else if (state === "CHANNEL_ERROR" || state === "TIMED_OUT") {
          // The client retries these automatically.
          setStatus(navigator.onLine ? "reconnecting" : "offline");
        } else if (state === "CLOSED") {
          // Closed for good (e.g. session expired) - start a fresh channel.
          setStatus(navigator.onLine ? "reconnecting" : "offline");
          if (retryTimer) clearTimeout(retryTimer);
          retryTimer = setTimeout(reconnect, 3000);
        }
      });
    };

    // Run connects one after another (never two at once) and never let an
    // error escape as an unhandled crash - retry instead.
    let queue = Promise.resolve();
    const reconnect = () => {
      queue = queue.then(connect).catch((e) => {
        console.error("[live-leads]", e);
        if (disposed) return;
        setStatus(navigator.onLine ? "reconnecting" : "offline");
        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = setTimeout(reconnect, 5000);
      });
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const onOnline = () => {
      setStatus("reconnecting");
      refresh();
      reconnect();
    };
    const onOffline = () => setStatus("offline");

    reconnect();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      disposed = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      if (channel) {
        const old = channel;
        channel = null;
        supabase.removeChannel(old).catch(() => {});
      }
    };
  }, [router]);

  const label = { connecting: "Connecting…", live: "Live", reconnecting: "Reconnecting…", offline: "Offline" }[status];
  return (
    <p className="flex items-center gap-2 px-3 py-1 text-xs text-paper/50" role="status" aria-live="polite" title="Enquiries update automatically">
      <span
        aria-hidden
        className={cn(
          "size-2 rounded-full",
          status === "live" && "bg-emerald-400",
          (status === "connecting" || status === "reconnecting") && "animate-pulse bg-amber-400",
          status === "offline" && "bg-red-400",
        )}
      />
      Enquiries: {label}
    </p>
  );
}
