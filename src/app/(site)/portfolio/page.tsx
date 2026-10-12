import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { Scroller } from "@/components/scroller";
import { BannerSlot } from "@/components/site/banners";
import { CtaBand, DrinkCard, PageHero, ProjectCard } from "@/components/site/cards";
import { EmptyState, Section, SectionHeader } from "@/components/ui";
import { getBlocks, getDrinks, getProjects } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("portfolio", "/portfolio");
}

export default async function PortfolioPage() {
  const [b, projects, drinks, collabs] = await Promise.all([
    getBlocks("portfolio"),
    getProjects({ exclude: "brand_collaborations", limit: 8 }),
    getDrinks({ limit: 8 }),
    getProjects({ category: "brand_collaborations", limit: 3 }),
  ]);

  return (
    <>
      <PageHero eyebrow="Portfolio" title={b.get("intro.title")} text={b.get("intro.text")} />

      <Section>
        <SectionHeader title={b.get("projects.title")} text={b.get("projects.text")} action={{ href: "/portfolio/projects", label: "All client projects" }} />
        {projects.length ? (
          <Reveal>
            <Scroller label="Client projects">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </Scroller>
          </Reveal>
        ) : (
          <EmptyState title="Projects coming soon" />
        )}
      </Section>

      {drinks.length > 0 && (
        <Section tone="paper-2">
          <SectionHeader title={b.get("drinks.title")} text={b.get("drinks.text")} action={{ href: "/portfolio/drinks", label: "All drinks" }} />
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
            {drinks.map((d) => (
              <DrinkCard key={d.id} drink={d} />
            ))}
          </div>
        </Section>
      )}

      <BannerSlot placement="mid_content" page="portfolio" />

      {collabs.length > 0 && (
        <Section>
          <SectionHeader title={b.get("collaborations.title")} text={b.get("collaborations.text")} action={{ href: "/portfolio/collaborations", label: "All collaborations" }} />
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {collabs.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </Section>
      )}

      <CtaBand
        title="Have a project in mind?"
        text="From a single menu to a full opening - let's discuss what you need."
        primary={{ href: "/contact?type=consultation", label: "Book a Consultation" }}
        secondary={{ href: "/contact?type=partnership", label: "Discuss a Brand Partnership" }}
      />
    </>
  );
}
