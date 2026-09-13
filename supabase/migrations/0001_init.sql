-- AgroMarket platform — initial schema + RLS policies.
-- Apply via `supabase db push`, or paste into the Supabase dashboard SQL editor.

create extension if not exists pgcrypto;

-- ── Enums ────────────────────────────────────────────────────────────────

create type profile_status as enum ('active', 'suspended');
create type listing_type as enum ('sell', 'buy');
create type listing_status as enum ('active', 'expired', 'removed');
create type report_target_type as enum ('profile', 'listing');
create type report_status as enum ('open', 'resolved', 'dismissed');

-- ── Tables ───────────────────────────────────────────────────────────────

create table admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  business_name text not null,
  slug text not null unique,
  description text,
  avatar_url text,
  cover_url text,
  phone text,
  contact_email text,
  website text,
  address text,
  lat double precision,
  lng double precision,
  status profile_status not null default 'active',
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  icon text,
  name_lv text not null,
  name_en text not null
);

create table profile_categories (
  profile_id uuid not null references profiles (id) on delete cascade,
  category_id uuid not null references categories (id) on delete cascade,
  primary key (profile_id, category_id)
);

create table listings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  listing_type listing_type not null,
  title text not null,
  description text,
  category_id uuid references categories (id) on delete set null,
  price numeric(12, 2),
  is_paid boolean not null default false,
  lat double precision,
  lng double precision,
  status listing_status not null default 'active',
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  url text not null,
  sort_order int not null default 0
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  participant_one uuid not null references auth.users (id) on delete cascade,
  participant_two uuid not null references auth.users (id) on delete cascade,
  listing_id uuid references listings (id) on delete set null,
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  target_type report_target_type not null,
  target_id uuid not null,
  reason text not null,
  status report_status not null default 'open',
  created_at timestamptz not null default now()
);

create table admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users (id),
  action text not null,
  target_type text,
  target_id uuid,
  created_at timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────────────────

create index profiles_lat_lng_idx on profiles (lat, lng);
create index profiles_status_idx on profiles (status);
create index listings_profile_id_idx on listings (profile_id);
create index listings_status_type_idx on listings (status, listing_type);
create index listings_lat_lng_idx on listings (lat, lng);
create index listing_images_listing_id_idx on listing_images (listing_id);
create index conversations_participant_one_idx on conversations (participant_one);
create index conversations_participant_two_idx on conversations (participant_two);
create index messages_conversation_id_idx on messages (conversation_id);

-- ── Row Level Security ───────────────────────────────────────────────────
-- Default-deny: RLS is enabled on every table with no policy granting access
-- until explicitly added below. is_admin() centralizes the admin check used
-- across policies.

create or replace function is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from admins where user_id = uid);
$$;

alter table admins enable row level security;
alter table profiles enable row level security;
alter table categories enable row level security;
alter table profile_categories enable row level security;
alter table listings enable row level security;
alter table listing_images enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table reports enable row level security;
alter table admin_audit_log enable row level security;

-- admins: a user may check their own admin status; the admin list itself is
-- otherwise only manageable via the service role (dashboard / server code).
create policy "admins_select_self" on admins
  for select using (auth.uid() = user_id);

-- profiles
create policy "profiles_select_public" on profiles
  for select using (
    status = 'active' or auth.uid() = user_id or is_admin(auth.uid())
  );

create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = user_id);

create policy "profiles_update_own_or_admin" on profiles
  for update using (auth.uid() = user_id or is_admin(auth.uid()));

create policy "profiles_delete_own_or_admin" on profiles
  for delete using (auth.uid() = user_id or is_admin(auth.uid()));

-- categories: public read, admin-managed writes
create policy "categories_select_all" on categories
  for select using (true);

create policy "categories_write_admin" on categories
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- profile_categories: follows the parent profile's visibility/ownership
create policy "profile_categories_select" on profile_categories
  for select using (
    exists (
      select 1 from profiles p
      where p.id = profile_id
        and (p.status = 'active' or p.user_id = auth.uid() or is_admin(auth.uid()))
    )
  );

