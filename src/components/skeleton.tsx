import { cn } from "@/lib/utils";

/** A single shimmering placeholder block. */
export function Bone({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse bg-stone/70", className)} />;
}

/** Wrapper that announces the loading state to screen readers. */
export function LoadingRegion({ children, label = "Loading", className }: { children: React.ReactNode; label?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
      <span className="sr-only">{label}…</span>
      {children}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Public site
// -----------------------------------------------------------------------------

/** Generic page: intro block + a grid of cards. */
export function PageSkeleton() {
  return (
    <LoadingRegion label="Loading page">
      <section className="border-b border-stone bg-paper">
        <div className="container-x py-16 md:py-24">
          <Bone className="h-3 w-40" />
          <Bone className="mt-6 h-12 w-full max-w-3xl md:h-16" />
          <Bone className="mt-3 h-12 w-2/3 max-w-2xl md:h-16" />
          <Bone className="mt-8 h-4 w-full max-w-xl" />
          <Bone className="mt-3 h-4 w-4/5 max-w-lg" />
        </div>
      </section>
      <section className="bg-paper py-20 md:py-28">
        <div className="container-x grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Bone className="aspect-[4/3] w-full" />
              <Bone className="mt-5 h-3 w-24" />
              <Bone className="mt-3 h-6 w-3/4" />
              <Bone className="mt-2 h-4 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    </LoadingRegion>
  );
}

/** Contact page: text column + form. */
export function ContactSkeleton() {
  return (
    <LoadingRegion label="Loading contact form">
      <section className="bg-paper py-14 md:py-24">
        <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <div>
            <Bone className="h-3 w-24" />
            <Bone className="mt-6 h-12 w-full" />
            <Bone className="mt-3 h-12 w-3/4" />
            <Bone className="mt-8 h-4 w-full" />
            <Bone className="mt-3 h-4 w-5/6" />
            <div className="mt-10 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Bone key={i} className="h-5 w-56" />
              ))}
            </div>
          </div>
          <div className="border border-stone bg-white p-6 md:p-10">
            <FormFields count={9} />
            <Bone className="mt-8 h-12 w-44" />
          </div>
        </div>
      </section>
    </LoadingRegion>
  );
}

function FormFields({ count, twoCol = true }: { count: number; twoCol?: boolean }) {
  return (
    <div className={cn("grid gap-5", twoCol && "sm:grid-cols-2")}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn(twoCol && i === count - 1 && "sm:col-span-2")}>
          <Bone className="h-3 w-28" />
          <Bone className={cn("mt-2 w-full", twoCol && i === count - 1 ? "h-28" : "h-12")} />
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Admin
// -----------------------------------------------------------------------------

function AdminTitle() {
  return (
    <div className="mb-8">
      <Bone className="h-9 w-64 rounded" />
      <Bone className="mt-3 h-4 w-full max-w-md rounded" />
    </div>
  );
}

/** Admin list / dashboard: title + table rows. */
export function AdminTableSkeleton() {
  return (
    <LoadingRegion label="Loading">
      <AdminTitle />
      <div className="rounded-lg border border-stone bg-white">
        <div className="border-b border-stone px-4 py-3">
          <Bone className="h-3 w-40 rounded" />
        </div>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-stone/70 px-4 py-3 last:border-0">
            <Bone className="size-11 shrink-0 rounded" />
            <Bone className="h-4 flex-1 rounded" />
            <Bone className="hidden h-4 w-28 rounded sm:block" />
            <Bone className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}

/** Admin edit form: grouped fields + publish sidebar. */
export function AdminFormSkeleton({ sidebar = true }: { sidebar?: boolean }) {
  return (
    <LoadingRegion label="Loading form">
      <AdminTitle />
      <div className={cn("grid gap-6", sidebar && "lg:grid-cols-[1fr_300px]")}>
        <div className="space-y-6">
          {[6, 4].map((count, i) => (
            <div key={i} className="rounded-lg border border-stone bg-white p-5 md:p-6">
              <Bone className="mb-5 h-3 w-24 rounded" />
              <FormFields count={count} />
            </div>
          ))}
        </div>
        {sidebar && (
          <div className="h-fit rounded-lg border border-stone bg-white p-5">
            <Bone className="h-3 w-16 rounded" />
            <Bone className="mt-2 h-10 w-full rounded" />
            <Bone className="mt-5 h-3 w-24 rounded" />
            <Bone className="mt-2 h-10 w-full rounded" />
            <Bone className="mt-5 h-11 w-full rounded" />
          </div>
        )}
      </div>
    </LoadingRegion>
  );
}
