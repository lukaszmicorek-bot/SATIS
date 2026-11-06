-- Private courier account identifiers. No values are published in this file.
begin;
do $$ begin
  if to_regprocedure('public.is_satis_app_user()') is null then
    raise exception 'Install SATIS security migrations first.';
  end if;
end $$;
create schema if not exists private;
create table if not exists private.complaint_shipping_accounts (
  route_id text primary key check (route_id in ('sonova','sivantos','audibel','interton','gnp','dgs','acustica','oticon')),
  accounts jsonb not null check (jsonb_typeof(accounts) = 'array' and jsonb_array_length(accounts) <= 8 and octet_length(accounts::text) <= 4096)
);
alter table private.complaint_shipping_accounts enable row level security;
revoke all on private.complaint_shipping_accounts from public, anon, authenticated;
create or replace function public.complaint_shipping_accounts_read()
returns jsonb language plpgsql stable security definer set search_path = pg_catalog as $$
begin
  if auth.uid() is null or public.is_satis_app_user() is not true then
    raise exception 'Shipping access denied' using errcode = '42501';
  end if;
  return coalesce((select jsonb_object_agg(route_id, accounts) from private.complaint_shipping_accounts), '{}'::jsonb);
end;
$$;
revoke all on function public.complaint_shipping_accounts_read() from public, anon;
grant execute on function public.complaint_shipping_accounts_read() to authenticated;
notify pgrst, 'reload schema';
commit;
