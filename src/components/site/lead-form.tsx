"use client";

import Script from "next/script";
import { startTransition, useActionState, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { submitLead, type LeadState } from "@/app/actions/lead";
import { LoadingOverlay } from "@/components/loading-overlay";
import { BUSINESS_TYPES, LEAD_TYPES } from "@/lib/options";
import { cn } from "@/lib/utils";

const TURNSTILE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

interface LeadFormProps {
  services: string[];
  defaultType?: string;
  defaultService?: string;
  eventId?: string;
  programId?: string;
  compact?: boolean;
  consentText: string;
  successTitle: string;
  successText: string;
  submitLabel?: string;
  dark?: boolean;
}

export function LeadForm({
  services,
  defaultType = "consultation",
  defaultService,
  eventId,
  programId,
  compact,
  consentText,
  successTitle,
  successText,
  submitLabel = "Send Enquiry",
  dark,
}: LeadFormProps) {
  const pathname = usePathname();
  const [state, action, pending] = useActionState<LeadState, FormData>(submitLead, { ok: false });
  const [started, setStarted] = useState(0);
  useEffect(() => setStarted(Date.now()), []);

  if (state.ok) {
    return (
      <div role="status" className={cn("flex flex-col items-start gap-4 border p-8", dark ? "border-paper/20" : "border-stone bg-white")}>
        <CheckCircle2 className="size-10 text-olive" aria-hidden />
        <p className="font-serif text-2xl">{successTitle}</p>
        <p className={dark ? "text-paper/70" : "text-muted"}>{successText}</p>
      </div>
    );
  }

  const err = (name: string) => state.errors?.[name];
  const labelCls = cn("field-label", dark && "!text-paper/80");

  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, span2 = false) => (
    <div className={cn(span2 && "sm:col-span-2")}>
      <label htmlFor={`lf-${name}`} className={labelCls}>
        {label}
        {props.required && <span aria-hidden className="text-olive"> *</span>}
      </label>
      <input
        id={`lf-${name}`}
        name={name}
        className="field"
        aria-invalid={Boolean(err(name)) || undefined}
        aria-describedby={err(name) ? `lf-${name}-err` : undefined}
        {...props}
      />
      {err(name) && (
        <p id={`lf-${name}-err`} className="mt-1 text-sm text-red-700">
          {err(name)}
        </p>
      )}
    </div>
  );

  return (
    <form
      // onSubmit (instead of `action`) keeps the visitor's input if validation fails
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="relative grid gap-5 sm:grid-cols-2"
      noValidate
    >
      <LoadingOverlay show={pending} label="Sending your enquiry…" />
      {TURNSTILE_KEY && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />}
      {/* Spam protection: honeypot + fill-time check. The field name and label are
          deliberately meaningless so browser autofill / password managers ignore it
          (a field called "website" got filled by autofill and flagged real people). */}
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>
          Leave this field empty
          <input type="text" name="hp_extra" tabIndex={-1} autoComplete="off" data-1p-ignore data-lpignore="true" data-bwignore="true" />
        </label>
      </div>
      <input type="hidden" name="started" value={started} />
      <input type="hidden" name="source_page" value={pathname} />
      {eventId && <input type="hidden" name="event_id" value={eventId} />}
      {programId && <input type="hidden" name="program_id" value={programId} />}

      {compact ? (
        <input type="hidden" name="lead_type" value={defaultType} />
      ) : (
        <div className="sm:col-span-2">
          <label htmlFor="lf-lead_type" className={labelCls}>
            How can Anthony help?
          </label>
          <select id="lf-lead_type" name="lead_type" defaultValue={defaultType} className="field">
            {LEAD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {field("name", "Name", { required: true, autoComplete: "name" })}
      {field("company", "Company / organization", { autoComplete: "organization" })}
      {!compact && field("job_title", "Job title (optional)", { autoComplete: "organization-title" })}
      {field("email", "Email", { required: true, type: "email", autoComplete: "email", inputMode: "email" })}
      {field("phone", "Phone / WhatsApp", { type: "tel", autoComplete: "tel", inputMode: "tel" })}
      {!compact && field("country", "Country", { autoComplete: "country-name" })}

      <div>
        <label htmlFor="lf-business_type" className={labelCls}>
          Type of business
        </label>
        <select id="lf-business_type" name="business_type" defaultValue="" className="field">
          <option value="">Select…</option>
          {BUSINESS_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {!compact && (
        <div>
          <label htmlFor="lf-service_interest" className={labelCls}>
            Service of interest
          </label>
          <select id="lf-service_interest" name="service_interest" defaultValue={defaultService ?? ""} className="field">
            <option value="">Select…</option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="Workshop / Masterclass">Workshop / Masterclass</option>
            <option value="Event appearance">Event appearance</option>
            <option value="Other">Other</option>
          </select>
        </div>
      )}

      <div className="sm:col-span-2">
        <label htmlFor="lf-message" className={labelCls}>
          {compact ? "Tell me about your project" : "Message / project brief"}
        </label>
        <textarea id="lf-message" name="message" rows={compact ? 3 : 6} className="field resize-y" />
      </div>

      <div className="sm:col-span-2">
        <label className={cn("flex items-start gap-3 text-sm leading-relaxed", dark ? "text-paper/75" : "text-ink-3")}>
          <input type="checkbox" name="consent" required className="mt-1 size-5 shrink-0 accent-olive-deep" />
          <span>{consentText}</span>
        </label>
        {err("consent") && <p className="mt-1 text-sm text-red-700">{err("consent")}</p>}
      </div>

      {TURNSTILE_KEY && <div className="cf-turnstile sm:col-span-2" data-sitekey={TURNSTILE_KEY} data-theme={dark ? "dark" : "light"} />}

      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={pending}
          className="group inline-flex min-h-13 items-center justify-center gap-2 bg-olive-deep px-8 text-sm font-medium tracking-wide text-white transition-colors hover:bg-ink disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {pending ? "Sending…" : submitLabel}
          {!pending && <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />}
        </button>
        {state.message && (
          <p role="alert" className="text-sm text-red-700">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
