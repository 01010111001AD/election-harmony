import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { Building2, GraduationCap, Briefcase, Heart, Trophy, Landmark } from "lucide-react";

export const Route = createFileRoute("/use-cases")({
  component: () => (
    <PageShell
      eyebrow="Use cases"
      title="Every private election. Never political."
      lede="ElectaCore exists exclusively for organizational governance. Governmental, partisan and public-office elections are out of scope by design."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {cases.map(({ icon: Icon, title, list }) => (
          <div key={title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <Icon className="h-8 w-8 text-gold" strokeWidth={1.75} />
            <h3 className="mt-4 font-serif text-xl font-semibold">{title}</h3>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {list.map((l) => <li key={l}>· {l}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </PageShell>
  ),
  head: () => ({ meta: [{ title: "Use Cases — ElectaCore" }] }),
});

const cases = [
  { icon: Building2, title: "Corporate", list: ["Board of Directors", "C-Suite appointments", "Shareholder votes (weighted)", "AGM/EGM resolutions", "Committee elections"] },
  { icon: Briefcase, title: "Internal & Union", list: ["Employee representative councils", "Union leadership elections", "Works councils", "Staff associations"] },
  { icon: GraduationCap, title: "Academic & Institutional", list: ["Student government", "Faculty senate", "Dean selection", "Research ethics boards"] },
  { icon: Landmark, title: "Professional Bodies", list: ["Bar associations", "Medical councils", "Engineering institutes", "Trade guilds"] },
  { icon: Heart, title: "Non-Profit & Cooperatives", list: ["Trustee elections", "Member-owner votes", "Dividend policy", "Strategic referenda"] },
  { icon: Trophy, title: "Sports & Clubs", list: ["Federation presidents", "Club committees", "Disciplinary panels", "Membership votes"] },
];
