insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts',
  'receipts',
  true,
  10485760,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set public = true,
    file_size_limit = 10485760,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can upload receipts" on storage.objects;
create policy "Public can upload receipts"
  on storage.objects for insert
  with check (bucket_id = 'receipts');

drop policy if exists "Public can read receipts" on storage.objects;
create policy "Public can read receipts"
  on storage.objects for select
  using (bucket_id = 'receipts');