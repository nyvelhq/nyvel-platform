-- Minimal stand-in for what a Supabase project provides before our schema
-- runs: the anon/authenticated roles, auth.users + auth.uid(), and
-- Supabase's default grants on new public tables. Lets CI apply schema.sql +
-- every migration to a plain Postgres and test RLS as real users.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
end $$;

create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key,
  email text,
  raw_user_meta_data jsonb default '{}'::jsonb
);
-- Supabase reads the caller's user id from the JWT; tests set it with
-- `set request.jwt.claim.sub = '<uuid>'`.
create or replace function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

grant usage on schema auth to anon, authenticated;
grant usage on schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on functions to anon, authenticated;

-- Test helpers, callable while `set role authenticated` is in effect.
create schema if not exists tests;
grant usage on schema tests to anon, authenticated;

-- Runs `stmt` as the current role and fails unless it errors with a message
-- matching `pattern` (case-insensitive regex).
create or replace function tests.expect_error(stmt text, pattern text, label text)
returns void language plpgsql as $$
begin
  begin
    execute stmt;
  exception when others then
    if sqlerrm !~* pattern then
      raise exception '[%] expected error matching "%", got: %', label, pattern, sqlerrm;
    end if;
    return;
  end;
  raise exception '[%] expected an error matching "%", but it succeeded: %', label, pattern, stmt;
end $$;

create or replace function tests.check(ok boolean, label text)
returns void language plpgsql as $$
begin
  if ok is not true then
    raise exception '[%] assertion failed', label;
  end if;
end $$;

grant execute on all functions in schema tests to anon, authenticated;
