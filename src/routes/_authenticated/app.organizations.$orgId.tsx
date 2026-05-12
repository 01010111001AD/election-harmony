import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2, Users, Vote, Globe, Activity, Upload, Plus, Copy } from "lucide-react";
import { MemberTable } from "@/components/org/MemberTable";
import { ApiKeyManager } from "@/components/org/ApiKeyManager";

export const Route = createFileRoute("/_authenticated/app/organizations/$orgId")({
  component: ManageOrg,
});

type Org = { id: string; name: string; slug: string; brand_color: string; accent_color: string; logo_url: string | null; tagline: string | null };
type StaffMember = { id: string; user_id: string; role: string };
type Election = { id: string; title: string; status: string; created_at: string };

function ManageOrg() {
  const { orgId } = Route.useParams();
  const { user } = useAuth();
  const [org, setOrg] = useState<Org | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [stats, setStats] = useState({ members: 0, ballots: 0 });
  const myRole = staff.find((m) => m.user_id === user?.id)?.role;
  const isAdmin = myRole === "owner" || myRole === "admin";

  const load = async () => {
    const [o, s, e, mc] = await Promise.all([
      supabase.from("organizations").select("*").eq("id", orgId).single(),
      supabase.from("organization_members").select("*").eq("organization_id", orgId),
      supabase.from("elections").select("id,title,status,created_at").eq("organization_id", orgId).order("created_at", { ascending: false }),
      supabase.from("org_members_directory").select("id", { count: "exact", head: true }).eq("organization_id", orgId),
    ]);
    if (o.data) setOrg(o.data as Org);
    setStaff((s.data ?? []) as StaffMember[]);
    setElections((e.data ?? []) as Election[]);
    setStats({ members: mc.count ?? 0, ballots: 0 });
  };
  useEffect(() => { load(); }, [orgId]);

  if (!org) return <p className="text-muted-foreground">Loading…</p>;

  const portalUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/o/${org.slug}`;

  return (
    <div className="space-y-8">
      <div>
        <Link to="/app/organizations" className="text-xs uppercase tracking-[0.22em] text-gold hover:underline">← All organizations</Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {org.logo_url && <img src={org.logo_url} alt="" className="h-14 w-14 rounded-xl object-cover" />}
            <div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight">{org.name}</h1>
              <p className="text-sm text-muted-foreground">{org.tagline ?? `Tenant • ${org.slug}`}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(portalUrl); toast.success("Portal link copied"); }}>
              <Copy className="h-4 w-4" /> Copy portal link
            </Button>
            <Button variant="outline" asChild>
              <a href={portalUrl} target="_blank" rel="noreferrer"><Globe className="h-4 w-4" /> View public portal</a>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard icon={Users} label="Members" value={stats.members} />
        <KpiCard icon={Vote} label="Elections" value={elections.length} />
        <KpiCard icon={Activity} label="Active" value={elections.filter((e) => e.status === "open").length} />
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="elections">Elections</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="integrations">Integrations & API</TabsTrigger>
          <TabsTrigger value="staff">Staff & Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6"><MemberTable orgId={orgId} canEdit={isAdmin} /></TabsContent>

        <TabsContent value="elections" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-serif">Elections</CardTitle>
              {isAdmin && <NewElectionButton orgId={orgId} onCreated={load} />}
            </CardHeader>
            <CardContent className="space-y-2">
              {elections.length === 0 ? (
                <p className="text-sm text-muted-foreground">No elections yet. Click <strong>New election</strong> to launch one for {org.name}.</p>
              ) : elections.map((el) => (
                <div key={el.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <div className="flex items-center gap-2"><span className="font-medium">{el.title}</span><Badge variant="outline">{el.status}</Badge></div>
                  <Button asChild size="sm" variant="ghost"><Link to="/app/elections/$electionId" params={{ electionId: el.id }}>Open</Link></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="mt-6"><BrandingPanel org={org} canEdit={isAdmin} reload={load} /></TabsContent>

        <TabsContent value="integrations" className="mt-6">
          {user && <ApiKeyManager orgId={orgId} orgSlug={org.slug} canEdit={isAdmin} userId={user.id} />}
        </TabsContent>

        <TabsContent value="staff" className="mt-6"><StaffPanel orgId={orgId} members={staff} canEdit={isAdmin} reload={load} /></TabsContent>
      </Tabs>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <div className="rounded-lg bg-gold/10 p-2.5"><Icon className="h-5 w-5 text-gold" /></div>
        <div><p className="font-serif text-2xl font-semibold">{value.toLocaleString()}</p><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p></div>
      </CardContent>
    </Card>
  );
}

function BrandingPanel({ org, canEdit, reload }: { org: Org; canEdit: boolean; reload: () => void }) {
  const [name, setName] = useState(org.name);
  const [tagline, setTagline] = useState(org.tagline ?? "");
  const [brand, setBrand] = useState(org.brand_color);
  const [accent, setAccent] = useState(org.accent_color);
  const [logo, setLogo] = useState(org.logo_url ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadLogo = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${org.id}/logo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("org-logos").upload(path, file, { upsert: true });
    if (error) { setUploading(false); return toast.error(error.message); }
    const { data } = supabase.storage.from("org-logos").getPublicUrl(path);
    setLogo(data.publicUrl);
    setUploading(false);
    toast.success("Logo uploaded — remember to save");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("organizations").update({
      name, tagline, brand_color: brand, accent_color: accent, logo_url: logo || null,
    }).eq("id", org.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Branding saved");
    reload();
  };

  return (
    <Card>
      <CardHeader><CardTitle className="font-serif">Brand identity</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={save} className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div><Label htmlFor="n">Display name</Label><Input id="n" value={name} disabled={!canEdit} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label htmlFor="t">Tagline</Label><Textarea id="t" rows={2} value={tagline} disabled={!canEdit} onChange={(e) => setTagline(e.target.value)} /></div>
            <div>
              <Label>Logo</Label>
              <div className="mt-1 flex items-center gap-3">
                {logo && <img src={logo} alt="" className="h-12 w-12 rounded-md border border-border object-cover" />}
                <label className="flex-1">
                  <div className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-input px-3 text-sm hover:bg-muted">
                    <Upload className="h-4 w-4" />{uploading ? "Uploading…" : "Upload logo"}
                  </div>
                  <input type="file" accept="image/*" className="hidden" disabled={!canEdit || uploading} onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
                </label>
              </div>
              <Input className="mt-2" value={logo} disabled={!canEdit} onChange={(e) => setLogo(e.target.value)} placeholder="or paste image URL" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label htmlFor="b">Brand color</Label><Input id="b" type="color" value={brand} disabled={!canEdit} onChange={(e) => setBrand(e.target.value)} /></div>
              <div><Label htmlFor="a">Accent</Label><Input id="a" type="color" value={accent} disabled={!canEdit} onChange={(e) => setAccent(e.target.value)} /></div>
            </div>
            {canEdit && <Button type="submit" variant="institutional" disabled={saving}>{saving ? "Saving…" : "Save brand"}</Button>}
          </div>
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="px-6 py-8 text-white" style={{ background: `linear-gradient(135deg, ${brand}, ${accent})` }}>
              <p className="text-xs uppercase tracking-[0.22em] opacity-80">Live preview</p>
              <p className="mt-2 font-serif text-2xl">{name}</p>
              <p className="mt-1 text-sm opacity-90">{tagline || "Trusted, verifiable elections."}</p>
            </div>
            <div className="bg-card p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Sample ballot button</p>
              <button type="button" className="mt-3 w-full rounded-md px-4 py-3 text-sm font-medium text-white shadow-soft" style={{ background: brand }}>Cast your ballot</button>
              <button type="button" className="mt-2 w-full rounded-md px-4 py-3 text-sm font-medium" style={{ background: accent, color: "#1a1a1a" }}>Verify receipt</button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function StaffPanel({ orgId, members, canEdit, reload }: { orgId: string; members: StaffMember[]; canEdit: boolean; reload: () => void }) {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("member");

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("organization_members").insert({ organization_id: orgId, user_id: userId, role: role as any });
    if (error) return toast.error(error.message);
    setUserId(""); toast.success("Staff added"); reload();
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("organization_members").delete().eq("id", id);
    if (error) return toast.error(error.message);
    reload();
  };

  return (
    <div className="space-y-4">
      {canEdit && (
        <Card>
          <CardHeader><CardTitle className="font-serif">Add staff member</CardTitle><p className="text-xs text-muted-foreground">Staff can manage elections, members, and branding. For end voters, use the Members tab.</p></CardHeader>
          <CardContent>
            <form onSubmit={add} className="grid gap-3 md:grid-cols-[2fr_1fr_auto]">
              <Input required placeholder="User ID (UUID)" value={userId} onChange={(e) => setUserId(e.target.value)} />
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="observer">Observer</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" variant="institutional">Add</Button>
            </form>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th /></tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-border/50">
                  <td className="px-4 py-3 font-mono text-xs">{m.user_id}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{m.role}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    {canEdit && <Button size="icon" variant="ghost" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4" /></Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
