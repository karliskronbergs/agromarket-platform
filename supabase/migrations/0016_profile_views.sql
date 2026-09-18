-- Accurate profile view tracking for sorting the map sidebar by
-- popularity. Views are deduped per (profile, viewer fingerprint) within
-- a 24h window so refreshes/repeat visits don't inflate the count, and a
-- denormalized profiles.view_count is kept in sync so sorting the map
-- list doesn't require a count() over profile_views on every request.
--
-- All reads/writes go through log_profile_view() (security definer), so
-- profile_views itself has no public policies -- the app never touches
-- the table directly, only calls the function.

create table profile_views (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  viewer_key text not null,
  viewed_at timestamptz not null default now()
);

create index profile_views_dedup_idx on profile_views (profile_id, viewer_key, viewed_at desc);

alter table profiles add column view_count integer not null default 0;
create index profiles_view_count_idx on profiles (view_count desc);

alter table profile_views enable row level security;

create policy "profile_views_select_admin" on profile_views
  for select using (is_admin(auth.uid()));

create or replace function log_profile_view(p_profile_id uuid, p_viewer_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from profile_views
    where profile_id = p_profile_id
      and viewer_key = p_viewer_key
      and viewed_at > now() - interval '24 hours'
  ) then
    return;
  end if;

  insert into profile_views (profile_id, viewer_key) values (p_profile_id, p_viewer_key);
  update profiles set view_count = view_count + 1 where id = p_profile_id;
end;
$$;

grant execute on function log_profile_view(uuid, text) to anon, authenticated;
