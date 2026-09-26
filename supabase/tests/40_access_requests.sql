-- Access requests (migration 0012). Reuses users from 10: aa = tester,
-- c1 = company, ad = admin.

-- ------------------------------------------------ anonymous visitors
set role anon;
reset request.jwt.claim.sub;
insert into public.access_requests (kind, name, email, company_name, message)
  values ('company', '  Dana  ', '  Dana@Acme.IO ', 'Acme', 'Beta for our iOS app');
insert into public.access_requests (kind, name, email, country, devices)
  values ('tester', 'Kofi', 'kofi@example.com', 'Ghana', 'Pixel 7, iPad');
select tests.expect_error('select * from public.access_requests', 'permission denied',
  '0012: anon cannot read requests');
select tests.expect_error($$insert into public.access_requests (kind, name, email, company_name, status)
  values ('company', 'X', 'x@y.io', 'X Co', 'approved')$$, 'row-level security',
  '0012: anon cannot submit a pre-approved request');
select tests.expect_error($$insert into public.access_requests (kind, name, email) values ('tester', 'X', 'not-an-email')$$,
  'check constraint', '0012: invalid email rejected');
select tests.expect_error($$insert into public.access_requests (kind, name, email) values ('company', 'X', 'x@y.io')$$,
  'company_request_needs_company', '0012: company request needs a company name');
select tests.expect_error($$insert into public.access_requests (kind, name, email, message)
  values ('tester', 'X', 'x@y.io', repeat('a', 2001))$$, 'check constraint', '0012: over-long message rejected');
select tests.expect_error($$update public.access_requests set status = 'approved'$$, 'permission denied',
  '0012: anon cannot update requests');
reset role;

select tests.check((select email = 'dana@acme.io' and name = 'Dana' from public.access_requests where kind = 'company'),
  '0012: email lower-cased and name trimmed on submit');

-- ------------------------------------------------ signed-in non-admins
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000aa';
select tests.check((select count(*) = 0 from public.access_requests), '0012: tester cannot read requests');
update public.access_requests set status = 'approved';
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c1';
select tests.check((select count(*) = 0 from public.access_requests), '0012: company cannot read requests');
reset role;
select tests.check((select count(*) = 0 from public.access_requests where status <> 'new'),
  '0012: non-admin updates change nothing');

-- ------------------------------------------------ admin review
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000ad';
select tests.check((select count(*) = 2 from public.access_requests), '0012: admin reads all requests');
update public.access_requests set status = 'contacted', admin_note = 'Emailed Dana'
  where kind = 'company';
select tests.check((select status = 'contacted' and reviewed_by = auth.uid() and reviewed_at > now() - interval '1 minute'
  from public.access_requests where kind = 'company'), '0012: admin review is stamped');
select tests.expect_error($$update public.access_requests set email = 'other@x.io' where kind = 'company'$$,
  'Only the status and note', '0012: admin cannot rewrite what the visitor submitted');
reset role;

-- ------------------------------------------------ throttle
set role anon;
do $$
begin
  for i in 1..48 loop
    insert into public.access_requests (kind, name, email) values ('tester', 'Bot', 'bot' || i || '@spam.io');
  end loop;
end $$;
select tests.expect_error($$insert into public.access_requests (kind, name, email) values ('tester', 'Bot', 'bot51@spam.io')$$,
  'a lot of requests', '0012: more than 50 requests in 10 minutes are throttled');
reset role;

\echo 'All access-request checks passed.'
