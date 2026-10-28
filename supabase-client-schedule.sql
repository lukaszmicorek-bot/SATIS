-- Uruchomic po supabase-clients.sql. Nie zmienia istniejacych terminow.
begin;
create table if not exists public.customer_services (
  id uuid primary key,
  name text not null check(length(btrim(name)) between 1 and 120),
  duration_minutes integer not null check(duration_minutes between 5 and 240),
  max_day integer not null default 0 check(max_day between 0 and 100000),
  max_week integer not null default 0 check(max_week between 0 and 100000),
  max_month integer not null default 0 check(max_month between 0 and 100000),
  max_year integer not null default 0 check(max_year between 0 and 100000),
  enabled boolean not null default true,
  revision bigint not null default 1,
  updated_at timestamptz not null default clock_timestamp(),
  updated_by uuid not null
);
create unique index if not exists customer_services_name_idx on public.customer_services(lower(btrim(name)));
alter table public.customer_services add column if not exists price numeric(12,2) check(price>=0 and price<10000000000);
create table if not exists public.customer_opening_hours (
  location text primary key check(location in ('T12','P50','P63')),
  days jsonb not null check(jsonb_typeof(days)='array' and jsonb_array_length(days)=7),
  revision bigint not null default 1,
  updated_at timestamptz not null default clock_timestamp(),
  updated_by uuid not null
);
alter table public.customer_activities add column if not exists service_id uuid references public.customer_services(id);
alter table public.customer_activities add column if not exists service_price numeric(12,2) check(service_price>=0 and service_price<10000000000);
create index if not exists customer_service_capacity_idx on public.customer_activities(service_id,starts_at)
  where kind='VISIT' and status in ('PLANNED','COMPLETED');
