import type { Metadata } from "next";
import { getPageMeta, getSettings } from "@/lib/data";

interface SeoInput {
  title?: string | null;
  description?: string | null;
  image?: string | null;
  path: string;
  type?: "website" | "article";
}

/** Builds page metadata from explicit values, falling back to the site defaults. */
export async function buildMetadata(input: SeoInput): Promise<Metadata> {
  const settings = await getSettings();
  const title = input.title || settings.default_seo_title || settings.site_name;
  const description = input.description || settings.default_seo_description || undefined;
  const image = input.image || settings.default_og_image || undefined;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: input.path },
    openGraph: {
      title,
      description,
      url: input.path,
      siteName: settings.site_name,
      type: input.type ?? "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}

/** Metadata for a static page whose SEO fields live in the `pages` table. */
export async function pageMetadata(slug: string, path: string): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPageMeta(slug), getSettings()]);
  return buildMetadata({
    title: page?.seo_title || (page?.title ? `${page.title} | ${settings.site_name}` : undefined),
    description: page?.seo_description,
    image: page?.og_image,
    path,
  });
}

/** Metadata for a CMS entry (service, project, drink, event...). */
export async function entryMetadata(
  entry: { seo_title?: string | null; seo_description?: string | null; og_image?: string | null } | undefined,
  fallbackTitle: string,
  fallbackDescription: string | null | undefined,
  image: string | null | undefined,
  path: string,
): Promise<Metadata> {
  const settings = await getSettings();
  return buildMetadata({
    title: entry?.seo_title || `${fallbackTitle} | ${settings.site_name}`,
    description: entry?.seo_description || fallbackDescription,
    image: entry?.og_image || image,
    path,
    type: "article",
  });
}
