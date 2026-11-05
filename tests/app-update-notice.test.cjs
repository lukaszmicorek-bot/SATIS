const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('app.js','utf8');
function extract(name){const m=new RegExp(`^(?:async )?function ${name}\\(`,'m').exec(source);return source.slice(m.index,source.indexOf('\n}',m.index)+2);}
function fixture(){
 const nodes=new Map();let navigated='',dirty=false,confirmed=false,updates=0;
 function node(tag){return {tag,children:[],dataset:{},events:{},append(...items){this.children.push(...items);},setAttribute(){},addEventListener(type,fn){this.events[type]=fn;},querySelector(tag){return this.children.find(n=>n.tag===tag);},set id(value){nodes.set(value,this);},after(n){nodes.set('banner',n);}};}
 const ctx=vm.createContext({CURRENT_APP_VERSION:'20261105-2',offlineForms:{editing:()=>false},tasksModule:{dirty:()=>false},stockAuditWorkflow:null,agreementDraftStates:new Map(),
 document:{getElementById:id=>nodes.get(id),createElement:node,querySelector:sel=>sel==='.top-panel'?node('header'):dirty?{}:null},URL,Date,
 window:{location:{protocol:'https:',href:'https://satis.pracowniasluchu.pl/',replace:url=>{navigated=String(url);}}},confirm:()=>confirmed,
 navigator:{serviceWorker:{controller:{},getRegistration:async()=>({update:async()=>{updates++;}})}},
 fetch:async()=>({ok:true,text:async()=>'<script src="app.js?v=20261105-3"></script>'}),console});
 for(const name of ['publishedAppUpdateBlocked','showPublishedAppUpdate','checkForPublishedAppUpdate'])vm.runInContext(extract(name),ctx);
 return {ctx,nodes,dirty:v=>{dirty=v;},confirm:v=>{confirmed=v;},navigated:()=>navigated,updates:()=>updates};
}
test('new app version is visibly announced even with an offline worker, without reloading work',async()=>{const t=fixture();await t.ctx.checkForPublishedAppUpdate();assert.ok(t.nodes.get('appUpdateNotice'));assert.equal(t.updates(),1);assert.equal(t.navigated(),'');assert.match(t.nodes.get('appUpdateNotice').querySelector('span').textContent,/20261105-3/);});
test('update button refuses dirty forms, asks before losing input and navigates only after confirmation',async()=>{
 const t=fixture();await t.ctx.checkForPublishedAppUpdate();const button=t.nodes.get('appUpdateNotice').querySelector('button');t.dirty(true);t.confirm(true);button.events.click();assert.equal(t.navigated(),'');
 t.dirty(false);t.confirm(false);button.events.click();assert.equal(t.navigated(),'');t.confirm(true);button.events.click();assert.equal(t.navigated(),'https://satis.pracowniasluchu.pl/?appVersion=20261105-3');
 t.ctx.offlineForms.editing=()=>true;assert.equal(t.ctx.publishedAppUpdateBlocked(),true);
});
test('same version has no banner; a waiting worker update error cannot hide an announced release',async()=>{const t=fixture();t.ctx.fetch=async()=>({ok:true,text:async()=>'<script src="app.js?v=20261105-2"></script>'});await t.ctx.checkForPublishedAppUpdate();assert.equal(t.nodes.get('appUpdateNotice'),undefined);t.ctx.showPublishedAppUpdate('bad');assert.equal(t.nodes.get('appUpdateNotice'),undefined);});

test('failed offline worker update leaves the visible release notice in place',async()=>{
 const t=fixture();t.ctx.navigator.serviceWorker.getRegistration=async()=>({update:async()=>{throw Error('Offline');}});t.ctx.console={warn(){}};
 await t.ctx.checkForPublishedAppUpdate();assert.ok(t.nodes.get('appUpdateNotice'));assert.equal(t.navigated(),'');
});
