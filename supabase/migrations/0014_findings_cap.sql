-- 0014 — SEC-04: cap findings per tester per test (STRIDE D3).
--
-- There was no limit on how many findings one tester could file against a
-- test, or on how long a title or description could be, so one accepted
-- tester could flood a company's triage queue. For callers with a user JWT
-- this trigger:
--   - allows at most 25 findings per tester per test (all statuses count);
--   - limits the title to 200 characters and the description to 5,000.
-- Admins and calls without a user JWT (SQL editor, service role) are exempt,
-- so an admin can still import or correct findings.
--
-- To change the cap, edit `max_findings` below and re-run this file.
-- Safe to re-run.

create or replace function public.limit_findings()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  max_findings constant int := 25;
  existing int;
begin
  if auth.uid() is null or coalesce(public.is_admin(), false) then
    return new;
  end if;

  if char_length(new.title) > 200 then
    raise exception 'Keep the finding title under 200 characters.' using errcode = 'check_violation';
  end if;
  if char_length(new.description) > 5000 then
    raise exception 'Keep the finding description under 5,000 characters.' using errcode = 'check_violation';
  end if;

  if tg_op = 'INSERT' then
    -- Serialise inserts for this tester + test so two at once can't both
    -- squeeze in under the cap.
    perform pg_advisory_xact_lock(hashtextextended(new.test_id::text || ':' || new.tester_id::text, 0));
    select count(*) into existing
      from public.findings
      where test_id = new.test_id and tester_id = new.tester_id;
    if existing >= max_findings then
      raise exception 'You''ve reached the limit of % findings for this test. Add details to an existing finding instead, or contact the company.', max_findings
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists findings_limit on public.findings;
create trigger findings_limit
  before insert or update of title, description on public.findings
  for each row execute function public.limit_findings();

notify pgrst, 'reload schema';
