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
    repairRequiredSerialViolation: () => null, repairRequiredModelViolation: () => null
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
