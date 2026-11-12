const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('app.js','utf8');
function extract(name){const match=new RegExp(`^(?:async )?function ${name}\\(`,'m').exec(source);assert.ok(match,name);const rest=source.slice(match.index);const next=rest.slice(1).search(/\n(?:async )?function /);return next<0?rest:rest.slice(0,next+1);}
const pure=['repairOrderProgress','repairPhoneReturnKey','repairAwaitingPhoneNotification','repairPhoneNotifiedForReturn','repairPhoneNotificationData'];
const iso=value=>/^\d{4}-\d{2}-\d{2}$/.test(String(value||''))?value:'';
function context(extra={}){const c=vm.createContext({isoDateForSave:iso,...extra});for(const name of pure)vm.runInContext(extract(name),c);return c;}
const stamp='2026-11-12T11:00:00.000Z',actor='test@example.invalid';
const ready={id:'repair-test',returnDate:'2026-11-12',customerName:'Osoba Testowa',notes:'Notatka testowa'};
test('phone confirmation is available only after a recorded return, not a manual ready status',()=>{
 const c=context();
 for(const r of [{},{status:'GOTOWE'},{returnDate:'bad'},{...ready,pickupDate:'2026-11-13'}])assert.equal(c.repairAwaitingPhoneNotification(r),false);
 assert.equal(c.repairAwaitingPhoneNotification(ready),true);
 const notified={...ready,...c.repairPhoneNotificationData(ready,{},true,stamp,actor)};
 assert.equal(c.repairPhoneNotifiedForReturn(notified),true);assert.equal(notified.phoneNotifiedAt,stamp);assert.equal(notified.phoneNotifiedBy,actor);
 assert.equal(c.repairPhoneNotifiedForReturn({...notified,phoneNotifiedAt:'invalid'}),false);
 assert.equal(c.repairPhoneNotifiedForReturn({...notified,returnDate:'2026-11-14'}),false);
 assert.equal(c.repairPhoneNotifiedForReturn({...notified,returnDate:''}),false);
});
test('saved timestamps survive ordinary edits and pickup, but unchecking clears the confirmation',()=>{
 const c=context(),prior={...ready,...c.repairPhoneNotificationData(ready,{},true,stamp,actor)};
 const data=c.repairPhoneNotificationData({...ready,pickupDate:'2026-11-13',notes:'Zmieniona notatka'},prior,true,'2026-11-14T12:00:00Z','other@example.invalid');
 assert.equal(data.phoneNotifiedAt,stamp);assert.equal(data.phoneNotifiedBy,actor);
 const cleared=c.repairPhoneNotificationData(ready,prior,false,stamp,actor);
 assert.equal(cleared.phoneNotifiedAt,'');assert.equal(cleared.phoneNotifiedBy,'');assert.equal(cleared.phoneNotifiedReturnKey,'');
 assert.equal(c.repairPhoneNotificationData({...ready,returnDate:''},prior,true,stamp,actor).phoneNotifiedAt,'');
});
test('partial orders can be notified, a newly returned item requires another phone confirmation',()=>{
 const c=context(),first={orderItems:[{id:'one',returnDate:'2026-11-12'},{id:'two',returnDate:''}]};
 assert.equal(c.repairAwaitingPhoneNotification(first),true);
 const notified={...first,...c.repairPhoneNotificationData(first,{},true,stamp,actor)};
 assert.equal(c.repairPhoneNotifiedForReturn(notified),true);
 const both={...notified,orderItems:[first.orderItems[0],{id:'two',returnDate:'2026-11-13'}]};
 assert.equal(c.repairPhoneNotifiedForReturn(both),false);
 const picked={...notified,orderItems:[{...first.orderItems[0],pickupDate:'2026-11-13'},first.orderItems[1]]};
 assert.equal(c.repairPhoneNotifiedForReturn(picked),true);assert.equal(c.repairAwaitingPhoneNotification(picked),false);
 const legacy={returnDate:'2026-11-12',orderItems:[{id:'one'},{id:'two'}]};
 assert.equal(c.repairAwaitingPhoneNotification(legacy),true);
 assert.equal(c.repairPhoneReturnKey({...first,orderItems:[...first.orderItems].reverse()}),c.repairPhoneReturnKey(first),'stable item IDs survive reorder');
});
function mutationContext(persist){
 const effects={saved:[],audit:[],alerts:[],renders:0,cache:[]};
 const c=context({repairRecords:[{...ready}],repairPhoneNotificationWrites:new Set(),sensitiveStateGeneration:1,
  currentSupabaseUser:{id:'user-test',email:actor},hasSupabaseConfig:true,REPAIR_STORAGE_KEY:'test-repairs',requireInitialDataReady:()=>true,
  persistRepairRecord:async r=>{effects.saved.push(r);if(persist)await persist(r);},logAuditEvent:e=>effects.audit.push(e),
  alert:e=>effects.alerts.push(e),writeSensitiveStorage:(_key,value)=>effects.cache.push(JSON.parse(value)),rebuildAfterRepairChange(){},render(){effects.renders++;}});
 for(const name of ['rollbackRecordMutation','changeRepairPhoneNotified'])vm.runInContext(extract(name),c);
 return {c,effects};
}
test('one record is saved and audited; unchecking persists; unrelated fields remain intact',async()=>{
 const {c,effects}=mutationContext(),control={checked:true,disabled:false};
 await c.changeRepairPhoneNotified(ready.id,true,control);
 assert.equal(effects.saved.length,1);assert.equal(effects.audit.length,1);assert.equal(c.repairRecords[0].notes,ready.notes);assert.equal(control.disabled,false);
 assert.equal(c.repairRecords[0].phoneNotifiedBy,actor);assert.equal(c.repairPhoneNotificationWrites.size,0);
 await c.changeRepairPhoneNotified(ready.id,true,control);assert.equal(effects.saved.length,1,'repeat is idempotent');
 control.checked=false;await c.changeRepairPhoneNotified(ready.id,false,control);assert.equal(effects.saved.length,2);assert.equal(c.repairRecords[0].phoneNotifiedAt,'');
});
test('failed writes roll back, re-enable checkbox and show an error without changing other records',async()=>{
 const {c,effects}=mutationContext(async()=>{throw new Error('test write rejected');}),control={checked:true};
 c.repairRecords.push({id:'other',notes:'Bez zmian'});
 await c.changeRepairPhoneNotified(ready.id,true,control);
 assert.equal(c.repairRecords[0].phoneNotifiedAt,undefined);assert.equal(c.repairRecords[1].notes,'Bez zmian');
 assert.equal(control.checked,false);assert.equal(control.disabled,false);assert.equal(effects.audit.length,0);assert.equal(effects.alerts.length,1);
 assert.equal(effects.cache.at(-1)[0].phoneNotifiedAt,undefined);
});
test('parallel clicks cannot send a second write and logout cannot restore sensitive records',async()=>{
 let finish;const {c,effects}=mutationContext(()=>new Promise(resolve=>{finish=resolve;})),control={checked:true};
 const writing=c.changeRepairPhoneNotified(ready.id,true,control);
 assert.equal(control.disabled,true);await c.changeRepairPhoneNotified(ready.id,false,{});assert.equal(effects.saved.length,1);
 c.sensitiveStateGeneration=2;c.currentSupabaseUser=null;c.repairRecords=[];finish();await writing;
 assert.equal(c.repairRecords.length,0);assert.equal(effects.cache.length,0);assert.equal(effects.renders,0);assert.equal(c.repairPhoneNotificationWrites.size,0);
});
test('edit-form confirmation follows return changes and retains metadata after pickup',()=>{
 const input={checked:false,phoneNotification:{}},date={textContent:'',removeAttribute(){}},section={hidden:true};
 const fields={'#repairPhoneNotified':input,'#repairPhoneNotifiedField':section,'#repairPhoneNotifiedDate':date,
  '#repairReturnDate':{value:ready.returnDate},'#repairPickupDate':{value:''}};
 const c=context({document:{querySelector:s=>fields[s]},readRepairOrderItems:()=>null,formatAuditDateTime:s=>s});
 for(const name of ['repairPhoneFormState','syncRepairPhoneNotifiedForm'])vm.runInContext(extract(name),c);
 c.syncRepairPhoneNotifiedForm();assert.equal(section.hidden,false);assert.equal(input.checked,false);
 input.phoneNotification=c.repairPhoneNotificationData(ready,{},true,stamp,actor);c.syncRepairPhoneNotifiedForm();assert.equal(input.checked,true);assert.equal(date.textContent,stamp);
 fields['#repairPickupDate'].value='2026-11-13';c.syncRepairPhoneNotifiedForm();assert.equal(section.hidden,true);assert.equal(input.checked,true);
 fields['#repairReturnDate'].value='2026-11-14';c.syncRepairPhoneNotifiedForm();assert.equal(input.checked,false);
});
test('controls are present in both service lists and the edit form, with saved undo and no SQL migration',()=>{
 for(const name of ['createRepairRow','createRepairOpenRow'])assert.match(extract(name),/createRepairPhoneNotifiedControl\(record\)/);
 assert.match(extract('createRepairPhoneNotifiedControl'),/withSavedUndo/);
 assert.match(extract('repairFormRecord'),/Object.assign\(data, repairPhoneNotificationData/);
 assert.match(extract('openRepairDialog'),/syncRepairPhoneNotifiedForm/);
 assert.match(extract('syncRepairStatusFromDates'),/syncRepairPhoneNotifiedForm/);
 assert.match(extract('syncRepairOrderItemSummary'),/syncRepairPhoneNotifiedForm/);
 assert.match(fs.readFileSync('index.html','utf8'),/id="repairPhoneNotified" type="checkbox"/);
});
