import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/app/elections/$electionId/results")({
  component: Results,
  head: () => ({ meta: [{ title: "Results — ElectaCore" }] }),
});

type Tally = { id: string; name: string; votes: number; pct: number };

function Results() {
  const { electionId } = Route.useParams();
  const [election, setElection] = useState<any>(null);
  const [tallies, setTallies] = useState<Tally[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: el } = await supabase.from("elections").select("*").eq("id", electionId).single();
      const { data: cands } = await supabase.from("candidates").select("id, name").eq("election_id", electionId);
      const { data: ballots } = await supabase.from("ballots").select("selections").eq("election_id", electionId);
      setElection(el);
      const counts = new Map<string, number>();
      (cands ?? []).forEach((c) => counts.set(c.id, 0));
      (ballots ?? []).forEach((b) => {
        const sel = b.selections as any;
        const ids: string[] = Array.isArray(sel) ? sel : sel?.choices ?? [];
        ids.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
      });
      const totalVotes = ballots?.length ?? 0;
      setTotal(totalVotes);
      const t: Tally[] = (cands ?? []).map((c) => {
        const v = counts.get(c.id) ?? 0;
        return { id: c.id, name: c.name, votes: v, pct: totalVotes ? (v / totalVotes) * 100 : 0 };
      }).sort((a, b) => b.votes - a.votes);
      setTallies(t);
      setLoading(false);
    })();
  }, [electionId]);

  if (loading) return <p className="text-muted-foreground">Tallying…</p>;
  return (
    <div className="space-y-6">
      <div>
        <Link to="/app/elections/$electionId" params={{ electionId }} className="text-xs uppercase tracking-[0.22em] text-gold hover:underline">← Back to election</Link>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">{election?.title} — Results</h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Badge>{election?.status}</Badge>
          <span>{total} ballot{total === 1 ? "" : "s"} cast</span>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle className="font-serif">Tally</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {tallies.length === 0 && <p className="text-sm text-muted-foreground">No candidates.</p>}
          {tallies.map((t, i) => (
            <div key={t.id}>
              <div className="flex justify-between text-sm">
                <span className="font-medium">{i === 0 && total > 0 ? "🏆 " : ""}{t.name}</span>
                <span className="text-muted-foreground">{t.votes} ({t.pct.toFixed(1)}%)</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-gold-gradient" style={{ width: `${t.pct}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
