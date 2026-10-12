import type { Metadata } from "next";
import { Check } from "lucide-react";
import { MediaFrame } from "@/components/media";
import { BannerSlot } from "@/components/site/banners";
import { ContactSection, PageHero, ProgramCard } from "@/components/site/cards";
import { Button, EmptyState, Section, SectionHeader } from "@/components/ui";
import { getBlocks, getPrograms, getService } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("training", "/training-events/training");
}

export default async function TrainingPage() {
  const [b, programs, corporate, service] = await Promise.all([
    getBlocks("training-events"),
    getPrograms({ kinds: ["training"] }),
    getPrograms({ kinds: ["corporate"] }),
    getService("training-team-development"),
  ]);

  return (
    <>
      <PageHero eyebrow="Training" title={b.get("training.title")} text={b.get("training.text")}>
        <Button href="#enquire">Request Training</Button>
      </PageHero>

      <Section>
        {programs.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        ) : (
          <EmptyState title="Programs coming soon" />
        )}
      </Section>

      <Section tone="ink" id="corporate">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <p className="eyebrow mb-4">Corporate</p>
            <h2 className="text-4xl leading-tight md:text-5xl">{b.get("corporate.title")}</h2>
            <p className="mt-5 text-lg text-paper/70">{b.get("corporate.text")}</p>
            {service && (
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {service.included.map((i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-paper/85">
                    <Check className="mt-0.5 size-4 shrink-0 text-olive" aria-hidden /> {i}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-10">
              <Button href="#enquire">Plan a custom program</Button>
            </div>
          </div>
          <div className="grid gap-5">
            {corporate.length ? (
              corporate.map((p) => <ProgramCard key={p.id} program={p} />)
            ) : (
              <MediaFrame src={service?.cover_image} alt="Team training session" ratio="4/3" />
            )}
          </div>
        </div>
      </Section>

      <BannerSlot placement="mid_content" page="training-events" />

      <Section>
        <SectionHeader title="How training works" />
        <ol className="grid gap-px border border-stone bg-stone md:grid-cols-4">
          {[
            ["Assess", "A short needs assessment with managers and the team."],
            ["Design", "Modules built around your menu, equipment and standards."],
            ["Deliver", "Hands-on sessions on-site, in small groups."],
            ["Follow up", "Practical assessment, feedback and coaching."],
          ].map(([t, d], i) => (
            <li key={t} className="bg-paper p-7">
              <span className="font-serif text-3xl text-olive">{i + 1}</span>
              <h3 className="mt-4 text-xl">{t}</h3>
              <p className="mt-2 text-sm text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </Section>

      <ContactSection
        defaultType="training"
        defaultService="Training & Team Development"
        eyebrow="Request training"
        title="Tell Anthony about your team."
        text="Share the team size, roles and goals. A tailored proposal will follow."
      />
    </>
  );
}
