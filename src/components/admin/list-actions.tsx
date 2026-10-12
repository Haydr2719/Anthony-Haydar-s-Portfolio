"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { deleteRecord, moveRecord } from "@/app/admin/actions";

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
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) alert(res.error ?? "Something went wrong");
      router.refresh();
    });

  return (
    <div className={`flex items-center justify-end gap-1 ${pending ? "opacity-50" : ""}`}>
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
          className="rounded p-1.5 text-muted hover:bg-red-50 hover:text-red-700"
          aria-label="Delete"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );
}
