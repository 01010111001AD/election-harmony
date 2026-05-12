
## Goals

1. Fix the **"Enable Election Admin"** failure on the dashboard.
2. Make the **public branded org portal** (`/o/$slug`) reliable and discoverable.
3. Make the **full election workflow** runnable end-to-end inside an organization (create → candidates → voters → open → vote → close → results) without leaving the cockpit.

---

## 1. Fix "Enable Election Admin"

**Root cause:** `user_roles` only has the policy `platform admins manage roles` for INSERT. A regular signed-in user inserting `(user_id, 'election_admin')` violates RLS — the toast shows the Postgres error and nothing happens.

**Fix:** add a `SECURITY DEFINER` RPC `claim_election_admin()` that inserts the role for `auth.uid()` (idempotent). Call it from the dashboard button instead of a raw insert. No new RLS policy on `user_roles` — keeps privilege escalation surface minimal (self-grant only of `election_admin`, never `platform_admin`).

```sql
create or replace function public.claim_election_admin()
returns void language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  insert into public.user_roles(user_id, role)
  values (auth.uid(), 'election_admin')
  on conflict do nothing;
end $$;
```

Dashboard button calls `supabase.rpc('claim_election_admin')`.

---

## 2. Public branded org portal `/o/$slug`

The route already exists. Improvements:

- Add proper SEO `head()` (title = org name, description = tagline, og:image = logo).
- Show **org-branded election cards** with method badge + live "open/closed" status.
- Add a **"Verify your ballot"** field (token entry → links to `/vote/$electionId?token=...`).
- Link surfaced from the org cockpit (`View public portal` button — already present).
- Confirm `organizations` SELECT policy `branding readable to all` allows anon read of name/logo/colors (it does).
- Confirm `elections` has `open elections public read` policy (it does).
- For closed elections, only show title + closed date (no PII).

---

## 3. Complete in-tenant election workflow

Today, creating an election forces the user back to the global Dashboard. Make the org cockpit self-sufficient:

**a. Create election from inside the org**
- Add a `+ New election` button on the **Elections tab** of `app.organizations.$orgId.tsx` that opens the same `CreateElectionDialog` but pre-pinned to this org (no org dropdown). Reuses existing logic.

**b. Voter enrollment from member directory**
- On the election Manage page (`app.elections.$electionId.tsx`) add an **"Enroll from directory"** action: tag-picker that calls the existing `enroll_voters_by_tag(_election_id, _tag)` RPC. Result toast: "N voters enrolled."
- Keep manual email paste as fallback.

**c. Workflow guardrails**
- Disable "Open voting" if there are 0 candidates or 0 voters in the roll → friendly toast explaining why.
- Show a tiny inline checklist at top: ✅ Candidates · ✅ Voters · ✅ Schedule · then "Open voting" becomes prominent.

**d. Results & certify**
- Already wired (`/app/elections/$electionId/results`). Add a "Copy public portal link" button on the manage page so admins can share the org portal with voters.

**e. Voting flow**
- Public portal "Cast your ballot" already routes to `/vote/$electionId`. Confirm token flow works for enrolled-by-email voters: token shown in roll table is the one they paste at `/login` voting-token tab.

---

## Files

- **Migration**: add `claim_election_admin()` RPC.
- **Edit** `src/routes/_authenticated/app.dashboard.tsx`: button calls `rpc('claim_election_admin')`.
- **Edit** `src/routes/_authenticated/app.organizations.$orgId.tsx`: in-tab New Election dialog, "Copy portal link".
- **Edit** `src/routes/_authenticated/app.elections.$electionId.tsx`: Enroll-by-tag UI, open-voting guardrails.
- **Edit** `src/routes/o.$slug.tsx`: SEO `head()`, token verification field.

No new tables. No dependency changes.

---

## Out of scope

Email delivery (Resend), HMAC verification on the public ingest endpoint, billing — not needed to unblock the user's flow.
