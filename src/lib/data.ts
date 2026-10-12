import { cache } from "react";
import * as fb from "@/content/fallback";
import { getPublicClient } from "@/lib/supabase/clients";
import type {
  Banner,
  BannerPlacement,
  ContentBlock,
  DrinkCategory,
  Drink,
  EventItem,
  Experience,
  MediaItem,
  PageMeta,
  Partner,
  Program,
  ProgramKind,
  Project,
  ProjectCategory,
  Service,
  SiteSettings,
  Testimonial,
} from "@/lib/types";

// -----------------------------------------------------------------------------
// Core loader: reads a whole table through the anon client (RLS returns only
// published / live rows). Tables are small, so filtering happens in JS and the
// same code path serves both sources.
//
//   * Supabase NOT configured (local development) -> placeholder content from
//     src/content/fallback.ts, so the site can be previewed without a database.
//   * Supabase configured -> database only. If a query fails we THROW:
//     during a background refresh Next.js keeps serving the last good version
//     of the page; otherwise the visitor sees the branded error page
//     (src/app/(site)/error.tsx).
// -----------------------------------------------------------------------------
const loadTable = cache(async function loadTable<T>(table: string, fallback: T[]): Promise<T[]> {
  const db = getPublicClient();
  if (!db) return isLive(fallback);
  const { data, error } = await db.from(table).select("*");
  if (error) {
    console.error(`[data] Failed to load "${table}": ${error.message}`);
    throw new Error(`Failed to load ${table}`);
  }
  return data as T[];
}) as <T>(table: string, fallback: T[]) => Promise<T[]>;

function isLive<T>(rows: T[]): T[] {
  const now = Date.now();
  return rows.filter((r) => {
    const row = r as { status?: string; publish_at?: string };
    if (row.status && row.status !== "published") return false;
    if (row.publish_at && Date.parse(row.publish_at) > now) return false;
    return true;
  });
}

const bySort = <T extends { sort_order: number }>(a: T, b: T) => a.sort_order - b.sort_order;
const take = <T>(rows: T[], limit?: number) => (limit ? rows.slice(0, limit) : rows);

// -----------------------------------------------------------------------------
// Settings, page SEO and editable text blocks
// -----------------------------------------------------------------------------
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const rows = await loadTable<SiteSettings>("site_settings", [fb.fallbackSettings]);
  return { ...fb.fallbackSettings, ...(rows[0] ?? {}) };
});

export const getPageMeta = cache(async (slug: string): Promise<PageMeta | undefined> => {
  const rows = await loadTable<PageMeta>("pages", fb.fallbackPages);
  return rows.find((p) => p.slug === slug) ?? fb.fallbackPages.find((p) => p.slug === slug);
});

export interface Blocks {
  get(key: string): string;
  lines(key: string): string[];
  pairs(key: string): { title: string; text: string }[];
  paragraphs(key: string): string[];
}

export const getBlocks = cache(async (page: string): Promise<Blocks> => {
  const rows = await loadTable<ContentBlock>("content_blocks", fb.fallbackBlocks);
  const map = new Map<string, string>();
  for (const b of fb.fallbackBlocks) if (b.page === page) map.set(b.key, b.value);
  for (const b of rows) if (b.page === page) map.set(b.key, b.value);
  const get = (key: string) => map.get(key) ?? "";
  const lines = (key: string) =>
    get(key)
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  return {
    get,
    lines,
    pairs: (key) =>
      lines(key).map((l) => {
        const [title, ...rest] = l.split("|");
        return { title: title.trim(), text: rest.join("|").trim() };
      }),
    paragraphs: (key) =>
      get(key)
        .split(/\r?\n\s*\r?\n/)
        .map((p) => p.trim())
        .filter(Boolean),
  };
});

// -----------------------------------------------------------------------------
// Services
// -----------------------------------------------------------------------------
export async function getServices(): Promise<Service[]> {
  return (await loadTable<Service>("services", fb.fallbackServices)).sort(bySort);
}

export async function getService(slug: string) {
  return (await getServices()).find((s) => s.slug === slug);
}

// -----------------------------------------------------------------------------
// Portfolio
// -----------------------------------------------------------------------------
export async function getProjects(opts: {
  category?: ProjectCategory;
  exclude?: ProjectCategory;
  featured?: boolean;
  serviceSlug?: string;
  limit?: number;
} = {}): Promise<Project[]> {
  let rows = (await loadTable<Project>("projects", fb.fallbackProjects)).sort(bySort);
  if (opts.category) rows = rows.filter((p) => p.category === opts.category);
  if (opts.exclude) rows = rows.filter((p) => p.category !== opts.exclude);
  if (opts.featured) rows = rows.filter((p) => p.featured);
  if (opts.serviceSlug) rows = rows.filter((p) => p.service_slugs?.includes(opts.serviceSlug!));
  return take(rows, opts.limit);
}

