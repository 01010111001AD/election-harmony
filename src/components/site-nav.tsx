import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/features", label: "Platform" },
  { to: "/methods", label: "Voting Methods" },
  { to: "/security", label: "Security" },
  { to: "/use-cases", label: "Use Cases" },
  { to: "/pricing", label: "Pricing" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-navy text-gold shadow-soft">
            <ShieldCheck className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-lg font-semibold tracking-tight">ElectaCore</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Private Elections</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" variant="institutional">
            <Link to="/contact">Request Demo</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
