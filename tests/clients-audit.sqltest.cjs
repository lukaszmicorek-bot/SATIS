// Isolated PostgreSQL (PGlite): no credentials, network, or production API.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {randomUUID} = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {PGlite} = require(process.env.PGLITE_MODULE || '@electric-sql/pglite');
const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const owner = '00000000-0000-0000-0000-000000000001';
const staff = '00000000-0000-0000-0000-000000000002';
const base = {kind:'PURCHASE',started_on:'2026-11-17',interest:'UNKNOWN',referral:'UNKNOWN',
  trial_required:false,devices_required:1,device_ids:[],visit_id:'',
  confirmations:{rodo:false,fitting:false,receipt:false,instructions:false,warranty:false,care:false}};

test('clients audit upgrade: legacy compatibility, case isolation, atomic reservations, retries, erasure and access', async () => {
  const db = new PGlite();
  const one = async (sql, args=[]) => (await db.query(sql,args)).rows[0];
  const value = async (sql,args=[]) => (await one(sql,args)).r;
  const login = async (uid=owner,email='satis@pracowniasluchu.pl') => {
    await db.exec('reset role');
    await db.query("select set_config('request.jwt.claims',$1,false)",[JSON.stringify({sub:uid,email})]);
    await db.exec('set role authenticated');
  };
  const denied = (p,code) => assert.rejects(p,e=>e.code===code,`Expected SQLSTATE ${code}`);
  const clients = (action,id,revision,data,request=randomUUID()) => value(
    'select satis_clients_write($1,$2,$3,$4::bigint,$5::jsonb) r',[request,action,id,revision,JSON.stringify(data)]);
  const journey = (id,revision,data,request=randomUUID()) => value(
    'select satis_client_journey_write($1,$2,$3::bigint,$4::jsonb) r',[id,request,revision,JSON.stringify(data)]);
  const current = id => value('select satis_client_journey_read($1) r',[id]);
  const caseRead = (id,cid) => value('select satis_client_journey_case_read($1,$2) r',[id,cid]);
  const deviceChange = (id,data,expectedRevision=1) => ({table:'device_records',id,data,expectedRevision,delete:false});
  const reserve = (id,profileRevision,revision,data,changes,request=randomUUID(),station='Local test') => value(
    'select satis_client_journey_reserve($1,$2,$3::bigint,$4::bigint,$5::jsonb,$6::jsonb,$7) r',
    [id,request,revision,profileRevision,JSON.stringify(data),JSON.stringify(changes),station]);
  const records = (changes,request=randomUUID()) => value('select satis_write_records($1,$2::jsonb,$3) r',[request,JSON.stringify(changes),'Local test']);
  try {
    await db.exec(`create role anon nologin;create role authenticated nologin;
      create schema auth;create schema storage;
      create table auth.users(id uuid primary key,email text);
      create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
      create function auth.uid() returns uuid language sql stable as $$select (auth.jwt()->>'sub')::uuid$$;
      grant usage on schema auth,public to authenticated,anon;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid,bucket_id text,owner_id text);
      alter table storage.objects enable row level security;
      create publication supabase_realtime;
      alter default privileges in schema public grant select,insert,update,delete,truncate,references,trigger on tables to authenticated;
      insert into auth.users values('${owner}','satis@pracowniasluchu.pl'),('${staff}','staff@example.test');`);
    for (const file of ['supabase-schema.sql','supabase-security-hardening.sql','supabase-document-write-guards.sql',
      'supabase-private-payments.sql','supabase-audit-log.sql','supabase-audit-core.sql','supabase-clients.sql',
      'supabase-client-journey.sql','supabase-client-schedule.sql']) await db.exec(read(file));
    await login();
    const customer=randomUUID(),legacyRequest=randomUUID();
    await clients('PROFILE',customer,null,{full_name:'Legacy Customer',location:'P63'});
    const legacy=await journey(customer,null,base,legacyRequest);
    assert.equal(legacy.journey.revision,1);
    // Upgrade an already populated deployment, not a fresh replacement schema.
    await db.exec('reset role');
    const migration=read('supabase-clients-audit.sql');
    await db.exec(migration);await db.exec(migration);
    await login();
    let view=await current(customer);
    assert.equal(view.case_support,true);
    assert.equal(view.cases.length,1);
    assert.equal(view.journey.legacy_matching,true);
    assert.deepEqual(view.journey.data,base);
    assert.equal((await journey(customer,null,base,legacyRequest)).journey.revision,1);
    assert.equal((await journey(customer,1,{...base,interest:'INTERESTED'})).journey.revision,2);
    const oldCase=view.journey.case_id;
    const newData={...base,case_id:randomUUID(),source_keys:[]};
    const createRequest=randomUUID();
    const fresh=await journey(customer,null,newData,createRequest);
    assert.equal(fresh.journey.case_id,newData.case_id);
    assert.equal(fresh.journey.legacy_matching,false);
    assert.equal(fresh.journey.revision,1);
    view=await current(customer);
    assert.equal(view.cases.length,2);
    assert.equal(view.selected_case_id,newData.case_id);
    assert.equal(view.events.length,1);
    const historical=await caseRead(customer,oldCase);
    assert.equal(historical.journey.archived,true);
    assert.equal(historical.events.length,2);
    assert.equal(historical.journey.data.source_keys,undefined);
    await denied(journey(customer,2,base),'PT409');
    await denied(journey(customer,2,{...newData,case_id:oldCase}),'PT409');
    await denied(journey(customer,1,{...newData,source_keys:['bogus:x']}),'22023');
    await denied(journey(customer,1,{...newData,case_id:'bad'}),'22023');
    await denied(journey(customer,1,{...newData,source_keys:undefined}),'22023');
    await denied(journey(customer,null,newData,legacyRequest),'22023');
    await denied(journey(customer,1,{...newData,visit_id:randomUUID()}),'22023');
    const other=randomUUID();
    await clients('PROFILE',other,null,{full_name:'Other Customer',location:'P50'});
    assert.equal((await current(other)).case_support,true);
    assert.equal((await current(other)).journey,null);
    assert.deepEqual((await current(other)).cases,[]);
    await denied(caseRead(other,newData.case_id),'P0002');
    await denied(journey(other,1,newData),'PT409');
    let search=await value("select satis_clients_search('serial',0,false,'',array['LEGACY CUSTOMER']) r");
    assert.equal(search.total,1);
    search=await value("select satis_clients_search('serial',0,false,'P50',array['Legacy Customer']) r");
    assert.equal(search.total,0);
    assert.equal((await value("select satis_clients_overview('serial') r")).total,0);
    await denied(value("select satis_clients_search('',-1) r"),'22023');
    const filters={};
    // Synthetic source rows exercise explicit links without document-form guards.
    await db.exec('reset role');
    for(const filter of ['CONTACT','NFZ','VISIT','PICKUP','OVERDUE']) {
      const id=filters[filter]=randomUUID();
      await db.query('insert into customer_profiles(id,full_name,location,updated_by) values($1,$2,$3,$4)',
        [id,`${filter} Filter`,'P63',owner]);
      if(['NFZ','VISIT'].includes(filter)) {
        const visit=randomUUID();
        await db.query('insert into customer_journeys(customer_id,data,updated_by) values($1,$2::jsonb,$3)',
          [id,JSON.stringify({...base,referral:filter==='NFZ'?'REQUESTED':'UNKNOWN',visit_id:filter==='VISIT'?visit:''}),owner]);
        if(filter==='VISIT') await db.query(`insert into customer_activities(id,customer_id,kind,title,starts_at,location,updated_by)
          values($1,$2,'VISIT','Filter visit',now()+interval '1 day','P63',$3)`,[visit,id,owner]);
      }
    }
    // Temporarily disable only source guards inside the isolated test fixture.
    await db.exec(`alter table repair_records disable trigger user;alter table loan_contracts disable trigger user;`);
    for(const filter of ['CONTACT','PICKUP']) {
      await db.query('insert into repair_records(id,data,updated_by) values($1,$2::jsonb,$3)',[filter,JSON.stringify({returnDate:'2026-01-01',pickupDate:'',
        ...(filter==='PICKUP'?{phoneNotifiedAt:'2026-01-01T12:00:00Z',phoneNotifiedReturnKey:'2026-01-01'}:{})}),owner]);
      await db.query("insert into customer_source_links values('service',$1,$2,now(),$3)",[filter,filters[filter],owner]);
    }
    await db.query("insert into loan_contracts(id,data,updated_by) values('filter-loan',$1::jsonb,$2)",
      [JSON.stringify({periodTo:'2000-01-01',returnDate:''}),owner]);
    await db.query("insert into customer_source_links values('loan','filter-loan',$1,now(),$2)",[filters.OVERDUE,owner]);
    await db.exec(`alter table repair_records enable trigger user;alter table loan_contracts enable trigger user;`);
    await login();
    for(const filter of Object.keys(filters)) {
      const found=await value('select satis_clients_search(p_filter=>$1) r',[filter]);
      assert.deepEqual(found.profiles.map(p=>p.id),[filters[filter]],filter);
      assert.equal(found.total,1);
    }
    assert.equal((await value("select satis_clients_search(p_filter=>'ALL') r")).total,7);
    await denied(value("select satis_clients_search(p_filter=>'UNKNOWN') r"),'22023');
    const nfzCount=async()=> (await value("select satis_clients_search(p_filter=>'NFZ') r")).total;
    await db.exec('reset role;alter table device_records disable trigger user');
    await db.query(`insert into device_records(id,data,updated_by) values
      ('nfz-one','{"type":"REZERWACJA","ezwm":"POBRANE"}',$1),
      ('nfz-two','{"type":"SPRZEDANY","ezwm":""}',$1)`,[owner]);
    await db.exec('alter table device_records enable trigger user');
    await db.query("update customer_journeys set data=data||$1::jsonb where customer_id=$2",
      [JSON.stringify({devices_required:2,device_ids:['nfz-one','nfz-two']}),filters.NFZ]);
    await login();assert.equal(await nfzCount(),1,'Unlinked devices must not complete NFZ');
    await db.exec('reset role');
    await db.query("insert into customer_source_links values('device','nfz-one',$1,now(),$2),('device','nfz-two',$1,now(),$2)",[filters.NFZ,owner]);
    await login();assert.equal(await nfzCount(),1,'Missing EZWM keeps NFZ pending');
    const setNfz=async(first,second)=>{
      await db.exec('reset role;alter table device_records disable trigger user');
      await db.query("update device_records set data=jsonb_set(data,'{ezwm}',to_jsonb($1::text)) where id='nfz-one'",[first]);
      await db.query("update device_records set data=jsonb_set(data,'{ezwm}',to_jsonb($1::text)) where id='nfz-two'",[second]);
      await db.exec('alter table device_records enable trigger user');await login();
    };
    await setNfz('POBRANE','REALIZACJA');assert.equal(await nfzCount(),0,'Confirmed funding is complete');
    await setNfz('BEZ REFUNDACJI','BEZ REFUNDACJI');assert.equal(await nfzCount(),0,'All without refund is complete');
    await setNfz('POBRANE','BEZ REFUNDACJI');assert.equal(await nfzCount(),1,'Mixed funding remains pending like journey build');
    await db.exec(`reset role;alter table repair_records disable trigger user;
      update repair_records set data=jsonb_set(data,'{phoneNotifiedReturnKey}','"stale-return"') where id='PICKUP';
      alter table repair_records enable trigger user;`);
    await login();
    assert.equal((await value("select satis_clients_search(p_filter=>'PICKUP') r")).total,0);
    assert.equal((await value("select satis_clients_search(p_filter=>'CONTACT') r")).total,2);
    const multiRepair={returnDate:'',pickupDate:'2026-01-03',phoneNotifiedAt:'2026-01-03T12:00:00Z',
      orderItems:[{id:'b',returnDate:'2026-01-02',pickupDate:''},{id:'a',returnDate:'2026-01-01',pickupDate:'2026-01-03'}],
      phoneNotifiedReturnKey:JSON.stringify([['a','2026-01-01'],['b','2026-01-02']])};
    const setRepair=async data=>{
      await db.exec('reset role;alter table repair_records disable trigger user');
      await db.query("update repair_records set data=$1::jsonb where id='PICKUP'",[JSON.stringify(data)]);
      await db.exec('alter table repair_records enable trigger user');await login();
    };
    await setRepair(multiRepair);
    assert.deepEqual((await value("select satis_clients_search(p_filter=>'PICKUP') r")).profiles.map(p=>p.id),[filters.PICKUP]);
    await setRepair({...multiRepair,phoneNotifiedReturnKey:JSON.stringify([['a','2026-01-01']])});
    assert.equal((await value("select satis_clients_search(p_filter=>'PICKUP') r")).total,0);
    assert.equal((await value("select satis_clients_search(p_filter=>'CONTACT') r")).total,2);
    for(const patch of [{phoneNotifiedReturnKey:undefined},{phoneNotifiedReturnKey:'not-json'},
      {phoneNotifiedAt:'invalid-timestamp'}]) {
      await setRepair({...multiRepair,...patch});
      assert.equal((await value("select satis_clients_search(p_filter=>'PICKUP') r")).total,0);
    }
    // Explicit empty returns suppress the legacy parent date; missing dates inherit it.
    await setRepair({...multiRepair,returnDate:'2026-01-02',pickupDate:'',
      orderItems:[{id:'b',returnDate:'',pickupDate:''},{id:'a',returnDate:null,pickupDate:''}]});
    assert.equal((await value("select satis_clients_search(p_filter=>'CONTACT') r")).total,1);
    await setRepair({...multiRepair,returnDate:'2026-01-02',pickupDate:'',
      orderItems:[{id:'b',pickupDate:''},{id:'a',returnDate:'',pickupDate:''}],
      phoneNotifiedReturnKey:JSON.stringify([['b','2026-01-02']])});
    assert.equal((await value("select satis_clients_search(p_filter=>'PICKUP') r")).total,1);
    await db.exec('reset role');
    await db.query("update customer_activities set starts_at=now()-interval '1 day' where customer_id=$1",[filters.VISIT]);
    await login();
    assert.deepEqual(new Set((await value("select satis_clients_search(p_filter=>'OVERDUE') r")).profiles.map(p=>p.id)),
      new Set([filters.VISIT,filters.OVERDUE]));
    const stock={type:'NA STANIE',customerName:'',serialNumber:'SERIAL-ONE',deviceName:'Test Model',location:'P63',metadata:{keep:true}};
    const stockTwo={...stock,serialNumber:'SERIAL-TWO'};
    await records([deviceChange('stock-one',stock,null),deviceChange('stock-two',stockTwo,null)]);
    const selected={...newData,device_ids:['stock-one'],source_keys:['device:stock-one']};
    const assigned={...stock,type:'REZERWACJA',customerName:'Legacy Customer',clientProfileId:customer,phone:''};
    const changes=[deviceChange('stock-one',assigned)];
    const atomicRequest=randomUUID();
    // A stale journey fails AFTER the audit-core write and link; all must roll back.
    await denied(reserve(customer,1,99,selected,changes,atomicRequest),'PT409');
    assert.equal((await one("select revision from device_records where id='stock-one'")).revision,1);
    assert.equal((await value('select satis_client_detail($1) r',[customer])).links.length,0);
    await db.exec('reset role');
    assert.equal((await one('select count(*)::int n from customer_write_requests where id=$1',[atomicRequest])).n,0);
    assert.equal((await one("select count(*)::int n from record_audit_logs where record_id='stock-one'")).n,1);
    await login();
    await denied(reserve(customer,0,1,selected,changes),'PT409');
    await denied(reserve(customer,1,1,selected,[deviceChange('stock-one',assigned,99)]),'PT409');
    await denied(reserve(customer,1,1,selected,[deviceChange('stock-one',{...assigned,serialNumber:'changed'})]),'22023');
    await records([deviceChange('busy-stock',{...stock,type:'SPRZEDANY'},null)]);
    await denied(reserve(customer,1,1,{...selected,device_ids:['busy-stock']},[
      deviceChange('busy-stock',{...assigned})]),'PT409');
    await records([deviceChange('foreign-stock',{...stock,clientProfileId:other},null)]);
    await denied(reserve(customer,1,1,{...selected,device_ids:['foreign-stock']},[
      deviceChange('foreign-stock',{...assigned})]),'PT409');
    const atomic=await reserve(customer,1,1,selected,changes,atomicRequest);
    assert.equal(atomic.journey.revision,2);
    assert.equal(atomic.profile_revision,2);
    assert.equal(atomic.device_rows.length,1);
    assert.equal(atomic.device_rows[0].revision,2);
    assert.deepEqual(atomic.device_rows[0].data.metadata,{keep:true});
    assert.deepEqual(await reserve(customer,1,1,selected,changes,atomicRequest),atomic);
    await denied(reserve(customer,1,1,selected,changes,atomicRequest,'Different station'),'22023');
    assert.equal((await value('select satis_client_detail($1) r',[customer])).links.length,1);
    // Assigned selections can use an empty batch; no duplicate device revision.
    const emptyRequest=randomUUID();
    const empty=await reserve(customer,2,2,selected,[],emptyRequest);
    assert.equal(empty.profile_revision,3);
    assert.equal(empty.device_rows[0].revision,2);
    assert.deepEqual(await reserve(customer,2,2,selected,[],emptyRequest),empty);
    await denied(reserve(other,1,null,{...base,case_id:randomUUID(),source_keys:[],device_ids:['stock-one']},[]),'PT409');
    const two={...selected,devices_required:2,device_ids:['stock-one','stock-two']};
    const assignedTwo={...stockTwo,type:'REZERWACJA',customerName:'Legacy Customer',clientProfileId:customer,phone:''};
    const mixed=await reserve(customer,3,3,two,[deviceChange('stock-two',assignedTwo)]);
    assert.equal(mixed.device_rows.length,2);
    assert.equal(mixed.profile_revision,4);
    await denied(reserve(customer,4,4,{...two,device_ids:['stock-one','stock-one']},[]),'22023');
    // Legacy states can reserve without explicit case keys.
    const legacyCustomer=randomUUID();
    await clients('PROFILE',legacyCustomer,null,{full_name:'Third Customer',location:'P63'});
    await records([deviceChange('legacy-stock',{...stock,serialNumber:'LEGACY'},null)]);
    const legacyAtomic=await reserve(legacyCustomer,1,null,{...base,device_ids:['legacy-stock']},[
      deviceChange('legacy-stock',{...stock,serialNumber:'LEGACY',type:'REZERWACJA',customerName:'Third Customer',clientProfileId:legacyCustomer})]);
    assert.equal(legacyAtomic.journey.legacy_matching,true);
    // Wrapping the installed schedule writer must not bypass schedule validation.
    const note=await clients('ACTIVITY',randomUUID(),null,{customer_id:customer,kind:'NOTE',title:'Audit test',location:'P63',status:'COMPLETED'});
    assert.equal(note.revision,1);
    await db.exec('reset role');
    const receipts=(await db.query('select result from customer_write_requests where customer_id=$1',[customer])).rows;
    assert.ok(receipts.length>0);
    for(const receipt of receipts) {
      assert.equal(receipt.result.journey,undefined);
      assert.equal(receipt.result.journey_meta?.data,undefined);
      assert.equal(JSON.stringify(receipt).includes('Legacy Customer'),false);
    }
    await db.exec(migration);await login();
    assert.equal((await current(customer)).cases.length,2);
    assert.deepEqual(await reserve(customer,1,1,selected,changes,atomicRequest),atomic);
    await db.exec('reset role');
    const followupMigration=read('supabase-clients-follow-up.sql');await db.exec(followupMigration);await db.exec(followupMigration);await login();
    const followCustomer=randomUUID(),followCase={...base,case_id:randomUUID(),source_keys:[],confirmations:{...base.confirmations,rodo:true}};
    await clients('PROFILE',followCustomer,null,{full_name:'Followup Test',location:'P63'});
    await journey(followCustomer,null,followCase);
    await db.exec('reset role');await db.query("insert into customer_source_links(source_type,source_id,customer_id,linked_by) values('loan','follow-loan',$1,$2)",[followCustomer,owner]);await login();
    const postponed={...followCase,follow_up:{loan_id:'follow-loan',contact_on:'2027-01-05'}},postponeId=randomUUID();
    const savedFollow=await journey(followCustomer,1,postponed,postponeId);
    assert.deepEqual(savedFollow.journey.data.follow_up,postponed.follow_up);
    assert.deepEqual(await journey(followCustomer,1,postponed,postponeId),savedFollow);
    const readFollow=await current(followCustomer);assert.equal(readFollow.follow_up_support,true);
    assert.deepEqual(readFollow.events[0].data.follow_up,postponed.follow_up);
    const firstConsent=readFollow.confirmation_times.rodo;assert.ok(Number.isFinite(Date.parse(firstConsent)));
    assert.equal(readFollow.rodo_confirmed_at,firstConsent,'unrelated writes do not move the actual confirmation time');
    await denied(journey(followCustomer,2,{...postponed,follow_up:{...postponed.follow_up,loan_id:'someone-else'}}),'22023');
    await denied(journey(followCustomer,2,{...postponed,follow_up:{...postponed.follow_up,extra:'not allowed'}}),'22023');
    await denied(journey(followCustomer,1,postponed),'PT409');
    const nextFollow={...base,case_id:randomUUID(),source_keys:[]};await journey(followCustomer,null,nextFollow);
    assert.equal((await current(followCustomer)).rodo_confirmed_elsewhere,true);
    assert.equal((await current(followCustomer)).rodo_confirmed_at,firstConsent,'new case retains the previous client confirmation date');
    assert.equal((await current(other)).rodo_confirmed_elsewhere,false);
    await denied(value('select satis_clients_audit_save_followup_base($1,1,$2::jsonb) r',[followCustomer,JSON.stringify(nextFollow)]),'42501');
    await clients('DELETE',followCustomer,1,{});
    await denied(value('select satis_clients_audit_save($1,1,$2::jsonb) r',[customer,JSON.stringify(newData)]),'42501');
    await denied(db.query('select * from customer_journeys'),'42501');
    for(const [uid,email] of [[staff,'staff@example.test'],[owner,'wrong@example.test']]) {
      await login(uid,email);
      await denied(current(customer),'42501');
      await denied(caseRead(customer,newData.case_id),'42501');
      await denied(journey(customer,1,newData),'42501');
      await denied(reserve(customer,4,4,two,[]),'42501');
      await denied(value("select satis_clients_search('') r"),'42501');
      await denied(value("select satis_clients_search(p_filter=>'CONTACT') r"),'42501');
    }
    await db.exec('reset role;set role anon');
    await denied(current(customer),'42501');
    await login();
    const deleteRequest=randomUUID();
    const deleted=await clients('DELETE',customer,4,{},deleteRequest);
    assert.equal(deleted.deleted,true);
    assert.deepEqual(await clients('DELETE',customer,4,{},deleteRequest),deleted);
    await denied(journey(customer,null,newData,createRequest),'P0002');
    await denied(reserve(customer,1,1,selected,changes,atomicRequest),'P0002');
    await db.exec('reset role');
    assert.equal((await one('select count(*)::int n from customer_journeys where customer_id=$1',[customer])).n,0);
    assert.equal((await one('select count(*)::int n from customer_journey_events where customer_id=$1',[customer])).n,0);
    assert.equal((await one('select count(*)::int n from customer_write_requests where customer_id=$1',[customer])).n,0);
    assert.equal((await one("select count(*)::int n from satis_audit_private.operations where receipt::text like '%Legacy Customer%'")).n,0);
    assert.equal((await one("select count(*)::int n from device_records where id in ('stock-one','stock-two')")).n,2);
  } finally { await db.close(); }
});
