/* eslint-disable @next/next/no-img-element -- small admin thumbnails */
import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminHeader({
  title,
  description,
  action,
  back,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {back && (
          <Link href={back.href} className="text-xs font-medium uppercase tracking-[0.16em] text-muted hover:text-ink">
            ← {back.label}
          </Link>
        )}
        <h1 className="mt-1 font-serif text-3xl md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {action && (
        <Link href={action.href} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md bg-olive-deep px-5 text-sm font-medium text-white hover:bg-ink">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function StatusPill({ status, publishAt }: { status?: string; publishAt?: string | null }) {
  const scheduled = status === "published" && publishAt && Date.parse(publishAt) > Date.now();
  const label = scheduled ? "Scheduled" : status === "published" ? "Published" : "Draft";
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        scheduled ? "bg-amber-100 text-amber-900" : status === "published" ? "bg-olive-soft text-olive-deep" : "bg-stone text-ink-3",
      )}
    >
      {label}
    </span>
  );
}

export function Thumb({ src }: { src?: string | null }) {
  if (!src) return <div className="size-11 shrink-0 rounded bg-stone" />;
  if (/\.(mp4|webm|mov)(\?|$)/i.test(src)) return <video src={src} className="size-11 shrink-0 rounded object-cover" muted />;
  return <img src={src} alt="" className="size-11 shrink-0 rounded object-cover" loading="lazy" />;
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-lg border border-stone bg-white", className)}>{children}</div>;
}
