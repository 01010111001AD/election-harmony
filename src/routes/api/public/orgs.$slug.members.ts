import { createFileRoute } from "@tanstack/react-router";
import { createHash } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type Incoming = { email: string; full_name?: string; external_id?: string; tags?: string[] };

function jres(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "access-control-allow-origin": "*" } });
}

export const Route = createFileRoute("/api/public/orgs/$slug/members")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type, x-api-key" } }),
      POST: async ({ request, params }) => {
        const apiKey = request.headers.get("x-api-key") ?? "";
        if (!apiKey || !apiKey.startsWith("elc_")) return jres({ error: "Missing or invalid x-api-key header" }, 401);

        // Find org
        const { data: org } = await supabaseAdmin.from("organizations").select("id").eq("slug", params.slug).maybeSingle();
        if (!org) return jres({ error: "Organization not found" }, 404);

        // Verify key
        const hash = createHash("sha256").update(apiKey).digest("hex");
        const prefix = apiKey.slice(0, 8);
        const { data: keyRow } = await supabaseAdmin
          .from("org_api_keys").select("id,key_hash")
          .eq("organization_id", org.id).eq("key_prefix", prefix).maybeSingle();
        if (!keyRow || keyRow.key_hash !== hash) return jres({ error: "Invalid API key" }, 401);

        // Parse body
        let body: unknown;
        try { body = await request.json(); } catch { return jres({ error: "Invalid JSON" }, 400); }
        const items = (Array.isArray(body) ? body : [body]) as Incoming[];
        if (items.length === 0) return jres({ error: "Empty payload" }, 400);
        if (items.length > 5000) return jres({ error: "Max 5000 records per request" }, 400);

        const valid = items
          .filter((r) => r && typeof r.email === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.email))
          .map((r) => ({
            organization_id: org.id,
            email: r.email.toLowerCase().trim(),
            full_name: r.full_name?.toString().trim() || null,
            external_id: r.external_id?.toString().trim() || null,
            tags: Array.isArray(r.tags) ? r.tags.filter((t) => typeof t === "string").slice(0, 20) : [],
            status: "active" as const,
          }));

        if (valid.length === 0) return jres({ error: "No valid records (email required)" }, 400);

        const { error, count } = await supabaseAdmin
          .from("org_members_directory")
          .upsert(valid, { onConflict: "organization_id,email", count: "exact" });
        if (error) return jres({ error: error.message }, 500);

        await supabaseAdmin.from("org_api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", keyRow.id);

        return jres({ ok: true, received: items.length, accepted: valid.length, upserted: count ?? valid.length });
      },
    },
  },
});
