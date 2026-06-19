import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (c) => c,
});

// Copy public/ into the bundle so staticFile() works.
const srcPublic = path.resolve(__dirname, "../public");
const dstPublic = path.join(bundled, "public");
fs.mkdirSync(dstPublic, { recursive: true });
for (const f of fs.readdirSync(srcPublic)) {
  fs.copyFileSync(path.join(srcPublic, f), path.join(dstPublic, f));
}
console.log("bundle:", bundled, "public files:", fs.readdirSync(dstPublic));

const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});

const publicDir = path.resolve(__dirname, "../public");

const composition = await selectComposition({ serveUrl: bundled, id: "walkthrough", puppeteerInstance: browser, publicDir });

await renderMedia({
  composition,
  serveUrl: bundled,
  publicDir,
  codec: "h264",
  audioCodec: "mp3",
  outputLocation: process.env.OUT ?? "/mnt/documents/electacore-walkthrough.mp4",
  puppeteerInstance: browser,
  muted: false,
  concurrency: Number(process.env.CONC ?? 4),
  crf: 20,
  onProgress: ({ progress, renderedFrames, encodedFrames }) => {
    if (renderedFrames % 30 === 0) {
      console.log(`progress=${(progress*100).toFixed(1)}% rendered=${renderedFrames} encoded=${encodedFrames}`);
    }
  },
});

await browser.close({ silent: false });
console.log("done");
