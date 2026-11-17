-- Clients audit upgrade. Run AFTER existing clients, journey and audit-core SQL.
-- Schedule is optional; its existing writer wrapper is preserved.
-- Legacy RPC signatures stay unchanged. New cases require case_id + source_keys.
-- No date-based source inference is performed for explicit cases.
begin;

alter table public.customer_journeys add column if not exists case_id uuid not null default gen_random_uuid();
alter table public.customer_journeys add column if not exists archived boolean not null default false;
alter table public.customer_journeys add column if not exists legacy_matching boolean not null default true;
do $$ begin
  if exists(select 1 from pg_constraint where conrelid='public.customer_journeys'::regclass
    and contype='p' and conkey=array[(select attnum from pg_attribute where attrelid='public.customer_journeys'::regclass and attname='customer_id')]) then
    alter table public.customer_journeys drop constraint customer_journeys_pkey;
    alter table public.customer_journeys add primary key(case_id);
  end if;
end $$;
create unique index if not exists customer_journeys_current_idx on public.customer_journeys(customer_id) where not archived;
create index if not exists customer_journeys_customer_idx on public.customer_journeys(customer_id,updated_at desc);
alter table public.customer_journey_events add column if not exists case_id uuid;
update public.customer_journey_events e set case_id=j.case_id from public.customer_journeys j
  where e.customer_id=j.customer_id and e.case_id is null;
alter table public.customer_journey_events alter column case_id set not null;
create index if not exists customer_journey_events_case_idx on public.customer_journey_events(case_id,id desc);

alter table public.customer_write_requests add column if not exists customer_id uuid;
alter table public.customer_write_requests add column if not exists created_at timestamptz not null default clock_timestamp();
update public.customer_write_requests r set customer_id=p.id from public.customer_profiles p
  where r.customer_id is null and (r.result->>'id'=p.id::text or r.result#>>'{journey,customer_id}'=p.id::text
    or exists(select 1 from public.customer_activities a where a.customer_id=p.id and a.id::text=r.result->>'id'));
-- Convert old journey receipts to event references, never another copy of the data.
update public.customer_write_requests r set result=jsonb_build_object('journey_meta',
  ((r.result->'journey')-'data')||jsonb_build_object('case_id',e.case_id),'event_id',e.id)
  from public.customer_journey_events e where r.result ? 'journey'
    and e.customer_id::text=r.result#>>'{journey,customer_id}'
    and e.revision::text=r.result#>>'{journey,revision}' and e.data=r.result#>'{journey,data}';
-- Orphaned pre-upgrade receipts must not resurrect erased cards.
delete from public.customer_write_requests where result ? 'journey';
create index if not exists customer_write_requests_customer_idx on public.customer_write_requests(customer_id);

create or replace function public.satis_clients_audit_owner()
returns void language plpgsql security definer set search_path='' as $$ begin
  if auth.uid() is null or public.is_satis_app_user() is not true or public.is_satis_owner() is not true
    or coalesce(lower(auth.jwt()->>'email')='satis@pracowniasluchu.pl',false) is not true then
    raise exception 'Clients access denied' using errcode='42501';
  end if;
end $$;
revoke all on function public.satis_clients_audit_owner() from public,anon,authenticated;

create or replace function public.satis_clients_audit_erase()
returns trigger language plpgsql security definer set search_path='' as $$ begin
  -- Reservation receipts in audit-core also contain customer fields in device data.
  delete from satis_audit_private.operations o using public.customer_write_requests r
    where r.customer_id=old.id and r.result->>'device_operation'=o.operation::text and o.user_id=r.actor_id;
  delete from public.customer_write_requests where customer_id=old.id
    or result->>'id'=old.id::text or result#>>'{journey,customer_id}'=old.id::text;
  return old;
end $$;
revoke all on function public.satis_clients_audit_erase() from public,anon,authenticated;
drop trigger if exists satis_clients_erase_requests on public.customer_profiles;
create trigger satis_clients_erase_requests before delete on public.customer_profiles
  for each row execute function public.satis_clients_audit_erase();

-- Preserve the installed writer, including the optional schedule wrapper.
do $$ begin
  if to_regprocedure('public.satis_clients_write_audit_base(uuid,text,uuid,bigint,jsonb)') is null then
    alter function public.satis_clients_write(uuid,text,uuid,bigint,jsonb) rename to satis_clients_write_audit_base;
  end if;
