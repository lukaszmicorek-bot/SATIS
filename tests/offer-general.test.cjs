const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {test} = require('node:test');
const source = fs.readFileSync(require.resolve('../app.js'), 'utf8');
function extract(name) {
  const start = source.indexOf(`function ${name}(`); assert.ok(start >= 0, name);
  const rest = source.slice(start); return rest.slice(0, rest.slice(1).search(/\n(?:async )?function /) + 1);
}
function setup() {
  const c = vm.createContext({collator:new Intl.Collator('pl'),normalize:value=>String(value||'').trim().toLowerCase(),
    normalizeLoanHistoryText:value=>String(value??'').trim(),isoDateForSave:value=>value||'',normalizeDocumentLocationValue:value=>value||'',
    titleCaseName:value=>value,makeId:()=> 'synthetic-id',customerNameLookupKey:value=>String(value||'').toLowerCase(),
    pricingOfferHistoryPatientGroup:()=>'',pricingRecords:[],pricingGeneralOfferSavedRanges:null,
    offerGeneralInput:{checked:true},offerCustomerInput:{value:'Osoba Testowa'},offerNotesInput:{value:'Ustalenia'},
    ensurePricingOfferDate:()=> '2026-11-18',ensurePricingOfferLocation:()=> 'P63',currentSupabaseUser:{email:'owner@example.invalid'},
    currentWorkstationName:()=> 'P63',addDaysToIsoDate:()=> '2026-12-18',PRICING_OFFER_VALID_DAYS:30});
  for(const name of ['normalizePricingPrice','normalizePricingManufacturerName','normalizePricingNfzCode','pricingOfferAccessoryKind','isPricingModelUnavailable',
    'pricingGeneralOfferBrand','normalizePricingGeneralRanges','pricingGeneralOfferRanges','currentPricingGeneralRanges','normalizePricingOfferHistoryItem',
    'pricingOfferHistoryEntryHasContent','normalizePricingOfferHistoryEntry','currentPricingOfferSnapshot','pricingOfferSnapshotKey','selectedPricingOfferItems','selectedPricingOfferAccessoryItems'])vm.runInContext(extract(name),c);
  return c;
}
const product=(model,price,manufacturer='PHONAK AG',nfzCode='P.01.01.00',tradeName=model)=>({model,tradeName,manufacturer,nfzCode,grossPrice:price});
test('only brands with offer logos appear, including when an older saved offer is restored',()=>{
  const c=setup(),html=fs.readFileSync(require.resolve('../index.html'),'utf8');
  const start=html.indexOf('<div class="manufacturer-brand-logos"'),block=html.slice(start,html.indexOf('</div>',start));
  const brands=[...block.matchAll(/alt="([^"]+)"/g)].map(match=>match[1]);assert.equal(brands.length,11);
  const extras=['BHM TECH','MED-EL','GN Hearing A/S','SBO HEARING A/S','WSAUD A/S','Inna firma'];
  const catalog=[...brands.map(brand=>product('Model',4000,brand)),...extras.map(brand=>product('Model',100,brand))];
  const rows=c.pricingGeneralOfferRanges(catalog);assert.equal(rows.length,11);assert.ok(rows.every(row=>brands.includes(row.manufacturer)&&row.min===4000));
  const saved=c.normalizePricingOfferHistoryEntry({customer:'Osoba Testowa',generalInformation:true,
    priceRanges:[...rows,...extras.map(manufacturer=>({manufacturer,min:100,max:1000}))]});
  assert.equal(saved.priceRanges.length,11);assert.ok(saved.priceRanges.every(row=>brands.includes(row.manufacturer)));
  c.pricingGeneralOfferSavedRanges=saved.priceRanges;assert.equal(c.currentPricingGeneralRanges().length,11);
});
test('ranges use catalog hearing aids only and merge NFZ copies and manufacturer aliases',()=>{
  const c=setup();c.pricingRecords=[product('Audeo I50',5000),product('Audeo I90',9000),product('Audeo I50',5000,'Sonova AG','P.01.01.01'),
    product('Charger',10),product('Wkładka',20,'SBO','P.03.01.00'),product('Roger',30000,'Phonak','P.04.01'),
    product('Oticon More 1',100,'OTICON'),product('Virto',0),product('Sky','bad'),product('Receiver',5,'Phonak',''),
    product('Signia Silk',3500,'WSAUD A/S'),product('Audio Service R',4500,'WSAUD A/S')];
  assert.deepEqual(JSON.parse(JSON.stringify(c.pricingGeneralOfferRanges())),[
    {manufacturer:'Audio Service',min:4500,max:4500},{manufacturer:'Phonak',min:5000,max:9000},{manufacturer:'Signia',min:3500,max:3500}]);
});
test('large catalogs are aggregated before history bounds, so later brands and extremes remain included',()=>{
  const c=setup(),catalog=Array.from({length:2000},()=>product('Audeo',5000));
  catalog.push(product('HearLink',2000,'SBO'),product('Audeo',12000),product('ReSound Vivia',8000,'GN Hearing A/S'));
  const rows=c.pricingGeneralOfferRanges(catalog);assert.equal(rows.length,3);
  assert.equal(rows.find(row=>row.manufacturer==='Phonak').max,12000);assert.equal(rows.find(row=>row.manufacturer==='Philips').min,2000);
});
test('general snapshots contain no models, NFZ payments, totals or hidden selected accessories; history freezes ranges',()=>{
  const c=setup();c.pricingRecords=[product('Audeo',4000),product('Audeo',8000)];
  const snapshot=c.currentPricingOfferSnapshot(),saved=c.normalizePricingOfferHistoryEntry(JSON.parse(JSON.stringify(snapshot)));
  assert.equal(saved.generalInformation,true);assert.equal(saved.customer,'Osoba Testowa');assert.equal(saved.items.length,0);assert.equal(saved.total,'');
  assert.equal(saved.patient,'');assert.equal(saved.pfronEnabled,false);assert.equal(c.selectedPricingOfferItems().length,0);assert.equal(c.selectedPricingOfferAccessoryItems().length,0);
  c.pricingGeneralOfferSavedRanges=saved.priceRanges;c.pricingRecords=[product('Audeo',9999)];
  assert.equal(c.currentPricingGeneralRanges()[0].min,4000);assert.equal(c.currentPricingGeneralRanges()[0].max,8000);
  c.pricingGeneralOfferSavedRanges=null;assert.equal(c.currentPricingGeneralRanges()[0].min,9999);
  assert.notEqual(c.pricingOfferSnapshotKey(saved),c.pricingOfferSnapshotKey({...saved,generalInformation:false}));
});
test('empty, malformed and unavailable catalog entries cannot invent a range',()=>{
  const c=setup();assert.equal(c.pricingGeneralOfferRanges([]).length,0);
  for(const model of ['Ruby','Opn S 3','Opn Play 1','More 2'])assert.equal(c.pricingGeneralOfferRanges([product(model,5000,'Oticon')]).length,0);
  const rows=c.normalizePricingGeneralRanges([{manufacturer:'X',min:-1,max:3},{manufacturer:'X',min:5,max:2},{manufacturer:'',min:1,max:2},{manufacturer:'X',min:NaN,max:5}]);
  assert.equal(rows.length,0);
});
