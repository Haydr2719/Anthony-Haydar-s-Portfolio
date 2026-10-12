"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";

const KEY = "ah-cookie-consent";
const EVENT = "ah:cookie-settings";
type Choice = "accepted" | "declined";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const hasTrackers = Boolean(GA_ID || PIXEL_ID);

function readChoice(): Choice | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "accepted" || v === "declined" ? v : null;
  } catch {
    return null;
  }
}

/**
 * Cookie banner + analytics loader. Analytics / Meta Pixel scripts are only
 * injected after the visitor accepts. Nothing is shown if no trackers are configured.
 */
export function ConsentManager() {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const c = readChoice();
    setChoice(c);
    setOpen(hasTrackers && c === null);
    const reopen = () => setOpen(true);
    window.addEventListener(EVENT, reopen);
    return () => window.removeEventListener(EVENT, reopen);
  }, []);

  const decide = (c: Choice) => {
    try {
      localStorage.setItem(KEY, c);
    } catch {}
    const changedToDecline = choice === "accepted" && c === "declined";
    setChoice(c);
    setOpen(false);
    // Already-loaded trackers can't be unloaded; reload so they are gone.
    if (changedToDecline) window.location.reload();
  };

  return (
    <>
      {choice === "accepted" && GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {choice === "accepted" && PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
        </Script>
      )}

      {open && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Cookie preferences"
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl border border-stone bg-paper p-5 shadow-[0_20px_60px_-20px_rgba(31,31,29,0.5)] md:inset-x-auto md:left-6 md:bottom-6 animate-fade-up"
        >
          <p className="font-serif text-lg">Your privacy</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            We use essential cookies to run this site and, with your permission, analytics cookies to understand how it is used.{" "}
            <Link href="/cookies" className="underline underline-offset-4">
              Cookie policy
            </Link>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => decide("accepted")} className="min-h-11 bg-olive-deep px-5 text-sm font-medium text-white hover:bg-ink">
              Accept analytics
            </button>
            <button type="button" onClick={() => decide("declined")} className="min-h-11 border border-ink/70 px-5 text-sm font-medium hover:bg-ink hover:text-paper">
              Essential only
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function CookieSettingsButton() {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(EVENT))} className="hover:text-paper">
      Cookie settings
    </button>
  );
}
