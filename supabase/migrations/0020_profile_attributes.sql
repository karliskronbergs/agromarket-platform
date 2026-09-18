-- Fixed set of trust/certification badges a business can attach to its
-- profile (separate concept from categories -- these aren't "what do you
-- sell", they're "what are you certified/recognized for"). Modeled the
-- same way as categories: a lookup table + a join table, owner-writable
-- like profile_categories.

create table attributes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  icon text not null,
  name_lv text not null,
  name_en text not null,
  sort_order integer not null default 0
);

create table profile_attribute_links (
  profile_id uuid not null references profiles (id) on delete cascade,
  attribute_id uuid not null references attributes (id) on delete cascade,
  primary key (profile_id, attribute_id)
);

alter table attributes enable row level security;
alter table profile_attribute_links enable row level security;

create policy "attributes_select_all" on attributes
  for select using (true);

create policy "attributes_write_admin" on attributes
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

create policy "profile_attribute_links_select" on profile_attribute_links
  for select using (
    exists (
      select 1 from profiles p
      where p.id = profile_id
        and (p.status = 'active' or p.user_id = auth.uid() or is_admin(auth.uid()))
    )
  );

create policy "profile_attribute_links_write_owner_or_admin" on profile_attribute_links
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

grant select, insert, update, delete on attributes, profile_attribute_links to anon, authenticated;

insert into attributes (slug, icon, name_lv, name_en, sort_order) values
  ('organic-certified', 'leaf', 'Bioloģiskais sertifikāts', 'Organic certificate', 0),
  ('pedigree-farm', 'medal', 'Šķirnes saimniecība', 'Pedigree farm', 1),
  ('certified-seed-grower', 'grain', 'Sertificētas sēklas audzētājs', 'Certified seed grower', 2),
  ('equipment-warranty', 'wrench', 'Tehnika ar garantiju', 'Equipment with warranty', 3),
  ('official-dealer', 'star', 'Oficiālais dīleris', 'Official dealer', 4)
on conflict (slug) do nothing;
