# ADR 0004: Tester profiles in the database (UX-05)

- Status: Accepted
- Date: 2026-09-26

## Context

A tester's onboarding answers (country, city, age range, occupation, devices,
OS versions, connection, skills, experience, bio, LinkedIn) were only saved in
the browser's `sessionStorage`. They were lost on logout or on a new device,
the onboarding banner never showed, and companies deciding on applicants saw
only a name and email.

## Decision

- **A separate `tester_profiles` table** (one row per tester, keyed by
  `profiles.id`) rather than more columns on `profiles`. `profiles` is
  readable by companies for their applicants (0003) and guarded by the 0008
  privilege trigger. A separate table keeps that surface unchanged and gives
  the tester fields their own simple RLS.
- **Access:**
  - The tester reads, creates and updates their own row. Only a user whose
    role is `tester` can create one.
  - Admins can read and write every row.
  - Companies can't read the table.
- **What companies see:** `applicant_profiles(test_id)` is a security-definer
  RPC for the test's company (or an admin). It returns only the work-relevant
  fields (skills, devices, OS versions, connection, experience, country, bio),
  only for testers who applied to that test. City, age range, occupation and
  LinkedIn stay private. The onboarding screen says so.
- **Limits in the database:**
  - text field lengths, and at most 20 items per list;
  - LinkedIn must be an `http(s)://` URL, so a `javascript:` link can't be
    stored;
  - `completed_at` is set by the server and keeps its first value;
  - `updated_at` is set by the server;
  - a row can't be moved to another user.
- **Client:**
  - `updateUser` saves to the server first and changes local state only on
    success. Onboarding and the bio editor show an error toast if the save
    fails.
  - The `sessionStorage` copy is removed.
  - The display name stays on `profiles`.

## Consequences

- Migration 0013 must be run before the new code can save. Until then, saving
  shows an error rather than silently losing data, and applicant rows show
  "No tester profile yet".
- Answers saved only in `sessionStorage` before this change aren't migrated.
  Testers re-enter them once.
- "Profile complete" is now real, so the tester dashboard's onboarding banner
  appears for testers who haven't finished.
