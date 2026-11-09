-- Per-user watchlist (the ☆ button), deferred from the item-2/3/4 passes
-- until a page actually needed to read it back: "Manas izsoles" ->
-- "Vērotās lotes". Purely private to each bidder -- no public aggregate
-- (unlike lot_max_bids' bidder count), so plain RLS is enough here.

create table lot_watches (
  user_id uuid not null references auth.users (id) on delete cascade,
  lot_id uuid not null references lots (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, lot_id)
);

create index lot_watches_lot_id_idx on lot_watches (lot_id);

alter table lot_watches enable row level security;

create policy "lot_watches_select_own" on lot_watches
  for select using (auth.uid() = user_id);

create policy "lot_watches_insert_own" on lot_watches
  for insert with check (auth.uid() = user_id);

create policy "lot_watches_delete_own" on lot_watches
  for delete using (auth.uid() = user_id);

grant select, insert, delete on lot_watches to authenticated;
