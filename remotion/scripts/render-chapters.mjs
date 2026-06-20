import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mirror narration timing
const FPS = 15;
const AUDIO = 176.376;
const SCENES = [
  { id: "intro", w: 14 },
  { id: "setup", w: 65 },
  { id: "candidates", w: 36 },
  { id: "voterRoll", w: 85 },
  { id: "launch", w: 38 },
  { id: "voterExperience", w: 136 },
  { id: "monitoring", w: 59 },
  { id: "close", w: 46 },
  { id: "audit", w: 45 },
  { id: "outro", w: 46 },
];
const total = SCENES.reduce((a, s) => a + s.w, 0);
let cum = 0;
const scenes = SCENES.map((s) => {
  const dur = (s.w / total) * AUDIO;
  const frames = Math.round(dur * FPS);
  const start = cum;
  cum += frames;
  return { ...s, start, end: cum - 1, frames };
});

// Chapter groupings (30-45s each)
const CHAPTERS = [
  { name: "01-intro-setup-candidates", ids: ["intro", "setup", "candidates"] },
  { name: "02-voter-roll-launch", ids: ["voterRoll", "launch"] },
  { name: "03-voter-experience", ids: ["voterExperience"] },
  { name: "04-monitoring-close", ids: ["monitoring", "close"] },
  { name: "05-audit-outro", ids: ["audit", "outro"] },
];

const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (c) => c,
});
const srcPublic = path.resolve(__dirname, "../public");
const dstPublic = path.join(bundled, "public");
fs.mkdirSync(dstPublic, { recursive: true });
for (const f of fs.readdirSync(srcPublic)) fs.copyFileSync(path.join(srcPublic, f), path.join(dstPublic, f));

const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});

const composition = await selectComposition({ serveUrl: bundled, id: "walkthrough", puppeteerInstance: browser, publicDir: srcPublic });

const only = process.env.ONLY; // e.g. "0,1" indices
const indices = only ? only.split(",").map(Number) : CHAPTERS.map((_, i) => i);

for (const i of indices) {
  const ch = CHAPTERS[i];
  const first = scenes.find((s) => s.id === ch.ids[0]).start;
  const last = scenes.find((s) => s.id === ch.ids[ch.ids.length - 1]).end;
  const out = `/mnt/documents/electacore-chapter-${ch.name}.mp4`;
  const sec = ((last - first + 1) / FPS).toFixed(1);
  console.log(`\n=== Chapter ${ch.name}: frames ${first}-${last} (${sec}s) ===`);
  await renderMedia({
    composition,
    serveUrl: bundled,
    publicDir: srcPublic,
    codec: "h264",
    audioCodec: "mp3",
    outputLocation: out,
    puppeteerInstance: browser,
    muted: false,
    concurrency: Number(process.env.CONC ?? 8),
    crf: 22,
    frameRange: [first, last],
    onProgress: ({ progress, renderedFrames }) => {
      if (renderedFrames % 60 === 0) console.log(`  ${(progress * 100).toFixed(0)}% (${renderedFrames}f)`);
    },
  });
  console.log(`  saved ${out}`);
}

await browser.close({ silent: false });
console.log("\nall done");
