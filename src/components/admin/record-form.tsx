"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { deleteRecord, saveRecord, saveSettings, type SaveResult } from "@/app/admin/actions";
import type { FieldDef, Option } from "@/lib/cms/collections";
import { cn } from "@/lib/utils";
import { Field, inputCls } from "./fields";

interface RecordFormProps {
  collectionKey?: string; // omitted for site settings
  singular: string;
  fields: FieldDef[];
  initial: Record<string, unknown>;
  id?: string | null;
  publishable?: boolean;
  canDelete?: boolean;
  publicPath?: string | null;
  relationOptions?: Record<string, Option[]>;
  /** storage folder for this form's uploads */
  uploadFolder: string;
}

export function RecordForm({
  collectionKey,
  singular,
  fields,
  initial,
  id,
  publishable,
  canDelete,
  publicPath,
  relationOptions = {},
  uploadFolder,
}: RecordFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [result, setResult] = useState<SaveResult | null>(null);
  // Separate transitions so each button shows its own progress; the form is
  // locked while either runs.
  const [saving, startSave] = useTransition();
  const [deleting, startDelete] = useTransition();
  const busy = saving || deleting;
  const set = (name: string) => (v: unknown) => setValues((prev) => ({ ...prev, [name]: v }));

  // Group fields by section, keeping the order of first appearance.
  const groups: { name: string; fields: FieldDef[] }[] = [];
  for (const f of fields) {
    const name = f.group ?? "Details";
    let g = groups.find((x) => x.name === name);
    if (!g) groups.push((g = { name, fields: [] }));
    g.fields.push(f);
  }

  // The save/delete actions revalidate, so the refreshed page arrives in the same
  // response (no router.refresh needed). Navigations after an `await` are wrapped
  // in startTransition again so the form stays locked until the next page is shown.
  const save = () =>
    startSave(async () => {
      const res = collectionKey ? await saveRecord(collectionKey, id ?? null, values) : await saveSettings(values);
      setResult(res);
      if (res.ok && collectionKey && !id && res.id) {
        startSave(() => router.replace(`/admin/${collectionKey}/${res.id}?created=1`));
      }
    });

  const remove = () => {
    if (!collectionKey || !id || !confirm(`Delete this ${singular.toLowerCase()}? This cannot be undone.`)) return;
    startDelete(async () => {
      const res = await deleteRecord(collectionKey, id);
      if (res.ok) startDelete(() => router.push(`/admin/${collectionKey}`));
      else setResult(res);
    });
  };

  const scheduled = publishable && values.status === "published" && typeof values.publish_at === "string" && Date.parse(values.publish_at) > Date.now();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start"
    >
      {/* A disabled <fieldset> natively disables every field and upload button inside it. */}
      <fieldset disabled={busy} className={cn("min-w-0 space-y-6 transition-opacity", busy && "opacity-60")}>
        {groups.map((g) => (
          <fieldset key={g.name} className="rounded-lg border border-stone bg-white p-5 md:p-6">
            <legend className="px-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted">{g.name}</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              {g.fields.map((f) => (
                <Field
                  key={f.name}
                  field={f}
                  value={values[f.name]}
                  onChange={set(f.name)}
                  error={result?.fieldErrors?.[f.name]}
                  relationOptions={relationOptions[f.name]}
                  sourceValue={f.source ? String(values[f.source] ?? "") : undefined}
                  uploadFolder={uploadFolder}
                />
              ))}
            </div>
          </fieldset>
        ))}
      </fieldset>

      <aside className="space-y-4 lg:sticky lg:top-6">
        <div className="rounded-lg border border-stone bg-white p-5">
          {publishable && (
            <fieldset disabled={busy} className="min-w-0 space-y-4">
              <div>
                <label htmlFor="f-status" className="mb-1.5 block text-[0.8rem] font-medium text-ink-3">
                  Status
                </label>
                <select id="f-status" value={String(values.status ?? "draft")} onChange={(e) => set("status")(e.target.value)} className={inputCls}>
                  <option value="draft">Draft (hidden)</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <Field
                field={{ name: "publish_at", label: "Publish date", type: "datetime", help: "Set a future date to schedule publishing." }}
                value={values.publish_at}
                onChange={set("publish_at")}
              />
              {scheduled && <p className="rounded bg-olive-soft px-3 py-2 text-xs text-ink">Scheduled - goes live automatically on this date.</p>}
            </fieldset>
          )}

          <button
            type="submit"
            disabled={busy}
            className={cn("flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-olive-deep text-sm font-medium text-white hover:bg-ink disabled:opacity-60", publishable && "mt-5")}
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {saving ? "Saving…" : id || !collectionKey ? "Save changes" : `Create ${singular.toLowerCase()}`}
          </button>

          {result?.ok && (
            <p className="mt-3 flex items-center gap-2 text-sm text-olive-deep" role="status">
              <CheckCircle2 className="size-4" /> Saved - the website updates within a minute.
            </p>
          )}
          {result && !result.ok && (
            <p className="mt-3 text-sm text-red-700" role="alert">
              {result.error}
            </p>
          )}

          {(publicPath || (canDelete && id)) && (
            <div className="mt-5 flex items-center justify-between border-t border-stone pt-4 text-sm">
              {publicPath ? (
                <Link href={publicPath} target="_blank" className="inline-flex items-center gap-1.5 text-ink-3 hover:text-ink">
                  View on site <ExternalLink className="size-3.5" />
                </Link>
              ) : (
                <span />
              )}
              {canDelete && id && (
                <button
                  type="button"
                  onClick={remove}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 text-red-700 hover:underline disabled:no-underline disabled:opacity-60"
                >
                  {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </form>
  );
}
