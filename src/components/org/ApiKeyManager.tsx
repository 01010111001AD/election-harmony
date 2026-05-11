import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { KeyRound, Copy, Trash2 } from "lucide-react";

type Key = { id: string; name: string; key_prefix: string; created_at: string; last_used_at: string | null };

async function sha256Hex(s: string) {
  const buf = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function genKey() {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return "elc_" + Array.from(arr).map((b) => b.toString(36)).join("").slice(0, 36);
}

export function ApiKeyManager({ orgId, orgSlug, canEdit, userId }: { orgId: string; orgSlug: string; canEdit: boolean; userId: string }) {
  const [keys, setKeys] = useState<Key[]>([]);
  const [name, setName] = useState("");
  const [reveal, setReveal] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("org_api_keys").select("id,name,key_prefix,created_at,last_used_at").eq("organization_id", orgId).order("created_at", { ascending: false });
    setKeys((data ?? []) as Key[]);
  };
  useEffect(() => { load(); }, [orgId]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = genKey();
    const hash = await sha256Hex(raw);
    const prefix = raw.slice(0, 8);
    const { error } = await supabase.from("org_api_keys").insert({
      organization_id: orgId, name: name || "Default", key_prefix: prefix, key_hash: hash, created_by: userId,
    });
    if (error) return toast.error(error.message);
    setReveal(raw); setName(""); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Revoke this key?")) return;
    await supabase.from("org_api_keys").delete().eq("id", id);
    toast.success("Revoked"); load();
  };

  const ingestUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/public/orgs/${orgSlug}/members`;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="font-serif">Public ingest endpoint</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md bg-muted p-3 font-mono text-xs break-all">POST {ingestUrl}</div>
          <p className="text-xs text-muted-foreground">Send a JSON array of <code className="rounded bg-muted px-1">{`{ email, full_name?, tags? }`}</code>. Authenticate with header <code className="rounded bg-muted px-1">x-api-key: &lt;your key&gt;</code>. Use this to sync members from your HRIS, CRM, or membership system.</p>
          <pre className="overflow-x-auto rounded-md bg-navy p-3 text-xs text-navy-foreground">{`curl -X POST ${ingestUrl} \\
  -H "x-api-key: elc_..." \\
  -H "content-type: application/json" \\
  -d '[{"email":"jane@org.com","full_name":"Jane Doe","tags":["voters-2026"]}]'`}</pre>
        </CardContent>
      </Card>

      {canEdit && (
        <Card>
          <CardHeader><CardTitle className="font-serif">Create API key</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={create} className="flex gap-2">
              <Input placeholder="Key name (e.g. HRIS Sync)" value={name} onChange={(e) => setName(e.target.value)} />
              <Button type="submit" variant="institutional"><KeyRound className="h-4 w-4" /> Generate</Button>
            </form>
            {reveal && (
              <div className="mt-3 rounded-md border border-gold/40 bg-gold/5 p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-gold">Copy now — won't be shown again</p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 break-all rounded bg-background px-2 py-1.5 font-mono text-xs">{reveal}</code>
                  <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(reveal); toast.success("Copied"); }}><Copy className="h-3.5 w-3.5" /></Button>
                </div>
                <Button size="sm" variant="ghost" className="mt-2" onClick={() => setReveal(null)}>Dismiss</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Prefix</th><th className="px-4 py-3 text-left">Last used</th><th /></tr>
            </thead>
            <tbody>
              {keys.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No keys yet.</td></tr>
              ) : keys.map((k) => (
                <tr key={k.id} className="border-b border-border/40">
                  <td className="px-4 py-3 font-medium">{k.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{k.key_prefix}…</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "never"}</td>
                  <td className="px-4 py-3 text-right">{canEdit && <Button size="icon" variant="ghost" onClick={() => remove(k.id)}><Trash2 className="h-4 w-4" /></Button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
