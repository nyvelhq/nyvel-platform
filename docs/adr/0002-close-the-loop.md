# ADR 0002: Protected briefings, test completion and finding replies (UX-02)

- Status: Accepted
- Date: 2026-09-26

## Context

The company↔tester loop stopped short in three places. Testers never saw the
briefing a company wrote. Nothing could move a test to `complete`. A tester
asked for "More info" could read the question but not answer it.

Showing the briefing exposed a real leak. `tests.briefing` sat on `public.tests`,
and "tests: testers can read open tests" returns whole rows. So every signed-in
tester could already read every open test's briefing (build links, credentials)
through the API, whether or not they had applied or accepted the NDA.

## Decision

1. **Briefings move to `public.test_briefings`** (one row per test) with its
   own RLS:
   - admin: full access;
   - owning company: read;
   - tester: read only with an `accepted` application, plus
     `nda_accepted_at` when the test is NDA-required.

   Explicit grants: `select` for `authenticated`, nothing for `anon`. An
   `after insert or update of briefing` trigger on `tests` moves any value into
   `test_briefings` and nulls the column. The existing Create Test insert
   therefore needs no change, and an old client can't re-leak it. Existing
   briefings are backfilled.
2. **`set_test_status(test_id, status)` RPC** (`security definer`). Only an
   admin or the owning company may call it. The only transitions are
   `open`/`in_review` → `complete` and `complete` → `open`. An RPC rather than a
   company `UPDATE` policy on `tests`, so companies can't also change
   compensation or other fields after testers have done the work.
3. **No findings on completed tests.** A `before insert` trigger on
   `findings` raises. Triage of existing findings continues.
4. **`respond_to_finding(finding_id, response)` RPC.** Only the finding's
   own tester, only while its status is `more_info`, with a non-empty reply of
   at most 5000 characters. The reply is stored in `findings.tester_response`
   with `responded_at`, and the status goes back to `open` for re-triage.
   Testers still have no `UPDATE` policy on findings. A `before update` trigger
   stops company users from editing `tester_response`.

## Consequences

- Only the latest reply is stored (a second "more info" round overwrites
  it). A threaded history would need a `finding_messages` table.
- Accepted testers on NDA-required tests whose application predates 0006
  have no `nda_accepted_at` and so can't see the briefing. 0006 makes that
  field immutable, so an admin would have to backfill it deliberately if the
  NDA was agreed offline.
- Migration 0007 must be applied before this frontend ships. Pages use
  `select('*')` so they load either way, but briefings, Mark complete and
  replies won't work until it is applied.
