import type { Metadata } from "next";
import { BannerSlot } from "@/components/site/banners";
import { ContactSection, PageHero, ProgramCard } from "@/components/site/cards";
import { Button, EmptyState, Section, SectionHeader } from "@/components/ui";
import { getBlocks, getPrograms, isPastEvent } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("workshops", "/training-events/workshops");
}

export default async function WorkshopsPage() {
  const [b, workshops] = await Promise.all([getBlocks("training-events"), getPrograms({ kinds: ["workshop", "masterclass"] })]);
  const isPast = (w: (typeof workshops)[number]) =>
    isPastEvent({ event_status: w.event_status ?? "upcoming", start_at: w.start_at, end_at: w.end_at });
  const upcoming = workshops.filter((w) => !isPast(w));
  const past = workshops.filter(isPast);

  return (
    <>
      <PageHero eyebrow="Workshops & Masterclasses" title={b.get("workshops.title")} text={b.get("workshops.text")}>
        <Button href="#enquire">Book a Workshop</Button>
      </PageHero>
      <Section>
        <SectionHeader title="Upcoming sessions" />
        {upcoming.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No sessions scheduled right now"
            text="Workshops and masterclasses can also be booked privately for your team or venue."
            cta={{ href: "#enquire", label: "Enquire about a private session" }}
          />
        )}
      </Section>
      <BannerSlot placement="mid_content" page="training-events" />
      {past.length > 0 && (
        <Section tone="paper-2">
          <SectionHeader title="Past workshops" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {past.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        </Section>
      )}
      <ContactSection
        defaultType="workshop"
        eyebrow="Book a workshop"
        title="Host a workshop or masterclass."
        text="For your team, your venue or your brand's trade customers."
      />
    </>
  );
}