export async function getProject(slug: string) {
  return (await getProjects()).find((p) => p.slug === slug);
}

export async function getDrinks(opts: { category?: DrinkCategory; featured?: boolean; limit?: number } = {}) {
  let rows = (await loadTable<Drink>("drinks", fb.fallbackDrinks)).sort(bySort);
  if (opts.category) rows = rows.filter((d) => d.category === opts.category);
  if (opts.featured) rows = rows.filter((d) => d.featured);
  return take(rows, opts.limit);
}

export async function getDrink(slug: string) {
  return (await getDrinks()).find((d) => d.slug === slug);
}

// -----------------------------------------------------------------------------
// Training, workshops & events
// -----------------------------------------------------------------------------
const time = (iso?: string | null) => (iso ? Date.parse(iso) : NaN);

export async function getPrograms(opts: { kinds?: ProgramKind[]; featured?: boolean; limit?: number } = {}) {
  let rows = (await loadTable<Program>("programs", fb.fallbackPrograms)).sort(
    (a, b) => bySort(a, b) || (time(a.start_at) || 0) - (time(b.start_at) || 0),
  );
  if (opts.kinds) rows = rows.filter((p) => opts.kinds!.includes(p.kind));
  if (opts.featured) rows = rows.filter((p) => p.featured);
  return take(rows, opts.limit);
}

export async function getProgram(slug: string) {
  return (await getPrograms()).find((p) => p.slug === slug);
}

export function isPastEvent(e: Pick<EventItem, "event_status" | "start_at" | "end_at">) {
  if (e.event_status === "completed") return true;
  const end = time(e.end_at ?? e.start_at);
  return !Number.isNaN(end) && end < Date.now();
}

export async function getEvents(opts: { when?: "upcoming" | "past"; featured?: boolean; limit?: number } = {}) {
  let rows = await loadTable<EventItem>("events", fb.fallbackEvents);
  if (opts.when === "upcoming") rows = rows.filter((e) => !isPastEvent(e));
  if (opts.when === "past") rows = rows.filter((e) => isPastEvent(e));
  if (opts.featured) rows = rows.filter((e) => e.featured);
  rows = [...rows].sort((a, b) => {
    const diff = (time(a.start_at) || Infinity) - (time(b.start_at) || Infinity);
    return opts.when === "past" ? -diff : diff;
  });
  return take(rows, opts.limit);
}

export async function getEvent(slug: string) {
  return (await getEvents()).find((e) => e.slug === slug);
}

// -----------------------------------------------------------------------------
// Social proof, experience, media
// -----------------------------------------------------------------------------
export async function getTestimonials(opts: { featured?: boolean } = {}) {
  let rows = (await loadTable<Testimonial>("testimonials", fb.fallbackTestimonials)).sort(bySort);
  if (opts.featured) rows = rows.filter((t) => t.featured);
  return rows;
}

export async function getPartners(opts: { home?: boolean } = {}) {
  let rows = (await loadTable<Partner>("partners", fb.fallbackPartners)).sort(bySort);
  if (opts.home) rows = rows.filter((p) => p.show_on_home);
  return rows;
}

export async function getExperience() {
  return (await loadTable<Experience>("experience", fb.fallbackExperience)).sort(bySort);
}

export async function getMedia(opts: {
  type?: MediaItem["type"];
  featured?: boolean;
  projectId?: string;
  drinkId?: string;
  eventId?: string;
  programId?: string;
  limit?: number;
} = {}) {
  let rows = (await loadTable<MediaItem>("media_items", fb.fallbackMedia)).sort(bySort);
  if (opts.type) rows = rows.filter((m) => m.type === opts.type);
  if (opts.featured) rows = rows.filter((m) => m.featured);
  if (opts.projectId) rows = rows.filter((m) => m.project_id === opts.projectId);
  if (opts.drinkId) rows = rows.filter((m) => m.drink_id === opts.drinkId);
  if (opts.eventId) rows = rows.filter((m) => m.event_id === opts.eventId);
  if (opts.programId) rows = rows.filter((m) => m.program_id === opts.programId);
  return take(rows, opts.limit);
}

// -----------------------------------------------------------------------------
// Banners (RLS already hides inactive / out-of-window banners; re-checked here
// so the placeholder path and cached pages behave the same)
// -----------------------------------------------------------------------------
export async function getBanners(
  placement: BannerPlacement,
  opts: { page?: string; eventId?: string } = {},
): Promise<Banner[]> {
  const now = Date.now();
  return (await loadTable<Banner>("banners", fb.fallbackBanners))
    .filter(
      (b) =>
        b.placement === placement &&
        b.is_active &&
        (!b.starts_at || Date.parse(b.starts_at) <= now) &&
        (!b.ends_at || Date.parse(b.ends_at) > now) &&
        (!opts.page || !b.target_pages?.length || b.target_pages.includes(opts.page)) &&
        (!b.event_id || b.event_id === opts.eventId),
    )
    .sort(bySort);
}
