-- Run after supabase-clients-audit.sql. No new tables or source-document changes.
begin;

do $$ begin
  if to_regprocedure('public.satis_clients_audit_save_followup_base(uuid,bigint,jsonb)') is null then
    alter function public.satis_clients_audit_save(uuid,bigint,jsonb) rename to satis_clients_audit_save_followup_base;
  end if;
end $$;
revoke all on function public.satis_clients_audit_save_followup_base(uuid,bigint,jsonb) from public,anon,authenticated;

create or replace function public.satis_clients_audit_save(p_customer_id uuid,p_expected_revision bigint,p_data jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare follow jsonb; result jsonb; item jsonb; contact date;
begin
  perform public.satis_clients_audit_owner();
  if p_data ? 'follow_up' then
    follow:=p_data->'follow_up';
    if jsonb_typeof(follow) is distinct from 'object'
      or follow-array['loan_id','contact_on']<>'{}'::jsonb
      or not(follow ?& array['loan_id','contact_on'])
      or jsonb_typeof(follow->'loan_id') is distinct from 'string'
      or length(follow->>'loan_id') not between 1 and 512
      or jsonb_typeof(follow->'contact_on') is distinct from 'string'
      or follow->>'contact_on' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
      raise exception 'Sprawdz termin ponownego kontaktu.' using errcode='22023';
    end if;
    contact:=(follow->>'contact_on')::date;
    if contact not between date '1900-01-01' and date '2100-12-31'
      or not exists(select 1 from public.customer_source_links where customer_id=p_customer_id
        and source_type='loan' and source_id=follow->>'loan_id') then
      raise exception 'Umowa nie jest powiazana z ta osoba lub termin jest nieprawidlowy.' using errcode='22023';
    end if;
  end if;
  -- Preserve existing validation, revisions, case isolation and atomic reservations.
  result:=public.satis_clients_audit_save_followup_base(p_customer_id,p_expected_revision,p_data-'follow_up');
  if p_data ? 'follow_up' then
    update public.customer_journeys set data=data||jsonb_build_object('follow_up',follow)
      where case_id=(result#>>'{journey,case_id}')::uuid returning to_jsonb(customer_journeys) into item;
    update public.customer_journey_events set data=data||jsonb_build_object('follow_up',follow)
      where id=(result->>'event_id')::bigint and customer_id=p_customer_id;
    result:=jsonb_set(result,'{journey}',item);
  end if;
  return result;
end $$;
revoke all on function public.satis_clients_audit_save(uuid,bigint,jsonb) from public,anon,authenticated;

do $$ begin
  if to_regprocedure('public.satis_client_journey_case_read_followup_base(uuid,uuid)') is null then
    alter function public.satis_client_journey_case_read(uuid,uuid) rename to satis_client_journey_case_read_followup_base;
  end if;
end $$;
revoke all on function public.satis_client_journey_case_read_followup_base(uuid,uuid) from public,anon,authenticated;
create or replace function public.satis_client_journey_case_read(p_customer_id uuid,p_case_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb; previous_consent boolean;
begin
  perform public.satis_clients_audit_owner();
  result:=public.satis_client_journey_case_read_followup_base(p_customer_id,p_case_id);
  select exists(select 1 from public.customer_journeys where customer_id=p_customer_id
    and case_id is distinct from (result#>>'{journey,case_id}')::uuid
    and data#>'{confirmations,rodo}'='true'::jsonb) into previous_consent;
  return result||jsonb_build_object('follow_up_support',true,'rodo_confirmed_elsewhere',previous_consent);
end $$;
revoke all on function public.satis_client_journey_case_read(uuid,uuid) from public,anon;
grant execute on function public.satis_client_journey_case_read(uuid,uuid) to authenticated;
notify pgrst,'reload schema';
commit;
