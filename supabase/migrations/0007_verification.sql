-- Verification requests: a profile owner can ask to be verified; only an
-- admin can actually grant it. RLS alone doesn't stop an owner from writing
-- `verified` directly on their own row (it only checks row ownership, not
-- which columns changed), so a trigger locks those columns down for real.

alter table profiles add column if not exists verification_requested_at timestamptz;

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
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_admin_columns on profiles;
create trigger profiles_protect_admin_columns
  before update on profiles
  for each row execute function protect_profile_admin_columns();
