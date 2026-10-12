// Creates the smaller mobile frame set used by the hero animation on phones.
//
//   npm run frames:mobile
//
// Reads  public/frames/frame_0001.webp ... (1080x1920)
// Writes public/frames-mobile/frame_0001.webp ... (720x1280, lighter compression)
// Rerun it whenever you replace the desktop frames.
import { mkdirSync, readdirSync, statSync } from "node:fs";
import sharp from "sharp";

const SRC = "public/frames";
const OUT = "public/frames-mobile";
const WIDTH = 720;
const HEIGHT = 1280;
const QUALITY = 72;

mkdirSync(OUT, { recursive: true });
const files = readdirSync(SRC).filter((f) => /^frame_\d{4}\.webp$/.test(f)).sort();
if (!files.length) throw new Error(`No frame_XXXX.webp files found in ${SRC}`);

let before = 0;
let after = 0;
for (const file of files) {
  before += statSync(`${SRC}/${file}`).size;
  const info = await sharp(`${SRC}/${file}`).resize(WIDTH, HEIGHT, { fit: "cover" }).webp({ quality: QUALITY }).toFile(`${OUT}/${file}`);
  after += info.size;
}
const mb = (n) => (n / 1024 / 1024).toFixed(1);
console.log(`${files.length} frames -> ${OUT} (${mb(before)} MB -> ${mb(after)} MB)`);
