"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { MediaFrame } from "@/components/media";
import { Button, Eyebrow } from "@/components/ui";
import type { EventItem } from "@/lib/types";
import { cn, formatDateRange } from "@/lib/utils";

const AUTOPLAY_MS = 7000;

/**
 * Homepage slideshow of upcoming events (one dark banner per event), with an
 * "Also coming up" button to the full Events page.
 *
 * - Auto-advances every 7s; pauses on hover / keyboard focus / hidden tab,
 *   and never auto-advances for visitors who prefer reduced motion.
 * - Arrows, dots and swipe on touch screens. A single event shows no controls.
 */
export function EventSlider({ events, eyebrow, allHref }: { events: EventItem[]; eyebrow: string; allHref: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = events.length;
  const multiple = count > 1;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Autoplay
  useEffect(() => {
    if (!multiple || paused || reducedMotion) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") setIndex((i) => (i + 1) % count);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [multiple, paused, reducedMotion, count]);

  const autoplaying = multiple && !paused && !reducedMotion;

  return (
    <section
      className="on-dark relative overflow-hidden bg-ink text-paper"
      aria-roledescription="carousel"
      aria-label="Upcoming events"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null || !multiple) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      {/* Slides are stacked in one grid cell and cross-fade */}
      <div className="grid" aria-live={autoplaying ? "off" : "polite"}>
        {events.map((event, i) => {
          const active = i === index;
          return (
            <div
              key={event.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}: ${event.title}`}
              aria-hidden={!active}
              inert={!active}
              className={cn(
                "relative [grid-area:1/1] transition-opacity duration-700 ease-out",
                active ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <MediaFrame src={event.cover_image} alt="" ratio="fill" className="!absolute inset-0 opacity-35" sizes="100vw" />
              <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
              <div className="container-x relative flex flex-col gap-8 pb-10 pt-16 md:flex-row md:items-center md:justify-between md:pt-20">
                <div className="max-w-2xl">
                  <Eyebrow className="mb-4">{eyebrow}</Eyebrow>
                  <h2 className="text-4xl leading-[1.05] md:text-5xl">{event.title}</h2>
                  {event.summary && <p className="mt-4 text-paper/70 md:text-lg">{event.summary}</p>}
                  <p className="mt-4 text-sm text-paper/60">
                    {formatDateRange(event.start_at, event.end_at)}
                    {event.city ? ` · ${event.city}` : ""}
                    {event.booth ? ` · ${event.booth}` : ""}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button href={`/training-events/events/${event.slug}#book`}>{event.meeting_cta_label || "Book a Meeting"}</Button>
                  <Button href={`/training-events/events/${event.slug}`} variant="outline-light" arrow={false}>
                    Learn more
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls + "Also coming up" */}
      <div className="container-x relative flex flex-col gap-5 border-t border-paper/10 py-6 sm:flex-row sm:items-center sm:justify-between">
        {multiple ? (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous event"
              className="flex size-10 items-center justify-center rounded-full border border-paper/30 transition-colors hover:border-paper hover:bg-paper hover:text-ink"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <ol className="flex items-center gap-2" aria-label="Choose an event">
              {events.map((event, i) => (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Show event ${i + 1}: ${event.title}`}
                    aria-current={i === index ? "true" : undefined}
                    className="flex h-6 items-center"
                  >
                    <span className={cn("block h-1.5 rounded-full transition-all duration-300", i === index ? "w-8 bg-paper" : "w-3 bg-paper/35 hover:bg-paper/60")} />
                  </button>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next event"
              className="flex size-10 items-center justify-center rounded-full border border-paper/30 transition-colors hover:border-paper hover:bg-paper hover:text-ink"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
            <span className="text-xs tabular-nums text-paper/50">
              {index + 1} / {count}
            </span>
          </div>
        ) : (
          <span />
        )}
        <Link
          href={allHref}
          className="group inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full border border-paper/40 px-5 text-sm font-medium transition-colors hover:bg-paper hover:text-ink sm:self-auto"
        >
          Also coming up
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
