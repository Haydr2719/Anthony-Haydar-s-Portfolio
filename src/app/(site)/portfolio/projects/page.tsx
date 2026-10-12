import type { Metadata } from "next";
import { Filterable } from "@/components/filterable";
import { BannerSlot } from "@/components/site/banners";
import { CtaBand, PageHero, ProjectCard } from "@/components/site/cards";
import { EmptyState, Section } from "@/components/ui";
import { getBlocks, getProjects } from "@/lib/data";
import { PROJECT_CATEGORIES } from "@/lib/options";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("portfolio-projects", "/portfolio/projects");
}

export default async function ProjectsPage() {
  const [b, projects] = await Promise.all([getBlocks("portfolio"), getProjects()]);
  return (
    <>
      <PageHero eyebrow="Portfolio" title={b.get("projects.title")} text={b.get("projects.text")} />
      <Section>
        {projects.length ? (
          <Filterable
            options={[...PROJECT_CATEGORIES]}
            itemCategories={projects.map((p) => p.category)}
            className="grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-3"
          >
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </Filterable>
        ) : (
          <EmptyState title="Projects coming soon" text="New work is being added - check back shortly." />
        )}
      </Section>
      <BannerSlot placement="mid_content" page="portfolio" />
      <CtaBand
        title="Let's create your next success story."
        primary={{ href: "/contact?type=consultation", label: "Book a Consultation" }}
      />
    </>
  );
}
