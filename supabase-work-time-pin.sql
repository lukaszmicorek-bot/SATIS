-- PIN-y ewidencji. Uruchom po supabase-work-time.sql.
-- Najpierw wykonaj kopie bazy i sprawdz migracje w projekcie testowym.
begin;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
create extension if not exists pgcrypto with schema extensions;

do $$
begin
  if to_regclass('public.work_time_records') is null
    or to_regclass('public.vacation_employees') is null
    or to_regprocedure('public.is_satis_owner()') is null
    or to_regprocedure('public.is_satis_app_user()') is null
    or to_regprocedure('public.vacation_is_holiday(date)') is null
    or to_regprocedure('extensions.crypt(text,text)') is null then
    raise exception 'Brakuje migracji ewidencji, uprawnien lub pgcrypto w schemacie extensions.';
  end if;
end $$;

create table if not exists private.work_time_employee_pins (
  employee_key text primary key check (employee_key in ('oliwia', 'justyna', 'iwona')),
  pin_hash text not null,
  failed_attempts integer not null default 0,
  locked_until timestamptz,
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users(id)
);
revoke all on private.work_time_employee_pins from public, anon, authenticated;

create or replace function private.work_time_employee_key(p_employee_id text)
returns text language plpgsql stable security definer set search_path = '' as $$
declare v_key text; v_year text; v_count integer;
begin
  select lower(split_part(btrim(data->>'name'), ' ', 1)), data->>'year' into v_key, v_year
    from public.vacation_employees where id = p_employee_id;
  if v_key not in ('oliwia', 'justyna', 'iwona') or v_key is null then
    return null;
  end if;
  select count(*) into v_count from public.vacation_employees e
    where e.data->>'year' = v_year
      and lower(split_part(btrim(e.data->>'name'), ' ', 1)) = v_key;
  if v_count <> 1 then return null; end if;
  return v_key;
end;
$$;

