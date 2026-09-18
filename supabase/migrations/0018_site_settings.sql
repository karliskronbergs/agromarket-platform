-- Generic key/value site settings (starting with the header logo), plus
-- a public storage bucket for site-wide assets. Only admins can write;
-- everyone can read, since the logo needs to render in the header for
-- every visitor.

create table site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;

create policy "site_settings_select_all" on site_settings
  for select using (true);

create policy "site_settings_write_admin" on site_settings
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

grant select, insert, update, delete on site_settings to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

create policy "site_assets_public_read" on storage.objects
  for select using (bucket_id = 'site-assets');

create policy "site_assets_admin_write" on storage.objects
  for insert with check (bucket_id = 'site-assets' and is_admin(auth.uid()));

create policy "site_assets_admin_update" on storage.objects
  for update using (bucket_id = 'site-assets' and is_admin(auth.uid()));

create policy "site_assets_admin_delete" on storage.objects
  for delete using (bucket_id = 'site-assets' and is_admin(auth.uid()));
