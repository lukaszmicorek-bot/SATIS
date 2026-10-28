-- Kartoteka SATIS. Uruchomic po migracjach audytu. Nie importuje ani nie zmienia danych zrodlowych.
begin;
create table if not exists public.customer_profiles (
  id uuid primary key,
  full_name text not null check (length(full_name) between 3 and 160),
  phone text not null default '' check (phone = '' or phone ~ '^[0-9]{9}$'),
  street text not null default '' check (length(street) <= 240),
  postal_code text not null default '' check (postal_code = '' or postal_code ~ '^[0-9]{2}-[0-9]{3}$'),
  city text not null default '' check (length(city) <= 120),
  location text not null check (location in ('T12','P50','P63')),
  archived boolean not null default false,
  revision bigint not null default 1,
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  updated_by uuid not null
);
create table if not exists public.customer_source_links (
  source_type text not null check (source_type in ('device','service','demo','loan','offer','order','complaint')),
  source_id text not null check (length(source_id) between 1 and 512),
  customer_id uuid not null references public.customer_profiles(id) on delete cascade,
  linked_at timestamptz not null default clock_timestamp(),
  linked_by uuid not null,
  primary key (source_type, source_id)
);
create index if not exists customer_source_links_customer_idx on public.customer_source_links(customer_id);
create table if not exists public.customer_activities (
  id uuid primary key,
  customer_id uuid not null references public.customer_profiles(id) on delete cascade,
  kind text not null check (kind in ('NOTE','VISIT')),
  title text not null check (length(title) between 1 and 160),
  note text not null default '' check (length(note) <= 2000),
  starts_at timestamptz,
  duration_minutes integer not null default 30 check (duration_minutes between 5 and 240),
  location text not null check (location in ('T12','P50','P63')),
  status text not null default 'PLANNED' check (status in ('PLANNED','COMPLETED','CANCELLED','MISSED')),
  revision bigint not null default 1,
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  updated_by uuid not null,
  check ((kind = 'VISIT' and starts_at is not null) or (kind = 'NOTE' and starts_at is null and status = 'COMPLETED'))
);
create index if not exists customer_activities_customer_idx on public.customer_activities(customer_id, created_at desc);
create index if not exists customer_visits_due_idx on public.customer_activities(location, starts_at) where kind = 'VISIT' and status = 'PLANNED';
create table if not exists public.customer_access_log (
  id bigint generated always as identity primary key,
  customer_id uuid,
  actor_id uuid not null,
  operation text not null,
  target_id text not null default '',
  created_at timestamptz not null default clock_timestamp()
);
create index if not exists customer_access_log_customer_idx on public.customer_access_log(customer_id, created_at desc);
create table if not exists public.customer_write_requests (
  id uuid primary key,
  actor_id uuid not null,
  fingerprint text not null,
  result jsonb
);

