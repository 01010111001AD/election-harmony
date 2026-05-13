import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Tally = { candidate_id: string; name: string; photo_url: string | null; votes: number };

export function LiveResults({ electionId, accentColor }: { electionId: string; accentColor?: string }) {
  const [tallies, setTallies] = useState<Tally[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const { data, error } = await supabase.rpc("tally_election", { _id: electionId });
    if (error || !data) { setLoading(false); return; }
    const rows = (data as any[]).map((r) => ({
      candidate_id: r.candidate_id, name: r.name, photo_url: r.photo_url, votes: Number(r.votes),
    }));
    rows.sort((a, b) => b.votes - a.votes);
    setTallies(rows);
    setTotal(rows.reduce((s, r) => s + r.votes, 0));
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const channel = supabase
      .channel(`results-${electionId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ballots", filter: `election_id=eq.${electionId}` }, () => refresh())
      .subscribe();
    const interval = setInterval(refresh, 15000);
    return () => { supabase.removeChannel(channel); clearInterval(interval); };
  }, [electionId]);

  if (loading) return <p className="text-sm text-muted-foreground">Tallying…</p>;
  if (tallies.length === 0) return <p className="text-sm text-muted-foreground">No candidates yet.</p>;

  const bar = accentColor ?? undefined;
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">{total} ballot{total === 1 ? "" : "s"} counted • updates live</p>
      {tallies.map((t, i) => {
        const pct = total ? (t.votes / total) * 100 : 0;
        return (
          <div key={t.candidate_id}>
            <div className="flex items-center gap-3">
              {t.photo_url ? (
                <img src={t.photo_url} alt="" className="h-10 w-10 rounded-full border border-border object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-muted" />
              )}
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{i === 0 && total > 0 ? "🏆 " : ""}{t.name}</span>
                  <span className="text-muted-foreground">{t.votes} ({pct.toFixed(1)}%)</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full transition-all"
                    style={{ width: `${pct}%`, background: bar ?? "linear-gradient(90deg, hsl(var(--gold)), hsl(var(--gold)))" }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
