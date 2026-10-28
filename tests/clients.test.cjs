const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
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
  assert.throws(()=>clients.profilePayload({...base,name:'Jan'},identity,identity,identity),/nazwisko/);
  assert.throws(()=>clients.profilePayload({...base,phone:'123'},identity,identity,identity),/telefonu/);
  assert.throws(()=>clients.profilePayload({...base,postal:'43300'},identity,identity,identity),/pocztowy/);
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
function fixture(rpc) {
  const dom=fakeDOM(), state={owner:true,user:'owner-1'}, calls=[];
  let sequence=0;
  const module=clients.create({document:dom.document,owner:()=>state.owner,user:()=>state.user,active:()=>true,
    sources:()=>[],rpc:async(name,args)=>{calls.push({name,args});return rpc(name,args);},id:()=>`request-${++sequence}`,
    person:x=>x,phone:x=>x||'',street:x=>x,city:x=>x,addressParts:()=>({}),station:()=> 'P63',date:x=>x,dateTime:x=>x,
    locationAccent(){},confirm:()=>true,refreshCalendar(){},navigate(){}});
  return {...dom,state,calls,module};
}
const profile={id:'client-1',full_name:'Test Osoba',phone:'500600800',location:'P63',revision:1};
const detail={profile,links:[],activities:[],operations:[]};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
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