create policy "profile_categories_write_owner_or_admin" on profile_categories
  for all using (
    exists (
      select 1 from profiles p
      where p.id = profile_id and (p.user_id = auth.uid() or is_admin(auth.uid()))
    )
  ) with check (
    exists (
      select 1 from profiles p
      where p.id = profile_id and (p.user_id = auth.uid() or is_admin(auth.uid()))
    )
  );

-- listings
create policy "listings_select_public" on listings
  for select using (
    status = 'active'
    or is_admin(auth.uid())
    or exists (select 1 from profiles p where p.id = profile_id and p.user_id = auth.uid())
  );

create policy "listings_insert_owner" on listings
  for insert with check (
    exists (select 1 from profiles p where p.id = profile_id and p.user_id = auth.uid())
  );

create policy "listings_update_owner_or_admin" on listings
  for update using (
    is_admin(auth.uid())
    or exists (select 1 from profiles p where p.id = profile_id and p.user_id = auth.uid())
  );

create policy "listings_delete_owner_or_admin" on listings
  for delete using (
    is_admin(auth.uid())
    or exists (select 1 from profiles p where p.id = profile_id and p.user_id = auth.uid())
  );

-- listing_images: follows the parent listing's visibility/ownership
create policy "listing_images_select" on listing_images
  for select using (
    exists (
      select 1 from listings l
      join profiles p on p.id = l.profile_id
      where l.id = listing_id
        and (l.status = 'active' or p.user_id = auth.uid() or is_admin(auth.uid()))
    )
  );

create policy "listing_images_write_owner_or_admin" on listing_images
  for all using (
    exists (
      select 1 from listings l
      join profiles p on p.id = l.profile_id
      where l.id = listing_id and (p.user_id = auth.uid() or is_admin(auth.uid()))
    )
  ) with check (
    exists (
      select 1 from listings l
      join profiles p on p.id = l.profile_id
      where l.id = listing_id and (p.user_id = auth.uid() or is_admin(auth.uid()))
    )
  );

-- conversations: only the two participants (or an admin) may see/act on a thread
create policy "conversations_select_participant" on conversations
  for select using (
    auth.uid() = participant_one or auth.uid() = participant_two or is_admin(auth.uid())
  );

create policy "conversations_insert_participant" on conversations
  for insert with check (
    auth.uid() = participant_one or auth.uid() = participant_two
  );

create policy "conversations_update_admin" on conversations
  for update using (is_admin(auth.uid()));

create policy "conversations_delete_admin" on conversations
  for delete using (is_admin(auth.uid()));

-- messages: only participants of the parent conversation
create policy "messages_select_participant" on messages
  for select using (
    is_admin(auth.uid())
    or exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.participant_one = auth.uid() or c.participant_two = auth.uid())
    )
  );

create policy "messages_insert_participant" on messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.participant_one = auth.uid() or c.participant_two = auth.uid())
    )
  );

create policy "messages_update_participant" on messages
  for update using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.participant_one = auth.uid() or c.participant_two = auth.uid())
    )
  );

-- reports: reporters see their own; only admins triage
create policy "reports_select_own_or_admin" on reports
  for select using (reporter_id = auth.uid() or is_admin(auth.uid()));

create policy "reports_insert_own" on reports
  for insert with check (reporter_id = auth.uid());

create policy "reports_update_admin" on reports
  for update using (is_admin(auth.uid()));

create policy "reports_delete_admin" on reports
  for delete using (is_admin(auth.uid()));

-- admin_audit_log: admin-only, append-only (no update/delete policy at all)
create policy "admin_audit_log_select_admin" on admin_audit_log
  for select using (is_admin(auth.uid()));

create policy "admin_audit_log_insert_admin" on admin_audit_log
  for insert with check (is_admin(auth.uid()) and admin_id = auth.uid());
