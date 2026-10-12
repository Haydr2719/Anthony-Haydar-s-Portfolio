import Image from "@/components/smart-image";
import { cn } from "@/lib/utils";

const ratios = {
  "16/9": "aspect-video",
  "4/3": "aspect-[4/3]",
  "4/5": "aspect-[4/5]",
  "3/4": "aspect-[3/4]",
  "1/1": "aspect-square",
  "9/16": "aspect-[9/16]",
  "21/9": "aspect-[21/9]",
  fill: "",
} as const;

export type Ratio = keyof typeof ratios;

interface MediaFrameProps {
  src?: string | null;
  mobileSrc?: string | null;
  alt: string;
  ratio?: Ratio;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  label?: string;
}

/**
 * Responsive, lazy-loaded image (AVIF/WebP via next/image) with an on-brand
 * placeholder when no photo has been uploaded yet.
 */
export function MediaFrame({
  src,
  mobileSrc,
  alt,
  ratio = "4/3",
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority,
  className,
  imgClassName,
  label,
}: MediaFrameProps) {
  return (
    <div className={cn("relative overflow-hidden bg-ink-2", ratios[ratio], className)}>
      {src ? (
        <>
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className={cn("object-cover", mobileSrc && "hidden md:block", imgClassName)}
          />
          {mobileSrc && (
            <Image src={mobileSrc} alt={alt} fill sizes="100vw" priority={priority} className={cn("object-cover md:hidden", imgClassName)} />
          )}
        </>
      ) : (
        <Placeholder label={label ?? alt} />
      )}
    </div>
  );
}

export function Placeholder({ label }: { label?: string }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 flex items-end bg-[radial-gradient(120%_90%_at_80%_10%,#4b5040_0%,#2a2a27_45%,#1f1f1d_100%)] p-5"
    >
      <svg viewBox="0 0 100 100" className="absolute right-5 top-5 size-10 text-paper/15" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="8" y="18" width="84" height="64" rx="2" />
        <circle cx="34" cy="40" r="8" />
        <path d="M8 72 38 50l18 14 14-10 22 18" />
      </svg>
      {label && <span className="relative font-serif text-sm italic text-paper/45">{label}</span>}
    </div>
  );
}
