-- Public image buckets for profile avatars/covers. Files are stored under
-- "<user_id>/<filename>" so ownership can be checked from the path alone.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('covers', 'covers', true)
on conflict (id) do nothing;

create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_owner_update" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "covers_public_read" on storage.objects
  for select using (bucket_id = 'covers');

create policy "covers_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "covers_owner_update" on storage.objects
  for update using (
    bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "covers_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text
  );
