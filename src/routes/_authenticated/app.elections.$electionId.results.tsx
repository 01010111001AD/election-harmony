import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LiveResults } from "@/components/election/LiveResults";

export const Route = createFileRoute("/_authenticated/app/elections/$electionId/results")({
  component: Results,
  head: () => ({ meta: [{ title: "Results — ElectaCore" }] }),
});

function Results() {
  const { electionId } = Route.useParams();
  const [election, setElection] = useState<any>(null);

  useEffect(() => {
    supabase.from("elections").select("*").eq("id", electionId).single().then(({ data }) => setElection(data));
  }, [electionId]);

  return (
    <div className="space-y-6">
      <div>
        <Link to="/app/elections/$electionId" params={{ electionId }} className="text-xs uppercase tracking-[0.22em] text-gold hover:underline">← Back to election</Link>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">{election?.title} — Results</h1>
        {election && <Badge className="mt-2">{election.status}</Badge>}
      </div>
      <Card>
        <CardHeader><CardTitle className="font-serif">Live tally</CardTitle></CardHeader>
        <CardContent><LiveResults electionId={electionId} /></CardContent>
      </Card>
    </div>
  );
}
