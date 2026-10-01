const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const js = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
function extract(name) {
  const start = js.indexOf(`function ${name}(`);
  const end = js.indexOf('\nfunction ', start + 1);
  return js.slice(start, end);
}
const c = vm.createContext({
  normalizeLoanHistoryText: value => String(value ?? '').trim(),
  loanContractDateParts: value => ({ year: Number(value.slice(0, 4)), month: Number(value.slice(5, 7)) }),
});
vm.runInContext(extract('loanContractNumberParts'), c);
vm.runInContext(extract('automaticDocumentNumber'), c);
test('new documents receive the generated number', () => {
  assert.equal(c.automaticDocumentNumber(null, '2026-09-03', () => '06/09/2026'), '06/09/2026');
});
test('editing a saved document keeps its number', () => {
  assert.equal(c.automaticDocumentNumber({ number: '02/09/2026' }, '2026-09-07', () => {
    throw Error('Must not allocate another number');
  }), '02/09/2026');
});
test('wrong month or year receives the next number for the document date', () => {
  for (const number of ['19/08/2026', '02/09/2025', 'invalid']) {
    assert.equal(c.automaticDocumentNumber({ number }, '2026-09-03', () => '06/09/2026'), '06/09/2026');
  }
});
test('all three document number fields are read-only', () => {
  for (const id of ['loanContractNumberInput', 'orderNumberInput', 'complaintNumberInput']) {
    assert.match(html, new RegExp(`<input[^>]*id="${id}"[^>]*\\breadonly\\b`));
  }
});
