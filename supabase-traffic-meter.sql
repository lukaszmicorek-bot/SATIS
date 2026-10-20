-- Aggregated API payload counters from all SATIS browsers. No request bodies or client data.
-- Run once in Supabase SQL Editor; existing business records are not modified.
begin;
do $$ begin
  if to_regprocedure('public.is_satis_app_user()') is null
    or to_regprocedure('public.is_satis_owner()') is null then
    raise exception 'Install SATIS security hardening first.';
  end if;
end $$;
create table if not exists public.satis_traffic_counters (
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null,
  month text not null check (month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  sent bigint not null check (sent between 0 and 1000000000000),
  received bigint not null check (received between 0 and 1000000000000),
  started_at timestamptz not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, client_id, month)
);
alter table public.satis_traffic_counters enable row level security;
revoke all on public.satis_traffic_counters from public, anon, authenticated;
grant select on public.satis_traffic_counters to authenticated;
drop policy if exists traffic_owner_read on public.satis_traffic_counters;
create policy traffic_owner_read on public.satis_traffic_counters for select to authenticated
  using (public.is_satis_app_user() and public.is_satis_owner());

create or replace function public.satis_traffic_report(p_client uuid, p_started_at timestamptz, p_months jsonb)
returns boolean language plpgsql security definer set search_path = pg_catalog as $$
declare item record; sent_value numeric; received_value numeric;
begin
  if auth.uid() is null or not public.is_satis_app_user() then
    raise exception 'SATIS access denied' using errcode = '42501';
  end if;
  if p_client is null or p_started_at is null or not isfinite(p_started_at)
    or jsonb_typeof(p_months) is distinct from 'object' or octet_length(p_months::text) > 50000 then
    raise exception 'Invalid traffic counters' using errcode = '22023';
  end if;
  for item in select key, value from jsonb_each(p_months) loop
    if item.key !~ '^[0-9]{4}-(0[1-9]|1[0-2])$'
      or jsonb_typeof(item.value) is distinct from 'object'
      or jsonb_typeof(item.value->'sent') is distinct from 'number'
      or jsonb_typeof(item.value->'received') is distinct from 'number'
      or (item.value - array['sent','received']) <> '{}'::jsonb then
      raise exception 'Invalid traffic month' using errcode = '22023';
    end if;
    sent_value := (item.value->>'sent')::numeric;
    received_value := (item.value->>'received')::numeric;
    if sent_value not between 0 and 1000000000000 or received_value not between 0 and 1000000000000
      or trunc(sent_value) <> sent_value or trunc(received_value) <> received_value then
      raise exception 'Invalid traffic size' using errcode = '22023';
    end if;
    -- Absolute monotonically increasing counters: safe after timeout/retry/out-of-order delivery.
    insert into public.satis_traffic_counters as counters
      (user_id, client_id, month, sent, received, started_at)
      values (auth.uid(), p_client, item.key, sent_value::bigint, received_value::bigint, least(p_started_at, now()))
      on conflict (user_id, client_id, month) do update set
        sent = greatest(counters.sent, excluded.sent), received = greatest(counters.received, excluded.received),
        started_at = least(counters.started_at, excluded.started_at), updated_at = now();
  end loop;
  return true;
end;
$$;

create or replace function public.satis_traffic_summary()
returns jsonb language plpgsql security definer set search_path = pg_catalog as $$
declare result jsonb;
begin
  if auth.uid() is null or not public.is_satis_app_user() or not public.is_satis_owner() then
    raise exception 'SATIS owner access required' using errcode = '42501';
  end if;
  select jsonb_build_object('startedAt', min(first_seen), 'updatedAt', max(last_seen),
    'months', coalesce(jsonb_object_agg(month, jsonb_build_object('sent', sent, 'received', received)), '{}'::jsonb))
    into result from (select month, sum(sent) sent, sum(received) received,
      min(started_at) first_seen, max(updated_at) last_seen from public.satis_traffic_counters group by month) totals;
  return result;
end;
$$;
revoke all on function public.satis_traffic_report(uuid,timestamptz,jsonb), public.satis_traffic_summary() from public, anon;
grant execute on function public.satis_traffic_report(uuid,timestamptz,jsonb), public.satis_traffic_summary() to authenticated;
notify pgrst, 'reload schema';
commit;
