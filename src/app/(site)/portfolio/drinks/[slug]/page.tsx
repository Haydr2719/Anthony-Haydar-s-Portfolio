import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaFrame } from "@/components/media";
import { Gallery, VideoCard } from "@/components/media-client";
import { CtaBand, DrinkCard } from "@/components/site/cards";
import { Eyebrow, Prose, Section, SectionHeader, toParagraphs } from "@/components/ui";
import { getDrink, getDrinks, getMedia } from "@/lib/data";
import { toGalleryItem } from "@/lib/nav";
import { DRINK_CATEGORIES, labelOf } from "@/lib/options";
import { entryMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getDrinks()).map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = await getDrink(slug);
  return entryMetadata(d, d?.name ?? "Drink", d?.concept, d?.image, `/portfolio/drinks/${slug}`);
}

export default async function DrinkPage({ params }: Props) {
  const { slug } = await params;
  const drink = await getDrink(slug);
  if (!drink) notFound();
  const [media, all] = await Promise.all([getMedia({ drinkId: drink.id }), getDrinks()]);
  const more = all.filter((d) => d.id !== drink.id).slice(0, 4);

  return (
    <>
      <Section className="!pt-12 md:!pt-16">
        <Link href="/portfolio/drinks" className="eyebrow hover:underline">
          ← Drinks & Concepts
        </Link>
        <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <MediaFrame src={drink.image} alt={drink.name} ratio="4/5" priority sizes="(min-width: 1024px) 50vw, 100vw" />
          <div className="animate-fade-up">
            <Eyebrow className="mb-4">{labelOf(DRINK_CATEGORIES, drink.category)}</Eyebrow>
            <h1 className="text-5xl leading-[1.04] md:text-6xl">{drink.name}</h1>
            {drink.concept && <p className="mt-6 font-serif text-2xl leading-snug text-ink-3">{drink.concept}</p>}
            <dl className="mt-10 divide-y divide-stone border-y border-stone text-sm">
              {[
                ["Venue / brand", drink.venue_brand],
                ["Anthony's role", drink.role],
                ["Category", labelOf(DRINK_CATEGORIES, drink.category)],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 py-3">
                    <dt className="text-muted">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
            </dl>
            {drink.context && <Prose paragraphs={toParagraphs(drink.context)} className="mt-8 !text-base" />}
          </div>
        </div>
      </Section>

      {(drink.video_url || media.length > 0) && (
        <Section tone="paper-2">
          <SectionHeader title="Behind the drink" />
          {drink.video_url && (
            <div className="mb-6 max-w-3xl">
              <VideoCard url={drink.video_url} title={drink.name} />
            </div>
          )}
          {media.length > 0 && <Gallery items={media.map(toGalleryItem)} />}
        </Section>
      )}

      {more.length > 0 && (
        <Section>
          <SectionHeader title="More drinks & concepts" action={{ href: "/portfolio/drinks", label: "View all" }} />
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
            {more.map((d) => (
              <DrinkCard key={d.id} drink={d} />
            ))}
          </div>
        </Section>
      )}

      <CtaBand
        title="Want a signature drink program like this?"
        primary={{ href: "/contact?type=consultation", label: "Book a Consultation" }}
        secondary={{ href: "/contact?type=partnership", label: "Brand collaboration" }}
      />
    </>
  );
}
