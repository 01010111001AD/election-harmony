import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2, BarChart3, ExternalLink, Copy, Calendar, ScrollText, Upload, Image as ImageIcon } from "lucide-react";
import { VoterRollImportWizard } from "@/components/election/VoterRollImportWizard";

export const Route = createFileRoute("/_authenticated/app/elections/$electionId")({
  component: ManageElection,
  head: () => ({ meta: [{ title: "Manage Election — ElectaCore" }] }),
});

type Election = {
  id: string; title: string; description: string | null;
  method: string; status: string; max_selections: number; owner_id: string;
  opens_at: string | null; closes_at: string | null; anonymous: boolean; allow_abstain: boolean;
  organization_id: string | null;
};
type Org = { id: string; name: string; logo_url: string | null; brand_color: string; accent_color: string };
type Candidate = { id: string; name: string; statement: string | null; display_order: number; photo_url: string | null };
type RollEntry = { id: string; email: string | null; voting_token: string | null; has_voted: boolean; user_id: string | null };
type AuditEntry = { id: string; event: string; actor_id: string | null; created_at: string; details: any };

function genToken() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const r = (n: number) => Array.from({ length: n }, () => a[Math.floor(Math.random() * a.length)]).join("");
  return `${r(4)}-${r(4)}-${r(4)}`;
}

