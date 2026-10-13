const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { test } = require('node:test');
const { createStore } = require('../data-layer.js');
const js = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
function extract(name) {
  const start = js.search(new RegExp(`(?:async )?function ${name}\\(`));
  assert.ok(start >= 0, name);
  return js.slice(start, start + 1 + js.slice(start + 1).search(/\n(?:async )?function /));
}
function setup(kind) {
  let ids = 0;
  const alerts = [], writes = [], remote = [], operations = [];
  const revisions = new Map();
  const snapshot = { customer: 'Osoba Testowa', date: '2026-09-03', offerDate: '2026-09-03', number: '1/09/2026',
    items: [{ model: 'X', productName: 'X', description: 'X', serial: 'TEST123', grossPrice: 2000 }], total: 2000 };
  const c = vm.createContext({
    documentSaveLocks: new Map(), documentDraftIdentities: new Map(), documentNextNumberHints: new Map(), agreementDraftStates: new Map(),
    pricingOfferHistory: [], pricingOrderHistory: [], pricingComplaintHistory: [], repairRecords: [],
    repairWriteCheckInProgress: false,
    SUPABASE_OFFER_HISTORY_TABLE: 'offer', SUPABASE_ORDER_HISTORY_TABLE: 'order', SUPABASE_COMPLAINT_HISTORY_TABLE: 'complaint', SUPABASE_REPAIR_TABLE: 'repair',
    SUPABASE_LOAN_CONTRACT_TABLE: 'loan',
    MAX_PRICING_OFFER_HISTORY: 300, MAX_PRICING_ORDER_HISTORY: 300, MAX_PRICING_COMPLAINT_HISTORY: 300,
    hasSupabaseConfig: true, currentSupabaseUser: { email: 'test@example.invalid' },
    pricingOrderHistorySupabaseAvailable: true, pricingComplaintHistorySupabaseAvailable: true,
    makeId: () => `draft-${++ids}`, normalize: v => String(v ?? '').toLowerCase().trim(),
    customerNameLookupKey: v => String(v ?? '').toLowerCase().trim(), normalizeLoanHistoryText: v => String(v ?? '').trim(),
    isoDateForSave: v => v || '', todayInputValue: () => '2026-09-03',
    loanContractDateParts: v => /^\d{4}-\d\d-\d\d$/.test(v || '') ? { year: Number(v.slice(0,4)), month: Number(v.slice(5,7)) } : null,
    pricingOfferHistoryPatientGroup: () => 'adult', normalizePricingComplaintItems: r => r.items || [], serialDuplicateKey: v => String(v || '').toUpperCase(),
    normalizePricingOfferHistoryEntry: r => ({...r}), normalizePricingOrderHistoryEntry: r => ({...r}), normalizePricingComplaintHistoryEntry: r => ({...r}),
    normalizeRepairRecordsForUse: r => r,
    currentPricingOfferSnapshot: () => ({...snapshot}), currentPricingOrderSnapshot: () => ({...snapshot}), currentPricingComplaintSnapshot: () => ({...snapshot}),
    requireDocumentCustomerName: () => true, pricingOrderItemsMissingRequiredSide: () => false,
    pricingOrderPaymentSummary: () => ({ invalid: false, tooHigh: false }),
    pricingOrderRepairRecord: r => r, repairDocumentDuplicate: () => null, currentWorkstationName: () => 'Test',
    repairDocumentInfo: r => ({ label: 'Serwis', number: r.sourceDocumentNumber }),
    repairSerialNumbers: r => [r.serialNumber, r.serialNumber2].filter(Boolean),
    repairDocumentSourceMatches: (r, type, id) => r.sourceDocumentType === type && r.sourceDocumentId === id,
    orderNumberInput: { dataset: {} }, orderDepositInput: { value: '' }, complaintNumberInput: { dataset: {} }, orderDateInput: { value: '2026-09-03' }, complaintDateInput: { value: '2026-09-03' },
    offerCustomerInput: {}, orderCustomerInput: {}, complaintCustomerInput: {},
    saveLocalPricingOfferHistory() {}, saveLocalPricingOrderHistory() {}, saveLocalPricingComplaintHistory() {},
    recordDocumentLocationUsage() {}, rebuildCustomerDocumentIndex() {}, rebuildCustomerNameSuggestions() {},
    renderPricingDocumentHistory() {}, renderDeviceViews() {}, markAgreementDraftSaved() {},
    alert: v => alerts.push(v), confirm: () => true, formatDate: v => v, isMissingSupabaseTableError: () => false, errorText: e => e.message,
    retrySupabaseWrite: fn => fn(), supabaseRecordRow: r => ({ id: r.id, data: r }),
    setConnectionStatus() {}, isTransientSupabaseError: () => false, supabaseWriteErrorMessage: e => e.message,
    supabaseInitialDataReady: true,
    satisChangeQueue: { flush: async () => {} },
    loadChangedSupabaseRecords: async (table, ids) => table === kind
      ? remote.filter(r => ids.includes(r.id)).map(r => ({ id: r.id, data: { ...r }, revision: revisions.get(r.id) })) : [],
    loadSupabaseTable: () => assert.fail('document save must not fetch the full table'),
    supabaseClient: {
      rpc: async (name, args) => {
        if (name !== 'satis_write_records') return { error: { code: 'PGRST202' } };
        assert.equal(args.p_changes.length, 1);
        const change = args.p_changes[0];
        assert.equal(change.table, kind);
        const row = { id: change.id, data: change.data };
        writes.push(row); operations.push(args.p_operation);
        if (c.fail) throw Error('Load failed');
        if (c.wait) await c.wait;
        const i = remote.findIndex(r => r.id === row.id);
        const actual = i < 0 ? null : revisions.get(row.id);
        if (actual !== change.expectedRevision) return { error: { code: '40001', message: 'stale revision' } };
        if(i < 0) remote.push(row.data); else remote[i] = row.data;
        revisions.set(row.id, (actual || 0) + 1);
        return { data: [{ table: kind, id: row.id, revision: revisions.get(row.id), deleted: false }], error: null };
      },
      from: () => { throw Error('Raw table writes are forbidden'); }
    }
  });
  c.satisDataStore = createStore({ client: c.supabaseClient, uuid: () => `operation-${++ids}` });
  for (const name of ['requireInitialDataReady', 'upsertSupabaseRecord', 'documentDraftId', 'bindDocumentDraft', 'beginDocumentSave', 'endDocumentSave', 'refreshDocumentHistoryForSave',
    'refreshDocumentNextNumber', 'documentNextSequence', 'validateDocumentNumberForSave', 'confirmNearbyDocumentSave', 'nearbyServiceEntries', 'nearbyEntryMatches', 'loanContractNumberParts', 'canonicalLoanContractNumber',
    'monthlyDocumentNumber', 'monthlyComplaintNumber', 'nextPricingOrderNumber', 'nextPricingComplaintNumber',
    'pricingOfferSnapshotKey', 'pricingOrderSemanticKey', 'pricingComplaintSemanticKey', 'pricingComplaintsShareIntake',
    'persistPricingOfferHistoryEntry', 'persistPricingOrderHistoryEntry', 'persistPricingComplaintHistoryEntry',
    'saveCurrentPricingOfferToHistory', 'saveCurrentPricingOrderToHistory', 'saveCurrentPricingComplaintToHistory']) vm.runInContext(extract(name), c);
  const title = kind[0].toUpperCase() + kind.slice(1);
  return { c, alerts, writes, remote, snapshot, operations, revisions, save: () => c[`saveCurrentPricing${title}ToHistory`]({ silent: true }), local: () => c[`pricing${title}History`] };
}
for (const kind of ['offer', 'order', 'complaint']) {
  test(`${kind}: overlapping clicks write once, later saves keep one ID`, async () => {
    const t = setup(kind); let release;
    t.c.wait = new Promise(resolve => { release = resolve; });
    const first = t.save();
    assert.equal(await t.save(), null);
    release();
    const saved = await first;
    assert.ok(saved);
    assert.equal(t.writes.length, 1);
    t.snapshot.phone = '500600700';
    assert.equal((await t.save()).id, saved.id);
    assert.equal(t.local().length, 1);
  });
  test(`${kind}: failed writes do not report success and retries retain their ID`, async () => {
    const t = setup(kind); t.c.fail = true;
    assert.equal(await t.save(), null);
    assert.equal(t.local().length, 0);
    assert.equal(t.c.documentSaveLocks.size, 0);
    t.c.fail = false;
    const saved = await t.save();
    assert.equal(saved.id, t.writes[0].id);
  });
  test(`${kind}: new draft cannot overwrite existing number or duplicate contents`, async () => {
    const t = setup(kind);
    const saved = await t.save();
    t.c.documentDraftIdentities.delete(kind);
    assert.equal(await t.save(), null);
    assert.equal(t.remote.length, 1);
    assert.equal(t.remote[0].id, saved.id);
  });
  test(`${kind}: remotely deleted active document cannot be recreated`, async () => {
    const t = setup(kind); await t.save(); t.remote.length = 0;
    assert.equal(await t.save(), null);
    assert.match(t.alerts.at(-1), /usunięty/);
    assert.equal(t.writes.length, 1);
  });
  test(`${kind}: an open saved form cannot overwrite a remote change discovered during save`, async () => {
    const t = setup(kind), saved = await t.save();
    assert.ok(saved);
    t.remote[0] = { ...t.remote[0], phone: 'remote-phone' };
    t.revisions.set(saved.id, t.revisions.get(saved.id) + 1);
    t.snapshot.phone = 'stale-form-phone';
    assert.equal(await t.save(), null);
    assert.equal(t.remote[0].phone, 'remote-phone');
    assert.match(t.alerts.at(-1), /zmienion/);
  });
}
test('Complaint rejects same serial on same day even with changed name or another number', async () => {
  const t = setup('complaint'); await t.save();
  t.c.documentDraftIdentities.delete('complaint');
  t.snapshot.number = '2/09/2026'; t.snapshot.customer = 'Inna Pisownia';
  assert.equal(await t.save(), null);
  assert.match(t.alerts.at(-1), /seryjny/);
});
test('Number checks canonicalize leading zeros, reject wrong periods and gaps, preserve existing numbers', () => {
  const { c } = setup('order');
  c.pricingOrderHistory = [{ id: 'old', number: '1/09/2026', date: '2026-09-03' }];
  assert.throws(() => c.validateDocumentNumberForSave('order', { number: '01/9/2026', date: '2026-09-03' }), /zajęty/);
  assert.throws(() => c.validateDocumentNumberForSave('order', { number: '8/09/2026', date: '2026-09-03' }), /Kolejny/);
  assert.throws(() => c.validateDocumentNumberForSave('order', { number: '2/10/2026', date: '2026-09-03' }), /odpowiadać/);
  c.validateDocumentNumberForSave('order', { number: '1/09/2026', date: '2026-09-03' }, c.pricingOrderHistory[0]);
  c.documentNextNumberHints.set('order', { period: '2026-09', sequence: 10 });
  assert.equal(c.nextPricingOrderNumber('2026-09-03'), '10/09/2026');
});

test('Nearby documents require confirmation without blocking legitimate later visits', async () => {
  const t = setup('complaint'); await t.save();
  t.c.documentDraftIdentities.delete('complaint');
  t.snapshot.date = '2026-09-05'; t.snapshot.number = '2/09/2026';
  let confirmations = 0;
  t.c.confirm = () => { confirmations++; return false; };
  assert.equal(await t.save(), null);
  assert.equal(confirmations, 1);
  t.c.confirm = () => true;
  assert.ok(await t.save());
  assert.equal(t.remote.length, 2);
});
