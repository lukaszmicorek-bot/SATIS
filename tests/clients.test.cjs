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

function fakeDOM() {
  const nodes=new Map();
  function element(tag='div') {
    return {tagName:tag.toUpperCase(),textContent:'',value:'',hidden:false,disabled:false,checked:false,dataset:{},children:[],handlers:{},attributes:{},
      addEventListener(type, fn){(this.handlers[type] ||= []).push(fn);},
      emit(type,event={}){for(const fn of this.handlers[type]||[])fn({preventDefault(){},...event});},
      append(...items){this.children.push(...items);},replaceChildren(...items){this.children=items;},
      setAttribute(key,value){this.attributes[key]=value;},focus(){},reset(){},
      querySelectorAll(){return [];},
    };
  }
  for(const match of html.matchAll(/<([a-z]+)[^>]*\bid="([^"]+)"[^>]*>/g)) {
    const node=element(match[1]);node.hidden=/\shidden(?:\s|>)/.test(match[0]);nodes.set(match[2],node);
  }
  const document={getElementById:id=>nodes.get(id),createElement:element,hidden:false};
  return {document,nodes};
}
function fixture(rpc, extra = {}) {
  const dom=fakeDOM(), state={owner:true,user:'owner-1'}, calls=[];
  let sequence=0;
  const module=clients.create({document:dom.document,owner:()=>state.owner,user:()=>state.user,active:()=>true,
    sources:()=>[],rpc:async(name,args)=>{calls.push({name,args});return rpc(name,args);},id:()=>`request-${++sequence}`,
    person:x=>x,phone:x=>x||'',street:x=>x,city:x=>x,addressParts:()=>({}),station:()=> 'P63',date:x=>x,dateTime:x=>x,
    setDate:(input,value)=>{input.value=value;},isoDate:value=>value,
    locationPill:location=>{const pill=dom.document.createElement('span');pill.textContent=location;pill.className=`location-pill ${location}`;return pill;},
    locationAccent(){},confirm:()=>true,refreshCalendar(){},navigate(){},...extra});
  return {...dom,state,calls,module};
}
const profile={id:'client-1',full_name:'Test Osoba',phone:'500600800',location:'P63',revision:1};
const detail={profile,links:[],activities:[],operations:[]};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('client rows use the shared location badge instead of plain place text', async () => {
  const f=fixture(async(name)=>({data:name==='satis_clients_overview'?{profiles:[profile],total:1}:[]}));
  await f.module.open();
  const row=f.nodes.get('clientsList').children[0], heading=row.children[0];
  assert.equal(heading.className,'clients-person-heading');
  assert.equal(heading.children[1].className,'location-pill P63');
  assert.equal(heading.children[1].textContent,'P63');
  assert.equal(row.children[1].textContent,'500600800');
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
      'postalAddressParts','formatDate','formatAuditDateTime','updateDocumentLocationAccent','setDateInputValue','isoDateForSave','createLocationPill','refreshCurrentDateWidget'])context[name]=()=>{};
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
  const f=fixture(async()=>{throw Error('unexpected RPC');},{sources:()=>{throw Error('synthetic missing source');}});
  await assert.doesNotReject(f.module.open());
  assert.equal(f.nodes.get('clientsMessage').dataset.error,'true');
  assert.doesNotThrow(()=>f.module.refreshSources());
  assert.match(f.nodes.get('clientsMessage').textContent,/powiązanych dokumentów/);
});
