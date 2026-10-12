import type { Metadata } from "next";
import { VideoCard } from "@/components/media-client";
import { BannerSlot } from "@/components/site/banners";
import { PageHero } from "@/components/site/cards";
import { EmptyState, Section, SectionHeader } from "@/components/ui";
import { getBlocks, getMedia } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("media-videos", "/media/videos");
}

export default async function VideosPage() {
  const [b, videos] = await Promise.all([getBlocks("media"), getMedia({ type: "video" })]);
  const reels = videos.filter((v) => v.orientation === "portrait");
  const films = videos.filter((v) => v.orientation !== "portrait");

  return (
    <>
      <PageHero eyebrow="Media" title={b.get("videos.title")} text={b.get("intro.text")} />
      {!videos.length && (
        <Section>
          <EmptyState title="Videos coming soon" />
        </Section>
      )}
      {films.length > 0 && (
        <Section>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {films.map((v) => (
              <figure key={v.id}>
                <VideoCard url={(v.video_url || v.url)!} poster={v.poster_url} title={v.title || "Video"} orientation={v.orientation} />
                {(v.title || v.caption) && (
                  <figcaption className="mt-3">
                    {v.title && <p className="font-serif text-lg">{v.title}</p>}
                    {v.caption && <p className="text-sm text-muted">{v.caption}</p>}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </Section>
      )}
      {reels.length > 0 && (
        <Section tone="paper-2">
          <SectionHeader title="Reels" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {reels.map((v) => (
              <VideoCard key={v.id} url={(v.video_url || v.url)!} poster={v.poster_url} title={v.title || "Reel"} orientation="portrait" />
            ))}
          </div>
        </Section>
      )}
      <BannerSlot placement="mid_content" page="media" />
    </>
  );
}
