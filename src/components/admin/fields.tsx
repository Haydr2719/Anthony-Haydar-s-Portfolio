"use client";

/* eslint-disable @next/next/no-img-element -- admin previews of arbitrary uploads */
import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import type { FieldDef, Option } from "@/lib/cms/collections";
import { compressImage, formatBytes } from "@/lib/compress-image";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { cn, slugify } from "@/lib/utils";

const MAX_UPLOAD_MB = 50;

export const inputCls =
  "w-full rounded-md border border-stone bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/20 disabled:bg-paper-2 disabled:text-muted";

interface FieldProps {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  relationOptions?: Option[];
  sourceValue?: string;
  /** storage folder for uploads, e.g. "projects" */
  uploadFolder?: string;
}

export function Field({ field, value, onChange, error, relationOptions, sourceValue, uploadFolder }: FieldProps) {
  const id = `f-${field.name}`;
  const isCheckbox = field.type === "boolean";
  return (
    <div className={cn(field.half ? "sm:col-span-1" : "sm:col-span-2")}>
      {!isCheckbox && (
        <label htmlFor={id} className="mb-1.5 block text-[0.8rem] font-medium text-ink-3">
          {field.label}
          {field.required && <span className="text-olive-deep"> *</span>}
        </label>
      )}
      <Control id={id} field={field} value={value} onChange={onChange} relationOptions={relationOptions} sourceValue={sourceValue} uploadFolder={uploadFolder} />
      {field.help && <p className="mt-1 text-xs text-muted">{field.help}</p>}
      {error && <p className="mt-1 text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}

function Control({ id, field, value, onChange, relationOptions, sourceValue, uploadFolder }: FieldProps & { id: string }) {
  const str = typeof value === "string" ? value : value == null ? "" : String(value);

  switch (field.type) {
    case "textarea":
      return <textarea id={id} rows={field.rows ?? 4} value={str} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, "resize-y")} />;

    case "slug":
      return (
        <div className="flex gap-2">
          <input id={id} value={str} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, "font-mono")} placeholder="my-page-url" />
          {sourceValue !== undefined && (
            <button type="button" onClick={() => onChange(slugify(sourceValue))} className="shrink-0 rounded-md border border-stone px-3 text-xs hover:border-ink">
              Generate
            </button>
          )}
        </div>
      );

    case "select":
      return (
        <select id={id} value={str} onChange={(e) => onChange(e.target.value)} className={inputCls}>
          <option value="">{field.required ? "Select…" : "-"}</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );

    case "relation":
      return (
        <select id={id} value={str} onChange={(e) => onChange(e.target.value)} className={inputCls}>
          <option value="">- None -</option>
          {relationOptions?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );

    case "multiselect": {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      const opts = field.options ?? relationOptions ?? [];
      return (
        <div className="flex flex-wrap gap-2">
          {opts.map((o) => {
            const on = selected.includes(o.value);
            return (
              <label key={o.value} className={cn("flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm", on ? "border-olive bg-olive-soft" : "border-stone bg-white")}>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => onChange(on ? selected.filter((s) => s !== o.value) : [...selected, o.value])}
                  className="accent-olive-deep"
                />
                {o.label}
              </label>
            );
          })}
          {!opts.length && <p className="text-sm text-muted">No options yet.</p>}
        </div>
      );
    }

    case "boolean":
      return (
        <label htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
          <input id={id} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="size-5 accent-olive-deep" />
          {field.label}
        </label>
      );

    case "number":
      return <input id={id} type="number" value={str} onChange={(e) => onChange(e.target.value)} className={inputCls} />;

    case "datetime":
      return (
        <div className="flex gap-2">
          <input
            id={id}
            type="datetime-local"
            value={toLocalInput(str)}
            onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : "")}
            className={inputCls}
          />
          {str && (
            <button type="button" onClick={() => onChange("")} className="shrink-0 rounded-md border border-stone px-3 text-muted hover:text-ink" aria-label="Clear date">
              <X className="size-4" />
            </button>
          )}
        </div>
      );

    case "list": {
      const lines = Array.isArray(value) ? (value as string[]).join("\n") : str;
      return (
        <textarea
          id={id}
          rows={Math.max(3, (Array.isArray(value) ? value.length : 0) + 1)}
          value={lines}
          onChange={(e) => onChange(e.target.value.split("\n"))}
          className={cn(inputCls, "resize-y")}
          placeholder="One item per line"
        />
      );
    }

    case "image":
    case "video":
      return (
        <UploadField
          id={id}
          value={str}
          onChange={onChange}
          folder={uploadFolder ?? "uploads"}
          accept={field.accept ?? (field.type === "video" ? "video" : "image")}
          allowLink={field.type === "video"}
        />
      );

    case "faq":
      return (
        <Repeater
          value={value}
          onChange={onChange}
          empty={{ question: "", answer: "" }}
          addLabel="Add question"
          render={(item, set) => (
            <>
              <input value={item.question ?? ""} onChange={(e) => set({ ...item, question: e.target.value })} placeholder="Question" className={inputCls} />
              <textarea value={item.answer ?? ""} onChange={(e) => set({ ...item, answer: e.target.value })} placeholder="Answer" rows={2} className={cn(inputCls, "mt-2")} />
            </>
          )}
        />
      );

    case "schedule":
      return (
        <Repeater
          value={value}
          onChange={onChange}
          empty={{ time: "", title: "", detail: "" }}
          addLabel="Add schedule item"
          render={(item, set) => (
            <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
              <input value={item.time ?? ""} onChange={(e) => set({ ...item, time: e.target.value })} placeholder="Day 1 / 14:00" className={inputCls} />
              <input value={item.title ?? ""} onChange={(e) => set({ ...item, title: e.target.value })} placeholder="Title" className={inputCls} />
              <input value={item.detail ?? ""} onChange={(e) => set({ ...item, detail: e.target.value })} placeholder="Detail (optional)" className={cn(inputCls, "sm:col-span-2")} />
            </div>
          )}
        />
      );

    default:
      return (
        <input
          id={id}
          type={field.type === "url" ? "url" : "text"}
          value={str}
          readOnly={field.readOnly}
          disabled={field.readOnly}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
          placeholder={field.type === "url" ? "https://" : undefined}
        />
      );
  }
}

