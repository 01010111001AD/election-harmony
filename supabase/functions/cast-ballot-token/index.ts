// Edge function: cast a ballot via single-use voting token (no auth required)
// Always returns HTTP 200 with { ok, error? } envelope.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { token, election_id, selections } = await req.json();
    if (!token || !election_id || selections === undefined) {
      return json({ ok: false, error: "Missing fields" });
    }
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: roll } = await admin
      .from("voter_roll")
      .select("id, has_voted, election_id")
      .ilike("voting_token", String(token).trim())
      .eq("election_id", election_id)
      .maybeSingle();
    if (!roll) return json({ ok: false, error: "Invalid token" });
    if (roll.has_voted) return json({ ok: false, error: "This token has already been used" });

    const { data: el } = await admin.from("elections").select("status").eq("id", election_id).single();
    if (el?.status !== "open") return json({ ok: false, error: "Election is not open" });

    const { error: insErr } = await admin.from("ballots").insert({
      election_id, voter_roll_id: roll.id, selections,
    });
    if (insErr) return json({ ok: false, error: insErr.message });

    await admin.from("voter_roll").update({ has_voted: true }).eq("id", roll.id);
    await admin.from("audit_log").insert({ election_id, event: "ballot_cast_token" });

    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: (e as Error).message });
  }
});

function json(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200, headers: { ...cors, "Content-Type": "application/json" },
  });
}
