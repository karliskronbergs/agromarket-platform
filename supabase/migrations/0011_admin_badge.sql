-- Public "this profile belongs to an admin" flag, separate from the
-- `admins` table (which stays private -- its RLS only lets a user see
-- their own row, so it can't be queried publicly to render a badge).
-- Reuses the existing profile-column-protection trigger so only an
-- admin can ever set this on a row, same as verified/status.

alter table profiles add column if not exists admin_badge boolean not null default false;

create or replace function protect_profile_admin_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin(auth.uid()) then
    new.verified := old.verified;
    new.status := old.status;
    new.admin_badge := old.admin_badge;
  end if;
  return new;
end;
$$;
