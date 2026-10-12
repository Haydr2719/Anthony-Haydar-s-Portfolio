import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { InstagramIcon, LinkedinIcon, TiktokIcon, WhatsappIcon, YoutubeIcon } from "@/components/brand-icons";
import { Logo } from "@/components/logo";
import { CookieSettingsButton } from "@/components/site/consent";
import type { NavItem } from "@/lib/nav";
import type { Service, SiteSettings } from "@/lib/types";
import { whatsappLink } from "@/lib/utils";

export function SocialLinks({ settings, className = "" }: { settings: SiteSettings; className?: string }) {
  const links = [
    { href: settings.instagram_url, label: "Instagram", Icon: InstagramIcon },
    { href: settings.linkedin_url, label: "LinkedIn", Icon: LinkedinIcon },
    { href: settings.youtube_url, label: "YouTube", Icon: YoutubeIcon },
    { href: settings.tiktok_url, label: "TikTok", Icon: TiktokIcon },
  ].filter((l) => l.href);
  if (!links.length) return null;
  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {links.map(({ href, label, Icon }) => (
        <li key={label}>
          <a
            href={href!}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex size-10 items-center justify-center border border-current/25 transition-colors hover:border-olive hover:bg-olive hover:text-white"
          >
            <Icon className="size-4" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Footer({ nav, services, settings }: { nav: NavItem[]; services: Service[]; settings: SiteSettings }) {
  const wa = whatsappLink(settings.whatsapp);
  return (
    <footer className="on-dark bg-ink text-paper">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 md:py-20 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Link href="/" aria-label="Anthony Haydar - home">
            <Logo light stacked className="w-44" />
          </Link>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-paper/60">
            Strategy. People. Beverages. Better hospitality - for hospitality businesses and beverage brands.
          </p>
          <SocialLinks settings={settings} className="mt-6" />
        </div>

        <nav aria-label="Footer">
          <p className="eyebrow mb-5">Explore</p>
          <ul className="space-y-3 text-sm text-paper/75">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-paper">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow mb-5">Consultancy</p>
          <ul className="space-y-3 text-sm text-paper/75">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/consultancy/${s.slug}`} className="hover:text-paper">
                  {s.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/training-events/training" className="hover:text-paper">
                Corporate Training
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-5">Get in touch</p>
          <ul className="space-y-3 text-sm text-paper/75">
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-3 hover:text-paper">
                  <Mail className="size-4 text-olive" aria-hidden /> {settings.email}
                </a>
              </li>
            )}
            {settings.phone && (
              <li>
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-3 hover:text-paper">
                  <Phone className="size-4 text-olive" aria-hidden /> {settings.phone}
                </a>
              </li>
            )}
            {wa && (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 hover:text-paper">
                  <WhatsappIcon className="size-4 text-olive" /> WhatsApp
                </a>
              </li>
            )}
            {settings.location && (
              <li className="inline-flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-olive" aria-hidden /> {settings.location}
              </li>
            )}
          </ul>
          <Link
            href="/contact?type=consultation"
            className="mt-7 inline-flex min-h-11 items-center rounded-full bg-olive-deep px-5 text-sm font-medium text-white transition-colors hover:bg-paper hover:text-ink"
          >
            Book a Consultation
          </Link>
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="container-x flex flex-col gap-4 py-6 text-xs text-paper/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.site_name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <li>
              <Link href="/privacy" className="hover:text-paper">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-paper">Terms</Link>
            </li>
            <li>
              <Link href="/cookies" className="hover:text-paper">Cookie Policy</Link>
            </li>
            <li>
              <CookieSettingsButton />
            </li>
            {settings.show_build_credit && <li>Website by Build by Joe</li>}
          </ul>
        </div>
      </div>
    </footer>
  );
}
