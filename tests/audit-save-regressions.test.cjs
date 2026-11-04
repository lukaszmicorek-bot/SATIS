const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('app.js','utf8'),offline=fs.readFileSync('offline-forms.js','utf8');
function extract(name){const m=new RegExp(`^(?:async )?function ${name}\\(`,'m').exec(source);assert.ok(m,name);return source.slice(m.index,source.indexOf('\n}',m.index)+2);}
for(const [name,state,persist]of [['deleteCurrentRecord','records','persistDeletedDeviceRecord'],['deleteCurrentRepairRecord','repairRecords','persistDeletedRepairRecord'],['deleteCurrentDemoRecord','demoRecords','persistDeletedDemoRecord']]){
 for(const success of [true,false])test(`${name}: late ${success?'success':'failure'} never restores data after logout and same-account login`,async()=>{
  let finish,renders=0;
  const ctx=vm.createContext({sensitiveStateGeneration:0,currentSupabaseUser:{id:'owner'},hasSupabaseConfig:true,[state]:[{id:'test',deviceName:'Model',serialNumber:'TEST',customerName:'Jan Testowy'}],privatePayments:{test:{amount:123}},
   document:{querySelector:()=>({value:'test'})},confirm:()=>true,canViewPrivatePayments:()=>true,
   [persist]:()=>new Promise((resolve,reject)=>{finish=()=>success?resolve():reject(Error('SESSION_CHANGED'));}),
   rebuildDerivedData(){renders++;},render(){renders++;},closeDialog(){},closeRepairDialog(){},closeDemoDialog(){},saveLocalPrivatePayments(){},writeSensitiveStorage(){},alert(){},removeDemoAttachmentPaths(){assert.fail('attachments must not be touched after session change');}});
  vm.runInContext(extract('rollbackRecordMutation'),ctx);vm.runInContext(extract(name),ctx);
  const action=ctx[name]();ctx.sensitiveStateGeneration++;ctx.currentSupabaseUser={id:'owner'};ctx[state]=[];ctx.privatePayments={};finish();await action;
  assert.equal(ctx[state].length,0);assert.equal(Object.keys(ctx.privatePayments).length,0);assert.equal(renders,0);
 });
}
test('rollback affects only the failed record and preserves newer server data, including deletion',()=>{
 const ctx=vm.createContext({});vm.runInContext(extract('rollbackRecordMutation'),ctx);
 const before={id:'a',value:'old'},optimistic={id:'a',value:'draft'},other={id:'b',value:'new remote'},remote={id:'a',value:'newer remote'};
 const reverted=ctx.rollbackRecordMutation([optimistic,other],'a',before,optimistic);assert.equal(reverted[0],before);assert.equal(reverted[1],other);
 const current=[remote,other];assert.equal(ctx.rollbackRecordMutation(current,'a',before,optimistic),current);
 const removed=[other];assert.equal(ctx.rollbackRecordMutation(removed,'a',before,optimistic),removed);
 const deleted=ctx.rollbackRecordMutation([other],'a',before);assert.equal(deleted[0],before);assert.equal(deleted[1],other);
});
test('failed Serwis save preserves concurrent edits to another record',async()=>{
 let reject;
 const old={id:'a',receivedDate:'2026-11-01',customerName:'Jan Testowy',serialNumber:'ABC'},other={id:'b',value:'old'},draft={...old,note:'new'};
 const ctx=vm.createContext({sensitiveStateGeneration:0,currentSupabaseUser:{id:'owner'},hasSupabaseConfig:true,repairRecords:[old,other],
 repairForm:{dataset:{}},saveRepairBtn:{disabled:false,textContent:'Zapisz'},document:{querySelector:sel=>({value:sel==='#repairId'?'a':''})},
 validatePersonalFormPhone:()=>true,repairFormRecord:()=>draft,validateRepairDateOrder:()=>true,confirmSerialNumberSave:()=>true,duplicateRepairRecord:()=>null,
 customerNameLookupKey:v=>v,repairSerialNumbers:r=>[r.serialNumber],confirmRepairWarrantySave:()=>true,auditSnapshot:r=>r,
 nextFrame:async()=>{},persistRepairRecord:()=>new Promise((_,r)=>{reject=r;}),rebuildAfterRepairChange(){},render(){},writeSensitiveStorage(){},alert(){},REPAIR_STORAGE_KEY:'test'});
 vm.runInContext(extract('rollbackRecordMutation'),ctx);vm.runInContext(extract('saveRepairFormRecord'),ctx);
 const action=ctx.saveRepairFormRecord({preventDefault(){}});await new Promise(resolve=>setImmediate(resolve));const changed={id:'b',value:'new remote'};ctx.repairRecords=[ctx.repairRecords[0],changed];reject(Error('offline'));await action;
 assert.equal(ctx.repairRecords[0],old);assert.equal(ctx.repairRecords[1],changed);assert.equal(ctx.saveRepairBtn.disabled,false);
});
function offlineContext(){let commits=[],releases=[];const ctx=vm.createContext({current:'order',dirty:true,timer:0,workspaceGeneration:0,editVersions:new Map(),selected:new Map(),clearTimeout(){},printOnly:()=>false,
 vault:{unlocked:()=>ctx.unlocked,change:update=>{const saved=update({drafts:[]});commits.push(saved);return new Promise(resolve=>releases.push(resolve));}},unlocked:true,note:'old',
 take:()=>({id:'draft',snapshot:{customer:'Jan Testowy'},note:ctx.note}),api:{identity:()=>({id:'draft'}),localSaved(){ctx.markedSaved++;}},markedSaved:0,updateSaveState(){},message(){},list(){}});
 const start=offline.indexOf('    async function save(kind = current)'),end=offline.indexOf('    async function print(kind = current)',start);vm.runInContext(offline.slice(start,end),ctx);return {ctx,commits,releases};}
test('offline autosave writes newer typing before clearing dirty or showing saved state',async()=>{
 const t=offlineContext(),pending=t.ctx.save('order');t.ctx.note='new';t.ctx.editVersions.set('order',1);t.releases.shift()();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(t.commits.length,2);assert.equal(t.commits[1].drafts[0].note,'new');assert.equal(t.ctx.dirty,true);assert.equal(t.ctx.markedSaved,0);
 t.releases.shift()();await pending;assert.equal(t.ctx.dirty,false);assert.equal(t.ctx.markedSaved,1);
});
test('offline save finishing after lock does not repopulate selected drafts',async()=>{
 const t=offlineContext(),pending=t.ctx.save('order');t.ctx.workspaceGeneration++;t.ctx.unlocked=false;t.ctx.selected.clear();t.releases.shift()();await pending;
 assert.equal(t.ctx.selected.size,0);assert.equal(t.ctx.markedSaved,0);
});
test('programmatic document saves and prints reject invalid phones before side effects',async()=>{
 const ctx=vm.createContext({offlineForms:{active:()=>false},validateDocumentPhoneForAction:()=>false});
 for(const name of ['saveCurrentPricingLoanToHistory','saveCurrentPricingOrderToHistory','saveCurrentPricingComplaintToHistory','printPricingOrder','printPricingComplaint','printPricingRodo']){vm.runInContext(extract(name),ctx);assert.ok(!(await ctx[name]()));}
 const sync=offline.slice(offline.indexOf('async function sync()'),offline.indexOf('function leave()'));
 assert.ok(sync.indexOf('!api.validate(entry.kind)')<sync.indexOf('await api.prepareSync(entry)'));
});
