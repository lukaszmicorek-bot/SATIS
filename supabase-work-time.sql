-- Ewidencja czasu pracy SATIS. Uruchom po supabase-audit-vacation.sql.
-- Dane wprowadza wlasciciel; stosowanie jako dokumentacji pracowniczej wymaga
-- osobnej weryfikacji procedur, retencji i uzgodnienia z osoba od kadr.
begin;

do $$
begin
  if to_regprocedure('public.is_satis_owner()') is null
    or to_regclass('public.vacation_employees') is null then
    raise exception 'Najpierw uruchom migracje uprawnien i urlopow.';
  end if;
end $$;

create table if not exists public.work_time_records (
  employee_id text not null references public.vacation_employees(id),
  employee_name text not null check (length(trim(employee_name)) between 2 and 150),
  work_date date not null,
  payload jsonb not null check (
    jsonb_typeof(payload) = 'object'
    and payload->>'kind' in ('WORK', 'FREE', 'LEAVE', 'RELEASE', 'EXCUSED', 'UNEXCUSED')
  ),
  updated_at timestamptz not null default now(),
  updated_by uuid not null references auth.users(id),
  primary key (employee_id, work_date)
);

create index if not exists work_time_records_date_idx
  on public.work_time_records (work_date desc);

alter table public.work_time_records enable row level security;
revoke all on public.work_time_records from public, anon, authenticated;
grant select, insert, update on public.work_time_records to authenticated;

drop policy if exists work_time_owner on public.work_time_records;
create policy work_time_owner on public.work_time_records
  for all to authenticated
  using (public.is_satis_owner())
  with check (public.is_satis_owner() and updated_by = auth.uid());

create or replace function public.work_time_stamp_change()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

revoke all on function public.work_time_stamp_change() from public, anon, authenticated;
drop trigger if exists work_time_stamp_change on public.work_time_records;
create trigger work_time_stamp_change
  before insert or update on public.work_time_records
  for each row execute function public.work_time_stamp_change();

create table if not exists public.work_time_record_history (
  id bigint generated always as identity primary key,
  employee_id text not null,
  work_date date not null,
  previous_value jsonb,
  new_value jsonb not null,
  changed_at timestamptz not null default now(),
  changed_by uuid not null references auth.users(id)
);

alter table public.work_time_record_history enable row level security;
revoke all on public.work_time_record_history from public, anon, authenticated;
grant select on public.work_time_record_history to authenticated;

drop policy if exists work_time_history_owner on public.work_time_record_history;
create policy work_time_history_owner on public.work_time_record_history
  for select to authenticated using (public.is_satis_owner());

create or replace function public.work_time_track_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.work_time_record_history
    (employee_id, work_date, previous_value, new_value, changed_by)
  values
    (new.employee_id, new.work_date, to_jsonb(old), to_jsonb(new), auth.uid());
  return new;
end;
$$;

revoke all on function public.work_time_track_change() from public, anon, authenticated;
drop trigger if exists work_time_track_change on public.work_time_records;
create trigger work_time_track_change
  after insert or update on public.work_time_records
  for each row execute function public.work_time_track_change();

commit;
