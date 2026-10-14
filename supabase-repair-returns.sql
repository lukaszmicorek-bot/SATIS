-- Informacja o powrocie produktu. Nie zmienia rekordu serwisu ani daty odbioru.
begin;
create table if not exists public.repair_return_acknowledgements (
  record_id text not null references public.repair_records(id) on delete cascade,
  return_date date not null,
  location text not null check (location in ('T12','P50','P63')),
  acknowledged_at timestamptz not null default clock_timestamp(),
  acknowledged_by uuid not null references auth.users(id),
  user_email text not null,
  workstation text not null default '',
  primary key (record_id, return_date, location)
);
alter table public.repair_return_acknowledgements enable row level security;
revoke all on public.repair_return_acknowledgements from public, anon, authenticated;
grant select on public.repair_return_acknowledgements to authenticated;
drop policy if exists authorized_return_read on public.repair_return_acknowledgements;
create policy authorized_return_read on public.repair_return_acknowledgements
  for select to authenticated using (public.is_satis_app_user());

create or replace function public.satis_acknowledge_repair_return(
  p_record_id text, p_return_date date, p_location text, p_workstation text default '')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare source jsonb; result jsonb;
begin
  if auth.uid() is null or not public.is_satis_app_user() then
    raise exception 'Access denied' using errcode = '42501';
  end if;
  select data into source from public.repair_records where id = p_record_id for share;
  if source is null or p_return_date is null or p_location is null
    or source->>'returnDate' is distinct from p_return_date::text
    or source->>'location' is distinct from p_location
    or coalesce(source->>'pickupDate', '') <> '' then
    raise exception 'Sprawa zmienila sie albo produkt zostal juz odebrany. Odswiez liste.' using errcode = 'PT409';
  end if;
  insert into public.repair_return_acknowledgements
    (record_id, return_date, location, acknowledged_by, user_email, workstation)
  values (p_record_id, p_return_date, p_location, auth.uid(),
    coalesce((select email from auth.users where id = auth.uid()), ''), left(coalesce(p_workstation,''), 100))
  on conflict (record_id, return_date, location) do nothing;
  select to_jsonb(a) into result from public.repair_return_acknowledgements a
    where record_id = p_record_id and return_date = p_return_date and location = p_location;
  return result;
end $$;

create or replace function public.satis_repair_return_acknowledgements(p_record_ids text[])
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb;
begin
  if auth.uid() is null or not public.is_satis_app_user() then
    raise exception 'Access denied' using errcode = '42501';
  end if;
  if p_record_ids is null or cardinality(p_record_ids) > 200 then
    raise exception 'Invalid batch' using errcode = '22023';
  end if;
  select coalesce(jsonb_agg(to_jsonb(a)), '[]'::jsonb) into result
    from public.repair_return_acknowledgements a join public.repair_records r on r.id = a.record_id
    where a.record_id = any(p_record_ids)
      and r.data->>'returnDate' = a.return_date::text
      and r.data->>'location' = a.location and coalesce(r.data->>'pickupDate','') = '';
  return result;
end $$;
revoke all on function public.satis_acknowledge_repair_return(text,date,text,text) from public, anon;
revoke all on function public.satis_repair_return_acknowledgements(text[]) from public, anon;
grant execute on function public.satis_acknowledge_repair_return(text,date,text,text) to authenticated;
grant execute on function public.satis_repair_return_acknowledgements(text[]) to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'repair_return_acknowledgements') then
    alter publication supabase_realtime add table public.repair_return_acknowledgements;
  end if;
end $$;
notify pgrst, 'reload schema';
commit;
