-- Bugfix: these triggers were reverting protected-column changes made
-- directly in the SQL editor. auth.uid() is NULL there (no app session),
-- and the trigger treated "no user" the same as "not an admin" and
-- blocked the change. It should only block changes made by an
-- authenticated non-admin app user -- a raw SQL session already requires
-- full database credentials, a stronger trust boundary than app-level
-- admin checks.

create or replace function protect_profile_admin_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not is_admin(auth.uid()) then
    new.verified := old.verified;
    new.status := old.status;
    new.admin_badge := old.admin_badge;
  end if;
  return new;
end;
$$;

create or replace function protect_listing_status_column()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not is_admin(auth.uid()) then
    new.status := old.status;
  end if;
  return new;
end;
$$;
