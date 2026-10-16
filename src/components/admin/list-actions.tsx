"use client";

import { useTransition } from "react";
import { ArrowDown, ArrowUp, Loader2, Trash2 } from "lucide-react";
import { deleteRecord, moveRecord } from "@/app/admin/actions";

/**
 * Reorder / delete buttons for one row of an admin list. The actions revalidate
 * the list, so the updated list arrives in the same response and the transition
 * stays pending until it's on screen. While pending, the wrapper carries
 * `data-pending`, which the row uses to fade itself (`has-data-pending:`).
 */
export function ListActions({
  collection,
  id,
  sortable,
  canDelete,
  first,
  last,
}: {
  collection: string;
  id: string;
  sortable?: boolean;
  canDelete?: boolean;
  first: boolean;
  last: boolean;
}) {
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) alert(res.error ?? "Something went wrong");
    });

  return (
    <div data-pending={pending ? "" : undefined} aria-busy={pending} className="flex items-center justify-end gap-1">
      {pending && <Loader2 className="mr-1 size-4 animate-spin text-muted" aria-label="Updating" />}
      {sortable && (
        <>
          <button type="button" disabled={first || pending} onClick={() => run(() => moveRecord(collection, id, "up"))} className="rounded p-1.5 text-muted hover:bg-paper-2 hover:text-ink disabled:opacity-25" aria-label="Move up">
            <ArrowUp className="size-4" />
          </button>
          <button type="button" disabled={last || pending} onClick={() => run(() => moveRecord(collection, id, "down"))} className="rounded p-1.5 text-muted hover:bg-paper-2 hover:text-ink disabled:opacity-25" aria-label="Move down">
            <ArrowDown className="size-4" />
          </button>
        </>
      )}
      {canDelete && (
        <button
          type="button"
          disabled={pending}
          onClick={() => confirm("Delete this entry? This cannot be undone.") && run(() => deleteRecord(collection, id))}
          className="rounded p-1.5 text-muted hover:bg-red-50 hover:text-red-700 disabled:opacity-25"
          aria-label="Delete"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );
}
