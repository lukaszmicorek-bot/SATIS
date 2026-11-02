-- Korespondencja PCPR: prywatna baza osob SATIS. Bez zmiany innych tabel.
-- Uruchomic jednorazowo w SQL Editor, po migracjach zabezpieczen SATIS.
begin;
create table if not exists public.mail_merge_people (
  id uuid primary key,
  data jsonb not null check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 16384),
  revision bigint not null default 1,
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  updated_by uuid not null
);
create unique index if not exists mail_merge_people_pesel_idx on public.mail_merge_people ((data->>'pesel'))
  where coalesce(data->>'pesel','') <> '';
create index if not exists mail_merge_people_updated_idx on public.mail_merge_people(updated_at desc,id);
create table if not exists public.mail_merge_write_requests (
  id uuid primary key,
  actor_id uuid not null,
  fingerprint text not null,
  result jsonb
);
create table if not exists public.mail_merge_access_log (
  id bigint generated always as identity primary key,
  person_id uuid not null,
  actor_id uuid not null,
  operation text not null check (operation in ('OPEN','SAVE','DELETE')),
  created_at timestamptz not null default clock_timestamp()
);
do $$ declare t text; begin
  foreach t in array array['mail_merge_people','mail_merge_write_requests','mail_merge_access_log'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('alter table public.%I force row level security',t);
    execute format('revoke all on public.%I from public, anon, authenticated',t);
  end loop;
end $$;

create or replace function public.satis_mail_merge_list(p_query text default '',p_offset integer default 0)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb; total bigint;
begin
  if auth.uid() is null or public.is_satis_app_user() is not true or public.is_satis_owner() is not true
    or coalesce(lower(auth.jwt()->>'email')='satis@pracowniasluchu.pl',false) is not true then
    raise exception 'Access denied' using errcode='42501';
  end if;
  if p_query is null or length(p_query)>160 or p_offset is null or p_offset<0 or p_offset>100000 then
    raise exception 'Invalid query' using errcode='22023';
  end if;
  select count(*) into total from public.mail_merge_people p
    where p_query='' or position(lower(p_query) in lower(concat_ws(' ',p.data->>'firstName',p.data->>'middleName',p.data->>'surname',p.data->>'pesel',p.data->>'phone',p.data->>'applicationNumber',p.data->>'orderNumber',p.data->>'city',p.data->>'subject'))) > 0;
  select coalesce(jsonb_agg(to_jsonb(s)),'[]') into result from (
    select p.id,p.revision,p.updated_at,right(p.data->>'pesel',4) as pesel_tail,
      jsonb_build_object('firstName',p.data->>'firstName','middleName',p.data->>'middleName','surname',p.data->>'surname',
        'phone',p.data->>'phone','city',p.data->>'city','degree',p.data->>'degree','applicationNumber',p.data->>'applicationNumber','subject',p.data->>'subject') as data
    from public.mail_merge_people p
    where p_query='' or position(lower(p_query) in lower(concat_ws(' ',p.data->>'firstName',p.data->>'middleName',p.data->>'surname',p.data->>'pesel',p.data->>'phone',p.data->>'applicationNumber',p.data->>'orderNumber',p.data->>'city',p.data->>'subject'))) > 0
    order by p.updated_at desc,p.id limit 50 offset p_offset
  ) s;
  return jsonb_build_object('rows',result,'total',total);
end $$;

create or replace function public.satis_mail_merge_detail(p_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb;
begin
  if auth.uid() is null or public.is_satis_app_user() is not true or public.is_satis_owner() is not true
    or coalesce(lower(auth.jwt()->>'email')='satis@pracowniasluchu.pl',false) is not true then
    raise exception 'Access denied' using errcode='42501';
  end if;
  select jsonb_build_object('id',p.id,'revision',p.revision,'data',p.data) into result from public.mail_merge_people p where p.id=p_id;
  if result is null then raise exception 'Not found' using errcode='P0002'; end if;
  insert into public.mail_merge_access_log(person_id,actor_id,operation) values(p_id,auth.uid(),'OPEN');
  return result;
end $$;

create or replace function public.satis_mail_merge_write(p_request_id uuid,p_action text,p_id uuid,p_expected_revision bigint,p_data jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
<<merge_write>>
declare actor uuid:=auth.uid(); fp text; req public.mail_merge_write_requests%rowtype; person public.mail_merge_people%rowtype;
  result jsonb; pair record; digits text; checksum integer; i integer; weights integer[]:=array[1,3,7,9,1,3,7,9,1,3];
  yy integer; mm integer; dd integer; birth date; clean jsonb; amount numeric; cost numeric; nfz numeric; requested numeric;
begin
  if actor is null or public.is_satis_app_user() is not true or public.is_satis_owner() is not true
    or coalesce(lower(auth.jwt()->>'email')='satis@pracowniasluchu.pl',false) is not true then
    raise exception 'Access denied' using errcode='42501';
  end if;
  if p_request_id is null or p_id is null or p_action is null or p_action not in ('SAVE','DELETE')
    or jsonb_typeof(p_data) is distinct from 'object' or octet_length(p_data::text)>16384 then
    raise exception 'Invalid input' using errcode='22023';
  end if;
  fp:=encode(sha256(convert_to(jsonb_build_object('action',p_action,'id',p_id,'revision',p_expected_revision,'data',p_data)::text,'UTF8')),'hex');
  insert into public.mail_merge_write_requests(id,actor_id,fingerprint) values(p_request_id,actor,fp) on conflict do nothing;
  select * into strict req from public.mail_merge_write_requests where id=p_request_id for update;
  if req.actor_id is distinct from actor or req.fingerprint is distinct from fp then raise exception 'Request reused' using errcode='22023';end if;
  if req.result is not null then return req.result;end if;
  perform pg_advisory_xact_lock(hashtext('satis-mail-merge-'||p_id::text));
  select * into person from public.mail_merge_people where id=p_id for update;
  if (person.id is null and p_expected_revision is not null) or (person.id is not null and person.revision is distinct from p_expected_revision) then
    raise exception 'Revision conflict' using errcode='PT409';
  end if;
  if p_action='DELETE' then
    if p_data<>'{}'::jsonb or person.id is null then raise exception 'Invalid delete' using errcode='22023';end if;
    delete from public.mail_merge_people where id=p_id;
    result:=jsonb_build_object('id',p_id,'deleted',true);
  else
    if p_data - array['personRole','firstName','middleName','surname','pesel','province','county','municipality','city','street','house','flat','postal','postOffice','phone','email','applicationNumber','degree','certificateNumber','certificateValidity','certificateUntil','subject','orderNumber','cost','nfz','requested','sameAddress'] <> '{}'::jsonb
      or length(btrim(coalesce(p_data->>'firstName',''))) not between 1 and 100
      or length(btrim(coalesce(p_data->>'surname',''))) not between 1 and 160
      or coalesce(p_data->>'personRole','') not in ('applicant','ward')
      or coalesce(p_data->>'degree','') not in ('','severe','moderate','mild','none')
      or coalesce(p_data->>'certificateValidity','') not in ('','indefinite','periodic') then
      raise exception 'Invalid fields' using errcode='22023';
    end if;
    clean:='{}'::jsonb;
    for pair in select * from jsonb_each(p_data) loop
      if pair.key='sameAddress' then
        if jsonb_typeof(pair.value)<>'boolean' then raise exception 'Invalid checkbox' using errcode='22023';end if;
        clean:=clean||jsonb_build_object(pair.key,pair.value);
      else
        if jsonb_typeof(pair.value)<>'string' or length(pair.value#>>'{}') > (case when pair.key in ('subject','orderNumber') then 1000 else 240 end) then
          raise exception 'Invalid field type or length' using errcode='22023';
        end if;
        clean:=clean||jsonb_build_object(pair.key,btrim(pair.value#>>'{}'));
      end if;
    end loop;
    digits:=coalesce(clean->>'pesel','');
    if digits<>'' then
      if digits !~ '^[0-9]{11}$' then raise exception 'Invalid PESEL' using errcode='22023';end if;
      checksum:=0;for i in 1..10 loop checksum:=checksum+substr(digits,i,1)::integer*weights[i];end loop;
      if (10-checksum%10)%10<>right(digits,1)::integer then raise exception 'Invalid PESEL' using errcode='22023';end if;
      yy:=left(digits,2)::integer;mm:=substr(digits,3,2)::integer;dd:=substr(digits,5,2)::integer;
      if mm between 1 and 12 then yy:=yy+1900;
      elsif mm between 21 and 32 then yy:=yy+2000;mm:=mm-20;
      elsif mm between 41 and 52 then yy:=yy+2100;mm:=mm-40;
      elsif mm between 61 and 72 then yy:=yy+2200;mm:=mm-60;
      elsif mm between 81 and 92 then yy:=yy+1800;mm:=mm-80;
      else raise exception 'Invalid PESEL date' using errcode='22023';end if;
      begin birth:=make_date(yy,mm,dd);exception when others then raise exception 'Invalid PESEL date' using errcode='22023';end;
      if birth>(clock_timestamp() at time zone 'Europe/Warsaw')::date then raise exception 'Future birth' using errcode='22023';end if;
    end if;
    if coalesce(clean->>'postal','') !~ '^([0-9]{2}-[0-9]{3})?$' then raise exception 'Invalid postal code' using errcode='22023';end if;
    digits:=regexp_replace(coalesce(clean->>'phone',''),'[^0-9]','','g');
    if digits !~ '^((48|0048)?[0-9]{9})?$' then raise exception 'Invalid phone' using errcode='22023';end if;
    if coalesce(clean->>'email','')<>'' and clean->>'email' !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
      raise exception 'Invalid email' using errcode='22023';
    end if;
    for pair in select key,value from jsonb_each_text(clean) where key in ('cost','nfz','requested') loop
      digits:=replace(regexp_replace(pair.value,'[[:space:]  ]','','g'),',','.');
      if right(digits,2)='zł' then digits:=left(digits,length(digits)-2);end if;
      if digits<>'' then
        if digits !~ '^[0-9]+(\.[0-9]{1,2})?$' or length(digits)>16 then raise exception 'Invalid amount' using errcode='22023';end if;
        amount:=digits::numeric;if amount*100>9007199254740991 then raise exception 'Amount too large' using errcode='22023';end if;
        if pair.key='cost' then cost:=amount;elsif pair.key='nfz' then nfz:=amount;else requested:=amount;end if;
        clean:=clean||jsonb_build_object(pair.key,digits);
      end if;
    end loop;
    if nfz+requested>cost then raise exception 'Grant exceeds cost' using errcode='22023';end if;
    begin
      insert into public.mail_merge_people(id,data,updated_by) values(p_id,clean,actor)
      on conflict(id) do update set data=excluded.data,revision=mail_merge_people.revision+1,updated_at=clock_timestamp(),updated_by=actor
      returning jsonb_build_object('id',mail_merge_people.id,'revision',mail_merge_people.revision) into result;
    exception when unique_violation then raise exception 'Duplicate person' using errcode='PT423';end;
  end if;
  insert into public.mail_merge_access_log(person_id,actor_id,operation) values(p_id,actor,p_action);
  update public.mail_merge_write_requests set result=merge_write.result where id=p_request_id;
  return result;
end $$;

revoke all on function public.satis_mail_merge_list(text,integer) from public,anon;
revoke all on function public.satis_mail_merge_detail(uuid) from public,anon;
revoke all on function public.satis_mail_merge_write(uuid,text,uuid,bigint,jsonb) from public,anon;
grant execute on function public.satis_mail_merge_list(text,integer) to authenticated;
grant execute on function public.satis_mail_merge_detail(uuid) to authenticated;
grant execute on function public.satis_mail_merge_write(uuid,text,uuid,bigint,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
