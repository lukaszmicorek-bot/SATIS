-- Uruchom raz w Supabase Dashboard -> SQL Editor.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'demo-attachments',
  'demo-attachments',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "authenticated users can read demo attachments" on storage.objects;
create policy "authenticated users can read demo attachments"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'demo-attachments');

drop policy if exists "authenticated users can insert demo attachments" on storage.objects;
create policy "authenticated users can insert demo attachments"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'demo-attachments');

drop policy if exists "authenticated users can update demo attachments" on storage.objects;
create policy "authenticated users can update demo attachments"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'demo-attachments')
  with check (bucket_id = 'demo-attachments');

drop policy if exists "authenticated users can delete demo attachments" on storage.objects;
create policy "authenticated users can delete demo attachments"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'demo-attachments');
