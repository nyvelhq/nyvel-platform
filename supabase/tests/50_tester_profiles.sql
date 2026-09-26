-- Tester profiles (migration 0013). Reuses users from 10: aa = tester who
-- applied to test e1, ee = tester who never applied, c1 = e1's company,
-- c2 = another company, ad = admin.

-- ------------------------------------------------ testers write their own
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000aa';
insert into public.tester_profiles (user_id, country, city, skills, devices, bio, linkedin, completed_at)
  values ('00000000-0000-0000-0000-0000000000aa', 'Ghana', 'Accra', '{Mobile Testing,Fintech}', '{iPhone}',
          'Five years of QA', 'https://linkedin.com/in/a', '2000-01-01');
select tests.check((select completed_at > now() - interval '1 minute' from public.tester_profiles
  where user_id = auth.uid()), '0013: completion time is set by the server, not the client');
select tests.expect_error($$insert into public.tester_profiles (user_id)
  values ('00000000-0000-0000-0000-0000000000ee')$$, 'row-level security', '0013: tester cannot create another tester''s profile');
select tests.expect_error($$update public.tester_profiles set linkedin = 'javascript:alert(1)' where user_id = auth.uid()$$,
  'check constraint', '0013: non-http LinkedIn link rejected');
select tests.expect_error($$update public.tester_profiles set bio = repeat('a', 2001) where user_id = auth.uid()$$,
  'check constraint', '0013: over-long bio rejected');
select tests.expect_error($$update public.tester_profiles set skills = array(select 's' || g from generate_series(1, 21) g)
  where user_id = auth.uid()$$, 'check constraint', '0013: more than 20 skills rejected');
select tests.expect_error($$update public.tester_profiles set user_id = '00000000-0000-0000-0000-0000000000ee'
  where user_id = auth.uid()$$, 'row-level security|another user', '0013: profile cannot be moved to another user');

update public.tester_profiles set completed_at = now() + interval '1 day', bio = 'Six years of QA'
  where user_id = auth.uid();
select tests.check((select completed_at < now() + interval '1 minute' and bio = 'Six years of QA'
  from public.tester_profiles where user_id = auth.uid()), '0013: edits keep the first completion time');

set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000ee';
insert into public.tester_profiles (user_id, skills) values ('00000000-0000-0000-0000-0000000000ee', '{Web Testing}');
select tests.check((select count(*) = 1 from public.tester_profiles), '0013: testers only see their own profile');
update public.tester_profiles set bio = 'hijacked' where user_id = '00000000-0000-0000-0000-0000000000aa';
select tests.expect_error($$select * from public.applicant_profiles('00000000-0000-0000-0000-0000000000e1')$$,
  'own tests', '0013: tester cannot list a test''s applicant profiles');
reset role;
select tests.check((select bio = 'Six years of QA' from public.tester_profiles
  where user_id = '00000000-0000-0000-0000-0000000000aa'), '0013: tester cannot edit another tester''s profile');

-- ------------------------------------------------ companies
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c1';
select tests.check((select count(*) = 0 from public.tester_profiles), '0013: company cannot read profile rows directly');
select tests.expect_error($$insert into public.tester_profiles (user_id) values ('00000000-0000-0000-0000-0000000000c1')$$,
  'row-level security', '0013: company user cannot create a tester profile');
select tests.check((select count(*) = 1 and bool_and(tester_id = '00000000-0000-0000-0000-0000000000aa'
  and skills = '{Mobile Testing,Fintech}' and country = 'Ghana')
  from public.applicant_profiles('00000000-0000-0000-0000-0000000000e1')),
  '0013: company sees its applicants'' work profile, not non-applicants');

set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000c2';
select tests.expect_error($$select * from public.applicant_profiles('00000000-0000-0000-0000-0000000000e1')$$,
  'own tests', '0013: other company cannot list the applicant profiles');
reset role;

-- ------------------------------------------------ anon and admin
set role anon;
reset request.jwt.claim.sub;
select tests.expect_error('select * from public.tester_profiles', 'permission denied', '0013: anon cannot read profiles');
select tests.expect_error($$select * from public.applicant_profiles('00000000-0000-0000-0000-0000000000e1')$$,
  'permission denied', '0013: anon cannot call applicant_profiles');
reset role;

set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000ad';
select tests.check((select count(*) = 2 from public.tester_profiles), '0013: admin reads every profile');
select tests.check((select count(*) = 1 from public.applicant_profiles('00000000-0000-0000-0000-0000000000e1')),
  '0013: admin can list any test''s applicant profiles');
reset role;

\echo 'All tester-profile checks passed.'
