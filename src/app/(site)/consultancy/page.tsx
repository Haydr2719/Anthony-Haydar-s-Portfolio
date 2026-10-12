import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { MediaFrame } from "@/components/media";
import { Reveal } from "@/components/reveal";
import { BannerSlot } from "@/components/site/banners";
import { ContactSection, CtaBand, PageHero } from "@/components/site/cards";
import { Section } from "@/components/ui";
import { getBlocks, getServices } from "@/lib/data";
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
                  <MediaFrame src={s.cover_image} alt={s.title} ratio="4/3" sizes="(min-width: 1024px) 50vw, 100vw" />
                </Link>
                <div>
                  <p className="eyebrow mb-4">0{i + 1}</p>
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
