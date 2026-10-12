"use client";

import Image from "@/components/smart-image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { Placeholder } from "@/components/media";
import { cn, parseVideo } from "@/lib/utils";

export interface GalleryItem {
  id: string;
  type: "photo" | "video";
  src?: string | null;
  videoUrl?: string | null;
  poster?: string | null;
  alt: string;
  title?: string | null;
  caption?: string | null;
  credit?: string | null;
  orientation?: "landscape" | "portrait" | "square";
}

/** Plays a video inline. Nothing heavy loads until the visitor clicks play. */
function VideoPlayback({ url, title, vertical }: { url: string; title: string; vertical?: boolean }) {
  const video = parseVideo(url);
  if (!video) return null;
  if (video.kind === "file") {
    return <video src={video.src} controls autoPlay playsInline className="size-full bg-black object-contain" />;
  }
  if (video.kind === "youtube" || video.kind === "vimeo") {
    return (
      <iframe
        src={video.embed}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className={cn("size-full border-0", vertical && "bg-black")}
      />
    );
  }
  return null;
}

/** Share of the video that must be on screen before it auto-plays (and below which it pauses). */
const AUTOPLAY_VISIBLE = 0.25;

/** Muted, looping embed URLs for auto-play (browsers only allow muted auto-play). */
function mutedEmbed(video: { kind: "youtube" | "vimeo"; id: string }) {
  return video.kind === "youtube"
    ? `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${video.id}&rel=0&enablejsapi=1`
    : `https://player.vimeo.com/video/${video.id}?autoplay=1&muted=1&loop=1&playsinline=1&dnt=1`;
}

/** Tells an embedded YouTube / Vimeo player to play or pause. */
function controlEmbed(frame: HTMLIFrameElement | null, kind: "youtube" | "vimeo", action: "play" | "pause") {
  const message =
    kind === "youtube"
      ? { event: "command", func: action === "play" ? "playVideo" : "pauseVideo", args: [] }
      : { method: action };
  frame?.contentWindow?.postMessage(JSON.stringify(message), "*");
}

/**
 * Video card with a thumbnail. Plays automatically (muted, looping, with
 * controls) once at least 25% of it is on screen, and pauses when scrolled
 * away. Nothing downloads before that. Clicking the thumbnail plays with sound.
 * No auto-play for visitors with reduced motion or data saver - click to play.
 */
