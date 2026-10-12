"use client";

import { Children, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Client-side category filter over server-rendered children.
 * `itemCategories[i]` is the category of the i-th child.
 */
export function Filterable({
  options,
  itemCategories,
  children,
  className,
  allLabel = "All",
}: {
  options: { value: string; label: string }[];
  itemCategories: string[];
  children: React.ReactNode;
  className?: string;
  allLabel?: string;
}) {
  const [active, setActive] = useState<string>("all");
  const items = Children.toArray(children);
  const used = options.filter((o) => itemCategories.includes(o.value));

  return (
    <>
      {used.length > 1 && (
        <div role="group" aria-label="Filter by category" className="-mx-1 mb-10 flex gap-2 overflow-x-auto px-1 pb-2">
          {[{ value: "all", label: allLabel }, ...used].map((o) => (
            <button
              key={o.value}
              type="button"
              aria-pressed={active === o.value}
              onClick={() => setActive(o.value)}
              className={cn(
                "min-h-10 shrink-0 border px-4 text-xs font-medium uppercase tracking-[0.14em] transition-colors",
                active === o.value ? "border-ink bg-ink text-paper" : "border-stone bg-white text-ink-3 hover:border-ink",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
      <div className={className}>
        {items.map((child, i) => (active === "all" || itemCategories[i] === active ? child : null))}
      </div>
    </>
  );
}
