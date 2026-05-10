import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { SiteFooter } from "@/components/site-footer";
import { ShieldCheck, LayoutDashboard, LogOut, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Verifying session…</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/app/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-navy text-gold shadow-soft">
              <ShieldCheck className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-serif text-lg font-semibold tracking-tight">ElectaCore</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Console</span>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/app/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
            <Link to="/app/organizations" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>
              <Building2 className="h-4 w-4" /> Organizations
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto max-w-7xl px-6 py-10">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
