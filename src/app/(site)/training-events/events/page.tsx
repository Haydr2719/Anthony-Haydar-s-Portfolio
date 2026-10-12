import type { Metadata } from "next";
import { BannerSlot } from "@/components/site/banners";
import { CtaBand, EventCard, PageHero } from "@/components/site/cards";
import { EmptyState, Section, SectionHeader } from "@/components/ui";
import { getBlocks, getEvents } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("events", "/training-events/events");
}

export default async function EventsPage() {
  const [b, upcoming, past] = await Promise.all([getBlocks("training-events"), getEvents({ when: "upcoming" }), getEvents({ when: "past" })]);
  return (
    <>
      <PageHero eyebrow="Events" title={b.get("events.title")} text={b.get("events.text")} />
      <Section>
        <SectionHeader title="Upcoming" />
        {upcoming.length ? (
          <div className="border-t border-stone">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <EmptyState title="New events will be announced soon" cta={{ href: "/contact?type=event_invite", label: "Invite Anthony to your event" }} />
        )}
      </Section>
      <BannerSlot placement="mid_content" page="training-events" />
      {past.length > 0 && (
        <Section tone="paper-2">
          <SectionHeader title="Past events" />
          <div className="border-t border-stone">
            {past.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </Section>
      )}
      <CtaBand
        title="Planning an event or trade show?"
        text="Live demonstrations, masterclasses, panels and brand activations."
        primary={{ href: "/contact?type=event_invite", label: "Invite Anthony to an Event" }}
      />
    </>
  );
}