create table if not exists public.customer_schedule_requests (
  id uuid primary key, actor_id uuid not null, fingerprint text not null, result jsonb
);
do $$ declare t text; begin
  foreach t in array array['customer_services','customer_opening_hours','customer_schedule_requests'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('alter table public.%I force row level security',t);
    execute format('revoke all on public.%I from public,anon,authenticated',t);
  end loop;
  if to_regprocedure('public.satis_clients_write_base(uuid,text,uuid,bigint,jsonb)') is null then
    alter function public.satis_clients_write(uuid,text,uuid,bigint,jsonb) rename to satis_clients_write_base;
  end if;
end $$;
revoke all on function public.satis_clients_write_base(uuid,text,uuid,bigint,jsonb) from public,anon,authenticated;

-- Gregorian Easter; statutory holidays, including Christmas Eve since 2025.
create or replace function public.satis_schedule_nonworking_day(day date)
returns boolean language plpgsql immutable strict set search_path='' as $$
declare y integer:=extract(year from day); a integer; b integer; c integer; d integer; e integer;
  f integer; g integer; h integer; i integer; k integer; l integer; m integer; n integer; easter date;
begin
  if extract(isodow from day)>5 or to_char(day,'MM-DD') in ('01-01','01-06','05-01','05-03','08-15','11-01','11-11','12-25','12-26')
    or (y>=2025 and to_char(day,'MM-DD')='12-24') then return true; end if;
  a:=y%19; b:=y/100; c:=y%100; d:=b/4; e:=b%4; f:=(b+8)/25; g:=(b-f+1)/3;
  h:=(19*a+b-d-g+15)%30; i:=c/4; k:=c%4; l:=(32+2*e+2*i-h-k)%7; m:=(a+11*h+22*l)/451;
  n:=h+l-7*m+114; easter:=make_date(y,n/31,n%31+1);
  return day in (easter,easter+1,easter+49,easter+60);
end $$;
revoke all on function public.satis_schedule_nonworking_day(date) from public,anon,authenticated;

create or replace function public.satis_clients_write(p_request_id uuid,p_action text,p_id uuid,p_expected_revision bigint,p_data jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
<<schedule_write>>
declare
  actor uuid:=auth.uid(); fp text; req public.customer_schedule_requests%rowtype;
  activity public.customer_activities%rowtype; service public.customer_services%rowtype;
  result jsonb; chosen uuid; opening jsonb; local_start timestamp; local_end timestamp;
  unit text; cap integer; used bigint; previous_service uuid; previous_price numeric; existed boolean;
begin
  if actor is null or public.is_satis_app_user() is not true or public.is_satis_owner() is not true
    or coalesce(lower(auth.jwt()->>'email')='satis@pracowniasluchu.pl',false) is not true then
    raise exception 'Schedule access denied' using errcode='42501';
  end if;
  if p_action is distinct from 'ACTIVITY' then
    return public.satis_clients_write_base(p_request_id,p_action,p_id,p_expected_revision,p_data);
  end if;
  if p_request_id is null or p_id is null or jsonb_typeof(p_data) is distinct from 'object' or octet_length(p_data::text)>16384 then
    raise exception 'Invalid schedule input' using errcode='22023';
  end if;
  perform pg_advisory_xact_lock(hashtext('satis-schedule-capacity'));
  fp:=encode(sha256(convert_to(jsonb_build_array(p_action,p_id,p_expected_revision,p_data)::text,'UTF8')),'hex');
  insert into public.customer_schedule_requests(id,actor_id,fingerprint) values(p_request_id,actor,fp) on conflict do nothing;
  select * into strict req from public.customer_schedule_requests where id=p_request_id for update;
  if req.actor_id is distinct from actor or req.fingerprint is distinct from fp then raise exception 'Request already used' using errcode='22023'; end if;
  if req.result is not null then return req.result; end if;
  select a.service_id,a.service_price into previous_service,previous_price from public.customer_activities a where a.id=p_id;
  existed:=found;
  if p_data ? 'service_id' then chosen:=nullif(p_data->>'service_id','')::uuid;
  else select a.service_id into chosen from public.customer_activities a where a.id=p_id; end if;
  result:=public.satis_clients_write_base(p_request_id,p_action,p_id,p_expected_revision,p_data-'service_id');
  select * into strict activity from public.customer_activities where id=p_id for update;
  if activity.kind='NOTE' and chosen is not null then raise exception 'A note cannot have a service' using errcode='22023'; end if;
  if chosen is not null then
    select * into service from public.customer_services where id=chosen;
    if service.id is null or (not service.enabled and activity.status='PLANNED') then raise exception 'Wybierz aktywna usluge.' using errcode='PT426'; end if;
  elsif activity.kind='VISIT' and activity.status='PLANNED' and exists(select 1 from public.customer_services where enabled) then
    raise exception 'Wybierz usluge przed zapisaniem wizyty.' using errcode='PT426';
  end if;
  local_start:=activity.starts_at at time zone 'Europe/Warsaw';
  local_end:=(activity.starts_at+make_interval(mins=>activity.duration_minutes)) at time zone 'Europe/Warsaw';
  if activity.kind='VISIT' and activity.status='PLANNED' then
    if public.satis_schedule_nonworking_day(local_start::date)
      or public.satis_schedule_nonworking_day((local_end-interval '1 microsecond')::date) then
      raise exception 'Nie mozna planowac wizyt w weekendy ani swieta.' using errcode='PT428';
    end if;
    select h.days->(extract(isodow from local_start)::integer-1) into opening from public.customer_opening_hours h where h.location=activity.location;
    if opening is not null and ((opening->>'closed')::boolean or local_start::date<>local_end::date
      or local_start::time<(opening->>'from')::time or local_end::time>(opening->>'to')::time) then
      raise exception 'Wizyta poza godzinami otwarcia gabinetu.' using errcode='PT427';
    end if;
  end if;
  if chosen is not null and activity.kind='VISIT' and activity.status in ('PLANNED','COMPLETED') then
    foreach unit in array array['day','week','month','year'] loop
      cap:=case unit when 'day' then service.max_day when 'week' then service.max_week when 'month' then service.max_month else service.max_year end;
      if cap>0 then
        select count(*) into used from public.customer_activities a where a.id<>p_id and a.service_id=chosen and a.kind='VISIT' and a.status in ('PLANNED','COMPLETED')
          and a.starts_at >= (date_trunc(unit,local_start) at time zone 'Europe/Warsaw')
          and a.starts_at < ((date_trunc(unit,local_start)+case unit when 'day' then interval '1 day' when 'week' then interval '1 week' when 'month' then interval '1 month' else interval '1 year' end) at time zone 'Europe/Warsaw');
        if used>=cap then raise exception 'Osiagnieto limit uslugi (%): %.',unit,cap using errcode='PT429'; end if;
      end if;
    end loop;
  end if;
  update public.customer_activities set service_id=chosen,
    service_price=case when chosen is null then null when existed and previous_service=chosen then previous_price else service.price end where id=p_id;
  update public.customer_schedule_requests r set result=schedule_write.result where r.id=p_request_id;
  return result;
end $$;

create or replace function public.satis_client_schedule_read()
returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
  if auth.uid() is null or public.is_satis_app_user() is not true or public.is_satis_owner() is not true
    or coalesce(lower(auth.jwt()->>'email')='satis@pracowniasluchu.pl',false) is not true then raise exception 'Schedule access denied' using errcode='42501'; end if;
  return jsonb_build_object('hours',(select coalesce(jsonb_agg(to_jsonb(h)),'[]') from public.customer_opening_hours h),
    'services',(select coalesce(jsonb_agg(to_jsonb(s) order by s.name),'[]') from public.customer_services s));
end $$;

create or replace function public.satis_client_schedule_settings_write(p_request_id uuid,p_kind text,p_key text,p_expected_revision bigint,p_data jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
<<settings_write>>
declare actor uuid:=auth.uid(); fp text; req public.customer_schedule_requests%rowtype; current_revision bigint; day jsonb; result jsonb;
begin
  if actor is null or public.is_satis_app_user() is not true or public.is_satis_owner() is not true
    or coalesce(lower(auth.jwt()->>'email')='satis@pracowniasluchu.pl',false) is not true then raise exception 'Schedule access denied' using errcode='42501'; end if;
  if p_request_id is null or p_key is null or p_kind is null or p_kind not in ('HOURS','SERVICE') or jsonb_typeof(p_data) is distinct from 'object'
    or octet_length(p_data::text)>8192 then raise exception 'Invalid settings' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtext('satis-schedule-capacity'));
  fp:=encode(sha256(convert_to(jsonb_build_array(p_kind,p_key,p_expected_revision,p_data)::text,'UTF8')),'hex');
  insert into public.customer_schedule_requests(id,actor_id,fingerprint) values(p_request_id,actor,fp) on conflict do nothing;
  select * into strict req from public.customer_schedule_requests where id=p_request_id for update;
  if req.actor_id is distinct from actor or req.fingerprint is distinct from fp then raise exception 'Request already used' using errcode='22023'; end if;
  if req.result is not null then return req.result; end if;
  if p_kind='HOURS' then
    if p_key not in ('T12','P50','P63') or p_data-array['days']<>'{}'::jsonb or jsonb_typeof(p_data->'days') is distinct from 'array'
      or jsonb_array_length(p_data->'days')<>7 then raise exception 'Invalid opening hours' using errcode='22023'; end if;
    for day in select value from jsonb_array_elements(p_data->'days') loop
      if jsonb_typeof(day) is distinct from 'object' or day-array['closed','from','to']<>'{}'::jsonb or jsonb_typeof(day->'closed') is distinct from 'boolean'
        or coalesce(day->>'from','')!~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' or coalesce(day->>'to','')!~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
        or ((day->>'closed')::boolean is false and (day->>'from')::time>=(day->>'to')::time) then raise exception 'Sprawdz godziny otwarcia.' using errcode='22023'; end if;
    end loop;
    select revision into current_revision from public.customer_opening_hours where location=p_key for update;
    if current_revision is distinct from p_expected_revision then raise exception 'Settings changed' using errcode='PT409'; end if;
    insert into public.customer_opening_hours(location,days,updated_by) values(p_key,p_data->'days',actor)
      on conflict(location) do update set days=excluded.days,revision=customer_opening_hours.revision+1,updated_at=clock_timestamp(),updated_by=actor
      returning jsonb_build_object('revision',revision) into result;
  else
    if p_data-array['name','duration_minutes','price','max_day','max_week','max_month','max_year','enabled']<>'{}'::jsonb
      or length(btrim(coalesce(p_data->>'name',''))) not between 1 and 120 or (p_data->>'duration_minutes')::integer not between 5 and 240
      or (p_data->>'enabled')::boolean is null then raise exception 'Invalid service' using errcode='22023'; end if;
    if p_data ? 'price' and p_data->'price'<>'null'::jsonb and
      (jsonb_typeof(p_data->'price')<>'number' or (p_data->>'price')::numeric<0 or (p_data->>'price')::numeric>=10000000000
        or (p_data->>'price')::numeric<>round((p_data->>'price')::numeric,2)) then
      raise exception 'Podaj cene w PLN z maksymalnie dwoma miejscami po przecinku.' using errcode='22023';
    end if;
    select revision into current_revision from public.customer_services where id=p_key::uuid for update;
    if current_revision is distinct from p_expected_revision then raise exception 'Settings changed' using errcode='PT409'; end if;
    insert into public.customer_services(id,name,duration_minutes,max_day,max_week,max_month,max_year,enabled,updated_by,price)
      values(p_key::uuid,btrim(p_data->>'name'),(p_data->>'duration_minutes')::integer,coalesce((p_data->>'max_day')::integer,0),coalesce((p_data->>'max_week')::integer,0),
        coalesce((p_data->>'max_month')::integer,0),coalesce((p_data->>'max_year')::integer,0),(p_data->>'enabled')::boolean,actor,(p_data->>'price')::numeric)
      on conflict(id) do update set name=excluded.name,duration_minutes=excluded.duration_minutes,max_day=excluded.max_day,max_week=excluded.max_week,
        max_month=excluded.max_month,max_year=excluded.max_year,enabled=excluded.enabled,
        price=case when p_data ? 'price' then excluded.price else customer_services.price end,
        revision=customer_services.revision+1,updated_at=clock_timestamp(),updated_by=actor
      returning jsonb_build_object('revision',revision) into result;
  end if;
  insert into public.customer_access_log(actor_id,operation,target_id) values(actor,'SCHEDULE_'||p_kind,p_key);
  update public.customer_schedule_requests r set result=settings_write.result where r.id=p_request_id;
  return result;
end $$;

create or replace function public.satis_clients_upcoming()
returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
  if auth.uid() is null or public.is_satis_app_user() is not true or public.is_satis_owner() is not true
    or coalesce(lower(auth.jwt()->>'email')='satis@pracowniasluchu.pl',false) is not true then raise exception 'Clients access denied' using errcode='42501'; end if;
  return (select coalesce(jsonb_agg(to_jsonb(s)),'[]') from (
    select a.id,a.customer_id,p.full_name,a.starts_at,a.duration_minutes,a.location,a.title,a.revision,a.service_id,a.service_price
    from public.customer_activities a join public.customer_profiles p on p.id=a.customer_id
    where a.kind='VISIT' and a.status='PLANNED' and not p.archived and a.starts_at>=now()-interval '30 days' and a.starts_at<now()+interval '90 days'
    order by a.starts_at,a.id limit 500
  )s);
end $$;
revoke all on function public.satis_clients_write(uuid,text,uuid,bigint,jsonb),public.satis_client_schedule_read(),
  public.satis_client_schedule_settings_write(uuid,text,text,bigint,jsonb),public.satis_clients_upcoming() from public,anon;
grant execute on function public.satis_clients_write(uuid,text,uuid,bigint,jsonb),public.satis_client_schedule_read(),
  public.satis_client_schedule_settings_write(uuid,text,text,bigint,jsonb),public.satis_clients_upcoming() to authenticated;
notify pgrst,'reload schema';
commit;
