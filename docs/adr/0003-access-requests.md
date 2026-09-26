# ADR 0003: Public access requests instead of self-serve sign-up (UX-03)

- Status: Accepted
- Date: 2026-09-26

## Context

Every sign-up call to action on the public site ("Start Free", "Join as
Tester", "Talk to Sales", pricing buttons) went to `/login`, which can't create
an account. Nyvel is in private beta. Accounts are created by an admin, and
roles and companies are admin-assigned (and since 0008 can't be self-assigned).
There is no email provider yet (C-07).

## Decision

- A public `/request-access` page (`?type=tester` for testers) writes to a new
  `access_requests` table. It's reachable without the site password gate.
- **Write-only for visitors.** RLS: anyone (anon or signed in) may INSERT a row
  with `status = 'new'` and no review fields. Only admins may SELECT or
  UPDATE. The client inserts without `.select()`, so nothing is read back.
- **Abuse limits, in the database rather than the UI:**
  - CHECK constraints on every field's length, plus a basic email format;
  - a company request requires a company name;
  - a global throttle of 50 new requests per 10 minutes;
  - email is lower-cased and the name trimmed on insert.

  The UI adds a honeypot field and validation that mirrors the constraints.
- **Admin review** at `/admin/requests`: status (new / contacted / approved
  / declined) plus an internal note, with the reviewer and time
  server-stamped. The visitor's submitted fields can't be edited.
- **Approving doesn't create an account.** The admin invites the person from
  Supabase Auth and sets their role, as today. The page says so.

## Consequences

- No confirmation or notification email is sent until C-07 is unblocked. The
  success screen and admin page say this plainly.
- The global throttle can reject genuine requests during a flood. That's
  acceptable at private-beta volumes. Per-IP limiting would need an Edge
  Function or captcha.
- Personal data (name, email, optional country, devices) is stored. Privacy
  Policy text remains an Eben-owned item.
