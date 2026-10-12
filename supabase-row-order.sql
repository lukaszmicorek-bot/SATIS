-- Wspolna kolejnosc Aparatow, Demo oraz Serwisu. Uruchom w SQL Editor.
-- Nie zmienia ani nie usuwa rekordow klientow.
begin;

do $$
begin
  if to_regprocedure('public.is_satis_app_user()') is null
    or to_regprocedure('public.is_satis_owner()') is null then
    raise exception 'Najpierw zainstaluj uprawnienia SATIS.';
  end if;
end $$;

create table if not exists public.table_row_orders (
  id text primary key check (id in ('devices', 'demo', 'repairs')),
  data jsonb not null default '{"ids":[]}'::jsonb check (
    jsonb_typeof(data) = 'object'
    and data ? 'ids'
    and jsonb_typeof(data->'ids') = 'array'
    and jsonb_array_length(data->'ids') <= 25000
    and not jsonb_path_exists(data, '$.ids[*] ? (@.type() != "string")')
    and octet_length(data::text) <= 2097152
  ),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

insert into public.table_row_orders(id) values ('devices'), ('demo'), ('repairs')
  on conflict(id) do nothing;

alter table public.table_row_orders enable row level security;
revoke all on public.table_row_orders from public, anon, authenticated;
grant select on public.table_row_orders to authenticated;
grant update(data) on public.table_row_orders to authenticated;

drop policy if exists row_order_read on public.table_row_orders;
create policy row_order_read on public.table_row_orders for select to authenticated
  using (public.is_satis_app_user());
drop policy if exists row_order_owner_write on public.table_row_orders;
create policy row_order_owner_write on public.table_row_orders for update to authenticated
  using (public.is_satis_app_user() and public.is_satis_owner())
  with check (public.is_satis_app_user() and public.is_satis_owner());

create or replace function public.stamp_table_row_order()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.revision := old.revision + 1;
  new.updated_at := clock_timestamp();
  new.updated_by := auth.uid();
  return new;
end $$;
revoke all on function public.stamp_table_row_order() from public, anon, authenticated;
drop trigger if exists stamp_table_row_order on public.table_row_orders;
create trigger stamp_table_row_order before update on public.table_row_orders
  for each row execute function public.stamp_table_row_order();

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'table_row_orders') then
    alter publication supabase_realtime add table public.table_row_orders;
  end if;
end $$;

notify pgrst, 'reload schema';
commit;
