import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { MediaFrame } from "@/components/media";
import { Badge, Button, Eyebrow } from "@/components/ui";
import { getBlocks, getServices } from "@/lib/data";
import { DRINK_CATEGORIES, EVENT_STATUSES, PROGRAM_KINDS, PROJECT_CATEGORIES, labelOf } from "@/lib/options";
import type { Drink, EventItem, Program, Project, Service } from "@/lib/types";
import { cn, formatDateRange, formatTime } from "@/lib/utils";
import { LeadForm } from "./lead-form";

export function ServiceCard({ service, index }: { service: Service; index?: number }) {
  return (
    <Link href={`/consultancy/${service.slug}`} className="group flex h-full flex-col border border-stone bg-white transition-shadow duration-500 hover:shadow-[0_24px_50px_-30px_rgba(31,31,29,0.45)]">
      <MediaFrame src={service.cover_image} alt={service.title} ratio="4/3" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" imgClassName="transition-transform duration-700 group-hover:scale-[1.04]" />
      <div className="flex flex-1 flex-col p-6">
        {index !== undefined && <span className="mb-3 text-xs font-medium tracking-[0.2em] text-olive-deep">0{index + 1}</span>}
        <h3 className="text-2xl leading-tight">{service.title}</h3>
        {service.tagline && <p className="mt-2 text-sm text-muted">{service.tagline}</p>}
        <span className="mt-auto flex justify-end pt-6">
          <ArrowRight className="size-5 text-ink transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export function ProjectCard({ project, large }: { project: Project; large?: boolean }) {
  return (
    <Link href={`/portfolio/projects/${project.slug}`} className="group block">
      <MediaFrame
        src={project.cover_image}
        alt={project.title}
        ratio={large ? "16/9" : "4/3"}
        sizes="(min-width: 1024px) 50vw, 100vw"
        imgClassName="transition-transform duration-700 group-hover:scale-[1.04]"
      />
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <Eyebrow>{labelOf(PROJECT_CATEGORIES, project.category)}</Eyebrow>
          <h3 className="mt-2 text-2xl leading-tight transition-colors group-hover:text-olive-deep">{project.title}</h3>
          {(project.client_name || project.location) && (
            <p className="mt-1 text-sm text-muted">{[project.client_name, project.location, project.year].filter(Boolean).join(" · ")}</p>
          )}
        </div>
        <ArrowRight className="mt-6 size-5 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
      </div>
    </Link>
  );
}

export function DrinkCard({ drink, tall }: { drink: Drink; tall?: boolean }) {
  return (
    <Link href={`/portfolio/drinks/${drink.slug}`} className="group relative block overflow-hidden">
      <MediaFrame
        src={drink.image}
        alt={drink.name}
        ratio={tall ? "3/4" : "4/5"}
        sizes="(min-width: 1024px) 25vw, 50vw"
        imgClassName="transition-transform duration-700 group-hover:scale-[1.05]"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-5 pt-16 text-paper">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-olive-soft">{labelOf(DRINK_CATEGORIES, drink.category)}</p>
        <h3 className="mt-1 text-xl leading-tight">{drink.name}</h3>
      </div>
    </Link>
  );
}

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return null;
  const tone = status === "registration_open" ? "olive" : status === "sold_out" ? "ink" : status === "completed" ? "muted" : "light";
  return <Badge tone={tone}>{labelOf(EVENT_STATUSES, status)}</Badge>;
}

