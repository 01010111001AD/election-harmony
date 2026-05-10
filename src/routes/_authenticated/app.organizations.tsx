import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Building2 } from "lucide-react";

type Org = { id: string; name: string; slug: string; brand_color: string | null; accent_color: string | null; logo_url: string | null; tagline: string | null };

export const Route = createFileRoute("/_authenticated/app/organizations")({
  component: OrgsPage,
  head: () => ({ meta: [{ title: "Organizations — ElectaCore" }] }),
});

function OrgsPage() {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("organization_members")
      .select("organization_id, organizations(*)")
      .eq("user_id", user.id);
    setOrgs(((data ?? []).map((r: any) => r.organizations).filter(Boolean)) as Org[]);
  };
  useEffect(() => { load(); }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gold">Tenants</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight">Organizations</h1>
          <p className="mt-1 text-sm text-muted-foreground">Each organization is an isolated tenant with its own brand, members, and elections.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="institutional"><Plus className="h-4 w-4" /> New organization</Button></DialogTrigger>
          <CreateOrgDialog onCreated={() => { setOpen(false); load(); }} />
        </Dialog>
      </div>

      {orgs.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">No organizations yet. Create one to enable white-label deployments.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orgs.map((o) => (
            <Card key={o.id} className="overflow-hidden transition-shadow hover:shadow-elegant">
              <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${o.brand_color ?? "#0B1F3A"}, ${o.accent_color ?? "#C9A227"})` }} />
              <CardHeader>
                <div className="flex items-center gap-3">
                  {o.logo_url ? (
                    <img src={o.logo_url} alt="" className="h-10 w-10 rounded object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-navy/10"><Building2 className="h-5 w-5 text-navy" /></div>
                  )}
                  <div>
                    <CardTitle className="font-serif text-xl">{o.name}</CardTitle>
                    <CardDescription className="font-mono text-xs">{o.slug}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/app/organizations/$orgId" params={{ orgId: o.id }}>Manage tenant</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateOrgDialog({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const cleanSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { error } = await supabase.from("organizations").insert({ name, slug: cleanSlug, created_by: user.id });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Organization created");
    onCreated();
  };

  return (
    <DialogContent>
      <DialogHeader><DialogTitle className="font-serif text-2xl">New organization</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div><Label htmlFor="n">Name</Label><Input id="n" required value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label htmlFor="s">Slug</Label><Input id="s" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto from name" /></div>
        <DialogFooter><Button type="submit" variant="institutional" disabled={submitting}>{submitting ? "Creating…" : "Create tenant"}</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}
