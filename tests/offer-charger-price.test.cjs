const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('app.js', 'utf8');
function extract(name) {
  const rest = source.slice(source.indexOf(`function ${name}(`));
  return rest.slice(0, rest.slice(1).search(/\n(?:async )?function /) + 1);
}
const input = { value: '', dataset: {}, setCustomValidity(message) { this.validationMessage = message; } };
let deviceCount = 1;
const ctx = vm.createContext({
  offerChargerPriceInput: input, document: { activeElement: null },
  pricingRecordKey: record => record.idProduct,
  selectedPricingOfferItems: () => Array.from({ length: deviceCount }, () => ({ record: { model: 'Aparat' } })),
  pricingOfferAccessoryKind: record => /charger|ładowarka/i.test(record.model || '') ? 'charger' : '',
  normalizePricingPrice: value => {
    if (String(value).trim() === '') return '';
    const result = Number(String(value).replace(',', '.'));
    return Number.isFinite(result) ? result : '';
  }
});
for (const name of ['pricingChargerBundlePrices', 'resetOfferChargerPrice', 'pricingOfferChargerWithPrice']) vm.runInContext(extract(name), ctx);
const charger = { idProduct: 'CH1', model: 'Charger', grossPrice: 500 };
assert.equal(ctx.pricingOfferChargerWithPrice(charger).grossPrice, 500);
assert.equal(input.value, '500'); assert.equal(input.disabled, false);
input.dataset.manualPrice = '1'; input.value = '349,99';
assert.equal(ctx.pricingOfferChargerWithPrice(charger).grossPrice, 349.99);
assert.equal(charger.grossPrice, 500, 'offer override never changes catalog');
ctx.document.activeElement = input;
ctx.pricingOfferChargerWithPrice(charger); assert.equal(input.value, '349,99', 'typing is never overwritten');
input.value = '0'; assert.equal(ctx.pricingOfferChargerWithPrice(charger).grossPrice, 0);
input.value = 'invalid'; assert.ok(ctx.pricingOfferChargerWithPrice(charger), 'invalid price does not remove charger');
assert.ok(input.validationMessage);
ctx.document.activeElement = null;
assert.equal(ctx.pricingOfferChargerWithPrice({ ...charger, idProduct: 'CH2', grossPrice: 700 }).grossPrice, 700);
assert.equal(input.dataset.manualPrice, undefined); assert.equal(input.value, '700');
assert.equal(ctx.pricingOfferChargerWithPrice(null), null); assert.equal(input.value, ''); assert.equal(input.disabled, true);
const bundle = { ...charger, idProduct: 'A-CHARGER', nfzCode: 'A', grossPrice: 700 };
assert.equal(ctx.pricingOfferChargerWithPrice(bundle).grossPrice, 700, 'one hearing aid: one charger costs 700');
deviceCount = 2;
assert.equal(ctx.pricingOfferChargerWithPrice(bundle).grossPrice, 500, 'two hearing aids: still one charger, costs 500');
assert.equal(input.value, '500');
deviceCount = 1; assert.equal(ctx.pricingOfferChargerWithPrice(bundle).grossPrice, 700);
input.dataset.manualPrice = '1'; input.value = '0'; deviceCount = 2;
assert.equal(ctx.pricingOfferChargerWithPrice(bundle).grossPrice, 0, 'explicit per-offer override retained');
assert.equal(ctx.pricingChargerBundlePrices({ ...bundle, chargerPriceOne: 800, chargerPriceTwo: 600 }).two, 600);
assert.equal(ctx.pricingChargerBundlePrices({ ...bundle, nfzCode: 'P.01.01.00' }), null);
assert.equal(ctx.pricingChargerBundlePrices({ ...bundle, nfzCode: 'Ch' }).two, 500);
for(const nfzCode of ['C+',' c+ '])assert.equal(ctx.pricingChargerBundlePrices({...bundle,nfzCode}).two,500);
delete input.dataset.manualPrice;deviceCount=1;
assert.equal(ctx.pricingOfferChargerWithPrice({...bundle,nfzCode:'C+'}).grossPrice,700);
deviceCount=2;assert.equal(ctx.pricingOfferChargerWithPrice({...bundle,nfzCode:'C+'}).grossPrice,500);
Object.assign(ctx, {
  pricingFields: ['idProduct', 'nfzCode', 'tradeName', 'model', 'manufacturer', 'grossPrice'],
  repairPricingRecordColumns: record => record,
  normalizeAudibelTradeName: record => record.tradeName,
  normalizePricingManufacturerName: value => value
});
vm.runInContext(extract('normalizePricingRecordForUse'), ctx);
assert.equal(ctx.normalizePricingRecordForUse(bundle).nfzCode, 'C+', 'legacy charger code A is shown as C+');
assert.equal(ctx.normalizePricingRecordForUse({ ...bundle, model: 'Aparat' }).nfzCode, 'C+', 'all old code A products move to C+');
for(const nfzCode of ['Ch','CH','ch','C+',' c+ '])assert.equal(ctx.normalizePricingRecordForUse({...bundle,nfzCode}).nfzCode,'C+');
const migrated=ctx.normalizePricingRecordForUse({...bundle,nfzCode:'Ch',discountOne:20,discountPair:50,chargerPriceOne:750,chargerPriceTwo:550});
assert.equal(migrated.grossPrice,700);assert.equal(migrated.discountOne,20);assert.equal(migrated.discountPair,50);
assert.equal(migrated.chargerPriceOne,750);assert.equal(migrated.chargerPriceTwo,550);
assert.equal(ctx.normalizePricingRecordForUse({ ...bundle, nfzCode: 'P.01.01.00' }).nfzCode, 'P.01.01.00', 'real NFZ codes are untouched');
assert.equal(ctx.normalizePricingRecordForUse({ ...bundle, grossPrice: 1200 }).grossPrice, 1200, 'catalog base charger price remains unchanged');
assert.ok(!extract('savePricingRecordEditor').includes('values.grossPrice = discounts.chargerPriceOne'));
assert.match(extract('createPricingRow'), /text\.append\(createPricingPriceElement\(record\.grossPrice\)\);\s*if \(chargerBundle\)/);
assert.match(source, /\[\["1 aparat", chargerBundle\.one\], \["2 aparaty", chargerBundle\.two\]\]/);
assert.ok(!source.includes('(1 ładowarka)'));
assert.doesNotMatch(extract('renderPricingOffer'), /item\.input\.value = pricingOfferDeviceLabel/);
assert.match(extract('restorePricingOfferFromHistory'), /offerChargerPriceInput\.value = String\(savedItem\.grossPrice/);
assert.match(extract('validatePricingOfferForAction'), /!input\?\.validationMessage/);
assert.match(extract('saveCurrentPricingOfferToHistory'), /validatePricingOfferForAction\(\)/);
console.log('OK: charger editable per-offer price, zero price, no catalog mutation or input snap, validation, switching and history restore.');

const makeInput = id => ({id,value:'',dataset:{},setCustomValidity(value){this.validationMessage=value;}});
const freeRight=makeInput('offerDeviceInput1'),freeLeft=makeInput('offerDeviceInput2');
const prices={offerPriceInput1:makeInput('offerPriceInput1'),offerPriceInput2:makeInput('offerPriceInput2')};
const catalog=[{idProduct:'TEST1',model:'Audeo Test',grossPrice:5000,nfzCode:'P.01.01.00'}];
const free=vm.createContext({document:{getElementById:id=>prices[id],activeElement:null},normalize:value=>String(value||'').trim().toLowerCase(),
  formatPricingPrice:value=>String(value),
  pricingOfferSuggestedRecords:()=>catalog,pricingOfferPricedRecords:()=>catalog,pricingOfferAccessoryRecords:()=>[],
  offerDeviceInput1:freeRight,offerDeviceInput2:freeLeft,offerGeneralInput:null,markAgreementDraftDirty(){},renderPricingOffer(){},
  PRICING_OFFER_NFZ_BY_CODE:{},PRICING_OFFER_NFZ_PER_DEVICE:1050,normalizeLoanHistoryText:value=>String(value??'').trim()});
for(const name of ['normalizePricingPrice','normalizePricingNfzCode','pricingOfferDeviceLabel','pricingOfferPriceInput','pricingOfferInputRecord',
  'pricingOfferWithPrice','copyPricingOfferInputDetails','selectedPricingOfferItems','transferOfferSides','pricingOfferNfzAmount','normalizePricingOfferHistoryItem'])vm.runInContext(extract(name),free);
freeRight.value='Dowolny produkt';
let manual=free.selectedPricingOfferItems()[0].record;
assert.equal(manual.model,'Dowolny produkt');assert.equal(manual.grossPrice,'');assert.ok(prices.offerPriceInput1.validationMessage);
prices.offerPriceInput1.value='1234,56';prices.offerPriceInput1.dataset.manualPrice='1';
manual=free.selectedPricingOfferItems()[0].record;assert.equal(manual.grossPrice,1234.56);assert.equal(free.pricingOfferNfzAmount(manual),0);
free.transferOfferSides();assert.equal(freeLeft.value,'Dowolny produkt');assert.equal(free.selectedPricingOfferItems()[0].record.grossPrice,1234.56);
assert.equal(prices.offerPriceInput2.value,'1234,56');assert.equal(catalog[0].grossPrice,5000);
freeRight.value='Audeo';assert.equal(free.pricingOfferInputRecord(freeRight).offerCustom,true,'partial text is not replaced with a catalog product');
freeRight.value='Audeo Test';assert.equal(free.selectedPricingOfferItems()[0].record.grossPrice,5000);
prices.offerPriceInput1.value='4500';prices.offerPriceInput1.dataset.manualPrice='1';assert.equal(free.selectedPricingOfferItems()[0].record.grossPrice,4500);assert.equal(catalog[0].grossPrice,5000);
prices.offerPriceInput1.value='-1';assert.equal(free.selectedPricingOfferItems()[0].record.grossPrice,'');
prices.offerPriceInput1.value='0';assert.equal(free.selectedPricingOfferItems()[0].record.grossPrice,0);
const stored=free.normalizePricingOfferHistoryItem({kind:'device',record:manual});assert.equal(stored.manual,true);
freeRight.value=stored.model;freeRight.dataset.offerSavedValue=stored.model;freeRight.dataset.offerSavedRecord=JSON.stringify({...stored,offerCustom:stored.manual});
assert.equal(free.pricingOfferInputRecord(freeRight).offerCustom,true);assert.equal(free.pricingOfferInputRecord(freeRight).grossPrice,'1234.56');
console.log('OK: free offer names and prices, exact suggestions, no inferred NFZ, empty/negative/zero price, P/L transfer, historical manual flag and immutable catalog.');
