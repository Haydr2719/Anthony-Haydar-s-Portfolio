import type { MetadataRoute } from "next";
import { getDrinks, getEvents, getProjects, getPrograms, getServices } from "@/lib/data";
import { SITE_URL } from "@/lib/utils";

export const revalidate = 3600;

const STATIC = [
  "",
  "/about",
  "/consultancy",
  "/portfolio",
  "/portfolio/projects",
  "/portfolio/drinks",
  "/portfolio/collaborations",
  "/training-events",
  "/training-events/training",
  "/training-events/workshops",
  "/training-events/events",
  "/media",
  "/media/photos",
  "/media/videos",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, drinks, programs, events] = await Promise.all([
    getServices(),
    getProjects(),
    getDrinks(),
    getPrograms(),
    getEvents(),
  ]);
  const entry = (path: string, updated?: string, priority = 0.6): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    lastModified: updated ? new Date(updated) : undefined,
    priority,
  });
  return [
    ...STATIC.map((p) => entry(p, undefined, p === "" ? 1 : 0.8)),
    ...services.map((s) => entry(`/consultancy/${s.slug}`, s.updated_at, 0.9)),
    ...projects.map((p) => entry(`/portfolio/projects/${p.slug}`, p.updated_at)),
    ...drinks.map((d) => entry(`/portfolio/drinks/${d.slug}`, d.updated_at, 0.5)),
    ...programs.map((p) => entry(`/training-events/workshops/${p.slug}`, p.updated_at)),
    ...events.map((e) => entry(`/training-events/events/${e.slug}`, e.updated_at)),
  ];
}
