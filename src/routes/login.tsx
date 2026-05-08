import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  component: () => (
    <PageShell
      eyebrow="Sign in"
      title="Authentication coming in Phase 2."
      lede="Phase 2 of the build will introduce administrator and voter authentication, election creation, electoral roll, ballot, voting, and live results."
    >
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
        <p className="text-sm text-muted-foreground">
          The foundation, design system, and routing are now in place. Continue the build to unlock
          authentication and the full election engine.
        </p>
        <Button asChild className="mt-6" variant="institutional"><Link to="/">Back to home</Link></Button>
      </div>
    </PageShell>
  ),
  head: () => ({ meta: [{ title: "Sign in — ElectaCore" }] }),
});
