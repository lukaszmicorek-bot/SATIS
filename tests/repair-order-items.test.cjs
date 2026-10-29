const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('app.js', 'utf8');
function extract(name) {
  const rest = source.slice(source.indexOf(`function ${name}(`));
  return rest.slice(0, rest.slice(1).search(/\n(?:async )?function /) + 1);
}
const item = (name, serial, quantity = '1') => ({ type: 'APARAT SŁUCHOWY', description: name, quantity, serialNumbers: serial ? [serial] : [] });
const sourceItems = [item('A', ''), item('B', ''), item('C', '')];
const ctx = vm.createContext({
  pricingOrderHistory: [{ id: 'order1', items: sourceItems }],
  repairSerialNumbers: record => record.sourceSerialNumbers || [],
  normalizeSerialNumber: value => String(value || '').trim().toUpperCase(),
  serialDuplicateKey: value => String(value || '').toUpperCase().replace(/[\s-]/g, ''),
  normalizeDeviceName: value => String(value || '').trim(),
  normalizeServiceCost: value => value ? Number(value) : '',
  isoDateForSave: value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value : ''
});
for (const name of ['repairOrderItemsForRecord', 'repairRequiredSerialViolation', 'repairRequiredModelViolation']) vm.runInContext(extract(name), ctx);
const saved = { sourceDocumentType: 'ORDER', orderItems: [item('A', 'S1'), item('B', 'S2'), item('C', 'S3')] };
assert.deepEqual(Array.from(ctx.repairOrderItemsForRecord(saved), row => row.serialNumbers[0]), ['S1', 'S2', 'S3'], 'saved fulfillment rows reused');
const legacy = ctx.repairOrderItemsForRecord({ sourceDocumentType: 'ORDER', sourceDocumentId: 'order1', sourceSerialNumbers: ['S1', 'S2', 'S3'] });
assert.equal(legacy.length, 3);
assert.deepEqual(Array.from(legacy, row => row.serialNumbers[0]), ['S1', 'S2', 'S3']);
assert.equal(ctx.repairOrderItemsForRecord({ sourceDocumentType: 'COMPLAINT' }).length, 0);
assert.equal(ctx.repairOrderItemsForRecord({ sourceDocumentType: 'ORDER', sourceDocumentId: 'unknown' }).length, 0, 'missing source keeps legacy editor');
assert.equal(ctx.repairRequiredSerialViolation({ orderItems: saved.orderItems, returnDate: '2026-10-14' }), null);
assert.equal(ctx.repairRequiredSerialViolation({ orderItems: [item('A', '')], returnDate: '2026-10-14' }).selector, '#repairOrderSerial0');
assert.equal(ctx.repairRequiredSerialViolation({ orderItems: [item('A', 'S1'), item('B', 's1')] }).selector, '#repairOrderSerial1');
assert.equal(ctx.repairRequiredSerialViolation({ orderItems: [{ ...item('A', 'S1'), serialNumbers: ['S1', 'S2'] }] }).selector, '#repairOrderSerial0');
assert.equal(ctx.repairRequiredSerialViolation({ orderItems: [{ type: 'ŚRODKI PIELĘGNACYJNE', quantity: '3', serialNumbers: [] }], returnDate: '2026-10-14' }), null);
assert.equal(ctx.repairRequiredModelViolation({ orderItems: [item('', 'S1')] }).selector, '#repairOrderModel0');
const rows = saved.orderItems.map(row => ({
  orderItem: row,
  querySelector: selector => ({ value: selector === '[data-order-model]' ? row.description : row.serialNumbers.join(', ') })
}));
ctx.document = { querySelector: () => ({ hidden: false, querySelectorAll: () => rows }) };
vm.runInContext(extract('readRepairOrderItems'), ctx);
assert.equal(ctx.readRepairOrderItems().length, 3);
assert.equal(ctx.readRepairOrderItems()[2].serialNumbers[0], 'S3');
assert.match(extract('repairFormRecord'), /data\.orderItems = orderItems/);
assert.match(extract('repairFormRecord'), /data\.sourceSerialNumbers = orderItems\.flatMap/);
console.log('OK: multi-item orders keep all fulfillment rows/serials, legacy rows restored, duplicate/count/model validation and care-products exemption.');
for (const name of ['repairOrderProgress', 'statusFromRepairDates', 'effectiveRepairStatus', 'isOrderRepairRecord', 'matchesRepairKind', 'repairOrderDatesViolation']) vm.runInContext(extract(name), ctx);
ctx.normalizeRepairCategory = value => value;
ctx.repairKindFilter = 'order';
assert.equal(ctx.matchesRepairKind({ sourceDocumentType: 'ORDER' }), true);
assert.equal(ctx.matchesRepairKind({ sourceDocumentType: 'COMPLAINT', category: 'WKŁADKA USZNA' }), false);
ctx.repairKindFilter = 'service';
assert.equal(ctx.matchesRepairKind({ sourceDocumentType: 'ORDER' }), false);
assert.equal(ctx.matchesRepairKind({ category: 'NAPRAWA GWARANCYJNA' }), true);
const partial = { sentDate: '2026-10-11', orderItems: [
  { ...item('A', 'S1'), returnDate: '2026-10-12', pickupDate: '2026-10-13' },
  { ...item('B', 'S2'), returnDate: '2026-10-14', pickupDate: '' },
  { ...item('C', ''), returnDate: '', pickupDate: '' }
] };
assert.equal(ctx.effectiveRepairStatus(partial), 'GOTOWE');
assert.equal(ctx.repairOrderProgress(partial.orderItems).picked, 1);
assert.equal(ctx.repairOrderProgress(partial.orderItems).ready, 1);
assert.equal(ctx.repairOrderProgress(partial.orderItems).pickupDate, '', 'partial pickup never closes order');
assert.equal(ctx.repairRequiredSerialViolation(partial), null, 'unreturned item can still lack serial');
const onlyPicked = { ...partial, orderItems: [partial.orderItems[0], partial.orderItems[2]] };
assert.equal(ctx.repairOrderProgress(onlyPicked.orderItems).returnDate, '', 'do not notify about already picked product');
assert.equal(ctx.effectiveRepairStatus(onlyPicked), 'W TRAKCIE');
const closed = { orderItems: partial.orderItems.map(row => ({ ...row, pickupDate: '2026-10-15' })) };
assert.equal(ctx.effectiveRepairStatus(JSON.parse(JSON.stringify(closed))), 'ODEBRANE');
assert.equal(ctx.repairOrderProgress(closed.orderItems).pickupDate, '2026-10-15');
assert.equal(ctx.effectiveRepairStatus({ orderItems: saved.orderItems, pickupDate: '2026-10-14' }), 'ODEBRANE', 'legacy closed order remains closed');
ctx.document = { querySelector: () => null };
assert.equal(ctx.repairOrderDatesViolation({ receivedDate: '2026-10-14', orderItems: [{ returnDate: '2026-10-13' }] }).selector, '#repairOrderReturn0');
assert.equal(ctx.repairOrderDatesViolation({ orderItems: [{ returnDate: '2026-10-14', pickupDate: '2026-10-13' }] }).selector, '#repairOrderPickup0');
console.log('OK: kind filters, partial fulfillment, final closure, old completed dates and per-item date chronology.');

