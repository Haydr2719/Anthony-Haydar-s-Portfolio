import type { Metadata } from "next";
import Image from "@/components/smart-image";
import {
  Building2,
  Coffee,
  Layers,
  Martini,
  Network,
  Rocket,
  Search,
  TrendingUp,
  Truck,
  Users,
  UtensilsCrossed,
  Waves,
  Wine,
} from "lucide-react";
import { MediaFrame } from "@/components/media";
import { Gallery, VideoCard } from "@/components/media-client";
import { Reveal } from "@/components/reveal";
import { Scroller } from "@/components/scroller";
import { BannerSlot } from "@/components/site/banners";
import { ContactSection, DrinkCard, ProgramCard, ProjectCard, ServiceCard } from "@/components/site/cards";
import { EventSlider } from "@/components/site/event-slider";
import { HeroScroll } from "@/components/site/hero-scroll";
import { Button, Eyebrow, Section, SectionHeader } from "@/components/ui";
import {
  getBlocks,
  getDrinks,
  getEvents,
  getMedia,
  getPartners,
  getPrograms,
  getProjects,
  getServices,
  getSettings,
  getTestimonials,
} from "@/lib/data";
import { toGalleryItem } from "@/lib/nav";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/utils";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("home", "/");
}

const methodIcons = [Search, Layers, Users, Rocket, TrendingUp];

function clientIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("hotel")) return Building2;
  if (l.includes("restaurant")) return UtensilsCrossed;
  if (l.includes("bar")) return Martini;
  if (l.includes("caf")) return Coffee;
  if (l.includes("resort")) return Waves;
  if (l.includes("brand")) return Wine;
  if (l.includes("distribut")) return Truck;
  return Network;
}

