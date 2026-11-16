const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const migration=fs.readFileSync(path.join(__dirname,'../supabase-client-journey.sql'),'utf8');
test('journey storage is SATIS-only with forced RLS, explicit grants, strict JSON, revisions and idempotency',()=>{
 assert.equal((migration.match(/public.is_satis_owner\(\) is not true/g)||[]).length,2);
 assert.equal((migration.match(/lower\(auth.jwt\(\)->>'email'\)='satis@pracowniasluchu.pl'/g)||[]).length,2);
 assert.equal((migration.match(/force row level security/g)||[]).length,2);
 assert.match(migration,/revoke all on public.customer_journeys,public.customer_journey_events from public,anon,authenticated/);
 assert.match(migration,/fingerprint is distinct from fp/);assert.match(migration,/revision is distinct from p_expected_revision/);
 assert.match(migration,/kind='VISIT'/);assert.match(migration,/customer_id=p_customer_id and kind='VISIT'/);
 assert.doesNotMatch(migration,/grant (select|insert|update|delete|all) on|drop table|truncate|update public.device_records/i);
});
const pg='/opt/homebrew/opt/postgresql@17/bin';
test('isolated PostgreSQL: save/retry/history/conflict/privacy/cascade; production is never contacted',{
 skip:!fs.existsSync(`${pg}/initdb`)||process.getuid?.()===0?'Local PostgreSQL unavailable':false
},()=>{
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'satis-journey-test-'));fs.chmodSync(folder,0o700);let started=false;
 function run(tool,args,input){const r=spawnSync(`${pg}/${tool}`,args,{input,encoding:'utf8',timeout:30000});assert.equal(r.status,0,r.stderr||r.error||r.stdout);return r.stdout;}
 const sql=text=>run('psql',['-h',folder,'-p','56396','-d','postgres','-X','-v','ON_ERROR_STOP=1','-q'],text);
 const owner=`set role authenticated;select set_config('test.uid','00000000-0000-0000-0000-000000000001',false);select set_config('test.email','satis@pracowniasluchu.pl',false);`;
 const client='20000000-0000-0000-0000-000000000001',request='10000000-0000-0000-0000-000000000001';
 const data=require('../client-journey.js').normalize({started_on:'2026-11-16'},'2026-11-16');const payload=JSON.stringify(data).replace(/'/g,"''");
 try{
  run('initdb',['-D',path.join(folder,'db'),'-A','trust','--no-locale','--encoding=UTF8']);
  run('pg_ctl',['-D',path.join(folder,'db'),'-l',path.join(folder,'server.log'),'-o',`-c listen_addresses='' -k ${folder} -p 56396`,'-w','start']);started=true;
  sql(`create role anon;create role authenticated;create schema auth;
   create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('test.uid',true),'')::uuid$$;
   create function auth.jwt() returns jsonb language sql stable as $$select jsonb_build_object('email',current_setting('test.email',true))$$;
   grant usage on schema auth to public;grant execute on all functions in schema auth to public;
   create function public.is_satis_app_user() returns boolean language sql stable as $$select auth.uid() is not null$$;
   create function public.is_satis_owner() returns boolean language sql stable as $$select auth.uid()='00000000-0000-0000-0000-000000000001'::uuid$$;`);
  sql(fs.readFileSync(path.join(__dirname,'../supabase-clients.sql'),'utf8'));sql(migration);sql(migration);
  sql(`${owner}select public.satis_clients_write('30000000-0000-0000-0000-000000000001','PROFILE','${client}',null,'{"full_name":"Klient Testowy","location":"P63"}');
   do $$declare r jsonb;begin
    if public.satis_client_journey_read('${client}')->'journey'<>'null'::jsonb then raise exception 'Invented journey';end if;
    r:=public.satis_client_journey_write('${client}','${request}',null,'${payload}');
    if r->'journey'->>'revision'<>'1' then raise exception 'Bad revision';end if;
    r:=public.satis_client_journey_write('${client}','${request}',null,'${payload}');
    if r->'journey'->>'revision'<>'1' then raise exception 'Retry created duplicate';end if;
    r:=public.satis_client_journey_read('${client}');
    if jsonb_array_length(r->'events')<>1 or r->'events'->0->>'actor_email'<>'satis@pracowniasluchu.pl' then raise exception 'Audit missing';end if;
    begin perform public.satis_client_journey_write('${client}','10000000-0000-0000-0000-000000000002',0,'${payload}');raise exception 'Stale version accepted';exception when sqlstate 'PT409' then null;end;
    begin perform public.satis_client_journey_write('${client}','10000000-0000-0000-0000-000000000003',1,'${payload}'::jsonb||'{"pesel":"00000000000"}');raise exception 'Arbitrary PII accepted';exception when sqlstate '22023' then null;end;
    begin perform public.satis_client_journey_write('${client}','10000000-0000-0000-0000-000000000004',1,'${payload}'::jsonb||'{"visit_id":"foreign-visit"}');raise exception 'Foreign visit accepted';exception when sqlstate '22023' then null;end;
    begin perform public.satis_client_journey_write('${client}','10000000-0000-0000-0000-000000000005',1,'${payload}'::jsonb||'{"confirmations":{"rodo":"yes"}}');raise exception 'Bad flags accepted';exception when sqlstate '22023' then null;end;
    r:=public.satis_client_journey_write('${client}','10000000-0000-0000-0000-000000000006',1,'${payload}'::jsonb||'{"interest":"INTERESTED"}');
    if r->'journey'->>'revision'<>'2' then raise exception 'Second revision missing';end if;
   end$$;`);
  sql(migration);
  sql(`${owner}do $$begin if jsonb_array_length(public.satis_client_journey_read('${client}')->'events')<>2 then raise exception 'Repeated migration erased history';end if;
   begin perform 1 from public.customer_journeys;raise exception 'Direct table read allowed';exception when insufficient_privilege then null;end;
   end$$;
   select set_config('test.uid','00000000-0000-0000-0000-000000000002',false);select set_config('test.email','gabinet@pracowniasluchu.pl',false);
   do $$begin
    begin perform public.satis_client_journey_read('${client}');raise exception 'Staff read allowed';exception when insufficient_privilege then null;end;
    begin perform public.satis_client_journey_write('${client}','10000000-0000-0000-0000-000000000007',2,'${payload}');raise exception 'Staff write allowed';exception when insufficient_privilege then null;end;
   end$$;
   reset role;set role anon;do $$begin begin perform public.satis_client_journey_read('${client}');raise exception 'Anonymous read allowed';exception when insufficient_privilege then null;end;end$$;`);
  if(process.env.SATIS_LIFECYCLE_RESULT){
   const report=JSON.parse(fs.readFileSync(process.env.SATIS_LIFECYCLE_RESULT,'utf8'));
   assert.equal(report.client,'Klient Demonstracyjny');assert.deepEqual(report.issues,[]);
   const visit='40000000-0000-0000-0000-000000000001';
   sql(`insert into public.customer_activities(id,customer_id,kind,title,starts_at,location,status,updated_by)
     values('${visit}','${client}','VISIT','Testowa wizyta odbioru','2026-11-04T10:00:00Z','P63','COMPLETED','00000000-0000-0000-0000-000000000001');`);
   let revision=2;
   for(const [index,snapshot]of report.snapshots.entries()){
    const data={...snapshot.state,visit_id:snapshot.state.visit_id?visit:''},body=JSON.stringify(data).replace(/'/g,"''"),id=`90000000-0000-0000-0000-${String(index+1).padStart(12,'0')}`;
    const check=sql(`${owner}select public.satis_client_journey_write('${client}','${id}',${revision},'${body}');
     do $$declare r jsonb;begin r:=public.satis_client_journey_read('${client}');
     if (r->'journey'->>'revision')::bigint<>${revision+1} or r->'journey'->'data'<>'${body}'::jsonb then raise exception 'Lifecycle state not persisted';end if;end$$;`);
    assert.ok(check);revision++;
   }
   console.log(`OK: ${report.snapshots.length} etapow scenariusza zapisanych i odczytanych przez prywatne RPC lokalnego PostgreSQL.`);
  }
  sql(`${owner}select public.satis_clients_write('30000000-0000-0000-0000-000000000002','DELETE','${client}',1,'{}');reset role;
   do $$begin if exists(select 1 from public.customer_journeys) or exists(select 1 from public.customer_journey_events) then raise exception 'Erasure left journey PII';end if;end$$;`);
 }finally{if(started)run('pg_ctl',['-D',path.join(folder,'db'),'-m','immediate','-w','stop']);fs.rmSync(folder,{recursive:true,force:true});}
});
