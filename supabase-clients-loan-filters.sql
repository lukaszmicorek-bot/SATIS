-- SATIS only. Read-only search over explicitly linked contracts; no records are changed.
-- Run after supabase-clients-audit.sql.
begin;

create or replace function public.satis_clients_follow_up_search(
  p_query text default '', p_offset integer default 0, p_archived boolean default false,
  p_location text default '', p_source_names text[] default '{}', p_filter text default '',
  p_decision text default '', p_nfz text default '')
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
  perform public.satis_clients_audit_owner();
  if p_query is null or length(p_query)>160 or p_offset is null or p_offset not between 0 and 100000
    or p_archived is null or p_location is null or p_location not in ('','T12','P50','P63')
    or p_source_names is null or cardinality(p_source_names)>2000
    or exists(select 1 from unnest(p_source_names) n where n is null or length(n)>160)
    or p_filter is null or p_filter not in ('','ALL','CONTACT','NFZ','VISIT','PICKUP','OVERDUE')
    or p_decision is null or p_decision not in ('','DECIDED','DECLINED','NONE')
    or p_nfz is null or p_nfz not in ('','WAITING','READY','NONE') then
    raise exception 'Invalid query' using errcode='22023';
  end if;
  with matches as materialized (
    select p.id,p.full_name,p.phone,p.location,p.archived,p.revision,p.updated_at,
      state.purchase_decision,state.nfz_status
    from public.customer_profiles p
    left join lateral (
      select c.data
      from public.customer_source_links l join public.loan_contracts c on c.id=l.source_id
      where l.customer_id=p.id and l.source_type='loan'
      order by coalesce(nullif(public.satis_clients_audit_day(c.data->>'periodFrom'),''),nullif(public.satis_clients_audit_day(c.data->>'date'),'')) desc nulls last,
        nullif(public.satis_clients_audit_day(c.data->>'date'),'') desc nulls last,c.updated_at desc,c.id desc
      limit 1
    ) loan on true
    cross join lateral (
      select case when loan.data#>>'{followUp,purchaseDecision}' in ('DECIDED','DECLINED')
        then loan.data#>>'{followUp,purchaseDecision}' else '' end as purchase_decision,
        case when loan.data#>>'{followUp,nfzStatus}' in ('WAITING','READY')
        then loan.data#>>'{followUp,nfzStatus}' else '' end as nfz_status
    ) state
    where p.archived=p_archived and (p_location='' or p.location=p_location)
      and public.satis_clients_audit_filter(p.id,p_filter)
      and (p_query='' or position(lower(p_query) in lower(p.full_name||' '||p.phone))>0
        or lower(btrim(p.full_name)) in(select lower(btrim(n)) from unnest(p_source_names) n))
      and (p_decision='' or state.purchase_decision=case when p_decision='NONE' then '' else p_decision end)
      and (p_nfz='' or state.nfz_status=case when p_nfz='NONE' then '' else p_nfz end)
  )
  select jsonb_build_object('total',(select count(*) from matches),'profiles',coalesce((
    select jsonb_agg(to_jsonb(page)) from (
      select * from matches order by updated_at desc,id limit 100 offset p_offset
    ) page
  ),'[]'::jsonb)) into result;
  return result;
end $$;

revoke all on function public.satis_clients_follow_up_search(text,integer,boolean,text,text[],text,text,text) from public,anon;
grant execute on function public.satis_clients_follow_up_search(text,integer,boolean,text,text[],text,text,text) to authenticated;
notify pgrst,'reload schema';
commit;
