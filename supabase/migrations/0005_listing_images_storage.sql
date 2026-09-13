insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "listing_images_bucket_public_read" on storage.objects
  for select using (bucket_id = 'listing-images');

create policy "listing_images_bucket_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "listing_images_bucket_owner_update" on storage.objects
  for update using (
    bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "listing_images_bucket_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text
  );
