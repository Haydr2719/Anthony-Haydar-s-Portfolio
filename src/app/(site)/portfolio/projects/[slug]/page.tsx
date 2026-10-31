import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Check } from "lucide-react";
import { MediaFrame } from "@/components/media";
import { Gallery, VideoCard } from "@/components/media-client";
import { CtaBand, ProjectCard } from "@/components/site/cards";
import { Eyebrow, Prose, Section, SectionHeader, toParagraphs } from "@/components/ui";
import { getMedia, getProject, getProjects, getServices, getSettings } from "@/lib/data";
import { toGalleryItem } from "@/lib/nav";
import { PROJECT_CATEGORIES, labelOf } from "@/lib/options";
import { entryMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

// Detail pages can be switched off in Admin -> Settings -> Portfolio.
const detailsOn = async () => Boolean((await getSettings()).show_project_details);

export async function generateStaticParams() {
  // Switched on later? Pages not built here are rendered on first visit.
  if (!(await detailsOn())) return [];
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!(await detailsOn())) return {};
  const { slug } = await params;
  const p = await getProject(slug);
  return entryMetadata(p, p?.title ?? "Project", p?.summary, p?.cover_image, `/portfolio/projects/${slug}`);
}

export default async function ProjectPage({ params }: Props) {
  // Switched off: send links and bookmarks to the Projects list (temporary 307).
  if (!(await detailsOn())) redirect("/portfolio/projects");
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const [media, all, services] = await Promise.all([getMedia({ projectId: project.id }), getProjects(), getServices()]);
  const related = all.filter((p) => p.id !== project.id && p.category === project.category).concat(all.filter((p) => p.id !== project.id && p.category !== project.category)).slice(0, 3);
  const linkedServices = services.filter((s) => project.service_slugs?.includes(s.slug));

  const story: [string, string | null | undefined][] = [
    ["The brief", project.brief],
    ["Anthony's role", project.role],
    ["What was done", project.work_done],
    ["The outcome", project.outcome],
  ];

  return (
    <>
      <section className="bg-paper pt-14 md:pt-20">
        <div className="container-x">
          <Link href="/portfolio/projects" className="eyebrow hover:underline">
            ← Client Projects
          </Link>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div className="animate-fade-up">
              <Eyebrow className="mb-4">{labelOf(PROJECT_CATEGORIES, project.category)}</Eyebrow>
              <h1 className="text-5xl leading-[1.04] md:text-7xl">{project.title}</h1>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-stone pt-6 text-sm">
              {[
                ["Client", project.client_name],
                ["Location", project.location],
                ["Year", project.year],
                ["Role", project.role],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-muted">{k}</dt>
                    <dd className="mt-1 font-medium">{v}</dd>
                  </div>
                ))}
            </dl>
          </div>
        </div>
        <div className="container-x mt-12">
          <MediaFrame src={project.cover_image} alt={project.title} ratio="21/9" priority sizes="100vw" className="max-md:aspect-[4/3]" />
        </div>
      </section>

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1.6fr_1fr] lg:gap-24">
          <div className="space-y-14">
            {project.summary && <p className="font-serif text-2xl leading-snug md:text-3xl">{project.summary}</p>}
            {story
              .filter(([, v]) => v)
              .map(([title, text]) => (
                <div key={title} className="grid gap-4 md:grid-cols-[180px_1fr] md:gap-10">
                  <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-olive-deep">{title}</h2>
                  <Prose paragraphs={toParagraphs(text)} />
                </div>
              ))}
          </div>
          <aside className="space-y-10">
            {project.highlights.length > 0 && (
              <div>
                <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.2em]">Highlights</h2>
                <ul className="mt-4 divide-y divide-stone border-y border-stone">
                  {project.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3 py-3 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-olive" aria-hidden /> {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {linkedServices.length > 0 && (
              <div>
                <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.2em]">Services</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {linkedServices.map((s) => (
                    <li key={s.slug}>
                      <Link href={`/consultancy/${s.slug}`} className="inline-block border border-stone bg-white px-3 py-2 text-sm hover:border-ink">
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {project.cover_video && <VideoCard url={project.cover_video} title={project.title} />}
          </aside>
        </div>
      </Section>

      {(project.before_image || project.after_image) && (
        <Section tone="paper-2">
          <SectionHeader title="Before & after" />
          <div className="grid gap-5 md:grid-cols-2">
            {[
              ["Before", project.before_image],
              ["After", project.after_image],
            ].map(([label, src]) => (
              <figure key={label}>
                <MediaFrame src={src} alt={`${project.title} - ${label}`} ratio="4/3" sizes="(min-width: 768px) 50vw, 100vw" />
                <figcaption className="eyebrow mt-3">{label}</figcaption>
              </figure>
            ))}
          </div>
        </Section>
      )}

      {media.length > 0 && (
        <Section>
          <SectionHeader title="Gallery" />
          <Gallery items={media.map(toGalleryItem)} />
        </Section>
      )}

      <CtaBand
        title="Planning something similar?"
        text="Tell Anthony about your venue, brand or team."
        primary={{ href: `/contact?type=consultation`, label: "Book a Consultation" }}
      />

      {related.length > 0 && (
        <Section>
          <SectionHeader title="More client projects" action={{ href: "/portfolio/projects", label: "All client projects" }} />
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
