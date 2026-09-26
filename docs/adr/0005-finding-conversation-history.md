# ADR 0005: Finding conversation history (UX-07)

- Status: Accepted
- Date: 2026-09-26

## Context

A company can send a finding back with "More info needed", and the tester
replies (0007). The question and reply are stored on the finding itself
(`review_reason`, `tester_response`), so a second round overwrote the first,
and neither side could see what was said before.

## Decision

- **An append-only `finding_messages` table**, written only by an
  `after update` trigger on `findings`. It logs:
  - `question` when a finding is sent back for more info (the company's
    reason);
  - `reply` when the tester answers through `respond_to_finding`;
  - `accepted` / `rejected` for a decision, with any reason.
- **No direct writes.** Nobody has insert, update or delete grants or
  policies, so the history can't be forged or edited from the app. Admins can
  still correct it in the SQL editor.
- **Reading follows the finding.** The select policy checks that the caller
  can see the parent finding, so it reuses findings' existing RLS: the
  tester, the owning company and admins.
- **The existing columns stay** as "latest" values, so the triage flow and
  its triggers (0007, 0011) are unchanged.
- **Backfill.** The question and reply those columns still hold are copied in
  once, oldest first. Earlier rounds that were already overwritten can't be
  recovered.
- **UI.** Both finding views show the thread. If the table can't be read
  (for example, the migration hasn't run), they fall back to the single
  question and reply as before.

## Consequences

- Run migration 0015 for the thread to appear. Without it, nothing breaks.
- A plain accept with no reason is logged but not shown. The status badge
  already says it.
