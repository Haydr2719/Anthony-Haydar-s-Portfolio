// Turns a video clip into the homepage hero's image sequence.
//
//   npm run frames:extract -- public/clip1.mp4
//
// 1. Extracts every frame with ffmpeg (must be installed and on PATH) as
//    public/frames/frame_0001.webp, frame_0002.webp, ... sized exactly 1080x1920
//    (scaled to fill and centre-cropped if the clip isn't 9:16).
// 2. Deletes the previous frame_XXXX.webp files first.
// 3. Warns if the number of frames differs from FRAME_COUNT in hero-scroll.tsx.
// 4. Rebuilds the mobile set (public/frames-mobile) via build-mobile-frames.mjs.
//
// Tip: aim for ~120-180 frames (e.g. a 5-7 s clip at 25 fps). For longer clips,
// pass a lower frame rate: npm run frames:extract -- public/clip.mp4 --fps 20
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith("--"));
const fpsIndex = args.indexOf("--fps");
const fps = fpsIndex >= 0 ? Number(args[fpsIndex + 1]) : null;

const OUT = "public/frames";
const WIDTH = 1080;
const HEIGHT = 1920;
const QUALITY = 82; // WebP quality (0-100)
const HERO_FILE = "src/components/site/hero-scroll.tsx";

if (!input || !existsSync(input)) {
  console.error("Usage: npm run frames:extract -- <video file> [--fps 25]");
  process.exit(1);
}
if (spawnSync("ffmpeg", ["-version"], { stdio: "ignore", shell: true }).status !== 0) {
  console.error("ffmpeg was not found. Install it (e.g. `winget install Gyan.FFmpeg`) and reopen the terminal.");
  process.exit(1);
}

// Remove the previous frames
mkdirSync(OUT, { recursive: true });
const old = readdirSync(OUT).filter((f) => /^frame_\d{4}\.webp$/.test(f));
for (const f of old) rmSync(`${OUT}/${f}`);

// Extract
const filters = [
  ...(fps ? [`fps=${fps}`] : []),
  `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase`,
  `crop=${WIDTH}:${HEIGHT}`,
].join(",");
console.log(`Extracting frames from ${input} ...`);
const result = spawnSync(
  "ffmpeg",
  ["-hide_banner", "-loglevel", "error", "-i", `"${input}"`, "-vf", `"${filters}"`, "-an", "-c:v", "libwebp", "-quality", String(QUALITY), "-compression_level", "6", "-start_number", "1", `"${OUT}/frame_%04d.webp"`],
  { stdio: "inherit", shell: true },
);
if (result.status !== 0) {
  console.error("ffmpeg failed - the previous frames were already removed; restore them with: git checkout -- public/frames");
  process.exit(1);
}

const frames = readdirSync(OUT).filter((f) => /^frame_\d{4}\.webp$/.test(f));
const mb = frames.reduce((sum, f) => sum + statSync(`${OUT}/${f}`).size, 0) / 1024 / 1024;
console.log(`${frames.length} frames -> ${OUT} (${mb.toFixed(1)} MB), replaced ${old.length} old frames`);

// Compare with FRAME_COUNT in the hero component
const configured = Number(readFileSync(HERO_FILE, "utf8").match(/export const FRAME_COUNT = (\d+)/)?.[1]);
if (configured && configured !== frames.length) {
  console.warn(`\n⚠  FRAME_COUNT in ${HERO_FILE} is ${configured} but the clip produced ${frames.length} frames.`);
  console.warn(`   Update it to: export const FRAME_COUNT = ${frames.length};\n`);
}

// Rebuild the mobile frames
console.log("Building mobile frames ...");
const mobile = spawnSync("node", ["scripts/build-mobile-frames.mjs"], { stdio: "inherit", shell: true });
process.exit(mobile.status ?? 0);
