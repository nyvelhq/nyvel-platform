-- Access-rule regression tests for schema.sql + supabase/migrations/*.
-- Every check raises (and fails CI) if a rule stops holding.
-- Run by scripts/test-db.sh after all migrations are applied.

-- ---------------------------------------------------------------- seed
-- A = accepted tester (NDA accepted), B = tester who never applied,
-- L = legacy accepted tester with no NDA record, C1/C2 = companies, AD = admin.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000aa', 'a@test.io'),
  ('00000000-0000-0000-0000-0000000000bb', 'b@test.io'),
  ('00000000-0000-0000-0000-0000000000dd', 'legacy@test.io'),
  ('00000000-0000-0000-0000-0000000000c1', 'c1@test.io'),
  ('00000000-0000-0000-0000-0000000000c2', 'c2@test.io'),
  ('00000000-0000-0000-0000-0000000000ad', 'admin@test.io');
insert into public.clients (id, company_name) values
  ('00000000-0000-0000-0000-00000000c011', 'Acme'),
  ('00000000-0000-0000-0000-00000000c022', 'Other');
update public.profiles set role = 'company', client_id = '00000000-0000-0000-0000-00000000c011'
  where id = '00000000-0000-0000-0000-0000000000c1';
update public.profiles set role = 'company', client_id = '00000000-0000-0000-0000-00000000c022'
  where id = '00000000-0000-0000-0000-0000000000c2';
update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-0000000000ad';

select tests.check((select role from public.profiles where id = '00000000-0000-0000-0000-0000000000aa') = 'tester',
  'signup trigger creates a tester profile');

set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c1';
insert into public.tests (id, client_id, title, status, nda, created_by, briefing) values
  ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-00000000c011', 'NDA test', 'open', true,
   '00000000-0000-0000-0000-0000000000c1', 'staging: https://secret.example'),
  ('00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-00000000c011', 'Open test', 'open', false,
   '00000000-0000-0000-0000-0000000000c1', null),
  ('00000000-0000-0000-0000-0000000000e3', '00000000-0000-0000-0000-00000000c011', 'Draft', 'draft', true,
   '00000000-0000-0000-0000-0000000000c1', null);
reset role;

-- --------------------------------------------------- 0007: briefings
select tests.check((select briefing from public.tests where id = '00000000-0000-0000-0000-0000000000e1') is null,
  '0007: tests.briefing column is cleared on insert');
select tests.check((select briefing from public.test_briefings where test_id = '00000000-0000-0000-0000-0000000000e1')
  = 'staging: https://secret.example', '0007: briefing moved to test_briefings');

-- --------------------------------------------------- 0006: NDA on apply
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000aa';
select tests.expect_error($$insert into public.applications (test_id, tester_id)
  values ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000aa')$$,
  'requires accepting the tester NDA', '0006: NDA test rejects apply without NDA');
select tests.expect_error($$insert into public.applications (test_id, tester_id)
  values ('00000000-0000-0000-0000-0000000000e3', '00000000-0000-0000-0000-0000000000aa')$$,
  'requires accepting the tester NDA', '0006: hidden draft NDA test still enforced');
insert into public.applications (test_id, tester_id, nda_version, nda_accepted_at)
  values ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000aa', 'v1-test', '2000-01-01');
select tests.check((select nda_accepted_at > now() - interval '1 minute' from public.applications
  where test_id = '00000000-0000-0000-0000-0000000000e1' and tester_id = auth.uid()),
  '0006: acceptance time is set by the server, not the client');
insert into public.applications (test_id, tester_id)
  values ('00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-0000000000aa');
select tests.check((select nda_accepted_at is null from public.applications
  where test_id = '00000000-0000-0000-0000-0000000000e2' and tester_id = auth.uid()),
  '0006: non-NDA test applies without NDA');
reset role;

-- company accepts A; legacy L accepted without an NDA record (bypassing 0006, as old rows would)
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c1';
update public.applications set status = 'accepted', nda_version = 'forged', nda_accepted_at = '2000-01-01'
  where test_id = '00000000-0000-0000-0000-0000000000e1';
select tests.check((select nda_version = 'v1-test' and nda_accepted_at > now() - interval '1 minute'
  from public.applications where test_id = '00000000-0000-0000-0000-0000000000e1'),
  '0006: company cannot rewrite the NDA record');
reset role;
alter table public.applications disable trigger applications_enforce_nda;
insert into public.applications (test_id, tester_id, status) values
  ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000dd', 'accepted');
alter table public.applications enable trigger applications_enforce_nda;

-- --------------------------------------------- 0007: who sees briefings
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000aa';
select tests.check((select count(*) from public.test_briefings) = 1, '0007: accepted tester with NDA sees briefing');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000bb';
select tests.check((select count(*) from public.test_briefings) = 0, '0007: tester who never applied sees no briefing');
select tests.check((select count(*) from public.tests where briefing is not null) = 0, '0007: no briefing via tests table');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000dd';
select tests.check((select count(*) from public.test_briefings) = 0, '0007: legacy applicant without NDA sees no briefing');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c2';
select tests.check((select count(*) from public.test_briefings) = 0, '0007: other company sees no briefing');
reset role;
set role anon;
select tests.expect_error('select * from public.test_briefings', 'permission denied', '0007: anon cannot read briefings');
reset role;

-- ------------------------------------------ 0007: test status + findings
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000aa';
select tests.expect_error($$select public.set_test_status('00000000-0000-0000-0000-0000000000e1', 'complete')$$,
  'own tests', '0007: tester cannot change test status');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c2';
select tests.expect_error($$select public.set_test_status('00000000-0000-0000-0000-0000000000e1', 'complete')$$,
  'own tests', '0007: other company cannot change test status');
reset role;
set role anon;
reset request.jwt.claim.sub;
select tests.expect_error($$select public.set_test_status('00000000-0000-0000-0000-0000000000e1', 'complete')$$,
  'own tests|permission denied', '0009: anon cannot change test status');
reset role;

-- a signed-in user whose profile row is missing (role unknown)
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000ff', 'noprofile@test.io');
delete from public.profiles where id = '00000000-0000-0000-0000-0000000000ff';
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000ff';
select tests.expect_error($$select public.set_test_status('00000000-0000-0000-0000-0000000000e1', 'complete')$$,
  'own tests', '0009: user without a profile cannot change test status');
select tests.check(public.is_admin() = false, '0009: is_admin() is false, not null, without a profile');
reset role;
select tests.check((select status from public.tests where id = '00000000-0000-0000-0000-0000000000e1') = 'open',
  '0009: test status unchanged by unauthorised callers');

set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000aa';
insert into public.findings (id, test_id, tester_id, title, description, severity) values
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-0000000000e1',
   '00000000-0000-0000-0000-0000000000aa', 'Bug', 'Steps', 'high');
select tests.expect_error($$select public.respond_to_finding('00000000-0000-0000-0000-0000000000f1', 'hi')$$,
  'More info needed', '0007: cannot reply while finding is open');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c1';
update public.findings set status = 'more_info', review_reason = 'Which build?'
  where id = '00000000-0000-0000-0000-0000000000f1';
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000bb';
select tests.expect_error($$select public.respond_to_finding('00000000-0000-0000-0000-0000000000f1', 'not mine')$$,
  'More info needed', '0007: another tester cannot reply');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000aa';
select tests.expect_error($$select public.respond_to_finding('00000000-0000-0000-0000-0000000000f1', '   ')$$,
  'cannot be empty', '0007: blank reply rejected');
select public.respond_to_finding('00000000-0000-0000-0000-0000000000f1', 'Build 1.4.2');
select tests.check((select status = 'open' and tester_response = 'Build 1.4.2' from public.findings
  where id = '00000000-0000-0000-0000-0000000000f1'), '0007: reply stored and finding reopened');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c1';
update public.findings set status = 'accepted', review_reason = null, tester_response = 'edited'
  where id = '00000000-0000-0000-0000-0000000000f1';
select tests.check((select status = 'accepted' and tester_response = 'Build 1.4.2' from public.findings
  where id = '00000000-0000-0000-0000-0000000000f1'), '0007: company cannot edit the tester reply');

select public.set_test_status('00000000-0000-0000-0000-0000000000e1', 'complete');
select tests.expect_error($$select public.set_test_status('00000000-0000-0000-0000-0000000000e1', 'complete')$$,
  'cannot be changed', '0007: invalid status transition rejected');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000aa';
select tests.expect_error($$insert into public.findings (test_id, tester_id, title, description, severity)
  values ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000aa', 'Late', 'x', 'low')$$,
  'no longer accepts findings', '0007: no findings on a completed test');
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c1';
select public.set_test_status('00000000-0000-0000-0000-0000000000e1', 'open');
reset role;

-- ------------------------------------------ 0008: profile privileges
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000bb';
select tests.expect_error($$update public.profiles set client_id = '00000000-0000-0000-0000-00000000c011'
  where id = auth.uid()$$, 'Only an admin', '0008: tester cannot attach themselves to a company');
select tests.check((select count(*) from public.tests where status = 'draft') = 0,
  '0008: tester still cannot see company drafts');
select tests.expect_error($$update public.profiles set role = 'admin' where id = auth.uid()$$,
  'Only an admin|row-level security', '0008: tester cannot make themselves admin');
select tests.expect_error($$update public.profiles set email = 'spoof@acme.io' where id = auth.uid()$$,
  'Only an admin', '0008: tester cannot change their email');
update public.profiles set name = 'New Name' where id = auth.uid();
select tests.check((select name from public.profiles where id = auth.uid()) = 'New Name',
  '0008: tester can still change their name');

set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000ad';
update public.profiles set role = 'company', client_id = '00000000-0000-0000-0000-00000000c022'
  where id = '00000000-0000-0000-0000-0000000000bb';
select tests.check((select role = 'company' from public.profiles where id = '00000000-0000-0000-0000-0000000000bb'),
  '0008: admin can still assign roles');
reset role;

insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000ee', 'orphan@test.io');
delete from public.profiles where id = '00000000-0000-0000-0000-0000000000ee';
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000ee';
select tests.expect_error($$insert into public.profiles (id, email, role)
  values ('00000000-0000-0000-0000-0000000000ee', 'orphan@test.io', 'admin')$$,
  'row-level security', '0008: self-insert cannot choose admin');
select tests.expect_error($$insert into public.profiles (id, email, client_id)
  values ('00000000-0000-0000-0000-0000000000ee', 'orphan@test.io', '00000000-0000-0000-0000-00000000c011')$$,
  'row-level security', '0008: self-insert cannot choose a company');
insert into public.profiles (id, email) values ('00000000-0000-0000-0000-0000000000ee', 'orphan@test.io');
reset role;

\echo 'All access-rule checks passed.'
