-- service_role bypasses RLS (BYPASSRLS on the role), but bypassing RLS
-- does not grant table access by itself -- Postgres still checks normal
-- GRANTs first. 0002_grants.sql only ever granted anon/authenticated, so
-- service_role (meant for backend admin tasks, per .env.local.example)
-- has had no actual access to any table created since. This grants it
-- fully, on current tables and on anything created later.

grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public
  grant usage, select on sequences to service_role;
alter default privileges in schema public
  grant execute on functions to service_role;
