-- Przebieg spraw klienta. Po supabase-clients.sql; bez zmian w dokumentach i aparatach.
begin;
create table if not exists public.customer_journeys (
  customer_id uuid primary key references public.customer_profiles(id) on delete cascade,
  data jsonb not null check (jsonb_typeof(data)='object'),
  revision bigint not null default 1,
  updated_at timestamptz not null default clock_timestamp(),
  updated_by uuid not null
);
create table if not exists public.customer_journey_events (
  id bigint generated always as identity primary key,
  customer_id uuid not null references public.customer_profiles(id) on delete cascade,
  data jsonb not null,
  revision bigint not null,
  created_at timestamptz not null default clock_timestamp(),
  actor_id uuid not null,
  actor_email text not null
);
create index if not exists customer_journey_events_customer_idx on public.customer_journey_events(customer_id,id desc);
alter table public.customer_journeys enable row level security;
alter table public.customer_journeys force row level security;
alter table public.customer_journey_events enable row level security;
alter table public.customer_journey_events force row level security;
revoke all on public.customer_journeys,public.customer_journey_events from public,anon,authenticated;
revoke all on sequence public.customer_journey_events_id_seq from public,anon,authenticated;

create or replace function public.satis_client_journey_read(p_customer_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare item jsonb; history jsonb;
begin
  if auth.uid() is null or public.is_satis_app_user() is not true or public.is_satis_owner() is not true
    or coalesce(lower(auth.jwt()->>'email')='satis@pracowniasluchu.pl',false) is not true then
    raise exception 'Clients access denied' using errcode='42501';
  end if;
  if not exists(select 1 from public.customer_profiles where id=p_customer_id) then
    raise exception 'Karta klienta nie istnieje.' using errcode='P0002';
  end if;
  select to_jsonb(j) into item from public.customer_journeys j where customer_id=p_customer_id;
  select coalesce(jsonb_agg(to_jsonb(s) order by s.id desc),'[]') into history from (
    select id,data,revision,created_at,actor_email from public.customer_journey_events where customer_id=p_customer_id order by id desc limit 30
  ) s;
  insert into public.customer_access_log(customer_id,actor_id,operation) values(p_customer_id,auth.uid(),'JOURNEY_OPEN');
  return jsonb_build_object('journey',item,'events',history);
end $$;

create or replace function public.satis_client_journey_write(p_customer_id uuid,p_request_id uuid,p_expected_revision bigint,p_data jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
<<journey_write>>
declare actor uuid:=auth.uid(); fp text; request_row public.customer_write_requests%rowtype;
  previous public.customer_journeys%rowtype; profile public.customer_profiles%rowtype; result jsonb; item jsonb; flag text; val jsonb; ids integer;
begin
  if actor is null or public.is_satis_app_user() is not true or public.is_satis_owner() is not true
    or coalesce(lower(auth.jwt()->>'email')='satis@pracowniasluchu.pl',false) is not true then
    raise exception 'Clients access denied' using errcode='42501';
  end if;
  if p_customer_id is null or p_request_id is null or jsonb_typeof(p_data) is distinct from 'object'
    or octet_length(p_data::text)>8192 or p_data-array['kind','started_on','interest','referral','trial_required','devices_required','device_ids','visit_id','confirmations']<>'{}'::jsonb
    or not (p_data ?& array['kind','started_on','interest','referral','trial_required','devices_required','device_ids','visit_id','confirmations']) then
    raise exception 'Nieprawidlowe etapy sprawy.' using errcode='22023';
  end if;
  if coalesce(p_data->>'kind','') not in ('PURCHASE','SERVICE') or coalesce(p_data->>'interest','') not in ('UNKNOWN','INTERESTED','DECLINED')
    or coalesce(p_data->>'referral','') not in ('UNKNOWN','REQUESTED','READY','WITHOUT_REFUND')
    or jsonb_typeof(p_data->'trial_required') is distinct from 'boolean' or p_data->>'devices_required' not in ('1','2')
    or jsonb_typeof(p_data->'devices_required') is distinct from 'number'
    or coalesce(p_data->>'started_on','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    or (p_data->>'started_on')::date not between date '1900-01-01' and date '2100-12-31'
    or jsonb_typeof(p_data->'device_ids') is distinct from 'array' or jsonb_typeof(p_data->'confirmations') is distinct from 'object'
    or jsonb_typeof(p_data->'visit_id') is distinct from 'string' then
    raise exception 'Sprawdz date i ustawienia sprawy.' using errcode='22023';
  end if;
  ids:=jsonb_array_length(p_data->'device_ids');
  if ids>(p_data->>'devices_required')::integer or ids<>(select count(distinct value) from jsonb_array_elements(p_data->'device_ids')) then
    raise exception 'Sprawdz liczbe aparatow.' using errcode='22023';
  end if;
  for val in select value from jsonb_array_elements(p_data->'device_ids') loop
    if jsonb_typeof(val) is distinct from 'string' or length(val#>>'{}') not between 1 and 512 then
      raise exception 'Nieprawidlowy identyfikator aparatu.' using errcode='22023';
    end if;
  end loop;
  if (p_data->'confirmations')-array['rodo','fitting','receipt','instructions','warranty','care']<>'{}'::jsonb
    or not ((p_data->'confirmations') ?& array['rodo','fitting','receipt','instructions','warranty','care']) then
    raise exception 'Nieprawidlowe potwierdzenia dokumentow.' using errcode='22023';
  end if;
  for flag in select jsonb_object_keys(p_data->'confirmations') loop
    if jsonb_typeof(p_data->'confirmations'->flag) is distinct from 'boolean' then
      raise exception 'Potwierdzenie musi byc zaznaczeniem.' using errcode='22023';
    end if;
  end loop;
  fp:=encode(sha256(convert_to(jsonb_build_object('action','JOURNEY','customer_id',p_customer_id,'revision',p_expected_revision,'data',p_data)::text,'UTF8')),'hex');
  insert into public.customer_write_requests(id,actor_id,fingerprint) values(p_request_id,actor,fp) on conflict do nothing;
  select * into strict request_row from public.customer_write_requests where id=p_request_id for update;
  if request_row.actor_id is distinct from actor or request_row.fingerprint is distinct from fp then
    raise exception 'Request already used' using errcode='22023';
  end if;
  if request_row.result is not null then return request_row.result; end if;
  select * into profile from public.customer_profiles where id=p_customer_id for update;
  if profile.id is null or profile.archived then raise exception 'Karta nie istnieje lub jest zarchiwizowana.' using errcode='22023'; end if;
  if p_data->>'visit_id'<>'' and not exists(select 1 from public.customer_activities where id::text=p_data->>'visit_id' and customer_id=p_customer_id and kind='VISIT') then
    raise exception 'Wizyta nie nalezy do tej osoby.' using errcode='22023';
  end if;
  select * into previous from public.customer_journeys where customer_id=p_customer_id for update;
  if (previous.customer_id is null and p_expected_revision is not null) or (previous.customer_id is not null and previous.revision is distinct from p_expected_revision) then
    raise exception 'Etapy zmienily sie. Odswiez karte.' using errcode='PT409';
  end if;
  insert into public.customer_journeys(customer_id,data,updated_by) values(p_customer_id,p_data,actor)
    on conflict(customer_id) do update set data=excluded.data,revision=customer_journeys.revision+1,updated_at=clock_timestamp(),updated_by=actor
    returning to_jsonb(customer_journeys) into item;
  insert into public.customer_journey_events(customer_id,data,revision,actor_id,actor_email)
    values(p_customer_id,p_data,(item->>'revision')::bigint,actor,lower(auth.jwt()->>'email'));
  insert into public.customer_access_log(customer_id,actor_id,operation) values(p_customer_id,actor,'JOURNEY_SAVE');
  result:=jsonb_build_object('journey',item);
  update public.customer_write_requests set result=journey_write.result where id=p_request_id;
  return result;
end $$;
revoke all on function public.satis_client_journey_read(uuid),public.satis_client_journey_write(uuid,uuid,bigint,jsonb) from public,anon;
grant execute on function public.satis_client_journey_read(uuid),public.satis_client_journey_write(uuid,uuid,bigint,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
