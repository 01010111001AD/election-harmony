import type { ReactNode } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export function PageShell({
  eyebrow, title, lede, children,
}: { eyebrow: string; title: string; lede: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <section className="bg-hero-gradient text-navy-foreground">
        <div className="container mx-auto max-w-5xl px-6 py-20 text-center md:py-28">
          <p className="text-xs uppercase tracking-[0.22em] text-gold">{eyebrow}</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight md:text-6xl">{title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-navy-foreground/75 md:text-lg">{lede}</p>
        </div>
      </section>
      <main className="container mx-auto max-w-5xl px-6 py-16 md:py-24">{children}</main>
      <SiteFooter />
    </div>
  );
}
