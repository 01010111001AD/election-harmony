import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/vote/$electionId")({
  component: VotePage,
  head: () => ({ meta: [{ title: "Cast your vote — ElectaCore" }] }),
});

type Election = { id: string; title: string; description: string | null; method: string; status: string; max_selections: number };
type Candidate = { id: string; name: string; statement: string | null };

function VotePage() {
  const { electionId } = Route.useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voterRollId, setVoterRollId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [ranked, setRanked] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: el } = await supabase.from("elections").select("*").eq("id", electionId).maybeSingle();
      const { data: cands } = await supabase.from("candidates").select("id, name, statement").eq("election_id", electionId).order("display_order");
      setElection(el as Election | null);
      setCandidates((cands ?? []) as Candidate[]);

      let roll: any = null;
      if (user) {
        const { data } = await supabase.from("voter_roll").select("*").eq("election_id", electionId).eq("user_id", user.id).maybeSingle();
        roll = data;
      }
      if (!roll) {
        const cached = sessionStorage.getItem("electa.tokenRoll");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.election_id === electionId) roll = parsed;
        }
      }
      if (roll) {
        setVoterRollId(roll.id);
        setHasVoted(roll.has_voted);
      }
      setLoading(false);
    })();
  }, [electionId]);

  if (loading) return <Center>Loading ballot…</Center>;
  if (!election) return <Center>Election not found.</Center>;
  if (election.status !== "open") return <Center>This election is not currently open ({election.status}).</Center>;
  if (!voterRollId) return <Center>You are not enrolled in this election.</Center>;
  if (hasVoted || confirmed) return (
    <Center>
      <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
      <h2 className="font-serif text-2xl">Ballot received</h2>
      <p className="mt-2 text-sm text-muted-foreground">Your vote has been securely recorded and audit-logged.</p>
      <Button className="mt-6" variant="outline" onClick={() => { sessionStorage.removeItem("electa.tokenRoll"); navigate({ to: "/" }); }}>Done</Button>
    </Center>
  );

  const toggle = (id: string) => {
    if (election.method === "fptp") setSelected([id]);
    else if (election.method === "approval") {
      setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : (s.length < election.max_selections ? [...s, id] : s));
    }
  };

  const moveRank = (id: string) => {
    setRanked((r) => r.includes(id) ? r.filter((x) => x !== id) : [...r, id]);
  };

  const submit = async () => {
    let selections: any = [];
    if (election.method === "fptp" || election.method === "approval") {
      if (selected.length === 0) return toast.error("Select at least one option");
      selections = selected;
    } else if (election.method === "ranked") {
      if (ranked.length === 0) return toast.error("Rank at least one candidate");
      selections = { ranking: ranked };
    } else if (election.method === "yes_no") {
      if (selected.length === 0) return toast.error("Choose Yes or No");
      selections = { vote: selected[0] };
    }
    setSubmitting(true);
    const { error } = await supabase.from("ballots").insert({
      election_id: electionId, voter_roll_id: voterRollId, selections,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    setConfirmed(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-navy text-navy-foreground">
        <div className="container mx-auto flex max-w-3xl items-center gap-3 px-6 py-5">
          <ShieldCheck className="h-6 w-6 text-gold" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Secure Ballot</p>
            <h1 className="font-serif text-xl font-semibold">{election.title}</h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto max-w-3xl px-6 py-10">
        {election.description && <p className="mb-6 text-sm text-muted-foreground">{election.description}</p>}
        <Card>
          <CardHeader><CardTitle className="font-serif">Your Ballot</CardTitle></CardHeader>
          <CardContent>
            {election.method === "yes_no" ? (
              <RadioGroup value={selected[0]} onValueChange={(v) => setSelected([v])}>
                {["yes", "no"].map((v) => (
                  <Label key={v} htmlFor={v} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 hover:bg-muted/30">
                    <RadioGroupItem id={v} value={v} /><span className="capitalize">{v}</span>
                  </Label>
                ))}
              </RadioGroup>
            ) : election.method === "ranked" ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Click candidates in order of preference.</p>
                {candidates.map((c) => {
                  const rank = ranked.indexOf(c.id);
                  return (
                    <button type="button" key={c.id} onClick={() => moveRank(c.id)}
                      className={`w-full rounded-lg border p-4 text-left transition ${rank >= 0 ? "border-gold bg-gold/5" : "border-border hover:bg-muted/30"}`}>
                      <div className="flex items-center justify-between">
                        <div><p className="font-medium">{c.name}</p>{c.statement && <p className="mt-1 text-sm text-muted-foreground">{c.statement}</p>}</div>
                        {rank >= 0 && <span className="ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-gold-gradient font-semibold text-gold-foreground">{rank + 1}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : election.method === "approval" ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Approve up to {election.max_selections}.</p>
                {candidates.map((c) => (
                  <Label key={c.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 hover:bg-muted/30">
                    <Checkbox checked={selected.includes(c.id)} onCheckedChange={() => toggle(c.id)} />
                    <div><p className="font-medium">{c.name}</p>{c.statement && <p className="mt-1 text-sm text-muted-foreground">{c.statement}</p>}</div>
                  </Label>
                ))}
              </div>
            ) : (
              <RadioGroup value={selected[0]} onValueChange={(v) => setSelected([v])}>
                {candidates.map((c) => (
                  <Label key={c.id} htmlFor={c.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 hover:bg-muted/30">
                    <RadioGroupItem id={c.id} value={c.id} className="mt-1" />
                    <div><p className="font-medium">{c.name}</p>{c.statement && <p className="mt-1 text-sm text-muted-foreground">{c.statement}</p>}</div>
                  </Label>
                ))}
              </RadioGroup>
            )}
            <div className="mt-6 flex justify-end">
              <Button variant="institutional" size="lg" onClick={submit} disabled={submitting}>
                {submitting ? "Casting…" : "Cast ballot"}
              </Button>
            </div>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-muted-foreground">Your ballot is encrypted in transit, recorded with an immutable audit entry, and counted only after the election closes.</p>
      </main>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-soft">{children}</div>
    </div>
  );
}
