# Nyvel STRIDE Threat Model

This is a threat model grounded in what this repo actually contains today —
the real schema, the real RLS policies, the real auth flow — not a generic
STRIDE template. Every finding below says whether it was **verified** by
reading the actual policy/code, or **inferred** (plausible but not checked
against a live Supabase project, since this doc was written from the repo
alone with no database access). Findings that already have a real,
in-repo mitigation say so explicitly, so this doesn't re-flag solved
problems as open risks.

Companion docs: `docs/ops/RUNBOOK.md` (secrets/backups/monitoring — some
findings below cross-reference it rather than repeating it) and
`supabase/schema.sql` / `supabase/migrations/*.sql` (the source of truth
this analysis was checked against).

## 1. Scope, actors, and trust boundaries

**In scope:** the React SPA (`src/`), Supabase (Postgres + RLS + Auth +
PostgREST), and the Vercel hosting layer, as they exist in this repo today.

**Out of scope:** actual payment processing (there is none — `mockData.js`'s
"non-sandbox payments" claim was removed as a compliance fix, not a security
one), the `C-07` payout-email feature (not built — blocked on an email
provider), physical security, and Supabase/Vercel's own infrastructure
security (trusted third parties; not re-audited here).

**Actors (from `public.user_role`):**

- **Anonymous visitor** — sees the public landing page, behind the
  site-wide password gate (see §1.1).
- **Tester** — applies to tests, submits findings.
- **Company** — a client contact; owns tests via `client_id`, reviews
  applicants, triages findings.
- **Admin** — full access to every table (`is_admin()`-gated policies).

**Trust boundaries (verified from `supabase/schema.sql`):**

1. **Browser ↔ Supabase.** The browser holds only the public anon key
   (`REACT_APP_SUPABASE_ANON_KEY`) and a user JWT after sign-in. The anon
   key is meant to be public — **Row Level Security on every table is the
   real boundary**, not the key. This is confirmed: every one of the 7
   tables has `enable row level security` plus explicit policies; there is
   no table left open by omission.
2. **UI route guards ↔ RLS.** `App.js`'s `ProtectedRoute`-style checks and
   page-level role checks are a UX convenience, not a security boundary —
   verified that the same restrictions (e.g., a company only seeing its
   own tests, a tester only reading own applications) are independently
   enforced by RLS `using`/`with check` clauses, so bypassing the React
   router (devtools, direct API calls) does not bypass the real
   authorization.
3. **The site-wide password gate is a *separate, weaker* boundary — not
   part of the app's real authz model.** See §1.1.

### 1.1 The password gate is not a security boundary — by design, but worth stating plainly

`src/utils/accessGate.js` + `PasswordGate` + `App.js`'s `isAuthenticated`
flag exist to keep the pre-launch site out of casual/search-engine view,
not to protect data. Verified in `App.js`:

```js
const [isAuthenticated, setIsAuthenticated] = useState(() => {
  try { return localStorage.getItem('nyvel_authenticated') === 'true'; }
  catch { return false; }
});
```

Any visitor can open devtools and run
`localStorage.setItem('nyvel_authenticated', 'true')` to clear the gate
without ever knowing the password — there is no server-side check at all.
This is **not a new finding to fix** (the gate was never meant to resist
that — real data access still requires a real Supabase sign-in and is
governed by RLS regardless), but it belongs in a threat model explicitly so
nobody later mistakes the password gate for an access control and relies
on it to protect something that needs real protection. The actual secret
(`REACT_APP_PASSWORD`) and its hardcoded-fallback history are covered in
`docs/ops/RUNBOOK.md` §1.2 — that's a secrets-hygiene issue, this is a
"what is this control for" clarification.

## 2. STRIDE findings

Each finding is tagged **Verified** (read the actual policy/code and
confirmed the behavior) or **Inferred** (plausible from the code, not
confirmed against a live project — flagged so it isn't mistaken for a
tested fact).

### 2.1 Spoofing

