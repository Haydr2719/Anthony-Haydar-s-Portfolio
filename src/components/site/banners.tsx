/* eslint-disable @next/next/no-img-element -- <picture> + getImageProps serves an optimised mobile creative */
import { getImageProps } from "next/image";
import { ArrowRight } from "lucide-react";
import { getBanners } from "@/lib/data";
import type { Banner, BannerPlacement } from "@/lib/types";
import { canOptimize, cn } from "@/lib/utils";

/** Click-tracked link: /api/banners/:id/click logs the click, appends UTM tags and redirects. */
function clickHref(b: Banner, page?: string) {
  return `/api/banners/${b.id}/click${page ? `?from=${encodeURIComponent(page)}` : ""}`;
}

function linkProps(b: Banner, page?: string) {
  if (!b.destination_url) return null;
  return {
    href: clickHref(b, page),
    target: b.open_in_new_tab ? "_blank" : undefined,
    rel: b.open_in_new_tab ? "noopener sponsored" : "sponsored",
  };
}

/**
 * Banner image, optimised by Next.js (resized + AVIF/WebP) like the rest of the
 * site. A separate mobile creative is served below 768px (art direction).
 * width/height are only aspect hints - the image keeps its real proportions.
 */
function Creative({ banner, className, sizes = "100vw" }: { banner: Banner; className?: string; sizes?: string }) {
  if (!banner.desktop_image) return null;
  const alt = banner.alt_text || banner.sponsor_name || banner.name;
  const { props: desktop } = getImageProps({
    src: banner.desktop_image,
    alt,
    width: 1600,
    height: 400,
    sizes,
    unoptimized: !canOptimize(banner.desktop_image),
  });
  const mobile = banner.mobile_image
    ? getImageProps({ src: banner.mobile_image, alt, width: 800, height: 600, sizes, unoptimized: !canOptimize(banner.mobile_image) }).props
    : null;
  return (
    <picture>
      {mobile?.srcSet && <source media="(max-width: 767px)" srcSet={mobile.srcSet} sizes={sizes} />}
      {mobile && !mobile.srcSet && <source media="(max-width: 767px)" srcSet={mobile.src} />}
      <img {...desktop} alt={alt} className={cn("block h-auto w-full", className)} />
    </picture>
  );
}

/** Slim strip above the header. */
export async function TopBar() {
  const [banner] = await getBanners("top_bar");
  if (!banner) return null;
  const link = linkProps(banner, "top_bar");
  const inner = (
    <span className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
      <span>{banner.message || banner.name}</span>
      {banner.cta_label && (
        <span className="inline-flex items-center gap-1 font-semibold underline decoration-olive underline-offset-4">
          {banner.cta_label} <ArrowRight className="size-3.5" aria-hidden />
        </span>
      )}
    </span>
  );
  return (
    <div className="bg-ink px-4 py-2.5 text-center text-xs tracking-wide text-paper md:text-[0.8rem]">
      {link ? (
        <a {...link} className="hover:text-olive-soft">
          {inner}
        </a>
      ) : (
        inner
      )}
    </div>
  );
}

/**
 * A CMS-controlled banner zone. Renders nothing (and takes no space) when no
 * banner is live for this placement.
 */
export async function BannerSlot({
  placement,
  page,
  eventId,
  className,
}: {
  placement: Exclude<BannerPlacement, "top_bar">;
  page?: string;
  eventId?: string;
  className?: string;
}) {
  const banners = await getBanners(placement, { page, eventId });
  if (!banners.length) return null;

  // Sponsor & partner zones show a row of logos/creatives.
  if (placement === "event_sponsor" || placement === "footer_partner") {
    return (
      <section aria-label={placement === "event_sponsor" ? "Event sponsors" : "Partners"} className={cn("border-y border-stone bg-paper-2 py-8", className)}>
        <div className="container-x flex flex-col items-center gap-5 md:flex-row md:justify-center md:gap-10">
          <p className="eyebrow shrink-0">{placement === "event_sponsor" ? "Supported by" : "Partners"}</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {banners.map((b) => {
              const link = linkProps(b, page ?? placement);
              const body = b.desktop_image ? (
                <Creative banner={b} sizes="240px" className="max-h-14 w-auto opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0" />
              ) : (
                <span className="font-serif text-lg">{b.sponsor_name || b.name}</span>
              );
              return <li key={b.id}>{link ? <a {...link}>{body}</a> : body}</li>;
            })}
          </ul>
        </div>
      </section>
    );
  }

  const banner = banners[0];
  const link = linkProps(banner, page ?? placement);
  const body = banner.desktop_image ? (
    <Creative banner={banner} />
  ) : (
    <div className="on-dark flex flex-col gap-5 bg-ink px-6 py-8 text-paper md:flex-row md:items-center md:justify-between md:px-12 md:py-10">
      <div>
        {banner.sponsor_name && <p className="eyebrow mb-2">{banner.sponsor_name}</p>}
        <p className="font-serif text-2xl md:text-3xl">{banner.message || banner.name}</p>
      </div>
      {banner.cta_label && (
        <span className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full border border-paper/60 px-6 text-sm font-medium">
          {banner.cta_label} <ArrowRight className="size-4" aria-hidden />
        </span>
      )}
    </div>
  );

  return (
    <aside aria-label="Sponsored" className={cn("container-x py-10 md:py-14", className)}>
      <div className="mb-2 flex justify-end">
        <span className="text-[0.6rem] uppercase tracking-[0.2em] text-muted">
          {banner.sponsor_name ? "Partner" : "Featured"}
        </span>
      </div>
      {link ? (
        <a {...link} className="block transition-opacity hover:opacity-95">
          {body}
        </a>
      ) : (
        body
      )}
    </aside>
  );
}
