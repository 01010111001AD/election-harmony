// Edge function: verify a voting token without authenticating the voter.
// Bypasses RLS via service role. Returns minimal info needed to enter the ballot.
// Always returns HTTP 200 with { ok, error? } so clients can read the body.
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
    const { token } = await req.json();
    if (!token || typeof token !== "string") return json({ ok: false, error: "Token required" });
    const cleaned = token.trim();
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    // case-insensitive match (tokens are issued in two formats)
    const { data: roll } = await admin
      .from("voter_roll")
      .select("id, election_id, has_voted, email")
      .ilike("voting_token", cleaned)
      .maybeSingle();
    if (!roll) return json({ ok: false, error: "Invalid token. Check the code from your invitation." });

    const { data: el } = await admin
      .from("elections")
      .select("id, title, status, organization_id")
      .eq("id", roll.election_id)
      .maybeSingle();

    return json({
      ok: true,
      election_id: roll.election_id,
      has_voted: roll.has_voted,
      email: roll.email,
      election: el,
    });
  } catch (e) {
    return json({ ok: false, error: (e as Error).message });
  }
});

function json(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
