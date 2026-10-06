-- Robocza lista obecnosci. Uruchom po migracjach zabezpieczen i urlopow.
-- Nie jest to kompletna ewidencja czasu pracy z art. 149 Kodeksu pracy.
begin;

do $$
begin
  if to_regprocedure('public.is_satis_owner()') is null
    or to_regclass('public.vacation_employees') is null then
    raise exception 'Najpierw uruchom migracje uprawnien i urlopow.';
  end if;
end $$;

create table if not exists public.attendance_entries (
  employee_id text not null references public.vacation_employees(id),
  employee_name text not null check (length(trim(employee_name)) between 2 and 150),
  work_date date not null,
  workstation text not null check (workstation in ('T12', 'P50', 'P63')),
  started_at time without time zone not null,
  ended_at time without time zone,
  updated_at timestamptz not null default now(),
  updated_by uuid not null references auth.users(id),
  primary key (employee_id, work_date),
  constraint attendance_time_order check (ended_at is null or ended_at >= started_at)
);

create index if not exists attendance_entries_date_idx
  on public.attendance_entries (work_date desc);

alter table public.attendance_entries enable row level security;
revoke all on public.attendance_entries from public, anon, authenticated;
grant select, insert, update on public.attendance_entries to authenticated;

drop policy if exists attendance_owner on public.attendance_entries;
create policy attendance_owner on public.attendance_entries
  for all to authenticated
  using (public.is_satis_owner())
  with check (public.is_satis_owner() and updated_by = auth.uid());

create table if not exists public.attendance_entry_history (
  id bigint generated always as identity primary key,
  employee_id text not null,
  work_date date not null,
  previous_value jsonb,
  new_value jsonb not null,
  changed_at timestamptz not null default now(),
  changed_by uuid not null references auth.users(id)
);

alter table public.attendance_entry_history enable row level security;
revoke all on public.attendance_entry_history from public, anon, authenticated;
grant select on public.attendance_entry_history to authenticated;

drop policy if exists attendance_history_owner on public.attendance_entry_history;
create policy attendance_history_owner on public.attendance_entry_history
  for select to authenticated using (public.is_satis_owner());

create or replace function public.attendance_track_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.attendance_entry_history
    (employee_id, work_date, previous_value, new_value, changed_by)
  values
    (new.employee_id, new.work_date, to_jsonb(old), to_jsonb(new), auth.uid());
  return new;
end;
$$;

revoke all on function public.attendance_track_change() from public, anon, authenticated;
drop trigger if exists attendance_track_change on public.attendance_entries;
create trigger attendance_track_change
  after insert or update on public.attendance_entries
  for each row execute function public.attendance_track_change();

commit;
