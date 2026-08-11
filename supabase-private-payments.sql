-- Uruchom w Supabase Dashboard -> SQL Editor.
-- Prywatna tabela płatności widoczna tylko dla satis@pracowniasluchu.pl.

create table if not exists public.device_private_payments (
  record_id text primary key references public.device_records(id) on delete cascade,
  amount text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists device_private_payments_updated_at_idx
  on public.device_private_payments (updated_at desc);

alter table public.device_private_payments enable row level security;

drop policy if exists "private owner can read payments" on public.device_private_payments;
create policy "private owner can read payments"
  on public.device_private_payments for select
  to authenticated
  using (lower(auth.jwt() ->> 'email') = 'satis@pracowniasluchu.pl');

drop policy if exists "private owner can insert payments" on public.device_private_payments;
create policy "private owner can insert payments"
  on public.device_private_payments for insert
  to authenticated
  with check (lower(auth.jwt() ->> 'email') = 'satis@pracowniasluchu.pl');

drop policy if exists "private owner can update payments" on public.device_private_payments;
create policy "private owner can update payments"
  on public.device_private_payments for update
  to authenticated
  using (lower(auth.jwt() ->> 'email') = 'satis@pracowniasluchu.pl')
  with check (lower(auth.jwt() ->> 'email') = 'satis@pracowniasluchu.pl');

drop policy if exists "private owner can delete payments" on public.device_private_payments;
create policy "private owner can delete payments"
  on public.device_private_payments for delete
  to authenticated
  using (lower(auth.jwt() ->> 'email') = 'satis@pracowniasluchu.pl');

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'device_private_payments'
  ) then
    alter publication supabase_realtime add table public.device_private_payments;
  end if;
end $$;
