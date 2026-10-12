"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Horizontal sliding row (native scroll + snap). Swipe on touch screens,
 * arrow buttons / trackpad / keyboard on desktop. Server-rendered children.
 *
 * Default widths always show full cards plus part of the next one, so it's
 * obvious the row slides: phone 1 + part, tablet 2 + part, desktop 3 + part.
 * Override with `itemClassName` if needed.
 */
export function Scroller({
  children,
  label,
  itemClassName = "w-[68%] sm:w-[42%] lg:w-[29%]",
  className,
}: {
  children: React.ReactNode;
  label: string;
  itemClassName?: string;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const items = Children.toArray(children);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  // Move by one card (the width of the first slide plus the gap).
  const step = (dir: 1 | -1) => {
    const el = trackRef.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: dir * (first.offsetWidth + gap), behavior: "smooth" });
  };

  const scrollable = !(atStart && atEnd);

  return (
    <div className={cn("relative", className)}>
      {/* Arrows sit on the slider's edges (desktop) so they add no extra height */}
      {scrollable && (
        <>
          <ArrowButton dir={-1} disabled={atStart} onClick={() => step(-1)} className="left-0 md:-left-4" />
          <ArrowButton dir={1} disabled={atEnd} onClick={() => step(1)} className="right-0 md:-right-4" />
        </>
      )}
      <div
        ref={trackRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            step(1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            step(-1);
          }
        }}
        className="-mx-5 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-5 px-5 pb-4 [scrollbar-width:none] md:-mx-10 md:scroll-px-10 md:px-10 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((child, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${items.length}`}
            className={cn("shrink-0 snap-start", itemClassName)}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

function ArrowButton({ dir, disabled, onClick, className }: { dir: 1 | -1; disabled: boolean; onClick: () => void; className?: string }) {
  const Icon = dir === 1 ? ChevronRight : ChevronLeft;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 1 ? "Next" : "Previous"}
      className={cn(
        // vertically centred on the card images (4:3 images take the top ~70% of a card)
        "absolute top-[34%] z-10 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-ink/10 bg-paper/95 text-ink shadow-[0_10px_30px_-12px_rgba(31,31,29,0.5)] transition-all hover:bg-ink hover:text-paper md:flex",
        "disabled:pointer-events-none disabled:opacity-0",
        className,
      )}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  );
}