| # | Finding | Status |
|---|---|---|
| S1 | Real identity (sign-in, session, password reset) is entirely delegated to Supabase Auth (`supabase.auth.signInWithPassword`/`resetPasswordForEmail`/`updateUser` in `App.js`) — no custom session/JWT handling in this repo to get wrong. | **Verified mitigated.** |
| S2 | The site-wide password gate authenticates "this browser," not a person — see §1.1. Trivially bypassed client-side, but doesn't grant access to any real data (RLS still applies). | **Verified — accepted risk, not a data-access issue.** |
| S3 | `supabase-js` is configured with `persistSession: true` (`src/lib/supabaseClient.js`), so the session JWT lives in `localStorage`. A successful XSS anywhere in the app would let an attacker steal it and impersonate the signed-in user until the token expires/refreshes. No user-generated content is rendered as raw HTML anywhere found in `src/pages`/`src/components` (React escapes by default; no `dangerouslySetInnerHTML` usages found), which is the main practical mitigant today. | **Inferred — no known XSS vector found, but this is the blast radius if one is ever introduced.** Worth a rule in `docs/qa/DEFINITION_OF_DONE.md`-style review: never add `dangerouslySetInnerHTML` for a findings `description`/test `briefing` field without sanitizing, since those are exactly the free-text fields one role writes and another role's browser renders. |

### 2.2 Tampering