function toLocalInput(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Item = Record<string, string>;

function Repeater({
  value,
  onChange,
  empty,
  addLabel,
  render,
}: {
  value: unknown;
  onChange: (v: unknown) => void;
  empty: Item;
  addLabel: string;
  render: (item: Item, set: (item: Item) => void) => React.ReactNode;
}) {
  const items = Array.isArray(value) ? (value as Item[]) : [];
  const update = (next: Item[]) => onChange(next);
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3 rounded-md border border-stone bg-paper-2/60 p-3">
          <div className="flex-1">{render(item, (it) => update(items.map((x, j) => (j === i ? it : x))))}</div>
          <div className="flex flex-col gap-1">
            <button type="button" disabled={i === 0} onClick={() => update(swap(items, i, i - 1))} className="p-1 text-muted hover:text-ink disabled:opacity-30" aria-label="Move up">
              <ArrowUp className="size-4" />
            </button>
            <button type="button" disabled={i === items.length - 1} onClick={() => update(swap(items, i, i + 1))} className="p-1 text-muted hover:text-ink disabled:opacity-30" aria-label="Move down">
              <ArrowDown className="size-4" />
            </button>
            <button type="button" onClick={() => update(items.filter((_, j) => j !== i))} className="p-1 text-muted hover:text-red-700" aria-label="Remove">
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => update([...items, { ...empty }])} className="inline-flex items-center gap-2 rounded-md border border-dashed border-stone px-3 py-2 text-sm hover:border-ink">
        <Plus className="size-4" /> {addLabel}
      </button>
    </div>
  );
}

function swap<T>(arr: T[], i: number, j: number) {
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

const isVideo = (url: string) => /\.(mp4|webm|mov)(\?|$)/i.test(url);

/**
 * Upload to the Supabase "media" bucket, or paste any URL.
 * Files are grouped by where they are used: media/<folder>/<file>, e.g. media/projects/…
 */
export function UploadField({
  id,
  value,
  onChange,
  folder,
  accept,
  allowLink,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  folder: string;
  accept: "image" | "video" | "any";
  allowLink?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<false | "optimising" | "uploading">(false);
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const upload = async (picked: File) => {
    setErr(null);
    setNote(null);
    try {
      // Photos are resized + converted to WebP in the browser before upload
      // (src/lib/compress-image.ts). Videos, SVGs and GIFs are uploaded as-is.
      let file = picked;
      if (picked.type.startsWith("image/")) {
        setBusy("optimising");
        const result = await compressImage(picked);
        file = result.file;
        if (result.compressed) setNote(`Optimised: ${formatBytes(result.originalSize)} → ${formatBytes(file.size)}`);
      }
      if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
        setErr(
          file.type.startsWith("video/")
            ? `Video is larger than ${MAX_UPLOAD_MB} MB. Compress it first (e.g. HandBrake) or use a YouTube/Vimeo link.`
            : `File is larger than ${MAX_UPLOAD_MB} MB.`,
        );
        setNote(null);
        return;
      }
      setBusy("uploading");
      const supabase = createBrowserSupabase();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "file";
      const path = `${folder}/${Date.now()}-${base}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file, { cacheControl: "31536000", contentType: file.type });
      if (error) throw error;
      onChange(supabase.storage.from("media").getPublicUrl(path).data.publicUrl);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
      setNote(null);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const acceptAttr = accept === "image" ? "image/*" : accept === "video" ? "video/mp4,video/webm,video/quicktime" : "image/*,video/mp4,video/webm,video/quicktime";

  return (
    <div className="rounded-md border border-stone bg-white p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded bg-paper-2 text-xs text-muted">
          {value ? (
            isVideo(value) ? (
              <video src={value} className="size-full object-cover" muted />
            ) : /^https?:\/\/.*\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/i.test(value) || value.includes("/storage/v1/object/public/") ? (
              <img src={value} alt="" className="size-full object-cover" />
            ) : (
              <span className="p-2 text-center">Link</span>
            )
          ) : (
            "No file"
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputCls}
            placeholder={allowLink ? "Upload, or paste a YouTube / Vimeo / file URL" : "Upload, or paste an image URL"}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy !== false}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-xs font-medium text-paper hover:bg-olive-deep disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {busy === "optimising" ? "Optimising…" : busy === "uploading" ? "Uploading…" : "Upload file"}
            </button>
            {value && (
              <button type="button" onClick={() => onChange("")} className="inline-flex items-center gap-1 rounded-md border border-stone px-3 py-2 text-xs hover:border-ink">
                <X className="size-3.5" /> Remove
              </button>
            )}
          </div>
          {note && <p className="text-xs text-olive-deep">{note}</p>}
          {err && <p className="text-xs text-red-700">{err}</p>}
          {accept !== "image" && (
            <p className="text-xs text-muted">
              Videos are uploaded as they are (max {MAX_UPLOAD_MB} MB). For longer videos, upload to YouTube or Vimeo and paste the link.
            </p>
          )}
        </div>
      </div>
      <input ref={fileRef} type="file" accept={acceptAttr} className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
    </div>
  );
}
