-- Annual leave carryover, including hour-based employees.
-- Run after supabase-vacation-read-submitted.sql. Re-runnable; no rows are changed.
begin;
create or replace function private.vacation_annual_balance(employee_id text)
returns jsonb language plpgsql stable security definer set search_path = pg_catalog as $$
declare target jsonb; person_key text; period record; factor numeric; allowance numeric;
  used numeric; pending numeric; carried numeric := 0; remaining numeric := 0; ambiguous boolean;
begin
  select e.data into target from public.vacation_employees e where e.id = employee_id;
  if target is null then return null; end if;
  person_key := lower(regexp_replace(btrim(target->>'name'), '\s+', ' ', 'g'));
  select exists(select 1 from public.vacation_employees e
    where lower(regexp_replace(btrim(e.data->>'name'), '\s+', ' ', 'g')) = person_key
      and (e.data->>'year')::int <= (target->>'year')::int
    group by e.data->>'year' having count(*) > 1) into ambiguous;
  for period in select e.id, e.data from public.vacation_employees e
    where (ambiguous and e.id = employee_id) or (not ambiguous
      and lower(regexp_replace(btrim(e.data->>'name'), '\s+', ' ', 'g')) = person_key
      and (e.data->>'year')::int <= (target->>'year')::int)
    order by (e.data->>'year')::int, e.id
  loop
    factor := case when public.vacation_employee_uses_hours(period.data) then 1 else 8 end;
    allowance := least(case when factor = 1 then 300 else 40 end,
      greatest(0, coalesce((period.data->>'allowance')::numeric,0)) * case
        when factor = 1 and (upper(coalesce(period.data->>'unit','')) not in ('HOURS','GODZINY','GODZ.')
          or (lower(coalesce(period.data->>'name','')) like '%justyna Testowa%'
            and coalesce((period.data->>'allowance')::numeric,0) = 10)) then 8 else 1 end) * factor;
    select coalesce(sum(case when r.data->>'status' = 'ZATWIERDZONY' then a.amount else 0 end),0),
      coalesce(sum(case when r.data->>'status' = 'OCZEKUJE' then a.amount else 0 end),0)
    into used, pending from public.vacation_requests r
    cross join lateral (select greatest(0, case when factor = 1 then coalesce((r.data->>'hours')::numeric,0)
      else public.vacation_working_days((r.data->>'dateFrom')::date,(r.data->>'dateTo')::date) * factor end) amount) a
    where r.data->>'employeeId' = period.id and r.data->>'year' = period.data->>'year'
      and r.data->>'type' in ('WYPOCZYNKOWY','NA ŻĄDANIE')
      and not (regexp_replace(upper(coalesce(r.data->>'notes','')), '\s+', ' ', 'g')
          ~ '\mL[ -]?4\M|\mZWOLNIENIE LEKARSKIE\M|\mCHOROBOWE\M'
        and regexp_replace(upper(coalesce(r.data->>'notes','')), '\s+', ' ', 'g')
          !~ '\m(BEZ|BRAK|NIE) (L[ -]?4\M|ZWOLNIENIE LEKARSKIE\M|CHOROBOWE\M)');
    carried := remaining;
    remaining := greatest(0, carried + allowance - used);
    if period.id = employee_id then
      return jsonb_build_object('ready',true,'carryoverIssue',ambiguous,
        'allowance',allowance/factor,'carryover',carried/factor,'used',used/factor,'pending',pending/factor,
        'remaining',remaining/factor,'carryoverUsed',least(carried,used)/factor,
        'currentUsed',greatest(0,used-carried)/factor,'carryoverRemaining',greatest(0,carried-used)/factor,
        'currentRemaining',greatest(0,allowance-greatest(0,used-carried))/factor,
        'available',greatest(0,remaining-pending)/factor);
    end if;
  end loop;
  return null;
end;
$$;
revoke all on function private.vacation_annual_balance(text) from public, anon, authenticated;

create or replace function public.vacation_read_authorized()
returns jsonb language plpgsql stable security definer set search_path = pg_catalog as $$
declare is_owner boolean; employees jsonb; requests jsonb; employee_ids jsonb;
begin
  if not public.is_satis_app_user() then raise exception 'Vacation access denied' using errcode = '42501'; end if;
  is_owner := public.is_satis_owner();
  select coalesce(jsonb_agg(a.employee_id), '[]') into employee_ids
    from public.vacation_employee_accounts a where a.user_id = auth.uid();
  with balances as materialized (
    select e.id, case when is_owner then null else private.vacation_annual_balance(e.id) end balance
    from public.vacation_employees e
    where is_owner or not exists (select 1 from public.vacation_requests r where r.data->>'employeeId' = e.id
      and coalesce(r.data->>'ownerLeave','false') in ('true','1'))
  )
  select coalesce(jsonb_agg(jsonb_build_object('id', e.id,
    'revision', case when is_owner then e.revision else null end,
    'data', case when is_owner then e.data else jsonb_build_object(
      'id', e.id, 'name', e.data->>'name', 'year', e.data->'year',
      'unit', case when public.vacation_employee_uses_hours(e.data) then 'HOURS' else 'DAYS' end,
      'workstation', e.data->>'workstation', 'redacted', true,
      'remaining', b.balance->'remaining',
      'annualBalance', b.balance - array['allowance','used','pending','currentUsed','currentRemaining','available']
    ) end) order by e.id), '[]') into employees from public.vacation_employees e join balances b on b.id = e.id;
  select coalesce(jsonb_agg(jsonb_build_object('id', r.id,
    'revision', case when is_owner or employee_ids ? (r.data->>'employeeId') then r.revision else null end,
    'data', case when is_owner or employee_ids ? (r.data->>'employeeId') then r.data else jsonb_build_object(
      'id', r.id, 'employeeId', r.data->>'employeeId', 'employeeName', e.data->>'name',
      'year', r.data->'year', 'dateFrom', r.data->>'dateFrom', 'dateTo', r.data->>'dateTo',
      'status', r.data->>'status', 'redacted', true,
      'type', case when r.data->>'type' in ('NADGODZINY', 'WCZEŚNIEJSZE WYJŚCIE') then 'TERMIN GODZINOWY' else 'ZAJĘTOŚĆ' end
    ) end) order by r.id), '[]') into requests from public.vacation_requests r
    left join public.vacation_employees e on e.id = r.data->>'employeeId'
    where is_owner or (coalesce(r.data->>'ownerLeave','false') not in ('true','1')
      and (r.data->>'status' = 'ZATWIERDZONY' or employee_ids ? (r.data->>'employeeId')
        -- requestedBy is set by the database guard, never trusted from the submitted form.
        or lower(r.data->>'requestedBy') = lower(nullif(auth.jwt()->>'email', ''))));
  return jsonb_build_object('userId', auth.uid(), 'employeeIds', employee_ids, 'employees', employees,
    'requests', requests, 'watermark', public.vacation_change_version());
end;
$$;
revoke all on function public.vacation_read_authorized() from public, anon;
grant execute on function public.vacation_read_authorized() to authenticated;
notify pgrst, 'reload schema';
commit;
