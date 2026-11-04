-- Shared work notes. Run after the SATIS audit migrations. Does not alter existing records.
begin;
create table if not exists public.satis_tasks (
 id uuid primary key, data jsonb not null, revision bigint not null default 1,
 created_at timestamptz not null default clock_timestamp(), created_by text not null,
 updated_at timestamptz not null default clock_timestamp(), updated_by text not null
);
create index if not exists satis_tasks_updated_idx on public.satis_tasks(updated_at desc,id);
create table if not exists public.satis_task_history (
 id bigint generated always as identity primary key, task_id uuid not null,
 at timestamptz not null default clock_timestamp(), actor text not null,
 action text not null, before_data jsonb, after_data jsonb
);
create index if not exists satis_task_history_task_idx on public.satis_task_history(task_id,id desc);
create table if not exists public.satis_task_requests(id uuid primary key,actor uuid not null,fingerprint text not null,result jsonb);
do $$declare t text;begin
 foreach t in array array['satis_tasks','satis_task_history','satis_task_requests'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('alter table public.%I force row level security',t);
 execute format('revoke all on public.%I from public,anon,authenticated',t);
 end loop;
end $$;
create or replace function public.satis_tasks_allowed() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and public.is_satis_app_user() is true and (
 (lower(auth.jwt()->>'email')='satis@pracowniasluchu.pl' and public.is_satis_owner() is true)
 or lower(auth.jwt()->>'email')='gabinet@pracowniasluchu.pl')
$$;
create or replace function public.satis_tasks_list(p_query text default '',p_status text default 'ACTIVE',p_place text default '',p_offset integer default 0)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb; amount bigint;
begin
 if public.satis_tasks_allowed() is not true then raise exception 'Access denied' using errcode='42501';end if;
 if p_query is null or length(p_query)>160 or p_status is null or p_status not in ('ACTIVE','ALL','TODO','IN_PROGRESS','DONE') or p_place is null or p_place not in ('','ALL','T12','P50','P63') or p_offset is null or p_offset<0 or p_offset>100000 then raise exception 'Invalid query' using errcode='22023';end if;
 select count(*) into amount from public.satis_tasks t where (p_status='ALL' or p_status='ACTIVE' and t.data->>'status'<>'DONE' or t.data->>'status'=p_status)
 and (p_place='' or t.data->>'place'=p_place) and (p_query='' or position(lower(p_query) in lower(concat_ws(' ',t.data->>'title',t.data->>'note',t.data->>'assignee')))>0);
 select coalesce(jsonb_agg(to_jsonb(s)),'[]') into result from (
 select t.id,jsonb_set(t.data,'{note}',to_jsonb(left(t.data->>'note',800))) as data,t.revision,t.created_at,t.created_by,t.updated_at,t.updated_by from public.satis_tasks t
 where (p_status='ALL' or p_status='ACTIVE' and t.data->>'status'<>'DONE' or t.data->>'status'=p_status) and (p_place='' or t.data->>'place'=p_place)
 and (p_query='' or position(lower(p_query) in lower(concat_ws(' ',t.data->>'title',t.data->>'note',t.data->>'assignee')))>0)
 order by (t.data->>'important')::boolean desc,nullif(t.data->>'due','')::date asc nulls last,t.updated_at desc,t.id limit 50 offset p_offset) s;
 return jsonb_build_object('rows',result,'total',amount);
end $$;
create or replace function public.satis_task_detail(p_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare task jsonb; history jsonb;
begin
 if public.satis_tasks_allowed() is not true then raise exception 'Access denied' using errcode='42501';end if;
 select to_jsonb(t) into task from public.satis_tasks t where t.id=p_id;
 select coalesce(jsonb_agg(to_jsonb(s)),'[]') into history from (select h.at,h.actor,h.action,h.before_data as before,h.after_data as after from public.satis_task_history h where h.task_id=p_id order by h.id desc limit 30) s;
 return jsonb_build_object('task',task,'history',history);
end $$;
create or replace function public.satis_task_write(p_request_id uuid,p_action text,p_id uuid,p_revision bigint,p_data jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
<<task_write>>
declare actor uuid:=auth.uid(); email text:=lower(auth.jwt()->>'email'); existing public.satis_tasks%rowtype;
 req public.satis_task_requests%rowtype; fp text; result jsonb; pair record; due date;
begin
 if public.satis_tasks_allowed() is not true then raise exception 'Access denied' using errcode='42501';end if;
 if p_action='DELETE' and (public.is_satis_owner() is not true or email<>'satis@pracowniasluchu.pl') then raise exception 'Owner only' using errcode='42501';end if;
 if p_request_id is null or p_id is null or p_action is null or p_action not in ('SAVE','DELETE') or p_data is null or jsonb_typeof(p_data)<>'object' or octet_length(p_data::text)>10000 then raise exception 'Invalid input' using errcode='22023';end if;
 fp:=encode(sha256(convert_to(jsonb_build_object('action',p_action,'id',p_id,'revision',p_revision,'data',p_data)::text,'UTF8')),'hex');
 insert into public.satis_task_requests(id,actor,fingerprint) values(p_request_id,actor,fp) on conflict do nothing;
 select * into strict req from public.satis_task_requests where id=p_request_id for update;
 if req.actor<>actor or req.fingerprint<>fp then raise exception 'Request reused' using errcode='22023';end if;
 if req.result is not null then return req.result;end if;
 perform pg_advisory_xact_lock(hashtext('satis-task-'||p_id::text));
 select * into existing from public.satis_tasks where id=p_id for update;
 if existing.id is null and p_revision is not null or existing.id is not null and existing.revision is distinct from p_revision then raise exception 'Revision conflict' using errcode='PT409';end if;
 if p_action='DELETE' then
 if existing.id is null or p_data<>'{}'::jsonb then raise exception 'Invalid delete' using errcode='22023';end if;
 delete from public.satis_tasks where id=p_id;
 insert into public.satis_task_history(task_id,actor,action,before_data) values(p_id,email,'DELETE',existing.data);
 result:=jsonb_build_object('id',p_id,'deleted',true);
 else
 if p_data-array['title','note','place','assignee','due','status','important']<>'{}'::jsonb or not (p_data ?& array['title','note','place','assignee','due','status','important']) then raise exception 'Invalid fields' using errcode='22023';end if;
 for pair in select * from jsonb_each(p_data) loop
 if pair.key='important' then
 if jsonb_typeof(pair.value)<>'boolean' then raise exception 'Invalid priority' using errcode='22023';end if;
 elsif jsonb_typeof(pair.value)<>'string' then raise exception 'Invalid field type' using errcode='22023';end if;
 end loop;
 if length(btrim(p_data->>'title')) not between 1 and 160 or length(p_data->>'note')>4000 or length(p_data->>'assignee')>100 or p_data->>'place' not in ('ALL','T12','P50','P63') or p_data->>'status' not in ('TODO','IN_PROGRESS','DONE') then raise exception 'Invalid task' using errcode='22023';end if;
 if p_data->>'due'<>'' then
 if p_data->>'due' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception 'Invalid date' using errcode='22023';end if;
 begin due:=(p_data->>'due')::date;exception when others then raise exception 'Invalid date' using errcode='22023';end;
 end if;
 insert into public.satis_tasks(id,data,created_by,updated_by) values(p_id,p_data,email,email)
 on conflict(id) do update set data=excluded.data,revision=satis_tasks.revision+1,updated_at=clock_timestamp(),updated_by=email
 returning jsonb_build_object('id',id,'revision',revision) into result;
 insert into public.satis_task_history(task_id,actor,action,before_data,after_data) values(p_id,email,case when existing.id is null then 'CREATE' else 'UPDATE' end,existing.data,p_data);
 end if;
 update public.satis_task_requests set result=task_write.result where id=p_request_id;
 return result;
end $$;
revoke all on function public.satis_tasks_allowed() from public,anon,authenticated;
revoke all on function public.satis_tasks_list(text,text,text,integer) from public,anon;
revoke all on function public.satis_task_detail(uuid) from public,anon;
revoke all on function public.satis_task_write(uuid,text,uuid,bigint,jsonb) from public,anon;
grant execute on function public.satis_tasks_list(text,text,text,integer) to authenticated;
grant execute on function public.satis_task_detail(uuid) to authenticated;
grant execute on function public.satis_task_write(uuid,text,uuid,bigint,jsonb) to authenticated;
commit;
