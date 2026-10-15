-- Shared gabinet account: submit a pending request for the selected employee, without a PIN.
-- Run after supabase-audit-vacation.sql. No historical requests or account mappings change.
begin;

do $$ begin
  if to_regprocedure('public.vacation_is_my_employee(text)') is null
    or to_regprocedure('public.satis_write_records(uuid,jsonb,text)') is null then
    raise exception 'Install vacation audit and core migrations first.';
  end if;
end $$;

create schema if not exists private;
create table if not exists private.vacation_submission_grants (
  transaction_id bigint primary key,
  backend_id integer not null,
  user_id uuid not null,
  employee_id text not null
);
revoke all on private.vacation_submission_grants from public, anon, authenticated;

create or replace function public.vacation_is_my_employee(employee_id text)
returns boolean language sql stable security definer set search_path = pg_catalog as $$
  select public.is_satis_app_user() and (
    exists (select 1 from public.vacation_employee_accounts a
      where a.employee_id = $1 and a.user_id = auth.uid())
    or exists (select 1 from private.vacation_submission_grants g
      where g.transaction_id = txid_current() and g.backend_id = pg_backend_pid()
        and g.user_id = auth.uid() and g.employee_id = $1)
  );
$$;
revoke all on function public.vacation_is_my_employee(text) from public, anon;
grant execute on function public.vacation_is_my_employee(text) to authenticated;

create or replace function public.vacation_submit_shared(
  p_operation uuid, p_request jsonb, p_workstation text default '')
returns jsonb language plpgsql security definer set search_path = pg_catalog as $$
declare
  employee_id text := p_request->>'employeeId';
  request_id text := p_request->>'id';
  receipt jsonb;
begin
  if auth.uid() is null or not public.is_satis_app_user() then
    raise exception 'SATIS access denied' using errcode = '42501';
  end if;
  if jsonb_typeof(p_request) is distinct from 'object' or p_operation is null
    or coalesce(length(employee_id), 0) not between 1 and 512
    or coalesce(length(request_id), 0) not between 1 and 512 then
    raise exception 'Invalid vacation request' using errcode = '22023';
  end if;
  if not exists (select 1 from public.vacation_employees e where e.id = employee_id)
    or (not public.is_satis_owner() and exists (
      select 1 from public.vacation_requests r where r.data->>'employeeId' = employee_id
        and coalesce(r.data->>'ownerLeave', 'false') in ('true', '1'))) then
    raise exception 'Employee unavailable' using errcode = '42501';
  end if;
  p_request := p_request || jsonb_build_object('status', 'OCZEKUJE', 'ownerLeave', false,
    'decidedAt', '', 'decidedBy', '', 'weekendReviewAcknowledged', false, 'weekendAccountingVersion', 1);
  insert into private.vacation_submission_grants
    values (txid_current(), pg_backend_pid(), auth.uid(), employee_id);
  -- Existing CAS, date/holiday checks, duplicate guard and audit remain authoritative.
  receipt := public.satis_write_records(p_operation, jsonb_build_array(jsonb_build_object(
    'table', 'vacation_requests', 'id', request_id, 'data', p_request,
    'expectedRevision', null, 'delete', false)), p_workstation);
  delete from private.vacation_submission_grants where transaction_id = txid_current();
  return jsonb_build_object('ok', true, 'receipt', receipt);
end;
$$;
revoke all on function public.vacation_submit_shared(uuid,jsonb,text) from public, anon;
grant execute on function public.vacation_submit_shared(uuid,jsonb,text) to authenticated;
notify pgrst, 'reload schema';
commit;