export default async function HomePage() {
  const [b, settings, services, allProjects, drinks, programs, upcoming, videos, photos, testimonials, partners] =
    await Promise.all([
      getBlocks("home"),
      getSettings(),
      getServices(),
      getProjects(),
      getDrinks({ featured: true, limit: 4 }),
      getPrograms({ featured: true, limit: 3 }),
      getEvents({ when: "upcoming" }),
      getMedia({ type: "video", featured: true, limit: 3 }),
      getMedia({ type: "photo", featured: true, limit: 6 }),
      getTestimonials({ featured: true }),
      getPartners({ home: true }),
    ]);

  // Client Projects slider: featured projects first, then the rest in their order, up to 8.
  const projects = [...allProjects.filter((p) => p.featured), ...allProjects.filter((p) => !p.featured)].slice(0, 8);

  // Homepage slideshow: every upcoming event, featured ones first, then soonest first
  // (getEvents already sorts upcoming events by start date; the sort is stable).
  const slideEvents = [...upcoming].sort((a, b) => Number(b.featured) - Number(a.featured));
  const steps = b.pairs("method.steps");
  const stats = b.pairs("about.stats");

  // Structured data for Google: the site name shown in results (WebSite) and the
  // brand logo (Organization). Social links count only when they point to a
  // profile, not just a site's homepage.
  const org = `${SITE_URL}/#organization`;
  const sameAs = [settings.instagram_url, settings.linkedin_url, settings.youtube_url, settings.tiktok_url].filter(
    (u): u is string => {
      try {
        return Boolean(u) && new URL(u!).pathname.replace(/\/+$/, "") !== "";
      } catch {
        return false;
      }
    },
  );
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: settings.site_name, publisher: { "@id": org } },
      {
        "@type": "Organization",
        "@id": org,
        name: settings.site_name,
        url: `${SITE_URL}/`,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/logo/logo-512.png`, width: 512, height: 512 },
        description: settings.default_seo_description || undefined,
        email: settings.email || undefined,
        telephone: settings.phone || undefined,
        sameAs: sameAs.length ? sameAs : undefined,
        founder: { "@type": "Person", name: "Anthony Haydar", jobTitle: settings.tagline || undefined },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      {/* 2. Hero - scroll-driven image sequence (src/components/site/hero-scroll.tsx) */}
      <HeroScroll
        eyebrow={b.get("hero.eyebrow")}
        title={b.get("hero.title")}
        text={b.get("hero.text")}
        primaryCta={{ href: "/contact?type=consultation", label: b.get("hero.primary_cta") }}
        secondaryCta={{ href: "/consultancy", label: b.get("hero.secondary_cta") }}
        phrases={b.lines("hero.phrases").length ? b.lines("hero.phrases") : undefined}
      />

      {/* 3. Expertise strip */}
      <div className="border-y border-stone bg-paper">
        <ul className="container-x flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-5 text-xs font-medium uppercase tracking-[0.22em] text-ink-3 md:gap-x-10">
          {b.lines("expertise.items").map((item, i) => (
            <li key={item} className="flex items-center gap-6 md:gap-10">
              {i > 0 && <span aria-hidden className="h-3 w-px bg-olive" />}
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* 4. Featured services */}
      <Section>
        <SectionHeader title={b.get("services.title")} text={b.get("services.text")} action={{ href: "/consultancy", label: "All services" }} />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <Reveal as="li" key={s.slug} delay={i * 80}>
              <ServiceCard service={s} />
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* 5. Ad / sponsor banner (collapses when empty) */}
      <BannerSlot placement="home_horizontal" page="home" className="!pt-0" />

      {/* 6. Methodology */}
      <section className="on-dark bg-ink py-16 text-paper md:py-20">
        <div className="container-x">
          <div className="mb-10 flex items-center gap-6">
            <Eyebrow>{b.get("method.eyebrow")}</Eyebrow>
            <span className="h-px flex-1 bg-paper/15" />
          </div>
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
            {steps.map((step, i) => {
              const Icon = methodIcons[i % methodIcons.length];
              return (
                <Reveal as="li" key={step.title} delay={i * 90} className="flex gap-4 lg:border-l lg:border-paper/15 lg:px-6 lg:first:border-l-0 lg:first:pl-0">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-paper/30 text-xs text-paper/70">
                    0{i + 1}
                  </span>
                  <div>
                    <p className="flex items-center gap-2 font-serif text-xl">
                      <Icon className="size-4 text-olive" aria-hidden />
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-paper/60">{step.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </section>

      {/* 7. Who Anthony works with */}
      <section className="border-b border-stone bg-paper py-14 md:py-16">
        <div className="container-x grid gap-8 lg:grid-cols-[260px_1fr] lg:items-center">
          <h2 className="text-3xl leading-tight md:text-4xl">{b.get("clients.title")}</h2>
          <ul className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 lg:grid-cols-8">
            {b.lines("clients.items").map((c) => {
              const Icon = clientIcon(c);
              return (
                <li key={c} className="flex flex-col items-center gap-3 px-2 text-center">
                  <Icon className="size-7 stroke-[1.3] text-ink-3" aria-hidden />
                  <span className="text-xs text-muted">{c}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 8. About preview */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr_0.8fr] lg:items-center lg:gap-14">
          <Reveal>
            <Eyebrow className="mb-4">{b.get("about.eyebrow")}</Eyebrow>
            <h2 className="text-4xl leading-[1.08] md:text-5xl">{b.get("about.title")}</h2>
            <div className="mt-6 space-y-4 text-muted">
              {b.paragraphs("about.text").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="mt-8">
              <Button href="/about">{b.get("about.cta")}</Button>
            </div>
          </Reveal>
          <Reveal delay={100}>
            {settings.about_video ? (
              <VideoCard url={settings.about_video} poster={settings.about_image} title="Anthony at work" orientation="portrait" />
            ) : (
              <MediaFrame src={settings.about_image} alt="Anthony Haydar preparing a drink" ratio="4/5" sizes="(min-width: 1024px) 33vw, 100vw" />
            )}
          </Reveal>
          <Reveal delay={200}>
            <ul className="divide-y divide-stone border-y border-stone">
              {stats.map((s) => (
                <li key={s.title} className="py-5">
                  <p className="font-serif text-3xl">{s.title}</p>
                  <p className="mt-1 text-sm text-muted">{s.text}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      {/* 9. Selected work */}
      {projects.length > 0 && (
        <Section tone="paper-2">
          <SectionHeader title={b.get("work.title")} text={b.get("work.text")} action={{ href: "/portfolio/projects", label: "All client projects" }} />
          <Reveal>
            <Scroller label="Client projects">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </Scroller>
          </Reveal>
        </Section>
      )}

      {/* 10. Drinks & concepts */}
      {drinks.length > 0 && (
        <Section>
          <SectionHeader title={b.get("drinks.title")} text={b.get("drinks.text")} action={{ href: "/portfolio/drinks", label: "All drinks" }} />
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
            {drinks.map((d, i) => (
              <Reveal key={d.id} delay={i * 70} className={i % 2 === 1 ? "lg:mt-10" : undefined}>
                <DrinkCard drink={d} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* 11. Training / workshops */}
      {programs.length > 0 && (
        <Section tone="paper-2">
          <SectionHeader
            eyebrow="Training & Workshops"
            title={b.get("training.title")}
            text={b.get("training.text")}
            action={{ href: "/training-events", label: "Training & events" }}
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <ProgramCard program={p} />
              </Reveal>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/contact?type=training">Request Training</Button>
            <Button href="/contact?type=workshop" variant="outline">
              Book a Workshop
            </Button>
          </div>
        </Section>
      )}

      {/* 12. Events / HORECA */}
      {slideEvents.length > 0 && <EventSlider events={slideEvents} eyebrow={b.get("event.eyebrow")} allHref="/training-events/events" />}

      {/* 13. Video / media */}
      <Section>
        <SectionHeader eyebrow="Media" title={b.get("media.title")} text={b.get("media.text")} action={{ href: "/media", label: "Media library" }} />
        {videos.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {videos.map((v) => (
              <VideoCard
                key={v.id}
                url={(v.video_url || v.url)!}
                poster={v.poster_url}
                title={v.title || "Video"}
                orientation={v.orientation === "portrait" ? "portrait" : "landscape"}
              />
            ))}
          </div>
        ) : photos.length > 0 ? (
          <Gallery items={photos.map(toGalleryItem)} />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {["Developing drinks", "Training teams", "Working events"].map((l) => (
              <MediaFrame key={l} alt={l} label={`${l} - video coming soon`} ratio="16/9" />
            ))}
          </div>
        )}
      </Section>

      {/* 14. Testimonials / social proof - only shown when real, approved entries exist */}
      {(testimonials.length > 0 || partners.length > 0) && (
        <Section tone="paper-2">
          {testimonials.length > 0 && (
            <>
              <SectionHeader title={b.get("testimonials.title")} />
              <Scroller label="Testimonials">
                {testimonials.map((t) => (
                  <figure key={t.id} className="flex h-full flex-col border border-stone bg-white p-6 sm:p-8">
                    <span aria-hidden className="font-serif text-5xl leading-none text-olive">“</span>
                    <blockquote className="mt-2 flex-1 font-serif text-lg leading-relaxed sm:text-xl">{t.quote}</blockquote>
                    <figcaption className="mt-6">
                      <p className="text-sm font-medium">{t.author_name}</p>
                      <p className="text-sm text-muted">{[t.author_role, t.company].filter(Boolean).join(", ")}</p>
                    </figcaption>
                  </figure>
                ))}
              </Scroller>
            </>
          )}
          {partners.length > 0 && (
            <ul className="mt-14 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 border-t border-stone pt-12">
              {partners.map((p) => (
                <li key={p.id}>
                  {p.logo ? (
                    <Image src={p.logo} alt={p.name} width={140} height={56} className="h-12 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
                  ) : (
                    <span className="font-serif text-xl text-ink-3">{p.name}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {/* 15. Contact quick form */}
      <ContactSection compact />
    </>
  );
}
