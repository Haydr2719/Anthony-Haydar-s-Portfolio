import { notFound } from "next/navigation";
import { RecordForm } from "@/components/admin/record-form";
import { AdminHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/cms/auth";
import { getCollection, type Option } from "@/lib/cms/collections";

type Props = { params: Promise<{ collection: string; id: string }>; searchParams: Promise<{ created?: string }> };

export default async function EditRecordPage({ params, searchParams }: Props) {
  const { collection, id: rawId } = await params;
  const { created } = await searchParams;
  const col = getCollection(collection);
  if (!col) notFound();
  const { supabase } = await requireAdmin();

  const id = decodeURIComponent(rawId);
  const isNew = id === "new";
  if (isNew && !col.canCreate) notFound();

  let record: Record<string, unknown> = {};
  if (!isNew) {
    const { data } = await supabase.from(col.table).select("*").eq(col.idField ?? "id", id).maybeSingle();
    if (!data) notFound();
    record = data;
  } else {
    // Sensible defaults for new entries
    for (const f of col.fields) {
      if (f.type === "boolean") record[f.name] = f.name === "open_in_new_tab";
      if (f.type === "select" && f.required && f.options?.length) record[f.name] = f.options[0].value;
      if (["list", "multiselect", "faq", "schedule"].includes(f.type)) record[f.name] = [];
    }
    if (col.publishable) {
      record.status = "draft";
      record.publish_at = new Date().toISOString();
    }
  }

  // Options for relation / multiselect-from-table fields
  const relationOptions: Record<string, Option[]> = {};
  await Promise.all(
    col.fields
      .filter((f) => f.relation)
      .map(async (f) => {
        const { table, label, value = "id" } = f.relation!;
        const { data } = await supabase.from(table).select(`${value}, ${label}`).order(label);
        relationOptions[f.name] = ((data ?? []) as unknown as Record<string, string>[]).map((r) => ({ value: r[value], label: r[label] }));
      }),
  );

  const title = isNew ? `New ${col.singular.toLowerCase()}` : String(record[col.titleField] || col.singular);
  const publicPath = !isNew && col.publicPath && record.status === "published" ? col.publicPath(record) : null;

  return (
    <>
      <AdminHeader title={title} back={{ href: `/admin/${col.key}`, label: col.label }} />
      {created && <p className="mb-6 rounded-md bg-olive-soft px-4 py-3 text-sm">Created. You can keep editing below.</p>}
      <RecordForm
        key={isNew ? "new" : id}
        collectionKey={col.key}
        singular={col.singular}
        fields={col.fields}
        initial={record}
        id={isNew ? null : id}
        publishable={col.publishable}
        canDelete={col.canDelete}
        publicPath={publicPath}
        relationOptions={relationOptions}
        uploadFolder={col.storageFolder ?? col.key}
      />
    </>
  );
}
