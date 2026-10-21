-- Weekend work: one Saturday/Sunday or a Saturday-Sunday range.
-- Run AFTER supabase-audit-vacation.sql. Existing shared-account submission stays enabled.
-- Does not change historical vacation requests or employee allowances.
begin;
do $$ begin
  if to_regprocedure('public.vacation_guard_request()') is null then
    raise exception 'Install vacation audit migration first.';
  end if;
end $$;

create or replace function public.vacation_duplicate_keys(d jsonb)
returns text[] language plpgsql immutable set search_path = pg_catalog as $$
declare keys text[]; source_date text; source_end text;
begin
  if d->>'status' = 'ODRZUCONY' then return '{}'; end if;
  keys := array[jsonb_build_array('period', d->>'employeeId', d->>'type', d->>'dateFrom', d->>'dateTo')::text];
  source_date := case when d->>'type' = 'ZA SOBOTĘ' then d->>'saturdayDate'
    when d->>'type' = 'ZA WEEKEND' then d->>'compensationDate' end;
  if nullif(source_date, '') is not null then
    keys := array_append(keys, jsonb_build_array('compensation', d->>'employeeId', source_date)::text);
    source_end := nullif(d->>'compensationDateTo','');
    if d->>'type' = 'ZA WEEKEND' and source_end is not null and source_end <> source_date then
      if source_end::date <> source_date::date + 1 then
        raise exception 'Invalid weekend range' using errcode = '23514';
      end if;
      keys := array_append(keys, jsonb_build_array('compensation', d->>'employeeId', source_end)::text);
    end if;
  end if;
  return keys;
end;
$$;

create or replace function public.vacation_guard_request()
returns trigger language plpgsql security definer set search_path = pg_catalog as $$
declare e jsonb; d jsonb := new.data; kind text := d->>'type'; from_day date; to_day date;
  hours numeric; max_hours numeric; days integer; compensation numeric; source_day date; source_end date;
  uses_hours boolean; k text; claimed text;
