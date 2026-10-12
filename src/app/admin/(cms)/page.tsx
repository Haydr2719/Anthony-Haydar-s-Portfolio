import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdminHeader, Card } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/cms/auth";
import { COLLECTIONS } from "@/lib/cms/collections";
import { LEAD_TYPES, labelOf } from "@/lib/options";
import type { Lead } from "@/lib/types";

const dateTime = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

export default async function Dashboard() {
  const { supabase } = await requireAdmin();
  const since30 = new Date(Date.now() - 30 * 86400000).toISOString();

  const [newLeads, monthLeads, recent, clicks, liveBanners, counts] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", since30),
    supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(6),
    supabase.from("banner_clicks").select("id", { count: "exact", head: true }).gte("created_at", since30),
    supabase.from("banners").select("id", { count: "exact", head: true }).eq("is_active", true),
    Promise.all(
      COLLECTIONS.filter((c) => c.publishable).map(async (c) => {
        const { count } = await supabase.from(c.table).select("*", { count: "exact", head: true }).eq("status", "published");
        return { key: c.key, label: c.label, count: count ?? 0 };
      }),
    ),
  ]);

  const stats = [
    { label: "New enquiries", value: newLeads.count ?? 0, href: "/admin/leads?status=new" },
    { label: "Enquiries (30 days)", value: monthLeads.count ?? 0, href: "/admin/leads" },
    { label: "Active banners", value: liveBanners.count ?? 0, href: "/admin/banners" },
    { label: "Banner clicks (30 days)", value: clicks.count ?? 0, href: "/admin/banners" },
  ];

  return (
    <>
      <AdminHeader title="Dashboard" description="An overview of enquiries and website content." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="p-5 transition-colors hover:border-ink">
              <p className="text-sm text-muted">{s.label}</p>
              <p className="mt-2 font-serif text-4xl">{s.value}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="flex items-center justify-between border-b border-stone px-5 py-4">
            <h2 className="font-serif text-xl">Latest enquiries</h2>
            <Link href="/admin/leads" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
              All <ArrowRight className="size-4" />
            </Link>
          </div>
          {(recent.data ?? []).length === 0 ? (
            <p className="p-8 text-center text-sm text-muted">No enquiries yet.</p>
          ) : (
            <ul className="divide-y divide-stone">
              {((recent.data ?? []) as Lead[]).map((l) => (
                <li key={l.id}>
                  <Link href={`/admin/leads/${l.id}`} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-paper/60">
                    <span>
                      <span className="font-medium">{l.name}</span>
                      <span className="block text-xs text-muted">
                        {labelOf(LEAD_TYPES, l.lead_type)}
                        {l.company ? ` · ${l.company}` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted">
                      {l.status === "new" && <span className="mr-2 rounded-full bg-olive-deep px-2 py-0.5 text-white">New</span>}
                      {dateTime.format(new Date(l.created_at))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="border-b border-stone px-5 py-4">
            <h2 className="font-serif text-xl">Published content</h2>
          </div>
          <ul className="divide-y divide-stone">
            {counts.map((c) => (
              <li key={c.key}>
                <Link href={`/admin/${c.key}`} className="flex items-center justify-between px-5 py-3 text-sm hover:bg-paper/60">
                  {c.label}
                  <span className="font-medium">{c.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
