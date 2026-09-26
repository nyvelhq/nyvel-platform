# ADR 0001: Click-through tester NDA for NDA-required tests

- Status: Accepted (NDA text is a draft pending legal review)
- Date: 2026-09-26

## Context

`tests.nda` (migration 0002) let a company mark a test as NDA-required, but
testers were never shown or asked to accept anything. The marketing site
claimed "every tester signs an NDA". PR #22 first removed that claim; Eben then
asked for a real NDA step, with the text to be finalised later.

## Decision

1. **Click-through acceptance at apply time.** For an NDA-required test the
   tester sees the agreement in a modal and must tick "I have read and agree"
   before "Accept & Apply" enables. Acceptance and application are one action,
   so there is no accepted-but-not-applied state to manage.
2. **Record on the application row.** `applications.nda_version` (the version
   the tester accepted) and `applications.nda_accepted_at`. No new table: an
   acceptance only exists in the context of one application, and the row
   already has the tester, test and RLS.
3. **Enforce in the database, not just the UI** (migration 0006). A
   `before insert or update` trigger on `applications`:
   - rejects an insert for an NDA-required test with no `nda_version`;
   - sets `nda_accepted_at` from the server clock, ignoring any client value;
   - makes both fields immutable on update, so a company accepting or
     declining an applicant can't alter the record.
   It is `security definer` so the `tests.nda` lookup can't be skipped by RLS
   hiding the test from the tester (e.g. a draft test).
   A trigger was chosen over changing the RLS insert policy so existing
   policies stay untouched and the rule applies to every role.
4. **Text lives in code, versioned.** `src/content/testerNda.js` holds the
   title, sections and `version`. Editing the text means bumping `version`, so
   every stored acceptance maps to the exact wording shown.

## Consequences

- The migration must be applied before this frontend ships. Otherwise the insert
  carrying `nda_version` fails and testers can't apply to NDA-required tests.
  Every test defaults to `nda = true`, so that would block almost every
  application. Reads use `select('*')` so pages still load either way.
- Applications made before 0006 have no acceptance record and show
  "No NDA on record" to the company.
- Earlier text versions are not stored server-side, only their version
  strings. Keep old versions in git history, or add a `nda_versions` table if
  counsel needs the full text of each version retrievable from the DB.
- The agreement is unreviewed draft text. It should be reviewed by counsel,
  including a governing-law clause, before anyone relies on it.
