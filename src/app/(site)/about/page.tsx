import type { Metadata } from "next";
import { Award, Briefcase, Flag } from "lucide-react";
import { MediaFrame } from "@/components/media";
import { Gallery, VideoCard } from "@/components/media-client";
import { Reveal } from "@/components/reveal";
import { CtaBand, PageHero } from "@/components/site/cards";
import { Eyebrow, Prose, Section, SectionHeader } from "@/components/ui";
import { getBlocks, getExperience, getMedia, getSettings } from "@/lib/data";
import { toGalleryItem } from "@/lib/nav";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("about", "/about");
}

const kindIcon = { role: Briefcase, certification: Award, milestone: Flag };

export default async function AboutPage() {
  const [b, settings, experience, photos] = await Promise.all([
    getBlocks("about"),
    getSettings(),
    getExperience(),
    getMedia({ type: "photo", featured: true, limit: 6 }),
  ]);
  const roles = experience.filter((e) => e.kind !== "certification");
  const credentials = experience.filter((e) => e.kind === "certification");

  return (
    <>
      <PageHero eyebrow={b.get("intro.eyebrow")} title={b.get("intro.title")} text={b.get("intro.text")} image={settings.about_image} />

      <Section id="story">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <Eyebrow className="mb-4">01 · Story</Eyebrow>
            <h2 className="text-4xl leading-tight md:text-5xl">{b.get("story.title")}</h2>
            <div className="mt-10">
              {settings.about_video ? (
                <VideoCard url={settings.about_video} poster={settings.about_image} title="Anthony's story" />
              ) : (
                <MediaFrame src={null} alt="Anthony behind the bar" label="Story photo or video" ratio="4/3" />
              )}
            </div>
          </Reveal>
          <Reveal delay={100}>
            <Prose paragraphs={b.paragraphs("story.body")} className="lg:pt-16" />
          </Reveal>
        </div>
      </Section>

      <section id="mission-vision" className="on-dark bg-ink py-20 text-paper md:py-28">
        <div className="container-x grid gap-12 md:grid-cols-2 md:gap-0">
          {(["mission", "vision"] as const).map((k, i) => (
            <Reveal key={k} delay={i * 100} className={i === 1 ? "md:border-l md:border-paper/15 md:pl-14" : "md:pr-14"}>
              <Eyebrow className="mb-4">0{i + 2} · {b.get(`${k}.title`)}</Eyebrow>
              <p className="font-serif text-2xl leading-snug md:text-3xl">{b.get(`${k}.body`)}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <Section id="approach">
        <SectionHeader eyebrow="04 · Approach" title={b.get("approach.title")} text={b.get("approach.text")} />
        <ol className="grid gap-px overflow-hidden border border-stone bg-stone sm:grid-cols-2 lg:grid-cols-4">
          {b.pairs("approach.pillars").map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 80} className="bg-paper p-8">
              <span className="font-serif text-4xl text-olive">{i + 1}</span>
              <h3 className="mt-6 text-2xl">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
            </Reveal>
          ))}
        </ol>

        <div className="mt-24">
          <SectionHeader title={b.get("values.title")} />
          <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {b.pairs("values.items").map((v) => (
              <li key={v.title} className="border-t border-olive pt-5">
                <h3 className="font-sans text-base font-semibold">{v.title}</h3>
                <p className="mt-1 text-sm text-muted">{v.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="experience" tone="paper-2">
        <SectionHeader eyebrow="Career" title={b.get("experience.title")} text={b.get("experience.text")} />
        <div className="grid gap-14 lg:grid-cols-[1.5fr_1fr]">
          <ol className="relative border-l border-stone">
            {roles.map((e) => {
              const Icon = kindIcon[e.kind];
              return (
                <li key={e.id} className="relative pb-10 pl-10 last:pb-0">
                  <span className="absolute -left-4 top-0 flex size-8 items-center justify-center rounded-full border border-stone bg-paper">
                    <Icon className="size-3.5 text-olive-deep" aria-hidden />
                  </span>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-olive-deep">
                    {[e.start_label, e.end_label].filter(Boolean).join(" – ")}
                  </p>
                  <h3 className="mt-1 text-2xl">{e.title}</h3>
                  {(e.organization || e.location) && <p className="text-sm text-ink-3">{[e.organization, e.location].filter(Boolean).join(" · ")}</p>}
                  {e.description && <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{e.description}</p>}
                </li>
              );
            })}
          </ol>
          {credentials.length > 0 && (
            <div>
              <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.2em]">Credentials & certifications</h3>
              <ul className="mt-5 divide-y divide-stone border-y border-stone">
                {credentials.map((c) => (
                  <li key={c.id} className="flex items-start gap-4 py-4">
                    <Award className="mt-0.5 size-5 shrink-0 text-olive" aria-hidden />
                    <div>
                      <p className="font-medium">{c.title}</p>
                      <p className="text-sm text-muted">{[c.organization, c.start_label].filter(Boolean).join(" · ")}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      {photos.length > 0 && (
        <Section>
          <SectionHeader eyebrow="In the field" title="At work, in training, with teams and at events." action={{ href: "/media", label: "Media library" }} />
          <Gallery items={photos.map(toGalleryItem)} />
        </Section>
      )}

      <CtaBand
        title={b.get("cta.title")}
        text={b.get("cta.text")}
        primary={{ href: "/contact?type=consultation", label: "Book a Consultation" }}
        secondary={{ href: "/consultancy", label: "Explore services" }}
      />
    </>
  );
}
