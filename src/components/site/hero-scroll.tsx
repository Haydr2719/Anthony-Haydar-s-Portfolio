"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Settings - tweak these to change the feel of the hero.
// -----------------------------------------------------------------------------
/** Number of frames in each folder (frame_0001.webp ... frame_0150.webp). */
export const FRAME_COUNT = 150;
/** How far the user scrolls while the hero is pinned. Shorter = quicker hero. */
export const SCROLL_DISTANCE = "150vh";
/** Scroll smoothing in seconds (0 = locked to the scrollbar, higher = floatier). */
export const SCRUB = 0.3;
/** Below this width the mobile frames and the full-screen layout are used. */
export const MOBILE_BREAKPOINT = 768;
/** Frame folders inside /public. */
export const DESKTOP_FRAMES_DIR = "/frames";
export const MOBILE_FRAMES_DIR = "/frames-mobile";
/** Phrases shown one after another while scrolling (the last one stays). */
export const DEFAULT_PHRASES = [
  "Crafted with precision",
  "Every pour tells a story",
  "The art of alchemy",
  "Let's create something unforgettable",
];
/** Share of each phrase's scroll slice spent animating in / out (the rest is "hold"). */
const PHRASE_IN = 0.2;
const PHRASE_OUT = 0.2;
/** The CTA fades in over the last part of the scroll. */
const CTA_START = 0.9;

/**
 * Converts the scroll distance to pixels. ScrollTrigger's "+=" end only understands
 * px and % - "150vh" would silently be read as 150px. Supports vh, %, px or a number.
 */
const distanceToPx = (distance: string) => {
  const value = parseFloat(distance);
  if (Number.isNaN(value)) return window.innerHeight * 1.5;
  if (distance.endsWith("vh") || distance.endsWith("%")) return (window.innerHeight * value) / 100;
  return value; // px
};

/** Builds "/frames/frame_0001.webp" style paths (1-based, zero-padded to 4 digits). */
export const framePath = (dir: string, index: number) => `${dir}/frame_${String(index).padStart(4, "0")}.webp`;

interface Cta {
  href: string;
  label: string;
}

export interface HeroScrollProps {
  eyebrow: string;
  title: string;
  text?: string;
  primaryCta: Cta;
  secondaryCta?: Cta;
  phrases?: string[];
  frameCount?: number;
  desktopFramesDir?: string;
  mobileFramesDir?: string;
  scrollDistance?: string;
  scrub?: number;
  /**
   * How frames fit the canvas. Default: "cover" on phones (fills the whole
   * screen, edges may be cropped slightly), "contain" on desktop (whole frame).
   */
  objectFit?: "cover" | "contain";
}

/**
 * Pinned, scroll-driven hero: an image sequence drawn on a <canvas> (scrubbed
 * by scroll) plus phrases that animate in and out, then the CTA.
 * With prefers-reduced-motion: no pinning, one static frame, all text visible.
 */
