const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');

function functionSource(name) {
  const match = new RegExp(`^(?:async )?function ${name}\\(`, 'm').exec(source);
  assert.ok(match, `missing ${name}`);
  const end = source.indexOf('\n}', match.index);
  assert.ok(end > match.index, `missing end of ${name}`);
  return source.slice(match.index, end + 2);
}

const collections = [
  ['loan', 'PricingLoanHistory', 'pricingLoanHistory', 'normalizePricingLoanHistoryEntry', 'PRICING_LOAN_HISTORY_STORAGE_KEY', 'SUPABASE_LOAN_CONTRACT_TABLE', 'MAX_PRICING_LOAN_HISTORY', 'saveCurrentPricingLoanToHistory'],
  ['offer', 'PricingOfferHistory', 'pricingOfferHistory', 'normalizePricingOfferHistoryEntry', 'PRICING_OFFER_HISTORY_STORAGE_KEY', 'SUPABASE_OFFER_HISTORY_TABLE', 'MAX_PRICING_OFFER_HISTORY', 'saveCurrentPricingOfferToHistory'],
  ['order', 'PricingOrderHistory', 'pricingOrderHistory', 'normalizePricingOrderHistoryEntry', 'PRICING_ORDER_HISTORY_STORAGE_KEY', 'SUPABASE_ORDER_HISTORY_TABLE', 'MAX_PRICING_ORDER_HISTORY', 'saveCurrentPricingOrderToHistory'],
  ['complaint', 'PricingComplaintHistory', 'pricingComplaintHistory', 'normalizePricingComplaintHistoryEntry', 'PRICING_COMPLAINT_HISTORY_STORAGE_KEY', 'SUPABASE_COMPLAINT_HISTORY_TABLE', 'MAX_PRICING_COMPLAINT_HISTORY', 'saveCurrentPricingComplaintToHistory'],
  ['pcpr', 'PricingPcprList', 'pricingPcprList', 'normalizePricingPcprItem', 'PRICING_PCPR_LIST_STORAGE_KEY', 'SUPABASE_PCPR_LIST_TABLE', 'MAX_PRICING_PCPR_LIST', 'addPricingPcprItem'],
  ['capd', 'CapdHistory', 'capdHistory', 'normalizeCapdHistoryEntry', 'CAPD_HISTORY_STORAGE_KEY', 'SUPABASE_CAPD_HISTORY_TABLE', 'MAX_CAPD_HISTORY', 'saveCurrentCapdToHistory']
].map(([kind, suffix, state, entryNormalizer, storageKey, table, limit, saveCurrent]) => ({
  kind, suffix, state, entryNormalizer, storageKey, table, limit, saveCurrent
}));

function rows(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(2020, 0, index + 1)).toISOString();
    return {
      id: `entry-${index}`, customer: `Patient ${index}`, patient: `Patient ${index}`,
      createdAt: date, savedAt: date, date, offerDate: date, testDate: date,
      rightDevice: { serial: `SERIAL-${index}` }
    };
  });
}

function harness(config, cached = []) {
  const storage = new Map([[config.kind, JSON.stringify(cached)]]);
  const warnings = [];
  const writes = [];
  const reads = [];
  const context = vm.createContext({
    [config.state]: cached,
    [config.storageKey]: config.kind,
    [config.table]: config.kind,
    [config.limit]: ['pcpr', 'capd'].includes(config.kind) ? 1000 : 300,
    [config.state + 'SupabaseAvailable']: null,
    capdSavedPractitionerProfiles: [],
    CAPD_PROFILE_ID_PREFIX: 'apd-profile-',
    normalizeCapdSavedPractitionerProfiles: entries => entries.filter(entry => entry.id.startsWith('apd-profile-')),
    // Isolate collection behavior from form formatting and DOM dependencies.
    [config.entryNormalizer]: entry => entry && entry.id ? { ...entry } : null,
    customerRelationTimeValue: value => Date.parse(value) || 0,
    hasSupabaseConfig: true,
    currentSupabaseUser: { id: 'test-user' },
    serverRows: [],
    serverError: null,
    readSensitiveStorage: key => storage.get(key),
    writeSensitiveStorage: (key, value) => { writes.push(key); storage.set(key, value); },
    removeSensitiveStorage: key => storage.delete(key),
    console: { warn: (...args) => warnings.push(args.join(' ')) },
    isMissingSupabaseTableError: error => error.code === '42P01',
    rebuildCustomerDocumentIndex() {},
    rebuildCustomerNameSuggestions() {},
    renderPricingLoanHistory() {},
    renderPricingPcprList() {},
    renderCapdHistory() {},
    renderCapdPractitionerProfiles() {},
    loanContractNumberInput: null,
    orderNumberInput: null,
    complaintNumberInput: null
  });
  context.loadSupabaseTable = async (table, normalize) => {
    reads.push(table);
    if (context.serverError) throw context.serverError;
    return normalize(context.serverRows);
  };
  context.sensitiveStateGeneration = 0;
  for (const name of [`normalize${config.suffix}`, `load${config.suffix}`, `saveLocal${config.suffix}`, `loadSupabase${config.suffix}`]) {
    vm.runInContext(functionSource(name), context);
  }
  return { context, storage, warnings, writes, reads };
}