export function VideoCard({
  url,
  poster,
  title,
  orientation = "landscape",
  className,
  autoPlayOnView = true,
}: {
  url: string;
  poster?: string | null;
  title: string;
  orientation?: "landscape" | "portrait" | "square";
  className?: string;
  autoPlayOnView?: boolean;
}) {
  // idle = thumbnail; auto = muted auto-play driven by visibility; manual = clicked (with sound)
  const [mode, setMode] = useState<"idle" | "auto" | "manual">("idle");
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const video = parseVideo(url);
  const thumb = poster || (video?.kind === "youtube" ? video.thumb : null);
  const ratio = orientation === "portrait" ? "aspect-[9/16]" : orientation === "square" ? "aspect-square" : "aspect-video";
  const canAuto = autoPlayOnView && video !== null && video.kind !== "link";

  // Watch how much of the card is visible.
  useEffect(() => {
    const el = containerRef.current;
    if (!canAuto || !el) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduceMotion || saveData) return; // click-to-play only
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= AUTOPLAY_VISIBLE;
        setInView(visible);
        if (visible) setMode((m) => (m === "idle" ? "auto" : m));
      },
      { threshold: [0, AUTOPLAY_VISIBLE, 0.5, 1] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [canAuto]);

  // Auto mode: play while visible, pause when scrolled away.
  useEffect(() => {
    if (mode !== "auto" || !video) return;
    if (video.kind === "file") {
      const el = videoRef.current;
      if (!el) return;
      if (inView) el.play().catch(() => {}); // blocked auto-play just leaves the controls visible
      else el.pause();
    } else if (video.kind === "youtube" || video.kind === "vimeo") {
      controlEmbed(frameRef.current, video.kind, inView ? "play" : "pause");
    }
  }, [mode, inView, video?.kind]); // eslint-disable-line react-hooks/exhaustive-deps

  if (video?.kind === "link") {
    return (
      <a href={video.href} target="_blank" rel="noopener noreferrer" className={cn("group relative block overflow-hidden bg-ink-2", ratio, className)}>
        {thumb ? <Image src={thumb} alt={title} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" /> : <Placeholder label={title} />}
        <PlayBadge />
      </a>
    );
  }

  return (
    <div ref={containerRef} className={cn("group relative overflow-hidden bg-ink-2", ratio, className)}>
      {mode === "manual" ? (
        <VideoPlayback url={url} title={title} vertical={orientation === "portrait"} />
      ) : mode === "auto" && video?.kind === "file" ? (
        <video
          ref={videoRef}
          src={video.src}
          poster={thumb ?? undefined}
          muted
          loop
          playsInline
          controls
          preload="metadata"
          aria-label={title}
          className="size-full bg-black object-cover"
        />
      ) : mode === "auto" && (video?.kind === "youtube" || video?.kind === "vimeo") ? (
        <iframe
          ref={frameRef}
          src={mutedEmbed(video)}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="size-full border-0 bg-black"
          onLoad={() => controlEmbed(frameRef.current, video.kind, inView ? "play" : "pause")}
        />
      ) : (
        <button type="button" onClick={() => setMode("manual")} className="absolute inset-0 size-full cursor-pointer" aria-label={`Play video: ${title}`}>
          {thumb ? (
            <Image src={thumb} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
          ) : (
            <Placeholder label={title} />
          )}
          <PlayBadge />
        </button>
      )}
    </div>
  );
}

function PlayBadge() {
  return (
    <span className="absolute inset-0 flex items-center justify-center bg-ink/20 transition-colors group-hover:bg-ink/35">
      <span className="flex size-16 items-center justify-center rounded-full border border-paper/70 bg-ink/40 text-paper backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
        <Play className="ml-1 size-6" fill="currentColor" aria-hidden />
      </span>
    </span>
  );
}

/** Responsive photo/video grid with an accessible lightbox. */
export function Gallery({ items, columns = 3 }: { items: GalleryItem[]; columns?: 2 | 3 | 4 }) {
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const close = useCallback(() => {
    dialogRef.current?.close();
    setIndex(null);
  }, []);
  const step = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i === null ? i : (i + dir + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, step]);

  const current = index === null ? null : items[index];
  const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "grid-cols-2 lg:grid-cols-4" }[columns];

  return (
    <>
      <ul className={cn("grid gap-3 md:gap-4", columns === 4 ? cols : `grid-cols-1 ${cols}`)}>
        {items.map((item, i) => {
          const thumb = item.type === "photo" ? item.src : item.poster || thumbFor(item.videoUrl);
          return (
            <li key={item.id} className={cn(item.orientation === "portrait" && "row-span-2")}>
              <button
                type="button"
                onClick={() => open(i)}
                className="group relative block size-full min-h-56 w-full overflow-hidden bg-ink-2 text-left"
                aria-label={`Open ${item.type}: ${item.title || item.alt}`}
              >
                {thumb ? (
                  <Image
                    src={thumb}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                ) : (
                  <Placeholder label={item.title || item.alt} />
                )}
                {item.type === "video" && <PlayBadge />}
                {(item.title || item.caption) && (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-4 pt-12 text-sm text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    {item.title || item.caption}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setIndex(null)}
        onClick={(e) => e.target === dialogRef.current && close()}
        className="m-0 size-full max-h-none max-w-none bg-ink/95 p-0 text-paper backdrop:bg-ink/80"
        aria-label="Media viewer"
      >
        {current && (
          <div className="flex size-full flex-col">
            <div className="flex items-center justify-between p-4">
              <p className="text-sm text-paper/70">
                {index! + 1} / {items.length}
              </p>
              <button type="button" onClick={close} className="p-2 hover:text-olive-soft" aria-label="Close">
                <X className="size-6" />
              </button>
            </div>
            <div className="relative flex flex-1 items-center justify-center px-4 md:px-20">
              <div
                className={cn(
                  "relative max-h-full w-full",
                  current.orientation === "portrait" ? "aspect-[9/16] h-full max-w-md" : "aspect-video max-w-6xl",
                )}
              >
                {current.type === "photo" && current.src ? (
                  <Image src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain" />
                ) : current.type === "video" && (current.videoUrl || current.src) ? (
                  <VideoPlayback key={current.id} url={(current.videoUrl || current.src)!} title={current.title || current.alt} vertical={current.orientation === "portrait"} />
                ) : (
                  <Placeholder label={current.title || current.alt} />
                )}
              </div>
              {items.length > 1 && (
                <>
                  <button type="button" onClick={() => step(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 p-3 hover:text-olive-soft md:left-6" aria-label="Previous">
                    <ChevronLeft className="size-8" />
                  </button>
                  <button type="button" onClick={() => step(1)} className="absolute right-2 top-1/2 -translate-y-1/2 p-3 hover:text-olive-soft md:right-6" aria-label="Next">
                    <ChevronRight className="size-8" />
                  </button>
                </>
              )}
            </div>
            <div className="mx-auto max-w-3xl p-5 text-center">
              {current.title && <p className="font-serif text-xl">{current.title}</p>}
              {current.caption && <p className="mt-1 text-sm text-paper/70">{current.caption}</p>}
              {current.credit && <p className="mt-1 text-xs text-paper/50">Credit: {current.credit}</p>}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

function thumbFor(url?: string | null) {
  const v = parseVideo(url);
  return v?.kind === "youtube" ? v.thumb : null;
}
