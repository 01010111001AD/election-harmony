import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LiveResults } from "@/components/election/LiveResults";
import { CheckCircle2, Vote } from "lucide-react";

export const Route = createFileRoute("/_authenticated/my")({
  component: MyBallots,
  head: () => ({ meta: [{ title: "My ballots — ElectaCore" }] }),
});

type Row = {
  id: string;
  has_voted: boolean;
  election_id: string;
  election: {
    id: string; title: string; description: string | null; status: string; method: string;
    closes_at: string | null; organization_id: string | null;
  } | null;
};
type Org = { id: string; name: string; logo_url: string | null; brand_color: string; accent_color: string };

function MyBallots() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [orgs, setOrgs] = useState<Record<string, Org>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("voter_roll")
        .select("id, has_voted, election_id, election:elections(id,title,description,status,method,closes_at,organization_id)")
        .eq("user_id", user.id);
      const list = (data ?? []) as any as Row[];
      setRows(list);
      const orgIds = Array.from(new Set(list.map((r) => r.election?.organization_id).filter(Boolean) as string[]));
      if (orgIds.length) {
        const { data: o } = await supabase.from("organizations").select("id,name,logo_url,brand_color,accent_color").in("id", orgIds);
        const map: Record<string, Org> = {};
        (o ?? []).forEach((row: any) => { map[row.id] = row; });
        setOrgs(map);
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const open = rows.filter((r) => r.election?.status === "open");
  const past = rows.filter((r) => r.election && r.election.status !== "open");

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-gold">Voter</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight">My ballots</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every election you're enrolled in. Cast your ballot or watch live results.</p>
      </div>

      <section>
        <h2 className="mb-3 font-serif text-xl">Open now</h2>
        {open.length === 0 ? <p className="text-sm text-muted-foreground">No open ballots.</p> : (
          <div className="grid gap-4 md:grid-cols-2">
            {open.map((r) => <BallotCard key={r.id} row={r} org={r.election?.organization_id ? orgs[r.election.organization_id] : undefined} />)}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="mb-3 font-serif text-xl">Closed & certified</h2>
          <div className="space-y-6">
            {past.map((r) => (
              <Card key={r.id}>
                <CardContent className="space-y-4 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {r.election?.organization_id && orgs[r.election.organization_id]?.logo_url && (
                        <img src={orgs[r.election.organization_id].logo_url!} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="font-serif text-lg">{r.election?.title}</p>
                        <p className="text-xs text-muted-foreground">{r.has_voted ? "You voted" : "Did not vote"}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{r.election?.status}</Badge>
                  </div>
                  <LiveResults electionId={r.election_id} accentColor={r.election?.organization_id ? orgs[r.election.organization_id]?.brand_color : undefined} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function BallotCard({ row, org }: { row: Row; org?: Org }) {
  const bg = org ? `linear-gradient(135deg, ${org.brand_color}, ${org.accent_color})` : "hsl(var(--navy))";
  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-4 text-white" style={{ background: bg }}>
        <div className="flex items-center gap-3">
          {org?.logo_url && <img src={org.logo_url} alt="" className="h-9 w-9 rounded bg-white/10 object-cover" />}
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] opacity-80">{org?.name ?? "Election"}</p>
            <p className="font-serif text-lg">{row.election?.title}</p>
          </div>
        </div>
      </div>
      <CardContent className="space-y-3 py-4">
        {row.election?.description && <p className="text-sm text-muted-foreground line-clamp-2">{row.election.description}</p>}
        {row.has_voted ? (
          <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Ballot received — thank you
          </div>
        ) : (
          <Button asChild className="w-full" variant="institutional">
            <Link to="/vote/$electionId" params={{ electionId: row.election_id }}><Vote className="h-4 w-4" /> Cast your ballot</Link>
          </Button>
        )}
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link to="/results/$electionId" params={{ electionId: row.election_id }}>View live results</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