| # | Finding | Status |
|---|---|---|
| T1 | Every mutation path (`addCompanyTest`, `applyToTest`, `decideApplication`, `submitFinding`, `triageFinding`, `markPayoutPaid` in `DataContext.jsx`) is backed by an RLS `with check` that independently re-derives the caller's role/`client_id` server-side via `current_user_role()`/`current_user_client_id()` (both `security definer`) — a forged client-side payload (wrong `client_id`, wrong `tester_id`, wrong `status`) is rejected by Postgres, not just hidden by the UI. Spot-checked against `applications`, `findings`, and `tests` insert/update policies. | **Verified mitigated.** |
| T2 | `profiles: self can update own name only` correctly pins `role = public.current_user_role()` in its `with check`, so a signed-in user cannot promote themselves via an UPDATE. | **Verified mitigated.** |
| T3 | **`profiles: admin can insert` does *not* pin `role` the same way T2 does.** The policy is `for insert with check (public.is_admin() or id = auth.uid())` — the self-insert branch (`id = auth.uid()`) has no constraint on the `role` column at all. In the normal signup flow this is unreachable, because `handle_new_user()` (a `security definer` trigger) already creates the profile row with `role` defaulting to `'tester'` the moment `auth.users` gets a new row, and the table's primary key then blocks a second insert for that `id`. But if a profile row is ever missing when a real, signed-in user exists for it — a deleted profile row, a failed/disabled trigger, any admin cleanup script — that user could `insert into profiles (id, email, role) values (auth.uid(), ..., 'admin')` themselves and RLS would allow it, because nothing in the policy checks `role`. This is a **latent privilege-escalation gap**, not a live one today, but it's a real hole in the policy's design, not a hypothetical. | **Gap found — recommendation in §3, not fixed in this PR (see "Eben must do").** |
| T4 | `payouts` is documented (schema comment, `DataContext.jsx` comment, `docs/qa/DEFINITION_OF_DONE.md`) as "append-only once paid," but that's a *convention*, not an enforced constraint. `payouts: admin full access` is `for all using (is_admin()) with check (is_admin())` — an admin update to an already-`paid` row (change the amount, change `paid_by`) is not blocked by RLS or by any table CHECK/trigger. There's no history table, so the prior value wouldn't be recoverable. | **Gap found — recommendation in §3.** |
| T5 | Tester-onboarding "extra" profile fields (bio, skills, devices — see `App.js`'s `EXTRA_STORAGE_PREFIX`) live only in that same browser's `sessionStorage`, never sent to or trusted by the server. A tester could freely edit their own bio/skills client-side, but since nothing server-side (RLS, a company's view, a payout decision) currently reads or trusts these fields, this is data the user is only lying to themselves with — not a trust-boundary violation. Worth remembering if a later feature (e.g., a company filtering testers by "skills") starts trusting this field without moving it server-side first. | **Verified — not currently exploitable, flagged for future awareness.** |

### 2.3 Repudiation

| # | Finding | Status |
|---|---|---|
| R1 | Every meaningful state change on `applications`/`findings`/`payouts` records who did it and when (`decided_by`/`decided_at`, `reviewed_by`/`reviewed_at`, `paid_by`/`paid_at`), which gives real "who approved this" attribution for the core loop — better than most MVPs. | **Verified mitigated for normal operation.** |
| R2 | There is no immutable audit log anywhere in the schema — `notifications` is the closest thing, but per its own schema comment it's "an audit log of what was sent," not a general action log, and it only covers the fixed set of notification `type`s. Combined with T4 above: if a paid payout were altered, there would be no record that it had ever been different. | **Gap — same root cause as T4; a lightweight audit/history table would address both.** |
| R3 | `src/pages/AdminSecurity.jsx` renders a "Security & Compliance" page with entirely fabricated data from `src/data/mockData.js` — a fake "Two-Factor Auth: Enabled, 98% coverage," a fake "Brute Force Attempt... Blocked" threat log, fake SSL/encryption status. This is the same class of problem F-08 already fixed on the admin dashboard (fabricated metrics with no backing data), just not yet applied here. The page does say "Read-only monitoring view. Resolving individual threats... aren't wired up yet," which is honest about *actions* not being wired up, but it doesn't say the *data itself* is fake — an admin reading this page today would reasonably believe 2FA is actually enabled for 98% of accounts (it isn't — this app has no 2FA feature at all) and that 3 real brute-force attempts were actually blocked (there's no such detection anywhere in the code). This directly undermines repudiation/monitoring: it looks like a security log, so if a real incident happened, this page would neither show it nor be trusted once someone noticed the numbers never move. | **Real finding — recommend as a follow-up backlog item (see §4), out of scope to fix in a docs-only PR.** |

### 2.4 Information Disclosure

| # | Finding | Status |
|---|---|---|
| I1 | The Supabase anon key is public by design; RLS (verified per-table, see §1) is the actual boundary. Already documented in `docs/ops/RUNBOOK.md` §1 — not re-litigated here. | **Verified mitigated — see RUNBOOK.** |
| I2 | `findings: company can read accepted findings for own tests` (the original schema.sql policy, comment: "Rejected / more-info findings never reach the client") is now **superseded in practice** by `findings: company can read all findings for own tests` (added in migration `0004_finding_triage_rls.sql`) — RLS SELECT policies are OR'd, so the broader one wins. Verified this is intentional, not a leftover bug: `CompanyTestDetail.jsx`'s `loadFindings()` deliberately queries all findings with no status filter, because the "company" role is the same person who triages `open`/`rejected`/`more_info` findings (C-05), not a separate "results consumer" persona. **The stale part is schema.sql's own comment**, which still describes the narrower, pre-migration-0004 model and would mislead a future contributor about what the client can actually see. | **Documentation drift, not a live vulnerability — recommend updating the schema.sql comment (see §4); not changed in this PR to keep it docs-only and avoid touching a file migrations depend on being read in order.** |
| I3 | Findings `description`/`title` and test `briefing` are free text that could contain a real vulnerability description about a client's product. `findings` RLS correctly scopes read access to the submitting tester, the owning company, and admin only — verified no policy leaks these to other testers or other companies. | **Verified mitigated.** |
| I4 | `console.error(error.message)` is used throughout `DataContext.jsx`/page components on every Supabase call failure. Postgres/PostgREST error messages can occasionally include table/column names or constraint names, visible to anyone with devtools open (i.e., the signed-in user themselves, not a third party, since these are client-side try/catch logs). Low severity — no cross-user disclosure, just implementation detail exposed to a user about their own failed request. | **Inferred — low severity, no action recommended beyond awareness.** |

### 2.5 Denial of Service

| # | Finding | Status |
|---|---|---|
| D1 | Supabase Auth's own rate limiting on sign-in/password-reset endpoints is a platform default, not something this repo configures — **not verified** from the repo alone. | **Inferred — "Eben must do": confirm in the Supabase dashboard.** |
| D2 | `applications` has a `unique (test_id, tester_id)` constraint, so a tester cannot spam-apply to the same test — verified this specific vector is closed. | **Verified mitigated.** |
| D3 | `findings` has **no cap** on how many a single accepted tester can submit for one test. `findings: accepted tester can submit` only checks that an accepted application exists — it doesn't limit count. A tester with one accepted application could script unlimited `submitFinding` calls, filling a company's triage queue and the `findings` table. This is a real, currently-open spam/DoS-shaped gap, low-cost to add a check for later (e.g., a per-test submission cap, or just rate-limiting writes at the API/PostgREST level), but not something this docs-only pass changes. | **Gap found — recommend as a follow-up (see §4).** |
| D4 | Static hosting on Vercel plus Supabase's managed Postgres means there's no self-hosted server process this app can crash via resource exhaustion the way a traditional backend could — the attack surface for classic app-level DoS is smaller than average. Vercel/Supabase-level DDoS protection is a platform capability, not verified/configured from this repo. | **Inferred.** |

### 2.6 Elevation of Privilege

| # | Finding | Status |
|---|---|---|
| E1 | Role is never client-supplied at sign-up (`handle_new_user()` always defaults to `'tester'` server-side) and cannot be self-elevated via UPDATE (T2, verified). The only gap is the INSERT-path edge case in T3. | **Mostly mitigated — one real gap (T3), documented above rather than duplicated here.** |
| E2 | `is_admin()`/`current_user_role()`/`current_user_client_id()` are all `security definer` functions that read `profiles` directly — verified they don't recursively trigger RLS on `profiles` in a way that could be manipulated, and they're the single source every policy relies on (no policy re-implements its own role check inline in a way that could drift from these). | **Verified — good pattern, worth preserving in future migrations rather than inlining new role checks.** |
| E3 | Nothing in `AdminUsers.jsx`/`AdminSettings.jsx` was found to let a company or tester change their own or another user's role from the UI — role changes, if they happen today, would have to go through the Supabase dashboard directly (not reviewed in depth here; out of scope creep for a docs-only pass, flagged for a future pass if role-management UI is ever built). | **Inferred — not deeply audited; note for a future UI-adding pass.** |

## 3. Recommended fixes (not applied in this PR — docs-only item)

In priority order:

1. **T3 (profiles self-insert role gap)** — mirror the self-update
   policy's pattern exactly:
   ```sql
   drop policy if exists "profiles: admin can insert" on public.profiles;
   create policy "profiles: admin can insert" on public.profiles
     for insert with check (
       public.is_admin() or (id = auth.uid() and role = 'tester')
     );
   ```
   This closes the gap with a one-line, same-shape change as an
   already-working policy — low risk, but it touches RLS, which per
   `docs/agent/RULES.md` means "stop and report instead of guessing"
   rather than ship it inside a docs-only PR untested against a live
   project. Recommend this become its own small, focused backlog item
   (added to the queue in `docs/agent/STATUS.md` as a follow-up) so it
   gets its own PR, its own "Eben must do" migration step, and a
   deliberate live check rather than riding along here.
2. **T4/R2 (payout immutability + audit trail)** — either a `before update`
   trigger on `payouts` that rejects changes when `status = 'paid'` in the
   OLD row, or (more useful long-term) a simple `payout_history` table
   written by a trigger on every update, so "what did this used to say"
   is always answerable.
3. **D3 (findings submission cap)** — a per-`(test_id, tester_id)` count
   check, either in RLS (`with check (select count(*) from findings where
   ... < N)`) or as a lighter-weight UI-level warning plus a Postgres
   `check`/trigger for the real enforcement.
4. **R3 (AdminSecurity.jsx fabricated data)** — same treatment as F-08:
   either wire it to something real (there's currently nothing real to
   wire it to — no 2FA, no intrusion detection) or replace it with an
   honest "not yet implemented" state, the same choice F-08 made for
   uptime/satisfaction score.
5. **I2 (stale schema.sql comment)** — a one-line comment fix in
   `schema.sql` correcting "Rejected / more-info findings never reach the
   client" to reflect migration 0004's intentional broadening.

## 4. Suggested new backlog items (for `docs/agent/STATUS.md`, not queued automatically by this PR)

- Fix the `profiles` self-insert RLS gap (T3) — small, focused, needs a
  live-project check after applying.
- Add payout immutability/audit trail (T4/R2).
- Cap findings submissions per tester per test (D3).
- Replace `AdminSecurity.jsx`'s fabricated security data (R3) — same shape
  of fix as F-08.

These are recommendations for the queue, not applied to it here, since
reordering/adding to the queue is explicitly a product-owner decision this
orchestrator doesn't make unilaterally outside the Monday reordering-proposal
process.

## 5. What this document is not

This is a threat model derived from reading the code and schema, not a
penetration test — nothing here was exploited against a live environment,
and Supabase/Vercel platform-level configuration (auth rate limits, backup
settings, DDoS protection, branch protection) was already flagged in
`docs/ops/RUNBOOK.md` as needing a human to check the actual dashboards.
Treat every "Inferred" tag above as a lead to verify, not a confirmed fact.
