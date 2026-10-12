"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Briefcase,
  CalendarDays,
  ExternalLink,
  FileText,
  GraduationCap,
  Handshake,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageSquareQuote,
  Search,
  Settings,
  Sparkles,
  Wine,
  X,
  History,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "@/app/admin/actions";
import { Logo } from "@/components/logo";
import { LiveLeads } from "./live-leads";
import { PushToggle } from "./push-toggle";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  inbox: Inbox,
  text: FileText,
  settings: Settings,
  services: Sparkles,
  projects: Briefcase,
  drinks: Wine,
  programs: GraduationCap,
  events: CalendarDays,
  media: ImageIcon,
  banners: Megaphone,
  testimonials: MessageSquareQuote,
  partners: Handshake,
  experience: History,
  pages: Search,
};

interface NavLink {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

export function AdminNav({ links, email }: { links: NavLink[]; email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <>
      <div className="flex items-center justify-between border-b border-ink-3 bg-ink px-4 py-3 text-paper lg:hidden">
        <Logo light compact className="h-7" />
        <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Toggle admin menu" className="p-2">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      <aside className={cn("bg-ink text-paper lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col", open ? "block" : "hidden lg:flex")}>
        <div className="hidden px-5 py-6 lg:block">
          <Logo light compact className="h-10" />
          <p className="mt-3 text-xs text-paper/50">Website admin</p>
        </div>
        <nav className="scrollbar-dark flex-1 overflow-y-auto px-3 py-2">
          <ul className="space-y-0.5">
            {links.map((l) => {
              const Icon = ICONS[l.icon] ?? FileText;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      active(l.href) ? "bg-paper/10 text-paper" : "text-paper/65 hover:bg-paper/5 hover:text-paper",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="flex-1">{l.label}</span>
                    {!!l.badge && <span className="rounded-full bg-olive px-2 py-0.5 text-[0.65rem] font-semibold text-white">{l.badge}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="space-y-1 border-t border-paper/10 p-3 text-sm">
          <LiveLeads />
          <PushToggle />
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-md px-3 py-2 text-paper/65 hover:text-paper">
            <ExternalLink className="size-4" /> View website
          </Link>
          <form action={signOut}>
            <button type="submit" className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-paper/65 hover:text-paper">
              <LogOut className="size-4" /> Sign out
            </button>
          </form>
          <p className="truncate px-3 pt-1 text-xs text-paper/40">{email}</p>
        </div>
      </aside>
    </>
  );
}
