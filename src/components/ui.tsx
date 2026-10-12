import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "dark" | "outline" | "outline-light" | "link" | "link-light";

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-olive-deep text-white hover:bg-ink",
  dark: "bg-ink text-paper hover:bg-olive-deep",
  outline: "border border-ink/80 text-ink hover:bg-ink hover:text-paper",
  "outline-light": "border border-paper/60 text-paper hover:bg-paper hover:text-ink",
  link: "!px-0 !min-h-0 text-ink underline-offset-8 decoration-olive hover:underline",
  "link-light": "!px-0 !min-h-0 text-paper underline-offset-8 decoration-olive hover:underline",
};

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  arrow?: boolean;
  external?: boolean;
}

export function Button({ href, children, variant = "primary", className, arrow = true, external }: ButtonProps) {
  const cls = cn(
    "group inline-flex min-h-12 items-center justify-center gap-2 px-6 text-sm font-medium tracking-wide transition-colors duration-300",
    // Call-to-action buttons are pill-shaped; text-link variants have no shape
    !variant.startsWith("link") && "rounded-full",
    buttonStyles[variant],
    className,
  );
  const content = (
    <>
      {children}
      {arrow && <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />}
    </>
  );
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {content}
    </Link>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  text?: string;
  action?: { href: string; label: string };
  as?: "h1" | "h2";
  className?: string;
  light?: boolean;
}

export function SectionHeader({ eyebrow, title, text, action, as: Tag = "h2", className, light }: SectionHeaderProps) {
  return (
    <div className={cn("mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
        <Tag className={cn(Tag === "h1" ? "text-4xl md:text-6xl" : "text-3xl md:text-5xl", "leading-[1.08]")}>{title}</Tag>
        {text && <p className={cn("mt-5 text-base leading-relaxed md:text-lg", light ? "text-paper/70" : "text-muted")}>{text}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className={cn(
            "group inline-flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]",
            light ? "text-paper" : "text-ink",
          )}
        >
          {action.label}
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

export function Section({
  children,
  className,
  tone = "paper",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "paper" | "paper-2" | "ink" | "olive";
  id?: string;
}) {
  const tones = {
    paper: "bg-paper text-ink",
    "paper-2": "bg-paper-2 text-ink",
    ink: "on-dark bg-ink text-paper",
    olive: "on-dark bg-olive-deep text-paper",
  };
  return (
    <section id={id} className={cn("py-20 md:py-28", tones[tone], className)}>
      <div className="container-x">{children}</div>
    </section>
  );
}

export function Badge({ children, tone = "olive" }: { children: React.ReactNode; tone?: "olive" | "ink" | "light" | "muted" }) {
  const tones = {
    olive: "bg-olive-deep text-white",
    ink: "bg-ink text-paper",
    light: "bg-paper/90 text-ink",
    muted: "bg-stone text-ink-3",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em]", tones[tone])}>
      {children}
    </span>
  );
}

export function EmptyState({ title, text, cta }: { title: string; text?: string; cta?: { href: string; label: string } }) {
  return (
    <div className="border border-dashed border-stone bg-paper-2/60 px-6 py-14 text-center">
      <p className="font-serif text-2xl">{title}</p>
      {text && <p className="mx-auto mt-3 max-w-md text-muted">{text}</p>}
      {cta && (
        <div className="mt-6">
          <Button href={cta.href} variant="outline">
            {cta.label}
          </Button>
        </div>
      )}
    </div>
  );
}

export function Prose({ paragraphs, className }: { paragraphs: string[]; className?: string }) {
  return (
    <div className={cn("prose-ah text-base leading-relaxed text-ink-3 md:text-lg", className)}>
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

/** Splits text on blank lines into paragraphs. */
export function toParagraphs(text?: string | null) {
  return (text ?? "")
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
