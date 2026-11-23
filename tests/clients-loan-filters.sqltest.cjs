// Isolated PostgreSQL (PGlite); no production connection, credentials or patient data.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {randomUUID}=require('node:crypto'),{PGlite}=require('@electric-sql/pglite');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const migration=read('supabase-clients-loan-filters.sql'),base=read('supabase-clients-audit.sql');
function sqlFunction(name){const start=base.indexOf('create or replace function public.'+name+'(');assert.ok(start>=0);return base.slice(start,base.indexOf('$$;',start)+3);}
test('follow-up search: owner access, explicit links, latest contract, combined filters and complete pagination',async()=>{
 const db=new PGlite(),owner=randomUUID(),staff=randomUUID(),a=randomUUID(),b=randomUUID(),legacy=randomUUID(),unlinked=randomUUID(),fresh=randomUUID(),archived=randomUUID();
 const login=async(id=owner,email='satis@pracowniasluchu.pl')=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claims',$1,false)",[JSON.stringify({sub:id,email})]);await db.exec('set role authenticated');};
 const search=async(options={})=>(await db.query('select public.satis_clients_follow_up_search($1,$2,$3,$4,array(select jsonb_array_elements_text($5::jsonb)),$6,$7,$8) r',
  [options.query||'',options.offset??0,options.archived??false,options.place||'',JSON.stringify(options.names||[]),options.work||'',Object.hasOwn(options,'decision')?options.decision:'',Object.hasOwn(options,'nfz')?options.nfz:''])).rows[0].r;
 const rejected=(promise,code)=>assert.rejects(promise,error=>error.code===code);
 const profile=async(id,name,place='P63',isArchived=false)=>db.query('insert into public.customer_profiles values($1,$2,$3,$4,$5,1,$6)',[id,name,'500600700',place,isArchived,'2026-11-23T10:00:00Z']);
 const loan=async(id,customer,date,followUp={},extra={})=>{
  await db.query('insert into public.loan_contracts values($1,$2,$3)',[id,JSON.stringify({customer:'Ta sama osoba',periodFrom:date,date,followUp,...extra}),'2026-11-23T10:00:00Z']);
  if(customer)await db.query("insert into public.customer_source_links values('loan',$1,$2)",[id,customer]);
 };
 try{
  await db.exec(`create role anon nologin;create role authenticated nologin;create schema auth;
   create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
   create function auth.uid() returns uuid language sql stable as $$select (auth.jwt()->>'sub')::uuid$$;
   create function public.is_satis_app_user() returns boolean language sql stable as $$select auth.uid() is not null$$;
   create function public.is_satis_owner() returns boolean language sql stable as $$select auth.uid()='${owner}'::uuid$$;
   grant usage on schema auth,public to authenticated,anon;
   create table public.customer_profiles(id uuid primary key,full_name text,phone text,location text,archived boolean,revision bigint,updated_at timestamptz);
   create table public.customer_source_links(source_type text,source_id text,customer_id uuid);
   create table public.loan_contracts(id text primary key,data jsonb,updated_at timestamptz);
   alter table public.customer_profiles enable row level security;alter table public.customer_profiles force row level security;
   alter table public.customer_source_links enable row level security;alter table public.customer_source_links force row level security;
   alter table public.loan_contracts enable row level security;alter table public.loan_contracts force row level security;
   revoke all on public.customer_profiles,public.customer_source_links,public.loan_contracts from public,anon,authenticated;
   create function public.satis_clients_audit_filter(p_id uuid,p_filter text) returns boolean language sql stable as $$select p_filter in ('','ALL') or (p_filter='CONTACT' and p_id='${a}'::uuid)$$;`);
  await db.exec(sqlFunction('satis_clients_audit_owner'));await db.exec(sqlFunction('satis_clients_audit_day'));
  await db.exec('revoke all on function public.satis_clients_audit_owner(),public.satis_clients_audit_day(text) from public,anon,authenticated');
  await db.exec(migration);await db.exec(migration);
  await profile(a,'Ta sama osoba');await profile(b,'Ta sama osoba','P50');await profile(legacy,'Starsza karta');await profile(unlinked,'Ta sama osoba');await profile(fresh,'Nowa umowa');await profile(archived,'Archiwalna karta','T12',true);
  await loan('a-old',a,'2026-10-01',{purchaseDecision:'DECLINED',nfzStatus:'WAITING'});
  await loan('a-new',a,'2026-11-15',{purchaseDecision:'DECIDED',nfzStatus:'READY'});
  await db.query("update public.loan_contracts set updated_at='2026-12-01T10:00:00Z' where id='a-old'");
  await loan('b-one',b,'2026-11-15',{purchaseDecision:'DECLINED',nfzStatus:'WAITING'});
  await loan('legacy',legacy,'2025-01-01');await loan('not-linked',null,'2026-11-22',{purchaseDecision:'DECLINED',nfzStatus:'WAITING'});
  await loan('fresh-old',fresh,'2026-10-01',{purchaseDecision:'DECLINED',nfzStatus:'READY'});
  await loan('fresh-new',fresh,'2026-11-21',{}, {periodFrom:'',date:'2026-11-21'});
  await loan('archived',archived,'2026-11-15',{purchaseDecision:'DECIDED',nfzStatus:'READY'});
  await login();
  let result=await search({decision:'DECIDED',nfz:'READY'});assert.equal(result.total,1);assert.equal(result.profiles[0].id,a);
  result=await search({decision:'DECLINED'});assert.deepEqual(result.profiles.map(row=>row.id),[b]);
  assert.equal((await search({nfz:'WAITING',place:'P63'})).total,0);assert.equal((await search({nfz:'WAITING',place:'P50'})).total,1);
  result=await search({decision:'NONE',nfz:'NONE'});assert.equal(result.total,3);assert.ok(result.profiles.some(row=>row.id===unlinked));assert.ok(result.profiles.some(row=>row.id===fresh));
  assert.equal((await search({decision:'DECIDED',work:'CONTACT'})).total,1);assert.equal((await search({decision:'DECLINED',work:'CONTACT'})).total,0);
  assert.equal((await search({decision:'DECIDED',archived:true})).total,1);
  assert.equal((await search({decision:'DECIDED',query:'NO MATCH'})).total,0);
  assert.equal((await search({decision:'DECIDED',query:'MODEL',names:['Ta sama osoba']})).total,1);
  assert.deepEqual(Object.keys((await search({decision:'DECIDED'})).profiles[0]).sort(),['archived','full_name','id','location','nfz_status','phone','purchase_decision','revision','updated_at']);
  for(const bad of [{decision:'BAD'},{nfz:'BAD'},{offset:-1},{offset:100001},{decision:null},{nfz:null}])await rejected(search(bad),'22023');
  await db.exec('reset role');
  for(let i=0;i<120;i++){const id=randomUUID();await profile(id,'Osoba Testowa '+i);await loan('batch-'+i,id,'2026-11-15',{purchaseDecision:'DECIDED',nfzStatus:'READY'});}
  await login();const first=await search({decision:'DECIDED',nfz:'READY'}),second=await search({decision:'DECIDED',nfz:'READY',offset:100});
  assert.equal(first.total,121);assert.equal(second.total,121);assert.equal(first.profiles.length,100);assert.equal(second.profiles.length,21);
  assert.equal(new Set([...first.profiles,...second.profiles].map(row=>row.id)).size,121);
  await rejected(db.query('select * from public.customer_profiles'),'42501');
  for(const [id,email]of [[staff,'gabinet@pracowniasluchu.pl'],[owner,'other@example.invalid']]){await login(id,email);await rejected(search({decision:'DECIDED'}),'42501');}
  await db.exec('reset role;set role anon');await rejected(search(),'42501');
 }finally{await db.close();}
});
