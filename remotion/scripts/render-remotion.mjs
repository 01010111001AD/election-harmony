import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (c) => c,
});

const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});

const composition = await selectComposition({ serveUrl: bundled, id: "main", puppeteerInstance: browser });

await renderMedia({
  composition,
  serveUrl: bundled,
  codec: "h264",
  audioCodec: "aac",
  outputLocation: process.env.OUT ?? "/mnt/documents/electacore-demo.mp4",
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
