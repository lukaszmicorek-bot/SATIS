const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('app.js', 'utf8');
function extract(name) {
  const rest = source.slice(source.indexOf(`function ${name}(`));
  return rest.slice(0, rest.slice(1).search(/\n(?:async )?function /) + 1);
}
const input = { value: '', dataset: {}, setCustomValidity(message) { this.validationMessage = message; } };
const ctx = vm.createContext({
  offerChargerPriceInput: input, document: { activeElement: null },
  pricingRecordKey: record => record.idProduct,
  normalizePricingPrice: value => {
    if (String(value).trim() === '') return '';
    const result = Number(String(value).replace(',', '.'));
    return Number.isFinite(result) ? result : '';
  }
});
for (const name of ['resetOfferChargerPrice', 'pricingOfferChargerWithPrice']) vm.runInContext(extract(name), ctx);
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
assert.doesNotMatch(extract('renderPricingOffer'), /item\.input\.value = pricingOfferDeviceLabel/);
assert.match(extract('restorePricingOfferFromHistory'), /offerChargerPriceInput\.value = String\(savedItem\.grossPrice/);
assert.match(source, /if \(offerChargerPriceInput\?\.validationMessage\)/);
console.log('OK: charger editable per-offer price, zero price, no catalog mutation or input snap, validation, switching and history restore.');