end $$;
revoke all on function public.satis_clients_write_audit_base(uuid,text,uuid,bigint,jsonb) from public,anon,authenticated;
create or replace function public.satis_clients_write(p_request_id uuid,p_action text,p_id uuid,p_expected_revision bigint,p_data jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare cid uuid; result jsonb;
begin
  perform public.satis_clients_audit_owner();
  perform pg_advisory_xact_lock(731826,1);
  cid:=case when p_action='ACTIVITY' then (p_data->>'customer_id')::uuid else p_id end;
  perform 1 from public.customer_profiles where id=cid for update;
  if p_action<>'DELETE' and not exists(select 1 from public.customer_profiles where id=cid)
    and exists(select 1 from public.customer_write_requests r where r.id=p_request_id and r.result is not null) then
    raise exception 'Karta klienta nie istnieje.' using errcode='P0002';
  end if;
  result:=public.satis_clients_write_audit_base(p_request_id,p_action,p_id,p_expected_revision,p_data);
  update public.customer_write_requests set customer_id=cid where id=p_request_id and p_action<>'DELETE';
  return result;
end $$;

create or replace function public.satis_client_journey_case_read(p_customer_id uuid,p_case_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare item jsonb; history jsonb; summaries jsonb;
begin
  perform public.satis_clients_audit_owner();
  if not exists(select 1 from public.customer_profiles where id=p_customer_id) then
    raise exception 'Karta klienta nie istnieje.' using errcode='P0002';
  end if;
  select to_jsonb(j) into item from public.customer_journeys j where customer_id=p_customer_id
    and (case when p_case_id is null then not archived else case_id=p_case_id end);
  if p_case_id is not null and item is null then raise exception 'Sprawa nie istnieje.' using errcode='P0002'; end if;
  select coalesce(jsonb_agg(to_jsonb(s) order by s.id desc),'[]') into history from (
    select id,case_id,data,revision,created_at,actor_email from public.customer_journey_events
    where customer_id=p_customer_id and case_id=(item->>'case_id')::uuid order by id desc limit 30
  ) s;
  select coalesce(jsonb_agg(to_jsonb(s) order by s.archived,s.updated_at desc,s.case_id),'[]') into summaries from (
    select case_id,data->>'started_on' started_on,data->>'kind' kind,updated_at,revision,archived,legacy_matching
    from public.customer_journeys where customer_id=p_customer_id
  ) s;
  insert into public.customer_access_log(customer_id,actor_id,operation,target_id)
    values(p_customer_id,auth.uid(),'JOURNEY_OPEN',coalesce(item->>'case_id',''));
  return jsonb_build_object('journey',item,'events',history,'cases',summaries,
    'selected_case_id',item->'case_id','case_support',true);
end $$;
create or replace function public.satis_client_journey_read(p_customer_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$ begin
  return public.satis_client_journey_case_read(p_customer_id,null);
end $$;

-- Internal save has no request cache; the public writers cache only event references.
create or replace function public.satis_clients_audit_save(p_customer_id uuid,p_expected_revision bigint,p_data jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare previous public.customer_journeys%rowtype; cid uuid; val jsonb; flag text; item jsonb; eid bigint;
begin
  perform public.satis_clients_audit_owner();
  if p_customer_id is null or jsonb_typeof(p_data) is distinct from 'object' or octet_length(p_data::text)>16384
    or p_data-array['kind','started_on','interest','referral','trial_required','devices_required','device_ids','visit_id','confirmations','case_id','source_keys']<>'{}'::jsonb
    or not(p_data ?& array['kind','started_on','interest','referral','trial_required','devices_required','device_ids','visit_id','confirmations']) then
    raise exception 'Nieprawidlowe etapy sprawy.' using errcode='22023';
  end if;
  if coalesce(p_data->>'kind','') not in ('PURCHASE','SERVICE') or coalesce(p_data->>'interest','') not in ('UNKNOWN','INTERESTED','DECLINED')
    or coalesce(p_data->>'referral','') not in ('UNKNOWN','REQUESTED','READY','WITHOUT_REFUND')
    or jsonb_typeof(p_data->'trial_required') is distinct from 'boolean'
    or jsonb_typeof(p_data->'devices_required') is distinct from 'number' or p_data->>'devices_required' not in ('1','2')
    or coalesce(p_data->>'started_on','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    or (p_data->>'started_on')::date not between date '1900-01-01' and date '2100-12-31'
    or jsonb_typeof(p_data->'device_ids') is distinct from 'array' or jsonb_typeof(p_data->'visit_id') is distinct from 'string'
    or jsonb_typeof(p_data->'confirmations') is distinct from 'object' then
    raise exception 'Sprawdz date i ustawienia sprawy.' using errcode='22023';
  end if;
  if jsonb_array_length(p_data->'device_ids')>(p_data->>'devices_required')::integer
    or jsonb_array_length(p_data->'device_ids')<>(select count(distinct value) from jsonb_array_elements(p_data->'device_ids')) then
    raise exception 'Sprawdz liczbe aparatow.' using errcode='22023';
  end if;
  for val in select value from jsonb_array_elements(p_data->'device_ids') loop
    if jsonb_typeof(val) is distinct from 'string' or length(val#>>'{}') not between 1 and 512 then
      raise exception 'Nieprawidlowy aparat.' using errcode='22023';
    end if;
  end loop;
  if (p_data->'confirmations')-array['rodo','fitting','receipt','instructions','warranty','care']<>'{}'::jsonb
    or not((p_data->'confirmations') ?& array['rodo','fitting','receipt','instructions','warranty','care']) then
    raise exception 'Nieprawidlowe potwierdzenia.' using errcode='22023';
  end if;
  for flag in select jsonb_object_keys(p_data->'confirmations') loop
    if jsonb_typeof(p_data->'confirmations'->flag) is distinct from 'boolean' then
      raise exception 'Nieprawidlowe potwierdzenie.' using errcode='22023';
    end if;
  end loop;
  if p_data ? 'case_id' then
    if jsonb_typeof(p_data->'case_id') is distinct from 'string'
      or p_data->>'case_id' !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      or not(p_data ? 'source_keys') then raise exception 'Case UUID and explicit source_keys required' using errcode='22023'; end if;
    cid:=(p_data->>'case_id')::uuid;
  elsif p_data ? 'source_keys' then
    raise exception 'source_keys requires case_id' using errcode='22023';
  end if;
  if p_data ? 'source_keys' then
    if jsonb_typeof(p_data->'source_keys') is distinct from 'array' then raise exception 'Invalid source_keys' using errcode='22023'; end if;
    if jsonb_array_length(p_data->'source_keys')>100
      or jsonb_array_length(p_data->'source_keys')<>(select count(distinct value) from jsonb_array_elements(p_data->'source_keys')) then
      raise exception 'Invalid source_keys' using errcode='22023';
    end if;
    for val in select value from jsonb_array_elements(p_data->'source_keys') loop
      if jsonb_typeof(val) is distinct from 'string' or length(val#>>'{}')>522
        or (val#>>'{}') !~ '^(device|service|demo|loan|offer|order|complaint):.+' then
        raise exception 'Invalid source key' using errcode='22023';
      end if;
    end loop;
  end if;
  perform 1 from public.customer_profiles where id=p_customer_id and not archived for update;
  if not found then raise exception 'Karta nie istnieje lub jest zarchiwizowana.' using errcode='22023'; end if;
  if p_data->>'visit_id'<>'' and not exists(select 1 from public.customer_activities
    where id::text=p_data->>'visit_id' and customer_id=p_customer_id and kind='VISIT') then
    raise exception 'Wizyta nie nalezy do tej osoby.' using errcode='22023';
  end if;
  if cid is null then
    select * into previous from public.customer_journeys where customer_id=p_customer_id and not archived for update;
    if previous.case_id is not null and not previous.legacy_matching then
      raise exception 'Explicit case_id required' using errcode='PT409';
    end if;
    cid:=coalesce(previous.case_id,gen_random_uuid());
  else
    select * into previous from public.customer_journeys where case_id=cid for update;
    if previous.case_id is not null and (previous.customer_id<>p_customer_id or previous.archived) then
      raise exception 'Sprawa jest zarchiwizowana lub niedostepna.' using errcode='PT409';
    end if;
  end if;
  if (previous.case_id is null and p_expected_revision is not null)
    or (previous.case_id is not null and previous.revision is distinct from p_expected_revision) then
    raise exception 'Etapy zmienily sie. Odswiez karte.' using errcode='PT409';
  end if;
  if previous.case_id is null then
    update public.customer_journeys set archived=true where customer_id=p_customer_id and not archived;
    insert into public.customer_journeys(customer_id,case_id,data,legacy_matching,updated_by)
      values(p_customer_id,cid,p_data,not(p_data ? 'case_id'),auth.uid()) returning to_jsonb(customer_journeys) into item;
  else
    update public.customer_journeys set data=p_data,revision=revision+1,updated_at=clock_timestamp(),updated_by=auth.uid(),
      legacy_matching=not(p_data ? 'case_id') where case_id=cid returning to_jsonb(customer_journeys) into item;
  end if;
  insert into public.customer_journey_events(customer_id,case_id,data,revision,actor_id,actor_email)
    values(p_customer_id,cid,p_data,(item->>'revision')::bigint,auth.uid(),lower(auth.jwt()->>'email')) returning id into eid;
  insert into public.customer_access_log(customer_id,actor_id,operation,target_id) values(p_customer_id,auth.uid(),'JOURNEY_SAVE',cid::text);
  return jsonb_build_object('journey',item,'event_id',eid);
end $$;
revoke all on function public.satis_clients_audit_save(uuid,bigint,jsonb) from public,anon,authenticated;

create or replace function public.satis_clients_audit_replay(p_customer_id uuid,p_receipt jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare payload jsonb; rows jsonb; result jsonb;
begin
  perform public.satis_clients_audit_owner();
  if not exists(select 1 from public.customer_profiles where id=p_customer_id) then
    raise exception 'Karta klienta nie istnieje.' using errcode='P0002';
  end if;
  select data into payload from public.customer_journey_events where id=(p_receipt->>'event_id')::bigint and customer_id=p_customer_id;
  if payload is null then raise exception 'Receipt no longer available' using errcode='P0002'; end if;
  result:=jsonb_build_object('journey',(p_receipt->'journey_meta')||jsonb_build_object('data',payload));
  if p_receipt ? 'device_ids' then
    rows:='[]';
    if p_receipt->>'device_operation' is not null then
      select receipt into rows from satis_audit_private.operations where user_id=auth.uid() and operation=(p_receipt->>'device_operation')::uuid;
      if rows is null then raise exception 'Device receipt no longer available' using errcode='P0002'; end if;
    end if;
    select rows||coalesce(jsonb_agg(jsonb_build_object('table','device_records','id',d.id,'data',d.data,
      'revision',d.revision,'updated_at',d.updated_at)),'[]') into rows from public.device_records d
      where p_receipt->'device_ids' @> jsonb_build_array(d.id)
        and not exists(select 1 from jsonb_array_elements(rows) r where r->>'id'=d.id);
    result:=result||jsonb_build_object('device_rows',rows,'profile_revision',p_receipt->'profile_revision');
  end if;
  return result;
end $$;
revoke all on function public.satis_clients_audit_replay(uuid,jsonb) from public,anon,authenticated;

create or replace function public.satis_client_journey_write(p_customer_id uuid,p_request_id uuid,p_expected_revision bigint,p_data jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
<<journey_write>>
declare fp text; request_row public.customer_write_requests%rowtype; result jsonb;
begin
  perform public.satis_clients_audit_owner();
  if p_request_id is null or p_customer_id is null then raise exception 'Invalid request' using errcode='22023'; end if;
  perform 1 from public.customer_profiles where id=p_customer_id for update;
  if not found then raise exception 'Karta klienta nie istnieje.' using errcode='P0002'; end if;
  fp:=encode(sha256(convert_to(jsonb_build_object('action','JOURNEY','customer_id',p_customer_id,'revision',p_expected_revision,'data',p_data)::text,'UTF8')),'hex');
  insert into public.customer_write_requests(id,actor_id,fingerprint,customer_id) values(p_request_id,auth.uid(),fp,p_customer_id) on conflict do nothing;
  select * into strict request_row from public.customer_write_requests where id=p_request_id for update;
  if request_row.actor_id is distinct from auth.uid() or request_row.fingerprint is distinct from fp then
    raise exception 'Request already used' using errcode='22023';
  end if;
  if request_row.result is not null then return public.satis_clients_audit_replay(p_customer_id,request_row.result); end if;
  result:=public.satis_clients_audit_save(p_customer_id,p_expected_revision,p_data);
  update public.customer_write_requests set result=jsonb_build_object('journey_meta',(journey_write.result->'journey')-'data','event_id',journey_write.result->'event_id') where id=p_request_id;
  return result-'event_id';
end $$;

-- p_changes: audit-core UPDATE envelopes for the selected devices needing changes.
-- Unchanged selections must already be confirmed reservations/sales for this card.
-- Profile revision increments ONCE for the atomic link batch (not once per device).
create or replace function public.satis_client_journey_reserve(p_customer_id uuid,p_request_id uuid,p_expected_revision bigint,
  p_profile_revision bigint,p_data jsonb,p_changes jsonb,p_workstation text default '')
returns jsonb language plpgsql security definer set search_path='' as $$
declare fp text; request_row public.customer_write_requests%rowtype; profile public.customer_profiles%rowtype;
  c jsonb; selected_id text; current_device public.device_records%rowtype; linked uuid; saved jsonb; rows jsonb; result jsonb;
  op uuid; rev bigint;
begin
  perform public.satis_clients_audit_owner();
  if p_request_id is null or p_customer_id is null or p_profile_revision is null
    or jsonb_typeof(p_data) is distinct from 'object' or jsonb_typeof(p_data->'device_ids') is distinct from 'array'
    or jsonb_typeof(p_changes) is distinct from 'array' or p_workstation is null or length(p_workstation)>200 then
    raise exception 'Invalid reservation' using errcode='22023';
  end if;
  if jsonb_array_length(p_changes)>2 or octet_length(p_changes::text)>1048576
    or jsonb_array_length(p_data->'device_ids') not between 1 and 2
    or jsonb_array_length(p_data->'device_ids')<>(p_data->>'devices_required')::integer then
    raise exception 'Select exactly the required devices' using errcode='22023';
  end if;
  -- Match audit-core lock order before taking profile/request/device row locks.
  perform pg_advisory_xact_lock(731826,1);
  select * into profile from public.customer_profiles where id=p_customer_id for update;
  if profile.id is null then raise exception 'Karta klienta nie istnieje.' using errcode='P0002'; end if;
  fp:=encode(sha256(convert_to(jsonb_build_object('action','RESERVE','customer_id',p_customer_id,'revision',p_expected_revision,
    'profile_revision',p_profile_revision,'data',p_data,'changes',p_changes,'workstation',p_workstation)::text,'UTF8')),'hex');
  insert into public.customer_write_requests(id,actor_id,fingerprint,customer_id) values(p_request_id,auth.uid(),fp,p_customer_id) on conflict do nothing;
  select * into strict request_row from public.customer_write_requests where id=p_request_id for update;
  if request_row.actor_id is distinct from auth.uid() or request_row.fingerprint is distinct from fp then
    raise exception 'Request already used' using errcode='22023';
  end if;
  if request_row.result is not null then return public.satis_clients_audit_replay(p_customer_id,request_row.result); end if;
  if profile.archived or profile.revision is distinct from p_profile_revision then raise exception 'Karta zmienila sie.' using errcode='PT409'; end if;
  for selected_id in select jsonb_array_elements_text(p_data->'device_ids') loop
    select * into current_device from public.device_records where id=selected_id for update;
    if current_device.id is null or left(selected_id,5)='demo-' then raise exception 'Aparat niedostepny.' using errcode='PT409'; end if;
    select customer_id into linked from public.customer_source_links where source_type='device' and source_id=selected_id;
    if linked is not null and linked<>p_customer_id then raise exception 'Aparat nalezy do innej karty.' using errcode='PT409'; end if;
    if nullif(current_device.data->>'clientProfileId','') is not null
      and current_device.data->>'clientProfileId'<>p_customer_id::text then
      raise exception 'Aparat nalezy do innej karty.' using errcode='PT409';
    end if;
    if not exists(select 1 from jsonb_array_elements(p_changes) v where v->>'id'=selected_id) then
      if not coalesce((linked=p_customer_id or current_device.data->>'clientProfileId'=p_customer_id::text)
        and current_device.data->>'type' in ('REZERWACJA','SPRZEDANY')
        and lower(btrim(current_device.data->>'customerName'))=lower(btrim(profile.full_name)),false) then
        raise exception 'Unchanged device is not assigned to this customer' using errcode='PT409';
      end if;
    end if;
  end loop;
  for c in select value from jsonb_array_elements(p_changes) loop
    if c->>'table' is distinct from 'device_records' or coalesce(c->>'delete','false')<>'false'
      or jsonb_typeof(c->'expectedRevision') is distinct from 'number' or jsonb_typeof(c->'data') is distinct from 'object'
      or not(p_data->'device_ids' @> jsonb_build_array(c->>'id')) or left(c->>'id',5)='demo-'
      or c#>>'{data,type}' is distinct from 'REZERWACJA' or c#>>'{data,clientProfileId}' is distinct from p_customer_id::text
      or lower(btrim(c#>>'{data,customerName}')) is distinct from lower(btrim(profile.full_name)) then
      raise exception 'Invalid device reservation change' using errcode='22023';
    end if;
    select * into current_device from public.device_records where id=c->>'id' for update;
    if current_device.id is null or current_device.revision is distinct from (c->>'expectedRevision')::bigint then
      raise exception 'Aparat zmienil sie.' using errcode='PT409';
    end if;
    select customer_id into linked from public.customer_source_links where source_type='device' and source_id=c->>'id';
    if linked is not null and linked<>p_customer_id then raise exception 'Aparat nalezy do innej karty.' using errcode='PT409'; end if;
    if not(coalesce(current_device.data->>'type','NA STANIE')='NA STANIE'
        and nullif(btrim(coalesce(current_device.data->>'customerName','')),'') is null)
      and not coalesce(current_device.data->>'clientProfileId'=p_customer_id::text and current_device.data->>'type'='REZERWACJA',false) then
      raise exception 'Aparat nie jest wolny.' using errcode='PT409';
    end if;
    if (current_device.data-array['customerName','phone','type','clientProfileId'])
      is distinct from ((c->'data')-array['customerName','phone','type','clientProfileId']) then
      raise exception 'Reservation cannot change device identity or other fields' using errcode='22023';
    end if;
  end loop;
  -- A private operation namespace avoids collisions with direct device writes.
  rows:='[]';
  if jsonb_array_length(p_changes)>0 then
    op:=md5('satis-client-reserve:'||p_request_id::text)::uuid;
    rows:=public.satis_write_records(op,p_changes,p_workstation);
  end if;
  for selected_id in select jsonb_array_elements_text(p_data->'device_ids') loop
    insert into public.customer_source_links(source_type,source_id,customer_id,linked_by)
      values('device',selected_id,p_customer_id,auth.uid()) on conflict do nothing;
    select customer_id into linked from public.customer_source_links where source_type='device' and source_id=selected_id;
    if linked is distinct from p_customer_id then raise exception 'Aparat nalezy do innej karty.' using errcode='PT409'; end if;
    insert into public.customer_access_log(customer_id,actor_id,operation,target_id) values(p_customer_id,auth.uid(),'LINK',selected_id);
  end loop;
  select rows||coalesce(jsonb_agg(jsonb_build_object('table','device_records','id',d.id,'data',d.data,
    'revision',d.revision,'updated_at',d.updated_at)),'[]') into rows from public.device_records d
    where p_data->'device_ids' @> jsonb_build_array(d.id)
      and not exists(select 1 from jsonb_array_elements(rows) r where r->>'id'=d.id);
  saved:=public.satis_clients_audit_save(p_customer_id,p_expected_revision,p_data);
  update public.customer_profiles set revision=revision+1,updated_at=clock_timestamp(),updated_by=auth.uid()
    where id=p_customer_id returning revision into rev;
  result:=jsonb_build_object('journey',saved->'journey','device_rows',rows,'profile_revision',rev);
  update public.customer_write_requests set result=jsonb_build_object('journey_meta',(saved->'journey')-'data',
    'event_id',saved->'event_id','device_operation',op,'device_ids',p_data->'device_ids','profile_revision',rev) where id=p_request_id;
  return result;
end $$;

create or replace function public.satis_clients_audit_day(p_value text)
returns text language plpgsql immutable set search_path='' as $$
declare candidate text;
begin
  candidate:=btrim(p_value);
  if candidate ~ '^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$' then
    candidate:=substr(candidate,7,4)||'-'||substr(candidate,4,2)||'-'||substr(candidate,1,2);
  end if;
  if candidate is null or candidate !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then return ''; end if;
  perform candidate::date;
  return candidate;
exception when invalid_datetime_format or datetime_field_overflow then return '';
end $$;
revoke all on function public.satis_clients_audit_day(text) from public,anon,authenticated;

-- Mirror repairPhoneReturnKey / repairOrderProgress without guessing aggregate
-- dates. A present empty/null item date must not inherit the legacy parent date.
create or replace function public.satis_clients_audit_repair_state(p_data jsonb)
returns table(ready boolean,notified boolean) language plpgsql stable set search_path='' as $$
declare item jsonb; position bigint; returned text; picked text; item_id text;
  tuples jsonb:='[]'; expected_key jsonb; stored_key jsonb; parent_return text; parent_pickup text;
begin
  ready:=false; notified:=false;
  parent_return:=public.satis_clients_audit_day(p_data->>'returnDate');
  parent_pickup:=public.satis_clients_audit_day(p_data->>'pickupDate');
  if (case when jsonb_typeof(p_data->'orderItems')='array' then jsonb_array_length(p_data->'orderItems')>0 else false end) then
    for item,position in select value,ordinality from jsonb_array_elements(p_data->'orderItems') with ordinality loop
      returned:=case when item ? 'returnDate' then public.satis_clients_audit_day(item->>'returnDate') else parent_return end;
      picked:=case when item ? 'pickupDate' then public.satis_clients_audit_day(item->>'pickupDate') else parent_pickup end;
      if returned<>'' then
        item_id:=case when item->'id' is null or item->'id' in ('null'::jsonb,'false'::jsonb,'0'::jsonb,'""'::jsonb)
          then (position-1)::text else item->>'id' end;
        tuples:=tuples||jsonb_build_array(jsonb_build_array(item_id,returned));
        if picked='' then ready:=true; end if;
      end if;
    end loop;
    select jsonb_agg(value order by (value->>0) collate "C",ordinality) into expected_key
      from jsonb_array_elements(tuples) with ordinality;
    begin stored_key:=(p_data->>'phoneNotifiedReturnKey')::jsonb;
    exception when invalid_text_representation then stored_key:=null; end;
    notified:=expected_key is not null and stored_key is not distinct from expected_key;
  else
    ready:=parent_return<>'' and parent_pickup='';
    notified:=parent_return<>'' and p_data->>'phoneNotifiedReturnKey'=parent_return;
  end if;
  if ready and coalesce(notified,false) and nullif(btrim(p_data->>'phoneNotifiedAt'),'') is not null then
    begin notified:=isfinite((p_data->>'phoneNotifiedAt')::timestamptz);
    exception when invalid_datetime_format or datetime_field_overflow then notified:=false; end;
  else notified:=false; end if;
  return next;
end $$;
revoke all on function public.satis_clients_audit_repair_state(jsonb) from public,anon,authenticated;

-- Source-name candidates are supplied by the owner's already-loaded source index.
-- Filters never infer customer ownership from source names.
create or replace function public.satis_clients_audit_filter(p_customer_id uuid,p_filter text)
returns boolean language sql stable security definer set search_path='' as $$
  select case
    when p_filter in ('','ALL') then true
    when p_filter='NFZ' then exists(select 1 from public.customer_journeys j
      where j.customer_id=p_customer_id and not j.archived and j.data->>'referral'='REQUESTED'
        and not exists(select 1 from public.customer_source_links l join public.device_records d on d.id=l.source_id
          where l.customer_id=j.customer_id and l.source_type='device'
            and j.data->'device_ids' @> jsonb_build_array(d.id)
            and upper(btrim(d.data->>'type')) in ('REZERWACJA','SPRZEDANY')
          having count(*)>=case j.data->>'devices_required' when '1' then 1 else 2 end
            and (bool_and(coalesce(upper(btrim(d.data->>'ezwm')),'') in ('POBRANE','REALIZACJA'))
              or bool_and(coalesce(upper(btrim(d.data->>'ezwm')),'')='BEZ REFUNDACJI'))))
    when p_filter='VISIT' then exists(select 1 from public.customer_journeys j join public.customer_activities a
      on a.id::text=j.data->>'visit_id' and a.customer_id=j.customer_id
      where j.customer_id=p_customer_id and not j.archived and a.kind='VISIT' and a.status='PLANNED')
    when p_filter in ('CONTACT','PICKUP') then exists(
      select 1 from public.customer_source_links l join public.repair_records r on r.id=l.source_id
        cross join lateral public.satis_clients_audit_repair_state(r.data) state
      where l.customer_id=p_customer_id and l.source_type='service'
        and state.ready and state.notified=(p_filter='PICKUP'))
    when p_filter='OVERDUE' then exists(select 1 from public.customer_journeys j join public.customer_activities a
      on a.id::text=j.data->>'visit_id' and a.customer_id=j.customer_id
      where j.customer_id=p_customer_id and not j.archived and a.kind='VISIT' and a.status='PLANNED' and a.starts_at<now())
      or exists(select 1 from public.customer_source_links l join public.loan_contracts c on c.id=l.source_id
        where l.customer_id=p_customer_id and l.source_type='loan' and nullif(btrim(c.data->>'returnDate'),'') is null
          and c.data->>'periodTo' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
          and c.data->>'periodTo'<to_char(now() at time zone 'Europe/Warsaw','YYYY-MM-DD'))
    else false end
$$;
revoke all on function public.satis_clients_audit_filter(uuid,text) from public,anon,authenticated;
-- Remove the pre-release five-argument form to avoid default-argument ambiguity.
drop function if exists public.satis_clients_search(text,integer,boolean,text,text[]);
create or replace function public.satis_clients_search(p_query text default '',p_offset integer default 0,
  p_archived boolean default false,p_location text default '',p_source_names text[] default '{}',p_filter text default '')
returns jsonb language plpgsql security definer set search_path='' as $$
declare rows jsonb; total bigint;
begin
  perform public.satis_clients_audit_owner();
  if p_query is null or length(p_query)>160 or p_offset is null or p_offset not between 0 and 100000
    or p_archived is null or p_location is null or p_location not in ('','T12','P50','P63')
    or p_source_names is null or cardinality(p_source_names)>2000
    or p_filter is null or p_filter not in ('','ALL','CONTACT','NFZ','VISIT','PICKUP','OVERDUE')
    or exists(select 1 from unnest(p_source_names) n where n is null or length(n)>160) then
    raise exception 'Invalid query' using errcode='22023';
  end if;
  select count(*) into total from public.customer_profiles p where p.archived=p_archived and (p_location='' or p.location=p_location)
    and public.satis_clients_audit_filter(p.id,p_filter)
    and (p_query='' or position(lower(p_query) in lower(p.full_name||' '||p.phone))>0
      or lower(btrim(p.full_name)) in(select lower(btrim(n)) from unnest(p_source_names) n));
  select coalesce(jsonb_agg(to_jsonb(s)),'[]') into rows from (
    select p.id,p.full_name,p.phone,p.location,p.archived,p.revision,p.updated_at from public.customer_profiles p
    where p.archived=p_archived and (p_location='' or p.location=p_location)
      and public.satis_clients_audit_filter(p.id,p_filter)
      and (p_query='' or position(lower(p_query) in lower(p.full_name||' '||p.phone))>0
        or lower(btrim(p.full_name)) in(select lower(btrim(n)) from unnest(p_source_names) n))
    order by p.updated_at desc,p.id limit 100 offset p_offset
  ) s;
  return jsonb_build_object('profiles',rows,'total',total);
end $$;

revoke all on function public.satis_clients_write(uuid,text,uuid,bigint,jsonb),public.satis_client_journey_read(uuid),
  public.satis_client_journey_case_read(uuid,uuid),public.satis_client_journey_write(uuid,uuid,bigint,jsonb),
  public.satis_client_journey_reserve(uuid,uuid,bigint,bigint,jsonb,jsonb,text),public.satis_clients_search(text,integer,boolean,text,text[],text) from public,anon;
grant execute on function public.satis_clients_write(uuid,text,uuid,bigint,jsonb),public.satis_client_journey_read(uuid),
  public.satis_client_journey_case_read(uuid,uuid),public.satis_client_journey_write(uuid,uuid,bigint,jsonb),
  public.satis_client_journey_reserve(uuid,uuid,bigint,bigint,jsonb,jsonb,text),public.satis_clients_search(text,integer,boolean,text,text[],text) to authenticated;
notify pgrst,'reload schema';
commit;
