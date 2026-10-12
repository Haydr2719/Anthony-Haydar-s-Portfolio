import type { Metadata } from "next";
import { Gallery } from "@/components/media-client";
import { Filterable } from "@/components/filterable";
import { BannerSlot } from "@/components/site/banners";
import { PageHero } from "@/components/site/cards";
import { EmptyState, Section } from "@/components/ui";
import { getBlocks, getMedia } from "@/lib/data";
import { toGalleryItem } from "@/lib/nav";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("media-photos", "/media/photos");
}

export default async function PhotosPage() {
  const [b, photos] = await Promise.all([getBlocks("media"), getMedia({ type: "photo" })]);
  const categories = [...new Set(photos.map((p) => p.category).filter(Boolean))] as string[];

  return (
    <>
      <PageHero eyebrow="Media" title={b.get("photos.title")} text={b.get("intro.text")} />
      <Section>
        {!photos.length ? (
          <EmptyState title="Photos coming soon" />
        ) : categories.length > 1 ? (
          // One gallery per category so the lightbox navigates within the visible set
          <Filterable options={categories.map((c) => ({ value: c, label: c }))} itemCategories={categories}>
            {categories.map((c) => (
              <div key={c} className="mb-14">
                <h2 className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-muted">{c}</h2>
                <Gallery items={photos.filter((p) => p.category === c).map(toGalleryItem)} />
              </div>
            ))}
          </Filterable>
        ) : (
          <Gallery items={photos.map(toGalleryItem)} />
        )}
        {categories.length > 1 && photos.some((p) => !p.category) && (
          <Gallery items={photos.filter((p) => !p.category).map(toGalleryItem)} />
        )}
      </Section>
      <BannerSlot placement="mid_content" page="media" />
    </>
  );
}
