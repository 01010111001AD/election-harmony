// Generate detailed walkthrough narration mp3 via Lovable AI TTS (female voice).
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { narrationText } from "../src/walkthrough/narration.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "openai/gpt-4o-mini-tts",
    input: narrationText,
    voice: "shimmer",
    response_format: "mp3",
    instructions: "Speak warmly and professionally, like a confident product narrator. Measured pace, clear articulation, subtle authority. Slightly slower than a typical commercial so the viewer can absorb technical details.",
  }),
});

if (!res.ok) {
  console.error("TTS failed:", res.status, await res.text());
  process.exit(1);
}

const buf = Buffer.from(await res.arrayBuffer());
const out = path.resolve(__dirname, "../public/walkthrough-narration.mp3");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, buf);
console.log("wrote", out, buf.length, "bytes");
