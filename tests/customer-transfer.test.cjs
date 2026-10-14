const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('app.js', 'utf8');
function extract(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0);
  const rest = source.slice(start);
  return rest.slice(0, rest.slice(1).search(/\n(?:async )?function /) + 1);
}
let approved = true;
const context = vm.createContext({
  isFullPersonName: value => String(value || '').trim().split(/\s+/).length >= 2,
  titleCaseName: value => value,
  customerNameLookupKey: value => String(value || '').trim().toLowerCase(),
  formatRodoPhone: value => value,
  confirm: () => approved,
  Event: class { constructor(type) { this.type = type; } }
});
for (const name of ['serializeCustomerTransfer', 'parseCustomerTransfer', 'applyCustomerTransfer']) vm.runInContext(extract(name), context);
const data = { name: 'Test Klient', phone: '500 600 800', address: 'ul. Testowa 1, 00-001 Test', document: 'abc123456' };
const text = context.serializeCustomerTransfer(data);
assert.deepEqual(JSON.parse(JSON.stringify(context.parseCustomerTransfer(text))), data);
assert.equal(context.parseCustomerTransfer('Test Klient'), null);
assert.equal(context.parseCustomerTransfer('Imię i nazwisko: Test Klient\nNr seryjny: ABC'), null);
assert.equal(context.parseCustomerTransfer('Imię i nazwisko: Test Klient\nTelefon: 1\nTelefon: 2'), null);
assert.equal(context.parseCustomerTransfer('x'.repeat(2001)), null);
const input = value => ({ value, events: [], dispatchEvent(event) { this.events.push(event.type); } });
const fields = { name: input(''), phone: input(''), address: input(''), document: input('') };
assert.equal(context.applyCustomerTransfer(fields, data), true);
assert.equal(fields.document.value, 'ABC123456');
assert.equal(fields.phone.value, data.phone);
assert.deepEqual(fields.name.events, ['input'], 'no customer change event that auto-selects products');
approved = false;
assert.equal(context.applyCustomerTransfer(fields, { name: 'Inny Klient' }), false);
assert.equal(fields.name.value, data.name);
approved = true;
assert.equal(context.applyCustomerTransfer(fields, { name: 'Inny Klient' }), true);
assert.equal(fields.phone.value, '', 'never carry old customer phone to new customer');
assert.equal(fields.document.value, '');
assert.equal(fields.address.value, '');
assert.equal(context.applyCustomerTransfer({ name: fields.name }, data), true, 'pickup supports name-only destination');
assert.match(source, /customerTransferMemory = null;\n  customerTransferGeneration \+= 1;/);
assert.doesNotMatch(extract('setupCustomerTransfer'), /localStorage|sessionStorage|fetch\(/);
console.log('OK: customer transfer roundtrip, overwrite confirmation, old-contact clearing, name-only pickup and no product auto-selection.');
