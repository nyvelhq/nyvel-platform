-- Findings cap (migration 0014). Reuses users from 10: aa and dd = testers
-- accepted on Acme's open test e1 (aa already has 2 findings there),
-- ad = admin.

set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000aa';

-- ----------------------------------------------------------- length limits
select tests.expect_error($$insert into public.findings (test_id, tester_id, title, description, severity)
  values ('00000000-0000-0000-0000-0000000000e1', auth.uid(), repeat('t', 201), 'd', 'low')$$,
  'under 200 characters', '0014: over-long title rejected');
select tests.expect_error($$insert into public.findings (test_id, tester_id, title, description, severity)
  values ('00000000-0000-0000-0000-0000000000e1', auth.uid(), 't', repeat('d', 5001), 'low')$$,
  'under 5,000 characters', '0014: over-long description rejected');

-- ------------------------------------------------------------------- cap
-- Fill up to exactly 25 (aa already has 2).
do $$
begin
  for i in 1..23 loop
    insert into public.findings (test_id, tester_id, title, description, severity)
      values ('00000000-0000-0000-0000-0000000000e1', auth.uid(), 'Bug ' || i, 'Steps', 'low');
  end loop;
end $$;
select tests.check((select count(*) = 25 from public.findings
  where test_id = '00000000-0000-0000-0000-0000000000e1' and tester_id = auth.uid()),
  '0014: a tester can file up to 25 findings on a test');
select tests.expect_error($$insert into public.findings (test_id, tester_id, title, description, severity)
  values ('00000000-0000-0000-0000-0000000000e1', auth.uid(), 'Bug 26', 'Steps', 'low')$$,
  'limit of 25 findings', '0014: the 26th finding is rejected');

-- The cap is per tester: another tester on the same test is unaffected.
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000dd';
insert into public.findings (test_id, tester_id, title, description, severity)
  values ('00000000-0000-0000-0000-0000000000e1', auth.uid(), 'First from dd', 'Steps', 'medium');
select tests.check((select count(*) = 1 from public.findings
  where test_id = '00000000-0000-0000-0000-0000000000e1' and tester_id = auth.uid()),
  '0014: cap is per tester, not per test');

-- --------------------------------------------------------- admin exempt
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000ad';
insert into public.findings (test_id, tester_id, title, description, severity)
  values ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000aa',
          'Imported by admin', repeat('d', 6000), 'low');
reset role;
select tests.check((select count(*) = 26 from public.findings
  where test_id = '00000000-0000-0000-0000-0000000000e1' and tester_id = '00000000-0000-0000-0000-0000000000aa'),
  '0014: admins can add past the cap and length limits');

\echo 'All findings-cap checks passed.'
