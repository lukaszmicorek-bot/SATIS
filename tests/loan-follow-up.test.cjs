const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../app.js'),'utf8'),html=fs.readFileSync(require.resolve('../index.html'),'utf8');
const plain=value=>JSON.parse(JSON.stringify(value));
function extract(name){const start=source.search(new RegExp(`^(?:async )?function ${name}\\(`,'m'));assert.ok(start>=0,name);return source.slice(start,source.indexOf('\n}',start)+2);}
function setup(){
 const inputs=[['purchaseDecision','DECIDED'],['purchaseDecision','DECLINED'],['nfzStatus','WAITING'],['nfzStatus','READY']].map(([group,value])=>({dataset:{loanFollowUp:group},value,checked:false,matches:()=>true}));
 const c=vm.createContext({document:{querySelectorAll:selector=>inputs.filter(input=>(!selector.includes(':checked')||input.checked)&&(!selector.includes('="purchaseDecision"')||input.dataset.loanFollowUp==='purchaseDecision')&&(!selector.includes('="nfzStatus"')||input.dataset.loanFollowUp==='nfzStatus'))},
  normalizeLoanHistoryText:value=>String(value??'').trim(),makeId:()=> 'synthetic-loan',isoDateForSave:value=>value||'',normalizeLoanCityValue:value=>value,
  normalizeLoanTestingFee:value=>value||'0 zł',titleCaseName:value=>value,formatLoanAddress:value=>value||'',normalizeLoanChargerState:value=>value||'',
  normalizePricingLoanHistoryDevice:(value,side)=>({...value,side}),pricingLoanHistoryEntryHasContent:entry=>Boolean(entry.customer)});
 for(const name of ['normalizeLoanFollowUp','readLoanFollowUp','restoreLoanFollowUp','handleLoanFollowUpChange','loanFollowUpSummary','normalizePricingLoanHistoryEntry'])vm.runInContext(extract(name),c);
 return {c,inputs};
}
test('legacy contracts remain undecided and only the two documented enum fields survive normalization',()=>{
 const {c}=setup();assert.deepEqual(plain(c.normalizeLoanFollowUp()),{purchaseDecision:'',nfzStatus:''});
 assert.deepEqual(plain(c.normalizeLoanFollowUp({purchaseDecision:'UNKNOWN',nfzStatus:true,privateNote:'not a supported field'})),{purchaseDecision:'',nfzStatus:''});
 const old=c.normalizePricingLoanHistoryEntry({customer:'Klient Testowy'});assert.deepEqual(plain(old.followUp),{purchaseDecision:'',nfzStatus:''});
 assert.equal(c.normalizePricingLoanHistoryEntry(null),null);
});
test('checkbox pairs are mutually exclusive, independent of the other group, and allow clearing a choice',()=>{
 const {c,inputs}=setup();inputs[0].checked=true;c.handleLoanFollowUpChange({target:inputs[0]});inputs[2].checked=true;c.handleLoanFollowUpChange({target:inputs[2]});
 assert.deepEqual(plain(c.readLoanFollowUp()),{purchaseDecision:'DECIDED',nfzStatus:'WAITING'});
 inputs[1].checked=true;c.handleLoanFollowUpChange({target:inputs[1]});assert.equal(inputs[0].checked,false);assert.equal(inputs[2].checked,true);
 inputs[3].checked=true;c.handleLoanFollowUpChange({target:inputs[3]});assert.equal(inputs[2].checked,false);assert.equal(inputs[1].checked,true);
 assert.deepEqual(plain(c.readLoanFollowUp()),{purchaseDecision:'DECLINED',nfzStatus:'READY'});
 inputs[1].checked=false;c.handleLoanFollowUpChange({target:inputs[1]});assert.equal(c.readLoanFollowUp().purchaseDecision,'');
});
test('saving and restoring the same history record retains the selections; New clears all four controls',()=>{
 const {c,inputs}=setup();c.restoreLoanFollowUp({purchaseDecision:'DECIDED',nfzStatus:'READY'});
 const saved=c.normalizePricingLoanHistoryEntry({id:'same-loan',customer:'Klient Testowy',returnDate:'2026-11-20',followUp:c.readLoanFollowUp()});
 c.restoreLoanFollowUp();assert.ok(inputs.every(input=>!input.checked));
 const reloaded=c.normalizePricingLoanHistoryEntry(JSON.parse(JSON.stringify(saved)));c.restoreLoanFollowUp(reloaded.followUp);
 assert.equal(reloaded.id,'same-loan');assert.deepEqual(plain(c.readLoanFollowUp()),{purchaseDecision:'DECIDED',nfzStatus:'READY'});
 assert.equal(c.loanFollowUpSummary(reloaded.followUp),'Klient zdecydowany na zakup · Ma wniosek NFZ');
 assert.match(extract('startNewPricingLoan'),/restoreLoanFollowUp\(\)/);
 assert.match(extract('restorePricingLoanFromHistory'),/restoreLoanFollowUp\(historyEntry.followUp\)/);
 assert.match(extract('currentPricingLoanSnapshot'),/followUp: readLoanFollowUp\(\)/);
 assert.doesNotMatch(extract('pricingLoanSnapshotKey'),/followUp/,'internal edits do not create a second contract identity');
});
test('internal fields are editor-only, omitted from print sources and available as structured client-source data',()=>{
 const field=html.indexOf('id="loanFollowUpFields"'),print=html.indexOf('id="pricingLoanPrint"');assert.ok(field>0&&field<print);
 const block=html.slice(field,html.indexOf('</fieldset>',field));assert.equal((block.match(/type="checkbox"/g)||[]).length,4);assert.match(block,/data-internal-only/);
 assert.match(extract('setupUnifiedDocumentLayout'),/document.getElementById\("loanFollowUpFields"\)/);
 assert.doesNotMatch(extract('renderPricingLoan'),/readLoanFollowUp|setLoanOutput\([^)]*followUp/);assert.doesNotMatch(extract('prepareLoanPrintCopies'),/followUp|loanFollowUp/);
 assert.match(extract('clientsCurrentSources'),/followUp: entry.followUp/);
 assert.match(fs.readFileSync(require.resolve('../styles.css'),'utf8'),/@media print \{ #loanFollowUpFields, \[data-internal-only\] \{ display: none !important; \} \}/);
 assert.match(source,/addEventListener\("change", handleLoanFollowUpChange\)/);
});

test('return heading counts hearing aids only, and changes for one or two devices',()=>{
 const c=vm.createContext({});vm.runInContext(extract('loanReturnLabel'),c);
 assert.equal(c.loanReturnLabel(0),'Zwrot aparatu');assert.equal(c.loanReturnLabel(1),'Zwrot aparatu');assert.equal(c.loanReturnLabel(2),'Zwrot aparatów');
 const render=extract('renderPricingLoan');assert.match(render,/activeDevices = devices.filter\(hasLoanDeviceData\)/);
 assert.match(render,/loanReturnLabel\(equipmentCount\)/);assert.match(html,/id="loanFollowUpTitle">Zwrot aparatu/);
 assert.doesNotMatch(html,/Co dalej po zwrocie/);
});
