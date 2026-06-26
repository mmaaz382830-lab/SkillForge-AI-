-- Private uploaded material files live in the materials bucket.
-- Future upload path convention: {user_id}/{material_id}/{safe_file_name}
-- Pasted text materials do not use storage objects and keep storage_path null.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'materials',
  'materials',
  false,
  5242880,
  array['application/pdf', 'text/plain']::text[]
)
on conflict (id) do update
set
  name = excluded.name,
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can read own material files" on storage.objects;
create policy "Users can read own material files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'materials'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can upload own material files" on storage.objects;
create policy "Users can upload own material files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'materials'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update own material files" on storage.objects;
create policy "Users can update own material files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'materials'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'materials'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete own material files" on storage.objects;
create policy "Users can delete own material files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'materials'
  and (storage.foldername(name))[1] = auth.uid()::text
);
