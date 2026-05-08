import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/methods")({
  component: () => (
    <PageShell
      eyebrow="Voting Methods"
      title="Every method, mathematically verified."
      lede="Each voting method is implemented with peer-reviewed algorithms, full round-by-round logs, and a parallel shadow count."
    >
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left font-serif">
            <tr>
              <th className="px-5 py-3">Method</th>
              <th className="px-5 py-3">Best for</th>
              <th className="px-5 py-3">Output</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {rows.map((r) => (
              <tr key={r[0]}>
                <td className="px-5 py-4 font-medium">{r[0]}</td>
                <td className="px-5 py-4 text-muted-foreground">{r[1]}</td>
                <td className="px-5 py-4 text-muted-foreground">{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  ),
  head: () => ({ meta: [{ title: "Voting Methods — ElectaCore" }] }),
});

const rows: [string, string, string][] = [
  ["First Past the Post (FPTP)", "Simple single-winner elections", "Highest vote count wins"],
  ["Ranked Choice / IRV", "Single-winner, majority guarantee", "Round-by-round elimination log"],
  ["Single Transferable Vote (STV)", "Multi-winner proportional representation", "Quota + transfer rounds"],
  ["Approval Voting", "Quick consensus, multiple acceptable choices", "Approval count per candidate"],
  ["Weighted Voting", "Shareholder & class-based elections", "Weighted tally with float verification"],
  ["Two-Round System", "Federation presidencies, supermajorities", "Runoff between top two"],
  ["STAR Voting", "Score-based with automatic runoff", "Score + pairwise final"],
  ["Condorcet Method", "Pairwise winner determination", "Full pairwise matrix"],
  ["Borda Count", "Preference-weighted scoring", "Aggregate Borda score"],
  ["Cumulative Voting", "Minority representation", "Distributed vote tally"],
  ["Block Voting", "Multi-seat plurality", "Top-N count"],
  ["Yes / No Referendum", "Resolutions with quorum", "Outcome + threshold verification"],
];
