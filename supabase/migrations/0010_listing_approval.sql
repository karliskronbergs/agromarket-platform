-- New listings require admin approval before going live.

alter type listing_status add value if not exists 'pending';

-- Same class of gap as profiles.verified/status: RLS lets an owner update
-- their own listing row, but that only checks row ownership, not which
-- column changed -- without this trigger a seller could PATCH their own
-- listing's status straight from pending to active via the API.
create or replace function protect_listing_status_column()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin(auth.uid()) then
    new.status := old.status;
  end if;
  return new;
end;
$$;

drop trigger if exists listings_protect_status on listings;
create trigger listings_protect_status
  before update on listings
  for each row execute function protect_listing_status_column();
