import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Vote, Users, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type Election = {
  id: string; title: string; description: string | null;
  method: "fptp" | "approval" | "ranked" | "yes_no";
  status: "draft" | "scheduled" | "open" | "closed" | "certified";
  opens_at: string | null; closes_at: string | null; created_at: string;
};

export const Route = createFileRoute("/_authenticated/app/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — ElectaCore" }] }),
});

function Dashboard() {
  const { user } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("elections").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setElections((data ?? []) as Election[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (user) {
      supabase.from("user_roles").select("role").eq("user_id", user.id).then(({ data }) => {
        const roles = (data ?? []).map((r) => r.role);
        setIsAdmin(roles.includes("election_admin") || roles.includes("platform_admin"));
      });
    }
  }, [user]);

  const promoteToAdmin = async () => {
    if (!user) return;
    const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role: "election_admin" });
    if (error) return toast.error(error.message);
    setIsAdmin(true);
    toast.success("Election Admin role granted");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gold">Console</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight">Elections</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create, configure, and govern your elections.</p>
        </div>
        <div className="flex items-center gap-2">
          {!isAdmin && (
            <Button variant="outline" onClick={promoteToAdmin}>Enable Election Admin</Button>
          )}
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="institutional"><Plus className="h-4 w-4" /> New election</Button>
              </DialogTrigger>
              <CreateElectionDialog onCreated={() => { setOpen(false); load(); }} />
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={<Vote className="h-5 w-5 text-gold" />} label="Total elections" value={String(elections.length)} />
        <StatCard icon={<Users className="h-5 w-5 text-gold" />} label="Open ballots" value={String(elections.filter((e) => e.status === "open").length)} />
        <StatCard icon={<BarChart3 className="h-5 w-5 text-gold" />} label="Certified" value={String(elections.filter((e) => e.status === "certified").length)} />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : elections.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">No elections yet. {isAdmin ? "Create your first one." : "Enable Election Admin to begin."}</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {elections.map((e) => <ElectionCard key={e.id} election={e} />)}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between py-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className="mt-1 font-serif text-3xl font-semibold">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5">{icon}</div>
      </CardContent>
    </Card>
  );
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  open: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  closed: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  certified: "bg-gold/20 text-foreground",
};

const methodLabels: Record<string, string> = {
  fptp: "First Past the Post", approval: "Approval", ranked: "Ranked Choice", yes_no: "Yes / No",
};

function ElectionCard({ election }: { election: Election }) {
  return (
    <Card className="transition-shadow hover:shadow-elegant">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="font-serif text-xl">{election.title}</CardTitle>
          <Badge className={statusColors[election.status]}>{election.status}</Badge>
        </div>
        <CardDescription className="line-clamp-2">{election.description || "—"}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{methodLabels[election.method]}</span>
        <Button asChild size="sm" variant="outline">
          <Link to="/app/elections/$electionId" params={{ electionId: election.id }}>Manage</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function CreateElectionDialog({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [method, setMethod] = useState<Election["method"]>("fptp");
  const [maxSel, setMaxSel] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("elections").insert({
      title, description, method, max_selections: maxSel, owner_id: user.id,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Election created");
    onCreated();
  };

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader><DialogTitle className="font-serif text-2xl">New Election</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div><Label htmlFor="t">Title</Label><Input id="t" required value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div><Label htmlFor="d">Description</Label><Textarea id="d" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Voting method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as Election["method"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fptp">First Past the Post</SelectItem>
                <SelectItem value="approval">Approval</SelectItem>
                <SelectItem value="ranked">Ranked Choice</SelectItem>
                <SelectItem value="yes_no">Yes / No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="m">Max selections</Label>
            <Input id="m" type="number" min={1} value={maxSel} onChange={(e) => setMaxSel(Number(e.target.value))} />
          </div>
        </div>
        <DialogFooter><Button type="submit" variant="institutional" disabled={submitting}>{submitting ? "Creating…" : "Create"}</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}
