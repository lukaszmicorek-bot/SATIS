const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const journey=require('../client-journey.js');
const today='2026-11-16',profile={id:'client-test',full_name:'Klient Testowy'};
const make=(sources=[],activities=[],links=sources.map(row=>({source_type:row.type,source_id:row.id})))=>({profile,sources,activities,links});
const row=(type,id,date,workflow={})=>({type,id,date,name:profile.full_name,kind:type,model:'Model testowy',serial:id,workflow});
const base=()=>journey.normalize({started_on:today,interest:'INTERESTED',referral:'READY',trial_required:true,device_ids:['aid1'],visit_id:'visit-test',confirmations:Object.fromEntries(Object.keys(journey.flags).map(id=>[id,true]))},today);
const successful=()=>make([row('loan','loan-test',today,{returnDate:today}),row('offer','offer-test',today),
 row('device','aid1',today,{type:'SPRZEDANY',invoice:'TEST/2026',pickupDate:today,ezwm:'REALIZACJA',hearingAid:true})],
 [{id:'visit-test',kind:'VISIT',status:'COMPLETED',starts_at:'2026-11-16T10:00:00Z'}]);
test('only explicitly confirmed identity-matched records can complete workflow steps',()=>{
 const data=successful();assert.equal(journey.build(data,base(),today).complete,true);
 assert.equal(journey.build({...data,links:[]},base(),today).complete,false);
 assert.equal(journey.build({...data,sources:data.sources.map(r=>({...r,name:'Inna Osoba'}))},base(),today).complete,false);
});
test('active loan and unclosed Demo stay blockers even after purchase and signed documents',()=>{
 for(const workflow of [{returnDate:''},{returnDate:today,outstandingDemo:true}]){
  const data=successful();data.sources[0].workflow=workflow;
  const plan=journey.build(data,base(),today);assert.equal(plan.complete,false);assert.equal(plan.activeLoans.length,1);
  assert.equal(plan.steps.find(s=>s.id==='return').done,false);
 }
});
test('old offer, old sale and unrelated visits never close a new case; cancelled/missed visits do not count',()=>{
 const data=successful();data.sources[1].date='2025-01-01';data.sources[2].workflow.pickupDate='2025-01-01';
 const s={...base(),device_ids:[],visit_id:'different'};const plan=journey.build(data,s,today);
 for(const id of ['offer','delivery','visit'])assert.notEqual(plan.steps.find(step=>step.id===id)?.done,true,id);
 for(const status of ['PLANNED','CANCELLED','MISSED']){const c=successful();c.activities[0].status=status;assert.equal(journey.build(c,base(),today).complete,false,status);}
});
test('opening forms or having sold devices never implies RODO, receipt, care or instructions were signed/given',()=>{
 const s={...base(),confirmations:{}};const plan=journey.build(successful(),s,today);
 assert.equal(plan.complete,false);
 for(const id of Object.keys(journey.flags))assert.notEqual(plan.steps.find(step=>step.id===id)?.done,true,id);
});
test('two hearing aids require two assigned and delivered units; chargers do not satisfy the count',()=>{
 const data=successful(),s={...base(),devices_required:2,device_ids:['aid1','charger']};
 data.sources.push(row('device','charger',today,{type:'SPRZEDANY',invoice:'TEST/2026',pickupDate:today,hearingAid:false}));data.links.push({source_type:'device',source_id:'charger'});
 const plan=journey.build(data,s,today);assert.equal(plan.steps.find(step=>step.id==='devices').done,false);assert.equal(plan.steps.find(step=>step.id==='delivery').done,false);
 const reserved=successful();reserved.sources[2].workflow={type:'REZERWACJA',ezwm:'POBRANE'};
 const assigned=journey.build(reserved,{...base(),referral:'UNKNOWN'},today);assert.equal(assigned.steps.find(s=>s.id==='devices').done,true);assert.equal(assigned.steps.find(s=>s.id==='referral').done,true);assert.equal(assigned.steps.find(s=>s.id==='delivery').done,false);
});
test('selected apparatus IDs isolate a case from another purchase by the same person',()=>{
 const data=successful();data.sources.push(row('device','another',today,{type:'SPRZEDANY',invoice:'OTHER',pickupDate:today}));data.links.push({source_type:'device',source_id:'another'});
 const plan=journey.build(data,{...base(),device_ids:['aid1']},today);assert.deepEqual(plan.devices.map(r=>r.id),['aid1']);
});
test('duplicate serials and unfinished NFZ realization remain visible completion blockers',()=>{
 const data=successful(),second={...data.sources[2],id:'aid2'};data.sources.push(second);data.links.push({source_type:'device',source_id:'aid2'});
 const duplicate=journey.build(data,{...base(),device_ids:['aid1','aid2'],devices_required:2},today);
 assert.equal(duplicate.complete,false);assert.equal(duplicate.steps.find(s=>s.id==='devices').done,false);
 const pending=successful();pending.sources[2].workflow.ezwm='POBRANE';const plan=journey.build(pending,base(),today);
 assert.equal(plan.complete,false);assert.equal(plan.steps.find(s=>s.id==='ezwm').done,false);
 assert.equal(journey.build(pending,{...base(),referral:'WITHOUT_REFUND'},today).complete,false,'manual preference cannot hide an existing NFZ order');
 pending.sources[2].workflow.ezwm='BEZ REFUNDACJI';assert.equal(journey.build(pending,{...base(),referral:'WITHOUT_REFUND'},today).complete,true);
});
test('service and complaint form are one open branch, with phone, pickup and missing service warnings',()=>{
 const service=row('service','service-test',today,{sourceDocumentId:'complaint-test',receivedDate:'2026-11-13',sentDate:'2026-11-14',returnDate:today,phoneNotifiedAt:'2026-11-16T10:00:00Z'});
 const data=make([row('complaint','complaint-test','2026-11-13'),service]);
 let plan=journey.build(data,{...base(),kind:'SERVICE'},today);assert.equal(plan.services.length,1);assert.equal(plan.openServices.length,1);assert.equal(plan.complete,false);assert.equal(plan.services[0].steps.find(s=>s.label==='Poinformowano tel.').date,'2026-11-16T10:00:00Z');
 service.workflow.pickupDate=today;plan=journey.build(data,{...base(),kind:'SERVICE',started_on:'2026-11-13'},today);assert.equal(plan.complete,true);
 const missing=journey.build(make([row('order','no-service',today)]),{...base(),kind:'SERVICE'},today);assert.equal(missing.services[0].missingService,true);assert.equal(missing.complete,false);
});
test('old unfinished service is visible; closed pre-case service is not added to the current branch',()=>{
 const data=make([row('service','old-open','2024-01-01',{receivedDate:'2024-01-01'}),row('service','old-closed','2024-01-01',{pickupDate:'2024-02-01'})]);
 const plan=journey.build(data,{...base(),kind:'SERVICE'},today);assert.deepEqual(plan.services.map(s=>s.row.id),['old-open']);
});
test('chronological event chain includes loan return and service dates in ascending order',()=>{
 const data=make([row('loan','loan-test','2026-11-01',{returnDate:'2026-11-09'}),row('service','service-test','2026-11-14',{receivedDate:'2026-11-10',sentDate:'2026-11-12',returnDate:'2026-11-14'})]);
 const plan=journey.build(data,{...base(),started_on:'2026-11-01'},today);assert.deepEqual(plan.events.map(e=>e.date),['2026-11-01','2026-11-09','2026-11-10','2026-11-12','2026-11-14']);
});
test('manual document confirmations and corrections join history with server dates, without reusing an old case',()=>{
 const state=base(),history=[{created_at:'2026-11-17T10:00:00Z',data:{...state,confirmations:{rodo:false}}},{created_at:'2026-11-16T10:00:00Z',data:{...state,confirmations:{rodo:true}}},
  {created_at:'2025-01-01T10:00:00Z',data:{...state,started_on:'2025-01-01',confirmations:{receipt:true}}}];
 const found=journey.historyEvents(history,state);assert.ok(found.some(e=>e.label==='RODO potwierdzone'));assert.ok(found.some(e=>e.label==='Cofnięto: RODO potwierdzone'));assert.equal(found.some(e=>/odbioru/.test(e.label)),false);
});
const app=fs.readFileSync('app.js','utf8');
function extract(name){const match=new RegExp(`^(?:async )?function ${name}\\(`,'m').exec(app),rest=app.slice(match.index),next=rest.slice(1).search(/\n(?:async )?function /);return rest.slice(0,next+1);}
function reserveContext(records,extra={}){const calls=[];let prepares=0;const c=vm.createContext({records,currentSupabaseUser:{id:'owner-test'},sensitiveStateGeneration:1,hasSupabaseConfig:true,
 AbortController,window:{setTimeout,clearTimeout},currentWorkstationName:()=> 'P63',
 supabaseClient:{rpc:(_name,args)=>({abortSignal:async()=>{calls.push(args.p_changes);return {data:{journey:{revision:1,data:args.p_data},device_rows:args.p_changes.map(change=>({id:change.id,revision:2,data:change.data}))}};}})},
 canViewPrivateModules:()=>true,requireInitialDataReady:()=>true,isFullPersonName:()=>true,satisChangeQueue:{flush:async()=>{}},SUPABASE_DEVICE_TABLE:'device_records',STORAGE_KEY:'test',
 serialDuplicateKey:v=>String(v||'').toUpperCase(),pricingOfferAccessoryKind:r=>/charger/i.test(r.model)?'charger':'',hasValidStockIdentity:r=>Boolean(r.deviceName&&r.serialNumber),
 displayType:r=>r.type,isInStock:r=>r.type==='NA STANIE',titleCaseName:v=>v,customerNameLookupKey:v=>String(v||'').toLowerCase(),
 satisDataStore:{prepare:(_t,r)=>{prepares++;return {table:'device_records',id:r.id,data:r,expectedRevision:1,delete:false};},observe(){}},writeSensitiveStorage(){},rebuildAfterDeviceChange(){},logAuditEvent(){},...extra});vm.runInContext(extract('reserveClientJourneyDevices'),c);return {c,calls,prepares:()=>prepares};}
