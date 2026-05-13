## Goals

Make the platform fully usable end-to-end for voters and admins: fix token login, add a voter dashboard with live results, allow election deletion, attach candidate photos, pull org branding into the election manage screen, fix "Enroll from directory", and add Excel import directly into the voter roll.

---

## 1. Fix voting-token login

**Symptom:** "Invalid voting token" even with a real token.

**Root causes & fixes:**
- `verify-voting-token` is wired but the dashboard token generator (`XXXX-XXXX-XXXX`, uppercase) and the directory-enrollment generator (`encode(gen_random_bytes(16), 'hex')`, lowercase) produce different shapes. Make verification case-insensitive: in the edge function compare `lower(voting_token) = lower($1)` via `.ilike()` after stripping whitespace, so users can paste either format and casing.
- Surface the real error: `verify-voting-token` and `cast-ballot-token` return non-2xx codes (404/401), but `supabase.functions.invoke` swallows the JSON body when status ≥ 400. Update both edge functions to **always return HTTP 200** with `{ ok: false, error }` so the client can read the message; update `login.tsx` and `o.$slug.tsx` to read `data.error` directly.
- Redeploy `verify-voting-token` and `cast-ballot-token`.

## 2. Voter dashboard (`/my`)

New authenticated route `/_authenticated/my.tsx`:
- Lists every election the signed-in user is enrolled in (`voter_roll.user_id = auth.uid()`).
- Each card shows: org logo + brand color, election title, status badge, "Cast ballot" CTA when `open` and `!has_voted`, "View results" when `closed`/`certified`, "Receipt recorded" when already voted.
- Pulls org branding for each card so voters see the tenant identity.
- Add a sidebar/header link "My ballots" to the existing `_authenticated` layout for signed-in voters.

## 3. Live results visible to voters

Refactor results into a shared component `src/components/election/LiveResults.tsx`:
- Reads candidates + ballots, builds tally (existing logic from `app.elections.$electionId.results.tsx`).
- Subscribes via Supabase Realtime (`postgres_changes` on `ballots` filtered by `election_id`) to recount on every new ballot.
- Used by the admin results page AND a new public voter results page `/results/$electionId.tsx`.
- Migration: `ALTER PUBLICATION supabase_realtime ADD TABLE public.ballots;` and add an RLS policy `ballots readable when election certified` (anon + authenticated, `USING (status IN ('open','closed','certified') AND anonymous = true)`-compatible aggregate read) — actually simpler: keep ballots private, but add a `SECURITY DEFINER` function `public.tally_election(_id uuid)` returning per-candidate counts, callable by anyone for `open|closed|certified` elections. Voter dashboard + org portal call this RPC, no row-level ballot leakage.
- `o.$slug.tsx` and the voter dashboard show inline mini-results bars for any election in `open|closed|certified`.

## 4. Delete elections

- Add a "Delete election" destructive button in the manage-election header (next to status actions), gated to `owner_id = auth.uid()`. Uses `AlertDialog` confirmation. Cascade delete is already covered by RLS + manual deletes of children (candidates, voter_roll, ballots, audit_log). Migration: add `ON DELETE CASCADE`-style cleanup via a `SECURITY DEFINER` RPC `delete_election(_id uuid)` so a single click cleans up children safely.
- Also add a Trash icon on each row in the org `Elections` tab and on the dashboard's `ElectionCard`.

## 5. Org branding inherited by elections

Already wired (election → organization_id → branding). Two visible polish steps:
- On the **manage election** page header, when `organization_id` is set, render the org logo + brand-color gradient strip so admins see the same identity voters will see.
- On the new **CreateElection** flow inside the org cockpit, prefill a banner preview using org colors so admins know voters will see branded ballots.

## 6. Candidate photo upload

Migration: create public storage bucket `candidate-photos` with RLS allowing election owners to upload to `<election_id>/...` and public read.

In `CandidatesPanel`:
- Add file input next to name/statement; on add, upload to `candidate-photos/{electionId}/{uuid}.{ext}` and set `photo_url` on insert.
- Render thumbnail in the candidate list and a separate "Replace photo" control per candidate.

In voter ballot (`vote.$electionId.tsx`) and live-results component:
- Render the photo as a 56×56 rounded avatar next to each candidate name.

## 7. Fix "Enroll from directory"

The RPC `enroll_voters_by_tag` exists and works, but two UX bugs make it look broken:
- When the org directory is empty (no Excel import yet) it returns 0 silently. Add a guard: if directory count is 0, show a toast "Your directory is empty — import members first" with a button linking to the org Members tab.
- Tag matching uses `_tag = ANY(m.tags)`. If the directory's members don't carry tags but admin types a tag, the RPC returns 0. Update the UI to show available tags as a dropdown of distinct tags from `org_members_directory.tags` instead of a free-text input, plus an "All active members" option.

## 8. Excel/CSV import directly into a voter roll

Add an **"Import voters from Excel/CSV"** action inside `RollPanel` (election manage page) — reuses the existing `MemberImportWizard` parsing logic in a thinner component `VoterRollImportWizard`:
- Same upload + column-mapping UI (email required).
- On commit, inserts directly into `voter_roll` for the current election, generating a token per row (server-side default via the existing pattern), and skips emails already in the roll.

Connecting to "company API" stays available via the existing API key route `/api/public/orgs/:slug/members` (already shipped) — surface a "Connect via API" tab in the wizard with a copy-pastable cURL example.

## 9. Files

**Edge functions (redeploy):**
- `supabase/functions/verify-voting-token/index.ts` — case-insensitive match, always-200 envelope
- `supabase/functions/cast-ballot-token/index.ts` — always-200 envelope

**New files:**
- `src/routes/_authenticated/my.tsx` — voter dashboard
- `src/routes/results.$electionId.tsx` — public live results
- `src/components/election/LiveResults.tsx` — realtime tally component
- `src/components/election/VoterRollImportWizard.tsx` — Excel/CSV → voter_roll
- `src/components/election/CandidatePhotoUpload.tsx` — small helper

**Edited:**
- `src/routes/_authenticated/app.elections.$electionId.tsx` — delete button, photo upload in CandidatesPanel, directory tag dropdown, voter Excel import, org branding strip
- `src/routes/_authenticated/app.elections.$electionId.results.tsx` — switch to `LiveResults`
- `src/routes/_authenticated/app.dashboard.tsx` + `app.organizations.$orgId.tsx` — delete button on cards
- `src/routes/o.$slug.tsx` + `src/routes/vote.$electionId.tsx` — show live results inline; render candidate photos
- `src/routes/login.tsx`, `src/routes/o.$slug.tsx` — read `data.error` from always-200 envelope

**Migrations:**
- Create `candidate-photos` bucket + RLS policies
- Add `delete_election(uuid)` RPC (SECURITY DEFINER, owner-only)
- Add `tally_election(uuid)` RPC (SECURITY DEFINER, public read for open/closed/certified)
- Realtime: `alter publication supabase_realtime add table public.ballots` (for admin live view; voter side uses the RPC)

No new dependencies (xlsx already installed).
