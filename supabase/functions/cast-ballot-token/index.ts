// Edge function: cast a ballot via single-use voting token (no auth required)
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
      return json({ error: "Missing fields" }, 400);
    }
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: roll } = await admin
      .from("voter_roll")
      .select("id, has_voted, election_id")
      .eq("voting_token", String(token).trim())
      .eq("election_id", election_id)
      .maybeSingle();
    if (!roll) return json({ error: "Invalid token" }, 401);
    if (roll.has_voted) return json({ error: "Already voted" }, 409);

    const { data: el } = await admin.from("elections").select("status").eq("id", election_id).single();
    if (el?.status !== "open") return json({ error: "Election not open" }, 400);

    const { error: insErr } = await admin.from("ballots").insert({
      election_id, voter_roll_id: roll.id, selections,
    });
    if (insErr) return json({ error: insErr.message }, 500);

    await admin.from("voter_roll").update({ has_voted: true }).eq("id", roll.id);
    await admin.from("audit_log").insert({ election_id, event: "ballot_cast_token" });

    return json({ ok: true });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, "Content-Type": "application/json" },
  });
}
