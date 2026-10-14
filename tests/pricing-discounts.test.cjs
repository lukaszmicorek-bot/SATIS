const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('app.js', 'utf8');
function extract(name) {
  const start = source.indexOf(`function ${name}(`);
  const rest = source.slice(start);
  return rest.slice(0, rest.slice(1).search(/\n(?:async )?function /) + 1);
}
const parse = value => {
  if (value === '' || value === null || value === undefined) return '';
  const number = Number(String(value).replace(',', '.').replace(/\s/g, ''));
  return Number.isFinite(number) ? number : '';
};
const ctx = vm.createContext({ normalizePricingPrice: parse });
vm.runInContext(extract('pricingDiscountPrices'), ctx);
const a = { nfzCode: 'A', grossPrice: 4000, discountOne: 200, discountPair: 500 };
assert.equal(ctx.pricingDiscountPrices(a).one, 3800);
assert.equal(ctx.pricingDiscountPrices(a).pair, 7500, 'pair discount deducted once, not per device');
assert.equal(ctx.pricingDiscountPrices({ ...a, nfzCode: ' a ' }).pair, 7500);
assert.equal(ctx.pricingDiscountPrices({ ...a, nfzCode: 'P.01.01.00' }).one, 4000);
assert.equal(ctx.pricingDiscountPrices({ nfzCode: 'A', grossPrice: 4000 }).pair, 8000);
assert.equal(ctx.pricingDiscountPrices({ nfzCode: 'A', grossPrice: '34,99', discountOne: '10,01', discountPair: '10,99' }).pair, 58.99);
assert.equal(ctx.pricingDiscountPrices({ ...a, discountOne: 9000, discountPair: 99999 }).pair, 0);
assert.equal(ctx.pricingDiscountPrices({ ...a, grossPrice: 'invalid' }), null);
assert.equal(a.grossPrice, 4000, 'catalog base price never overwritten by computed discount');
const fields = {
  nfzCode: { value: 'A' }, grossPrice: { value: '4000' }, model: { value: 'Aparat' }, tradeName: { value: '' },
  chargerPriceOne: { value: '700', setCustomValidity(message) { this.error = message; } },
  chargerPriceTwo: { value: '500', setCustomValidity(message) { this.error = message; } },
  discountOne: { value: '-1', setCustomValidity(message) { this.error = message; } },
  discountPair: { value: '9000', setCustomValidity(message) { this.error = message; } }
};
const panel = {};
ctx.document = { querySelector: selector => selector === '#pricingRecordForm' ? { elements: { namedItem: name => fields[name] } } : panel };
ctx.canCreatePricingRecord = () => true;
ctx.pricingOfferAccessoryKind = record => /charger|ładowarka/i.test(record.model || '') ? 'charger' : '';
ctx.formatPricingPrice = value => `${value} zł`;
vm.runInContext(extract('updatePricingDiscountEditor'), ctx);
ctx.updatePricingDiscountEditor();
assert.ok(fields.discountOne.error); assert.ok(fields.discountPair.error);
fields.discountOne.value = '200'; fields.discountPair.value = '500';
ctx.updatePricingDiscountEditor();
assert.equal(fields.discountOne.error, ''); assert.equal(fields.discountPair.error, '');
ctx.canCreatePricingRecord = () => false;
ctx.updatePricingDiscountEditor(); assert.equal(panel.hidden, true, 'discount controls restricted to SATIS');
assert.match(extract('normalizePricingRecordForUse'), /normalizedRecord\.discountOne/);
assert.match(extract('pricingRecordFingerprint'), /normalized\.discountPair/);
assert.match(extract('mergePricingRecords'), /discountPair: recordsToMerge\[index\]\.discountPair/);
console.log('OK: fixed single/pair discounts for code A, pair deducted once, cent precision, owner-only editor, validation and persistence.');
