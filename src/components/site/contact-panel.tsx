"use client";

import { useState } from "react";
import { LeadForm, type LeadFormProps } from "@/components/site/lead-form";
import { LEAD_TYPES } from "@/lib/options";
import { cn } from "@/lib/utils";

/**
 * Contact page body. The "I'd like to…" buttons and the form's "How can Anthony
 * help?" dropdown share one enquiry type, switched in the browser - no page
 * reload, and nothing the visitor typed is lost. Links from other pages still
 * preset it through /contact?type=… (read on the server, passed as initialType).
 */
export function ContactPanel({
  initialType,
  intro,
  notice,
  form,
}: {
  initialType: string;
  /** Left column content above the type buttons (rendered on the server). */
  intro: React.ReactNode;
  /** Optional note above the form, e.g. the event a meeting is requested for. */
  notice?: React.ReactNode;
  form: Omit<LeadFormProps, "type" | "onTypeChange" | "defaultType">;
}) {
  const [type, setType] = useState(initialType);
  // A link to /contact?type=… clicked while already on this page sends a new
  // initialType: follow it without resetting the form.
  const [prevInitial, setPrevInitial] = useState(initialType);
  if (initialType !== prevInitial) {
    setPrevInitial(initialType);
    setType(initialType);
  }

  return (
    <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
      <div>
        {intro}
        <div className="mt-12 border-t border-stone pt-8">
          <p id="contact-type-label" className="eyebrow mb-4">
            I&apos;d like to…
          </p>
          <ul role="group" aria-labelledby="contact-type-label" className="flex flex-wrap gap-2">
            {LEAD_TYPES.filter((t) => t.value !== "general").map((t) => (
              <li key={t.value}>
                <button
                  type="button"
                  aria-pressed={t.value === type}
                  onClick={() => setType(t.value)}
                  className={cn(
                    "inline-block border px-3 py-2 text-sm transition-colors",
                    t.value === type ? "border-ink bg-ink text-paper" : "border-stone bg-white hover:border-ink",
                  )}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border border-stone bg-white p-6 md:p-10">
        {notice}
        <LeadForm {...form} type={type} onTypeChange={setType} />
      </div>
    </div>
  );
}
