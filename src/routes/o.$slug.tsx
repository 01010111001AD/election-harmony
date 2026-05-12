import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/o/$slug")({
  component: OrgPortal,
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Election portal` },
      { name: "description", content: `Cast and verify ballots for ${params.slug}. Secure, auditable elections powered by ElectaCore.` },
      { property: "og:title", content: `${params.slug} — Election portal` },
      { property: "og:description", content: `Open elections and verifiable results for ${params.slug}.` },
    ],
  }),
});

type Org = { id: string; name: string; tagline: string | null; logo_url: string | null; brand_color: string; accent_color: string };
type Election = { id: string; title: string; description: string | null; status: string; method: string; opens_at: string | null; closes_at: string | null };

function OrgPortal() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [org, setOrg] = useState<Org | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");

  useEffect(() => {
    (async () => {
      const { data: o } = await supabase
        .from("organizations")
        .select("id,name,tagline,logo_url,brand_color,accent_color")
        .eq("slug", slug).maybeSingle();
      if (o) {
        setOrg(o as Org);
        const { data: e } = await supabase
          .from("elections")
          .select("id,title,description,status,method,opens_at,closes_at")
          .eq("organization_id", (o as any).id)
          .in("status", ["open", "closed", "certified"])
          .order("created_at", { ascending: false });
        setElections((e ?? []) as Election[]);
      }
      setLoading(false);
    })();
  }, [slug]);

  const verifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = token.trim();
    if (!t) return;
    const { data, error } = await supabase
      .from("voter_roll")
      .select("election_id, has_voted")
      .eq("voting_token", t)
      .maybeSingle();
    if (error || !data) return toast.error("Token not recognized");
    if (data.has_voted) return toast.success("This token has already been used to cast a ballot.");
    navigate({ to: "/vote/$electionId", params: { electionId: data.election_id }, search: { token: t } as any });
  };

  if (loading) return <p className="p-12 text-center text-muted-foreground">Loading…</p>;
  if (!org) return <div className="p-12 text-center"><p className="font-serif text-2xl">Organization not found</p><Link to="/" className="mt-3 inline-block text-gold underline">Go home</Link></div>;

  const open = elections.filter((e) => e.status === "open");
  const past = elections.filter((e) => e.status !== "open");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border text-white" style={{ background: `linear-gradient(135deg, ${org.brand_color}, ${org.accent_color})` }}>
        <div className="mx-auto flex max-w-5xl items-center gap-5 px-6 py-12">
          {org.logo_url && <img src={org.logo_url} alt={`${org.name} logo`} className="h-16 w-16 rounded-xl bg-white/10 object-cover" />}
          <div>
            <p className="text-xs uppercase tracking-[0.22em] opacity-80">Election portal</p>
            <h1 className="mt-1 font-serif text-4xl font-semibold">{org.name}</h1>
            {org.tagline && <p className="mt-1 text-sm opacity-90">{org.tagline}</p>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-12 px-6 py-12">
        <section>
          <h2 className="font-serif text-2xl font-semibold">Open elections</h2>
          {open.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No open elections at this time.</p>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {open.map((e) => (
                <Link key={e.id} to="/vote/$electionId" params={{ electionId: e.id }} className="group rounded-xl border border-border p-5 transition-all hover:border-gold hover:shadow-elegant">
                  <div className="flex items-center gap-2">
                    <Badge style={{ background: org.brand_color, color: "white" }}>Open</Badge>
                    <Badge variant="outline">{e.method}</Badge>
                  </div>
                  <p className="mt-3 font-serif text-xl">{e.title}</p>
                  {e.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{e.description}</p>}
                  {e.closes_at && <p className="mt-3 text-xs text-muted-foreground">Closes {new Date(e.closes_at).toLocaleString()}</p>}
                  <Button size="sm" className="mt-3" style={{ background: org.brand_color, color: "white" }}>Cast your ballot →</Button>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-serif text-xl font-semibold">Have a voting token?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Enter the token from your invitation email to go directly to your ballot.</p>
          <form onSubmit={verifyToken} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Input value={token} onChange={(ev) => setToken(ev.target.value)} placeholder="XXXX-XXXX-XXXX" className="font-mono" />
            <Button type="submit" style={{ background: org.brand_color, color: "white" }}>Verify & vote</Button>
          </form>
        </section>

        {past.length > 0 && (
          <section>
            <h2 className="font-serif text-2xl font-semibold">Past elections</h2>
            <div className="mt-4 space-y-2">
              {past.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                  <div><p className="font-medium">{e.title}</p><p className="text-xs text-muted-foreground">{e.status === "certified" ? "Certified" : "Closed"}{e.closes_at ? ` • ${new Date(e.closes_at).toLocaleDateString()}` : ""}</p></div>
                  <Badge variant="outline">{e.status}</Badge>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Secured by <Link to="/" className="text-gold hover:underline">ElectaCore</Link>
      </footer>
    </div>
  );
}