-- Brak zapisu bezposredniego. Takze po recznej zmianie interfejsu gabinet pozostaje bez dostepu.
do $$
declare t text;
begin
  foreach t in array array['customer_profiles','customer_source_links','customer_activities','customer_access_log','customer_write_requests'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('revoke all on public.%I from public, anon, authenticated', t);
  end loop;
end $$;

create or replace function public.satis_clients_overview(p_query text default '', p_offset integer default 0, p_archived boolean default false, p_location text default '')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare rows jsonb; total bigint;
begin
  if auth.uid() is null or public.is_satis_app_user() is not true or public.is_satis_owner() is not true
    or coalesce(lower(auth.jwt()->>'email')='satis@pracowniasluchu.pl',false) is not true then
    raise exception 'Clients access denied' using errcode = '42501';
  end if;
  if p_query is null or length(p_query) > 160 or p_offset is null or p_offset < 0 or p_offset > 100000
    or p_archived is null or p_location is null or p_location not in ('','T12','P50','P63') then
    raise exception 'Invalid query' using errcode = '22023';
  end if;
  select count(*) into total from public.customer_profiles p where p.archived = p_archived and (p_location='' or p.location=p_location)
    and (p_query = '' or position(lower(p_query) in lower(p.full_name || ' ' || p.phone)) > 0);
  select coalesce(jsonb_agg(to_jsonb(s)), '[]') into rows from (
    select p.id, p.full_name, p.phone, p.location, p.archived, p.revision, p.updated_at
    from public.customer_profiles p where p.archived = p_archived and (p_location='' or p.location=p_location)
      and (p_query = '' or position(lower(p_query) in lower(p.full_name || ' ' || p.phone)) > 0)
    order by p.updated_at desc, p.id limit 100 offset p_offset
  ) s;
  return jsonb_build_object('profiles', rows, 'total', total);
end $$;

create or replace function public.satis_client_detail(p_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare profile jsonb; links jsonb; activities jsonb; operations jsonb;
begin
  if auth.uid() is null or public.is_satis_app_user() is not true or public.is_satis_owner() is not true
    or coalesce(lower(auth.jwt()->>'email')='satis@pracowniasluchu.pl',false) is not true then
    raise exception 'Clients access denied' using errcode = '42501';
  end if;
  select to_jsonb(p) into profile from public.customer_profiles p where p.id = p_id;
  if profile is null then raise exception 'Nie znaleziono karty klienta.' using errcode = 'P0002'; end if;
  select coalesce(jsonb_agg(to_jsonb(l)), '[]') into links from public.customer_source_links l where l.customer_id = p_id;
  select coalesce(jsonb_agg(to_jsonb(s)), '[]') into activities from (
    select * from public.customer_activities where customer_id = p_id order by coalesce(starts_at, created_at) desc, id limit 200
  ) s;
  insert into public.customer_access_log(customer_id, actor_id, operation) values(p_id, auth.uid(), 'OPEN');
  select coalesce(jsonb_agg(to_jsonb(s)), '[]') into operations from (
    select actor_id, operation, target_id, created_at from public.customer_access_log where customer_id = p_id order by id desc limit 50
  ) s;
  return jsonb_build_object('profile', profile, 'links', links, 'activities', activities, 'operations', operations);
end $$;

create or replace function public.satis_clients_upcoming()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  if auth.uid() is null or public.is_satis_app_user() is not true or public.is_satis_owner() is not true
    or coalesce(lower(auth.jwt()->>'email')='satis@pracowniasluchu.pl',false) is not true then
    raise exception 'Clients access denied' using errcode = '42501';
  end if;
  select coalesce(jsonb_agg(to_jsonb(s)), '[]') into result from (
    select a.id, a.customer_id, p.full_name, a.starts_at, a.duration_minutes, a.location, a.title, a.revision
    from public.customer_activities a join public.customer_profiles p on p.id = a.customer_id
    where a.kind = 'VISIT' and a.status = 'PLANNED' and not p.archived
      and a.starts_at >= now() - interval '30 days' and a.starts_at < now() + interval '90 days'
    order by a.starts_at, a.id limit 500
  ) s;
  return result;
end $$;

create or replace function public.satis_clients_write(
  p_request_id uuid, p_action text, p_id uuid, p_expected_revision bigint, p_data jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
<<client_write>>
declare
  actor uuid := auth.uid(); fp text; request_row public.customer_write_requests%rowtype;
  profile_row public.customer_profiles%rowtype; activity_row public.customer_activities%rowtype;
  cid uuid; source_table text; linked uuid; source_name text; result jsonb;
  starts timestamptz; minutes integer; loc text; kind text; state text; phone text;
begin
  if actor is null or public.is_satis_app_user() is not true or public.is_satis_owner() is not true
    or coalesce(lower(auth.jwt()->>'email')='satis@pracowniasluchu.pl',false) is not true then
    raise exception 'Clients access denied' using errcode = '42501';
  end if;
  if p_request_id is null or p_id is null or p_action is null
    or p_action not in ('PROFILE','ACTIVITY','LINK','UNLINK','DELETE')
    or jsonb_typeof(p_data) is distinct from 'object' or octet_length(p_data::text) > 16384 then
    raise exception 'Invalid client input' using errcode = '22023';
  end if;
  fp := encode(sha256(convert_to(jsonb_build_object('action',p_action,'id',p_id,'revision',p_expected_revision,'data',p_data)::text,'UTF8')),'hex');
  insert into public.customer_write_requests(id,actor_id,fingerprint) values(p_request_id,actor,fp) on conflict do nothing;
  select * into strict request_row from public.customer_write_requests where id=p_request_id for update;
  if request_row.actor_id is distinct from actor or request_row.fingerprint is distinct from fp then
    raise exception 'Request already used' using errcode='22023';
  end if;
  if request_row.result is not null then return request_row.result; end if;
  perform pg_advisory_xact_lock(hashtext('satis-client-record-' || p_id::text));

  if p_action = 'PROFILE' then
    if p_data - array['full_name','phone','street','postal_code','city','location','archived'] <> '{}'::jsonb
      or length(btrim(coalesce(p_data->>'full_name',''))) not between 3 and 160
      or btrim(p_data->>'full_name') !~ '\S+\s+\S+'
      or length(coalesce(p_data->>'street','')) > 240 or length(coalesce(p_data->>'city','')) > 120
      or coalesce(p_data->>'postal_code','') !~ '^([0-9]{2}-[0-9]{3})?$'
      or coalesce(p_data->>'location','') not in ('T12','P50','P63') then
      raise exception 'Sprawdz dane klienta.' using errcode='22023';
    end if;
    phone := regexp_replace(coalesce(p_data->>'phone',''),'[^0-9]','','g');
    if length(phone)=11 and left(phone,2)='48' then phone:=substr(phone,3); end if;
    if phone !~ '^([0-9]{9})?$' then raise exception 'Nieprawidlowy telefon.' using errcode='22023'; end if;
    if phone<>'' then
      perform pg_advisory_xact_lock(hashtext('satis-client-contact-' || lower(btrim(p_data->>'full_name')) || ':' || phone));
      if exists(select 1 from public.customer_profiles p where p.id<>p_id and p.phone=client_write.phone
        and lower(btrim(p.full_name))=lower(btrim(p_data->>'full_name'))) then
        raise exception 'Karta z tym nazwiskiem i telefonem juz istnieje. Sprawdz kartoteke i archiwum.' using errcode='PT423';
      end if;
    end if;
    select * into profile_row from public.customer_profiles where id=p_id for update;
    if (profile_row.id is null and p_expected_revision is not null)
      or (profile_row.id is not null and profile_row.revision is distinct from p_expected_revision) then
      raise exception 'Karta zmienila sie. Wczytaj ja ponownie.' using errcode='PT409';
    end if;
    if coalesce((p_data->>'archived')::boolean,false) and exists(select 1 from public.customer_activities a where a.customer_id=p_id and a.kind='VISIT' and a.status='PLANNED') then
      raise exception 'Najpierw zakoncz lub anuluj zaplanowane wizyty.' using errcode='22023';
    end if;
    insert into public.customer_profiles(id,full_name,phone,street,postal_code,city,location,archived,updated_by)
      values(p_id,btrim(p_data->>'full_name'),phone,btrim(coalesce(p_data->>'street','')),coalesce(p_data->>'postal_code',''),btrim(coalesce(p_data->>'city','')),p_data->>'location',coalesce((p_data->>'archived')::boolean,false),actor)
      on conflict(id) do update set full_name=excluded.full_name,phone=excluded.phone,street=excluded.street,postal_code=excluded.postal_code,city=excluded.city,
        location=excluded.location,archived=excluded.archived,revision=customer_profiles.revision+1,updated_at=clock_timestamp(),updated_by=actor
      returning jsonb_build_object('id',customer_profiles.id,'revision',customer_profiles.revision) into result;
    cid:=p_id;
  elsif p_action = 'ACTIVITY' then
    if p_data - array['customer_id','kind','title','note','starts_at','duration_minutes','location','status','allow_overlap'] <> '{}'::jsonb
      or length(btrim(coalesce(p_data->>'title',''))) not between 1 and 160 or length(coalesce(p_data->>'note','')) > 2000
      or (coalesce(p_data->>'title','') || ' ' || coalesce(p_data->>'note','')) ~ '\m[0-9]{11}\M' then
      raise exception 'Sprawdz opis. Nie wpisuj numeru PESEL w notatkach.' using errcode='22023';
    end if;
    cid:=(p_data->>'customer_id')::uuid;
    select * into profile_row from public.customer_profiles where id=cid for update;
    if profile_row.id is null or profile_row.archived then raise exception 'Karta nie istnieje lub jest zarchiwizowana.' using errcode='22023'; end if;
    kind:=p_data->>'kind'; state:=p_data->>'status'; loc:=p_data->>'location';
    minutes:=coalesce((p_data->>'duration_minutes')::integer,30);
    starts:=nullif(p_data->>'starts_at','')::timestamptz;
    if kind is null or kind not in ('NOTE','VISIT') or state is null or state not in ('PLANNED','COMPLETED','CANCELLED','MISSED')
      or loc is null or loc not in ('T12','P50','P63') or minutes not between 5 and 240
      or (kind='VISIT' and (starts is null or not isfinite(starts))) or (kind='NOTE' and (starts is not null or state<>'COMPLETED')) then
      raise exception 'Nieprawidlowe dane wizyty lub notatki.' using errcode='22023';
    end if;
    select * into activity_row from public.customer_activities where id=p_id for update;
    if (activity_row.id is null and p_expected_revision is not null) or (activity_row.id is not null and
      (activity_row.revision is distinct from p_expected_revision or activity_row.customer_id<>cid or activity_row.kind<>kind)) then
      raise exception 'Wpis zmienil sie. Wczytaj go ponownie.' using errcode='PT409';
    end if;
    if kind='VISIT' and state='PLANNED' then
      perform pg_advisory_xact_lock(hashtext('satis-client-visit-' || loc));
      if exists(select 1 from public.customer_activities a where a.id<>p_id and a.location=loc and a.kind='VISIT' and a.status='PLANNED'
        and tstzrange(a.starts_at,a.starts_at+make_interval(mins=>a.duration_minutes),'[)') && tstzrange(starts,starts+make_interval(mins=>minutes),'[)'))
        and coalesce((p_data->>'allow_overlap')::boolean,false) is not true then
        raise exception 'Termin naklada sie na inna wizyte w tym gabinecie.' using errcode='PT422';
      end if;
    end if;
    insert into public.customer_activities(id,customer_id,kind,title,note,starts_at,duration_minutes,location,status,updated_by)
      values(p_id,cid,kind,btrim(p_data->>'title'),coalesce(p_data->>'note',''),starts,minutes,loc,state,actor)
      on conflict(id) do update set title=excluded.title,note=excluded.note,starts_at=excluded.starts_at,duration_minutes=excluded.duration_minutes,
        location=excluded.location,status=excluded.status,revision=customer_activities.revision+1,updated_at=clock_timestamp(),updated_by=actor
      returning jsonb_build_object('id',customer_activities.id,'revision',customer_activities.revision) into result;
  else
    cid:=p_id;
    select * into profile_row from public.customer_profiles where id=cid for update;
    if profile_row.id is null or profile_row.revision is distinct from p_expected_revision then
      raise exception 'Karta zmienila sie. Wczytaj ja ponownie.' using errcode='PT409';
    end if;
    if p_action='DELETE' then
      if p_data <> '{}'::jsonb then raise exception 'Invalid delete input' using errcode='22023'; end if;
      if exists(select 1 from public.customer_activities a where a.customer_id=cid and a.kind='VISIT' and a.status='PLANNED') then
        raise exception 'Najpierw zakoncz lub anuluj zaplanowane wizyty.' using errcode='22023';
      end if;
      delete from public.customer_profiles where id=cid;
      result:=jsonb_build_object('id',cid,'deleted',true);
    else
      if p_data - array['source_type','source_id'] <> '{}'::jsonb or length(coalesce(p_data->>'source_id','')) not between 1 and 512 then
        raise exception 'Invalid source link' using errcode='22023';
      end if;
      source_table:=case p_data->>'source_type' when 'device' then 'device_records' when 'demo' then 'device_records'
        when 'service' then 'repair_records' when 'loan' then 'loan_contracts' when 'offer' then 'pricing_offer_history'
        when 'order' then 'pricing_order_history' when 'complaint' then 'pricing_complaint_history' else null end;
      if source_table is null then raise exception 'Invalid source' using errcode='22023'; end if;
      if (p_data->>'source_type'='demo' and left(p_data->>'source_id',5)<>'demo-')
        or (p_data->>'source_type'='device' and left(p_data->>'source_id',5)='demo-') then
        raise exception 'Invalid source category' using errcode='22023';
      end if;
      if p_action='LINK' then
        if profile_row.archived then raise exception 'Karta jest zarchiwizowana.' using errcode='22023'; end if;
        execute format('select coalesce(nullif(data->>''customerName'',''''),nullif(data->>''customer'',''''),nullif(data->>''currentUser'','''')) from public.%I where id::text=$1',source_table)
          into source_name using p_data->>'source_id';
        if nullif(btrim(source_name),'') is null then raise exception 'Brak klienta w rekordzie zrodlowym. Odswiez dane.' using errcode='PT409'; end if;
        insert into public.customer_source_links(source_type,source_id,customer_id,linked_by)
          values(p_data->>'source_type',p_data->>'source_id',cid,actor) on conflict do nothing;
        select customer_id into linked from public.customer_source_links where source_type=p_data->>'source_type' and source_id=p_data->>'source_id';
        if linked is distinct from cid then raise exception 'Ten rekord nalezy juz do innej karty. Najpierw wyjasnij powiazanie.' using errcode='PT409'; end if;
      else
        delete from public.customer_source_links where customer_id=cid and source_type=p_data->>'source_type' and source_id=p_data->>'source_id';
      end if;
      update public.customer_profiles set revision=revision+1,updated_at=clock_timestamp(),updated_by=actor where id=cid;
      result:=jsonb_build_object('id',cid);
    end if;
  end if;
  insert into public.customer_access_log(customer_id,actor_id,operation,target_id)
    values(cid,actor,p_action,p_id::text);
  update public.customer_write_requests set result=client_write.result where id=p_request_id;
  return result;
end $$;

revoke all on function public.satis_clients_overview(text,integer,boolean,text), public.satis_client_detail(uuid),
  public.satis_clients_upcoming(), public.satis_clients_write(uuid,text,uuid,bigint,jsonb) from public, anon;
grant execute on function public.satis_clients_overview(text,integer,boolean,text), public.satis_client_detail(uuid),
  public.satis_clients_upcoming(), public.satis_clients_write(uuid,text,uuid,bigint,jsonb) to authenticated;
notify pgrst, 'reload schema';
commit;
