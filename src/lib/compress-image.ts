// Browser-side image compression for admin uploads (runs before the file is
// sent to Supabase Storage).
//
//   * resizes so the longest side is at most MAX_SIDE px (never upscales)
//   * converts to WebP at QUALITY (visually identical on screen)
//   * respects the photo's orientation (phones store rotation in EXIF)
//   * drops all metadata - including GPS location - because the image is redrawn
//
// SVGs, GIFs (may be animated) and non-images are returned untouched, as are
// files that wouldn't get smaller.

export const MAX_SIDE = 2400;
export const QUALITY = 0.85;

export interface CompressResult {
  file: File;
  originalSize: number;
  compressed: boolean;
}

const SKIP_TYPES = ["image/svg+xml", "image/gif"];

export async function compressImage(file: File): Promise<CompressResult> {
  const untouched = { file, originalSize: file.size, compressed: false };
  if (!file.type.startsWith("image/") || SKIP_TYPES.includes(file.type)) return untouched;

  let bitmap: ImageBitmap;
  try {
    // "from-image" applies the EXIF rotation, so portrait phone photos stay upright.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return untouched; // a format this browser can't decode (e.g. HEIC on some browsers)
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return untouched;
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // WebP keeps transparency (logos). If this browser can't encode WebP it
  // returns PNG instead: then keep PNG for transparent sources, JPEG otherwise.
  let blob = await toBlob(canvas, "image/webp", QUALITY);
  if (!blob || blob.type !== "image/webp") {
    const fallback = file.type === "image/png" ? "image/png" : "image/jpeg";
    blob = await toBlob(canvas, fallback, QUALITY);
  }
  if (!blob || blob.size >= file.size) return untouched; // no gain - keep the original

  const ext = blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : "jpg";
  const name = `${file.name.replace(/\.[^.]+$/, "") || "image"}.${ext}`;
  return { file: new File([blob], name, { type: blob.type, lastModified: Date.now() }), originalSize: file.size, compressed: true };
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

export function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
