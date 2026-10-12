import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, Plus } from "lucide-react";
import { MediaFrame } from "@/components/media";
import { VideoCard } from "@/components/media-client";
import { Reveal } from "@/components/reveal";
import { BannerSlot } from "@/components/site/banners";
import { ContactSection, ProjectCard, ServiceCard } from "@/components/site/cards";
import { Button, Eyebrow, Section, SectionHeader } from "@/components/ui";
import { getProjects, getService, getServices } from "@/lib/data";
import { entryMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await getService(slug);
  return entryMetadata(s, s?.title ?? "Consultancy", s?.summary, s?.cover_image, `/consultancy/${slug}`);
}

function leadTypeFor(slug: string) {
  if (slug.includes("training")) return "training";
  if (slug.includes("brand")) return "partnership";
  return "consultation";
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  const [projects, all] = await Promise.all([getProjects({ serviceSlug: slug, limit: 3 }), getServices()]);
  const others = all.filter((s) => s.slug !== slug);
  const leadType = leadTypeFor(slug);

  const faqJsonLd = service.faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: service.faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }
    : null;

  return (
    <>
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />}

      <section className="on-dark relative overflow-hidden bg-ink text-paper">
        <MediaFrame src={service.cover_image} alt="" ratio="fill" className="!absolute inset-0 opacity-40" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        <div className="container-x relative py-24 md:py-36">
          <Eyebrow className="mb-5">Consultancy</Eyebrow>
          <h1 className="max-w-3xl text-5xl leading-[1.04] md:text-7xl animate-fade-up">{service.title}</h1>
          {service.summary && <p className="mt-6 max-w-2xl text-lg text-paper/75">{service.summary}</p>}
          <div className="mt-9 flex flex-wrap gap-3">
            <Button href="#enquire">{service.cta_label || "Book a Consultation"}</Button>
            <Button href="/portfolio" variant="outline-light" arrow={false}>
              See related work
            </Button>
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">
          {service.problem && (
            <Reveal>
              <Eyebrow className="mb-4">The problem it solves</Eyebrow>
              <p className="font-serif text-2xl leading-snug md:text-3xl">{service.problem}</p>
            </Reveal>
          )}
          {service.audience && (
            <Reveal delay={100}>
              <Eyebrow className="mb-4">Who it is for</Eyebrow>
              <p className="text-lg leading-relaxed text-ink-3">{service.audience}</p>
            </Reveal>
          )}
        </div>
      </Section>

      <Section tone="paper-2">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-24">
          <div>
            <SectionHeader title="What's included" className="!mb-8" />
            <ul className="divide-y divide-stone border-y border-stone">
              {service.included.map((item) => (
                <li key={item} className="flex items-center gap-4 py-4">
                  <Check className="size-4 shrink-0 text-olive" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-12">
            {service.approach && (
              <div>
                <h2 className="text-3xl md:text-4xl">How Anthony works</h2>
                <p className="mt-5 text-lg leading-relaxed text-ink-3">{service.approach}</p>
              </div>
            )}
            {service.deliverables.length > 0 && (
              <div>
                <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.2em]">Possible deliverables</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {service.deliverables.map((d) => (
                    <li key={d} className="border border-stone bg-white px-4 py-2 text-sm">
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {service.cover_video && <VideoCard url={service.cover_video} title={service.title} />}
          </div>
        </div>
      </Section>

      {projects.length > 0 && (
        <Section>
          <SectionHeader eyebrow="Relevant work" title="Selected examples" action={{ href: "/portfolio/projects", label: "All client projects" }} />
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </Section>
      )}

      <BannerSlot placement="mid_content" page="consultancy" />

      {service.faqs.length > 0 && (
        <Section tone={projects.length ? "paper-2" : "paper"}>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
            <h2 className="text-4xl md:text-5xl">Frequently asked questions</h2>
            <div className="divide-y divide-stone border-y border-stone">
              {service.faqs.map((f) => (
                <details key={f.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-serif text-xl [&::-webkit-details-marker]:hidden">
                    {f.question}
                    <Plus className="size-5 shrink-0 text-olive transition-transform group-open:rotate-45" aria-hidden />
                  </summary>
                  <p className="mt-3 max-w-2xl leading-relaxed text-muted">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </Section>
      )}

      <ContactSection
        defaultType={leadType}
        defaultService={service.title}
        eyebrow={service.title}
        title={service.cta_label || "Let's talk about your project."}
        text="Share a few details about your business and goals. Prices are tailored to each engagement - Anthony will come back to you with a proposal."
      />

      {others.length > 0 && (
        <Section>
          <SectionHeader title="Other services" />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((s) => (
              <li key={s.slug}>
                <ServiceCard service={s} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
