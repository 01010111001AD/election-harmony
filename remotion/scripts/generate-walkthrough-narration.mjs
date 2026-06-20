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
    voice: "coral",
    response_format: "mp3",
    speed: 1.0,
    instructions: "Speak as a real human woman — a warm, conversational product narrator giving a friendly walkthrough. Natural breathing pauses between sentences, gentle intonation, slight smile in the voice. Steady, calm, unhurried pace. Vary pitch and rhythm naturally like spontaneous speech, not a synthesized announcer. Sound relatable and authentic, not robotic or overly polished.",
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
