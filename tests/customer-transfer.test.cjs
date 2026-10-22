const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');
const source = fs.readFileSync('app.js', 'utf8');
function extract(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0);
  const rest = source.slice(start);
  return rest.slice(0, rest.slice(1).search(/\n(?:async )?function /) + 1);
}

test('document customer lookup supports first/surname fragments without treating them as exact identities', () => {
  const ctx = vm.createContext({customerNameLookupKey: value => String(value).toLowerCase().trim()});
  vm.runInContext(extract('documentCustomerNameMatches'), ctx);
  const names = ['Jan Kowalski', 'Jan Nowak', 'Anna Kowalska'];
  assert.equal(ctx.documentCustomerNameMatches('Jan', names).length, 2);
  assert.equal(ctx.documentCustomerNameMatches('Kowal', names).length, 2);
  assert.equal(ctx.documentCustomerNameMatches('Nowak Jan', names)[0], 'Jan Nowak');
  assert.equal(ctx.documentCustomerNameMatches('J', names).length, 0);
});

test('automatic document contacts require agreement across profiles and never overwrite manual fields', () => {
  let dirty = 0;
  const ctx = vm.createContext({customerNameLookupKey: value => String(value).toLowerCase().trim(),
    normalize: value => String(value).toLowerCase().trim(),
    normalizeLoanIdentityValue: value => String(value).toUpperCase().replace(/\s/g, ''),
    formatRodoPhone: value => value, Event,
    markAgreementDraftDirty() { dirty++; }});
  for (const name of ['unambiguousDocumentContact', 'fillDocumentContactFields']) vm.runInContext(extract(name), ctx);
  const entries = [{customerKey: 'jan testowy', source: 'Umowa', phone: '500 600 700', document: 'ABC123456', address: 'ul. Testowa 1'},
    {customerKey: 'jan testowy', source: 'Zamówienie', phone: '+48 500600700', document: '', address: ''}];
  const contact = ctx.unambiguousDocumentContact(entries);
  assert.equal(contact.source, 'Umowa');
  assert.equal(contact.document, 'ABC123456');
  assert.equal(ctx.unambiguousDocumentContact([...entries, {...entries[0], phone: '999888777'}]), null);
  assert.equal(ctx.unambiguousDocumentContact([...entries, {...entries[0], address: 'Inny adres'}]), null);
  const field = value => ({value, dataset: {}, dispatchEvent() {}});
  const fields = {name: field('Jan Testowy'), phone: field('')};
  assert.equal(ctx.fillDocumentContactFields(fields, contact, 'order'), true);
  assert.equal(fields.phone.value, '500 600 700');
  assert.equal(fields.phone.dataset.documentContactCustomer, 'jan testowy');
  fields.phone.value = 'manual';
  assert.equal(ctx.fillDocumentContactFields(fields, contact, 'order'), false);
  assert.equal(fields.phone.value, 'manual');
  fields.name.value = 'Inna Osoba';
  fields.phone.value = '';
  assert.equal(ctx.fillDocumentContactFields(fields, contact, 'order'), false);
  assert.equal(dirty, 1);
});
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
