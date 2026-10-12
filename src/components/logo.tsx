import { cn } from "@/lib/utils";

// Logo pieces generated from the master SVG by `npm run logo:build` (scripts/build-logo.mjs).
// They're used as CSS masks filled with the current text colour, so the same file
// works dark-on-light (header) and light-on-dark (footer, admin).
const PARTS = {
  full: { src: "/logo/full.svg", ratio: "984 / 556" },
  mark: { src: "/logo/mark.svg", ratio: "620 / 361" },
  wordmark: { src: "/logo/wordmark.svg", ratio: "980 / 132" },
  name: { src: "/logo/name.svg", ratio: "980 / 78" },
} as const;

function Part({ part, className }: { part: keyof typeof PARTS; className?: string }) {
  const { src, ratio } = PARTS[part];
  return (
    <span
      aria-hidden
      className={cn("block shrink-0 bg-current", className)}
      style={{
        aspectRatio: ratio,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

interface LogoProps {
  /** light logo for dark backgrounds */
  light?: boolean;
  /** "AH" monogram only (admin, small spaces) */
  compact?: boolean;
  /** full stacked logo: monogram above name + subtitle (footer, login, 404) */
  stacked?: boolean;
  className?: string;
}

/**
 * Anthony Haydar logo.
 *  - default: monogram + name side by side (header). Narrow phones show
 *    monogram + name; very narrow phones show the monogram only.
 *  - stacked: the full logo as designed.
 *  - compact: monogram only.
 * Size it with `className` (e.g. "w-48" for stacked, "h-10" for compact).
 */
export function Logo({ light, compact, stacked, className }: LogoProps) {
  const label = "Anthony Haydar - Beverage & Operations Consultant";
  const color = light ? "text-paper" : "text-ink";

  if (stacked) {
    return (
      <span role="img" aria-label={label} className={cn("inline-block", color, className ?? "w-48")}>
        <Part part="full" className="w-full" />
      </span>
    );
  }

  if (compact) {
    return (
      <span role="img" aria-label={label} className={cn("inline-flex", color, className)}>
        <Part part="mark" className={className ? "h-full" : "h-10"} />
      </span>
    );
  }

  return (
    <span role="img" aria-label={label} className={cn("inline-flex items-center gap-2 sm:gap-3", color, className)}>
      <Part part="mark" className="h-8 sm:h-10" />
      <Part part="name" className="hidden h-[10px] min-[370px]:block sm:hidden" />
      <Part part="wordmark" className="hidden h-[26px] sm:block" />
    </span>
  );
}
