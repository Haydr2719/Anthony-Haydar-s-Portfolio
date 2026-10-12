"use client";

import { useEffect } from "react";
import { Mail, RotateCw } from "lucide-react";
import { WhatsappIcon } from "@/components/brand-icons";
import { Logo } from "@/components/logo";
import { whatsappLink } from "@/lib/utils";

// Contact details come from env vars, not the database - this page must work
// when the database is the thing that is down.
const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
const WHATSAPP = whatsappLink(process.env.NEXT_PUBLIC_CONTACT_WHATSAPP, "Hello Anthony, I tried to reach you through your website.");

/** Branded "temporarily unavailable" screen used by the error boundaries. */
export function Unavailable({ error, retry, showLogo }: { error: Error & { digest?: string }; retry: () => void; showLogo?: boolean }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[70svh] items-center bg-paper py-24">
      <div className="container-x max-w-2xl text-center">
        {showLogo && (
          <div className="mb-12 flex justify-center">
            <Logo stacked className="w-48" />
          </div>
        )}
        <p className="eyebrow">Temporarily unavailable</p>
        <h1 className="mt-4 text-4xl leading-tight md:text-5xl">This page couldn&apos;t load right now.</h1>
        <p className="mx-auto mt-5 max-w-lg text-muted">
          Please try again in a moment. If you&apos;d like to get in touch in the meantime, Anthony is one message away.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-olive-deep px-6 text-sm font-medium text-white transition-colors hover:bg-ink"
          >
            <RotateCw className="size-4" aria-hidden /> Try again
          </button>
          {EMAIL && (
            <a href={`mailto:${EMAIL}`} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-ink/80 px-6 text-sm font-medium hover:bg-ink hover:text-paper">
              <Mail className="size-4" aria-hidden /> Email Anthony
            </a>
          )}
          {WHATSAPP && (
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-ink/80 px-6 text-sm font-medium hover:bg-ink hover:text-paper"
            >
              <WhatsappIcon className="size-4" /> WhatsApp
            </a>
          )}
        </div>
        {error.digest && <p className="mt-10 text-xs text-muted">Reference: {error.digest}</p>}
      </div>
    </section>
  );
}
