"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { saveBlocks } from "@/app/admin/actions";
import type { ContentBlock } from "@/lib/types";
import { cn } from "@/lib/utils";
import { UploadField, inputCls } from "./fields";

export function BlocksForm({ page, blocks }: { page: string; blocks: ContentBlock[] }) {
  const [values, setValues] = useState<Record<string, string>>(Object.fromEntries(blocks.map((b) => [b.key, b.value])));
  const [status, setStatus] = useState<{ ok: boolean; error?: string } | null>(null);
  const [pending, start] = useTransition();

  const save = () =>
    start(async () => {
      const res = await saveBlocks(
        page,
        blocks.map((b) => ({ key: b.key, label: b.label, kind: b.kind, sort_order: b.sort_order, value: values[b.key] ?? "" })),
      );
      setStatus(res);
    });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-6"
    >
      <div className="space-y-5 rounded-lg border border-stone bg-white p-5 md:p-6">
        {blocks.map((b) => {
          const id = `b-${b.key}`;
          const v = values[b.key] ?? "";
          const set = (val: string) => setValues((prev) => ({ ...prev, [b.key]: val }));
          return (
            <div key={b.key}>
              <label htmlFor={id} className="mb-1.5 block text-[0.8rem] font-medium text-ink-3">
                {b.label}
              </label>
              {b.kind === "textarea" ? (
                <textarea id={id} value={v} onChange={(e) => set(e.target.value)} rows={Math.min(14, Math.max(3, v.split("\n").length + 1))} className={cn(inputCls, "resize-y")} />
              ) : b.kind === "image" ? (
                <UploadField id={id} value={v} onChange={set} accept="image" folder={`page-text/${page}`} />
              ) : (
                <input id={id} value={v} onChange={(e) => set(e.target.value)} className={inputCls} />
              )}
            </div>
          );
        })}
      </div>
      <div className="sticky bottom-4 flex items-center gap-4 rounded-lg border border-stone bg-white/95 p-3 backdrop-blur">
        <button type="submit" disabled={pending} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-olive-deep px-6 text-sm font-medium text-white hover:bg-ink disabled:opacity-60">
          {pending && <Loader2 className="size-4 animate-spin" />} Save page text
        </button>
        {status?.ok && (
          <span className="flex items-center gap-2 text-sm text-olive-deep">
            <CheckCircle2 className="size-4" /> Saved
          </span>
        )}
        {status && !status.ok && <span className="text-sm text-red-700">{status.error}</span>}
      </div>
    </form>
  );
}
