-- Extends the view-tracking from 0016 to listings, and rolls listing
-- views up into the owning profile's ranking so a profile whose
-- listings get a lot of traffic becomes more visible on the map even if
-- its own profile page isn't visited as often.
--
-- Same pattern as profile_views: deduped per (listing, viewer
-- fingerprint) within 24h, all access through a security-definer
-- function, no public policies on the table itself.

create table listing_views (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  viewer_key text not null,
  viewed_at timestamptz not null default now()
);

create index listing_views_dedup_idx on listing_views (listing_id, viewer_key, viewed_at desc);

alter table listings add column view_count integer not null default 0;
create index listings_view_count_idx on listings (view_count desc);

-- Denormalized total of all of a profile's listing views, kept in sync
-- by log_listing_view() below, so the map's popularity sort doesn't need
-- to aggregate across listings on every request.
alter table profiles add column listing_view_count integer not null default 0;

alter table listing_views enable row level security;

create policy "listing_views_select_admin" on listing_views
  for select using (is_admin(auth.uid()));

create or replace function log_listing_view(p_listing_id uuid, p_viewer_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
begin
  if exists (
    select 1 from listing_views
    where listing_id = p_listing_id
      and viewer_key = p_viewer_key
      and viewed_at > now() - interval '24 hours'
  ) then
    return;
  end if;

  insert into listing_views (listing_id, viewer_key) values (p_listing_id, p_viewer_key);
  update listings set view_count = view_count + 1 where id = p_listing_id;

  select profile_id into v_profile_id from listings where id = p_listing_id;
  if v_profile_id is not null then
    update profiles set listing_view_count = listing_view_count + 1 where id = v_profile_id;
  end if;
end;
$$;

grant execute on function log_listing_view(uuid, text) to anon, authenticated;
