import { WhatsappIcon } from "@/components/brand-icons";
import { BannerSlot, TopBar } from "@/components/site/banners";
import { ConsentManager } from "@/components/site/consent";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { getServices, getSettings } from "@/lib/data";
import { NAV, type NavItem } from "@/lib/nav";
import { whatsappLink } from "@/lib/utils";

// Public pages are static and refreshed every minute (scheduled publishing,
// banner start/end dates). CMS saves also refresh them immediately.
export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);

  // Consultancy dropdown follows the services managed in the CMS.
  const nav: NavItem[] = NAV.map((item) =>
    item.href === "/consultancy"
      ? { ...item, children: services.map((s) => ({ label: s.title, href: `/consultancy/${s.slug}` })) }
      : item,
  );

  const wa = settings.show_whatsapp_button
    ? whatsappLink(settings.whatsapp, "Hello Anthony, I found you through your website.")
    : null;

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <TopBar />
      <Header nav={nav} />
      <main id="main">{children}</main>
      <BannerSlot placement="footer_partner" />
      <Footer nav={nav} services={services} settings={settings} />
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Anthony on WhatsApp"
          className="fixed bottom-5 right-5 z-30 flex size-12 items-center justify-center rounded-full border border-paper/20 bg-ink text-paper shadow-lg transition-colors hover:bg-olive-deep"
        >
          <WhatsappIcon className="size-5" />
        </a>
      )}
      <ConsentManager />
    </>
  );
}
