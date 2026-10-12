import type { Metadata } from "next";
import { MediaFrame } from "@/components/media";
import { Gallery, VideoCard } from "@/components/media-client";
import { BannerSlot } from "@/components/site/banners";
import { CtaBand, PageHero } from "@/components/site/cards";
import { Section, SectionHeader } from "@/components/ui";
import { getBlocks, getMedia } from "@/lib/data";
import { toGalleryItem } from "@/lib/nav";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("media", "/media");
}

export default async function MediaPage() {
  const [b, photos, videos] = await Promise.all([getBlocks("media"), getMedia({ type: "photo", limit: 9 }), getMedia({ type: "video", limit: 6 })]);
  const empty = !photos.length && !videos.length;

  return (
    <>
      <PageHero eyebrow="Media" title={b.get("intro.title")} text={b.get("intro.text")} />

      {empty && (
        <Section>
          <div className="grid gap-4 md:grid-cols-3">
            {["Behind the scenes", "Training sessions", "Events & activations"].map((l) => (
              <MediaFrame key={l} alt={l} label={`${l} - coming soon`} ratio="4/3" />
            ))}
          </div>
        </Section>
      )}

      {videos.length > 0 && (
        <Section>
          <SectionHeader title={b.get("videos.title")} action={{ href: "/media/videos", label: "All videos" }} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <VideoCard key={v.id} url={(v.video_url || v.url)!} poster={v.poster_url} title={v.title || "Video"} orientation={v.orientation} />
            ))}
          </div>
        </Section>
      )}

      <BannerSlot placement="mid_content" page="media" />

      {photos.length > 0 && (
        <Section tone="paper-2">
          <SectionHeader title={b.get("photos.title")} action={{ href: "/media/photos", label: "All photos" }} />
          <Gallery items={photos.map(toGalleryItem)} />
        </Section>
      )}

      <CtaBand
        title="Press & media enquiries"
        text="For interviews, features, appearances or content collaborations."
        primary={{ href: "/contact?type=general", label: "Get in touch" }}
      />
    </>
  );
}
