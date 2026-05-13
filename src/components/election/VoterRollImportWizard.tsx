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

function genToken() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const r = (n: number) => Array.from({ length: n }, () => a[Math.floor(Math.random() * a.length)]).join("");
  return `${r(4)}-${r(4)}-${r(4)}`;
}

export function VoterRollImportWizard({ electionId, onDone }: { electionId: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [emailCol, setEmailCol] = useState("");
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState({ inserted: 0, skipped: 0 });

  const reset = () => { setStep(1); setRows([]); setHeaders([]); setEmailCol(""); setProgress(0); setDone({ inserted: 0, skipped: 0 }); };

  const handleFile = async (f: File) => {
    const buf = await f.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const json = XLSX.utils.sheet_to_json<Row>(wb.Sheets[wb.SheetNames[0]], { defval: "" });
    if (json.length === 0) return toast.error("No rows found");
    const hdrs = Object.keys(json[0]);
    setHeaders(hdrs);
    setRows(json);
    setEmailCol(hdrs.find((h) => h.toLowerCase().includes("email")) ?? hdrs[0]);
    setStep(2);
  };

  const validEmails = () => Array.from(new Set(
    rows
      .map((r) => String(r[emailCol] ?? "").trim().toLowerCase())
      .filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e))
  ));

  const commit = async () => {
    setStep(4);
    const emails = validEmails();
    const payload = emails.map((email) => ({ election_id: electionId, email, voting_token: genToken() }));
    const batchSize = 200;
    let inserted = 0;
    for (let i = 0; i < payload.length; i += batchSize) {
      const batch = payload.slice(i, i + batchSize);
      const { error, count } = await supabase
        .from("voter_roll")
        .insert(batch, { count: "exact" });
      if (error && !/duplicate|conflict/i.test(error.message)) {
        toast.error(`Batch failed: ${error.message}`);
        break;
      }
      inserted += count ?? batch.length;
      setProgress(Math.round(((i + batch.length) / payload.length) * 100));
    }
    setDone({ inserted, skipped: rows.length - emails.length });
    toast.success(`Imported ${inserted} voters`);
    onDone();
  };

  const valid = validEmails().length;

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline"><Upload className="h-4 w-4" /> Import voters from Excel/CSV</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle className="font-serif text-2xl">Import voters</DialogTitle></DialogHeader>
        {step === 1 && (
          <div className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-12 hover:border-gold transition-colors">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
              <p className="mt-3 font-medium">Drop or click to upload</p>
              <p className="mt-1 text-xs text-muted-foreground">.xlsx, .xls or .csv • email column required</p>
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </label>
            <p className="text-xs text-muted-foreground">A single-use voting token is generated for each email and shown in the roll table.</p>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{rows.length} rows detected. Pick the email column.</p>
            <div className="grid grid-cols-[1fr_2fr] items-center gap-3">
              <Label>Email column *</Label>
              <Select value={emailCol} onValueChange={setEmailCol}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{headers.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button variant="institutional" disabled={!emailCol} onClick={() => setStep(3)}>Preview</Button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat label="Total rows" value={rows.length} />
              <Stat label="Valid emails" value={valid} />
              <Stat label="Skipped" value={rows.length - valid} />
            </div>
            <div className="max-h-64 overflow-auto rounded-md border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/40"><tr><th className="px-2 py-1.5 text-left">Email</th></tr></thead>
                <tbody>{validEmails().slice(0, 50).map((e) => <tr key={e} className="border-t border-border/50"><td className="px-2 py-1">{e}</td></tr>)}</tbody>
              </table>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
              <Button variant="institutional" disabled={valid === 0} onClick={commit}>Enroll {valid} voters</Button>
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
                <p className="font-serif text-xl">Imported {done.inserted} voters</p>
                {done.skipped > 0 && <p className="text-sm text-muted-foreground">{done.skipped} rows skipped (invalid/duplicate email)</p>}
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
