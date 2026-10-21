const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');
const source = fs.readFileSync('app.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
function extract(name) {
  const match = new RegExp(`^(?:async )?function ${name}\\(`, 'm').exec(source);
  assert.ok(match, name);
  return source.slice(match.index, source.indexOf('\n}', match.index) + 2);
}
function setup() {
  const fields = new Map();
  for (const id of ['receiptCustomerInput', 'receiptDateInput', 'receiptAddressInput', 'receiptNfzInput',
    'receiptModelP', 'receiptSerialP', 'receiptModelL', 'receiptSerialL', 'receiptInstructions', 'receiptWarranty', 'receiptBattery', 'receiptStatus']) {
    fields.set(id, { value: '', checked: false, textContent: '', validity: '',
      setCustomValidity(value) { this.validity = value; }, reportValidity() { return !this.validity; } });
  }
  const ctx = vm.createContext({
    document: { getElementById: id => fields.get(id) },
    pricingReceiptView: { querySelector: () => null },
    titleCaseName: value => value, normalizeSerialNumber: value => String(value || '').trim().toUpperCase(),
    normalize: value => String(value || '').toLowerCase(),
    customerNameLookupKey: value => String(value || '').toLowerCase(),
    isoDateForSave: value => /^2026-\d{2}-\d{2}$/.test(value) ? value : '',
    isFullPersonName: value => value.trim().split(/\s+/).length > 1
  });
  for (const name of ['receiptSnapshot', 'validatePricingReceipt', 'receiptDeviceForSerial']) vm.runInContext(extract(name), ctx);
  return { ctx, fields, set(id, value) { fields.get(id).value = value; } };
}
test('receipt needs a customer, valid date and model; duplicate serials block printing', () => {
  const t = setup();
  assert.equal(t.ctx.validatePricingReceipt(), false);
  t.set('receiptCustomerInput', 'Jan Testowy');
  assert.equal(t.ctx.validatePricingReceipt(), false);
  t.set('receiptDateInput', '2026-10-21');
  assert.equal(t.ctx.validatePricingReceipt(), false);
  t.set('receiptModelP', 'Model P');
  assert.equal(t.ctx.validatePricingReceipt(), true);
  t.set('receiptSerialL', 'abc123');
  assert.equal(t.ctx.validatePricingReceipt(), false);
  t.set('receiptModelL', 'Model L');
  t.set('receiptSerialP', 'ABC123');
  assert.equal(t.ctx.validatePricingReceipt(), false);
  assert.match(t.fields.get('receiptStatus').textContent, /ten sam numer/);
  t.set('receiptSerialL', 'DEF456');
  assert.equal(t.ctx.validatePricingReceipt(), true);
  assert.equal(t.ctx.receiptSnapshot().items.length, 2);
  assert.equal(t.ctx.receiptSnapshot().tested, '', 'testing is never confirmed automatically');
  assert.equal(t.ctx.receiptSnapshot().warranty, false);
});
test('serial completion requires an unambiguous customer and model, even in historical records', () => {
  const { ctx } = setup();
  const record = { serialNumber: 'ABC123', customerName: 'Jan Testowy', deviceName: 'Model' };
  assert.equal(ctx.receiptDeviceForSerial('abc123', [record]), record);
  assert.equal(ctx.receiptDeviceForSerial('ABC123', [record, { ...record }]), record);
  assert.equal(ctx.receiptDeviceForSerial('ABC123', [record, { ...record, customerName: 'Inna Osoba' }]), null);
  assert.equal(ctx.receiptDeviceForSerial('', [record]), null);
  assert.equal(ctx.receiptDeviceForSerial('unknown', [record]), null);
});
test('receipt is available online and offline, clears personal data, and never writes business records', () => {
  assert.match(html, /id="receiptTab"[^>]+data-view="receipt"/);
  assert.match(source, /resetPricingReceipt\(\);/);
  assert.doesNotMatch(extract('printPricingReceipt'), /upsert|persist|saveCurrent/);
  assert.match(extract('printPricingReceipt'), /validatePricingReceipt\(\)/);
  assert.match(extract('renderPricingReceipt'), /cell.textContent = value/);
  assert.match(extract('renderPricingReceipt'), /snapshot.items.length === 2/);
  const offline = fs.readFileSync('offline-forms.js', 'utf8');
  assert.match(offline, /const printOnly = kind => kind === "rodo" \|\| kind === "receipt"/);
  assert.match(offline, /if \(printOnly\(kind\)\) return null/);
  assert.match(offline, /api.validate && !api.validate\(kind\)/);
  assert.match(offline, /api.reset\("receipt"\)/);
});
