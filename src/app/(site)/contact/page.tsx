import type { Metadata } from "next";
import { ArrowUpRight, CalendarCheck, Mail, MapPin, Phone } from "lucide-react";
import { WhatsappIcon } from "@/components/brand-icons";
import { ContactPanel } from "@/components/site/contact-panel";
import { SocialLinks } from "@/components/site/footer";
import { Eyebrow } from "@/components/ui";
import { getBlocks, getEvent, getServices, getSettings } from "@/lib/data";
import { LEAD_TYPES } from "@/lib/options";
import { pageMetadata } from "@/lib/seo";
import { whatsappLink } from "@/lib/utils";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("contact", "/contact");
}

type Props = { searchParams: Promise<{ type?: string; service?: string; event?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const sp = await searchParams;
  const [b, settings, services, event] = await Promise.all([
    getBlocks("contact"),
    getSettings(),
    getServices(),
    sp.event ? getEvent(sp.event) : Promise.resolve(undefined),
  ]);
  const type = LEAD_TYPES.some((t) => t.value === sp.type) ? sp.type! : "consultation";
  const wa = whatsappLink(settings.whatsapp, "Hello Anthony, I'd like to discuss a project.");

  return (
    <section className="bg-paper py-14 md:py-24">
      <ContactPanel
        initialType={type}
        intro={
          <>
            <Eyebrow className="mb-5">{b.get("intro.eyebrow")}</Eyebrow>
            <h1 className="text-[2.6rem] leading-[1.04] md:text-6xl">{b.get("intro.title")}</h1>
            <p className="mt-6 text-lg leading-relaxed text-muted">{b.get("intro.text")}</p>

            <ul className="mt-10 space-y-4">
              {settings.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className="flex items-center gap-4 hover:text-olive-deep">
                    <Mail className="size-5 text-olive" aria-hidden /> {settings.email}
                  </a>
                </li>
              )}
              {settings.phone && (
                <li>
                  <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="flex items-center gap-4 hover:text-olive-deep">
                    <Phone className="size-5 text-olive" aria-hidden /> {settings.phone}
                  </a>
                </li>
              )}
              {wa && (
                <li>
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:text-olive-deep">
                    <WhatsappIcon className="size-5 text-olive" /> Message on WhatsApp
                  </a>
                </li>
              )}
              {settings.booking_url && (
                <li>
                  <a href={settings.booking_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:text-olive-deep">
                    <CalendarCheck className="size-5 text-olive" aria-hidden /> Book a call directly <ArrowUpRight className="size-4" aria-hidden />
                  </a>
                </li>
              )}
              {settings.location && (
                <li className="flex items-center gap-4 text-ink-3">
                  <MapPin className="size-5 text-olive" aria-hidden /> {settings.location}
                </li>
              )}
            </ul>
            <SocialLinks settings={settings} className="mt-8" />
          </>
        }
        notice={event && <p className="mb-6 bg-paper-2 px-4 py-3 text-sm">Meeting request for <strong>{event.title}</strong></p>}
        form={{
          services: services.map((s) => s.title),
          defaultService: services.find((s) => s.slug === sp.service)?.title,
          eventId: event?.id,
          consentText: b.get("consent.text"),
          successTitle: b.get("success.title"),
          successText: b.get("success.text"),
        }}
      />
    </section>
  );
}
