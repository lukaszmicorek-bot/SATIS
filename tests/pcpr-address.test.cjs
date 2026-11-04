const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const source=fs.readFileSync('app.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('styles.css','utf8');
function extract(name){const start=source.indexOf(`function ${name}(`);assert.ok(start>=0,name);const rest=source.slice(start);return rest.slice(0,rest.slice(1).search(/\n(?:async )?function /)+1);}
function setup(){
  const field=()=>({value:'',required:false});const hint={hidden:true};
  const ctx=vm.createContext({normalizeLoanHistoryText:value=>String(value||'').trim().replace(/\s+/gu,' '),
    pcprStreetInput:field(),pcprStreetNameInput:field(),pcprHouseNumberInput:field(),pcprFlatNumberInput:field(),
    document:{querySelector:()=>hint},hint,
    findPricingOfferRecord:()=>null,parsePcprAddress:()=>({}),formatPcprPostalCode:value=>value||'',normalizePcprCity:value=>value||'',
    pcprCityForPostalCode:()=>'',normalizeBooleanFlag:Boolean,normalizePricingPcprOffice:value=>value||'',normalizePcprPlace:value=>value||'',
    pcprPlaceForOffice:()=>'',formatPcprPhone:value=>value||'',normalizePricingPcprEar:value=>value||'',makeId:()=> 'test-id'});
  for(const name of ['titleCaseName','pcprStreetAddressParts','fillPcprStreetForm','syncPcprStreetForm','pcprAddressLabel','normalizePricingPcprItem'])vm.runInContext(extract(name),ctx);
  return ctx;
}
test('simple legacy addresses split without losing Polish street names, house suffixes or apartment numbers',()=>{
  const ctx=setup();
  for(const [street,name,house,flat]of [['ul. kościuszki 12a/3','ul. Kościuszki','12A','3'],['3 maja 12','3 Maja','12',''],['Słoneczna 4/12b','Słoneczna','4','12B']]){
    const parts=ctx.pcprStreetAddressParts({street});assert.equal(parts.streetName,name);assert.equal(parts.houseNumber,house);assert.equal(parts.flatNumber,flat);assert.equal(parts.streetNeedsReview,false);
  }
});
test('ambiguous legacy addresses stay whole and show a review hint rather than guessing numbers',()=>{
  const ctx=setup();
  for(const street of ['Słoneczna 12-14','Słoneczna 12/3/4','Dywizjonu 303','ul. Dywizjonu 303']){
    const parts=ctx.fillPcprStreetForm({street});assert.equal(parts.street,street);assert.equal(parts.houseNumber,'');assert.equal(parts.flatNumber,'');assert.equal(ctx.hint.hidden,false);
  }
});
test('structured numbers survive normalization, JSON save/reload and editing while the list address stays combined',()=>{
  const ctx=setup();
  const first=ctx.normalizePricingPcprItem({customer:'Jan Testowy',streetName:'Skłodowskiej-Curie',houseNumber:'12-14',flatNumber:'3a',postalCode:'34-300',city:'Żywiec'});
  const saved=ctx.normalizePricingPcprItem(JSON.parse(JSON.stringify(first)));
  ctx.fillPcprStreetForm(saved);
  assert.equal(ctx.pcprStreetNameInput.value,'Skłodowskiej-Curie');assert.equal(ctx.pcprHouseNumberInput.value,'12-14');assert.equal(ctx.pcprFlatNumberInput.value,'3A');
  assert.equal(saved.street,'Skłodowskiej-Curie 12-14/3A');assert.equal(saved.address,'34-300 Żywiec, Skłodowskiej-Curie 12-14/3A');assert.equal(ctx.hint.hidden,true);
});
test('typing does not rewrite the street or move the caret; blur formats and splits a pasted simple street',()=>{
  const ctx=setup();ctx.pcprStreetNameInput.value='nowa 12a/3';ctx.syncPcprStreetForm({format:false});assert.equal(ctx.pcprStreetNameInput.value,'nowa 12a/3');
  ctx.syncPcprStreetForm({split:true});assert.equal(ctx.pcprStreetNameInput.value,'Nowa');assert.equal(ctx.pcprHouseNumberInput.value,'12A');assert.equal(ctx.pcprFlatNumberInput.value,'3');assert.equal(ctx.pcprStreetInput.value,'Nowa 12A/3');
  assert.equal(ctx.pcprHouseNumberInput.required,true);
  ctx.fillPcprStreetForm({street:''});assert.ok([ctx.pcprStreetInput,ctx.pcprStreetNameInput,ctx.pcprHouseNumberInput,ctx.pcprFlatNumberInput].every(field=>field.value===''));assert.equal(ctx.hint.hidden,true);assert.equal(ctx.pcprHouseNumberInput.required,false);
});
test('street, house and optional apartment occupy one grid row, including narrow viewports',()=>{
  assert.match(html,/class="pcpr-street-field pcpr-address-fields"/);
  assert.match(html,/id="pcprStreetInput" type="hidden"/);
  const ids=['pcprStreetNameInput','pcprHouseNumberInput','pcprFlatNumberInput','pcprPostalCodeInput','pcprCityInput'];
  const positions=ids.map(id=>html.indexOf(`id="${id}"`));assert.ok(positions.every((position,index)=>position>=0&&(!index||position>positions[index-1])));
  assert.match(css,/\.pcpr-address-fields \{[^}]*grid-template-columns: minmax\(0, 1fr\) 68px 68px/);
  assert.match(css,/@media \(max-width: 420px\) \{ \.pcpr-address-fields \{ grid-template-columns: minmax\(0, 1fr\) 62px 62px/);
  assert.match(extract('currentPricingPcprItemSnapshot'),/const streetParts = syncPcprStreetForm/);
  assert.match(extract('editPricingPcprItem'),/fillPcprStreetForm\(entry\)/);
  assert.match(extract('resetPricingPcprForm'),/fillPcprStreetForm\(\{ street: "" \}\)/);
});

test('one or two preliminary models align with the PCPR/MOPS frame without fixed heights or stretched controls',()=>{
  assert.match(css,/\.pcpr-form-row-bottom > \.pcpr-office-field, \.pcpr-form-row-bottom > \.pcpr-model-stack \{ align-self: stretch; \}/);
  const single=css.slice(css.lastIndexOf('.pcpr-model-stack {')).split('}')[0];
  assert.match(single,/grid-template-rows: minmax\(min-content, 1fr\)/);
  assert.match(css,/\.pcpr-model-stack:has\(#pcprSecondModelField:not\(\[hidden\]\)\) \{ grid-template-rows: repeat\(2, minmax\(min-content, 1fr\)\); \}/);
  assert.match(css,/\.pcpr-model-stack > \.pcpr-model-field \{ align-content: start;/);
  assert.doesNotMatch(single,/\b(?:max-|min-)?height:\s*\d/);
  const caption={textContent:''},field={hidden:true,dataset:{},classList:{toggle(){}},querySelector:()=>caption};
  const ctx=vm.createContext({pcprSecondModelField:field,addPcprSecondModelBtn:{hidden:false},pcprModelInput2:{value:'Model L',readOnly:false},removePcprSecondModelBtn:{hidden:false}});
  vm.runInContext(extract('setPcprSecondModelVisible'),ctx);
  ctx.setPcprSecondModelVisible(true);assert.equal(field.hidden,false);assert.equal(ctx.addPcprSecondModelBtn.hidden,true);assert.equal(ctx.removePcprSecondModelBtn.hidden,false);
  ctx.setPcprSecondModelVisible(true,{autoBoth:true});assert.equal(field.hidden,false);assert.equal(ctx.pcprModelInput2.readOnly,true);assert.equal(ctx.removePcprSecondModelBtn.hidden,true);
  ctx.setPcprSecondModelVisible(false);assert.equal(field.hidden,true);assert.equal(ctx.addPcprSecondModelBtn.hidden,false);assert.equal(ctx.pcprModelInput2.value,'');
});
