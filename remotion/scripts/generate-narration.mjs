// Generate narration mp3 via Lovable AI TTS (female voice).
import fs from "fs";
import path from "path";

const text = `Meet ElectaCore — the trusted platform for private elections. As an administrator, I configure a new ballot in minutes: title, voting method, and eligible voters. Once published, each voter receives a unique cryptographic token. They open the ballot, review every candidate, and cast their vote — sealed, anonymous, tamper-proof. Results stream in live, fully auditable and cryptographically verifiable. From boards and unions to cooperatives and academic bodies, ElectaCore makes every election secure, transparent, and effortless. Every vote, accounted for.`;

const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "openai/gpt-4o-mini-tts",
    input: text,
    voice: "shimmer",
    response_format: "mp3",
    instructions: "Speak warmly and professionally, like a confident product narrator. Measured pace, clear articulation, subtle authority.",
  }),
});

if (!res.ok) {
  console.error("TTS failed:", res.status, await res.text());
  process.exit(1);
}

const buf = Buffer.from(await res.arrayBuffer());
const out = path.resolve("public/narration.mp3");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, buf);
console.log("wrote", out, buf.length, "bytes");
