"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { deleteLead, updateLead } from "@/app/admin/actions";
import { LEAD_STATUSES } from "@/lib/options";
import { inputCls } from "./fields";

export function LeadEditor({ id, status: initialStatus, notes: initialNotes }: { id: string; status: string; notes: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [msg, setMsg] = useState<{ ok: boolean; error?: string } | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-4 rounded-lg border border-stone bg-white p-5 lg:sticky lg:top-6">
      <div>
        <label htmlFor="lead-status" className="mb-1.5 block text-[0.8rem] font-medium text-ink-3">
          Status
        </label>
        <select id="lead-status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
          {LEAD_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="lead-notes" className="mb-1.5 block text-[0.8rem] font-medium text-ink-3">
          Internal notes
        </label>
        <textarea id="lead-notes" rows={6} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} />
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => setMsg(await updateLead(id, status, notes)))}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-olive-deep text-sm font-medium text-white hover:bg-ink disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" />} Save
      </button>
      {msg?.ok && (
        <p className="flex items-center gap-2 text-sm text-olive-deep">
          <CheckCircle2 className="size-4" /> Saved
        </p>
      )}
      {msg && !msg.ok && <p className="text-sm text-red-700">{msg.error}</p>}
      <button
        type="button"
        onClick={() => confirm("Delete this enquiry permanently?") && start(() => deleteLead(id))}
        className="flex items-center gap-2 text-sm text-red-700 hover:underline"
      >
        <Trash2 className="size-4" /> Delete enquiry
      </button>
    </div>
  );
}
