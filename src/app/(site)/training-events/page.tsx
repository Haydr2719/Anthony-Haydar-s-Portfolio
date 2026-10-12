import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { BannerSlot } from "@/components/site/banners";
import { CtaBand, EventCard, PageHero, ProgramCard } from "@/components/site/cards";
import { Button, Section, SectionHeader } from "@/components/ui";
import { getBlocks, getEvents, getPrograms, isPastEvent } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("training-events", "/training-events");
}

export default async function TrainingEventsPage() {
  const [b, training, workshops, upcoming, past] = await Promise.all([
    getBlocks("training-events"),
    getPrograms({ kinds: ["training", "corporate"] }),
    getPrograms({ kinds: ["workshop", "masterclass"] }),
    getEvents({ when: "upcoming" }),
    getEvents({ when: "past", limit: 3 }),
  ]);
  const openWorkshops = workshops.filter((w) => !isPastEvent({ event_status: w.event_status ?? "upcoming", start_at: w.start_at, end_at: w.end_at }));

  return (
    <>
      <PageHero eyebrow="Training & Events" title={b.get("intro.title")} text={b.get("intro.text")}>
        <Button href="/contact?type=training">Request Training</Button>
        <Button href="/contact?type=event_invite" variant="outline">
          Invite Anthony to an Event
        </Button>
      </PageHero>

      <Section>
        <SectionHeader title={b.get("training.title")} text={b.get("training.text")} action={{ href: "/training-events/training", label: "All programs" }} />
        {training.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {training.slice(0, 3).map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <ProgramCard program={p} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="text-muted">Training programs are tailored to each team. Get in touch to discuss what your team needs.</p>
        )}
      </Section>

      <Section tone="paper-2">
        <SectionHeader title={b.get("workshops.title")} text={b.get("workshops.text")} action={{ href: "/training-events/workshops", label: "All workshops" }} />
        {openWorkshops.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {openWorkshops.slice(0, 3).map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        ) : (
          <p className="text-muted">No sessions are scheduled right now. Get in touch to book a private workshop or masterclass.</p>
        )}
        <div className="mt-10">
          <Button href="/contact?type=workshop" variant="outline">
            Book a Workshop / Masterclass
          </Button>
        </div>
      </Section>

      <BannerSlot placement="mid_content" page="training-events" />

      <Section>
        <SectionHeader title={b.get("events.title")} text={b.get("events.text")} action={{ href: "/training-events/events", label: "All events" }} />
        {upcoming.length ? (
          <div className="border-t border-stone">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <p className="text-muted">New events will be announced soon.</p>
        )}
        {past.length > 0 && (
          <>
            <h3 className="mt-16 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-muted">Past events</h3>
            <div className="mt-2 border-t border-stone">
              {past.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </>
        )}
      </Section>

      <CtaBand
        title="Bring Anthony to your team or event."
        primary={{ href: "/contact?type=training", label: "Request Training" }}
        secondary={{ href: "/contact?type=event_invite", label: "Invite Anthony to an Event" }}
      />
    </>
  );
}