begin
  if not public.is_satis_app_user() then raise exception 'Vacation access denied' using errcode = '42501'; end if;
  select data into e from public.vacation_employees where id = d->>'employeeId' for key share;
  if e is null then raise exception 'Unknown vacation employee' using errcode = '23514'; end if;
  if not public.is_satis_owner() then
    if tg_op <> 'INSERT' or not public.vacation_is_my_employee(d->>'employeeId')
      or d->>'status' is distinct from 'OCZEKUJE'
      or coalesce(d->>'ownerLeave','false') in ('true','1') then
      raise exception 'Personal employee mapping required; staff may only submit own pending requests' using errcode = '42501';
    end if;
    d := d || jsonb_build_object('ownerLeave', false, 'decidedAt', '', 'decidedBy', '',
      'weekendReviewAcknowledged', false, 'weekendAccountingVersion', 1);
  end if;
  if kind is null or kind not in ('WYPOCZYNKOWY','NA ŻĄDANIE','ZA SOBOTĘ','ZA WEEKEND','NADGODZINY','WCZEŚNIEJSZE WYJŚCIE','INNY')
    or d->>'status' is null or d->>'status' not in ('OCZEKUJE','ZATWIERDZONY','ODRZUCONY') then
    raise exception 'Invalid vacation type or status' using errcode = '23514';
  end if;
  from_day := (d->>'dateFrom')::date; to_day := (d->>'dateTo')::date;
  if from_day is null or to_day is null or to_day < from_day
    or to_char(from_day,'YYYY-MM-DD') <> d->>'dateFrom' or to_char(to_day,'YYYY-MM-DD') <> d->>'dateTo'
    or extract(year from from_day) <> extract(year from to_day)
    or extract(year from from_day)::text is distinct from e->>'year' then
    raise exception 'Invalid vacation dates/year' using errcode = '23514';
  end if;
  days := public.vacation_working_days(from_day, to_day);
  uses_hours := public.vacation_employee_uses_hours(e) or kind in ('NADGODZINY','WCZEŚNIEJSZE WYJŚCIE');
  hours := coalesce((d->>'hours')::numeric,0);
  max_hours := case when kind = 'NADGODZINY' then 16 when kind = 'WCZEŚNIEJSZE WYJŚCIE' then 8 else least(200, days*8) end;
  -- Rejection can resolve invalid legacy records; new/active records must pass.
  if d->>'status' <> 'ODRZUCONY' then
    if public.vacation_is_holiday(from_day) or public.vacation_is_holiday(to_day) then
      raise exception 'Vacation endpoint is a public holiday' using errcode = '23514';
    end if;
    if kind in ('NADGODZINY','WCZEŚNIEJSZE WYJŚCIE','ZA SOBOTĘ') and from_day <> to_day then
      raise exception 'Time reports and Saturday leave require a single day' using errcode = '23514';
    end if;
    if uses_hours and (hours < 0.5 or hours > max_hours or mod(hours,0.5) <> 0 or hours::text = 'NaN') then
      raise exception 'Invalid vacation hours (max %)', max_hours using errcode = '23514';
    end if;
    if kind not in ('NADGODZINY','WCZEŚNIEJSZE WYJŚCIE') and days < 1 then
      raise exception 'Vacation requires a working day' using errcode = '23514';
    end if;
    if kind = 'ZA SOBOTĘ' then
      source_day := (d->>'saturdayDate')::date;
      if source_day is null or extract(isodow from source_day) <> 6 or not public.vacation_is_holiday(source_day)
        or extract(year from source_day) <> extract(year from from_day) then
        raise exception 'Choose a Saturday public holiday in this year' using errcode = '23514';
      end if;
    elsif kind = 'ZA WEEKEND' then
      source_day := (d->>'compensationDate')::date;
      source_end := coalesce(nullif(d->>'compensationDateTo','')::date, source_day);
      compensation := (d->>'compensationAmount')::numeric;
      if source_day is null or source_end is null or source_end < source_day or source_end - source_day > 1
        or extract(isodow from source_day) not in (6,7) or extract(isodow from source_end) not in (6,7)
        or source_end >= from_day
        or compensation is null or compensation <= 0
        or compensation > (source_end - source_day + 1) * (case when uses_hours then 8 else 1 end)
        or compensation <> (case when uses_hours then hours else days end) then
        raise exception 'Choose one weekend day or Saturday-Sunday; exact compensated days/hours required' using errcode = '23514';
      end if;
    end if;
  end if;
  d := d || jsonb_build_object('id', new.id, 'employeeName', e->>'name', 'year', extract(year from from_day)::integer,
    'days', case when kind in ('NADGODZINY','WCZEŚNIEJSZE WYJŚCIE') then 0 else days end,
    'hours', case when uses_hours then hours else 0 end, 'redacted', false,
    'saturdayDate', case when kind = 'ZA SOBOTĘ' then to_char((d->>'saturdayDate')::date,'YYYY-MM-DD') else '' end,
    'compensationDate', case when kind = 'ZA WEEKEND' then to_char((d->>'compensationDate')::date,'YYYY-MM-DD') else '' end,
    'compensationDateTo', case when kind = 'ZA WEEKEND' then to_char(coalesce(nullif(d->>'compensationDateTo','')::date, (d->>'compensationDate')::date),'YYYY-MM-DD') else '' end,
    'compensationAmount', case when kind = 'ZA WEEKEND' then coalesce((d->>'compensationAmount')::numeric,0) else 0 end);
  if tg_op = 'INSERT' then
    d := d || jsonb_build_object('requestedBy', coalesce(auth.jwt()->>'email',''), 'requestedAt', now(), 'weekendAccountingVersion', 1);
  else
    d := d || jsonb_build_object('requestedBy', old.data->>'requestedBy', 'requestedAt', old.data->>'requestedAt');
  end if;
  new.data := d;
  foreach k in array public.vacation_duplicate_keys(d) loop
    claimed := null;
    insert into public.vacation_request_keys as existing(key, request_id) values (k, new.id)
      on conflict(key) do update set request_id = existing.request_id where existing.request_id = excluded.request_id
      returning request_id into claimed;
    if claimed is null then raise exception 'Duplikat wniosku: sprawdz istniejacy wpis.' using errcode = '23505'; end if;
  end loop;
  return new;
end;
$$;

revoke all on function public.vacation_guard_request(), public.vacation_duplicate_keys(jsonb) from public, anon, authenticated;
notify pgrst, 'reload schema';
commit;
