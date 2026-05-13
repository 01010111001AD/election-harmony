import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LiveResults } from "@/components/election/LiveResults";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/results/$electionId")({
  component: PublicResults,
  head: ({ params }) => ({
    meta: [
      { title: `Live results — ElectaCore` },
      { name: "description", content: `Live, verifiable election results.` },
    ],
  }),
});

type Election = { id: string; title: string; status: string; organization_id: string | null };
type Org = { name: string; logo_url: string | null; brand_color: string; accent_color: string };

function PublicResults() {
  const { electionId } = Route.useParams();
  const [election, setElection] = useState<Election | null>(null);
  const [org, setOrg] = useState<Org | null>(null);

  useEffect(() => {
    (async () => {
      const { data: el } = await supabase.from("elections").select("id,title,status,organization_id").eq("id", electionId).maybeSingle();
      setElection(el as Election | null);
      if (el?.organization_id) {
        const { data: o } = await supabase.from("organizations").select("name,logo_url,brand_color,accent_color").eq("id", el.organization_id).maybeSingle();
        setOrg(o as Org | null);
      }
    })();
  }, [electionId]);

  if (!election) return <p className="p-12 text-center text-muted-foreground">Loading…</p>;
  const visible = ["open", "closed", "certified"].includes(election.status);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border text-white" style={org ? { background: `linear-gradient(135deg, ${org.brand_color}, ${org.accent_color})` } : { background: "hsl(var(--navy))" }}>
        <div className="container mx-auto flex max-w-3xl items-center gap-3 px-6 py-6">
          {org?.logo_url ? <img src={org.logo_url} alt="" className="h-10 w-10 rounded object-cover" /> : <ShieldCheck className="h-6 w-6 text-gold" />}
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] opacity-80">{org?.name ?? "Live results"}</p>
            <h1 className="font-serif text-2xl font-semibold">{election.title}</h1>
          </div>
          <Badge className="ml-auto bg-white/15 text-white">{election.status}</Badge>
        </div>
      </header>
      <main className="container mx-auto max-w-3xl px-6 py-10">
        <Card>
          <CardHeader><CardTitle className="font-serif">Live tally</CardTitle></CardHeader>
          <CardContent>
            {visible ? (
              <LiveResults electionId={electionId} accentColor={org?.brand_color} />
            ) : (
              <p className="text-sm text-muted-foreground">Results will appear once the election opens.</p>
            )}
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="text-gold hover:underline">ElectaCore</Link> • verifiable elections
        </p>
      </main>
    </div>
  );
}
