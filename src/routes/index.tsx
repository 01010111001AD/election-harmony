import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck, Lock, FileCheck2, Vote, Users, Scale, Eye, BarChart3,
  Building2, GraduationCap, Briefcase, Heart, Trophy, Landmark,
  ArrowRight, CheckCircle2, KeyRound, Fingerprint, Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ElectaCore — Private Elections, Engineered for Trust" },
      { name: "description", content: "Cryptographically secure, audit-grade private elections for boards, unions, cooperatives, academic and professional bodies. Not for political elections." },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <Hero />
      <TrustStrip />
      <Pillars />
      <VotingMethods />
      <UseCases />
      <SecurityShowcase />
      <CtaBlock />
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-gradient text-navy-foreground">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, var(--color-gold) 0, transparent 40%), radial-gradient(circle at 80% 70%, var(--color-gold) 0, transparent 35%)",
        }}
      />
      <div className="container relative mx-auto grid max-w-7xl gap-16 px-6 py-24 md:grid-cols-2 md:items-center md:py-32">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-gold">
            <ShieldCheck className="h-3.5 w-3.5" /> Private organizational elections
          </div>
          <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            Elections, <span className="text-gold">engineered</span><br />for trust.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-navy-foreground/75">
            ElectaCore is the end-to-end platform for boards, unions, cooperatives, academic bodies and
            associations. Cryptographic ballot secrecy. Audit-grade results. Legally defensible records.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="gold">
              <Link to="/contact">Request a demo <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outlineGold" className="text-navy-foreground border-gold/60 hover:bg-gold/10">
              <Link to="/security">View security architecture</Link>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs text-navy-foreground/55">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-gold" /> SOC 2 Type II</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-gold" /> ISO 27001</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-gold" /> WCAG 2.2 AA</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-gold" /> GDPR · CCPA</span>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 rounded-3xl bg-gold/20 blur-3xl" />
          <img
            src={heroImg}
            alt="ElectaCore — secure private elections"
            width={1536}
            height={1024}
            className="relative rounded-2xl border border-gold/20 shadow-elegant"
          />
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = ["Boards of Directors", "Cooperatives", "Trade Unions", "Academic Senates", "Professional Bodies", "Sports Federations"];
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="container mx-auto max-w-7xl px-6 py-6">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <span className="text-foreground/60">Trusted across:</span>
          {items.map((i) => <span key={i}>{i}</span>)}
        </div>
      </div>
    </section>
  );
}

const pillars = [
  { icon: Lock, title: "End-to-end encrypted ballots", desc: "ElGamal homomorphic encryption with multi-party threshold key ceremony. No one — not even ElectaCore — can link a voter to a ballot." },
  { icon: FileCheck2, title: "Cryptographic audit trail", desc: "Hash-chained, append-only event log from initialization to certification. Independently verifiable election fingerprint published to all stakeholders." },
  { icon: Vote, title: "Every voting method", desc: "FPTP, IRV/RCV, STV, Approval, Cumulative, Weighted, Borda, Condorcet, STAR, Two-round runoff, Score voting." },
  { icon: Users, title: "Voter, candidate, observer roles", desc: "Granular RBAC: administrators, scrutineers, observers, candidates, voters, legal advisors. Full role-based dashboards." },
  { icon: Scale, title: "Governance-aware", desc: "AI-powered bylaw parser extracts quorum thresholds, eligibility rules, term limits and voting methods from your governing documents." },
  { icon: Eye, title: "Independent verification", desc: "Open-source verifier tool lets observers re-tally encrypted ballots independently and confirm the official result." },
  { icon: BarChart3, title: "Real-time intelligence", desc: "Predictive turnout, quorum risk alerts, anomaly detection, and post-election analytics — all anonymity-preserving." },
  { icon: Globe2, title: "Multi-channel · Multi-lingual", desc: "Web, mobile, SMS, WhatsApp, IVR, in-person kiosk, postal. WCAG 2.2 AA, RTL languages, low-bandwidth mode." },
];

