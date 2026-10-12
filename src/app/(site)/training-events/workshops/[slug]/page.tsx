import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { MediaFrame } from "@/components/media";
import { Gallery } from "@/components/media-client";
import { BannerSlot } from "@/components/site/banners";
import { ContactSection, ProgramMeta, StatusBadge } from "@/components/site/cards";
import { Badge, Button, Prose, Section, SectionHeader, toParagraphs } from "@/components/ui";
import { getMedia, getProgram, getPrograms } from "@/lib/data";
import { toGalleryItem } from "@/lib/nav";
import { PROGRAM_KINDS, labelOf } from "@/lib/options";
import { entryMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPrograms()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProgram(slug);
  return entryMetadata(p, p?.title ?? "Training", p?.summary, p?.cover_image, `/training-events/workshops/${slug}`);
}

export default async function ProgramPage({ params }: Props) {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) notFound();
  const media = await getMedia({ programId: program.id });

  const soldOut = program.event_status === "sold_out";
  const completed = program.event_status === "completed";
  const leadType = program.kind === "training" || program.kind === "corporate" ? "training" : "workshop";
  const ctaLabel = completed ? "Ask about the next session" : soldOut ? "Join the waiting list" : program.kind === "training" || program.kind === "corporate" ? "Request this training" : "Book your place";

  const jsonLd = program.start_at
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: program.title,
        startDate: program.start_at,
        endDate: program.end_at ?? undefined,
        description: program.summary ?? undefined,
        eventStatus: "https://schema.org/EventScheduled",
        location: program.venue ? { "@type": "Place", name: program.venue, address: program.city ?? undefined } : undefined,
        organizer: { "@type": "Person", name: "Anthony Haydar", url: SITE_URL },
      }
    : null;

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}
      <Section className="!pt-12 md:!pt-16">
        <Link href="/training-events/workshops" className="eyebrow hover:underline">
          ← Training & Workshops
        </Link>
        <div className="mt-8 grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
          <div className="animate-fade-up">
            <div className="mb-5 flex flex-wrap gap-2">
              <Badge tone="muted">{labelOf(PROGRAM_KINDS, program.kind)}</Badge>
              <StatusBadge status={program.event_status} />
            </div>
            <h1 className="text-5xl leading-[1.04] md:text-6xl">{program.title}</h1>
            {program.summary && <p className="mt-6 text-lg text-muted">{program.summary}</p>}
            <MediaFrame src={program.cover_image} alt={program.title} ratio="16/9" priority className="mt-10" sizes="(min-width: 1024px) 55vw, 100vw" />
            {program.description && <Prose paragraphs={toParagraphs(program.description)} className="mt-10" />}
            {program.learning_outcomes.length > 0 && (
              <div className="mt-12">
                <h2 className="text-3xl">What you will learn</h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {program.learning_outcomes.map((o) => (
                    <li key={o} className="flex items-start gap-3">
                      <Check className="mt-1 size-4 shrink-0 text-olive" aria-hidden /> {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-stone bg-white p-7">
              <ProgramMeta program={program} />
              <div className="mt-6 flex flex-col gap-3">
                {program.booking_url && !soldOut && !completed ? (
                  <Button href={program.booking_url} external>
                    Book now
                  </Button>
                ) : null}
                <Button href="#enquire" variant={program.booking_url && !soldOut && !completed ? "outline" : "primary"}>
                  {ctaLabel}
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </Section>

      {media.length > 0 && (
        <Section tone="paper-2">
          <SectionHeader title="Gallery" />
          <Gallery items={media.map(toGalleryItem)} />
        </Section>
      )}

      <BannerSlot placement="event_sponsor" page="training-events" />

      <ContactSection
        defaultType={leadType}
        defaultService={leadType === "training" ? "Training & Team Development" : "Workshop / Masterclass"}
        programId={program.id}
        eyebrow={program.title}
        title={ctaLabel}
        text="Leave your details and Anthony will confirm availability and next steps."
        submitLabel={soldOut ? "Join waiting list" : "Send request"}
      />
    </>
  );
}
