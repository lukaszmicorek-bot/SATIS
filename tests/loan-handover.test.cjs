const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { test } = require('node:test');
const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
function extract(name) {
  let start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, name);
  if (source.slice(start - 6, start) === 'async ') start -= 6;
  const rest = source.slice(start);
  const next = rest.slice(1).search(/\n(?:async )?function /);
  return next < 0 ? rest : rest.slice(0, next + 1);
}
const ctx = vm.createContext({
  normalize: (value) => String(value || '').trim().toLowerCase(),
  customerNameLookupKey: (value) => String(value || '').trim().toLowerCase(),
  titleCaseName: (value) => value,
  todayInputValue: () => '2026-08-31',
  isoDateForSave: (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value : '',
  formatDate: (value) => value.split('-').reverse().join('.'),
  effectiveDemoLoanHistory: (record) => record.loanHistory || [],
  normalizeDemoPurpose: (value) => String(value || '').toUpperCase().includes('ZAST') ? 'APARAT ZASTĘPCZY' : 'DO TESTOWANIA',
  normalizeLoanDemoPurpose: (value) => String(value || '').trim()
});
for (const name of ['normalizeSerialNumber', 'serialDuplicateKey', 'hasLoanDeviceData',
  'pricingLoanHistoryDevices', 'completedDemoLoanEntry', 'completedDemoLoanMatches',
  'pricingLoanSemanticKey', 'loanHandoverDevices', 'pricingLoanHandoverIssues']) vm.runInContext(extract(name), ctx);
const loan = (patch = {}) => ({
  id: 'new', number: '12/08/2026', customer: 'Test B', date: '2026-08-31',
  periodFrom: '2026-08-31', periodTo: '2026-09-14', returnDate: '',
  rightDevice: { serial: 'AB123', model: 'Model A' }, leftDevice: {}, ...patch
});
const old = loan({ id: 'old', number: '2/08/2026', customer: 'Test A',
  periodFrom: '2026-08-01', periodTo: '2026-08-15' });
const check = (entry, history = [], demos = [], id = '') =>
  ctx.pricingLoanHandoverIssues(entry, history, demos, id);
assert.equal(check(loan()).length, 0);
assert.match(check(loan(), [old])[0], /2\/08\/2026.*Test A.*nie ma daty zwrotu/);
assert.equal(check(loan(), [{ ...old, returnDate: '2026-08-31' }]).length, 0);
assert.equal(check(loan(), [{ ...old, returnDate: '2026-08-20' }]).length, 0);
assert.equal(check(loan(), [loan()], [], 'new').length, 0);
assert.equal(check({ ...old, returnDate: '2026-08-25' }, [old, loan()], [], 'old').length, 0);
assert.match(check(loan({ returnDate: '2026-08-20' }))[0], /wcześniejsza/);
assert.match(check(loan({ returnDate: '2026-09-02' }))[0], /przyszłości/);
assert.match(check(loan({ leftDevice: { serial: '21ab-123' } }))[0], /obu stronach/);
const demo = { serialNumber: 'AB123', currentUser: 'Test A', loanDate: '2026-08-01' };
assert.match(check(loan(), [], [demo])[0], /Demo nadal wskazuje/);
assert.equal(check(loan(), [], [{ ...demo, currentUser: 'Test B', loanDate: '2026-08-31' }]).length, 0);
assert.match(check(loan(), [], [{ ...demo, currentUser: 'Test B' }])[0], /Demo nadal wskazuje/);
const returned = { serialNumber: 'AB123', currentUser: '', loanHistory: [
  { currentUser: 'Test A', loanDate: '2026-08-01', returnDate: '2026-08-25' }
] };
assert.match(check(old, [], [returned])[0], /25\.08\.2026/);
assert.equal(check(loan(), [], [returned]).length, 0);
const many = Array.from({ length: 350 }, (_, i) => loan({ id: String(i), rightDevice: { serial: `XX${i}` } }));
assert.match(check(loan(), [...many, old])[0], /2\/08\/2026/);
assert.equal(ctx.pricingLoanSemanticKey(loan()), ctx.pricingLoanSemanticKey(loan({
  rightDevice: {}, leftDevice: { serial: '21ab-123', model: 'Changed label' }
})));
assert.equal(check({ ...old, returnDate: '2026-08-25' }, [old, loan()], [demo], 'old').length, 0);
assert.equal(check(loan({ customer: 'Test A' }), [], [{ ...returned, loanHistory: [
  { currentUser: 'Test A', returnDate: '2026-08-25' }
] }]).length, 0);
ctx.documentLocationKey = () => '';
ctx.normalizeDemoRecordForUse = value => value;
ctx.normalizeDemoAttachments = value => value || [];
ctx.makeId = () => 'historical-return';
for (const name of ['normalizeDemoLoanHistory', 'completeDemoLoan', 'demoRecordFromPricingLoan']) {
  vm.runInContext(extract(name), ctx);
}
const nextLoanSameCustomer = { ...demo, loanDate: '2026-08-31' };
const archivedReturn = ctx.demoRecordFromPricingLoan(nextLoanSameCustomer, {
  entry: { ...old, returnDate: '2026-08-25' }
});
assert.equal(archivedReturn.reason, 'history-updated');
assert.equal(archivedReturn.record.currentUser, nextLoanSameCustomer.currentUser);
assert.equal(archivedReturn.record.loanDate, '2026-08-31');
assert.equal(archivedReturn.record.loanHistory.at(-1).returnDate, '2026-08-25');
assert.equal(ctx.demoRecordFromPricingLoan(nextLoanSameCustomer, { entry: old }).reason, 'conflict');
console.log('OK: 20 loan handover checks');

async function testSaveFailure(stage, history = []) {
  let writes = 0;
  let localSaves = 0;
  const messages = [];
  Object.assign(ctx, {
    validateDocumentPhoneForAction: () => true,
    pricingLoanSaveInProgress: false, savePricingLoanBtn: { disabled: false },
    documentDraftIdentities: new Map([['loan', { id: 'draft-id', saved: false }]]), documentDraftId: () => 'draft-id', refreshDocumentNextNumber: async () => {},
    beginDocumentSave: () => true, endDocumentSave() {},
    hasSupabaseConfig: true, currentSupabaseUser: { email: 'test@example.invalid' },
    SUPABASE_LOAN_CONTRACT_TABLE: 'loan_contracts', pricingLoanHistorySupabaseAvailable: null,
    activePricingLoanHistoryId: '', pricingLoanHistory: history, demoRecords: [],
    loanDateInput: { value: '2026-08-31' }, loanContractNumberInput: { value: '12/08/2026', dataset: {} },
    satisChangeQueue: { flush: async () => {} },
    satisDataStore: { observe() {} },
    loadChangedSupabaseRecords: async (table, ids) => {
      assert.equal(table, 'loan_contracts');
      assert.deepEqual(Array.from(ids), ['draft-id']);
      if (stage === 'history') throw Error('history unavailable');
      return history.filter(entry => ids.includes(entry.id)).map(entry => ({ id: entry.id, data: entry, revision: 1 }));
    },
    loadSupabaseTable: () => assert.fail('loan preflight must not fetch full history'),
    loadDemoRecords: () => assert.fail('loan preflight must not fetch the full Demo table'),
    ensureLoanContractNumber: () => {}, loanInputValue: (input) => input.value,
    loanContractNumberValidationMessage: () => '', updateLoanContractNumberValidity: () => {},
    normalizePricingLoanHistoryEntry: (entry) => entry,
    currentPricingLoanSnapshot: () => loan(), pricingLoanSnapshotKey: () => 'key',
    currentWorkstationName: () => 'Test',
    persistPricingLoanHistoryEntry: async () => { writes++; throw Error(stage === 'demo' ? 'demo unavailable' : 'write unavailable'); },
    saveLocalPricingLoanHistory: () => { localSaves++; }, alert: (message) => messages.push(message)
  });
  vm.runInContext(extract('saveCurrentPricingLoanToHistory'), ctx);
  assert.equal(await ctx.saveCurrentPricingLoanToHistory({ silent: true }), null);
  assert.equal(localSaves, 0);
  assert.equal(writes, ['write', 'demo'].includes(stage) ? 1 : 0);
  assert.equal(ctx.pricingLoanSaveInProgress, false);
  assert.equal(ctx.savePricingLoanBtn.disabled, false);
  assert.ok(messages.length);
  assert.match(messages.at(-1), stage === 'conflict' ? /nie ma daty zwrotu/ : new RegExp(`${stage === 'history' ? 'history' : stage === 'demo' ? 'demo' : 'write'} unavailable`));
}
(async () => {
  await testSaveFailure('history');
  await testSaveFailure('demo');
  await testSaveFailure('conflict', [...many, old]);
  await testSaveFailure('write');
  console.log('OK: 4 save-flow checks (no offline success, full cached history, targeted refresh, button recovery)');
})().catch((error) => { console.error(error); process.exitCode = 1; });

function baseLoanContext() {
  const c = vm.createContext({
    todayInputValue: () => '2026-11-23',
    isoDateForSave: value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value : '',
    normalizeLoanHistoryText: value => String(value || '').trim(),
    customerNameLookupKey: value => String(value || '').trim().toLowerCase(),
    titleCaseName: value => value, formatDate: value => value || '',
    records: [], demoRecords: [], pricingLoanHistory: [],
    completedDemoLoanEntry: () => null
  });
  for (const name of ['normalizeSerialNumber', 'serialDuplicateKey', 'pricingLoanHistoryDevices',
    'activePricingLoanEntries', 'activePricingLoansBySerial', 'pricingLoanDataIssues']) vm.runInContext(extract(name), c);
  return c;
}

test('a Base aid or charger is a valid loan source without copying it to Demo', () => {
  const c = baseLoanContext();
  const entry = { id: 'base-loan', number: '1/11/2026', date: '2026-11-20',
    customer: 'Klient Testowy', periodFrom: '2026-11-20', periodTo: '2026-12-04',
    rightDevice: { serial: 'BASE123' }, charger: 'Charger', chargerSerial: 'CHARGER123' };
  c.records = [{ id: 'base-aid', serialNumber: 'BASE123' }, { id: 'base-charger', serialNumber: 'CHARGER123' }];
  assert.equal(c.pricingLoanDataIssues(entry).length, 0);
  const indexes = { demoBySerial: new Map(), deviceBySerial: new Map(c.records.map(r => [r.serialNumber, r])) };
  assert.equal(c.pricingLoanDataIssues(entry, indexes).length, 0);
  c.records = [];indexes.deviceBySerial.clear();
  assert.equal(c.pricingLoanDataIssues(entry).length, 2, 'unknown serials still require correction');
  assert.match(c.pricingLoanDataIssues(entry)[0], /nie znaleziono w Bazie ani w Demo/);
});

test('Base loan index keeps overdue and conflicting loans, includes chargers and clears only actual returns', () => {
  const c = baseLoanContext();
  const active = { id: 'active', date: '2026-11-01', periodFrom: '2026-11-01', periodTo: '2026-11-15',
    customer: 'Klient Testowy', rightDevice: { serial: 'BASE123' }, leftDevice: { serial: 'BASE123' }, chargerSerial: 'CHARGER123' };
  c.pricingLoanHistory = [active, { ...active, id: 'future', periodFrom: '2026-11-24' },
    { ...active, id: 'returned', returnDate: '2026-11-23' }, { ...active, id: 'old', returnDate: '2026-11-05' }];
  let index = c.activePricingLoansBySerial();
  assert.equal(index.get('BASE123').length, 1, 'same contract is not counted twice');
  assert.equal(index.get('CHARGER123')[0].id, 'active');
  c.pricingLoanHistory.push({ ...active, id: 'conflict' });
  assert.equal(c.activePricingLoansBySerial().get('BASE123').length, 2);
  c.pricingLoanHistory = [{ ...active, returnDate: '2026-11-23' }];
  assert.equal(c.activePricingLoansBySerial().size, 0);
  c.pricingLoanHistory = [];
  assert.equal(c.activePricingLoansBySerial().size, 0, 'deleted loans leave no stale marker');
  assert.equal(active.returnDate, undefined, 'no status or record is rewritten');
});

test('Base rental badge opens the current contract, not a stale or ambiguous loan', () => {
  const c = baseLoanContext();
  c.document = { createElement: () => ({ dataset: {}, children: [], handlers: {},
    append(...nodes) { this.children.push(...nodes); },setAttribute() {},
    addEventListener(name, action) { this.handlers[name] = action; } }) };
  c.displayType = () => 'NA STANIE';c.createTypePill = type => ({ textContent: type });
  c.attachTableHoverTooltip = () => {};c.canViewDocumentHistory = () => true;
  c.restorePricingLoanFromHistory = entry => { c.opened = entry; };
  c.renderDeviceViews = () => { c.refreshed = true; };c.alert = text => { c.warning = text; };
  const entry = { id: 'rental', customer: 'Klient Testowy', number: '1/11/2026',
    date: '2026-11-20', periodFrom: '2026-11-20', periodTo: '2026-12-04', rightDevice: { serial: 'BASE123' } };
  c.pricingLoanHistory = [entry];
  vm.runInContext(extract('createLoanedDeviceTypeCell'), c);
  const cell = c.createLoanedDeviceTypeCell({ serialNumber: 'BASE123' }, [entry]);
  const badge = cell.children[1];
  assert.equal(cell.children[0].textContent, 'NA STANIE');
  assert.equal(badge.textContent, 'Wypożyczony');assert.match(badge.dataset.customerTooltip, /Klient Testowy/);
  badge.handlers.click();assert.equal(c.opened.id, 'rental');
  c.opened = null;c.pricingLoanHistory = [{ ...entry, returnDate: '2026-11-23' }];
  badge.handlers.click();assert.equal(c.opened, null);assert.equal(c.refreshed, true);
  c.pricingLoanHistory = [entry, { ...entry, id: 'duplicate' }];
  badge.handlers.click();assert.equal(c.opened, null);assert.match(c.warning, /kilku aktywnych/);
  assert.match(extract('renderDeviceViews'), /const loansBySerial = activePricingLoansBySerial\(\)/);
});
