"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Fewer slides than this: no loop (the cards nearly fit, duplicates would show side by side). */
const LOOP_MIN_ITEMS = 4;

/**
 * Horizontal sliding row (native scroll + snap). Swipe on touch screens,
 * arrow buttons / trackpad / keyboard on desktop. Server-rendered children.
 *
 * Default widths always show full cards plus part of the next one, so it's
 * obvious the row slides: phone 1 + part, tablet 2 + part, desktop 3 + part.
 * Override with `itemClassName` if needed.
 *
 * `loop`: endless row. The slides are rendered three times and the row starts on
 * the middle copy; whenever scrolling settles in an outer copy it jumps (invisibly,
 * the copies are identical) to the same slide in the middle copy - so it never
 * reaches an end. The outer copies are hidden from keyboard and screen readers.
 */
export function Scroller({
  children,
  label,
  itemClassName = "w-[68%] sm:w-[42%] lg:w-[29%]",
  className,
  loop = false,
}: {
  children: React.ReactNode;
  label: string;
  itemClassName?: string;
  className?: string;
  loop?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const items = Children.toArray(children);
  const looping = loop && items.length >= LOOP_MIN_ITEMS;
  const copies = looping ? 3 : 1;

  /** Distance between the same slide in two neighbouring copies (one full set incl. gaps). */
  const setWidth = useCallback(() => {
    const el = trackRef.current;
    const kids = el?.children;
    if (!el || !kids || kids.length < items.length * 2) return 0;
    return (kids[items.length] as HTMLElement).offsetLeft - (kids[0] as HTMLElement).offsetLeft;
  }, [items.length]);

  // Keep the position inside the middle copy, with at least half a set of room either way.
  const recenter = useCallback(() => {
    const el = trackRef.current;
    const set = setWidth();
    if (!el || !looping || !set) return;
    if (el.scrollLeft < set * 0.5) el.scrollTo({ left: el.scrollLeft + set, behavior: "instant" });
    else if (el.scrollLeft > set * 1.5) el.scrollTo({ left: el.scrollLeft - set, behavior: "instant" });
  }, [looping, setWidth]);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(!looping && el.scrollLeft <= 4);
    setAtEnd(!looping && el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, [looping]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    // Loop: start on the first slide of the middle copy (looks identical to the start).
    if (looping) el.scrollTo({ left: setWidth(), behavior: "instant" });
    update();

    // Recenter once scrolling has settled (incl. touch momentum): "scrollend" where
    // supported, plus a short idle timer for browsers without it.
    let idle: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      update();
      if (!looping) return;
      clearTimeout(idle);
      idle = setTimeout(recenter, 150);
    };
    const onResize = () => {
      update();
      recenter();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("scrollend", recenter);
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(idle);
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scrollend", recenter);
      window.removeEventListener("resize", onResize);
    };
  }, [looping, recenter, setWidth, update]);

  // Move by one card (the width of the first slide plus the gap).
  const step = (dir: 1 | -1) => {
    const el = trackRef.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: dir * (first.offsetWidth + gap), behavior: "smooth" });
  };

  const scrollable = looping || !(atStart && atEnd);

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
        {Array.from({ length: copies }, (_, copy) =>
          items.map((child, i) => {
            // In loop mode only the middle copy is "real"; the others are visual duplicates.
            const duplicate = looping && copy !== 1;
            return (
              <div
                key={`${copy}-${i}`}
                role={duplicate ? undefined : "group"}
                aria-roledescription={duplicate ? undefined : "slide"}
                aria-label={duplicate ? undefined : `${i + 1} of ${items.length}`}
                aria-hidden={duplicate || undefined}
                inert={duplicate || undefined}
                className={cn("shrink-0 snap-start", itemClassName)}
              >
                {child}
              </div>
            );
          }),
        )}
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
