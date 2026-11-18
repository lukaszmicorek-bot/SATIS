const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../app.js'),'utf8');
const plain=value=>JSON.parse(JSON.stringify(value));
const seed=JSON.parse(source.match(/^const PRICING_EMBEDDED_RECORDS = (.+);$/m)[1]);
function extract(name){const start=source.search(new RegExp(`^(?:async )?function ${name}\\(`,'m'));assert.ok(start>=0,name);return source.slice(start,source.indexOf('\n}',start)+2);}
function setup(){
 const writes=[],messages=[],storage=new Map();let commit;
 const c=vm.createContext({pricingFields:['idProduct','nfzCode','tradeName','model','manufacturer','orderIndex','grossPrice','swdCode'],
  PRICING_UPDATED_MONTH:11,PRICING_UPDATED_YEAR:2026,PRICING_CATALOG_REVISION:'20261118-01',PRICING_META_ROW_ID:'__pricing_meta__',PRICING_META_STORAGE_KEY:'meta',
  PRICING_EMBEDDED_RECORDS:seed,window:{},hasSupabaseConfig:true,supabaseInitialDataReady:true,pricingSupabaseAvailable:true,
  currentSupabaseUser:{id:'owner'},canViewPrivateModules:()=>true,sensitiveStateGeneration:1,pricingMutationInProgress:false,pricingMutationRevision:0,
  pricingRecords:[],pricingMeta:{updatedMonth:4,updatedYear:2026},localStorage:{setItem:(key,value)=>storage.set(key,value)},
  document:{querySelector:()=>null},satisChangeQueue:{flush(){}},setPricingMutationBusy:busy=>{c.pricingMutationInProgress=busy;},
  showPricingCatalogUpdateNotice:(message,error)=>messages.push({message,error}),SUPABASE_PRICING_TABLE:'pricing_records',
  savePricingRecords(){},resetPricingPriceLookup(){},rebuildDemoFormSuggestions(){},renderPricingRecords(){},setCurrentYearTitle(){},pricingUpdatedLabel:()=> 'listopad 2026',
  satisDataStore:{prepare:(table,data)=>({table,id:data.id,data,expectedRevision:data.id.startsWith('server-')?4:null,delete:false}),commit:async changes=>{writes.push(plain(changes));if(commit)return commit(changes);return changes.map(change=>({table:change.table,id:change.id,revision:5}));}}});
 for(const name of ['normalize','normalizePricingRecordsForUse','normalizePricingRecordForUse','repairPricingRecordColumns','repairShiftedPricingModel',
  'normalizePricingManufacturerName','normalizeAudibelTradeName','normalizePricingPrice','pricingRecordKey','mergePricingRecords',
  'pricingSupabaseRecordId','pricingRecordsForSupabase','pricingSeedRecords','defaultPricingMeta','normalizePricingMeta','savePricingMeta',
  'currentPricingMeta','markPricingUpdatedNow','splitSupabasePricingRows','bundledPricingUpdatePlan','applyBundledPricingUpdate'])vm.runInContext(extract(name),c);
 return {c,writes,messages,storage,setCommit:fn=>commit=fn};
}
const item=(idProduct,extra={})=>({idProduct,nfzCode:'P.01.01.00',tradeName:'Aparat testowy',model:'Model testowy',manufacturer:'Phonak',grossPrice:4000,...extra});
test('November source has 2261 complete rows, unique NFZ variants, Polish characters and corrected prices',()=>{
 const {c}=setup(),rows=plain(c.pricingSeedRecords());assert.equal(rows.length,2261);
 assert.equal(new Set(rows.map(row=>c.pricingRecordKey(row))).size,2261);
 assert.ok(rows.every(row=>row.idProduct&&row.tradeName&&row.model&&row.manufacturer&&Number.isFinite(row.grossPrice)&&row.grossPrice>=0));
 assert.ok(rows.some(row=>row.tradeName.includes('słuchowy wewnątrzuszny')));
 assert.equal(rows.find(row=>row.idProduct==='12924643'&&row.nfzCode==='P.01.01.00').grossPrice,4200);
 assert.equal(rows.find(row=>row.idProduct==='12910395'&&row.nfzCode==='P.01.01.00').grossPrice,3300);
 assert.ok(rows.some(row=>row.manufacturer.includes('Zając')));assert.ok(rows.every(row=>!JSON.stringify(row).includes('\ufffd')));
 assert.match(source,/PRICING_CATALOG_SOURCE_SHA256 = "328ca94d381822e7cb2f04e02a556a246f60f0d82d063578316df3c93249f9e6"/);
});
test('delta import preserves server identities, NFZ variants, custom products, charger prices and discounts',()=>{
 const {c}=setup();const existing=[item('1',{id:'server-one',discountOne:100,discountPair:250}),item('1',{id:'server-child',nfzCode:'P.01.01.01'}),
  item('charger',{id:'server-charger',nfzCode:'C+',model:'Charger',grossPrice:950,chargerPriceOne:700,chargerPriceTwo:500}),item('manual',{id:'server-manual'})];
 const plan=plain(c.bundledPricingUpdatePlan(existing,[item('1',{grossPrice:4500}),item('2')]));
 assert.equal(plan.records.length,5);assert.equal(plan.added,1);assert.equal(plan.changed.length,2);
 const changed=plan.changed.find(row=>row.idProduct==='1');assert.equal(changed.id,'server-one');assert.equal(changed.discountOne,100);assert.equal(changed.discountPair,250);assert.equal(changed.grossPrice,4500);
 const charger=plan.records.find(row=>row.id==='server-charger');assert.equal(charger.chargerPriceOne,700);assert.equal(charger.chargerPriceTwo,500);assert.equal(charger.grossPrice,950);
 assert.equal(new Set(plan.records.map(row=>row.id)).size,5);assert.equal(existing[0].grossPrice,4000);
 assert.equal(plain(c.bundledPricingUpdatePlan(plan.records,[item('1',{grossPrice:4500}),item('2')])).changed.length,0);
});
test('ambiguous existing products and invalid or duplicate source rows block the entire import',()=>{
 const {c}=setup();assert.throws(()=>c.bundledPricingUpdatePlan([item('1'),item('1')],[item('2')]),/powtórzone/);
 for(const imported of [[],[item('2'),item('2')],[item('2',{grossPrice:'invalid'})],[item('2',{grossPrice:-1})],[item('2',{manufacturer:''})]])assert.throws(()=>c.bundledPricingUpdatePlan([],imported));
});
test('shared data changes only after one confirmed transaction including the persistent marker; reruns do nothing',async()=>{
 const {c,writes}=setup();c.pricingRecords=[item('manual',{id:'server-manual'})];
 assert.equal(await c.applyBundledPricingUpdate(),true);assert.equal(writes.length,1);assert.equal(writes[0].length,2262);
 assert.ok(writes[0].every(row=>row.table==='pricing_records'&&!row.delete));
 assert.equal(writes[0].at(-1).data.catalogRevision,'20261118-01');assert.equal(c.pricingMeta.catalogRevision,'20261118-01');
 assert.equal(c.pricingRecords.length,2262);assert.equal(c.pricingMutationInProgress,false);
 assert.equal(await c.applyBundledPricingUpdate(),false);assert.equal(writes.length,1);
 c.markPricingUpdatedNow();assert.equal(c.pricingMeta.catalogRevision,'20261118-01','manual edits must not clear the persistent marker');
 c.splitSupabasePricingRows([{id:'__pricing_meta__',updatedMonth:11,updatedYear:2026,catalogRevision:'20261118-01'}]);assert.equal(c.pricingMeta.catalogRevision,'20261118-01');
 c.splitSupabasePricingRows([]);assert.equal(c.pricingMeta.catalogRevision,undefined,'missing server marker cannot inherit a stale local marker');
});
test('gabinet, partial load, newer catalog, another edit, and a second tab invocation do not start a write',async()=>{
 for(const override of [c=>c.canViewPrivateModules=()=>false,c=>c.supabaseInitialDataReady=false,c=>c.currentSupabaseUser=null,
  c=>c.pricingMutationInProgress=true,c=>c.document.querySelector=()=>({open:true}),c=>c.pricingMeta={updatedMonth:12,updatedYear:2026},
  c=>c.pricingMeta={updatedMonth:11,updatedYear:2026,catalogRevision:'20261119-01'}]){
  const {c,writes}=setup();override(c);assert.equal(await c.applyBundledPricingUpdate(),false);assert.equal(writes.length,0);
 }
 const {c,writes,setCommit}=setup();let release;setCommit(changes=>new Promise(resolve=>release=()=>resolve(changes.map(row=>({table:row.table,id:row.id,revision:1})))));
 const pending=c.applyBundledPricingUpdate();assert.equal(c.pricingMutationInProgress,true);assert.equal(await c.applyBundledPricingUpdate(),false);release();await pending;assert.equal(writes.length,1);
});
test('network errors, conflicts or incomplete receipts do not mark a failed import as completed',async()=>{
 for(const commit of [()=>{throw Error('offline');},()=>{throw Object.assign(Error('conflict'),{code:'PT409'});},()=>[]]){
  const {c,writes,setCommit,messages}=setup();const before=[item('old',{id:'server-old'})];c.pricingRecords=before;setCommit(commit);
  assert.equal(await c.applyBundledPricingUpdate(),false);assert.equal(c.pricingRecords,before);assert.equal(c.pricingMeta.catalogRevision,undefined);
  assert.equal(c.pricingMutationInProgress,false);assert.equal(messages.at(-1).error,true);assert.equal(await c.applyBundledPricingUpdate(),false);assert.equal(writes.length,1);
 }
});
test('responses from a signed-out session are discarded instead of restoring its data',async()=>{
 const {c,setCommit}=setup();const before=[item('old',{id:'server-old'})];c.pricingRecords=before;
 setCommit(changes=>{c.sensitiveStateGeneration++;c.currentSupabaseUser=null;return changes.map(row=>({table:row.table,id:row.id,revision:1}));});
 assert.equal(await c.applyBundledPricingUpdate(),false);assert.equal(c.pricingRecords,before);assert.equal(c.pricingMeta.catalogRevision,undefined);
 assert.match(extract('clearSensitiveApplicationState'),/setPricingMutationBusy\(false\)/);assert.match(extract('activateSupabaseSession'),/void applyBundledPricingUpdate\(\)/);
});
