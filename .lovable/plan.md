# ElectaCore — Unmatched Multi-Tenant Election Platform

Goal: any organization can self-serve onboard, brand themselves, import members in bulk (Excel/CSV/API), build and run elections, and audit results — all from one cockpit.

## 1. Organization Cockpit (rework `/app/organizations/$orgId`)

Single command center with these tabs:

- **Overview** — KPIs (members, active elections, ballots cast, turnout %), recent activity feed, quick actions.
- **Branding** — already exists; add logo upload to Storage bucket `org-logos`, custom subdomain/slug, email-from name, dark/light brand preview, public org page URL.
- **Members** — bulk roster (see §2).
- **Elections** — list + create-in-context (election auto-assigned to this org, no dropdown needed).
- **Integrations** — CSV/Excel import, Google Sheets sync, Webhook ingest endpoint, API key management (see §3).
- **Audit & Compliance** — full audit log filtered to this org, export to CSV.
- **Settings** — roles, danger zone (delete org), billing placeholder.

## 2. Member Management (the killer feature)

New table `org_members_directory` (separate from `organization_members` which is for staff/admins):
- `id, organization_id, email, full_name, external_id, metadata jsonb, tags text[], status (active/invited/suspended), invited_at, joined_at, user_id (nullable until they sign up)`

Capabilities:
- **Excel/CSV import wizard** — drag-drop `.xlsx`/`.csv`, parsed client-side with `xlsx` library, column-mapping UI (map sheet columns → email/name/tags/external_id), validation preview (duplicates, invalid emails), commit in batches of 500 via server function.
- **Manual add** — single-row form.
- **Google Sheets sync** — paste a public sheet URL or connect Google Sheets connector for live sync.
- **API ingest** — per-org API key; documented `POST /api/public/orgs/:slug/members` endpoint with HMAC signature.
- **Bulk actions** — select rows → tag, remove, invite to election, export.
- **Search & filter** — by tag, status, email.
- **Auto-enrollment rule** — when an election is created, optionally auto-populate `voter_roll` from a tag filter (e.g. `tag = "shareholders-2026"`).

## 3. Election Lifecycle (within org context)

- Create election → wizard (basics → method → candidates → eligibility → schedule → review).
- Eligibility step pulls from org directory: "All members", "Members with tag X", "Upload list", or "External API".
- One-click invite emails (uses Resend connector if linked, otherwise queues).
- Live monitoring page (turnout %, ballots/hour chart, geo if available).
- Auto-tally on close + downloadable signed results PDF.

## 4. Public Org Portal `/o/$slug`

Branded landing page per org listing their open/closed elections, with the org's logo, colors, tagline. Voters see their org's brand, not ElectaCore's.

## 5. Security & RLS

- All new tables: org-scoped RLS via `is_org_member` / `is_org_admin`.
- Per-org API keys hashed (sha256) at rest; raw key shown once.
- Storage bucket `org-logos` public-read, write restricted to org admins.
- Rate-limit public ingest endpoints.

## 6. Database Migration (single migration)

- `org_members_directory` table + indexes (org_id, email unique per org, tags GIN).
- `org_api_keys` (id, org_id, name, key_hash, last_used_at, created_by).
- `org_invitations` (id, org_id, email, role, token, expires_at).
- Storage bucket `org-logos` + policies.
- Helper fn `enroll_voters_by_tag(election_id, org_id, tag)`.
- RLS policies for all new tables.

## 7. Frontend Architecture

```
src/routes/_authenticated/app.organizations.$orgId.tsx   (rebuilt with tab router)
src/routes/_authenticated/app.organizations.$orgId.members.tsx
src/routes/_authenticated/app.organizations.$orgId.elections.tsx
src/routes/_authenticated/app.organizations.$orgId.integrations.tsx
src/routes/_authenticated/app.organizations.$orgId.audit.tsx
src/routes/o.$slug.tsx                                    (public portal)
src/components/org/MemberImportWizard.tsx
src/components/org/MemberTable.tsx
src/components/org/BrandingPanel.tsx
src/components/org/ApiKeyManager.tsx
src/lib/members.functions.ts                              (server fns: bulk insert, dedupe)
src/routes/api/public/orgs.$slug.members.ts               (API ingest endpoint)
```

Add deps: `xlsx` (sheet parsing), `papaparse` (CSV streaming).

## 8. Demo Polish

- Seed sample org "Acme Cooperative" with 50 demo members and 1 active election so the demo login lands on a populated cockpit.
- Inline tooltips and an empty-state checklist ("Add your first members → Create election → Invite voters → View results").

## Technical Notes

- Excel parsing happens client-side to avoid large uploads; only validated rows POST to `bulkUpsertMembers` server fn (chunked).
- `bulkUpsertMembers` uses `upsert` on `(org_id, email)` to make re-imports idempotent.
- API ingest uses HMAC over `(timestamp + body)` with the org API key; reject if timestamp >5min old.
- Logo upload via signed URL → Supabase Storage → public URL stored on `organizations.logo_url`.
- Tag-based auto-enrollment runs as a server fn that inserts into `voter_roll` with generated `voting_token`s.
- All long lists virtualized with `@tanstack/react-virtual` for 10k+ member orgs.

This turns the platform from "admin tool" into a true white-label SaaS where any org can self-onboard, import their roster from whatever system they already use, and run trusted elections under their own brand.