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
Object.assign(ctx, {
  pricingFields: ['idProduct', 'nfzCode', 'tradeName', 'model', 'manufacturer', 'grossPrice'],
  repairPricingRecordColumns: record => record,
  normalizeAudibelTradeName: record => record.tradeName,
  normalizePricingManufacturerName: value => value
});
vm.runInContext(extract('normalizePricingRecordForUse'), ctx);
assert.equal(ctx.normalizePricingRecordForUse(bundle).nfzCode, 'Ch', 'legacy charger code A is shown as Ch');
assert.equal(ctx.normalizePricingRecordForUse({ ...bundle, model: 'Aparat' }).nfzCode, 'Ch', 'all old code A products move to Ch');
assert.equal(ctx.normalizePricingRecordForUse({ ...bundle, nfzCode: 'P.01.01.00' }).nfzCode, 'P.01.01.00', 'real NFZ codes are untouched');
assert.equal(ctx.normalizePricingRecordForUse({ ...bundle, grossPrice: 1200 }).grossPrice, 1200, 'catalog base charger price remains unchanged');
assert.ok(!extract('savePricingRecordEditor').includes('values.grossPrice = discounts.chargerPriceOne'));
assert.match(extract('createPricingRow'), /text\.append\(createPricingPriceElement\(record\.grossPrice\)\);\s*if \(chargerBundle\)/);
assert.match(source, /\[\["1 aparat", chargerBundle\.one\], \["2 aparaty", chargerBundle\.two\]\]/);
assert.ok(!source.includes('(1 ładowarka)'));
assert.doesNotMatch(extract('renderPricingOffer'), /item\.input\.value = pricingOfferDeviceLabel/);
assert.match(extract('restorePricingOfferFromHistory'), /offerChargerPriceInput\.value = String\(savedItem\.grossPrice/);
assert.match(source, /if \(offerChargerPriceInput\?\.validationMessage\)/);
console.log('OK: charger editable per-offer price, zero price, no catalog mutation or input snap, validation, switching and history restore.');
