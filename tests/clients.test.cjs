const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const clients = require('../clients.js');
const source = fs.readFileSync(require.resolve('../clients.js'),'utf8');
const html = fs.readFileSync(require.resolve('../index.html'),'utf8');
const app = fs.readFileSync(require.resolve('../app.js'),'utf8');

test('same name is a proposal, never an implicit link; conflicting phones stay empty', () => {
  const rows = [
    {id:'a',type:'device',name:'Jan Żółć',phone:'500600800',date:'2025-01-01',model:'Model A',serial:'21ABC'},
    {id:'b',type:'loan',name:'Jan Żółć',phone:'+48 500 600 801',date:'2026-01-01',model:'Model B'},
    {id:'c',type:'service',name:'Inna Osoba',serial:'21ABC',date:'2026-10-01'},
  ];
  const index=clients.sourceIndex(rows), proposed=clients.suggestions(index,'zolc');
  assert.equal(proposed.length,1);
  assert.equal(proposed[0].phone,'');
  assert.equal(proposed[0].ambiguous,true);
  assert.equal(proposed[0].rows[0].id,'b');
  assert.deepEqual(clients.linkedTimeline(index,[]),[]);
  assert.deepEqual(clients.linkedTimeline(index,[{source_type:'device',source_id:'a'}]).map(x=>x.id),['a']);
  assert.equal(clients.suggestions(index,'21abc').length,2,'a common serial must not merge people');
});
test('timeline sorts by source date and ignores unavailable records without guessing identity', () => {
  const rows=[{type:'device',id:'old',name:'Test Osoba',date:'2020-01-01'}, {type:'service',id:'new',name:'Test Osoba',date:'2026-10-28'}];
  const links=[{source_type:'device',source_id:'old'},{source_type:'service',source_id:'new'},{source_type:'loan',source_id:'missing'}];
  assert.deepEqual(clients.linkedTimeline(clients.sourceIndex(rows),links).map(x=>x.id),['new','old']);
});
test('contact validation canonicalizes phone, rejects missing surname and invalid postcode', () => {
  const base={name:'Jan Testowy',phone:'+48 500 600 800',street:'Testowa 1',postal:'43-300',city:'Bielsko-Biała',location:'P63'};
  const identity=x=>x;
  assert.equal(clients.profilePayload(base,identity,identity,identity).phone,'500600800');
  assert.equal(clients.phoneKey('0048 500 600 800'),'500600800');
  assert.throws(()=>clients.profilePayload({...base,name:'Jan'},identity,identity,identity),/nazwisko/);
  assert.throws(()=>clients.profilePayload({...base,phone:'123'},identity,identity,identity),/telefonu/);
  assert.throws(()=>clients.profilePayload({...base,postal:'43300'},identity,identity,identity),/pocztowy/);
});
test('postcode suggestions are unique, tolerate accents and never choose between different cities', () => {
  const entries=[{postalCode:'12-345',city:'Żywiec'},{postalCode:'12-345',city:'zywiec'},
    {postalCode:'12-345',city:'Inna Miejscowość'},{postalCode:'12-346',city:'Trzecia'}];
  assert.equal(clients.postalCities('12-345',entries).length,2);
  assert.deepEqual(clients.postalCities('12-34',entries),[]);
  assert.deepEqual(clients.postalCities('12-346',entries),['Trzecia']);
  assert.deepEqual(clients.postalCities('43-300',entries,'Bielsko-Biała'),['Bielsko-Biała']);
});
test('calendar derives local day and excludes invalid and out-of-window dates', () => {
  const local = new Date(2026,9,28,23,45);
  const visits=[{id:'yes',starts_at:local.toISOString()}, {id:'bad',starts_at:'invalid'}, {id:'old',starts_at:'2020-01-01'}];
  const found=clients.visitEvents(visits,'2026-10-28','2026-10-28');
  assert.equal(found.length,1);
  assert.equal(found[0].localDate,'2026-10-28');
  assert.equal(clients.localInput(local),'2026-10-28T23:45');
});
test('schedule ranges start weeks on Monday and keep month grids stable across years', () => {
  assert.equal(clients.scheduleRange('day','2026-10-28').days.length,1);
  assert.deepEqual(clients.scheduleRange('three','2026-12-31').days,['2026-12-31','2027-01-01','2027-01-02']);
  assert.equal(clients.scheduleRange('week','2026-11-01').start,'2026-10-26');
  assert.equal(clients.scheduleRange('week','2026-11-01').end,'2026-11-01');
  const feb=clients.scheduleRange('month','2028-02-29');
  assert.equal(feb.days.length,42);assert.equal(feb.start,'2028-01-31');assert.ok(feb.days.includes('2028-02-29'));
  assert.equal(clients.shiftDay('2026-12-31',1),'2027-01-01');
});
function scheduled(id,day,time,duration,location='P63',status='PLANNED') {
  return {id,customer_id:'client-1',full_name:'Test Osoba',starts_at:clients.visitStart(day,time),duration_minutes:duration,location,status,title:'Kontrola'};
}
test('schedule packs overlaps in separate lanes and does not count adjacent appointments as overlapping', () => {
  const visits=[scheduled('a','2026-10-28','09:00',60),scheduled('b','2026-10-28','09:30',30),
    scheduled('c','2026-10-28','10:00',30),scheduled('elsewhere','2026-10-28','09:30',30,'P50'),
    scheduled('cancelled','2026-10-28','10:30',30,'P63','CANCELLED')];
  const parts=clients.scheduleDayVisits(visits,'2026-10-28','P63');
  assert.deepEqual(parts.map(item=>[item.visit.id,item.lane,item.lanes]),[['a',0,2],['b',1,2],['c',0,1]]);
  assert.equal(parts[0].startMinute,540);assert.equal(parts[0].endMinute,600);
  assert.equal(clients.scheduleDayVisits(visits,'2026-10-28','P50').length,1);
});
test('schedule splits midnight spans without inventing a booking on the exclusive end day', () => {
  const visits=[scheduled('overnight','2026-10-28','23:45',30),scheduled('ends','2026-10-28','23:00',60)];
  const next=clients.scheduleDayVisits(visits,'2026-10-29');
  assert.equal(next.length,1);assert.equal(next[0].startMinute,0);assert.equal(next[0].endMinute,15);
  assert.equal(clients.scheduleDayVisits([{starts_at:'bad',duration_minutes:30}],'2026-10-28').length,0);
});
test('opening hours follow ISO weekdays and resize snaps to 5 minutes with safe bounds',()=>{
  const days=Array.from({length:7},(_,i)=>({closed:i>4,from:'09:00',to:'17:00'}));
  assert.equal(clients.openingForDay([{location:'P63',days}],'P63','2026-11-02').closed,false);
  assert.equal(clients.openingForDay([{location:'P63',days}],'P63','2026-11-08').closed,true);
  assert.equal(clients.openingForDay([],'P50','2026-11-02'),null);
  assert.equal(clients.resizedDuration(30,15),40);
  assert.equal(clients.resizedDuration(30,-1000),5);
  assert.equal(clients.resizedDuration(30,1000),240);
});

