const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
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
