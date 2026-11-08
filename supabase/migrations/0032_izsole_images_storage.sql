-- Storage for izsole.lauks24.lv admin-uploaded images (lot photos, auction
-- organizer logos). Unlike listing-images (owner-scoped by folder = user
-- id), uploads here are always done by an admin on behalf of a lot/auction
-- they don't personally own, so the write policy checks is_admin() instead
-- of a folder-prefix match. One bucket, path prefix tells them apart:
--   lots/<lotId>-<uuid>.<ext>
--   organizers/<auctionId>-<uuid>.<ext>

insert into storage.buckets (id, name, public)
values ('izsole-images', 'izsole-images', true)
on conflict (id) do nothing;

create policy "izsole_images_bucket_public_read" on storage.objects
  for select using (bucket_id = 'izsole-images');

create policy "izsole_images_bucket_admin_write" on storage.objects
  for all using (bucket_id = 'izsole-images' and is_admin(auth.uid()))
  with check (bucket_id = 'izsole-images' and is_admin(auth.uid()));
