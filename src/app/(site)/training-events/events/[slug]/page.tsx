import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Store } from "lucide-react";
import { MediaFrame } from "@/components/media";
import { Gallery, VideoCard } from "@/components/media-client";
import { BannerSlot } from "@/components/site/banners";
import { ContactSection, ScheduleList, ServiceCard, StatusBadge } from "@/components/site/cards";
import { Button, Eyebrow, Prose, Section, SectionHeader, toParagraphs } from "@/components/ui";
import { getEvent, getEvents, getMedia, getServices, isPastEvent } from "@/lib/data";
import { toGalleryItem } from "@/lib/nav";
import { EVENT_TYPES, labelOf } from "@/lib/options";
import { entryMetadata } from "@/lib/seo";
import { formatDateRange } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getEvents()).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEvent(slug);
  return entryMetadata(e, e?.title ?? "Event", e?.summary, e?.cover_image, `/training-events/events/${slug}`);
}

/**
 * Event page. When "Landing page" is ticked in the CMS (e.g. HORECA) it becomes a
 * mobile-first QR landing page: meeting CTA first, booth details, schedule,
 * services and the meeting form.
 */
export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const [media, services] = await Promise.all([getMedia({ eventId: event.id }), getServices()]);
  const past = isPastEvent(event);
  const cta = event.meeting_cta_label || "Book a Meeting";
  const where = [event.venue, event.city, event.country].filter(Boolean).join(", ");

  return (
    <>
      <section className="on-dark relative overflow-hidden bg-ink text-paper">
        <MediaFrame src={event.cover_image} alt="" ratio="fill" className="!absolute inset-0 opacity-40" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40 md:bg-gradient-to-r" />
        <div className="container-x relative py-16 md:py-28">
          <Link href="/training-events/events" className="eyebrow hover:underline">
            ← Events
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <StatusBadge status={event.event_status} />
            <span className="text-xs uppercase tracking-[0.2em] text-paper/60">{labelOf(EVENT_TYPES, event.event_type)}</span>
          </div>
          <h1 className="mt-5 max-w-3xl text-[2.7rem] leading-[1.04] md:text-7xl animate-fade-up">{event.title}</h1>
          {event.summary && <p className="mt-5 max-w-2xl text-lg text-paper/75">{event.summary}</p>}
          <ul className="mt-8 grid gap-3 text-sm text-paper/85 sm:flex sm:flex-wrap sm:gap-8">
            <li className="flex items-center gap-2">
              <CalendarDays className="size-4 text-olive" aria-hidden /> {formatDateRange(event.start_at, event.end_at)}
            </li>
            {where && (
              <li className="flex items-center gap-2">
                <MapPin className="size-4 text-olive" aria-hidden /> {where}
              </li>
            )}
            {event.booth && (
              <li className="flex items-center gap-2">
                <Store className="size-4 text-olive" aria-hidden /> {event.booth}
              </li>
            )}
          </ul>
          {!past && (
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button href="#book">{cta}</Button>
              {event.external_url && (
                <Button href={event.external_url} variant="outline-light" external arrow={false}>
                  Event website
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      <BannerSlot placement="event_sponsor" eventId={event.id} page="training-events" />

      {(event.description || event.schedule.length > 0) && (
        <Section>
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            {event.description && (
              <div>
                <Eyebrow className="mb-4">About the event</Eyebrow>
                <Prose paragraphs={toParagraphs(event.description)} />
                {event.cover_video && <VideoCard url={event.cover_video} title={event.title} className="mt-10" />}
              </div>
            )}
            {event.schedule.length > 0 && (
              <div>
                <h2 className="mb-6 text-3xl md:text-4xl">{past ? "Programme" : "Anthony's schedule"}</h2>
                <ScheduleList event={event} />
              </div>
            )}
          </div>
        </Section>
      )}

      {event.is_landing && !past && (
        <Section tone="paper-2">
          <SectionHeader eyebrow="Let's talk at the show" title="What we can discuss" action={{ href: "/consultancy", label: "All services" }} />
          <ul className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4 [&_h3]:text-lg md:[&_h3]:text-2xl">
            {services.map((s) => (
              <li key={s.slug}>
                <ServiceCard service={s} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {media.length > 0 && (
        <Section>
          <SectionHeader title={past ? "Event gallery" : "Gallery"} />
          <Gallery items={media.map(toGalleryItem)} />
        </Section>
      )}

      {past ? (
        <ContactSection
          id="book"
          defaultType="event_invite"
          eyebrow="Events"
          title="Invite Anthony to your next event."
          text="Live demonstrations, masterclasses, panels and brand activations."
        />
      ) : (
        <ContactSection
          id="book"
          defaultType="trade_meeting"
          eventId={event.id}
          eyebrow={event.title}
          title={cta}
          text={`Request a meeting${event.booth ? ` at ${event.booth}` : ""} to discuss beverage programs, training, operations or brand activation.`}
          submitLabel="Request meeting"
          compact={event.is_landing}
        />
      )}
    </>
  );
}
