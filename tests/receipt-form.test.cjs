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
    'receiptModelP', 'receiptSerialP', 'receiptModelL', 'receiptSerialL', 'receiptInstructions', 'receiptWarranty', 'receiptBattery', 'receiptStatus',
    'receiptPurchaseChoice', 'receiptPurchaseField']) {
    fields.set(id, { value: '', checked: false, textContent: '', validity: '', dataset: {},
      replaceChildren(...children) { this.children = children; this.value = ''; },
      setCustomValidity(value) { this.validity = value; }, reportValidity() { return !this.validity; } });
  }
  const ctx = vm.createContext({
    document: { getElementById: id => fields.get(id) },
    pricingReceiptView: { dataset: {}, querySelector: () => null,
      querySelectorAll: () => [...fields.values()].filter(input => input.dataset.receiptAuto !== undefined) },
    Option: function (text, value) { this.text = text; this.value = value; },
    records: [], customerHistoryContactEntries: () => [], renderPricingReceipt() {}, formatDate: value => value,
    titleCaseName: value => value, normalizeSerialNumber: value => String(value || '').trim().toUpperCase(),
    normalize: value => String(value || '').toLowerCase(),
    customerNameLookupKey: value => String(value || '').toLowerCase(),
    isoDateForSave: value => /^2026-\d{2}-\d{2}$/.test(value) ? value : '',
    isFullPersonName: value => value.trim().split(/\s+/).length > 1
  });
  for (const name of ['pricingOfferAccessoryKind', 'receiptSnapshot', 'validatePricingReceipt', 'receiptDeviceForSerial', 'receiptCustomerPurchases',
    'receiptAutofillField', 'applyReceiptPurchase', 'completeReceiptCustomer', 'completeReceiptSerial', 'transferReceiptSides']) vm.runInContext(extract(name), ctx);
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

test('customer completion fills a unique purchase and address without assuming consents or refund', () => {
  const t = setup();
  t.ctx.records = [
    { id: 'a', serialNumber: 'AAA', deviceName: 'Model A', customerName: 'Jan Testowy', salesInvoice: 'FS 1', pickupDate: '2026-10-21' },
    { id: 'b', serialNumber: 'BBB', deviceName: 'Model B', customerName: 'Jan Testowy', salesInvoice: 'FS 1', pickupDate: '2026-10-21' },
    { id: 'charger', serialNumber: 'CH001', deviceName: 'Charger', customerName: 'Jan Testowy', salesInvoice: 'FS 1', pickupDate: '2026-10-21' }
  ];
  t.ctx.customerHistoryContactEntries = () => [{ address: 'ul. Testowa 1' }];
  t.set('receiptCustomerInput', 'Jan Testowy');
  t.ctx.completeReceiptCustomer();
  assert.equal(t.fields.get('receiptModelP').value, 'Model A');
  assert.equal(t.fields.get('receiptSerialL').value, 'BBB');
  assert.equal(t.fields.get('receiptAddressInput').value, 'ul. Testowa 1');
  assert.equal(t.fields.get('receiptNfzInput').value, '');
  assert.equal(t.fields.get('receiptWarranty').checked, false);
  t.set('receiptAddressInput', 'Adres poprawiony ręcznie');
  t.ctx.completeReceiptCustomer();
  assert.equal(t.fields.get('receiptAddressInput').value, 'Adres poprawiony ręcznie');
  t.ctx.records.push({ id: 'c', serialNumber: 'CCC', deviceName: 'Inny model', customerName: 'Jan Testowy', salesInvoice: 'FS 2' });
  t.fields.get('receiptPurchaseChoice').value = '';
  t.ctx.completeReceiptCustomer();
  assert.equal(t.fields.get('receiptPurchaseField').hidden, false);
  assert.match(t.fields.get('receiptStatus').textContent, /kilka zakupów/);
  t.ctx.completeReceiptCustomer({ selectedIndex: 1 });
  assert.equal(t.fields.get('receiptSerialP').value, 'CCC');
  assert.equal(t.fields.get('receiptSerialL').value, '', 'switching to a single device clears an old automatic second device');
});

test('pasted serial fills the customer, model and paired device, preserving the chosen side', () => {
  const t = setup();
  t.ctx.records = [
    { id: 'a', serialNumber: 'AAA', deviceName: 'Model A', customerName: 'Jan Testowy', salesInvoice: 'FS 1' },
    { id: 'b', serialNumber: 'BBB', deviceName: 'Model B', customerName: 'Jan Testowy', salesInvoice: 'FS 1' }
  ];
  t.set('receiptSerialL', 'aaa');
  t.ctx.completeReceiptSerial('L');
  assert.equal(t.fields.get('receiptCustomerInput').value, 'Jan Testowy');
  assert.equal(t.fields.get('receiptModelL').value, 'Model A');
  assert.equal(t.fields.get('receiptSerialP').value, 'BBB');
  t.set('receiptCustomerInput', 'Inna Osoba');
  t.ctx.completeReceiptSerial('L');
  assert.equal(t.fields.get('receiptCustomerInput').value, 'Inna Osoba');
  assert.match(t.fields.get('receiptStatus').textContent, /innej osoby/);
});

