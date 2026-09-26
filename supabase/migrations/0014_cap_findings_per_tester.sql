-- 0014 — SEC-04: cap how many untriaged findings one tester can pile up on
-- one test.
--
-- STRIDE D3 (docs/security/STRIDE_THREAT_MODEL.md): there was no limit on
-- how many findings an accepted tester could submit for a test. One tester
-- could flood a company's triage queue with hundreds of rows, burying real
-- findings and making triage unusable — a denial-of-service against the
-- company, not against the database.
--
-- The queue is what "open" and "more_info" findings represent: open ones are
-- waiting for a first look, more_info ones are waiting on the tester's reply
-- before the company can decide. Accepted/rejected findings are already
-- triaged and don't count. Once the company works the queue down (or the
-- tester replies and it's re-triaged), the tester can submit again — this
-- limits standing queue depth, not lifetime findings on a test.
--
-- Safe to re-run.

create or replace function public.cap_findings_per_tester()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  untriaged_count integer;
  max_untriaged constant integer := 20;
begin
  select count(*) into untriaged_count
  from public.findings
  where test_id = new.test_id
    and tester_id = new.tester_id
    and status in ('open', 'more_info');

  if untriaged_count >= max_untriaged then
    raise exception
      'You already have % findings awaiting triage on this test. Wait for the company to review some before submitting more.',
      max_untriaged
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists findings_cap_per_tester on public.findings;
create trigger findings_cap_per_tester
  before insert on public.findings
  for each row execute function public.cap_findings_per_tester();

notify pgrst, 'reload schema';