function Pillars() {
  return (
    <section className="container mx-auto max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-gold">The platform</p>
        <h2 className="mt-3 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
          Built like a constitution.<br />Run like critical infrastructure.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Twenty-four integrated modules covering every phase of an election — from governing-document ingestion
          to certified, archived, legally defensible results.
        </p>
      </div>
      <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
        {pillars.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="group flex flex-col gap-3 bg-card p-6 transition-colors hover:bg-accent/40">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-navy text-gold transition-transform group-hover:scale-105">
              <Icon className="h-5 w-5" strokeWidth={2} />
            </div>
            <h3 className="font-serif text-lg font-semibold">{title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const methods = [
  { name: "First Past the Post", abbr: "FPTP", use: "Single-winner, simplest" },
  { name: "Ranked Choice / IRV", abbr: "RCV", use: "Single-winner with ranked preferences" },
  { name: "Single Transferable Vote", abbr: "STV", use: "Multi-winner proportional" },
  { name: "Approval Voting", abbr: "AV", use: "Voters approve any number" },
  { name: "Weighted Voting", abbr: "WV", use: "Shareholder elections" },
  { name: "Two-Round Runoff", abbr: "TRS", use: "Federation presidencies" },
  { name: "STAR Voting", abbr: "STAR", use: "Score then automatic runoff" },
  { name: "Condorcet Method", abbr: "CON", use: "Pairwise comparison" },
  { name: "Borda Count", abbr: "BC", use: "Rank-based scoring" },
  { name: "Cumulative Voting", abbr: "CV", use: "Distribute votes across choices" },
  { name: "Block Voting", abbr: "BV", use: "Multi-seat plurality" },
  { name: "Yes / No Referendum", abbr: "REF", use: "Resolutions, with quorum" },
];

function VotingMethods() {
  return (
    <section className="bg-subtle-gradient py-24">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-gold">Voting methods</p>
            <h2 className="mt-3 font-serif text-4xl font-semibold tracking-tight">
              Every method,<br />mathematically verified.
            </h2>
            <p className="mt-4 text-muted-foreground">
              ElectaCore implements every recognized voting method with peer-reviewed algorithms,
              full round-by-round transfer logs, and a parallel shadow count for verification.
            </p>
            <Button asChild variant="institutional" size="lg" className="mt-6">
              <Link to="/methods">Explore methods <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {methods.map((m) => (
              <div key={m.abbr} className="rounded-lg border border-border bg-card p-4 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-base font-semibold">{m.name}</span>
                  <span className="rounded bg-navy px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-gold">
                    {m.abbr}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{m.use}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const cases = [
  { icon: Building2, title: "Corporate", desc: "Board of Directors, AGM/EGM resolutions, shareholder votes with weighted ballots." },
  { icon: Briefcase, title: "Internal & Union", desc: "Employee councils, union leadership, works councils, staff associations." },
  { icon: GraduationCap, title: "Academic", desc: "Student government, faculty senate, dean selection, ethics boards." },
  { icon: Landmark, title: "Professional Bodies", desc: "Bar associations, medical councils, engineering institutes, trade guilds." },
  { icon: Heart, title: "Non-Profit & Cooperatives", desc: "Trustee elections, member-owner votes, dividend & policy referenda." },
  { icon: Trophy, title: "Sports & Clubs", desc: "Federation presidencies, club committees, disciplinary panels." },
];

function UseCases() {
  return (
    <section className="container mx-auto max-w-7xl px-6 py-24">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-gold">Who runs elections on ElectaCore</p>
        <h2 className="mt-3 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
          Every private election.<br />Never political.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          ElectaCore exists exclusively for organizational governance. We do not, and will not,
          support governmental, partisan, or public-office elections — by design.
        </p>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cases.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant">
            <div className="absolute right-0 top-0 h-20 w-20 -translate-y-10 translate-x-10 rounded-full bg-gold/10 blur-2xl transition-all group-hover:bg-gold/20" />
            <Icon className="h-7 w-7 text-gold" strokeWidth={1.75} />
            <h3 className="mt-4 font-serif text-xl font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const sec = [
  { icon: KeyRound, title: "Threshold key ceremony", desc: "3-of-5 scrutineer quorum required to decrypt results. Documented, witnessed, immutable." },
  { icon: Fingerprint, title: "Zero-knowledge receipts", desc: "Voters verify their ballot was counted — without revealing how they voted." },
  { icon: ShieldCheck, title: "Post-quantum ready", desc: "Hybrid classical + post-quantum cryptographic mode available for highest-security elections." },
];

function SecurityShowcase() {
  return (
    <section className="bg-navy text-navy-foreground">
      <div className="container mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-gold">Security architecture</p>
          <h2 className="mt-3 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
            Trust, but cryptographically verify.
          </h2>
          <p className="mt-4 text-navy-foreground/70">
            Every ballot is encrypted end-to-end. Every action is hash-chained. Every result is
            independently re-tallyable by observers using our open-source verifier.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {sec.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-gold/20 bg-white/[0.03] p-6 backdrop-blur">
              <Icon className="h-7 w-7 text-gold" strokeWidth={1.75} />
              <h3 className="mt-4 font-serif text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-navy-foreground/70">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button asChild variant="gold" size="lg">
            <Link to="/security">Read full security architecture <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function CtaBlock() {
  return (
    <section className="container mx-auto max-w-5xl px-6 py-24">
      <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-card p-10 shadow-elegant md:p-16">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative grid gap-8 md:grid-cols-[2fr_1fr] md:items-center">
          <div>
            <h2 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
              Ready to run your next election with confidence?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Talk to our governance specialists. Most organizations are election-ready within 14 days.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild size="lg" variant="institutional"><Link to="/contact">Request a demo</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/pricing">View pricing</Link></Button>
          </div>
        </div>
      </div>
    </section>
  );
}
