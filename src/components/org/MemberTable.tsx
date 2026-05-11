import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Search, Trash2, Tag, Download } from "lucide-react";
import { MemberImportWizard } from "./MemberImportWizard";

type Member = {
  id: string; email: string; full_name: string | null; external_id: string | null;
  tags: string[]; status: string; created_at: string;
};

export function MemberTable({ orgId, canEdit }: { orgId: string; canEdit: boolean }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tagFilter, setTagFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [addEmail, setAddEmail] = useState("");
  const [addName, setAddName] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("org_members_directory")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) toast.error(error.message);
    setMembers((data ?? []) as Member[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, [orgId]);

  const allTags = useMemo(() => Array.from(new Set(members.flatMap((m) => m.tags))).sort(), [members]);
  const filtered = useMemo(() => members.filter((m) => {
    const matchQ = !q || m.email.includes(q.toLowerCase()) || m.full_name?.toLowerCase().includes(q.toLowerCase());
    const matchTag = !tagFilter || m.tags.includes(tagFilter);
    return matchQ && matchTag;
  }), [members, q, tagFilter]);

  const toggle = (id: string) => {
    const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s);
  };
  const toggleAll = () => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((m) => m.id)));

  const removeSelected = async () => {
    if (!confirm(`Remove ${selected.size} member(s)?`)) return;
    const { error } = await supabase.from("org_members_directory").delete().in("id", Array.from(selected));
    if (error) return toast.error(error.message);
    toast.success("Removed"); setSelected(new Set()); load();
  };

  const tagSelected = async () => {
    const tag = prompt("Add tag:")?.trim(); if (!tag) return;
    const updates = members.filter((m) => selected.has(m.id)).map((m) => ({ id: m.id, tags: Array.from(new Set([...m.tags, tag])) }));
    for (const u of updates) {
      await supabase.from("org_members_directory").update({ tags: u.tags }).eq("id", u.id);
    }
    toast.success("Tagged"); setSelected(new Set()); load();
  };

  const addOne = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addEmail) return;
    const { error } = await supabase.from("org_members_directory").insert({
      organization_id: orgId, email: addEmail.toLowerCase().trim(), full_name: addName || null,
    });
    if (error) return toast.error(error.message);
    setAddEmail(""); setAddName(""); toast.success("Member added"); load();
  };

  const exportCsv = () => {
    const rows = [["email", "full_name", "external_id", "tags", "status"], ...filtered.map((m) => [m.email, m.full_name ?? "", m.external_id ?? "", m.tags.join("|"), m.status])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `members-${orgId}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search email or name…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {allTags.length > 0 && (
          <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
            <option value="">All tags</option>
            {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
        <Button variant="ghost" size="sm" onClick={exportCsv}><Download className="h-4 w-4" /> Export</Button>
        {canEdit && <MemberImportWizard orgId={orgId} onDone={load} />}
      </div>

      {canEdit && (
        <form onSubmit={addOne} className="flex gap-2 rounded-lg border border-border bg-muted/30 p-3">
          <Input placeholder="email@org.com" type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} required />
          <Input placeholder="Full name (optional)" value={addName} onChange={(e) => setAddName(e.target.value)} />
          <Button type="submit" variant="outline">Add one</Button>
        </form>
      )}

      {selected.size > 0 && canEdit && (
        <div className="flex items-center gap-2 rounded-md border border-gold/40 bg-gold/5 px-3 py-2 text-sm">
          <span>{selected.size} selected</span>
          <Button size="sm" variant="ghost" onClick={tagSelected}><Tag className="h-3.5 w-3.5" /> Tag</Button>
          <Button size="sm" variant="ghost" onClick={removeSelected}><Trash2 className="h-3.5 w-3.5" /> Remove</Button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="w-10 px-3 py-2.5"><Checkbox checked={selected.size > 0 && selected.size === filtered.length} onCheckedChange={toggleAll} /></th>
              <th className="px-3 py-2.5 text-left">Email</th>
              <th className="px-3 py-2.5 text-left">Name</th>
              <th className="px-3 py-2.5 text-left">Tags</th>
              <th className="px-3 py-2.5 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-3 py-12 text-center text-muted-foreground">
                <p className="font-medium">No members yet</p>
                <p className="text-xs">{canEdit ? "Import an Excel/CSV file or add members one by one to get started." : "This organization hasn't added members."}</p>
              </td></tr>
            ) : filtered.map((m) => (
              <tr key={m.id} className="border-b border-border/40 hover:bg-muted/20">
                <td className="px-3 py-2"><Checkbox checked={selected.has(m.id)} onCheckedChange={() => toggle(m.id)} /></td>
                <td className="px-3 py-2 font-mono text-xs">{m.email}</td>
                <td className="px-3 py-2">{m.full_name ?? "—"}</td>
                <td className="px-3 py-2"><div className="flex flex-wrap gap-1">{m.tags.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}</div></td>
                <td className="px-3 py-2"><Badge variant={m.status === "active" ? "default" : "outline"}>{m.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length >= 1000 && <p className="text-xs text-muted-foreground">Showing first 1,000 — use search to narrow.</p>}
    </div>
  );
}
