import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { Lock, KeyRound, Fingerprint, ShieldCheck, FileCheck2, Eye } from "lucide-react";

export const Route = createFileRoute("/security")({
  component: () => (
    <PageShell
      eyebrow="Security architecture"
      title="Trust, but cryptographically verify."
      lede="Every ballot is encrypted end-to-end. Every action is hash-chained. Every result is independently re-tallyable."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {pillars.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <Icon className="h-8 w-8 text-gold" strokeWidth={1.75} />
            <h3 className="mt-4 font-serif text-xl font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 rounded-xl border border-gold/30 bg-navy p-8 text-navy-foreground">
        <h3 className="font-serif text-2xl font-semibold">Compliance & certifications</h3>
        <div className="mt-4 grid gap-3 text-sm text-navy-foreground/80 sm:grid-cols-2">
          <span>· SOC 2 Type II (annual)</span>
          <span>· ISO 27001 certified data centers</span>
          <span>· GDPR · UK GDPR · CCPA</span>
          <span>· WCAG 2.2 Level AA (AAA targets)</span>
          <span>· PCI DSS (where applicable)</span>
          <span>· Annual third-party penetration test</span>
        </div>
      </div>
    </PageShell>
  ),
  head: () => ({ meta: [{ title: "Security — ElectaCore" }] }),
});

const pillars = [
  { icon: Lock, title: "End-to-end encryption", desc: "ElGamal homomorphic encryption or Mixnet protocol — tally without decrypting individual ballots." },
  { icon: KeyRound, title: "Threshold key ceremony", desc: "Multi-party secret sharing (e.g. 3-of-5 scrutineers) required to decrypt results. Witnessed and recorded." },
  { icon: Fingerprint, title: "Zero-knowledge receipts", desc: "Voters cryptographically verify their ballot counted without revealing its contents." },
  { icon: FileCheck2, title: "Hash-chained audit log", desc: "SHA-256 chain over every system action — any tampering breaks the chain visibly." },
  { icon: Eye, title: "Independent verification", desc: "Open-source verifier tool lets observers re-tally encrypted ballots and confirm results." },
  { icon: ShieldCheck, title: "Post-quantum readiness", desc: "Hybrid classical + post-quantum mode available, aligned to NIST PQC standards." },
];
