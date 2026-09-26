-- 0006 — Tester NDA acceptance (click-through) for NDA-required tests.
--
-- tests.nda (0002) marks a test as NDA-required. Until now nothing asked the
-- tester to agree to anything. From this migration on, an application to an
-- NDA-required test must carry the version of the tester confidentiality
-- agreement the tester accepted (src/content/testerNda.js). The acceptance
-- time is stamped by the server, and neither field can change afterwards.
--
-- Enforced by a trigger rather than RLS so the existing insert/update
-- policies stay untouched: the trigger runs for every role, including a
-- tester calling PostgREST directly.
--
-- Safe to re-run.

alter table public.applications
  add column if not exists nda_version text,
  add column if not exists nda_accepted_at timestamptz;

alter table public.applications
  drop constraint if exists applications_nda_version_length;
alter table public.applications
  add constraint applications_nda_version_length
  check (nda_version is null or char_length(nda_version) between 1 and 64);

-- SECURITY DEFINER so the tests.nda lookup isn't hidden by the caller's RLS
-- (a tester can't read draft tests, which would otherwise skip the check).
create or replace function public.enforce_application_nda()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  requires_nda boolean;
begin
  if tg_op = 'INSERT' then
    select t.nda into requires_nda from public.tests t where t.id = new.test_id;

    if coalesce(requires_nda, false) and new.nda_version is null then
      raise exception 'This test requires accepting the tester NDA before applying.'
        using errcode = 'check_violation';
    end if;

    new.nda_accepted_at := case when new.nda_version is null then null else now() end;
    return new;
  end if;

  -- UPDATE: the acceptance record is append-only.
  new.nda_version := old.nda_version;
  new.nda_accepted_at := old.nda_accepted_at;
  return new;
end;
$$;

drop trigger if exists applications_enforce_nda on public.applications;
create trigger applications_enforce_nda
  before insert or update on public.applications
  for each row execute function public.enforce_application_nda();

notify pgrst, 'reload schema';
