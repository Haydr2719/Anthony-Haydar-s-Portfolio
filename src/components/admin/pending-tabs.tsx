"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PendingTab {
  value: string;
  label: string;
  href: string;
}

/**
 * Tabs / filters that only change the query string of the current admin page
 * (e.g. ?status=new, ?page=about). Next.js keeps the old page on screen until
 * the new one is loaded (loading.tsx doesn't show for the same page), so the
 * click is acknowledged here instead: the chosen tab highlights at once with a
 * spinner, and the content below fades with a loading badge.
 */
export function PendingTabs({
  current,
  tabs,
  loadingLabel = "Loading…",
  className,
  tabClassName,
  children,
}: {
  current: string;
  tabs: readonly PendingTab[];
  loadingLabel?: string;
  className?: string;
  tabClassName?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [target, setTarget] = useState<string | null>(null);
  const active = isPending && target !== null ? target : current;

  return (
    <>
      <div className={cn("flex gap-2", className)}>
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={t.href}
            aria-current={active === t.value ? "page" : undefined}
            onClick={(e) => {
              // Let ctrl/cmd/shift-click open a new tab as usual.
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              e.preventDefault();
              if (t.value === active) return;
              setTarget(t.value);
              startTransition(() => router.push(t.href));
            }}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 text-sm",
              tabClassName,
              active === t.value ? "border-ink bg-ink text-paper" : "border-stone bg-white hover:border-ink",
            )}
          >
            {t.label}
            {isPending && target === t.value && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
          </Link>
        ))}
      </div>

      <div aria-busy={isPending} className="relative">
        {isPending && (
          <div role="status" className="absolute inset-x-0 top-8 z-10 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm text-paper shadow-lg">
              <Loader2 className="size-4 animate-spin" aria-hidden /> {loadingLabel}
            </span>
          </div>
        )}
        <div className={cn("transition-opacity duration-150", isPending && "pointer-events-none opacity-40")}>{children}</div>
      </div>
    </>
  );
}
