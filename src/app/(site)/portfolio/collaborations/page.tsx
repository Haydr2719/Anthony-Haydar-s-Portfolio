import type { Metadata } from "next";
import Image from "@/components/smart-image";
import { BannerSlot } from "@/components/site/banners";
import { CtaBand, DrinkCard, PageHero, ProjectCard } from "@/components/site/cards";
import { EmptyState, Section, SectionHeader } from "@/components/ui";
import { getBlocks, getDrinks, getPartners, getProjects } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("portfolio-collaborations", "/portfolio/collaborations");
}

export default async function CollaborationsPage() {
  const [b, projects, drinks, partners] = await Promise.all([
    getBlocks("portfolio"),
    getProjects({ category: "brand_collaborations" }),
    getDrinks({ category: "brand_collaboration" }),
    getPartners(),
  ]);
  const brands = partners.filter((p) => p.kind !== "client");

  return (
    <>
      <PageHero eyebrow="Portfolio" title={b.get("collaborations.title")} text={b.get("collaborations.text")} />
      <Section>
        {projects.length ? (
          <div className="grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <EmptyState title="Collaborations coming soon" />
        )}
      </Section>

      {drinks.length > 0 && (
        <Section tone="paper-2">
          <SectionHeader title="Brand signature serves" />
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
            {drinks.map((d) => (
              <DrinkCard key={d.id} drink={d} />
            ))}
          </div>
        </Section>
      )}

      {brands.length > 0 && (
        <Section>
          <SectionHeader title="Brands Anthony has worked with" />
          <ul className="grid grid-cols-2 gap-px border border-stone bg-stone sm:grid-cols-3 lg:grid-cols-5">
            {brands.map((p) => (
              <li key={p.id} className="flex h-32 items-center justify-center bg-paper p-6">
                {p.logo ? (
                  <Image src={p.logo} alt={p.name} width={160} height={64} className="max-h-14 w-auto object-contain grayscale" />
                ) : (
                  <span className="text-center font-serif text-lg">{p.name}</span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <BannerSlot placement="mid_content" page="portfolio" />
      <CtaBand
        title="Launching a product or activating a brand?"
        text="Brand representation, demonstrations, trade events and on-trade education."
        primary={{ href: "/contact?type=partnership", label: "Discuss a Brand Partnership" }}
        secondary={{ href: "/consultancy/brand-commercial-support", label: "Brand & Commercial Support" }}
      />
    </>
  );
}
