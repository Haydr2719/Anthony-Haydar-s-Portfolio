import Link from "next/link";
import { notFound } from "next/navigation";
import { ListActions } from "@/components/admin/list-actions";
import { AdminHeader, Card, StatusPill, Thumb } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/cms/auth";
import { getCollection } from "@/lib/cms/collections";
import { labelOf } from "@/lib/options";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ collection: string }> };

type Row = Record<string, unknown>;

function cell(value: unknown, options?: readonly { value: string; label: string }[]) {
  if (typeof value === "boolean") return value ? "Yes" : "-";
  if (value == null || value === "") return "-";
  if (options) return labelOf(options, String(value));
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return formatDate(value);
  return String(value);
}

export default async function CollectionListPage({ params }: Props) {
  const { collection } = await params;
  const col = getCollection(collection);
  if (!col) notFound();
  const { supabase } = await requireAdmin();
  const idField = col.idField ?? "id";

  let query = supabase.from(col.table).select("*");
  if (col.orderBy) query = query.order(col.orderBy.column, { ascending: col.orderBy.ascending, nullsFirst: false });
  else if (col.sortable) query = query.order("sort_order").order("created_at");
  const { data, error } = await query;
  const rows = (data ?? []) as Row[];

  // Banner click counts (last 30 days)
  let clicks: Record<string, number> = {};
  if (col.key === "banners" && rows.length) {
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const { data: c } = await supabase.from("banner_clicks").select("banner_id").gte("created_at", since);
    clicks = (c ?? []).reduce<Record<string, number>>((acc, r) => {
      acc[r.banner_id as string] = (acc[r.banner_id as string] ?? 0) + 1;
      return acc;
    }, {});
  }

  return (
    <>
      <AdminHeader
        title={col.label}
        description={col.description}
        action={col.canCreate ? { href: `/admin/${col.key}/new`, label: `New ${col.singular.toLowerCase()}` } : undefined}
      />
      {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-800">{error.message}</p>}
      <Card className="overflow-x-auto">
        {rows.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">Nothing here yet.</p>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-stone text-left text-xs uppercase tracking-[0.12em] text-muted">
                <th className="px-4 py-3 font-medium">{col.singular}</th>
                {col.columns?.map((c) => (
                  <th key={c.name} className="px-4 py-3 font-medium">
                    {c.label}
                  </th>
                ))}
                {col.key === "banners" && <th className="px-4 py-3 font-medium">Clicks (30d)</th>}
                {col.publishable && <th className="px-4 py-3 font-medium">Status</th>}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const id = String(row[idField]);
                return (
                  <tr key={id} className="border-b border-stone/70 last:border-0 hover:bg-paper/60">
                    <td className="px-4 py-3">
                      <Link href={`/admin/${col.key}/${encodeURIComponent(id)}`} className="flex items-center gap-3 font-medium hover:text-olive-deep">
                        {col.imageField && <Thumb src={(row[col.imageField] as string) || (row.poster_url as string)} />}
                        <span className="line-clamp-2">{String(row[col.titleField] || row.caption || row.video_url || "(untitled)")}</span>
                      </Link>
                    </td>
                    {col.columns?.map((c) => (
                      <td key={c.name} className="px-4 py-3 text-ink-3">
                        {cell(row[c.name], c.options)}
                      </td>
                    ))}
                    {col.key === "banners" && <td className="px-4 py-3 text-ink-3">{clicks[id] ?? 0}</td>}
                    {col.publishable && (
                      <td className="px-4 py-3">
                        <StatusPill status={row.status as string} publishAt={row.publish_at as string} />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <ListActions
                        collection={col.key}
                        id={id}
                        sortable={col.sortable && !col.orderBy}
                        canDelete={col.canDelete}
                        first={i === 0}
                        last={i === rows.length - 1}
                      />
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
