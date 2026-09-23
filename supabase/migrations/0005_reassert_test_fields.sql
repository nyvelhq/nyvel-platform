-- ============================================================================
-- Nyvel — Fix for the live "Could not find the 'age_range' column of 'tests'
-- in the schema cache" (400) error on New Test creation.
--
-- Root cause: CreateTest.jsx / DataContext.jsx's addCompanyTest() already
-- insert compensation/start_date/end_date/platforms/expertise/age_range/
-- countries/nda/briefing — that's correct and matches 0002_test_fields_
-- and_rls.sql, which adds exactly those columns. The code has been correct
-- since 0002 was merged (2026-09-02). The error means 0002's `alter table`
-- was never actually applied to the production database (or PostgREST's
-- schema cache never picked it up), not a code bug.
--
-- This migration is a safety net, not a new design: it re-runs 0002's
-- column additions (idempotent — IF NOT EXISTS, no-op if already applied)
-- and explicitly asks PostgREST to reload its schema cache, which covers
-- both possible causes in one step. Run this once in the Supabase SQL
-- editor. Safe to re-run.
-- ============================================================================

alter table public.tests
  add column if not exists compensation numeric(10,2) not null default 0,
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists platforms text[] not null default '{}',
  add column if not exists expertise text[] not null default '{}',
  add column if not exists age_range text,
  add column if not exists countries text,
  add column if not exists nda boolean not null default true,
  add column if not exists briefing text;

notify pgrst, 'reload schema';
