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
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/organizations/$orgId")({
  component: ManageOrg,
});

type Org = { id: string; name: string; slug: string; brand_color: string; accent_color: string; logo_url: string | null; tagline: string | null };
type Member = { id: string; user_id: string; role: string };
type Election = { id: string; title: string; status: string };

function ManageOrg() {
  const { orgId } = Route.useParams();
  const { user } = useAuth();
  const [org, setOrg] = useState<Org | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const myRole = members.find((m) => m.user_id === user?.id)?.role;
  const isAdmin = myRole === "owner" || myRole === "admin";

  const load = async () => {
    const [o, m, e] = await Promise.all([
      supabase.from("organizations").select("*").eq("id", orgId).single(),
      supabase.from("organization_members").select("*").eq("organization_id", orgId),
      supabase.from("elections").select("id,title,status").eq("organization_id", orgId).order("created_at", { ascending: false }),
    ]);
    if (o.data) setOrg(o.data as Org);
    setMembers((m.data ?? []) as Member[]);
    setElections((e.data ?? []) as Election[]);
  };
  useEffect(() => { load(); }, [orgId]);

  if (!org) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-8">
      <div>
        <Link to="/app/organizations" className="text-xs uppercase tracking-[0.22em] text-gold hover:underline">← All organizations</Link>
        <div className="mt-3 flex items-center gap-4">
          {org.logo_url && <img src={org.logo_url} alt="" className="h-12 w-12 rounded-lg object-cover" />}
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight">{org.name}</h1>
            <p className="text-sm text-muted-foreground">{org.tagline ?? `Tenant • ${org.slug}`}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="branding">
        <TabsList>
          <TabsTrigger value="branding">White-Label Branding</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="elections">Elections</TabsTrigger>
        </TabsList>

        <TabsContent value="branding"><BrandingPanel org={org} canEdit={isAdmin} reload={load} /></TabsContent>
        <TabsContent value="members"><MembersPanel orgId={orgId} members={members} canEdit={isAdmin} reload={load} /></TabsContent>
        <TabsContent value="elections">
          <Card>
            <CardHeader><CardTitle className="font-serif">Elections under this tenant</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {elections.length === 0 ? (
                <p className="text-sm text-muted-foreground">No elections yet. Create one from the dashboard and assign this organization.</p>
              ) : elections.map((el) => (
                <div key={el.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <div className="flex items-center gap-2"><span className="font-medium">{el.title}</span><Badge variant="outline">{el.status}</Badge></div>
                  <Button asChild size="sm" variant="ghost"><Link to="/app/elections/$electionId" params={{ electionId: el.id }}>Open</Link></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BrandingPanel({ org, canEdit, reload }: { org: Org; canEdit: boolean; reload: () => void }) {
  const [name, setName] = useState(org.name);
  const [tagline, setTagline] = useState(org.tagline ?? "");
  const [brand, setBrand] = useState(org.brand_color);
  const [accent, setAccent] = useState(org.accent_color);
  const [logo, setLogo] = useState(org.logo_url ?? "");
  const [saving, setSaving] = useState(false);

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
            <div><Label htmlFor="l">Logo URL</Label><Input id="l" value={logo} disabled={!canEdit} onChange={(e) => setLogo(e.target.value)} placeholder="https://…/logo.png" /></div>
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

function MembersPanel({ orgId, members, canEdit, reload }: { orgId: string; members: Member[]; canEdit: boolean; reload: () => void }) {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("member");

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("organization_members").insert({ organization_id: orgId, user_id: userId, role: role as any });
    if (error) return toast.error(error.message);
    setUserId(""); toast.success("Member added"); reload();
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
          <CardHeader><CardTitle className="font-serif">Invite member</CardTitle></CardHeader>
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
            <p className="mt-2 text-xs text-muted-foreground">Tip: a user's UUID can be found in their profile after signup. Email-based invites can be added later.</p>
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
