const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');
const source = fs.readFileSync('app.js', 'utf8');
function extract(name) {
  const match = new RegExp(`^(?:async )?function ${name}\\(`, 'm').exec(source);
  assert.ok(match);
  return source.slice(match.index, source.indexOf('\n}', match.index) + 2);
}

test('schema checks overlap only after access has been authorized', async () => {
  let resolveCore, resolvePrivacy;
  const calls = [];
  const ctx = vm.createContext({
    hasSupabaseConfig: true, SUPABASE_APP_ACCESS_TABLE: 'access',
    supabaseClient: {
      from() { return { select() { return this; }, eq() { return this; },
        async maybeSingle() { calls.push('access'); return { data: { active: true } }; } }; },
      rpc(name) { calls.push(name); return new Promise(resolve => {
        if (name === 'satis_schema_version') resolveCore = resolve;
        else resolvePrivacy = resolve;
      }); }
    }
  });
  vm.runInContext(extract('verifySupabaseAppAccess'), ctx);
  const checking = ctx.verifySupabaseAppAccess({ id: 'user' });
  await new Promise(setImmediate);
  assert.deepEqual(calls, ['access', 'satis_schema_version', 'vacation_privacy_schema_version']);
  resolveCore({ data: 20260908 }); resolvePrivacy({ data: 20260908 });
  assert.equal(await checking, true);
  const rejected = ctx.verifySupabaseAppAccess({ id: 'user' });
  await new Promise(setImmediate);
  resolveCore({ data: 20260908 }); resolvePrivacy({ error: { message: 'unavailable' } });
  await assert.rejects(rejected, /aktualizacja uprawnień urlopowych/);
});

test('bootstrap defers repeated customer suggestion builds until the shared rebuild', () => {
  const refresh = extract('refreshRecordsFromSupabase');
  for (const name of ['LoanHistory', 'OfferHistory', 'OrderHistory', 'ComplaintHistory', 'PcprList']) {
    assert.ok(refresh.includes(`loadSupabasePricing${name}({ deferSuggestions: true })`));
    assert.match(extract(`loadSupabasePricing${name}`), /if \(!deferSuggestions\)/);
  }
  assert.match(refresh, /rebuildDerivedData\(\{ deferSuggestions: true \}\)/);
});
test('products appear before histories finish, without permitting saves', () => {
  let renders = 0;
  const ctx = vm.createContext({
    hasSupabaseConfig: true, supabaseInitialDataReady: false,
    currentSupabaseUser: { id: 'user' }, activeNotebook: 'devices', activeDeviceView: 'database',
    offlineForms: null, records: [], rebuildDeviceDerivedData() {}, updateStats() {},
    renderDeviceViews() { renders++; }, setConnectionStatus() {}, recordLoadTiming() {}, alert() {}
  });
  vm.runInContext(extract('publishEarlyDeviceRecords') + '\n' + extract('requireInitialDataReady'), ctx);
  const records = [{ id: 'one' }];
  assert.equal(ctx.publishEarlyDeviceRecords(records, 'user', 0), records);
  assert.equal(renders, 1);
  assert.equal(ctx.requireInitialDataReady(), false);
  ctx.supabaseInitialDataReady = true;
  assert.equal(ctx.requireInitialDataReady(), true);
  ctx.publishEarlyDeviceRecords([{ id: 'other' }], 'user', 0);
  assert.equal(ctx.records, records, 'refreshes must not replace products early');
});
test('a changed login never receives early products from an old request', () => {
  const ctx = vm.createContext({ supabaseInitialDataReady: false, currentSupabaseUser: { id: 'new' } });
  vm.runInContext(extract('publishEarlyDeviceRecords'), ctx);
  assert.deepEqual(ctx.publishEarlyDeviceRecords([], 'old', 0), []);
});
test('deferred suggestions are prepared once and can be flushed before editing', () => {
  let builds = 0, cancelled = 0;
  const ctx = vm.createContext({ deferredSuggestionsTimer: 123, window: { clearTimeout() { cancelled++; } },
    rebuildDemoFormSuggestions() { builds++; }, rebuildDeviceNameSuggestions() { builds++; },
    rebuildCustomerNameSuggestions() { builds++; }, rebuildQualityHintCandidates() { builds++; }
  });
  vm.runInContext(extract('flushDeferredSuggestions'), ctx);
  ctx.flushDeferredSuggestions(); ctx.flushDeferredSuggestions();
  assert.equal(builds, 4); assert.equal(cancelled, 1);
});
test('first render is limited, all years remain searchable and complete pagination is retained', () => {
  assert.match(source, /TABLE_RENDER_BATCH_SIZE = 100/);
  assert.match(extract('renderDeviceViews'), /visibleTableItems\(visibleRecords/);
  assert.match(extract('loadSupabaseTable'), /page.length === 0/);
  const refresh = extract('refreshRecordsFromSupabase');
  assert.ok(refresh.indexOf('const paymentLoad =') < refresh.indexOf('await Promise.all'));
  assert.ok(refresh.includes('.then(loaded => publishEarlyDeviceRecords'));
  assert.doesNotMatch(refresh, /JSON.stringify\(records\)/);
  assert.match(refresh, /paymentResult.error\) throw/);
});

