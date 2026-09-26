-- Finding content protection (migration 0011). Runs after 10/20 in the same
-- database: aa = tester accepted on Acme's test e1, c1 = Acme company,
-- c2 = Other company, dd = another tester, ad = admin.

set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000aa';
insert into public.findings (id, test_id, tester_id, title, description, severity) values
  ('00000000-0000-0000-0000-0000000000f2', '00000000-0000-0000-0000-0000000000e1',
   '00000000-0000-0000-0000-0000000000aa', 'Crash on save', 'Tap save twice', 'critical');

-- ---------------------------------------- company cannot rewrite content
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c1';
select tests.expect_error($$update public.findings set title = 'Minor glitch'
  where id = '00000000-0000-0000-0000-0000000000f2'$$, 'not change what the tester reported',
  '0011: company cannot change a finding title');
select tests.expect_error($$update public.findings set description = 'n/a'
  where id = '00000000-0000-0000-0000-0000000000f2'$$, 'not change what the tester reported',
  '0011: company cannot change a finding description');
select tests.expect_error($$update public.findings set severity = 'low'
  where id = '00000000-0000-0000-0000-0000000000f2'$$, 'not change what the tester reported',
  '0011: company cannot downgrade severity');
select tests.expect_error($$update public.findings set tester_id = '00000000-0000-0000-0000-0000000000dd'
  where id = '00000000-0000-0000-0000-0000000000f2'$$, 'not change what the tester reported',
  '0011: company cannot reassign a finding to another tester');
select tests.expect_error($$update public.findings set submitted_at = '2000-01-01'
  where id = '00000000-0000-0000-0000-0000000000f2'$$, 'not change what the tester reported',
  '0011: company cannot backdate a finding');

-- ------------------------------------- company triage still works + stamping
update public.findings
  set status = 'more_info', review_reason = 'Which device?',
      reviewed_by = '00000000-0000-0000-0000-0000000000aa', reviewed_at = '2000-01-01'
  where id = '00000000-0000-0000-0000-0000000000f2';
select tests.check((select status = 'more_info' and reviewed_by = auth.uid() and reviewed_at > now() - interval '1 minute'
  from public.findings where id = '00000000-0000-0000-0000-0000000000f2'),
  '0011: company can triage, and reviewer/time are stamped by the server');
select tests.expect_error($$update public.findings set status = 'open'
  where id = '00000000-0000-0000-0000-0000000000f2'$$, 'only be accepted, rejected',
  '0011: company status changes are limited to triage decisions');

-- tester reply (0007 RPC) still works under the new trigger
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000aa';
select public.respond_to_finding('00000000-0000-0000-0000-0000000000f2', 'Pixel 8, Android 15');
select tests.check((select status = 'open' and tester_response = 'Pixel 8, Android 15'
  from public.findings where id = '00000000-0000-0000-0000-0000000000f2'),
  '0011: tester reply still reopens the finding');

set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c1';
update public.findings set status = 'accepted', review_reason = null where id = '00000000-0000-0000-0000-0000000000f2';
select tests.check((select status = 'accepted' from public.findings where id = '00000000-0000-0000-0000-0000000000f2'),
  '0011: company can accept after the reply');

-- ------------------------------------- others cannot touch it at all
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c2';
update public.findings set status = 'rejected', review_reason = 'x' where id = '00000000-0000-0000-0000-0000000000f2';
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000aa';
update public.findings set severity = 'low', status = 'accepted' where id = '00000000-0000-0000-0000-0000000000f2';
reset role;
select tests.check((select status = 'accepted' and severity = 'critical' and title = 'Crash on save'
  from public.findings where id = '00000000-0000-0000-0000-0000000000f2'),
  '0011: other company and the tester cannot update the finding directly');

-- ------------------------------------- admin can still correct content
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000ad';
update public.findings set severity = 'high' where id = '00000000-0000-0000-0000-0000000000f2';
select tests.check((select severity = 'high' from public.findings where id = '00000000-0000-0000-0000-0000000000f2'),
  '0011: admin can correct a finding');
reset role;

\echo 'All finding checks passed.'
