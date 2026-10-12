"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import type { NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Header({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuTop, setMenuTop] = useState<number | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Where the mobile menu starts: the header's bottom edge (the announcement
  // bar above the header can change it), kept in sync on resize.
  useEffect(() => {
    if (!mobileOpen) {
      setMenuTop(null);
      return;
    }
    const measure = () => setMenuTop(headerRef.current?.getBoundingClientRect().bottom ?? 80);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [mobileOpen]);

  // Close the mobile menu with the Escape key
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-40 border-b bg-paper/95 backdrop-blur transition-[border-color,box-shadow] duration-300",
        scrolled ? "border-stone shadow-[0_8px_30px_-20px_rgba(31,31,29,0.35)]" : "border-transparent",
      )}
    >
      <div className="container-x flex h-20 items-center justify-between gap-6">
        <Link href="/" aria-label="Anthony Haydar - home" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center">
            {nav.map((item) => (
              <li
                key={item.href}
                className="relative"
                onMouseEnter={() => item.children && setOpenMenu(item.href)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    className={cn(
                      "relative whitespace-nowrap px-2.5 py-2 text-[0.8rem] font-medium tracking-wide transition-colors hover:text-olive-deep 2xl:px-3",
                      isActive(item.href) && "text-ink after:absolute after:inset-x-3 after:-bottom-0.5 after:h-px after:bg-olive",
                    )}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <button
                      type="button"
                      className="-ml-2 p-1 text-muted hover:text-ink"
                      aria-expanded={openMenu === item.href}
                      aria-label={`${item.label} menu`}
                      onClick={() => setOpenMenu((m) => (m === item.href ? null : item.href))}
                    >
                      <ChevronDown className={cn("size-3.5 transition-transform", openMenu === item.href && "rotate-180")} />
                    </button>
                  )}
                </div>
                {item.children && openMenu === item.href && (
                  <div className="absolute left-0 top-full pt-3">
                    <ul className="min-w-64 border border-stone bg-paper p-2 shadow-[0_20px_50px_-25px_rgba(31,31,29,0.45)] animate-fade-up">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="block px-4 py-2.5 text-sm text-ink-3 transition-colors hover:bg-paper-2 hover:text-ink"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/contact?type=consultation"
            className="group inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full bg-olive-deep px-3.5 text-[0.8rem] font-medium tracking-wide text-white transition-colors hover:bg-ink sm:px-5"
          >
            <span className="sm:hidden">Book</span>
            <span className="hidden sm:inline">Book a Consultation</span>
            <ArrowRight className="hidden size-4 transition-transform group-hover:translate-x-1 sm:block" aria-hidden />
          </Link>
          <button
            type="button"
            className="p-2 xl:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Rendered into <body> (portal): the header's backdrop-blur makes it the
          containing block for position:fixed children, which collapsed this menu
          to the header's height. It's placed just below the header's real bottom edge. */}
      {mobileOpen &&
        menuTop !== null &&
        createPortal(
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto overscroll-contain bg-paper xl:hidden"
          style={{ top: menuTop }}
        >
          <nav aria-label="Mobile" className="container-x flex min-h-full flex-col py-6">
            <ul className="divide-y divide-stone border-y border-stone">
              {nav.map((item) => (
                <MobileItem key={item.href} item={item} active={isActive(item.href)} />
              ))}
            </ul>
            <div className="mt-8 pb-8">
              <Link
                href="/contact?type=consultation"
                className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-olive-deep text-base font-medium text-white"
              >
                Book a Consultation <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </nav>
        </div>,
          document.body,
        )}
    </header>
  );
}

function MobileItem({ item, active }: { item: NavItem; active: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <div className="flex items-center justify-between">
        <Link href={item.href} className={cn("flex-1 py-4 font-serif text-2xl", active && "text-olive-deep")}>
          {item.label}
        </Link>
        {item.children && (
          <button
            type="button"
            className="p-3"
            aria-expanded={open}
            aria-label={`Show ${item.label} pages`}
            onClick={() => setOpen((o) => !o)}
          >
            <ChevronDown className={cn("size-5 transition-transform", open && "rotate-180")} />
          </button>
        )}
      </div>
      {item.children && open && (
        <ul className="pb-4 pl-1">
          {item.children.map((c) => (
            <li key={c.href}>
              <Link href={c.href} className="block py-2.5 text-base text-ink-3">
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
