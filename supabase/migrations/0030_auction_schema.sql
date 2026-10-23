-- izsole.lauks24.lv data model: auctions (sale events) -> lots (items) -> bids.
-- Separate Next.js app, same Supabase project as the marketplace (shared
-- login decision), so this lives here where the migration history already
-- is. Reuses `categories` and `is_admin()` from the marketplace schema.
--
-- Proxy (max) bidding is split across two tables on purpose:
--   - lot_max_bids holds each bidder's private ceiling (never shown to
--     other bidders) -- what they told the system they're willing to pay.
--   - bids is the public, append-only log of the actual visible price as
--     the auto-bid engine raises it in bid_increment steps -- this is what
--     the avatar stack / bid history / realtime price feed read from.
-- The function that resolves a new max bid into the next bids row (and
-- applies the soft-close extension) is intentionally NOT in this migration
-- -- it's the next piece, worth designing on its own since the proxy-bid
-- and soft-close correctness matters a lot. For now, writes to bids and
-- lot_max_bids are select-only from the client; nothing can insert into
-- them until that function (SECURITY DEFINER) exists.

-- ── Enums ────────────────────────────────────────────────────────────────

create type auction_status as enum ('draft', 'scheduled', 'live', 'closed');
create type lot_status as enum ('active', 'withdrawn');
create type bidder_profile_status as enum ('pending', 'approved', 'rejected');

-- ── Tables ───────────────────────────────────────────────────────────────

-- The extra info required before someone can bid (phone at minimum, for
-- contact-based fulfillment -- more fields likely land once the
-- registration form itself is designed). One row per user, admin-reviewed.
create table bidder_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  phone text not null,
  status bidder_profile_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id)
);

create table auctions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_image_url text,
  organizer_name text,
  organizer_logo_url text,
  -- scheduled_end_at is the original, fixed close time -- the anchor the
  -- soft-close decay rule (+1min, then +30s after 30min of overtime) is
  -- measured against. current_end_at is the live close time, pushed later
  -- by each qualifying late bid; starts equal to scheduled_end_at.
  scheduled_start_at timestamptz not null,
  scheduled_end_at timestamptz not null,
  current_end_at timestamptz not null,
  status auction_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table lots (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references auctions (id) on delete cascade,
  lot_number integer not null,
  title text not null,
  subtitle text,
  description text,
  category_id uuid references categories (id) on delete set null,
  tags text[] not null default '{}',
  starting_price numeric(12, 2) not null default 0,
  bid_increment numeric(12, 2) not null default 50,
  status lot_status not null default 'active',
  created_at timestamptz not null default now(),
  unique (auction_id, lot_number)
);

create table lot_images (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references lots (id) on delete cascade,
  url text not null,
  sort_order int not null default 0
);

-- Private: a bidder's own standing max for a lot. One row per bidder per
-- lot; raising your max updates this row rather than inserting a new one.
create table lot_max_bids (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references lots (id) on delete cascade,
  bidder_user_id uuid not null references auth.users (id) on delete cascade,
  max_amount numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lot_id, bidder_user_id)
);

-- Public: append-only log of the visible price each time it changes.
-- bidder_user_id = whoever is the leader after this event (may be an
-- auto-bid response on behalf of the previous leader, not the person who
-- just raised their max).
create table bids (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references lots (id) on delete cascade,
  bidder_user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric(12, 2) not null,
  is_auto boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────────────────

create index auctions_status_start_idx on auctions (status, scheduled_start_at);
create index lots_auction_id_idx on lots (auction_id);
create index lot_images_lot_id_idx on lot_images (lot_id);
create index lot_max_bids_lot_id_idx on lot_max_bids (lot_id);
create index bids_lot_id_created_at_idx on bids (lot_id, created_at desc);

-- ── Row Level Security ───────────────────────────────────────────────────

alter table bidder_profiles enable row level security;
alter table auctions enable row level security;
alter table lots enable row level security;
alter table lot_images enable row level security;
alter table lot_max_bids enable row level security;
alter table bids enable row level security;

-- bidder_profiles: own record + admin; insert your own (always starts
-- pending -- the check stops you inserting yourself as pre-approved);
-- update your own contact details while still pending, admin otherwise
-- (status changes are an admin-only action).
create policy "bidder_profiles_select_own_or_admin" on bidder_profiles
  for select using (auth.uid() = user_id or is_admin(auth.uid()));

create policy "bidder_profiles_insert_own" on bidder_profiles
  for insert with check (auth.uid() = user_id and status = 'pending');

create policy "bidder_profiles_update_own_pending_or_admin" on bidder_profiles
  for update using (
    (auth.uid() = user_id and status = 'pending') or is_admin(auth.uid())
  );

-- auctions: public can see anything past draft; only admin can see/write drafts.
create policy "auctions_select_public" on auctions
  for select using (status != 'draft' or is_admin(auth.uid()));

create policy "auctions_write_admin" on auctions
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- lots / lot_images: follow the parent auction's visibility, admin-only writes.
create policy "lots_select" on lots
  for select using (
    exists (
      select 1 from auctions a
      where a.id = auction_id and (a.status != 'draft' or is_admin(auth.uid()))
    )
  );

create policy "lots_write_admin" on lots
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

create policy "lot_images_select" on lot_images
  for select using (
    exists (
      select 1 from lots l
      join auctions a on a.id = l.auction_id
      where l.id = lot_id and (a.status != 'draft' or is_admin(auth.uid()))
    )
  );

create policy "lot_images_write_admin" on lot_images
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- lot_max_bids: private to the bidder (+ admin). No insert/update policy
-- yet -- writes go through the forthcoming proxy-bid function.
create policy "lot_max_bids_select_own_or_admin" on lot_max_bids
  for select using (auth.uid() = bidder_user_id or is_admin(auth.uid()));

-- bids: public log, visible to anyone who can see the lot. No insert
-- policy yet -- same reason as lot_max_bids.
create policy "bids_select" on bids
  for select using (
    exists (
      select 1 from lots l
      join auctions a on a.id = l.auction_id
      where l.id = lot_id and (a.status != 'draft' or is_admin(auth.uid()))
    )
  );

-- ── Grants ───────────────────────────────────────────────────────────────
-- service_role already has full access to every table via
-- 0019_service_role_grants.sql's default privileges.

grant select, insert, update on bidder_profiles to authenticated;
grant select, insert, update, delete on auctions, lots, lot_images to anon, authenticated;
grant select on lot_max_bids, bids to authenticated;
grant select on bids to anon;

-- ── Realtime ─────────────────────────────────────────────────────────────
-- The live price feed and the extending countdown both need push updates.

alter publication supabase_realtime add table bids;
alter publication supabase_realtime add table auctions;
