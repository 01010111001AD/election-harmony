import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/features")({
  component: () => (
    <PageShell
      eyebrow="Platform"
      title="One platform. Twenty-four modules."
      lede="From governing-document ingestion to certified, archived, legally defensible results — every phase of an election under one roof."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {modules.map((m) => (
          <div key={m.title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <p className="font-mono text-xs uppercase tracking-wider text-gold">Module {m.n}</p>
            <h3 className="mt-2 font-serif text-xl font-semibold">{m.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{m.desc}</p>
          </div>
        ))}
      </div>
    </PageShell>
  ),
  head: () => ({ meta: [{ title: "Platform — ElectaCore" }, { name: "description", content: "Twenty-four integrated modules powering every phase of a private election." }] }),
});

const modules = [
  ["01", "Election Lifecycle Engine", "Setup, candidates, ballot design, voting, counting, audit, archival."],
  ["02", "Security & Integrity Framework", "Zero-trust, end-to-end encryption, ZKP receipts, post-quantum ready."],
  ["03", "Candidate Management", "Nominations, vetting, equal-format profiles, withdrawal, Q&A."],
  ["04", "Campaign Ethics Engine", "Code of conduct, disclosures, breach workflow, sanctions."],
  ["05", "Observer & Scrutineer Framework", "Credentialing, dashboards, threshold key ceremony, independent verification."],
  ["06", "Quorum Management", "Real-time tracking, risk alerts, weighted quorum, failure procedures."],
  ["07", "Dispute Resolution", "Pre-, during-, and post-election challenges with arbitration workflow."],
  ["08", "Hybrid & Physical Voting", "Kiosks, paper ballots, postal/absentee, proxy, reconciliation."],
  ["09", "AI/ML Intelligence", "Bylaw NLP parser, anomaly detection, predictive turnout, smart comms."],
  ["10", "Notification Engine", "Email, SMS, WhatsApp, Slack, Teams, IVR, push — orchestrated."],
  ["11", "Accessibility & Inclusion", "WCAG 2.2 AA/AAA, RTL, low-bandwidth, assisted voting."],
  ["12", "Internationalization", "Timezones, currencies, locale formats, jurisdiction matrix."],
  ["13", "Data Governance", "Residency, classification, retention, GDPR/CCPA erasure."],
  ["14", "Disaster Recovery", "RTO 15min, zero-vote-loss RPO, multi-region failover, force majeure."],
  ["15", "Post-Election Governance", "Ratification, certificates, transition, regulatory filings."],
  ["16", "Support & SLA", "5-tier support from self-service to executive escalation."],
  ["17", "Performance & Scale", "Up to 5M concurrent voters, edge CDN, sub-1.5s ballot load."],
  ["18", "Testing & Simulation", "Sandbox, mock elections, load testing, red-team exercises."],
  ["19", "Election Templates Library", "Pre-built configurations for AGMs, unions, faculty senates, more."],
  ["20", "Integration Architecture", "SSO, HRIS, comms, document, financial systems, dev API."],
  ["21", "Multi-Tenancy", "Single org, federations, parent-subsidiary, white-label."],
  ["22", "Branding Engine", "White-label theming, custom domains, branded ballots."],
  ["23", "Analytics & Insights", "Anonymity-preserving real-time and longitudinal analytics."],
  ["24", "Compliance & Audit", "SOC 2, ISO 27001, third-party penetration testing, vuln disclosure."],
].map(([n, title, desc]) => ({ n, title, desc }));