export function ProgramCard({ program }: { program: Program }) {
  return (
    <Link href={`/training-events/workshops/${program.slug}`} className="group flex h-full flex-col border border-stone bg-white">
      <div className="relative">
        <MediaFrame src={program.cover_image} alt={program.title} ratio="16/9" sizes="(min-width: 1024px) 33vw, 100vw" imgClassName="transition-transform duration-700 group-hover:scale-[1.04]" />
        <div className="absolute left-4 top-4 flex gap-2">
          <Badge tone="light">{labelOf(PROGRAM_KINDS, program.kind)}</Badge>
          <StatusBadge status={program.event_status} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        {program.topic && <Eyebrow>{program.topic}</Eyebrow>}
        <h3 className="mt-2 text-2xl leading-tight">{program.title}</h3>
        {program.summary && <p className="mt-3 text-sm leading-relaxed text-muted">{program.summary}</p>}
        <ul className="mt-5 space-y-2 text-sm text-ink-3">
          {program.start_at && (
            <li className="flex items-center gap-2">
              <CalendarDays className="size-4 text-olive" aria-hidden /> {formatDateRange(program.start_at, program.end_at)}
            </li>
          )}
          {program.duration && (
            <li className="flex items-center gap-2">
              <Clock className="size-4 text-olive" aria-hidden /> {program.duration}
              {program.format ? ` · ${program.format}` : ""}
            </li>
          )}
          {(program.venue || program.city) && (
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-olive" aria-hidden /> {[program.venue, program.city].filter(Boolean).join(", ")}
            </li>
          )}
          {program.capacity && (
            <li className="flex items-center gap-2">
              <Users className="size-4 text-olive" aria-hidden /> {program.capacity} places
            </li>
          )}
        </ul>
        <span className="mt-auto inline-flex items-center gap-2 pt-6 text-xs font-semibold uppercase tracking-[0.18em]">
          View details <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export function EventCard({ event }: { event: EventItem }) {
  return (
    <Link href={`/training-events/events/${event.slug}`} className="group grid gap-5 border-b border-stone py-8 md:grid-cols-[220px_1fr_auto] md:items-center md:gap-8">
      <MediaFrame src={event.cover_image} alt={event.title} ratio="4/3" sizes="220px" className="hidden md:block" />
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <StatusBadge status={event.event_status} />
          <span className="text-sm text-muted">{formatDateRange(event.start_at, event.end_at)}</span>
        </div>
        <h3 className="text-2xl leading-tight transition-colors group-hover:text-olive-deep md:text-3xl">{event.title}</h3>
        {event.summary && <p className="mt-2 max-w-2xl text-muted">{event.summary}</p>}
        {(event.venue || event.city) && (
          <p className="mt-3 flex items-center gap-2 text-sm text-ink-3">
            <MapPin className="size-4 text-olive" aria-hidden /> {[event.venue, event.city, event.country].filter(Boolean).join(", ")}
          </p>
        )}
      </div>
      <ArrowRight className="hidden size-6 transition-transform group-hover:translate-x-1 md:block" aria-hidden />
    </Link>
  );
}

export function ScheduleList({ event }: { event: EventItem }) {
  if (!event.schedule?.length) return null;
  return (
    <ol className="divide-y divide-stone border-y border-stone">
      {event.schedule.map((s, i) => (
        <li key={i} className="grid gap-1 py-5 sm:grid-cols-[160px_1fr] sm:gap-6">
          <span className="text-sm font-medium text-olive-deep">{s.time}</span>
          <span>
            <span className="font-serif text-xl">{s.title}</span>
            {s.detail && <span className="mt-1 block text-sm text-muted">{s.detail}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function ProgramMeta({ program }: { program: Program }) {
  const rows: [string, string | null | undefined][] = [
    ["Date", program.start_at ? `${formatDateRange(program.start_at, program.end_at)}${formatTime(program.start_at) !== "00:00" ? ` · ${formatTime(program.start_at)} (UTC)` : ""}` : null],
    ["Topic", program.topic],
    ["Trainer", program.trainer],
    ["Format", program.format],
    ["Duration", program.duration],
    ["Venue", [program.venue, program.city].filter(Boolean).join(", ") || null],
    ["Capacity", program.capacity ? `${program.capacity} places` : null],
    ["Price", program.price_label],
  ];
  return (
    <dl className="divide-y divide-stone border-y border-stone text-sm">
      {rows
        .filter(([, v]) => v)
        .map(([k, v]) => (
          <div key={k} className="flex justify-between gap-6 py-3">
            <dt className="text-muted">{k}</dt>
            <dd className="text-right font-medium">{v}</dd>
          </div>
        ))}
    </dl>
  );
}

/** Contact form section used at the bottom of many pages. */
export async function ContactSection({
  defaultType,
  defaultService,
  eventId,
  programId,
  title,
  text,
  eyebrow,
  submitLabel,
  compact,
  id = "enquire",
  tone = "paper-2",
}: {
  defaultType?: string;
  defaultService?: string;
  eventId?: string;
  programId?: string;
  title?: string;
  text?: string;
  eyebrow?: string;
  submitLabel?: string;
  compact?: boolean;
  id?: string;
  tone?: "paper" | "paper-2";
}) {
  const [contact, home, services] = await Promise.all([getBlocks("contact"), getBlocks("home"), getServices()]);
  return (
    <section id={id} className={cn("py-20 md:py-28", tone === "paper" ? "bg-paper" : "bg-paper-2")}>
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <div>
          <Eyebrow className="mb-4">{eyebrow ?? home.get("contact.eyebrow")}</Eyebrow>
          <h2 className="text-4xl leading-[1.08] md:text-5xl">{title ?? home.get("contact.title")}</h2>
          <p className="mt-5 max-w-md text-muted md:text-lg">{text ?? home.get("contact.text")}</p>
          {compact && (
            <Link href="/contact" className="mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
              Full contact page <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </div>
        <LeadForm
          services={services.map((s) => s.title)}
          defaultType={defaultType}
          defaultService={defaultService}
          eventId={eventId}
          programId={programId}
          compact={compact}
          submitLabel={submitLabel}
          consentText={contact.get("consent.text")}
          successTitle={contact.get("success.title")}
          successText={contact.get("success.text")}
        />
      </div>
    </section>
  );
}

/** Page intro used by inner pages. */
export function PageHero({
  eyebrow,
  title,
  text,
  image,
  children,
}: {
  eyebrow?: string;
  title: string;
  text?: string | null;
  image?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <section className="border-b border-stone bg-paper">
      <div className={cn("container-x grid gap-10 py-16 md:py-24", image && "lg:grid-cols-[1.1fr_1fr] lg:items-center")}>
        <div className="animate-fade-up">
          {eyebrow && <Eyebrow className="mb-5">{eyebrow}</Eyebrow>}
          <h1 className="text-[2.6rem] leading-[1.04] md:text-6xl lg:text-7xl">{title}</h1>
          {text && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{text}</p>}
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
        {image && <MediaFrame src={image} alt={title} ratio="4/3" priority sizes="(min-width: 1024px) 45vw, 100vw" />}
      </div>
    </section>
  );
}

/** Closing call-to-action band. */
export function CtaBand({
  title,
  text,
  primary,
  secondary,
}: {
  title: string;
  text?: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="on-dark bg-olive-deep text-paper">
      <div className="container-x flex flex-col gap-8 py-16 md:flex-row md:items-center md:justify-between md:py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl leading-tight md:text-5xl">{title}</h2>
          {text && <p className="mt-4 text-paper/80 md:text-lg">{text}</p>}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href={primary.href} variant="dark">
            {primary.label}
          </Button>
          {secondary && (
            <Button href={secondary.href} variant="outline-light" arrow={false}>
              {secondary.label}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