test('complete bootstrap waits for histories and payments, but displays products first', async () => {
  let resolveDevices, resolveHistory, resolvePayments;
  const devices = new Promise(resolve => { resolveDevices = resolve; });
  const history = new Promise(resolve => { resolveHistory = resolve; });
  const payments = new Promise(resolve => { resolvePayments = resolve; });
  let early = 0, final = 0;
  const ctx = vm.createContext({
    hasSupabaseConfig: true, supabaseInitialDataReady: false, supabaseRefreshInProgress: false,
    currentSupabaseUser: { id: 'user' }, document: { hidden: false },
    recordDialog: {}, repairDialog: {}, demoDialog: {}, performance: { now: () => 1 },
    activeNotebook: 'devices', activeDeviceView: 'database',
    SUPABASE_DEVICE_TABLE: 'devices', SUPABASE_REPAIR_TABLE: 'repairs', DEMO_ID_PREFIX: 'demo-', DEMO_SEED_MARKER_ID: 'seed',
    normalizeDeviceRecordsForUse: items => items, normalizeRepairRecordsForUse: items => items,
    normalizeDemoRecordsForUse: items => items, recordLoadTiming() {}, setConnectionStatus() {},
    loadSupabaseTable: (table, normalize, options) => options?.excludeIdPrefix ? devices : Promise.resolve([]),
    loadPrivatePayments: () => payments, loadSupabasePricingRecords: () => history,
    loadSupabasePricingLoanHistory: async () => [], loadSupabasePricingOfferHistory: async () => [],
    loadSupabasePricingOrderHistory: async () => [], loadSupabasePricingComplaintHistory: async () => [],
    loadSupabasePricingPcprList: async () => [], loadSupabaseCapdHistory: async () => [], loadSharedRowOrders: async () => {},
    rebuildDeviceDerivedData() {}, updateStats() {}, renderDeviceViews() { early++; },
    rebuildDerivedData() {}, render() { final++; }, satisChangeQueue: { flush() {} }, repairReturns: null, console
  });
  vm.runInContext(extract('publishEarlyDeviceRecords') + '\n' + extract('refreshRecordsFromSupabase'), ctx);
  const done = ctx.refreshRecordsFromSupabase({ throwOnError: true });
  resolveDevices([{ id: 'one' }]);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(early, 1); assert.equal(final, 0); assert.equal(ctx.supabaseInitialDataReady, false);
  resolveHistory([]);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(final, 0);
  resolvePayments(); await done;
  assert.equal(final, 1); assert.equal(ctx.supabaseInitialDataReady, true);
});