create or replace function private.work_time_set_employee_pin(p_employee_id text, p_pin text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_key text;
begin
  if not public.is_satis_owner() then
    return jsonb_build_object('ok', false, 'message', 'Tylko SATIS może ustawić PIN.');
  end if;
  v_key := private.work_time_employee_key(p_employee_id);
  if v_key is null or p_pin is null or p_pin !~ '^[0-9]{6}$'
    or p_pin = repeat(left(p_pin, 1), 6) or p_pin in ('123456', '654321') then
    return jsonb_build_object('ok', false, 'message', 'Wybierz pracownika i podaj 6 cyfr PIN-u bez prostego ciągu.');
  end if;
  insert into private.work_time_employee_pins(employee_key, pin_hash, failed_attempts, locked_until, changed_at, changed_by)
    values (v_key, extensions.crypt(p_pin, extensions.gen_salt('bf', 12)), 0, null, now(), auth.uid())
    on conflict (employee_key) do update set pin_hash = excluded.pin_hash, failed_attempts = 0,
      locked_until = null, changed_at = now(), changed_by = auth.uid();
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function private.work_time_verify_pin(p_employee_id text, p_pin text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_key text; v_row private.work_time_employee_pins%rowtype; v_attempts integer;
begin
  if not public.is_satis_app_user() then return false; end if;
  v_key := private.work_time_employee_key(p_employee_id);
  if v_key is null or p_pin is null or p_pin !~ '^[0-9]{6}$' then return false; end if;
  select * into v_row from private.work_time_employee_pins where employee_key = v_key for update;
  if not found or v_row.locked_until > now() then return false; end if;
  if v_row.pin_hash = extensions.crypt(p_pin, v_row.pin_hash) then
    update private.work_time_employee_pins set failed_attempts = 0, locked_until = null where employee_key = v_key;
    return true;
  end if;
  v_attempts := v_row.failed_attempts + 1;
  update private.work_time_employee_pins set failed_attempts = case when v_attempts >= 5 then 0 else v_attempts end,
    locked_until = case when v_attempts >= 5 then now() + interval '15 minutes' else null end
    where employee_key = v_key;
  return false;
end;
$$;

create or replace function private.work_time_read_person(p_employee_id text, p_pin text, p_month date)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_records jsonb; v_schedules jsonb;
begin
  if p_month is null or extract(day from p_month) <> 1 then
    return jsonb_build_object('ok', false, 'message', 'Wybierz miesiąc.');
  end if;
  if not private.work_time_verify_pin(p_employee_id, p_pin) then
    return jsonb_build_object('ok', false, 'message', 'Nieprawidłowy PIN lub czasowa blokada.');
  end if;
  select coalesce(jsonb_agg(to_jsonb(r) - 'updated_by' order by r.work_date desc), '[]'::jsonb)
    into v_records from public.work_time_records r
    where r.employee_id = p_employee_id and r.work_date >= p_month
      and r.work_date < (p_month + interval '1 month')::date
      and r.payload->>'deletedAt' is null;
  select coalesce(data->'workSchedules', '[]'::jsonb) into v_schedules
    from public.vacation_employees where id = p_employee_id;
  return jsonb_build_object('ok', true, 'records', v_records, 'schedules', v_schedules);
end;
$$;

create or replace function private.work_time_schedule_for_date(p_employee_id text, p_date date)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_schedules jsonb; v_version jsonb; v_day jsonb;
begin
  select data->'workSchedules' into v_schedules from public.vacation_employees where id = p_employee_id;
  if jsonb_typeof(v_schedules) is distinct from 'array' then return null; end if;
  select value into v_version from jsonb_array_elements(v_schedules)
    where value->>'from' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
      and value->>'from' <= to_char(p_date, 'YYYY-MM-DD')
    order by value->>'from' desc limit 1;
  if v_version is null then return null; end if;
  v_day := v_version->'days'->(extract(isodow from p_date)::integer::text);
  if public.vacation_is_holiday(p_date) then v_day := null; end if;
  return jsonb_build_object('validFrom', v_version->>'from',
    'off', v_day is null or v_day = 'null'::jsonb,
    'start', coalesce(v_day->>'start', ''), 'end', coalesce(v_day->>'end', ''));
end;
$$;

create or replace function private.work_time_write_person(p_employee_id text, p_pin text,
  p_work_date date, p_start text, p_end text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_employee record; v_existing public.work_time_records%rowtype;
  v_minutes integer; v_payload jsonb; v_rows integer;
begin
  if p_work_date is null or p_work_date <> (now() at time zone 'Europe/Warsaw')::date then
    return jsonb_build_object('ok', false, 'message', 'Pracownik zapisuje tylko bieżący dzień. Starsze wpisy poprawia SATIS.');
  end if;
  if not private.work_time_verify_pin(p_employee_id, p_pin) then
    return jsonb_build_object('ok', false, 'message', 'Nieprawidłowy PIN lub czasowa blokada.');
  end if;
  select data->>'name' as name, (data->>'year')::integer as year into v_employee
    from public.vacation_employees where id = p_employee_id;
  if not found or v_employee.year <> extract(year from p_work_date) then
    return jsonb_build_object('ok', false, 'message', 'Pracownik nie jest przypisany do tego roku.');
  end if;
  if p_start is null or p_start !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' or
    (coalesce(p_end, '') <> '' and p_end !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$') then
    return jsonb_build_object('ok', false, 'message', 'Podaj poprawne godziny pracy.');
  end if;
  select * into v_existing from public.work_time_records
    where employee_id = p_employee_id and work_date = p_work_date for update;
  if found and (v_existing.payload->>'deletedAt' is not null or coalesce(v_existing.payload->>'end', '') <> '') then
    return jsonb_build_object('ok', false, 'message', 'Dzień został już zakończony. Korektę może zrobić SATIS.');
  end if;
  if coalesce(p_end, '') <> '' then
    if not found or v_existing.payload->>'start' <> p_start then
      return jsonb_build_object('ok', false, 'message', 'Najpierw zapisz rozpoczęcie pracy.');
    end if;
    v_minutes := (split_part(p_end, ':', 1)::integer * 60 + split_part(p_end, ':', 2)::integer)
      - (split_part(p_start, ':', 1)::integer * 60 + split_part(p_start, ':', 2)::integer);
    if v_minutes <= 0 or v_minutes > 1440 then
      return jsonb_build_object('ok', false, 'message', 'Godzina końca musi być późniejsza od początku.');
    end if;
  else
    v_minutes := 0;
  end if;
  v_payload := jsonb_build_object('kind', 'WORK', 'start', p_start, 'end', coalesce(p_end, ''),
    'workMinutes', v_minutes, 'hours', v_minutes::numeric / 60, 'overtime', 0,
    'schedule', case when jsonb_typeof(v_existing.payload->'schedule') = 'object' then v_existing.payload->'schedule'
      else private.work_time_schedule_for_date(p_employee_id, p_work_date) end);
  insert into public.work_time_records(employee_id, employee_name, work_date, payload, updated_by)
    values (p_employee_id, v_employee.name, p_work_date, v_payload, auth.uid())
    on conflict (employee_id, work_date) do update set payload = excluded.payload,
      employee_name = excluded.employee_name, updated_by = auth.uid()
      where coalesce(public.work_time_records.payload->>'end', '') = ''
        and public.work_time_records.payload->>'deletedAt' is null;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    return jsonb_build_object('ok', false, 'message', 'Dzień został już zamknięty. Korektę może zrobić SATIS.');
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.work_time_set_employee_pin(p_employee_id text, p_pin text)
returns jsonb language sql security invoker set search_path = '' as $$
  select private.work_time_set_employee_pin(p_employee_id, p_pin);
$$;
create or replace function public.work_time_read_person(p_employee_id text, p_pin text, p_month date)
returns jsonb language sql security invoker set search_path = '' as $$
  select private.work_time_read_person(p_employee_id, p_pin, p_month);
$$;
create or replace function public.work_time_write_person(p_employee_id text, p_pin text,
  p_work_date date, p_start text, p_end text default null)
returns jsonb language sql security invoker set search_path = '' as $$
  select private.work_time_write_person(p_employee_id, p_pin, p_work_date, p_start, p_end);
$$;

revoke all on function private.work_time_employee_key(text), private.work_time_set_employee_pin(text,text),
  private.work_time_verify_pin(text,text), private.work_time_read_person(text,text,date),
  private.work_time_write_person(text,text,date,text,text),
  public.work_time_set_employee_pin(text,text), public.work_time_read_person(text,text,date),
  public.work_time_write_person(text,text,date,text,text) from public, anon;
revoke all on function private.work_time_schedule_for_date(text,date) from public, anon, authenticated;
grant execute on function private.work_time_set_employee_pin(text,text),
  private.work_time_read_person(text,text,date), private.work_time_write_person(text,text,date,text,text),
  public.work_time_set_employee_pin(text,text), public.work_time_read_person(text,text,date),
  public.work_time_write_person(text,text,date,text,text) to authenticated;

commit;
