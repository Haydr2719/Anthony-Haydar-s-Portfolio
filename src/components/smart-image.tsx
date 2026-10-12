import NextImage, { type ImageProps } from "next/image";
import { canOptimize } from "@/lib/utils";

/** next/image that falls back to an unoptimized image for hosts not configured in next.config.ts. */
export default function Image(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : null;
  return <NextImage {...props} unoptimized={props.unoptimized ?? (src !== null && !canOptimize(src))} />;
}
