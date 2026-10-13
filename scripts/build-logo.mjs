// Builds every logo file the website uses from the master logo SVG.
//
//   npm run logo:build            (uses "public/Official Logo.svg")
//   node scripts/build-logo.mjs <master.svg>
//
// The master is a Canva SVG export:
//   * "ANTHONY HAYDAR" and the subtitle are vector glyphs (kept as vectors),
//   * the "AH" monogram is an embedded bitmap used as a luminance mask,
//   * a near-white background image and soft text shadows (both dropped).
// This script:
//   * collects the text glyphs and places them in page coordinates,
//   * turns the monogram mask into a transparent PNG (embedded in the output),
//   * measures each piece and crops the artwork with a little padding,
//   * writes the pieces' aspect ratios into src/components/logo.tsx.
//
// Outputs (public/logo/*.svg are used as CSS masks, so the site can recolour them):
//   public/logo/full.svg      stacked logo: monogram + name + subtitle
//   public/logo/mark.svg      "AH" monogram only
//   public/logo/wordmark.svg  "ANTHONY HAYDAR" + subtitle
//   public/logo/name.svg      "ANTHONY HAYDAR" only (narrow phones)
//   src/app/icon.svg          browser tab icon (light monogram on charcoal)
//   public/admin-icon.svg     admin app / notification icon (same design)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("..", import.meta.url));
const master = process.argv[2] ?? `${root}public/Official Logo.svg`;

const INK = "#1f1f1d";
const PAPER = "#f7f6f1";
const PAD = 6; // padding around each crop (SVG units)
const MASK_FLOOR = 24; // monogram mask levels at or below this are background noise (0-255)

const src = readFileSync(master, "utf8");
const num = (s) => s.split(/[\s,]+/).filter(Boolean).map(Number);

// --- text glyphs -----------------------------------------------------------
// Each text box is <g transform="matrix(1, 0, 0, 1, X, Y)"> holding glyphs
// <g transform="translate(x, y)"><g><path d="..."/></g></g> (absolute commands).
const firstBlock = src.search(/<g transform="matrix\(1, 0, 0, 1, /);
if (firstBlock < 0) throw new Error("No text boxes found - is this the Canva master SVG?");
const blocks = [];
for (const m of src.slice(firstBlock).matchAll(/<g transform="matrix\(1, 0, 0, 1, ([^)]+)\)">|<g transform="translate\(([^)]+)\)"><g><path d="([^"]+)"/g)) {
  if (m[1]) {
    const [x, y] = num(m[1]).slice(-2);
    blocks.push({ x, y, glyphs: [] });
  } else {
    const [tx, ty] = num(m[2]);
    blocks.at(-1).glyphs.push({ x: blocks.at(-1).x + tx, y: blocks.at(-1).y + ty, d: m[3] });
  }
}
const glyphBox = ({ x, y, d }) => {
  const n = num(d.replace(/[A-Za-z]/g, " "));
  const xs = n.filter((_, i) => i % 2 === 0).map((v) => v + x);
  const ys = n.filter((_, i) => i % 2 === 1).map((v) => v + y);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
};
const union = (boxes) => [
  Math.min(...boxes.map((b) => b[0])),
  Math.min(...boxes.map((b) => b[1])),
  Math.max(...boxes.map((b) => b[2])),
  Math.max(...boxes.map((b) => b[3])),
];
// The name line is the top row of text boxes ("ANTHONY" + "HAYDAR"); the rest is the subtitle.
const topY = Math.min(...blocks.map((b) => b.y));
const nameGlyphs = blocks.filter((b) => b.y - topY < 10).flatMap((b) => b.glyphs);
const subGlyphs = blocks.filter((b) => b.y - topY >= 10).flatMap((b) => b.glyphs);
if (!nameGlyphs.length || !subGlyphs.length) throw new Error("Expected a name line and a subtitle line of text.");
const nameBox = union(nameGlyphs.map(glyphBox));
const subBox = union(subGlyphs.map(glyphBox));
const glyphs = (list) => list.map((g) => `<path transform="translate(${+g.x.toFixed(3)} ${+g.y.toFixed(3)})" d="${g.d}"/>`).join("");

// --- monogram --------------------------------------------------------------
// The only masked image drawn before the text boxes is the monogram.
const usedMasks = [...src.slice(0, firstBlock).matchAll(/mask="url\(#([^)]+)\)"/g)].map((m) => m[1]);
if (usedMasks.length !== 1) throw new Error(`Expected one monogram mask, found ${usedMasks.length}.`);
const maskDef = src.match(new RegExp(`<mask id="${usedMasks[0]}">[\\s\\S]*?</mask>`))?.[0];
const [, mt, mpng] = maskDef?.match(/transform="matrix\(([^)]+)\)"[^>]*>\s*<image[^>]*base64,([A-Za-z0-9+/=]+)/) ?? [];
if (!mpng) throw new Error("Could not read the monogram mask image.");
const [sx, , , sy, ox, oy] = num(mt);