const headerNodes = Object.fromEntries(['repairId', 'repairSerialNumber', 'repairSerialNumber2', 'repairStatus',
  'repairCustomerName', 'repairLocation', 'repairDialogCustomer', 'repairDialogLocation']
  .map(id => [`#${id}`, {value: '', textContent: '', hidden: false, dataset: {}}]));
headerNodes['#repairId'].value = 'order-header';
headerNodes['#repairCustomerName'].value = 'Test Klient';
headerNodes['#repairLocation'].value = 'P50';
headerNodes['#repairSerialNumber'].value = 'test123';
ctx.document = {querySelector: selector => headerNodes[selector]};
ctx.repairRecords = [{id: 'order-header', sourceDocumentType: 'ORDER', sourceDocumentNumber: '4/10/2026'}];
ctx.repairDocumentInfo = record => ({number: record.sourceDocumentNumber});
ctx.repairDialogProductTitle = () => 'Serwis · Aparat';
ctx.titleCaseName = value => value;
ctx.normalizeRepairLocation = value => value;
ctx.repairStatusDisplayLabel = value => value;
for (const name of ['repairDialogTitle', 'repairDialogSerial', 'repairDialogSerial2', 'repairDialogStatusBadge']) {
  ctx[name] = {textContent: '', hidden: false, dataset: {}};
}
vm.runInContext(extract('syncRepairDialogHeaderMeta'), ctx);
ctx.syncRepairDialogHeaderMeta();
assert.equal(ctx.repairDialogTitle.textContent, 'Zamówienie · 4/10/2026');
assert.equal(headerNodes['#repairDialogCustomer'].textContent, 'Test Klient');
assert.equal(headerNodes['#repairDialogLocation'].dataset.locationTone, 'P50');
assert.equal(ctx.repairDialogSerial.textContent, 'TEST123');
assert.equal(ctx.repairDialogSerial2.hidden, true);
ctx.repairRecords[0].sourceDocumentType = 'COMPLAINT';
ctx.syncRepairDialogHeaderMeta();
assert.equal(ctx.repairDialogTitle.textContent, 'Serwis · Aparat', 'complaint keeps service title');
console.log('OK: clean order header, client subtitle, location/status and separate serials.');

const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');
const repairNavigation = html.slice(html.indexOf('<div class="repair-navigation">'), html.indexOf('<section id="repairDatabaseView"'));
assert.ok(repairNavigation.indexOf('id="complaintTab"') < repairNavigation.indexOf('repair-header-filters'));
assert.match(repairNavigation, /<\/section>\s*<div class="repair-kind-tiles repair-header-filters" role="group"/,
  'filters are next to, not inside, the tablist');
for (const kind of ['all', 'service', 'order']) assert.ok(repairNavigation.includes(`data-repair-kind="${kind}"`));
assert.ok(repairNavigation.indexOf('repair-color-legend') < repairNavigation.indexOf('data-repair-kind="all"'),
  'color legend precedes the All filter in the navigation row');
assert.equal((html.match(/id="repairActiveOnlyFilter"/g) || []).length, 1, 'reuse the existing active-only switch');
assert.match(repairNavigation, /id="repairActiveOnlyFilter"[^>]* checked/);
assert.match(css, /#repairsNotebook:not\(:has\(> #repairDatabaseView:not\(\[hidden\]\)\)\) \.repair-header-filters \{ display: none; \}/,
  'list filters do not appear in order or complaint forms');
assert.match(css, /\.repair-navigation > \.repair-header-filters\s*\{[^}]*margin: 0 0 5px auto;/);
for (const kind of ['service', 'order']) {
  assert.match(css, new RegExp(`\\.repair-return-kind-${kind} \\{[^}]*var\\(--repair-${kind}-ink\\)`));
  assert.match(css, new RegExp(`\\[data-repair-kind="${kind}"\\]\\[aria-pressed="true"\\] \\{[^}]*var\\(--repair-${kind}-ink\\)`));
}
console.log('OK: compact right-aligned header filters, single active switch, view-specific visibility and shared kind colors.');