function fakeDOM() {
  const nodes=new Map();
  function element(tag='div') {
    const node={tagName:tag.toUpperCase(),textContent:'',className:'',value:'',hidden:false,disabled:false,checked:false,dataset:{},style:{},children:[],handlers:{},attributes:{},
      addEventListener(type, fn){(this.handlers[type] ||= []).push(fn);},
      emit(type,event={}){for(const fn of this.handlers[type]||[])fn({preventDefault(){},...event});},
      append(...items){this.children.push(...items);},replaceChildren(...items){this.children=items;},
      setAttribute(key,value){this.attributes[key]=value;},focus(){},reset(){},
      querySelectorAll(){return [];},
      contains(other){return this===other || this.children.some(child=>child.contains?.(other));},
    };
    node.classList={toggle(name,on){const classes=new Set(node.className.split(' ').filter(Boolean));if(on)classes.add(name);else classes.delete(name);node.className=[...classes].join(' ');},contains(name){return node.className.split(' ').includes(name);}};
    return node;
  }
  for(const match of html.matchAll(/<([a-z]+)[^>]*\bid="([^"]+)"[^>]*>/g)) {
    const node=element(match[1]);node.hidden=/\shidden(?:\s|>)/.test(match[0]);nodes.set(match[2],node);
  }
  const save=element('button');save.type='submit';save.dataset.clientWrite='';
  nodes.get('clientsForm').append(save);
  nodes.get('clientsForm').querySelectorAll=()=>[save];
  const document={getElementById:id=>nodes.get(id),createElement:element,hidden:false};
  return {document,nodes};
}
function fixture(rpc, extra = {}) {
  const dom=fakeDOM(), state={owner:true,user:'owner-1'}, calls=[];
  let sequence=0;
  const module=clients.create({document:dom.document,owner:()=>state.owner,user:()=>state.user,active:()=>true,
    sources:()=>[],rpc:async(name,args)=>{calls.push({name,args});return rpc(name,args);},id:()=>`request-${++sequence}`,
    person:x=>x,phone:x=>x||'',street:x=>x,city:x=>x,addressParts:()=>({}),station:()=> 'P63',date:x=>x,dateTime:x=>x,
    setDate:(input,value)=>{input.value=value;},isoDate:value=>value,today:()=> '2026-10-28',
    locationPill:location=>{const pill=dom.document.createElement('span');pill.textContent=location;pill.className=`location-pill ${location}`;return pill;},
    locationAccent(){},confirm:()=>true,refreshCalendar(){},navigate(){},...extra});
  return {...dom,state,calls,module};
}
const profile={id:'client-1',full_name:'Test Osoba',phone:'500600800',location:'P63',revision:1};
const detail={profile,links:[],activities:[],operations:[]};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('service prices accept Polish decimals, distinguish free from unknown and reject invalid amounts',()=>{
  assert.equal(clients.parsePrice('1 250,50'),1250.5);assert.equal(clients.parsePrice('0'),0);
  for(const bad of ['', '-1', 'NaN', '1,234', '10000000000','1e2'])assert.throws(()=>clients.parsePrice(bad));
  assert.match(clients.priceLabel(null),/nieustalona/);assert.match(clients.priceLabel(0),/0,00/);
});
test('weekends and supplied public holidays are blocked independently of opening hours',()=>{
  assert.equal(clients.nonworkingDay('2026-11-07'),true);assert.equal(clients.nonworkingDay('2026-11-08'),true);
  assert.equal(clients.nonworkingDay('2026-11-09'),false);
  assert.equal(clients.nonworkingDay('2026-11-11',day=>day==='2026-11-11'?{name:'Święto'}:null),true);
  assert.match(app,/activeDateInput\?\.id === "clientVisitDate"/);
  assert.match(app,/invalidWeekendWorkDay \|\| clientVisitBlocked/);
});
test('booking form rejects typed weekend and holiday without issuing a write',async()=>{
  const f=fixture(async(name)=>({data:name==='satis_clients_overview'?{profiles:[profile],total:1}
    :name==='satis_client_detail'?detail:[]}),{holiday:day=>day==='2026-11-11'?{name:'Święto'}:null});
  await f.module.open();await f.module.select('client-1');
  for(const day of ['2026-11-07','2026-11-08','2026-11-11']) {
    f.nodes.get('clientAddVisit').emit('click');
    f.nodes.get('clientVisitDate').value=day;f.nodes.get('clientVisitTime').value='10:00';
    f.nodes.get('clientActivityEditor').emit('submit');await tick();
    assert.match(f.nodes.get('clientsMessage').textContent,/soboty, niedziele ani święta/);
  }
  assert.equal(f.calls.filter(call=>call.name==='satis_clients_write').length,0);
});
test('service selection displays price and stores a normalized price through settings RPC',async()=>{
  let service={id:'service',name:'Kontrola',price:150.5,duration_minutes:30,enabled:true,revision:1};
  const f=fixture(async(name,args)=>{
    if(name==='satis_client_schedule_read')return {data:{hours:[],services:[service]}};
    if(name==='satis_client_schedule_settings_write'){service={...service,...args.p_data,revision:2};return {data:{revision:2}};}
    return {data:name==='satis_clients_overview'?{profiles:[profile],total:1}:name==='satis_client_detail'?detail:[]};
  });
  await f.module.open();await f.module.select('client-1');f.nodes.get('clientAddVisit').emit('click');
  assert.match(f.nodes.get('clientVisitService').children[1].textContent,/150,50/);
  f.nodes.get('clientVisitService').value='service';f.nodes.get('clientVisitService').emit('change');
  assert.match(f.nodes.get('clientVisitPrice').textContent,/150,50/);
  f.nodes.get('clientsServiceList').children[0].emit('click');
  assert.equal(f.nodes.get('clientsServicePrice').value,'150,5');
  f.nodes.get('clientsServicePrice').value='175,99';f.nodes.get('clientsServiceForm').emit('submit');await tick();await tick();
  assert.equal(f.calls.find(call=>call.name==='satis_client_schedule_settings_write').args.p_data.price,175.99);
});
test('client rows use the shared location badge instead of plain place text', async () => {
  const f=fixture(async(name)=>({data:name==='satis_clients_overview'?{profiles:[profile],total:1}:[]}));
  await f.module.open();
  const row=f.nodes.get('clientsList').children[0], heading=row.children[0];
  assert.equal(heading.className,'clients-person-heading');
  assert.equal(heading.children[1].className,'location-pill P63');
  assert.equal(heading.children[1].textContent,'P63');
  assert.equal(row.children[1].textContent,'500600800');
});
test('schedule switches four views without additional API traffic and clears on logout', async () => {
  const f=fixture(async(name)=>({data:name==='satis_clients_overview'?{profiles:[profile],total:1}
    :name==='satis_clients_upcoming'?[scheduled('visit','2026-10-28','09:00',60)]:detail}));
  await f.module.open();const count=f.calls.length;
  for(const view of ['day','three','week','month']) {
    f.nodes.get('clientsScheduleViews').emit('click',{target:{closest:()=>({dataset:{scheduleView:view}})}});
    assert.equal(f.nodes.get('clientsSchedule').children[0].className,view==='month'?'clients-schedule-month':'clients-schedule-timeline');
  }
  assert.equal(f.calls.length,count,'view changes reuse the in-memory visit snapshot');
  f.module.clear();assert.equal(f.nodes.get('clientsSchedule').children.length,0);assert.equal(f.nodes.get('clientsScheduleTitle').textContent,'');
});
test('schedule slot opens an appointment dialog for the chosen clinic without saving', async () => {
  const f=fixture(async(name)=>({data:name==='satis_clients_overview'?{profiles:[profile],total:1}:name==='satis_clients_upcoming'?[]:detail}));
  const dialog=f.nodes.get('clientsBookingDialog');dialog.showModal=()=>dialog.open=true;dialog.close=()=>dialog.open=false;
  await f.module.open();await f.module.select('client-1');
  f.nodes.get('clientsSchedulePlaces').emit('click',{target:{closest:()=>({dataset:{schedulePlace:'P50'}})}});
  const grid=f.nodes.get('clientsSchedule').children[0];
  const column=grid.children.find(node=>node.className==='clients-schedule-day');
  column.children[0].emit('click');
  assert.equal(dialog.open,true);
  assert.equal(f.nodes.get('clientsBookingSummary').children[0].textContent,'2026-10-26');
  assert.equal(f.nodes.get('clientsBookingSummary').children[1].textContent,'P50');
  assert.equal(f.nodes.get('clientsBookingFrom').value,'07:00');
  assert.equal(f.nodes.get('clientsBookingTo').value,'07:30');
  assert.equal(f.nodes.get('clientsBookingSearch').value,profile.full_name);
  assert.equal(f.calls.filter(call=>call.name==='satis_clients_write').length,0);
});
test('drag selection snaps both ways to quarter hours, respects opening hours and caps duration',()=>{
  assert.deepEqual(clients.selectedTimeRange(540,590,480,1020),{start:540,end:600});
  assert.deepEqual(clients.selectedTimeRange(585,540,480,1020),{start:540,end:600});
  assert.deepEqual(clients.selectedTimeRange(540,1300,480,1020),{start:540,end:780});
  assert.deepEqual(clients.selectedTimeRange(900,0,480,1020),{start:675,end:915});
  assert.deepEqual(clients.selectedTimeRange(1005,1100,480,1020),{start:1005,end:1020});
});
test('calendar booking locks duplicate submits and retains the same request ID after an uncertain write',async()=>{
  let release,fail=true;const payloads=[],service={id:'service',name:'Kontrola',price:100,duration_minutes:30,enabled:true};
  const f=fixture(async(name,args)=>{
    if(name==='satis_clients_write'){payloads.push(args);return new Promise(resolve=>release=()=>resolve(fail?{error:{code:'NETWORK'}}:{data:{id:args.p_id}}));}
    return {data:name==='satis_clients_overview'?{profiles:[profile],total:1}:name==='satis_client_schedule_read'?{hours:[],services:[service]}:name==='satis_clients_upcoming'?[]:detail};
  });
  const dialog=f.nodes.get('clientsBookingDialog');dialog.showModal=()=>dialog.open=true;dialog.close=()=>dialog.open=false;
  await f.module.open();await f.module.select(profile.id);
  f.nodes.get('clientsSchedule').children[0].children.find(node=>node.className==='clients-schedule-day').children[0].emit('click');
  f.nodes.get('clientsBookingService').value=service.id;
  f.nodes.get('clientsBookingForm').emit('submit');f.nodes.get('clientsBookingForm').emit('submit');await tick();
  assert.equal(payloads.length,1);assert.equal(f.module.canLeave(),false);
  release();await tick();assert.equal(dialog.open,true);assert.match(f.nodes.get('clientsBookingMessage').textContent,/Nie udało/);
  fail=false;f.nodes.get('clientsBookingForm').emit('submit');await tick();
  assert.equal(payloads[0].p_request_id,payloads[1].p_request_id);assert.equal(payloads[0].p_id,payloads[1].p_id);
  assert.equal(payloads[1].p_data.duration_minutes,30);assert.equal(payloads[1].p_data.customer_id,profile.id);assert.equal(payloads[1].p_data.service_id,service.id);
  release();for(let i=0;i<4;i++)await tick();assert.equal(dialog.open,false);assert.equal(f.nodes.get('clientsBookingSearch').value,'');
});
const descendants=node=>[node,...node.children.flatMap(descendants)];
for(const failed of [false,true])test(`calendar resize ${failed?'restores the old block after rejection':'saves without losing service or notes'}`,async()=>{
  const visit={...scheduled('visit','2026-10-28','09:00',30),revision:1},row={...visit,kind:'VISIT',note:'Ustalenia organizacyjne',service_id:null};
  let saved;
  const f=fixture(async(name,args)=>{
    if(name==='satis_clients_overview')return {data:{profiles:[profile],total:1}};
    if(name==='satis_client_schedule_read')return {data:{hours:[],services:[]}};
    if(name==='satis_clients_upcoming')return {data:[saved&&!failed?{...visit,duration_minutes:saved.duration_minutes,revision:2}:visit]};
    if(name==='satis_client_detail')return {data:{...detail,activities:[row]}};
    if(name==='satis_clients_write'){saved=args.p_data;return failed?{error:{code:'PT427'}}:{data:{id:'visit',revision:2}};}
  });
  await f.module.open();
  const handle=descendants(f.nodes.get('clientsSchedule')).find(node=>node.className==='clients-schedule-resize');
  assert.ok(handle);
  handle.emit('pointerdown',{clientY:100,pointerId:1,button:0});handle.emit('pointermove',{clientY:130,pointerId:1});handle.emit('pointerup',{pointerId:1});
  await tick();await tick();
  assert.equal(saved.duration_minutes,50);assert.equal(saved.note,'Ustalenia organizacyjne');assert.equal(saved.service_id,null);
  if(failed) {
    assert.match(f.nodes.get('clientsMessage').textContent,/godziny otwarcia/);
    const event=descendants(f.nodes.get('clientsSchedule')).find(node=>node.className==='clients-schedule-event');
    assert.equal(event.style.height,'43px');
  } else assert.match(f.nodes.get('clientsMessage').textContent,/50 min/);
});
test('missing schedule migration disables new controls but leaves customer cards usable',async()=>{
  const f=fixture(async(name)=>name==='satis_client_schedule_read'?{error:{code:'PGRST202'}}
    :{data:name==='satis_clients_overview'?{profiles:[profile],total:1}:[]});
  await f.module.open();
  assert.equal(f.nodes.get('clientsList').children.length,1);
  assert.match(f.nodes.get('clientsScheduleSettingsNotice').textContent,/supabase-client-schedule.sql/);
  assert.equal(f.nodes.get('clientVisitService').disabled,true);
  assert.doesNotMatch(f.nodes.get('clientsMessage').textContent,/supabase-clients.sql/);
});
test('configured opening hours disable closed-day slots, while services suggest duration',async()=>{
  const days=Array.from({length:7},(_,i)=>({closed:i>4,from:'09:00',to:'17:00'}));
  const f=fixture(async(name)=>({data:name==='satis_client_schedule_read'?{hours:[{location:'P63',days,revision:1}],services:[{id:'service',name:'Kontrola',duration_minutes:45,enabled:true}]}
    :name==='satis_clients_overview'?{profiles:[profile],total:1}:name==='satis_client_detail'?detail:[]}));
  await f.module.open();await f.module.select('client-1');
  const grid=f.nodes.get('clientsSchedule').children[0],columns=grid.children.filter(node=>node.className==='clients-schedule-day');
  assert.ok(columns[5].children.filter(node=>node.className==='clients-schedule-slot').every(slot=>slot.disabled));
  f.nodes.get('clientAddVisit').emit('click');f.nodes.get('clientVisitService').value='service';f.nodes.get('clientVisitService').emit('change');
  assert.equal(f.nodes.get('clientVisitDuration').value,'45');assert.equal(f.nodes.get('clientActivityTitle').value,'Kontrola');
});
test('appointment uses the shared date picker plus an independent time field', () => {
  assert.match(html,/<input id="clientVisitDate" type="text" data-date-picker/);
  assert.match(html,/<input id="clientVisitTime" type="time" step="60"/);
  assert.doesNotMatch(html,/<input id="clientVisitDate"[^>]*datetime-local/);
  assert.match(app,/setDate: setDateInputValue, isoDate: isoDateForSave, locationPill: createLocationPill/);
  const instant=clients.visitStart('2026-11-09','12:30');
  assert.equal(clients.localInput(instant),'2026-11-09T12:30');
  for(const [day,time] of [['2026-02-31','12:30'],['2026-11-09','24:00'],['','12:30'],['2026-11-09','']])
    assert.throws(()=>clients.visitStart(day,time),/dzień i godzinę/);
});
test('saving a visit joins displayed calendar date and time without losing the local hour', async () => {
  let saved;
  const f=fixture(async(name,args)=> {
    if(name==='satis_clients_overview')return {data:{profiles:[profile],total:1}};
    if(name==='satis_client_detail')return {data:detail};
    if(name==='satis_clients_upcoming')return {data:[]};
    if(name==='satis_clients_write'){saved=args.p_data;return {data:{id:args.p_id}};}
  },{isoDate:value=>value==='09.11.2026'?'2026-11-09':value});
  await f.module.open();await f.module.select('client-1');
  f.nodes.get('clientAddVisit').emit('click');
  assert.equal(f.nodes.get('clientVisitDate').required,true);
  assert.equal(f.nodes.get('clientVisitTime').required,true);
  f.nodes.get('clientVisitDate').value='09.11.2026';f.nodes.get('clientVisitTime').value='12:30';
  f.nodes.get('clientActivityEditor').emit('submit');await tick();await tick();
  assert.equal(saved.kind,'VISIT');assert.equal(clients.localInput(saved.starts_at),'2026-11-09T12:30');
  f.nodes.get('clientAddNote').emit('click');
  assert.equal(f.nodes.get('clientVisitDate').required,false);
  assert.equal(f.nodes.get('clientVisitTime').required,false);
});
test('client editor completes city after postcode, preserves manual city and keeps invalid phone intact', async () => {
  const f=fixture(async()=>({data:detail}),{
    cityForPostal:code=>({'43-300':'Bielsko-Biała','34-300':'Żywiec'})[code]||'',
    phone:value=>String(value||'').replace(/(\d{3})(?=\d)/g,'$1 '),
  });
  await f.module.select('client-1');
  const postcode=f.nodes.get('clientPostal'), city=f.nodes.get('clientCity'), phone=f.nodes.get('clientPhone');
  postcode.value='43300';postcode.emit('input');
  assert.equal(postcode.value,'43-300');assert.equal(city.value,'Bielsko-Biała');
  postcode.value='34300';postcode.emit('input');assert.equal(city.value,'Żywiec');
  city.value='Ręcznie wpisana';city.emit('input');postcode.value='43300';postcode.emit('input');
  assert.equal(city.value,'Ręcznie wpisana');assert.match(f.nodes.get('clientAddressHint').textContent,/Sprawdź/);
  phone.value='0048 500600800';phone.emit('blur');assert.equal(phone.value,'500 600 800');
  phone.value='500600800123';phone.emit('blur');assert.equal(phone.value,'500600800123','invalid input must not silently lose digits');
  f.module.clear();assert.equal(f.nodes.get('clientAddressHint').textContent,'');
  assert.equal(f.nodes.get('clientCitySuggestions').children.length,0);
});
test('pasting a complete address splits fields and normalizes without altering existing history', async () => {
  const f=fixture(async()=>({data:detail}),{
    addressParts:()=>({street:'traugutta12',postalCode:'43-300',city:'bielsko'}),
    street:value=>value ? 'ul. Traugutta 12' : '',city:value=>value==='bielsko'?'Bielsko-Biała':value,
    cityForPostal:code=>code==='43-300'?'Bielsko-Biała':'',
  });
  await f.module.select('client-1');
  let prevented=false;
  f.nodes.get('clientStreet').emit('paste',{clipboardData:{getData:()=> 'ul. Traugutta 12, 43-300 Bielsko-Biała'},preventDefault(){prevented=true;}});
  assert.equal(prevented,true);assert.equal(f.nodes.get('clientStreet').value,'ul. Traugutta 12');
  assert.equal(f.nodes.get('clientPostal').value,'43-300');assert.equal(f.nodes.get('clientCity').value,'Bielsko-Biała');
  assert.equal(f.calls.filter(call=>call.name==='satis_clients_write').length,0);
});
test('client location retains shared pastel accents and the document control height', () => {
  const css=fs.readFileSync(require.resolve('../styles.css'),'utf8');
  assert.match(css,/\.clients-notebook \.document-location-field select \{[^}]*height: 40px;[^}]*border-left: 5px solid var\(--document-location-accent\);[^}]*background-color: var\(--document-location-bg\)/);
  assert.match(app,/postalEntries: knownPostalAddresses/);
  assert.match(app,/street: value => formatLoanStreet/);
  assert.match(html,/id="clientCity"[^>]*list="clientCitySuggestions"/);
});
test('gabinet and anonymous navigation never request client data', async () => {
  const f=fixture(async()=>{throw Error('must not call');});
  f.state.owner=false;await f.module.open();await f.module.select('client-1');
  assert.equal(f.calls.length,0);
  f.state.owner=true;f.state.user='';await f.module.open();assert.equal(f.calls.length,0);
});
test('in-flight detail cannot repopulate PII after logout', async () => {
  let resolve;
  const f=fixture(()=>new Promise(done=>{resolve=done;}));
  const pending=f.module.select('client-1');
  f.state.user='';f.module.clear();resolve({data:detail,error:null});await pending;
  assert.equal(f.nodes.get('clientName').value,'');
  assert.equal(f.nodes.get('clientsCard').hidden,true);
  assert.equal(f.nodes.get('clientHistory').children.length,0);
});
test('missing migration is isolated and leaves no writable client controls', async () => {
  const f=fixture(async()=>({error:{code:'PGRST202'}}));
  await f.module.open();
  assert.match(f.nodes.get('clientsMessage').textContent,/supabase-clients.sql/);
  assert.equal(f.nodes.get('clientsCard').hidden,true);
});
test('double submit is locked, uncertain write retry reuses request ID', async () => {
  let release, pending=false;
  const f=fixture(async(name)=> {
    if(name==='satis_clients_overview')return {data:{profiles:[profile],total:1}};
    if(name==='satis_client_detail')return {data:detail};
    if(name==='satis_clients_upcoming')return {data:[]};
    if(name==='satis_clients_write') {pending=true;return new Promise(resolve=>{release=resolve;});}
  });
  await f.module.open();await f.module.select('client-1');
  f.nodes.get('clientsForm').emit('submit');f.nodes.get('clientsForm').emit('submit');await tick();
  assert.equal(pending,true);assert.equal(f.calls.filter(x=>x.name==='satis_clients_write').length,1);
  const first=f.calls.find(x=>x.name==='satis_clients_write').args.p_request_id;
  release({error:{code:'TIMEOUT'}});await tick();
  f.nodes.get('clientsForm').emit('submit');await tick();
  assert.equal(f.calls.filter(x=>x.name==='satis_clients_write')[1].args.p_request_id,first);
  release({data:{id:'client-1',revision:2}});await tick();await tick();
  assert.match(f.nodes.get('clientsMessage').textContent,/zapisana/);
});
test('PII never uses browser persistence, HTML interpretation, URLs, or third-party messages', () => {
  assert.doesNotMatch(source,/localStorage|sessionStorage|indexedDB|innerHTML|outerHTML|insertAdjacentHTML|location\.href|console\.(log|warn|error)/);
  assert.match(source,/textContent = text/);
  assert.match(app,/clientsModule\?\.clear\(\)/);
  assert.match(html,/data-notebook="clients" data-private-owner hidden/);
  for(const match of source.matchAll(/q\("([^"]+)"\)/g)) assert.ok(html.includes(`id="${match[1]}"`),`Missing DOM ${match[1]}`);
});
test('client navigation is guarded and static assets include the isolated module', () => {
  assert.match(app,/\["workTime", "clients"\]\.includes\(notebookName\) && !canViewPrivateModules\(\)/);
  assert.match(app,/notebookName === "mailMerge" && !canAccessMailMerge\(\)/);
  assert.ok(html.indexOf('src="clients.js')<html.indexOf('src="app.js'));
  assert.match(fs.readFileSync(require.resolve('../offline-sw.js'),'utf8'),/"clients.js"/);
});
test('missing or broken Clients script cannot prevent the main application from starting', () => {
  const start=app.indexOf('function initializeClientsModule() {');
  const end=app.indexOf('\ninitializeClientsModule();',start);
  assert.ok(start>0 && end>start);
  const bootstrap=app.slice(start,end);
  for(const factory of [undefined,()=>{throw Error('synthetic startup failure');},()=>({open(){}})]) {
    let initialized=0;
    const message={textContent:'',dataset:{}},write={disabled:false};
    const context={clientsModule:null,window:{SatisClients:factory?{create:factory}:undefined},
      document:{getElementById:()=>message,querySelectorAll:()=>[write]},init:()=>{initialized++;}};
    for(const name of ['canViewPrivateModules','clientsCurrentSources','makeId','titleCaseName','formatPcprPhone','knownPostalAddresses',
      'postalAddressParts','formatDate','formatAuditDateTime','updateDocumentLocationAccent','setDateInputValue','isoDateForSave','createLocationPill','refreshCurrentDateWidget','todayInputValue','polishPublicHolidayOnDate'])context[name]=()=>{};
    vm.createContext(context);
    vm.runInContext(`${bootstrap}\ninitializeClientsModule();\ninit();`,context);
    assert.equal(initialized,1);
    if(!context.clientsModule){assert.equal(write.disabled,true);assert.match(message.textContent,/Pozostałe zakładki/);}
    else assert.equal(write.disabled,false);
  }
});
test('incomplete Clients markup fails before registering partial handlers', () => {
  const f=fakeDOM();f.nodes.delete('clientVisitTime');
  assert.throws(()=>clients.create({document:f.document}),/odświeżenia/);
  assert.equal((f.nodes.get('clientsSearch').handlers.input||[]).length,0);
});
test('source-index failure is reported without rejecting navigation or refresh', async () => {
  const f=fixture(async(name)=>({data:name==='satis_clients_overview'?{profiles:[profile],total:1}:[]}),{sources:()=>{throw Error('synthetic missing source');}});
  await assert.doesNotReject(f.module.open());
  assert.equal(f.nodes.get('clientsMessage').dataset.error,'true');
  assert.equal(f.nodes.get('clientsList').children.length,1,'source failure must not block saved profile loading');
  assert.ok(f.calls.some(call=>call.name==='satis_clients_upcoming'));
  assert.doesNotThrow(()=>f.module.refreshSources());
  assert.match(f.nodes.get('clientsMessage').textContent,/powiązanych dokumentów/);
});

const relationSources = () => [
  {id:'loan-a',type:'loan',name:'Test Osoba',phone:'500600800',date:'2026-10-01',kind:'Umowa',number:'1/10/2026'},
  {id:'order-a',type:'order',name:'Test Osoba',phone:'500600800',date:'2026-10-02',kind:'Zamówienie',number:'2/10/2026'},
  {id:'service-a',type:'service',name:'Test Osoba',phone:'500600800',date:'2026-10-03',kind:'Serwis',serial:'TEST123'}
];
function relationFixture({confirmed=[],accept=true,failLink=false,existing=false}={}) {
  let saved=existing || confirmed.length ? {...profile,revision:1} : null,links=confirmed.map(row=>({source_type:row.type,source_id:row.id})),linkAttempts=0;
  const prompts=[],rows=relationSources();
  const f=fixture(async(name,args)=>{
    if(name==='satis_clients_overview'||name==='satis_clients_search')return {data:{profiles:saved?[saved]:[],total:saved?1:0}};
    if(name==='satis_client_detail')return {data:{profile:{...saved},links:links.map(link=>({...link})),activities:[],operations:[]}};
    if(name==='satis_clients_write') {
      if(args.p_action==='PROFILE') {
        saved={...args.p_data,id:args.p_id,revision:(saved?.revision||0)+1};
        return {data:{id:saved.id,revision:saved.revision}};
      }
      if(args.p_action==='LINK') {
        linkAttempts++;
        assert.equal(args.p_expected_revision,saved.revision,'every link uses the current profile revision');
        if(failLink && linkAttempts===2) {
          if(failLink==='uncertain'){links.push({...args.p_data});saved={...saved,revision:saved.revision+1};}
          return {error:{code:failLink==='uncertain'?'NETWORK':'PT409'}};
        }
        assert.ok(!links.some(link=>link.source_type===args.p_data.source_type && link.source_id===args.p_data.source_id),'do not re-link a confirmed document');
        links.push({...args.p_data});saved={...saved,revision:saved.revision+1};
        return {data:{id:saved.id}};
      }
    }
    return {data:[]};
  },{sources:()=>rows,confirm:message=>{prompts.push(message);return accept;}});
  f.nodes.get('clientsSearch').value='Test Osoba';
  return {...f,prompts,links,rows,saved:()=>saved};
}
async function saveProposedClient(f) {
  await f.module.open();
  if(f.saved())await f.module.select(f.saved().id);
  else f.nodes.get('clientsSuggestions').children[0].emit('click');
  f.nodes.get('clientsForm').emit('submit');
  for(let i=0;i<12;i++)await tick();
}
async function confirmSelected(f, indices) {
  const checks=descendants(f.nodes.get('clientCandidates')).filter(node=>node.type==='checkbox');
  if(indices)for(const i of indices){checks[i].checked=true;checks[i].emit('change');}
  descendants(f.nodes.get('clientCandidates')).find(node=>node.textContent.startsWith('Potwierdź wybrane')).emit('click');
  for(let i=0;i<12;i++)await tick();
}
test('saving a selected source client never implicitly links same-name documents; explicit selection uses current revisions',async()=>{
  const f=relationFixture();await saveProposedClient(f);
  assert.equal(f.links.length,0);assert.equal(f.prompts.length,0);
  const checks=descendants(f.nodes.get('clientCandidates')).filter(node=>node.type==='checkbox');
  assert.equal(checks.length,3);assert.ok(checks.every(check=>!check.checked));
  await confirmSelected(f,[0,1,2]);
  assert.equal(f.links.length,3);
  assert.equal(f.prompts.length,1);
  assert.match(f.prompts[0],/Test Osoba/);
  assert.match(f.prompts[0],/\(3\)/);assert.match(f.prompts[0],/nazwisko nie wystarcza/);
  assert.ok(f.prompts[0].length<250,'confirmation remains concise even with many documents');
  assert.equal(f.nodes.get('clientCandidatesCount').textContent,'0');
  assert.equal(f.nodes.get('clientHistory').children.length,3);
  assert.match(f.nodes.get('clientsMessage').textContent,/3/);
});
test('declining document confirmation keeps the saved card and explains the three pending links',async()=>{
  const f=relationFixture({accept:false});await saveProposedClient(f);
  await confirmSelected(f,[0,1,2]);
  assert.ok(f.saved());assert.equal(f.links.length,0);
  const text=descendants(f.nodes.get('clientHistory')).map(node=>node.textContent).join(' ');
  assert.match(text,/3/);assert.match(text,/potwierdz/);
  assert.doesNotMatch(text,/Brak potwierdzonych powiązań i działań/);
});
test('saving a card preserves already confirmed documents and does not ask to confirm them again',async()=>{
  const f=relationFixture({confirmed:relationSources()});await saveProposedClient(f);
  assert.equal(f.links.length,3);assert.equal(f.prompts.length,0);
  assert.equal(f.nodes.get('clientHistory').children.length,3);
  f.nodes.get('clientsForm').emit('submit');for(let i=0;i<8;i++)await tick();
  assert.equal(f.links.length,3);assert.equal(f.prompts.length,0);
});
test('partial link failure retains saved links, reports the failure and retry confirms only the missing documents',async()=>{
  const f=relationFixture({failLink:true});await saveProposedClient(f);
  await confirmSelected(f,[0,1,2]);
  assert.equal(f.links.length,1);
  assert.equal(f.nodes.get('clientsMessage').dataset.error,'true');
  assert.match(f.nodes.get('clientsMessage').textContent,/powiąza|powiąz/);
  await confirmSelected(f);
  assert.equal(f.links.length,3);
  assert.equal(f.nodes.get('clientHistory').children.length,3);
});
test('unavailable confirmed documents show a load warning without claiming that no links exist',async()=>{
  const f=fixture(async(name)=>({data:name==='satis_clients_overview'?{profiles:[profile],total:1}
    :name==='satis_client_detail'?{...detail,links:[{source_type:'loan',source_id:'missing'}]}:[]}));
  await f.module.open();await f.module.select(profile.id);
  const text=descendants(f.nodes.get('clientHistory')).map(node=>node.textContent).join(' ');
  assert.match(text,/Nie załadowano 1/);
  assert.doesNotMatch(text,/Brak potwierdzonych powiązań i działań/);
});

test('an existing client links only individually selected source documents, never all documents on profile save',async()=>{
  const f=relationFixture({existing:true});await saveProposedClient(f);
  assert.equal(f.saved().id,profile.id);assert.equal(f.links.length,0);
  await confirmSelected(f,[1]);
  assert.equal(f.links.length,1);assert.equal(f.links[0].source_id,'order-a');
  assert.equal(f.nodes.get('clientHistory').children.length,1);
  assert.equal(f.nodes.get('clientCandidatesCount').textContent,'2');
});
test('lost link acknowledgment refreshes confirmed server state and retry skips that document',async()=>{
  const f=relationFixture({failLink:'uncertain'});await saveProposedClient(f);
  await confirmSelected(f,[0,1,2]);
  assert.equal(f.links.length,2);
  assert.equal(f.nodes.get('clientsMessage').dataset.error,'true');
  assert.equal(f.nodes.get('clientHistory').children.length,2);
  await confirmSelected(f);
  assert.equal(f.links.length,3);assert.equal(f.nodes.get('clientHistory').children.length,3);
});

test('client address editing splits the street and both numbers but writes the existing canonical street field',async()=>{
  const source=fs.readFileSync('app.js','utf8'),vm=require('node:vm');
  const ctx=vm.createContext({normalizeLoanHistoryText:value=>String(value||'').trim().replace(/\s+/gu,' ')});
  for(const name of ['titleCaseName','formatLoanStreet','pcprStreetAddressParts']){
    const start=source.indexOf(`function ${name}(`),rest=source.slice(start);vm.runInContext(rest.slice(0,rest.slice(1).search(/\n(?:async )?function /)+1),ctx);
  }
  let current={...profile,street:'ul. Testowa 12A/3',postal_code:'43-300',city:'Bielsko-Biała'},saved;
  const f=fixture(async(name,args)=>{
    if(name==='satis_client_detail')return {data:{...detail,profile:current}};
    if(name==='satis_clients_write'){saved=args.p_data;current={...current,...saved,revision:2};return {data:{id:current.id,revision:2}};}
    return {data:[]};
  },{streetParts:ctx.pcprStreetAddressParts,street:ctx.formatLoanStreet});
  await f.module.select('client-1');assert.equal(f.nodes.get('clientStreetName').value,'ul. Testowa');assert.equal(f.nodes.get('clientHouseNumber').value,'12A');assert.equal(f.nodes.get('clientFlatNumber').value,'3');
  f.nodes.get('clientHouseNumber').value='9B';f.nodes.get('clientFlatNumber').value='4';f.nodes.get('clientHouseNumber').emit('input');
  assert.equal(f.nodes.get('clientStreet').value,'ul. Testowa 9B/4');
  f.nodes.get('clientsForm').emit('submit');await tick();await tick();
  assert.equal(saved.street,'ul. Testowa 9B/4');assert.equal(saved.houseNumber,undefined,'no incompatible database columns are sent');
  f.module.clear();for(const id of ['clientStreetName','clientHouseNumber','clientFlatNumber'])assert.equal(f.nodes.get(id).value,'');
});

function journeyHarness() {
  const state={dirty:false,busy:false,shown:0,cleared:0,config:null};
  const adapter={create(config){state.config=config;return {
    dirty:()=>state.dirty,busy:()=>state.busy,
    async show(){state.shown++;},refresh(){},clear(){state.cleared++;}
  };}};
  return {state,adapter};
}
test('customer card opens as a modal, protects dirty edits and closes without writing',async()=>{
 let confirm=false,closedPicker=0;
 const f=fixture(async name=>({data:name==='satis_client_detail'?detail:[]}),{confirm:()=>confirm,closeDatePicker:()=>closedPicker++});
 const dialog=f.nodes.get('clientsDialog');dialog.open=false;dialog.showModal=()=>dialog.open=true;dialog.close=()=>dialog.open=false;
 await f.module.select(profile.id);assert.equal(dialog.open,true);assert.equal(f.nodes.get('clientsContactDetails').open,false);
 f.nodes.get('clientsForm').emit('input');assert.equal(f.module.close(),false);assert.equal(dialog.open,true);
 const beforeClose=closedPicker;confirm=true;assert.equal(f.module.close(),true);assert.equal(dialog.open,false);assert.equal(closedPicker,beforeClose+1);
 assert.equal(f.calls.some(call=>call.name==='satis_clients_write'),false);
 await f.module.select(profile.id);assert.equal(dialog.open,true);f.module.clear();assert.equal(dialog.open,false);
});
test('in-flight journey cannot be closed by Escape or navigation',async()=>{
 const journey=journeyHarness(),f=fixture(async name=>({data:name==='satis_client_detail'?detail:[]}),{journey:journey.adapter});
 const dialog=f.nodes.get('clientsDialog');dialog.showModal=()=>dialog.open=true;dialog.close=()=>dialog.open=false;
 await f.module.select(profile.id);journey.state.busy=true;
 assert.equal(f.module.canLeave(),false);assert.equal(dialog.open,true);assert.equal(journey.state.cleared,0);
 dialog.emit('cancel');assert.equal(dialog.open,true);assert.match(f.nodes.get('clientsDialogMessage').textContent,/zakończenie zapisu/);
});
test('shared busy changes never enable or disable journey controls in any selector pass',async()=>{
  let release;
  const f=fixture(async(name)=>name==='satis_clients_write'?new Promise(resolve=>{release=resolve;})
    :{data:name==='satis_clients_overview'?{profiles:[profile],total:1}:name==='satis_client_detail'?detail:[]});
  const core=f.document.createElement('button'),owned=[];
  for(const host of ['clientJourney'])for(const disabled of [true,false]) {
    const control=f.document.createElement('button');control.disabled=disabled;
    control.dataset.clientWrite='';control.dataset.scheduleWrite='';owned.push(control);f.nodes.get(host).append(control);
  }
  f.nodes.get('clientsNotebook').querySelectorAll=()=>[core,...owned];
  await f.module.open();await f.module.select(profile.id);
  assert.deepEqual(owned.map(control=>control.disabled),[true,false]);
  f.nodes.get('clientsForm').emit('submit');await tick();
  assert.equal(core.disabled,true);assert.deepEqual(owned.map(control=>control.disabled),[true,false]);
  release({data:{id:profile.id,revision:2}});for(let i=0;i<4;i++)await tick();
  assert.deepEqual(owned.map(control=>control.disabled),[true,false]);
});
test('an in-flight journey save blocks normal actions without clearing or reloading the journey',async()=>{
  const journey=journeyHarness();
  const f=fixture(async(name)=>({data:name==='satis_clients_overview'?{profiles:[profile],total:1}:name==='satis_client_detail'?detail:[]}),{journey:journey.adapter});
  await f.module.open();await f.module.select(profile.id);
  const calls=f.calls.length,shown=journey.state.shown,cleared=journey.state.cleared;
  journey.state.busy=true;
  await f.module.select('other');
  for(const id of ['clientsNew','clientsRefresh','clientArchive','clientDelete','clientAddNote','clientAddVisit'])f.nodes.get(id).emit('click');
  f.nodes.get('clientsForm').emit('submit');await tick();
  assert.equal(f.calls.length,calls);assert.equal(journey.state.shown,shown);assert.equal(journey.state.cleared,cleared);
  assert.equal(f.nodes.get('clientName').value,profile.full_name);assert.equal(journey.state.busy,true);
});
test('dirty journey blocks profile writes before normalization or confirmation and preserves profile edits',async()=>{
  const journey=journeyHarness(),prompts=[];
  const f=fixture(async(name)=>({data:name==='satis_client_detail'?detail:[]}),{journey:journey.adapter,confirm:message=>{prompts.push(message);return false;}});
  await f.module.select(profile.id);journey.state.dirty=true;
  f.nodes.get('clientName').value='Edytowana Osoba';f.nodes.get('clientsForm').emit('input');
  f.nodes.get('clientsForm').emit('submit');await tick();
  assert.equal(f.calls.filter(call=>call.name==='satis_clients_write').length,0);
  assert.match(f.nodes.get('clientsMessage').textContent,/Zapisz najpierw przebieg/);
  assert.equal(prompts.length,0);assert.equal(f.nodes.get('clientName').value,'Edytowana Osoba');
  assert.equal(f.nodes.get('clientsForm').children[0].classList.contains('client-journey-unsaved'),true);
});
test('dirty journey blocks individual and selected LINK, UNLINK, archive and delete before writes',async()=>{
  const journey=journeyHarness(),rows=relationSources(),linked={source_type:rows[0].type,source_id:rows[0].id};
  const f=fixture(async(name)=>({data:name==='satis_client_detail'?{...detail,links:[linked]}:[]}),{journey:journey.adapter,sources:()=>rows});
  await f.module.select(profile.id);journey.state.dirty=true;
  descendants(f.nodes.get('clientCandidates')).find(node=>node.textContent==='Potwierdź powiązanie').emit('click');await tick();
  await confirmSelected(f,[0]);
  descendants(f.nodes.get('clientHistory')).find(node=>node.textContent==='Odłącz').emit('click');await tick();
  f.nodes.get('clientArchive').emit('click');await tick();f.nodes.get('clientDelete').emit('click');await tick();
  assert.equal(f.calls.filter(call=>call.name==='satis_clients_write').length,0);
  assert.equal(journey.state.shown,1);assert.equal(journey.state.dirty,true);
});
test('journey navigation checks profile and activity edits only and forwards selected-case form context',async()=>{
  const journey=journeyHarness(),opened=[];
  const f=fixture(async(name)=>({data:name==='satis_client_detail'?detail:[]}),{journey:journey.adapter,openForm:(...args)=>opened.push(args)});
  await f.module.select(profile.id);journey.state.dirty=true;
  assert.equal(journey.state.config.canNavigate(),true,'device selection may be dirty when reserve checks navigation');
  const caseData={device_ids:['selected-device'],case_id:'case-1'};
  journey.state.config.openForm('receipt',profile,caseData);assert.deepEqual(opened,[['receipt',profile,caseData]]);
  f.nodes.get('clientsForm').emit('input');assert.equal(journey.state.config.canNavigate(),false);
  await f.module.select(profile.id);
  f.nodes.get('clientActivityEditor').emit('input');assert.equal(journey.state.config.canNavigate(),false);
});
test('profile save label and dirty class reset after success and logout, but survive a rejected write',async()=>{
  let fail=true;
  const f=fixture(async(name)=>name==='satis_clients_write'?(fail?{error:{code:'TIMEOUT'}}:{data:{id:profile.id}})
    :{data:name==='satis_client_detail'?detail:[]});
  await f.module.select(profile.id);const save=f.nodes.get('clientsForm').children[0];
  assert.equal(save.textContent,'Zapisz dane');assert.equal(save.classList.contains('client-journey-unsaved'),false);
  f.nodes.get('clientsForm').emit('input');assert.equal(save.classList.contains('client-journey-unsaved'),true);
  f.nodes.get('clientsForm').emit('submit');await tick();assert.equal(save.classList.contains('client-journey-unsaved'),true);
  fail=false;f.nodes.get('clientsForm').emit('submit');for(let i=0;i<4;i++)await tick();
  assert.equal(save.classList.contains('client-journey-unsaved'),false);
  f.nodes.get('clientsNew').emit('click');assert.equal(save.classList.contains('client-journey-unsaved'),true);
  f.module.clear();assert.equal(save.classList.contains('client-journey-unsaved'),false);
});
test('source model and serial token search returns saved cards with actual names and suppresses compatible suggestions',async()=>{
  const rows=[{...relationSources()[0],name:'Test  Osoba',phone:'+48 500 600 800',model:'Aparat Alpha',serial:'SER123'},
    {...relationSources()[1],name:'Test Osoba',model:'Beta',serial:'OTHER'},
    {...relationSources()[2],name:'Inna Osoba',model:'Aparat Alpha',serial:'SER999'}];
  const f=fixture(async(name)=>({data:['satis_clients_search','satis_clients_overview'].includes(name)?{profiles:[profile],total:1}:[]}),{sources:()=>rows});
  f.nodes.get('clientsSearch').value='alpha ser123';await f.module.open();
  const request=f.calls.find(call=>call.name==='satis_clients_search');
  assert.deepEqual(request.args,{p_query:'alpha ser123',p_offset:0,p_archived:false,p_location:'',p_source_names:['Test Osoba','Test  Osoba']});
  assert.equal(f.calls.some(call=>call.name==='satis_clients_overview'),false);
  assert.equal(f.nodes.get('clientsList').children.length,1);assert.equal(f.nodes.get('clientsSuggestions').children.length,0);
  assert.equal(f.calls.filter(call=>call.name==='satis_clients_write').length,0,'search never associates documents');
});
test('plain unmatched searches use only overview and never send an empty optional source-name parameter',async()=>{
  const f=fixture(async(name)=>({data:name==='satis_clients_overview'?{profiles:[profile],total:1}:[]}),{sources:()=>relationSources()});
  for(const query of ['', 'unmatched model']) {
    f.nodes.get('clientsSearch').value=query;await f.module.open();
  }
  assert.equal(f.calls.some(call=>call.name==='satis_clients_search'),false);
  for(const request of f.calls.filter(call=>call.name==='satis_clients_overview'))assert.equal(Object.hasOwn(request.args,'p_source_names'),false);
});
test('missing source search RPC falls back to overview with a persistent warning and does not disable core writes',async()=>{
  const f=fixture(async(name)=>name==='satis_clients_search'?{error:{code:'PGRST202'}}
    :{data:name==='satis_clients_overview'?{profiles:[profile],total:1}:name==='satis_client_detail'?detail:[]},{sources:()=>relationSources()});
  const core=f.document.createElement('button');core.dataset.clientWrite='';
  f.nodes.get('clientsNotebook').querySelectorAll=selector=>selector==='[data-schedule-write]'?[]:[core];
  f.nodes.get('clientsSearch').value='TEST123';await f.module.open();
  assert.ok(f.calls.some(call=>call.name==='satis_clients_overview'));assert.equal(core.disabled,false);
  assert.match(f.nodes.get('clientsMessage').textContent,/modelu i numerze seryjnym.*supabase-clients-audit.sql/);
  assert.equal(f.nodes.get('clientsSuggestions').children.length,0,'do not offer duplicates while saved source search is unavailable');
  await f.module.select(profile.id);assert.equal(core.disabled,false);
  f.nodes.get('clientsSearch').value='unmatched';await f.module.open();
  assert.doesNotMatch(f.nodes.get('clientsMessage').textContent,/supabase-clients-audit.sql/);
});
test('source search authorization errors are never treated as an unavailable RPC or retried through overview',async()=>{
  const f=fixture(async(name)=>name==='satis_clients_search'?{error:{code:'42501'}}:{data:[]},{sources:()=>relationSources()});
  f.nodes.get('clientsSearch').value='TEST123';await f.module.open();
  assert.equal(f.calls.some(call=>call.name==='satis_clients_overview'),false);
  assert.match(f.nodes.get('clientsMessage').textContent,/nie przyznała dostępu/);
});
test('same-name conflicting phones and ambiguous people remain proposals rather than being merged into saved cards',async()=>{
  const rows=relationSources();rows[1].phone='500600801';
  const f=fixture(async(name)=>({data:['satis_clients_search','satis_clients_overview'].includes(name)?{profiles:[profile],total:1}:[]}),{sources:()=>rows});
  f.nodes.get('clientsSearch').value='Test Osoba';await f.module.open();
  assert.equal(f.nodes.get('clientsList').children.length,1);assert.equal(f.nodes.get('clientsSuggestions').children.length,1);
  assert.match(descendants(f.nodes.get('clientsSuggestions')).map(node=>node.textContent).join(' '),/możliwe różne osoby/);
  rows[1].phone=rows[0].phone='500600802';rows[2].phone='500600802';
  f.module.refreshSources();assert.equal(f.nodes.get('clientsSuggestions').children.length,1,'a conflicting known phone cannot suppress a separate person');
});