for (const config of collections) {
  for (const count of [301, 1001]) {
    test(`${config.kind}: normalize and local round trip preserve all ${count} rows and oldest links`, () => {
      const entries = rows(count);
      const { context, storage } = harness(config, [...entries, null, entries[0]]);
      const normalized = context[`normalize${config.suffix}`](context[config.state]);
      assert.equal(normalized.length, count);
      assert.equal(normalized[0].id, `entry-${count - 1}`);
      context[`saveLocal${config.suffix}`]();
      assert.equal(context[config.state].length, count);
      assert.equal(JSON.parse(storage.get(config.kind)).length, count);
      const reloaded = context[`load${config.suffix}`]();
      assert.equal(reloaded.length, count);
      assert.equal(reloaded.find(entry => entry.id === 'entry-0').rightDevice.serial, 'SERIAL-0');
    });
  }

  test(`${config.kind}: successful full load replaces stale cache without resurrecting server deletions`, async () => {
    const cached = [...rows(1001), { ...rows(1)[0], id: 'deleted-on-server' }];
    const { context, storage, reads } = harness(config, cached);
    context.serverRows = rows(1001);
    context.serverRows[0].customer = 'Updated on server';
    const loaded = await context[`loadSupabase${config.suffix}`]();
    assert.equal(loaded.length, 1001);
    assert.equal(loaded.some(entry => entry.id === 'deleted-on-server'), false);
    assert.equal(loaded.find(entry => entry.id === 'entry-0').customer, 'Updated on server');
    assert.equal(context[config.state + 'SupabaseAvailable'], true);
    assert.deepEqual(reads, [config.kind]);
    const reloaded = context[`load${config.suffix}`]();
    assert.equal(reloaded.length, 1001);
    assert.equal(reloaded.some(entry => entry.id === 'deleted-on-server'), false);
    assert.deepEqual(JSON.parse(storage.get(config.kind)), JSON.parse(JSON.stringify(loaded)));

    context.serverRows = [];
    const empty = await context[`loadSupabase${config.suffix}`]();
    assert.equal(empty.length, 0);
    assert.equal(context[config.state].length, 0);
    assert.equal(context[`load${config.suffix}`]().length, 0);
  });

  for (const code of ['NETWORK_ERROR', '42P01', '42501']) {
    test(`${config.kind}: ${code} returns failure without writing or claiming a local save`, async () => {
      const cached = rows(301);
      const { context, storage, warnings, writes } = harness(config, cached);
      const before = storage.get(config.kind);
      context.serverError = Object.assign(new Error('Server read failed'), { code });
      const result = await context[`loadSupabase${config.suffix}`]();
      assert.equal(result, null);
      assert.equal(context[config.state], cached);
      assert.equal(storage.get(config.kind), before);
      assert.equal(writes.length, 0);
      assert.equal(context[config.state + 'SupabaseAvailable'], code === '42P01' ? false : null);
      assert.equal(warnings.length, 1);
      assert.doesNotMatch(warnings[0], /lokalnie|zapisany|zapisana|zapisano/i);
    });
  }

  test(`${config.kind}: unavailable server is not represented as a successful cached load`, async () => {
    for (const [key, value] of [['hasSupabaseConfig', false], ['currentSupabaseUser', null], [config.state + 'SupabaseAvailable', false]]) {
      const { context, reads, writes } = harness(config, rows(301));
      context[key] = value;
      assert.equal(await context[`loadSupabase${config.suffix}`](), null);
      assert.equal(reads.length, 0);
      assert.equal(writes.length, 0);
    }
  });

  for (const change of ['logout', 'different-user']) {
    for (const outcome of ['success', 'failure']) {
      test(`${config.kind}: ignore an in-flight ${outcome} after ${change}`, async () => {
        const { context, storage, warnings, writes } = harness(config, rows(301));
        let resolveRead;
        let rejectRead;
        context.loadSupabaseTable = () => new Promise((resolve, reject) => {
          resolveRead = resolve;
          rejectRead = reject;
        });
        const effects = [];
        for (const name of ['rebuildCustomerDocumentIndex', 'rebuildCustomerNameSuggestions', 'renderPricingLoanHistory', 'renderPricingPcprList', 'renderCapdHistory']) {
          context[name] = () => effects.push(name);
        }
        const loading = context[`loadSupabase${config.suffix}`]();
        context.currentSupabaseUser = change === 'logout' ? null : { id: 'new-user' };
        const replacement = change === 'logout' ? [] : [{ ...rows(1)[0], id: 'new-user-entry' }];
        context[config.state] = replacement;
        storage.set(config.kind, JSON.stringify(replacement));
        const before = storage.get(config.kind);
        if (outcome === 'success') resolveRead(rows(301));
        else rejectRead(Object.assign(new Error('Old session table error'), { code: '42P01' }));
        assert.equal(await loading, null);
        assert.equal(context[config.state], replacement);
        assert.equal(storage.get(config.kind), before);
        assert.equal(context[config.state + 'SupabaseAvailable'], null);
        assert.equal(writes.length, 0);
        assert.equal(warnings.length, 0);
        assert.deepEqual(effects, []);
      });
    }
  }

  test(`${config.kind}: same-user refresh and id-less user doubles remain compatible, but logout is always rejected`, async () => {
    for (const user of [{ id: 'test-user' }, {}]) {
      for (const logout of [false, true]) {
        const { context, writes } = harness(config);
        context.currentSupabaseUser = user;
        let resolveRead;
        context.loadSupabaseTable = () => new Promise(resolve => { resolveRead = resolve; });
        const loading = context[`loadSupabase${config.suffix}`]();
        context.currentSupabaseUser = logout ? null : { ...user };
        resolveRead(rows(1));
        const result = await loading;
        if (logout) {
          assert.equal(result, null);
          assert.equal(writes.length, 0);
        } else {
          assert.equal(result.length, 1);
          assert.equal(writes.length, 1);
        }
      }
    }
  });

  test(`${config.kind}: saving a document does not impose a collection size limit`, () => {
    assert.doesNotMatch(functionSource(config.saveCurrent), /\.slice\(\s*0\s*,/);
  });

  test(`${config.kind}: restoring a valid history row captures its edit version before changing the draft`, () => {
    const name = {
      loan: 'restorePricingLoanFromHistory',
      offer: 'restorePricingOfferFromHistory',
      order: 'restorePricingOrderFromHistory',
      complaint: 'restorePricingComplaintFromHistory',
      pcpr: 'editPricingPcprItem',
      capd: 'restoreCapdHistoryEntry'
    }[config.kind];
    const cached = rows(1);
    const { context } = harness(config, cached);
    const calls = [];
    const editCaptured = new Error('Stop before touching the form');
    const draftSentinel = 'unchanged-draft';
    Object.assign(context, {
      captureEdit: (table, id) => { calls.push([table, id]); throw editCaptured; },
      pricingLoanSaveInProgress: false,
      documentSaveLocks: new Set(),
      activePricingLoanHistoryId: draftSentinel,
      activePricingPcprEditId: draftSentinel,
      activeCapdHistoryId: draftSentinel,
      bindDocumentDraft: () => assert.fail('Draft changed before capturing its version'),
      resetLoanAutofillState: () => assert.fail('Form changed before capturing its version'),
      setLoanReturnEditMode() {},
      hideLoanCustomerHistorySuggestions() {},
      clearPostalAutofill() {},
      loanAddressInput: null,
      pcprPostalCodeInput: null
    });
    vm.runInContext('const satisDataStore = { beginEdit: captureEdit };', context);
    assert.equal(vm.runInContext('globalThis.satisDataStore', context), undefined);
    vm.runInContext(functionSource(name), context);
    context[name](config.kind === 'pcpr' ? 'not-found' : null);
    assert.equal(calls.length, 0, 'invalid history must not start editing');
    assert.throws(() => context[name](config.kind === 'pcpr' ? cached[0].id : cached[0]), error => error === editCaptured);
    assert.deepEqual(calls, [[config.kind, cached[0].id]]);
    for (const key of ['activePricingLoanHistoryId', 'activePricingPcprEditId', 'activeCapdHistoryId']) {
      assert.equal(context[key], draftSentinel);
    }
    if (['loan', 'offer', 'order', 'complaint'].includes(config.kind)) {
      context.pricingLoanSaveInProgress = true;
      context.documentSaveLocks.add(config.kind);
      context[name](cached[0]);
      assert.equal(calls.length, 1, 'a save lock must prevent changing the edit version');
    }
  });
}