test('ambiguous historical addresses stay blank and different purchases are not silently combined', () => {
  const t = setup();
  t.ctx.customerHistoryContactEntries = () => [{ address: 'Adres A' }, { address: 'Adres B' }];
  t.ctx.records = [
    { id: 'a', serialNumber: 'AAA', deviceName: 'Model A', customerName: 'Jan Testowy', salesInvoice: 'FS 1' },
    { id: 'b', serialNumber: 'BBB', deviceName: 'Model B', customerName: 'Jan Testowy', salesInvoice: 'FS 2' }
  ];
  t.set('receiptCustomerInput', 'Jan Testowy');
  t.ctx.completeReceiptCustomer();
  assert.equal(t.fields.get('receiptModelP').value, '');
  assert.equal(t.fields.get('receiptAddressInput').value, '');
  assert.match(t.fields.get('receiptStatus').textContent, /różne adresy/);
});

test('receipt has two explicit pages, matching side colors and screen-only copy controls', () => {
  const receipt = html.slice(html.indexOf('id="pricingReceiptPrint"'), html.indexOf('</article>', html.indexOf('id="pricingReceiptPrint"')));
  assert.equal((receipt.match(/class="receipt-page"/g) || []).length, 2);
  assert.match(receipt, /1 \/ 2/);
  assert.match(receipt, /2 \/ 2/);
  const css = fs.readFileSync('styles.css', 'utf8');
  assert.match(css, /\.receipt-side-P \{ color: #b82f43/);
  assert.match(css, /\.receipt-side-L \{ color: #2567a8/);
  assert.match(css, /\.receipt-page \+ \.receipt-page \{[^}]*break-before: page/);
  assert.match(css, /\.receipt-copy-serial \{ display: none/);
  assert.match(extract('renderPricingReceipt'), /copySerialNumber\(item.serial/);
});

test('receipt serial paste lives inside the input wrapper; copy and paste appear on hover or keyboard focus', () => {
  for (const side of ['P', 'L']) {
    assert.match(html, new RegExp(`<span class="receipt-serial-control"><input id="receiptSerial${side}"[^>]*>[\\s\\S]*?data-paste-target="receiptSerial${side}" data-paste-format="serial" data-receipt-paste="${side}"[^>]*>Wklej</button></span>`));
  }
  const css = fs.readFileSync('styles.css', 'utf8');
  assert.match(css, /\.receipt-serial-control button \{[^}]*position: absolute; right: 6px;[^}]*opacity: 0; pointer-events: none/);
  assert.match(css, /\.receipt-serial-control:focus-within button \{ opacity: 1; pointer-events: auto/);
  assert.match(css, /#receiptModelP, #receiptSerialP\):focus \{[^}]*border-color: #b82f43/);
  assert.match(css, /#receiptModelL, #receiptSerialL\):focus \{[^}]*border-color: #2567a8/);
  assert.match(extract('renderPricingReceipt'), /button.hidden = button.disabled/);
  assert.match(extract('renderPricingReceipt'), /data-receipt-paste/);
});

test('receipt side transfer moves a single device and swaps both model/serial pairs with autofill metadata', () => {
  const t = setup();
  t.set('receiptModelP', 'Model P'); t.set('receiptSerialP', 'P123');
  t.fields.get('receiptSerialP').dataset.receiptAuto = 'P123';
  t.ctx.transferReceiptSides();
  assert.equal(t.fields.get('receiptModelP').value, '');
  assert.equal(t.fields.get('receiptSerialP').value, '');
  assert.equal(t.fields.get('receiptModelL').value, 'Model P');
  assert.equal(t.fields.get('receiptSerialL').value, 'P123');
  assert.equal(t.fields.get('receiptSerialL').dataset.receiptAuto, 'P123');
  t.ctx.transferReceiptSides();
  assert.equal(t.fields.get('receiptSerialP').value, 'P123');
  t.set('receiptModelL', 'Model L'); t.set('receiptSerialL', 'L456');
  t.ctx.transferReceiptSides();
  assert.equal(t.fields.get('receiptModelP').value, 'Model L');
  assert.equal(t.fields.get('receiptSerialP').value, 'L456');
  assert.equal(t.fields.get('receiptModelL').value, 'Model P');
  assert.equal(t.fields.get('receiptSerialL').value, 'P123');
  assert.equal(t.ctx.pricingReceiptView.dataset.receiptManualSides, '1');
  assert.match(html, /id="receiptTransferSidesBtn"[^>]*type="button"/);
});

test('customer completion does not undo a deliberate side swap', () => {
  const t = setup();
  t.ctx.records = [
    { id: 'a', serialNumber: 'AAA', deviceName: 'Model A', customerName: 'Jan Testowy', salesInvoice: 'FS 1' },
    { id: 'b', serialNumber: 'BBB', deviceName: 'Model B', customerName: 'Jan Testowy', salesInvoice: 'FS 1' }
  ];
  t.set('receiptCustomerInput', 'Jan Testowy');
  t.ctx.completeReceiptCustomer();
  t.ctx.transferReceiptSides();
  t.ctx.completeReceiptCustomer();
  assert.equal(t.fields.get('receiptSerialP').value, 'BBB');
  assert.equal(t.fields.get('receiptSerialL').value, 'AAA');
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
