-- "Real-time price updates" (IZSOLE.md): price and leading/outbid status
-- already update live for everyone, since bids' INSERT realtime has no RLS
-- restriction. Bidder *count* doesn't: lot_max_bids' RLS only lets a
-- bidder see their own row, and Supabase Realtime enforces that same RLS
-- per subscriber when deciding who receives a postgres_changes event. So
-- a lot_max_bids INSERT today only reaches the bidder's own tab (and
-- admins) -- every other viewer's "N solitaji" count silently goes stale
-- until they reload.
--
-- Fix: maintain the count in its own small table that's plainly public
-- (no amounts, just a number), and broadcast realtime from *that* table
-- instead of lot_max_bids directly.

create table lot_bidder_counts (
  lot_id uuid primary key references lots (id) on delete cascade,
  bidder_count int not null default 0
);

alter table lot_bidder_counts enable row level security;

create policy "lot_bidder_counts_select_all" on lot_bidder_counts
  for select using (true);

grant select on lot_bidder_counts to anon, authenticated;

create or replace function sync_lot_bidder_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into lot_bidder_counts (lot_id, bidder_count)
  select new.lot_id, count(distinct bidder_user_id)
  from lot_max_bids
  where lot_id = new.lot_id
  on conflict (lot_id) do update set bidder_count = excluded.bidder_count;
  return new;
end;
$$;

create trigger lot_max_bids_sync_count
after insert on lot_max_bids
for each row execute function sync_lot_bidder_count();

-- Backfill for lots that already have bids placed before this migration.
insert into lot_bidder_counts (lot_id, bidder_count)
select lot_id, count(distinct bidder_user_id)
from lot_max_bids
group by lot_id
on conflict (lot_id) do update set bidder_count = excluded.bidder_count;

alter publication supabase_realtime add table lot_bidder_counts;
