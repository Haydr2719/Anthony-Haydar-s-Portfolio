import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { MediaFrame } from "@/components/media";
import { Reveal } from "@/components/reveal";
import { BannerSlot } from "@/components/site/banners";
import { ContactSection, CtaBand, PageHero } from "@/components/site/cards";
import { Section } from "@/components/ui";
import { getBlocks, getServices } from "@/lib/data";
import { SHOW_SERVICE_IMAGES } from "@/lib/features";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("consultancy", "/consultancy");
}

export default async function ConsultancyPage() {
  const [b, services] = await Promise.all([getBlocks("consultancy"), getServices()]);

  return (
    <>
      <PageHero eyebrow={b.get("intro.eyebrow")} title={b.get("intro.title")} text={b.get("intro.text")} />

      <Section>
        <div className="space-y-24 md:space-y-32">
          {services.map((s, i) => (
            <Reveal key={s.slug}>
              <article className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-20">
                <Link href={`/consultancy/${s.slug}`} className={i % 2 ? "lg:order-2" : undefined} tabIndex={-1} aria-hidden>
                  {SHOW_SERVICE_IMAGES ? (
                    <MediaFrame src={s.cover_image} alt={s.title} ratio="4/3" sizes="(min-width: 1024px) 50vw, 100vw" />
                  ) : (
                    // No images (src/lib/features.ts): a deep-olive panel with the number and tagline.
                    <div className="on-dark flex aspect-[16/9] flex-col justify-between bg-olive-deep p-8 text-paper transition-colors duration-500 hover:bg-ink md:p-12 lg:aspect-[4/3]">
                      <span className="font-serif text-6xl leading-none text-paper/90 md:text-8xl">0{i + 1}</span>
                      {s.tagline && <p className="max-w-sm font-serif text-2xl leading-snug md:text-3xl">{s.tagline}</p>}
                    </div>
                  )}
                </Link>
                <div>
                  {/* The panel already shows the number when there are no images */}
                  {SHOW_SERVICE_IMAGES && <p className="eyebrow mb-4">0{i + 1}</p>}
                  <h2 className="text-4xl leading-tight md:text-5xl">{s.title}</h2>
                  {s.summary && <p className="mt-4 text-lg text-muted">{s.summary}</p>}
                  <ul className="mt-8 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    {s.included.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-olive" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/consultancy/${s.slug}`} className="group mt-10 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
                    Explore {s.title} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <BannerSlot placement="mid_content" page="consultancy" />

      <CtaBand
        title={b.get("cta.title")}
        text={b.get("cta.text")}
        primary={{ href: "#enquire", label: "Book a Consultation" }}
        secondary={{ href: "/portfolio", label: "See the work" }}
      />
      <ContactSection defaultType="consultation" />
    </>
  );
}
