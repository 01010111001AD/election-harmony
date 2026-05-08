import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: () => (
    <PageShell
      eyebrow="Pricing"
      title="Right-sized for every organization."
      lede="From single-election clubs to multi-region enterprises, all tiers include cryptographic ballot secrecy and full audit trails."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`relative rounded-2xl border p-7 shadow-soft ${
              t.featured ? "border-gold bg-card shadow-elegant" : "border-border bg-card"
            }`}
          >
            {t.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-gradient px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold-foreground">
                Most Popular
              </span>
            )}
            <h3 className="font-serif text-2xl font-semibold">{t.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
            <p className="mt-5 font-serif text-4xl font-semibold">
              {t.price}
              <span className="ml-1 text-sm font-normal text-muted-foreground">{t.unit}</span>
            </p>
            <Button asChild className="mt-6 w-full" variant={t.featured ? "institutional" : "outline"}>
              <Link to="/contact">{t.cta}</Link>
            </Button>
            <ul className="mt-6 space-y-2.5 text-sm">
              {t.features.map((f) => (
                <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PageShell>
  ),
  head: () => ({ meta: [{ title: "Pricing — ElectaCore" }] }),
});

const tiers = [
  { name: "Standard", tagline: "Clubs, associations, single elections", price: "$499", unit: "/ election", cta: "Start with Standard",
    features: ["Up to 10,000 voters", "All voting methods", "Email + SMS notifications", "Standard audit trail", "Self-service support"] },
  { name: "Professional", tagline: "Cooperatives, unions, mid-sized boards", price: "$2,400", unit: "/ election", cta: "Choose Professional", featured: true,
    features: ["Up to 100,000 voters", "Observer & scrutineer dashboards", "Bylaw NLP parser", "WhatsApp + IVR channels", "Priority support (T3)", "Pre-election review"] },
  { name: "Enterprise", tagline: "Federations, multi-region, white-label", price: "Custom", unit: "", cta: "Talk to sales",
    features: ["Up to 5,000,000 voters", "White-label branding & domain", "Threshold HSM key ceremony", "Multi-region active-active", "Dedicated war-room (T4)", "Custom integrations"] },
];