function ManageElection() {
  const { electionId } = Route.useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState<Election | null>(null);
  const [org, setOrg] = useState<Org | null>(null);
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
    if (e.data) {
      setElection(e.data as Election);
      if ((e.data as any).organization_id) {
        const { data: o } = await supabase.from("organizations").select("id,name,logo_url,brand_color,accent_color").eq("id", (e.data as any).organization_id).maybeSingle();
        setOrg(o as Org | null);
      } else { setOrg(null); }
    }
    setCandidates((c.data ?? []) as Candidate[]);
    setRoll((r.data ?? []) as RollEntry[]);
    setAudit((a.data ?? []) as AuditEntry[]);
  };
  useEffect(() => { load(); }, [electionId]);

  const setStatus = async (status: string) => {
    if (status === "open") {
      if (candidates.length === 0) return toast.error("Add at least one candidate before opening voting.");
      if (roll.length === 0) return toast.error("Enroll at least one voter before opening voting.");
    }
    const patch: any = { status };
    if (status === "open") patch.opens_at = new Date().toISOString();
    if (status === "closed") patch.closes_at = new Date().toISOString();
    const { error } = await supabase.from("elections").update(patch).eq("id", electionId);
    if (error) return toast.error(error.message);
    await supabase.from("audit_log").insert({ election_id: electionId, event: `status_${status}` });
    toast.success(`Status: ${status}`);
    load();
  };

  const deleteElection = async () => {
    const { error } = await supabase.rpc("delete_election", { _id: electionId });
    if (error) return toast.error(error.message);
    toast.success("Election deleted");
    navigate({ to: "/app/dashboard" });
  };

  if (!election) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-8">
      {org && (
        <div className="overflow-hidden rounded-2xl border border-border text-white" style={{ background: `linear-gradient(135deg, ${org.brand_color}, ${org.accent_color})` }}>
          <div className="flex items-center gap-4 px-6 py-5">
            {org.logo_url && <img src={org.logo_url} alt="" className="h-12 w-12 rounded-lg bg-white/10 object-cover" />}
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] opacity-80">Tenant • {org.name}</p>
              <p className="font-serif text-lg">Voters see this branding on the ballot</p>
            </div>
          </div>
        </div>
      )}

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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" />Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this election?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes the election, candidates, voter roll, ballots, and audit log. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteElection} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete election</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
          <RollPanel electionId={electionId} orgId={election.organization_id} roll={roll} reload={load} />
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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const uploadPhoto = async (electionId: string, file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${electionId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("candidate-photos").upload(path, file, { upsert: false });
    if (error) { toast.error(error.message); return null; }
    return supabase.storage.from("candidate-photos").getPublicUrl(path).data.publicUrl;
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    let photo_url: string | null = null;
    if (photoFile) photo_url = await uploadPhoto(electionId, photoFile);
    const { error } = await supabase.from("candidates").insert({
      election_id: electionId, name, statement, display_order: candidates.length, photo_url,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    setName(""); setStatement(""); setPhotoFile(null); reload();
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("candidates").delete().eq("id", id);
    if (error) return toast.error(error.message);
    reload();
  };
  const replacePhoto = async (id: string, file: File) => {
    const url = await uploadPhoto(electionId, file);
    if (!url) return;
    const { error } = await supabase.from("candidates").update({ photo_url: url }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Photo updated");
    reload();
  };

  return (
    <>
      <Card>
        <CardHeader><CardTitle className="font-serif">Add candidate</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={add} className="space-y-3">
            <div className="grid gap-3 md:grid-cols-[1fr_2fr]">
              <Input placeholder="Name" required value={name} onChange={(e) => setName(e.target.value)} />
              <Textarea placeholder="Statement (equal-format)" rows={1} value={statement} onChange={(e) => setStatement(e.target.value)} />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted">
                <ImageIcon className="h-4 w-4" /> {photoFile ? photoFile.name : "Add photo (optional)"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />
              </label>
              <Button type="submit" variant="institutional" disabled={submitting}>{submitting ? "Adding…" : "Add candidate"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-3">
        {candidates.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex items-start justify-between gap-3 py-4">
              <div className="flex items-start gap-3">
                {c.photo_url ? (
                  <img src={c.photo_url} alt="" className="h-14 w-14 rounded-full border border-border object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground"><ImageIcon className="h-5 w-5" /></div>
                )}
                <div>
                  <p className="font-medium">{c.name}</p>
                  {c.statement && <p className="mt-1 text-sm text-muted-foreground">{c.statement}</p>}
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs text-gold hover:underline">
                    <Upload className="h-3 w-3" /> {c.photo_url ? "Replace photo" : "Add photo"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && replacePhoto(c.id, e.target.files[0])} />
                  </label>
                </div>
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

function RollPanel({ electionId, orgId, roll, reload }: { electionId: string; orgId: string | null; roll: RollEntry[]; reload: () => void }) {
  const [emails, setEmails] = useState("");
  const [tag, setTag] = useState("__all__");
  const [tags, setTags] = useState<string[]>([]);
  const [dirCount, setDirCount] = useState(0);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!orgId) return;
    (async () => {
      const { data, count } = await supabase
        .from("org_members_directory")
        .select("tags", { count: "exact" })
        .eq("organization_id", orgId)
        .eq("status", "active");
      setDirCount(count ?? 0);
      const all = new Set<string>();
      (data ?? []).forEach((r: any) => (r.tags ?? []).forEach((t: string) => all.add(t)));
      setTags(Array.from(all).sort());
    })();
  }, [orgId, roll.length]);

  const enroll = async (e: React.FormEvent) => {
    e.preventDefault();
    const list = emails.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
    if (list.length === 0) return;
    const rows = list.map((email) => ({ election_id: electionId, email, voting_token: genToken() }));
    const { error } = await supabase.from("voter_roll").insert(rows);
    if (error) return toast.error(error.message);
    setEmails(""); toast.success(`${rows.length} voters enrolled`); reload();
  };

  const enrollByTag = async () => {
    if (!orgId) return toast.error("This election isn't linked to an organization.");
    if (dirCount === 0) return toast.error("Your organization directory is empty. Import members first from the Org page.");
    setEnrolling(true);
    const _tag = tag === "__all__" ? "" : tag;
    const { data, error } = await supabase.rpc("enroll_voters_by_tag", { _election_id: electionId, _tag });
    setEnrolling(false);
    if (error) return toast.error(error.message);
    toast.success(`${data ?? 0} voters enrolled from directory`);
    reload();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("voter_roll").delete().eq("id", id);
    if (error) return toast.error(error.message);
    reload();
  };

  return (
    <>
      {orgId && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Enroll from organization directory</CardTitle>
            <p className="text-xs text-muted-foreground">{dirCount} active members in this tenant. Pick a tag or enroll everyone.</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select value={tag} onValueChange={setTag}>
                <SelectTrigger className="sm:w-72"><SelectValue placeholder="All active members" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All active members</SelectItem>
                  {tags.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={enrollByTag} disabled={enrolling} variant="institutional">{enrolling ? "Enrolling…" : "Enroll from directory"}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Enroll voters manually</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={enroll} className="space-y-3">
            <Label>Emails (comma, space, or newline separated)</Label>
            <Textarea rows={4} value={emails} onChange={(e) => setEmails(e.target.value)} placeholder="alice@org.com, bob@org.com" />
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="institutional">Enroll & generate tokens</Button>
              <VoterRollImportWizard electionId={electionId} onDone={reload} />
            </div>
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
                        onClick={() => { navigator.clipboard.writeText(r.voting_token!); toast.success("Token copied"); }}
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

function SchedulePanel({ election, reload }: { election: Election; reload: () => void }) {
  const toLocal = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");
  const [opensAt, setOpensAt] = useState(toLocal(election.opens_at));
  const [closesAt, setClosesAt] = useState(toLocal(election.closes_at));
  const [anonymous, setAnonymous] = useState(election.anonymous);
  const [allowAbstain, setAllowAbstain] = useState(election.allow_abstain);
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("elections").update({
      opens_at: opensAt ? new Date(opensAt).toISOString() : null,
      closes_at: closesAt ? new Date(closesAt).toISOString() : null,
      anonymous, allow_abstain: allowAbstain,
    }).eq("id", election.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    await supabase.from("audit_log").insert({ election_id: election.id, event: "schedule_updated" });
    toast.success("Schedule saved");
    reload();
  };

  return (
    <Card>
      <CardHeader><CardTitle className="font-serif">Schedule & integrity</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="opens">Opens at</Label>
            <Input id="opens" type="datetime-local" value={opensAt} onChange={(e) => setOpensAt(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="closes">Closes at</Label>
            <Input id="closes" type="datetime-local" value={closesAt} onChange={(e) => setClosesAt(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
            Anonymous ballots (no voter identity stored on ballot)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={allowAbstain} onChange={(e) => setAllowAbstain(e.target.checked)} />
            Allow abstain
          </label>
          <div className="md:col-span-2">
            <Button type="submit" variant="institutional" disabled={saving}>{saving ? "Saving…" : "Save schedule"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function AuditPanel({ entries }: { entries: AuditEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">Immutable audit trail</CardTitle>
        <p className="text-xs text-muted-foreground">All material lifecycle events and ballot casts are recorded here for observers and auditors.</p>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">When</th><th className="px-4 py-3">Event</th><th className="px-4 py-3">Actor</th></tr>
          </thead>
          <tbody>
            {entries.map((a) => (
              <tr key={a.id} className="border-b border-border/50">
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-xs">{a.event}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{a.actor_id ? a.actor_id.slice(0, 8) + "…" : "system"}</td>
              </tr>
            ))}
            {entries.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No events recorded yet.</td></tr>}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
