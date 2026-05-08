import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-navy text-navy-foreground">
      <div className="container mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gold text-navy">
                <ShieldCheck className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <span className="font-serif text-xl font-semibold">ElectaCore</span>
            </div>
            <p className="mt-4 max-w-md text-sm text-navy-foreground/70">
              The private elections platform engineered for governance integrity. Cryptographic
              security, audit-grade results, legally defensible records.
            </p>
            <p className="mt-6 text-xs text-navy-foreground/50">
              ElectaCore does not support political or public-office elections. Private organizational use only.
            </p>
          </div>
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-gold">Platform</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-navy-foreground/70">
              <li><Link to="/features" className="hover:text-gold">Features</Link></li>
              <li><Link to="/methods" className="hover:text-gold">Voting Methods</Link></li>
              <li><Link to="/security" className="hover:text-gold">Security</Link></li>
              <li><Link to="/use-cases" className="hover:text-gold">Use Cases</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-gold">Company</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-navy-foreground/70">
              <li><Link to="/pricing" className="hover:text-gold">Pricing</Link></li>
              <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
              <li><Link to="/login" className="hover:text-gold">Sign in</Link></li>
            </ul>
          </div>
        </div>
        <div className="gold-divider mt-12" />
        <div className="mt-6 flex flex-col items-start justify-between gap-2 text-xs text-navy-foreground/50 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} ElectaCore. All rights reserved.</span>
          <span>SOC 2 Type II · ISO 27001 · WCAG 2.2 AA</span>
        </div>
      </div>
    </footer>
  );
}
