-- Uruchom cały plik w Supabase Dashboard -> SQL Editor.

create table if not exists public.device_records (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.repair_records (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists device_records_updated_at_idx
  on public.device_records (updated_at desc);
create index if not exists repair_records_updated_at_idx
  on public.repair_records (updated_at desc);
create index if not exists device_records_serial_number_idx
  on public.device_records ((upper(data->>'serialNumber')));
create index if not exists repair_records_serial_number_idx
  on public.repair_records ((upper(data->>'serialNumber')));

alter table public.device_records enable row level security;
alter table public.repair_records enable row level security;

drop policy if exists "authenticated users can read devices" on public.device_records;
create policy "authenticated users can read devices"
  on public.device_records for select
  to authenticated
  using (true);

drop policy if exists "authenticated users can insert devices" on public.device_records;
create policy "authenticated users can insert devices"
  on public.device_records for insert
  to authenticated
  with check (auth.uid() = updated_by);

drop policy if exists "authenticated users can update devices" on public.device_records;
create policy "authenticated users can update devices"
  on public.device_records for update
  to authenticated
  using (true)
  with check (auth.uid() = updated_by);

drop policy if exists "authenticated users can delete devices" on public.device_records;
create policy "authenticated users can delete devices"
  on public.device_records for delete
  to authenticated
  using (true);

drop policy if exists "authenticated users can read repairs" on public.repair_records;
create policy "authenticated users can read repairs"
  on public.repair_records for select
  to authenticated
  using (true);

drop policy if exists "authenticated users can insert repairs" on public.repair_records;
create policy "authenticated users can insert repairs"
  on public.repair_records for insert
  to authenticated
  with check (auth.uid() = updated_by);

drop policy if exists "authenticated users can update repairs" on public.repair_records;
create policy "authenticated users can update repairs"
  on public.repair_records for update
  to authenticated
  using (true)
  with check (auth.uid() = updated_by);

drop policy if exists "authenticated users can delete repairs" on public.repair_records;
create policy "authenticated users can delete repairs"
  on public.repair_records for delete
  to authenticated
  using (true);

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

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'device_records'
  ) then
    alter publication supabase_realtime add table public.device_records;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'repair_records'
  ) then
    alter publication supabase_realtime add table public.repair_records;
  end if;
end
$$;
