export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const dayMonthFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });
const timeFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

export function formatDate(iso?: string | null) {
  return iso ? dateFmt.format(new Date(iso)) : "";
}

export function formatTime(iso?: string | null) {
  return iso ? timeFmt.format(new Date(iso)) : "";
}

export function formatDateRange(start?: string | null, end?: string | null) {
  if (!start) return "Date to be announced";
  if (!end) return formatDate(start);
  const s = new Date(start);
  const e = new Date(end);
  if (s.toDateString() === e.toDateString()) return formatDate(start);
  if (s.getUTCFullYear() === e.getUTCFullYear()) return `${dayMonthFmt.format(s)} – ${dateFmt.format(e)}`;
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export type VideoSource =
  | { kind: "youtube"; id: string; embed: string; thumb: string }
  | { kind: "vimeo"; id: string; embed: string; thumb?: undefined }
  | { kind: "file"; src: string }
  | { kind: "link"; href: string };

/** Turns a CMS video URL into something playable. */
export function parseVideo(url?: string | null): VideoSource | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) {
    return {
      kind: "youtube",
      id: yt[1],
      embed: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`,
      thumb: `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg`,
    };
  }
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { kind: "vimeo", id: vm[1], embed: `https://player.vimeo.com/video/${vm[1]}?autoplay=1&dnt=1` };
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return { kind: "file", src: url };
  return { kind: "link", href: url };
}

/**
 * next/image only optimizes hosts listed in next.config.ts. Images pasted from
 * any other host are still shown, just without optimization.
 */
export function canOptimize(src?: string | null) {
  if (!src) return false;
  if (src.startsWith("/")) return true;
  try {
    const host = new URL(src).hostname;
    const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : "";
    return host.endsWith(".supabase.co") || host === supabaseHost || host === "i.ytimg.com" || host === "images.unsplash.com";
  } catch {
    return false;
  }
}

export function whatsappLink(number?: string | null, text?: string) {
  if (!number) return null;
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
