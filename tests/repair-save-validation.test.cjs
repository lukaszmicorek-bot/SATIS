const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');
const source = fs.readFileSync('app.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
function extract(name) {
  const start = source.indexOf(`function ${name}(`);
  return source.slice(start, source.indexOf('\nfunction ', start + 1));
}
test('repair validation handles missing names, invalid date text and valid edits explicitly', () => {
  const date = { value: '14.10.2026' };
  const ctx = vm.createContext({
    document: { querySelector: () => date },
    REPAIR_DATE_ORDER: [{ field: 'receivedDate', selector: '#repairReceivedDate', label: 'Data przyjęcia' }],
    isoDateForSave: value => value === '14.10.2026' ? '2026-10-14' : '',
    repairRequiredDateViolation: () => null, repairDateOrderViolation: () => null,
    repairRequiredSerialViolation: () => null, repairRequiredModelViolation: () => null,
    repairOrderDatesViolation: () => null
  });
  vm.runInContext(extract('repairDateValidationViolation'), ctx);
  assert.equal(ctx.repairDateValidationViolation({ customerName: '' }).selector, '#repairCustomerName');
  assert.equal(ctx.repairDateValidationViolation({ customerName: 'Test' }), null);
  date.value = '31.02.2026';
  assert.equal(ctx.repairDateValidationViolation({ customerName: 'Test' }).selector, '#repairReceivedDate');
});
test('repair submit is not intercepted silently and saves have feedback and a deadline', () => {
  assert.match(html, /id="repairForm" method="dialog" novalidate/);
  assert.match(source, /saveRepairBtn.textContent = "Zapisywanie…"/);
  assert.match(source, /saveRepairBtn.textContent = originalSaveText/);
  assert.match(source, /upsertSupabaseRecord\(SUPABASE_REPAIR_TABLE, record, \{ requestTimeoutMs: 20000 \}\)/);
});

test('return date focuses serial field and requires a serial before enabling save', () => {
  let highlighted = false, focused = false;
  const primary = { value: '', classList: { toggle(name, value) { highlighted = value; } },
    scrollIntoView() {}, focus() { focused = true; } };
  const second = { value: '' }, date = { value: '2026-10-14' };
  const button = { disabled: false };
  const ctx = vm.createContext({
    document: { querySelector: selector => ({ '#repairSerialNumber': primary, '#repairSerialNumber2': second, '#repairReturnDate': date })[selector] },
    isoDateForSave: value => value, normalizeSerialNumber: value => String(value || '').trim(),
    saveRepairBtn: button, repairForm: { dataset: {} }, repairDialog: { open: true }, window: { setTimeout: action => action() }
  });
  vm.runInContext(extract('updateRepairReturnSerialPrompt'), ctx);
  ctx.updateRepairReturnSerialPrompt({ focus: true });
  assert.equal(focused, true); assert.equal(highlighted, true); assert.equal(button.disabled, true);
  primary.value = 'SERIAL'; ctx.updateRepairReturnSerialPrompt();
  assert.equal(highlighted, false); assert.equal(button.disabled, false);
  primary.value = ''; second.value = 'SECOND'; ctx.updateRepairReturnSerialPrompt();
  assert.equal(button.disabled, false, 'second serial also satisfies the requirement');
  second.value = ''; date.value = ''; ctx.updateRepairReturnSerialPrompt();
  assert.equal(button.disabled, false); assert.equal(highlighted, false);
  ctx.repairForm.dataset.saving = '1'; ctx.updateRepairReturnSerialPrompt();
  assert.equal(button.disabled, true, 'typing must not unlock an in-flight save');
});

test('sent repairs open at the highlighted return date, but new, returned and picked-up entries do not', () => {
  function field(value = '') {
    return { value, classes: new Set(), scrollIntoView() {}, focus() { this.focused = true; },
      classList: { add(name) { this.owner.classes.add(name); }, remove(name) { this.owner.classes.delete(name); } } };
  }
  const sent = field(), returned = field(), pickup = field();
  for (const input of [sent, returned, pickup]) input.classList.owner = input;
  const ctx = vm.createContext({
    document: { querySelector: selector => ({ '#repairSentDate': sent, '#repairReturnDate': returned, '#repairPickupDate': pickup })[selector] },
    repairForm: { querySelectorAll: () => [returned] }, repairDialog: { open: true }, isoDateForSave: value => value
  });
  vm.runInContext(extract('updateRepairReturnDatePrompt'), ctx);
  ctx.updateRepairReturnDatePrompt({ focus: true });
  assert.equal(returned.focused, undefined);
  sent.value = '2026-11-20';ctx.updateRepairReturnDatePrompt({ focus: true });
  assert.equal(returned.focused, true);assert.ok(returned.classes.has('repair-return-date-pending'));
  returned.focused = false;returned.value = '2026-11-23';ctx.updateRepairReturnDatePrompt({ focus: true });
  assert.equal(returned.focused, false);assert.equal(returned.classes.size, 0);
  returned.value = '';pickup.value = '2026-11-23';ctx.updateRepairReturnDatePrompt({ focus: true });
  assert.equal(returned.focused, false);assert.equal(returned.classes.size, 0);
  assert.match(extract('openRepairDialog'), /repairDialog\.showModal\(\);\s*updateRepairReturnDatePrompt\(\{ focus: Boolean\(record\) \}\)/);
});

test('multi-item orders focus only the first outstanding return and clear stale highlights', () => {
  const makeInput = value => ({ value, marked: false, scrollIntoView() {}, focus() { this.focused = true; },
    classList: { add() { this.input.marked = true; }, remove() { this.input.marked = false; } } });
  const dates = [makeInput('2026-11-22'), makeInput(''), makeInput('')];
  const pickups = [makeInput(''), makeInput(''), makeInput('2026-11-23')];
  dates.forEach(input => { input.classList.input = input;input.marked = true; });
  const rows = dates.map((input, index) => ({ querySelector: selector => selector === '[data-order-return]' ? input : pickups[index] }));
  const ctx = vm.createContext({
    document: { querySelector: selector => selector === '#repairSentDate' ? { value: '2026-11-20' } : { hidden: false, querySelectorAll: () => rows } },
    repairForm: { querySelectorAll: () => dates }, repairDialog: { open: true }, isoDateForSave: value => value
  });
  vm.runInContext(extract('updateRepairReturnDatePrompt'), ctx);
  ctx.updateRepairReturnDatePrompt({ focus: true });
  assert.deepEqual(dates.map(input => input.marked), [false, true, false]);
  assert.equal(dates[1].focused, true);assert.equal(dates[0].focused, undefined);
});