const reservation=ids=>({requestId:'10000000-0000-0000-0000-000000000001',revision:null,state:journey.normalize({device_ids:ids,devices_required:ids.length},today)});
const stock=id=>({id,deviceName:'Model testowy',serialNumber:id,type:'NA STANIE',customerName:''});
test('one atomic versioned batch reserves two devices, preserves metadata and repeat is safe',async()=>{
 const {c,calls}=reserveContext([{...stock('one'),notes:'Bez zmian'},stock('two')]);
 await c.reserveClientJourneyDevices({...profile,phone:'123456789'},['one','two'],[],reservation(['one','two']));assert.equal(calls.length,1);assert.equal(calls[0].length,2);
 assert.equal(c.records[0].type,'REZERWACJA');assert.equal(c.records[0].notes,'Bez zmian');assert.equal(c.records[0].clientProfileId,profile.id);
 await c.reserveClientJourneyDevices(profile,['one','two'],[],reservation(['one','two']));assert.equal(calls[1].length,0,'repeat needs no second stock mutation');
});
test('busy/other-person device, duplicate serial, unauthorized account and write rejection never mutate stock',async()=>{
 for(const records of [[stock('one'),{...stock('two'),type:'REZERWACJA',customerName:'Inna Osoba'}],[stock('one'),{...stock('two'),serialNumber:'one'}]]){
  const {c,calls}=reserveContext(records);await assert.rejects(c.reserveClientJourneyDevices(profile,['one','two'],[],reservation(['one','two'])));assert.equal(calls.length,0);assert.equal(c.records[0].customerName,'');}
 const denied=reserveContext([stock('one')],{canViewPrivateModules:()=>false});await assert.rejects(denied.c.reserveClientJourneyDevices(profile,['one']));assert.equal(denied.calls.length,0);
 const failed=reserveContext([stock('one')],{supabaseClient:{rpc:()=>({abortSignal:async()=>({error:{code:'PT409'}})})}});await assert.rejects(failed.c.reserveClientJourneyDevices(profile,['one'],[],reservation(['one'])));assert.equal(failed.c.records[0].type,'NA STANIE');
});
test('separate cases on the same day never inherit the earlier sale or document confirmations',()=>{
 const data=successful(),state=journey.normalize({case_id:'10000000-0000-0000-0000-000000000001',source_keys:[]},today);
 const plan=journey.build(data,state,today);
 assert.equal(plan.steps.length,0);assert.equal(plan.complete,false);
 const history=[{created_at:today,data:{...state,case_id:'10000000-0000-0000-0000-000000000002',confirmations:{rodo:true}}}];
 assert.deepEqual(journey.historyEvents(history,state),[]);
 state.source_keys=['offer:offer-test'];state.device_ids=['aid1'];
 const selected=journey.build(data,state,today);assert.equal(selected.steps.find(s=>s.id==='offer').done,true);assert.equal(selected.steps.find(s=>s.id==='delivery').done,true);
});
test('interest is not described as a confirmed purchase before there is a sale',()=>{
 const plan=journey.build(make(),journey.normalize({interest:'INTERESTED'},today),today);
 assert.equal(plan.steps.find(s=>s.id==='interest').detail,'Zainteresowany zakupem');
});
test('RODO alert depends on an explicit confirmation, including a different case of the same customer',()=>{
 const state=journey.normalize({},today);
 assert.equal(journey.build(make(),state,today).consentMissing,true);
 assert.equal(journey.build({...make(),rodo_confirmed_elsewhere:true},state,today).consentMissing,false);
 state.confirmations.rodo=true;assert.equal(journey.build(make(),state,today).consentMissing,false);
});
test('trial follow-up begins after fourteen calendar days and uses period start rather than signing date',()=>{
 const state=journey.normalize({},today),loan=row('loan','loan','2026-10-01',{periodFrom:'2026-11-03'});
 assert.equal(journey.followUpStatus([loan],state,'2026-11-16'),null);
 const due=journey.followUpStatus([loan],state,'2026-11-17');assert.equal(due.days,14);assert.equal(due.due,true);
 assert.equal(journey.followUpStatus([{...loan,workflow:{periodFrom:'2026-12-01'}}],state,today),null);
});
test('only an offer or a real sale after the latest trial suppresses the follow-up',()=>{
 const state=journey.normalize({},today),loan=row('loan','loan','2026-10-01');
 const oldOffer=row('offer','old','2026-09-01');assert.equal(journey.followUpStatus([loan,oldOffer],state,today).due,true);
 assert.equal(journey.followUpStatus([loan,row('offer','new','2026-10-03')],state,today),null);
 assert.equal(journey.followUpStatus([loan,row('device','sale',today,{type:'SPRZEDANY',invoice:'FS',pickupDate:today})],state,today),null);
 assert.equal(journey.followUpStatus([loan,row('device','reserved',today,{type:'REZERWACJA'})],state,today).due,true);
 assert.equal(journey.followUpStatus([loan,row('device','charger',today,{type:'SPRZEDANY',invoice:'FS',pickupDate:today,hearingAid:false})],state,today).due,true);
 const newer=row('loan','latest','2026-11-01');assert.equal(journey.followUpStatus([loan,oldOffer,newer],state,today).loan.id,'latest');
});
test('postponed contact returns on the chosen date and a decline never closes an unreturned loan',()=>{
 const loan=row('loan','loan','2026-10-01',{returnDate:''}),state=journey.normalize({follow_up:{loan_id:'loan',contact_on:'2026-11-20'}},today);
 assert.equal(journey.followUpStatus([loan],state,today).due,false);
 assert.equal(journey.followUpStatus([loan],state,'2026-11-20').due,true);
 assert.equal(journey.followUpStatus([loan],{...state,interest:'DECLINED'},today),null);
 const plan=journey.build(make([loan]),{...state,interest:'DECLINED',started_on:'2026-10-01'},today);
 assert.equal(plan.activeLoans.length,1);assert.equal(plan.complete,false);
});
test('another person or an unconfirmed loan cannot trigger a customer reminder',()=>{
 const loan=row('loan','loan','2026-10-01');
 assert.equal(journey.build(make([loan],[],[]),journey.normalize({},today),today).followUp,null);
 assert.equal(journey.build(make([{...loan,name:'Inna Osoba'}]),journey.normalize({},today),today).followUp,null);
});
test('empty customer starts with choices, not a mandatory fifteen-step checklist',()=>{
 const plan=journey.build(make(),journey.normalize({},today),today);
 assert.deepEqual(plan.steps,[]);assert.equal(plan.complete,false);assert.equal(plan.phase,'Wybierz czynność');
 assert.deepEqual(plan.suggestions.map(row=>row.action),['loan','offer','purchase']);
});
test('trial suggests return first and purchase decision only after actual return',()=>{
 const loan=row('loan','loan',today,{returnDate:''}),context=make([loan]);
 let plan=journey.build(context,journey.normalize({},today),today);
 assert.deepEqual(plan.steps.map(step=>step.id),['loan','return']);assert.equal(plan.next.row.id,'loan');
 loan.workflow.returnDate=today;plan=journey.build(context,journey.normalize({},today),today);
 assert.ok(plan.steps.some(step=>step.id==='interest'));assert.equal(plan.next.action,'purchase');
 assert.ok(!plan.steps.some(step=>['delivery','ezwm','receipt'].includes(step.id)));
});
test('direct purchase does not require a trial, offer, visit or NFZ unless selected or evidenced',()=>{
 let state=journey.normalize({interest:'INTERESTED'},today),plan=journey.build(make(),state,today);
 assert.deepEqual(plan.steps.map(step=>step.id),['interest','devices']);assert.equal(plan.next.action,'devices');
 state.referral='REQUESTED';plan=journey.build(make(),state,today);assert.ok(plan.steps.some(step=>step.id==='referral'));
 state.referral='WITHOUT_REFUND';plan=journey.build(make(),state,today);assert.ok(!plan.steps.some(step=>['referral','ezwm'].includes(step.id)));
});
test('manual document action reveals just that confirmation without checking it automatically',()=>{
 const plan=journey.build(make(),journey.normalize({},today),today,['rodo']);
 assert.deepEqual(plan.steps.map(step=>step.id),['rodo']);assert.equal(plan.steps[0].done,false);
});
test('a lost reservation response retries the identical payload even when realtime already changed stock',async()=>{
 let fail=true;const requests=[];
 const {c}=reserveContext([stock('one')],{supabaseClient:{rpc:(_name,args)=>({abortSignal:async()=>{requests.push(JSON.stringify(args));if(fail){fail=false;throw Error('response lost');}return {data:{journey:{revision:1,data:args.p_data},device_rows:[{id:'one',revision:2,data:args.p_changes[0].data}]}};}})}});
 const attempt=reservation(['one']);await assert.rejects(c.reserveClientJourneyDevices(profile,['one'],[],attempt));
 c.records=[{...stock('one'),type:'REZERWACJA',customerName:profile.full_name,clientProfileId:profile.id}];
 await c.reserveClientJourneyDevices(profile,['one'],[],attempt);assert.equal(requests[0],requests[1]);
});
test('new workflow uses private RPCs, no browser PII persistence, HTML interpretation or external requests',()=>{
 const text=fs.readFileSync('client-journey.js','utf8');assert.doesNotMatch(text,/innerHTML|localStorage|sessionStorage|indexedDB|fetch\(/);
 for(const file of ['offline-sw.js','scripts/public_assets.py','index.html'])assert.match(fs.readFileSync(file,'utf8'),/client-journey.js/);
 assert.match(fs.readFileSync('clients.js','utf8'),/!journeyRequest\) missingSchema = true/);
});
test('visible demonstration is synthetic, immutable across stages and covers purchase plus complaint',()=>{
 const frames=journey.demoSnapshots();assert.equal(frames.length,11);assert.equal(frames[0].context.profile.phone,'');
 assert.equal(frames[0].context.profile.full_name,'Klient demonstracyjny');assert.equal(frames[0].context.sources.length,1);
 const plan=s=>journey.build(s.context,s.state,s.date);
 assert.equal(plan(frames[0]).activeLoans.length,1);assert.equal(plan(frames[1]).activeLoans.length,0);
 assert.equal(plan(frames[4]).steps.find(step=>step.id==='visit').detail.includes('Termin minął'),false,'historical preview uses its own day');
 assert.equal(plan(frames[5]).complete,true);assert.equal(plan(frames[6]).complete,false);
 assert.match(plan(frames[8]).next.title,/telefonicznie/);assert.match(plan(frames[9]).next.title,/Odbiór/);assert.equal(plan(frames[10]).complete,true);
 const fresh=journey.demoSnapshots();frames[0].state.interest='DECLINED';assert.equal(fresh[0].state.interest,'UNKNOWN');
 const text=fs.readFileSync('client-journey.js','utf8');assert.match(text,/readOnly:true/);assert.match(text,/name!=="satis_client_journey_read"/);
 assert.match(fs.readFileSync('index.html','utf8'),/id="clientsDemoBtn"/);
});
