// Edge function: verify a voting token without authenticating the voter.
// Bypasses RLS via service role. Returns minimal info needed to enter the ballot.
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
    if (!token || typeof token !== "string") return json({ error: "Token required" }, 400);
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: roll } = await admin
      .from("voter_roll")
      .select("id, election_id, has_voted, email")
      .eq("voting_token", token.trim())
      .maybeSingle();
    if (!roll) return json({ error: "Invalid token" }, 404);

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
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