// luminance mask -> alpha, cropped to the ink
const { data: lum, info } = await sharp(Buffer.from(mpng, "base64")).greyscale().extractChannel(0).raw().toBuffer({ resolveWithObject: true });
let [x0, y0, x1, y1] = [info.width, info.height, -1, -1];
for (let y = 0; y < info.height; y++)
  for (let x = 0; x < info.width; x++) {
    const i = y * info.width + x;
    if (lum[i] <= MASK_FLOOR) {
      lum[i] = 0;
      continue;
    }
    [x0, y0, x1, y1] = [Math.min(x0, x), Math.min(y0, y), Math.max(x1, x), Math.max(y1, y)];
  }
if (x1 < 0) throw new Error("The monogram mask is empty.");
const [pw, ph] = [x1 - x0 + 1, y1 - y0 + 1];
const monogramPng = async (color) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
  const rgba = Buffer.alloc(pw * ph * 4);
  for (let y = 0; y < ph; y++)
    for (let x = 0; x < pw; x++) {
      const o = (y * pw + x) * 4;
      [rgba[o], rgba[o + 1], rgba[o + 2], rgba[o + 3]] = [r, g, b, lum[(y0 + y) * info.width + x0 + x]];
    }
  const png = await sharp(rgba, { raw: { width: pw, height: ph, channels: 4 } }).png({ compressionLevel: 9 }).toBuffer();
  return png.toString("base64");
};
const markBox = [ox + sx * x0, oy + sy * y0, ox + sx * (x1 + 1), oy + sy * (y1 + 1)];
const monogram = async (color) =>
  `<image x="${+markBox[0].toFixed(3)}" y="${+markBox[1].toFixed(3)}" width="${+(markBox[2] - markBox[0]).toFixed(3)}" height="${+(markBox[3] - markBox[1]).toFixed(3)}" preserveAspectRatio="none" href="data:image/png;base64,${await monogramPng(color)}"/>`;

// --- outputs ---------------------------------------------------------------
const viewBox = (box) => {
  const [x, y, w, h] = [box[0] - PAD, box[1] - PAD, box[2] - box[0] + 2 * PAD, box[3] - box[1] + 2 * PAD].map(Math.round);
  return { attr: `${x} ${y} ${w} ${h}`, ratio: `${w} / ${h}` };
};
const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.attr}">${body}</svg>\n`;
const text = (list) => `<g fill="${INK}">${glyphs(list)}</g>`;

const crops = {
  full: viewBox(union([markBox, nameBox, subBox])),
  mark: viewBox(markBox),
  wordmark: viewBox(union([nameBox, subBox])),
  name: viewBox(nameBox),
};

// Square icon around the monogram's centre.
const [cx, cy] = [(markBox[0] + markBox[2]) / 2, (markBox[1] + markBox[3]) / 2];
const size = Math.round((markBox[2] - markBox[0]) * 1.26);
const [ix, iy] = [Math.round(cx - size / 2), Math.round(cy - size / 2)];
const icon = svg(
  { attr: `${ix} ${iy} ${size} ${size}` },
  `<rect x="${ix}" y="${iy}" width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="${INK}"/>${await monogram(PAPER)}`,
);

const darkMark = await monogram(INK);
mkdirSync(`${root}public/logo`, { recursive: true });
const outputs = {
  "public/logo/full.svg": svg(crops.full, darkMark + text([...nameGlyphs, ...subGlyphs])),
  "public/logo/mark.svg": svg(crops.mark, darkMark),
  "public/logo/wordmark.svg": svg(crops.wordmark, text([...nameGlyphs, ...subGlyphs])),
  "public/logo/name.svg": svg(crops.name, text(nameGlyphs)),
  "src/app/icon.svg": icon,
  "public/admin-icon.svg": icon,
};
for (const [file, content] of Object.entries(outputs)) {
  writeFileSync(`${root}${file}`, content);
  console.log(`${file}  ${(content.length / 1024).toFixed(1)} KB`);
}

// Keep the Logo component's aspect ratios in sync with the new crops.
const logoFile = `${root}src/components/logo.tsx`;
let logo = readFileSync(logoFile, "utf8");
for (const [part, { ratio }] of Object.entries(crops)) {
  logo = logo.replace(new RegExp(`(${part}: \\{ src: "/logo/${part}\\.svg", ratio: )"[^"]*"`), `$1"${ratio}"`);
}
writeFileSync(logoFile, logo);
console.log(`src/components/logo.tsx  ratios: ${Object.entries(crops).map(([p, c]) => `${p} ${c.ratio}`).join(", ")}`);
