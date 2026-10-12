import Link from "next/link";
import { Download } from "lucide-react";
import { AdminHeader, Card } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/cms/auth";
import { BUSINESS_TYPES, LEAD_STATUSES, LEAD_TYPES, labelOf } from "@/lib/options";
import type { Lead } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = { searchParams: Promise<{ status?: string }> };

const dateTime = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

export default async function LeadsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const { supabase } = await requireAdmin();
  let query = supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(500);
  if (status && LEAD_STATUSES.some((s) => s.value === status)) query = query.eq("status", status);
  const { data, error } = await query;
  const leads = (data ?? []) as Lead[];

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <AdminHeader title="Enquiries" description="Every consultation, training, workshop, partnership and event enquiry from the website." />
        <a href="/admin/leads/export" className="mb-8 inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-md border border-stone bg-white px-4 text-sm hover:border-ink">
          <Download className="size-4" /> Export CSV
        </a>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {[{ value: "", label: "All" }, ...LEAD_STATUSES].map((s) => (
          <Link
            key={s.value}
            href={s.value ? `/admin/leads?status=${s.value}` : "/admin/leads"}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm",
              (status ?? "") === s.value ? "border-ink bg-ink text-paper" : "border-stone bg-white hover:border-ink",
            )}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-800">{error.message}</p>}
      <Card className="overflow-x-auto">
        {leads.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">No enquiries yet.</p>
        ) : (
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-stone text-left text-xs uppercase tracking-[0.12em] text-muted">
                <th className="px-4 py-3 font-medium">Received</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Enquiry</th>
                <th className="px-4 py-3 font-medium">Business</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => {
                const justNow = Date.now() - Date.parse(l.created_at) < 5 * 60 * 1000;
                return (
                <tr
                  key={l.id}
                  className={cn(
                    "border-b border-stone/70 transition-colors last:border-0 hover:bg-paper/60",
                    l.status === "new" && "font-medium",
                    justNow && "bg-olive-soft/50",
                  )}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-ink-3">
                    {dateTime.format(new Date(l.created_at))}
                    {justNow && <span className="ml-2 rounded-full bg-olive-deep px-2 py-0.5 text-[0.65rem] font-semibold text-white">Just now</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/leads/${l.id}`} className="hover:text-olive-deep">
                      {l.name}
                      {l.company && <span className="block text-xs font-normal text-muted">{l.company}</span>}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-3">{labelOf(LEAD_TYPES, l.lead_type)}</td>
                  <td className="px-4 py-3 text-ink-3">{l.business_type ? labelOf(BUSINESS_TYPES, l.business_type) : "-"}</td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs", l.status === "new" ? "bg-olive-deep text-white" : "bg-stone text-ink-3")}>
                      {labelOf(LEAD_STATUSES, l.status)}
                    </span>
                    {l.notes?.startsWith("Possible spam") && (
                      <span className="ml-2 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs text-amber-900" title={l.notes}>
                        Possible spam
                      </span>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
