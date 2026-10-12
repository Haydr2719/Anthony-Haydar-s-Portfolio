import type { Metadata } from "next";
import { Filterable } from "@/components/filterable";
import { BannerSlot } from "@/components/site/banners";
import { CtaBand, DrinkCard, PageHero } from "@/components/site/cards";
import { EmptyState, Section } from "@/components/ui";
import { getBlocks, getDrinks } from "@/lib/data";
import { DRINK_CATEGORIES } from "@/lib/options";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("portfolio-drinks", "/portfolio/drinks");
}

export default async function DrinksPage() {
  const [b, drinks] = await Promise.all([getBlocks("portfolio"), getDrinks()]);
  return (
    <>
      <PageHero eyebrow="Portfolio" title={b.get("drinks.title")} text={b.get("drinks.text")} />
      <Section>
        {drinks.length ? (
          <Filterable
            options={[...DRINK_CATEGORIES]}
            itemCategories={drinks.map((d) => d.category)}
            className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4"
          >
            {drinks.map((d) => (
              <DrinkCard key={d.id} drink={d} />
            ))}
          </Filterable>
        ) : (
          <EmptyState title="Drinks coming soon" />
        )}
      </Section>
      <BannerSlot placement="mid_content" page="portfolio" />
      <CtaBand
        title="Need a beverage concept that sells?"
        primary={{ href: "/consultancy/beverage-consulting", label: "Beverage Consulting" }}
        secondary={{ href: "/contact?type=consultation", label: "Book a Consultation" }}
      />
    </>
  );
}
