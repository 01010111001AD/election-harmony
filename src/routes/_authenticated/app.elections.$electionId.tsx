import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Trash2, BarChart3, ExternalLink, Copy, Calendar, ScrollText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/elections/$electionId")({
  component: ManageElection,
  head: () => ({ meta: [{ title: "Manage Election — ElectaCore" }] }),
});

type Election = {
  id: string; title: string; description: string | null;
  method: string; status: string; max_selections: number; owner_id: string;
  opens_at: string | null; closes_at: string | null; anonymous: boolean; allow_abstain: boolean;
};
type Candidate = { id: string; name: string; statement: string | null; display_order: number };
type RollEntry = { id: string; email: string | null; voting_token: string | null; has_voted: boolean; user_id: string | null };
type AuditEntry = { id: string; event: string; actor_id: string | null; created_at: string; details: any };

function genToken() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const r = (n: number) => Array.from({ length: n }, () => a[Math.floor(Math.random() * a.length)]).join("");
  return `${r(4)}-${r(4)}-${r(4)}`;
}

function ManageElection() {
  const { electionId } = Route.useParams();
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [roll, setRoll] = useState<RollEntry[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);

  const load = async () => {
    const [e, c, r, a] = await Promise.all([
      supabase.from("elections").select("*").eq("id", electionId).single(),
      supabase.from("candidates").select("*").eq("election_id", electionId).order("display_order"),
      supabase.from("voter_roll").select("*").eq("election_id", electionId).order("created_at"),
      supabase.from("audit_log").select("*").eq("election_id", electionId).order("created_at", { ascending: false }).limit(100),
    ]);
    if (e.data) setElection(e.data as Election);
    setCandidates((c.data ?? []) as Candidate[]);
    setRoll((r.data ?? []) as RollEntry[]);
    setAudit((a.data ?? []) as AuditEntry[]);
  };
  useEffect(() => { load(); }, [electionId]);

  const setStatus = async (status: string) => {
    const patch: any = { status };
    if (status === "open") patch.opens_at = new Date().toISOString();
    if (status === "closed") patch.closes_at = new Date().toISOString();
    const { error } = await supabase.from("elections").update(patch).eq("id", electionId);
    if (error) return toast.error(error.message);
    await supabase.from("audit_log").insert({ election_id: electionId, event: `status_${status}` });
    toast.success(`Status: ${status}`);
    load();
  };

  if (!election) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/app/dashboard" className="text-xs uppercase tracking-[0.22em] text-gold hover:underline">← Back</Link>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">{election.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{election.description || "No description"}</p>
          <div className="mt-3 flex items-center gap-2">
            <Badge>{election.status}</Badge>
            <Badge variant="outline">{election.method}</Badge>
            <Badge variant="outline">max {election.max_selections}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {election.status === "draft" && <Button variant="outline" onClick={() => setStatus("scheduled")}>Schedule</Button>}
          {election.status !== "open" && election.status !== "certified" && <Button variant="institutional" onClick={() => setStatus("open")}>Open voting</Button>}
          {election.status === "open" && <Button variant="outline" onClick={() => setStatus("closed")}>Close</Button>}
          {election.status === "closed" && <Button variant="gold" onClick={() => setStatus("certified")}>Certify</Button>}
          <Button asChild variant="ghost"><Link to="/app/elections/$electionId/results" params={{ electionId }}><BarChart3 className="h-4 w-4" />Results</Link></Button>
        </div>
      </div>

      <Tabs defaultValue="candidates">
        <TabsList>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="roll">Voter Roll</TabsTrigger>
          <TabsTrigger value="settings"><Calendar className="h-4 w-4" />Schedule</TabsTrigger>
          <TabsTrigger value="audit"><ScrollText className="h-4 w-4" />Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="candidates" className="space-y-4">
          <CandidatesPanel electionId={electionId} candidates={candidates} reload={load} />
        </TabsContent>
        <TabsContent value="roll" className="space-y-4">
          <RollPanel electionId={electionId} roll={roll} reload={load} />
        </TabsContent>
        <TabsContent value="settings" className="space-y-4">
          <SchedulePanel election={election} reload={load} />
        </TabsContent>
        <TabsContent value="audit" className="space-y-4">
          <AuditPanel entries={audit} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CandidatesPanel({ electionId, candidates, reload }: { electionId: string; candidates: Candidate[]; reload: () => void }) {
  const [name, setName] = useState("");
  const [statement, setStatement] = useState("");
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("candidates").insert({
      election_id: electionId, name, statement, display_order: candidates.length,
    });
    if (error) return toast.error(error.message);
    setName(""); setStatement(""); reload();
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("candidates").delete().eq("id", id);
    if (error) return toast.error(error.message);
    reload();
  };
  return (
    <>
      <Card>
        <CardHeader><CardTitle className="font-serif">Add candidate</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={add} className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
            <Input placeholder="Name" required value={name} onChange={(e) => setName(e.target.value)} />
            <Textarea placeholder="Statement (equal-format)" rows={1} value={statement} onChange={(e) => setStatement(e.target.value)} />
            <Button type="submit" variant="institutional">Add</Button>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-3">
        {candidates.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex items-start justify-between gap-3 py-4">
              <div>
                <p className="font-medium">{c.name}</p>
                {c.statement && <p className="mt-1 text-sm text-muted-foreground">{c.statement}</p>}
              </div>
              <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
            </CardContent>
          </Card>
        ))}
        {candidates.length === 0 && <p className="text-sm text-muted-foreground">No candidates yet.</p>}
      </div>
    </>
  );
}

function RollPanel({ electionId, roll, reload }: { electionId: string; roll: RollEntry[]; reload: () => void }) {
  const [emails, setEmails] = useState("");
  const enroll = async (e: React.FormEvent) => {
    e.preventDefault();
    const list = emails.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
    if (list.length === 0) return;
    const rows = list.map((email) => ({ election_id: electionId, email, voting_token: genToken() }));
    const { error } = await supabase.from("voter_roll").insert(rows);
    if (error) return toast.error(error.message);
    setEmails(""); toast.success(`${rows.length} voters enrolled`); reload();
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("voter_roll").delete().eq("id", id);
    if (error) return toast.error(error.message);
    reload();
  };
  return (
    <>
      <Card>
        <CardHeader><CardTitle className="font-serif">Enroll voters</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={enroll} className="space-y-3">
            <Label>Emails (comma, space, or newline separated)</Label>
            <Textarea rows={4} value={emails} onChange={(e) => setEmails(e.target.value)} placeholder="alice@org.com, bob@org.com" />
            <Button type="submit" variant="institutional">Enroll & generate tokens</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3">Voter</th><th className="px-4 py-3">Token</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody>
              {roll.map((r) => (
                <tr key={r.id} className="border-b border-border/50">
                  <td className="px-4 py-3">{r.email || r.user_id}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {r.voting_token ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-foreground"
                        onClick={() => {
                          navigator.clipboard.writeText(r.voting_token!);
                          toast.success("Token copied");
                        }}
                      >
                        {r.voting_token} <Copy className="h-3 w-3" />
                      </button>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">{r.has_voted ? <Badge>voted</Badge> : <Badge variant="outline">pending</Badge>}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="icon" variant="ghost" onClick={() => remove(r.id)} disabled={r.has_voted}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
              {roll.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No voters enrolled.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground"><ExternalLink className="mr-1 inline h-3 w-3" /> Voters use their token at <code className="rounded bg-muted px-1">/login</code> — Voting Token tab.</p>
    </>
  );
}
