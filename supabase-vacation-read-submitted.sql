-- Keep shared-account submissions visible after refresh, without revealing private details.
-- Run after supabase-audit-vacation.sql. No request data or write permissions change.
-- Also excludes legacy L4 notes from annual leave balances; safe to run again.
begin;

create or replace function public.vacation_read_authorized()
returns jsonb language plpgsql stable security definer set search_path = pg_catalog as $$
declare is_owner boolean; employees jsonb; requests jsonb; employee_ids jsonb;
begin
  if not public.is_satis_app_user() then raise exception 'Vacation access denied' using errcode = '42501'; end if;
  is_owner := public.is_satis_owner();
  select coalesce(jsonb_agg(a.employee_id), '[]') into employee_ids
    from public.vacation_employee_accounts a where a.user_id = auth.uid();
  select coalesce(jsonb_agg(jsonb_build_object('id', e.id,
    'revision', case when is_owner then e.revision else null end,
    'data', case when is_owner then e.data else jsonb_build_object(
      'id', e.id, 'name', e.data->>'name', 'year', e.data->'year',
      'unit', case when public.vacation_employee_uses_hours(e.data) then 'HOURS' else 'DAYS' end,
      'workstation', e.data->>'workstation', 'redacted', true,
      'remaining', greatest(0, least(case when public.vacation_employee_uses_hours(e.data) then 300 else 40 end,
        greatest(0, coalesce((e.data->>'allowance')::numeric, 0)) * case
          when public.vacation_employee_uses_hours(e.data)
            and (upper(coalesce(e.data->>'unit','')) not in ('HOURS','GODZINY','GODZ.')
              or (lower(coalesce(e.data->>'name','')) like '%justyna waliczek%'
                and coalesce((e.data->>'allowance')::numeric,0) = 10)) then 8 else 1 end)
        - coalesce((select sum(case when public.vacation_employee_uses_hours(e.data)
          then coalesce((r.data->>'hours')::numeric, 0)
          else public.vacation_working_days((r.data->>'dateFrom')::date, (r.data->>'dateTo')::date) end)
          from public.vacation_requests r where r.data->>'employeeId' = e.id
            and r.data->>'year' = e.data->>'year' and r.data->>'status' = 'ZATWIERDZONY'
            and r.data->>'type' in ('WYPOCZYNKOWY', 'NA ŻĄDANIE')
            and not (
              regexp_replace(upper(coalesce(r.data->>'notes', '')), '\s+', ' ', 'g')
                ~ '\mL[ -]?4\M|\mZWOLNIENIE LEKARSKIE\M|\mCHOROBOWE\M'
              and regexp_replace(upper(coalesce(r.data->>'notes', '')), '\s+', ' ', 'g')
                !~ '\m(BEZ|BRAK|NIE) (L[ -]?4\M|ZWOLNIENIE LEKARSKIE\M|CHOROBOWE\M)'
            )
            and coalesce(r.data->>'ownerLeave','false') not in ('true','1')), 0))
    ) end) order by e.id), '[]') into employees from public.vacation_employees e
    where is_owner or not exists (select 1 from public.vacation_requests r where r.data->>'employeeId' = e.id
      and coalesce(r.data->>'ownerLeave','false') in ('true','1'));
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
