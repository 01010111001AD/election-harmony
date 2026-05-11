import { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, CheckCircle2 } from "lucide-react";

type Row = Record<string, any>;
type Mapping = { email: string; full_name: string; external_id: string; tags: string };

const REQUIRED = "__required__";

export function MemberImportWizard({ orgId, onDone }: { orgId: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Mapping>({ email: "", full_name: "", external_id: "", tags: "" });
  const [defaultTag, setDefaultTag] = useState("");
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState({ inserted: 0, updated: 0, skipped: 0 });

  const reset = () => {
    setStep(1); setRows([]); setHeaders([]); setMapping({ email: "", full_name: "", external_id: "", tags: "" });
    setDefaultTag(""); setProgress(0); setDone({ inserted: 0, updated: 0, skipped: 0 });
  };

  const handleFile = async (f: File) => {
    const buf = await f.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<Row>(ws, { defval: "" });
    if (json.length === 0) return toast.error("No rows found in file");
    const hdrs = Object.keys(json[0]);
    setHeaders(hdrs);
    setRows(json);
    // Auto-detect
    const findCol = (needle: string) => hdrs.find((h) => h.toLowerCase().includes(needle)) ?? "";
    setMapping({
      email: findCol("email") || findCol("mail"),
      full_name: findCol("name"),
      external_id: findCol("id"),
      tags: findCol("tag") || findCol("group"),
    });
    setStep(2);
  };

  const validRows = () => rows
    .map((r) => ({
      email: String(r[mapping.email] ?? "").trim().toLowerCase(),
      full_name: mapping.full_name ? String(r[mapping.full_name] ?? "").trim() : null,
      external_id: mapping.external_id ? String(r[mapping.external_id] ?? "").trim() || null : null,
      tags: [
        ...(mapping.tags ? String(r[mapping.tags] ?? "").split(/[,;|]/).map((s) => s.trim()).filter(Boolean) : []),
        ...(defaultTag ? [defaultTag] : []),
      ],
    }))
    .filter((r) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.email));

  const commit = async () => {
    setStep(4);
    const all = validRows().map((r) => ({ ...r, organization_id: orgId, status: "active" as const }));
    const batchSize = 250;
    let inserted = 0;
    for (let i = 0; i < all.length; i += batchSize) {
      const batch = all.slice(i, i + batchSize);
      const { error, count } = await supabase
        .from("org_members_directory")
        .upsert(batch, { onConflict: "organization_id,email", count: "exact" });
      if (error) {
        toast.error(`Batch failed: ${error.message}`);
        break;
      }
      inserted += count ?? batch.length;
      setProgress(Math.round(((i + batch.length) / all.length) * 100));
    }
    setDone({ inserted, updated: 0, skipped: rows.length - all.length });
    toast.success(`Imported ${inserted} members`);
    onDone();
  };

  const valid = validRows().length;
  const invalid = rows.length - valid;

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="institutional"><Upload className="h-4 w-4" /> Import from Excel/CSV</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle className="font-serif text-2xl">Import members</DialogTitle></DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-12 hover:border-gold transition-colors">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
              <p className="mt-3 font-medium">Drop or click to upload</p>
              <p className="mt-1 text-xs text-muted-foreground">.xlsx, .xls or .csv — up to 50,000 rows</p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </label>
            <p className="text-xs text-muted-foreground">Required column: email. Optional: full name, external ID, tags.</p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Map your spreadsheet columns to member fields. Detected {rows.length} rows.</p>
            {(["email", "full_name", "external_id", "tags"] as const).map((field) => (
              <div key={field} className="grid grid-cols-[1fr_2fr] items-center gap-3">
                <Label className="capitalize">{field.replace("_", " ")}{field === "email" && " *"}</Label>
                <Select value={mapping[field] || REQUIRED} onValueChange={(v) => setMapping((m) => ({ ...m, [field]: v === REQUIRED ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="— skip —" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={REQUIRED}>— skip —</SelectItem>
                    {headers.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <div className="grid grid-cols-[1fr_2fr] items-center gap-3">
              <Label>Add tag to all</Label>
              <Input placeholder="e.g. shareholders-2026" value={defaultTag} onChange={(e) => setDefaultTag(e.target.value)} />
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button variant="institutional" disabled={!mapping.email} onClick={() => setStep(3)}>Preview</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat label="Total rows" value={rows.length} />
              <Stat label="Valid" value={valid} />
              <Stat label="Skipped (invalid email)" value={invalid} />
            </div>
            <div className="max-h-64 overflow-auto rounded-md border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/40"><tr><th className="px-2 py-1.5 text-left">Email</th><th className="px-2 py-1.5 text-left">Name</th><th className="px-2 py-1.5 text-left">Tags</th></tr></thead>
                <tbody>
                  {validRows().slice(0, 50).map((r, i) => (
                    <tr key={i} className="border-t border-border/50"><td className="px-2 py-1">{r.email}</td><td className="px-2 py-1">{r.full_name}</td><td className="px-2 py-1">{r.tags.join(", ")}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
              <Button variant="institutional" disabled={valid === 0} onClick={commit}>Import {valid} members</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 py-4 text-center">
            {progress < 100 ? (
              <>
                <p className="text-sm">Importing… {progress}%</p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-gold transition-all" style={{ width: `${progress}%` }} />
                </div>
              </>
            ) : (
              <>
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                <p className="font-serif text-xl">Imported {done.inserted} members</p>
                {done.skipped > 0 && <p className="text-sm text-muted-foreground">{done.skipped} rows skipped (invalid email)</p>}
                <Button variant="institutional" onClick={() => setOpen(false)}>Done</Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="font-serif text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