export function HeroScroll({
  eyebrow,
  title,
  text,
  primaryCta,
  secondaryCta,
  phrases = DEFAULT_PHRASES,
  frameCount = FRAME_COUNT,
  desktopFramesDir = DESKTOP_FRAMES_DIR,
  mobileFramesDir = MOBILE_FRAMES_DIR,
  scrollDistance = SCROLL_DISTANCE,
  scrub = SCRUB,
  objectFit,
}: HeroScrollProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [firstFrameReady, setFirstFrameReady] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctx2d = canvas?.getContext("2d");
    if (!section || !canvas || !ctx2d) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const dir = isMobile ? mobileFramesDir : desktopFramesDir;
    const fit = objectFit ?? (isMobile ? "cover" : "contain");

    // ---------------------------------------------------------------------
    // Hero height = visible screen minus the sticky header, measured in JS.
    // (CSS svh is unreliable on iOS Safari.) Measured at load, when Safari's
    // toolbars are expanded, so the whole hero fits even with them showing.
    // Only re-measured when the WIDTH changes (rotation / desktop resize) -
    // not when the iOS address bar collapses, which would make the pin jump.
    // ---------------------------------------------------------------------
    const headerHeight = () => document.querySelector("header")?.getBoundingClientRect().height ?? 0;
    const setHeroHeight = () => {
      section.style.setProperty("--hero-h", `${Math.round(window.innerHeight - headerHeight())}px`);
    };
    setHeroHeight();
    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === lastWidth) return; // height-only change (mobile toolbars)
      lastWidth = window.innerWidth;
      setHeroHeight();
      if (!reducedMotion) ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    // ---------------------------------------------------------------------
    // Canvas drawing: "cover" fills the canvas (phones), "contain" shows the
    // whole frame (desktop). Never distorted.
    // ---------------------------------------------------------------------
    const images: HTMLImageElement[] = new Array(frameCount);
    const loaded: boolean[] = new Array(frameCount).fill(false);
    let currentFrame = 0; // frame index we want on screen
    let drawnFrame = -1; // frame index actually on the canvas
    let rafId = 0;
    let disposed = false;

    const sizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2x for performance
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        drawnFrame = -1; // resizing clears the canvas - force a redraw
      }
    };

    // Nearest frame that has finished loading (so scrolling never shows a blank).
    const nearestLoaded = (index: number) => {
      for (let d = 0; d < frameCount; d++) {
        if (loaded[index - d]) return index - d;
        if (loaded[index + d]) return index + d;
      }
      return -1;
    };

    const draw = () => {
      rafId = 0;
      const index = nearestLoaded(currentFrame);
      if (index < 0 || index === drawnFrame) return; // only redraw when the frame changes
      const img = images[index];
      const { width: cw, height: ch } = canvas;
      const fitScale = fit === "cover" ? Math.max : Math.min;
      const scale = fitScale(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx2d.fillStyle = "#1f1f1d"; // letterbox colour (only visible if aspect ratios differ)
      ctx2d.fillRect(0, 0, cw, ch);
      ctx2d.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      drawnFrame = index;
    };

    const requestDraw = () => {
      if (!rafId && !disposed) rafId = requestAnimationFrame(draw);
    };

    sizeCanvas();
    const resizeObserver = new ResizeObserver(() => {
      sizeCanvas();
      requestDraw();
    });
    resizeObserver.observe(canvas);

    // ---------------------------------------------------------------------
    // Preloading: frame 1 first (drawn immediately), then the rest in the
    // background. Never blocks the page render.
    // ---------------------------------------------------------------------
    const loadFrame = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          if (disposed) return resolve();
          loaded[i] = true;
          requestDraw(); // draw() skips the work unless a closer frame became available
          resolve();
        };
        img.onerror = () => resolve(); // a missing frame is skipped, not fatal
        img.src = framePath(dir, i + 1);
        images[i] = img;
      });

    loadFrame(0).then(() => {
      if (disposed) return;
      setFirstFrameReady(true);
      if (reducedMotion) return; // one static frame is enough
      for (let i = 1; i < frameCount; i++) loadFrame(i);
    });

    // ---------------------------------------------------------------------
    // Reduced motion: no pinning, no scrubbing - text is shown by CSS.
    // ---------------------------------------------------------------------
    let gsapCtx: gsap.Context | undefined;
    if (!reducedMotion) {
      gsap.registerPlugin(ScrollTrigger);
      // Don't re-measure everything when the mobile address bar shows/hides.
      ScrollTrigger.config({ ignoreMobileResize: true });

      gsapCtx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            pin: true,
            start: () => `top top+=${headerHeight()}`, // pin just below the sticky header
            end: () => `+=${distanceToPx(scrollDistance)}`, // recalculated on resize

            scrub,
            invalidateOnRefresh: true,
          },
          onUpdate: () => {
            // Same (scrubbed) progress drives the frames and the text.
            const index = Math.round(tl.progress() * (frameCount - 1));
            if (index !== currentFrame) {
              currentFrame = index;
              requestDraw();
            }
          },
        });

        // Keep the timeline exactly 1 unit long, so positions = scroll progress.
        tl.to({}, { duration: 1 }, 0);

        // Scroll hint disappears as soon as scrolling starts.
        tl.to("[data-hero-scroll-hint]", { autoAlpha: 0, duration: 0.04 }, 0);

        // Phrases: equal slices; ~20% in, ~60% hold, ~20% out. Last one stays.
        const slice = 1 / phrases.length;
        const phraseEls = gsap.utils.toArray<HTMLElement>("[data-hero-phrase]");
        phraseEls.forEach((phraseEl, i) => {
          const words = phraseEl.querySelectorAll<HTMLElement>("[data-hero-word]");
          const start = i * slice;
          const inDur = slice * PHRASE_IN;
          const outDur = slice * PHRASE_OUT;
          const isFirst = i === 0;
          const isLast = i === phraseEls.length - 1;

          if (!isFirst) {
            // Words enter one after another (fade + rise + un-blur).
            const each = inDur * 0.65;
            const stagger = words.length > 1 ? (inDur - each) / (words.length - 1) : 0;
            tl.fromTo(
              words,
              { autoAlpha: 0, y: 30, filter: "blur(8px)" },
              { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: each, stagger, ease: "power2.out" },
              start,
            );
          }
          if (!isLast) {
            tl.to(words, { autoAlpha: 0, y: -16, filter: "blur(6px)", duration: outDur, ease: "power1.in" }, start + slice - outDur);
          }
        });

        // CTA fades in over the last 10% and stays with the final phrase.
        tl.fromTo("[data-hero-cta]", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 1 - CTA_START, ease: "power2.out" }, CTA_START);
      }, section);
    }

    requestDraw();

    // ---------------------------------------------------------------------
    // Cleanup: ScrollTriggers, tweens, listeners, pending frames & downloads.
    // ---------------------------------------------------------------------
    return () => {
      disposed = true;
      gsapCtx?.revert(); // kills the timeline + ScrollTrigger and removes the pin spacer
      window.removeEventListener("resize", onResize);
      resizeObserver.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      for (const img of images) {
        if (!img) continue;
        img.onload = null;
        img.onerror = null;
        img.src = ""; // cancel downloads still in flight
      }
    };
  }, [frameCount, desktopFramesDir, mobileFramesDir, scrollDistance, scrub, phrases.length, objectFit]);

  return (
    // React-owned wrapper: ScrollTrigger's pin wraps the <section> in a
    // "pin-spacer" div React doesn't know about. Without this wrapper, leaving the
    // homepage made React try to remove the section from its old parent and crash
    // ("removeChild: The node to be removed is not a child of this node").
    <div className="hero-scroll-wrapper">
    <section ref={sectionRef} aria-label="Introduction" className="hero-scroll relative bg-paper">
      {/* Height = screen minus header (--hero-h, measured in JS; the CSS value is
          only a first-paint fallback). Fixed height = no layout shift while frames load. */}
      <div className="relative h-[var(--hero-h,calc(100svh-5rem))] overflow-hidden md:grid md:grid-cols-[55fr_45fr]">
        {/* ---------- Canvas (mobile: full-screen background, desktop: right column) ---------- */}
        <div className="absolute inset-0 bg-ink md:relative md:order-2 md:flex md:items-center md:justify-center md:bg-transparent md:py-6 md:pr-10 lg:pr-16">
          <div className="relative size-full md:aspect-[9/16] md:h-full md:w-auto md:max-w-full md:overflow-hidden md:rounded-2xl md:bg-ink md:shadow-[0_30px_80px_-30px_rgba(31,31,29,0.55)]">
            <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
            {/* Subtle loading state - canvas only, until frame 1 is drawn */}
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-0 flex items-center justify-center bg-ink transition-opacity duration-500",
                firstFrameReady ? "opacity-0" : "animate-pulse opacity-100",
              )}
            >
              <span className="size-8 animate-spin rounded-full border-2 border-paper/15 border-t-paper/60" />
            </div>
          </div>
          {/* Mobile: dark gradient from the bottom so the text stays readable */}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/55 via-50% to-transparent md:hidden" />
        </div>

        {/* ---------- Text (real HTML, never drawn on the canvas) ---------- */}
        <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-12 text-paper [text-shadow:0_1px_12px_rgba(31,31,29,0.45)] md:order-1 md:justify-center md:px-12 md:pb-0 md:text-ink md:[text-shadow:none] lg:px-20 xl:px-24">
          <p className="mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-olive-soft md:mb-6 md:text-olive-deep">{eyebrow}</p>
          {/* Mobile sizes scale with width AND height so short phones never overflow */}
          <h1 className="max-w-[22ch] font-serif text-[clamp(1.5rem,min(6.6vw,4.2svh),2.6rem)] leading-[1.06] md:max-w-none md:text-[clamp(2.2rem,3.3vw,3.6rem)]">
            {title}
          </h1>
          {text && (
            // On short phones the paragraph is hidden to keep the hero uncluttered
            <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed text-paper/80 max-md:[@media(max-height:740px)]:hidden md:mt-6 md:text-lg md:text-muted">
              {text}
            </p>
          )}

          {/* Phrases: stacked in one spot and swapped by scroll (a list when motion is reduced) */}
          <div className="relative mt-5 min-h-[2.6em] font-serif text-[clamp(1.1rem,min(4.8vw,2.9svh),1.5rem)] italic leading-snug md:mt-10 md:min-h-[2.6em] md:text-[clamp(1.3rem,2vw,1.85rem)] motion-reduce:min-h-0">
            {phrases.map((phrase, i) => (
              <p
                key={phrase}
                data-hero-phrase
                className="absolute inset-x-0 top-0 text-olive-soft md:text-olive-deep motion-reduce:static motion-reduce:mb-1"
              >
                {phrase.split(" ").map((word, w) => (
                  <span key={w}>
                    <span data-hero-word {...(i > 0 ? { "data-hero-hidden": "" } : {})} className="inline-block will-change-transform">
                      {word}
                    </span>{" "}
                  </span>
                ))}
              </p>
            ))}
          </div>

          {/* CTA: fades in at the end of the scroll */}
          <div data-hero-cta data-hero-hidden="" className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-8">
            <Link
              href={primaryCta.href}
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-olive-deep px-6 text-sm font-medium tracking-wide text-white transition-colors hover:bg-ink md:hover:bg-ink"
            >
              {primaryCta.label}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="group inline-flex min-h-12 items-center justify-center gap-2 text-sm font-medium tracking-wide underline-offset-8 decoration-olive hover:underline"
              >
                {secondaryCta.label}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            )}
          </div>
        </div>

        {/* ---------- Scroll hint (fades out once scrolling starts) ----------
            Centred with a flex wrapper, not translate - GSAP animates this element. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center md:inset-x-auto md:bottom-6 md:left-12 lg:left-20 xl:left-24 motion-reduce:hidden"
        >
          <div
            data-hero-scroll-hint
            className="flex flex-col items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-paper/70 md:text-muted"
          >
            <span>Scroll</span>
            <span className="relative h-8 w-px overflow-hidden bg-current/25">
              <span className="hero-scroll-line absolute inset-x-0 top-0 h-3 bg-current" />
            </span>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
}
