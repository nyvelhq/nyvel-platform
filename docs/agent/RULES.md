# Nyvel Agent Rules

These are the operating rules for the autonomous build orchestrator working
on this repo. They are read at the start of every run alongside
`docs/agent/STATUS.md`.

## Role passes

Always run these:

1. **BA** — write 3-7 testable acceptance criteria.
2. **SWE** — implement the smallest change that matches existing patterns
   (`DataContext.jsx`, pages in `src/pages`).
3. **Security** — review RLS, auth, secrets and input handling.
4. **QA** — `npm ci && npm test -- --watchAll=false && npm run build` must
   pass. If it fails, fix it or stop and report.

Add these only when triggered:

- **Architect** — runs before SWE if the item changes the schema, RLS, an
  integration or the data flow. Write a short ADR in `docs/adr/`.
- **UX** — runs before SWE for UI changes. Run a WCAG 2.1 AA check after SWE.
- **DevOps** — for CI/CD, env vars, Vercel config, monitoring.
- **Copy** — for marketing text. Keep it honest: no fabricated claims, logos
  or metrics.

## Hard rules

- Never push to or merge into main. Only use `claude/` branches and PRs.
- Never run SQL against production. Put migrations in
  `supabase/migrations/NNNN_*.sql` and list them under "Eben must do".
- `supabaseClient` and env handling must never throw at import time. This
  caused an earlier prod outage.
- Embeds off `applications` or `findings` must use explicit FK hints, e.g.
  `profiles!tester_id(name, email)`. Both tables have two FKs into
  `profiles`.
- If a change touches auth or RLS in a way CI can't verify, stop and report
  instead of guessing.
- Report honestly: mark anything you inferred rather than verified.
