// Builds every logo file the website uses from the master logo SVG.
//
//   npm run logo:build            (uses "public/Anthony haydar full black logo.svg")
//   node scripts/build-logo.mjs <master.svg>
//
// The master is an auto-traced SVG (white background + many grey "edge" shapes).
// This script:
//   * drops the background and the light-grey tracing noise,
//   * merges the dark shapes into one solid colour,
//   * seals hairline cracks between traced shapes with a thin same-colour stroke,
//   * crops the artwork into the pieces the site needs.
//
// Outputs (public/logo/*.svg are used as CSS masks, so the site can recolour them):
//   public/logo/full.svg      stacked logo: monogram + name + subtitle
//   public/logo/mark.svg      "AH" monogram only
//   public/logo/wordmark.svg  "ANTHONY HAYDAR" + subtitle
//   public/logo/name.svg      "ANTHONY HAYDAR" only (narrow phones)
//   src/app/icon.svg          browser tab icon (light monogram on charcoal)
//   public/admin-icon.svg     admin app / notification icon (same design)
//
// If a new master has a different layout, update the CROPS below (SVG units).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const master = process.argv[2] ?? `${root}public/Anthony haydar full black logo.svg`;

const MAX_GREY = 0x7c; // keep shapes at least this dark (0 = black, 255 = white)
const SEAL = 1.2; // stroke width that closes hairline cracks

// Measured from the master artwork (1179 x 743): ink bounding boxes plus padding.
const CROPS = {
  full: "98 112 984 556", //     monogram (y 120-464) + name (540-605) + subtitle (639-660)
  mark: "277 112 620 361", //    monogram x 285-888, y 120-464
  wordmark: "100 534 980 132", // name + subtitle, x 106-1073, y 540-660
  name: "100 534 980 78", //      name only (narrow phones), y 540-605
};
// Square icon around the monogram's centre (x 587, y 292).
const ICON = { x: 207, y: -88, size: 760, radius: 150 };

const src = readFileSync(master, "utf8");

// class -> grey level from the <style> block (e.g. ".s5 { fill: #0f0f0f }")
const levels = {};
for (const m of src.matchAll(/\.(s\d+)\s*\{[^}]*fill:\s*#([0-9a-fA-F]{6})/g)) {
  const hex = m[2];
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  levels[m[1]] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
}
const shapes = [...src.matchAll(/<path[^>]*class="(s\d+)"[^>]*\sd="([^"]+)"[^>]*\/>/g)]
  .filter((m) => (levels[m[1]] ?? 255) <= MAX_GREY)
  .map((m) => `<path d="${m[2]}"/>`)
  .join("");
if (!shapes) throw new Error("No dark shapes found - is this the traced master SVG?");

const ink = (color) => `<g fill="${color}" stroke="${color}" stroke-width="${SEAL}" stroke-linejoin="round">${shapes}</g>`;
const svg = (viewBox, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>\n`;

const icon = svg(
  `${ICON.x} ${ICON.y} ${ICON.size} ${ICON.size}`,
  `<rect x="${ICON.x}" y="${ICON.y}" width="${ICON.size}" height="${ICON.size}" rx="${ICON.radius}" fill="#1f1f1d"/>` +
    // clip so only the monogram (not the name below it) appears in the icon
    `<clipPath id="m"><rect x="277" y="112" width="620" height="361"/></clipPath><g clip-path="url(#m)">${ink("#f7f6f1")}</g>`,
);

mkdirSync(`${root}public/logo`, { recursive: true });
const outputs = {
  "public/logo/full.svg": svg(CROPS.full, ink("#1f1f1d")),
  "public/logo/mark.svg": svg(CROPS.mark, ink("#1f1f1d")),
  "public/logo/wordmark.svg": svg(CROPS.wordmark, ink("#1f1f1d")),
  "public/logo/name.svg": svg(CROPS.name, ink("#1f1f1d")),
  "src/app/icon.svg": icon,
  "public/admin-icon.svg": icon,
};
for (const [file, content] of Object.entries(outputs)) {
  writeFileSync(`${root}${file}`, content);
  console.log(`${file}  ${(content.length / 1024).toFixed(1)} KB`);
}
