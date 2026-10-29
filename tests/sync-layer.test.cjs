const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createQueue } = require('../sync-layer.js');

function syncFunction(name) {
  const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  const match = new RegExp(`^(?:async )?function ${name}\\(`, 'm').exec(source);
  assert.ok(match);
  return source.slice(match.index, source.indexOf('\n}', match.index) + 2);
}

test('document sync retries read-only RPCs once without retrying writes or permission failures', async () => {
  let calls = 0;
  const ctx = vm.createContext({AbortController, currentSupabaseUser: {id: 'owner'},
    window: {setTimeout() {return 1;}, clearTimeout() {}}, wait: async () => {},
    isTransientSupabaseError: error => error.message.includes('Load failed'),
    supabaseClient: {rpc() { calls++; return {abortSignal: async () => calls === 1
      ? {error: {message: 'TypeError: Load failed'}} : {data: []}};}}});
  vm.runInContext(syncFunction('readDocumentSyncRpc'), ctx);
  assert.equal((await ctx.readDocumentSyncRpc('satis_pending_document_sync')).length, 0);
  assert.equal(calls, 2);
  await assert.rejects(ctx.readDocumentSyncRpc('satis_complete_document_sync'), /Niedozwolona/);
  assert.equal(calls, 2, 'completion writes cannot enter the automatic read retry helper');
  ctx.supabaseClient.rpc = () => { calls++; return {abortSignal: async () => ({error: {message: 'permission denied'}})}; };
  await assert.rejects(ctx.readDocumentSyncRpc('satis_pending_document_sync'), error => error.message === 'permission denied');
  assert.equal(calls, 3);
});

test('temporary queue load failure remains recoverable and is cleared after the next successful read', async () => {
  let failing = true;
  const ctx = vm.createContext({hasSupabaseConfig: true, currentSupabaseUser: {id: 'owner'},
    supabaseInitialDataReady: true, document: {hidden: false}, documentSyncRunning: false,
    documentSyncFailures: [], documentSyncNetworkPending: false, supabaseRefreshInProgress: false,
    recordDialog: {}, repairDialog: {}, demoDialog: {}, satisDataStore: {undoState: () => ({})},
    readDocumentSyncRpc: async () => { if (failing) throw new Error('TypeError: Load failed'); return []; },
    isTransientSupabaseError: error => error.message.includes('Load failed'), renderDocumentSyncState() {}});
  vm.runInContext(syncFunction('processPendingDocumentSync'), ctx);
  await ctx.processPendingDocumentSync();
  assert.equal(ctx.documentSyncNetworkPending, true);
  assert.equal(ctx.documentSyncFailures.length, 0, 'network problems are not reported as document data conflicts');
  assert.equal(ctx.documentSyncRunning, false);
  failing = false;
  await ctx.processPendingDocumentSync();
  assert.equal(ctx.documentSyncNetworkPending, false);
  assert.equal(ctx.documentSyncRunning, false);
});

test('document sync stops after a network failure on one task and never marks it completed', async () => {
  let loads = 0;
  const ctx = vm.createContext({hasSupabaseConfig: true, currentSupabaseUser: {id: 'owner'},
    supabaseInitialDataReady: true, document: {hidden: false}, documentSyncRunning: false,
    documentSyncFailures: [], documentSyncNetworkPending: false, supabaseRefreshInProgress: false,
    recordDialog: {}, repairDialog: {}, demoDialog: {}, satisDataStore: {undoState: () => ({})},
    readDocumentSyncRpc: async () => [{id: 'one'}, {id: 'two'}],
    loadChangedSupabaseRecords: async () => { loads++; throw new Error('Load failed'); },
    isTransientSupabaseError: error => error.message.includes('Load failed'), renderDocumentSyncState() {}});
  vm.runInContext(syncFunction('processPendingDocumentSync'), ctx);
  await ctx.processPendingDocumentSync();
  assert.equal(loads, 1);
  assert.equal(ctx.documentSyncNetworkPending, true);
  assert.equal(ctx.documentSyncFailures.length, 0);
  ctx.supabaseInitialDataReady = false;
  await ctx.processPendingDocumentSync();
  assert.equal(loads, 1, 'unfinished initial loading cannot start document writes');
});

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function setup(options = {}) {
  let nextId = 0;
  const timers = new Map(), loads = [], applied = [], errors = [];
  const queue = createQueue({
    load: async (table, ids) => { loads.push([table, ids]); return ids.map(id => ({ id })); },
    apply: (table, ids, rows) => applied.push([table, ids, rows]),
    onError: error => errors.push(error),
    schedule: (callback, delay) => { const id = ++nextId; timers.set(id, { callback, delay }); return id; },
    cancel: id => timers.delete(id),
    ...options
  });
  return { queue, timers, loads, applied, errors,
    run() {
      assert.equal(timers.size, 1, 'one timer, never one per event');
      const [id, timer] = timers.entries().next().value;
      timers.delete(id);
      return timer.callback();
    },
    delay() { assert.equal(timers.size, 1); return timers.values().next().value.delay; }
  };
}

test('independent table reads overlap while application order stays deterministic', async () => {
  const first = deferred(), second = deferred(), started = [];
  const t = setup({ load(table) {
    started.push(table);
    return table === 'devices' ? first.promise : second.promise;
  } });
  t.queue.push('devices', 'a');
  t.queue.push('repairs', 'b');
  const syncing = t.run();
  assert.deepEqual(started, ['devices', 'repairs']);
  second.resolve([{ id: 'b' }]);
  await Promise.resolve();
  assert.equal(t.applied.length, 0);
  first.resolve([{ id: 'a' }]);
  await syncing;
  assert.deepEqual(t.applied.map(([table]) => table), ['devices', 'repairs']);
});

test('10k queued events coalesce duplicate IDs per table under one timer', async () => {
  const t = setup();
  for (let i = 0; i < 10000; i++) t.queue.push('devices', `row-${i % 1000}`);
  t.queue.push('repairs', 'row-0');
  assert.equal(t.queue.pendingCount(), 1001);
  assert.equal(t.delay(), 220);
  await t.run();
  assert.equal(t.loads.length, 2);
  assert.equal(t.loads[0][1].length, 1000);
  assert.deepEqual(t.loads[1], ['repairs', ['row-0']]);
  assert.equal(t.applied.length, 2);
  assert.equal(t.queue.pendingCount(), 0);
  assert.equal(t.timers.size, 0);
});

test('not-ready queue keeps pending IDs and reschedules without loading or applying', async () => {
  let ready = false;
  const t = setup({ ready: () => ready });
  t.queue.push('devices', 'a');
  for (let i = 0; i < 3; i++) {
    await t.run();
    assert.equal(t.delay(), 1000);
    assert.equal(t.queue.pendingCount(), 1);
    assert.equal(t.loads.length, 0);
  }
  ready = true; await t.run();
  assert.equal(t.applied.length, 1);
  assert.equal(t.queue.pendingCount(), 0);
  assert.equal(t.timers.size, 0);
});

test('events arriving during a load survive the running guard and are rescheduled once', async () => {
  const loading = deferred(), calls = [];
  const t = setup({ load: async (table, ids) => {
    calls.push([table, ids]);
    return calls.length === 1 ? loading.promise : ids.map(id => ({ id }));
  } });
  t.queue.push('devices', 'a');
  const first = t.run();
  t.queue.push('devices', 'a'); t.queue.push('devices', 'b'); t.queue.push('devices', 'b');
  await t.run();
  assert.equal(calls.length, 1, 'loads must not overlap');
  assert.equal(t.queue.pendingCount(), 2);
  loading.resolve([{ id: 'a' }]); await first;
  assert.equal(t.delay(), 220);
  await t.run();
  assert.deepEqual(calls[1], ['devices', ['a', 'b']]);
  assert.equal(t.applied.length, 2);
  assert.equal(t.queue.pendingCount(), 0);
  assert.equal(t.timers.size, 0);
});

for (const stage of ['load', 'apply']) test(`${stage} failure retries only the failed table after backoff`, async () => {
  let fail = true;
  const calls = [], applications = [];
  const t = setup({
    load: async (table, ids) => {
      calls.push([table, ids]);
      if (stage === 'load' && table === 'devices' && fail) throw Error('offline');
      return ids.map(id => ({ id }));
    },
    apply: (table, ids) => {
      if (stage === 'apply' && table === 'devices' && fail) throw Error('offline');
      applications.push([table, ids]);
    }
  });
  t.queue.push('devices', 'a'); t.queue.push('repairs', 'b');
  await t.run();
  assert.deepEqual(applications, [['repairs', ['b']]]);
  assert.equal(t.errors.length, 1);
  assert.equal(t.queue.pendingCount(), 1);
  assert.equal(t.delay(), 3000);
  fail = false; await t.run();
  assert.deepEqual(calls.map(call => call[0]), ['devices', 'repairs', 'devices']);
  assert.deepEqual(applications[1], ['devices', ['a']]);
  assert.equal(t.queue.pendingCount(), 0);
  assert.equal(t.timers.size, 0);
});

test('clear cancels readiness and retry timers with no pending IDs', async () => {
  for (const options of [{ ready: () => false }, { load: async () => { throw Error('offline'); } }]) {
    const t = setup(options);
    t.queue.push('devices', 'private-row'); await t.run();
    const before = t.errors.length;
    t.queue.clear();
    await t.queue.flush();
    assert.equal(t.timers.size, 0);
    assert.equal(t.queue.pendingCount(), 0);
    assert.equal(t.applied.length, 0);
    assert.equal(t.errors.length, before);
  }
});

for (const outcome of ['resolve', 'reject']) test(`logout drops late load ${outcome} without applying, retrying or reporting old-user data`, async () => {
  const loading = deferred();
  const t = setup({ load: () => loading.promise });
  t.queue.push('device_private_payments', 'old-user');
  const running = t.run();
  t.queue.push('devices', 'also-old');
  t.queue.clear();
  if (outcome === 'resolve') loading.resolve([{ record_id: 'old-user', amount: '900' }]);
  else loading.reject(Error('old session failed'));
  await running;
  assert.equal(t.applied.length, 0);
  assert.equal(t.errors.length, 0);
  assert.equal(t.queue.pendingCount(), 0);
  assert.equal(t.timers.size, 0);
});

test('fresh session events survive completion of a cleared old-session load', async () => {
  const loading = deferred(); let calls = 0;
  const t = setup({ load: async (table, ids) => ++calls === 1 ? loading.promise : ids.map(id => ({ id })) });
  t.queue.push('devices', 'old'); const running = t.run();
  t.queue.clear();
  t.queue.push('devices', 'new');
  await t.run();
  loading.resolve([{ id: 'old' }]); await running;
  await t.run();
  assert.equal(t.applied.length, 1);
  assert.deepEqual(t.applied[0][1], ['new']);
  assert.equal(t.queue.pendingCount(), 0);
  assert.equal(t.timers.size, 0);
});

function appFunction(name) {
  const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
  const start = source.search(new RegExp(`(?:async )?function ${name}\\(`));
  assert.ok(start >= 0, name);
  return source.slice(start, start + 1 + source.slice(start + 1).search(/\n(?:async )?function /));
}

test('10k changed IDs load in bounded 200-ID requests with revisions, including payments', async () => {
  for (const payment of [false, true]) {
    const calls = [];
    const table = payment ? 'payments' : 'devices';
    const context = vm.createContext({ SUPABASE_VACATION_EMPLOYEE_TABLE: 'employees',
      SUPABASE_VACATION_REQUEST_TABLE: 'requests', SUPABASE_PRIVATE_PAYMENTS_TABLE: 'payments',
      supabaseClient: { from(name) {
        assert.equal(name, table);
        return {
          select(columns) {
            assert.equal(columns, payment ? 'record_id,amount,received_date,revision' : 'id,data,updated_at,revision');
            return this;
          },
          async in(column, ids) {
            assert.equal(column, payment ? 'record_id' : 'id');
            assert.ok(ids.length <= 200);
            calls.push(Array.from(ids));
            return { data: ids.map(id => ({ [column]: id, revision: 7 })) };
          }
        };
      } }
    });
    vm.runInContext(appFunction('loadChangedSupabaseRecords'), context);
    const ids = Array.from({ length: 10000 }, (_, i) => `row-${i}`);
    const rows = await context.loadChangedSupabaseRecords(table, ids);
    assert.equal(calls.length, 50);
    assert.deepEqual(calls.flat(), ids);
    assert.deepEqual(Array.from(rows, row => row[payment ? 'record_id' : 'id']), ids);
    assert.equal(rows.every(row => row.revision === 7), true);
  }
});

test('failed changed-record page never applies a partial collection and retains all IDs for retry', async () => {
  const context = vm.createContext({ SUPABASE_VACATION_EMPLOYEE_TABLE: 'employees',
    SUPABASE_VACATION_REQUEST_TABLE: 'requests', SUPABASE_PRIVATE_PAYMENTS_TABLE: 'payments',
    supabaseClient: { from: () => ({ select() { return this; }, async in(column, ids) {
      return ids[0] === 'row-0' ? { data: ids.map(id => ({ id })) } : { error: Error('page two failed') };
    } }) }
  });
  vm.runInContext(appFunction('loadChangedSupabaseRecords'), context);
  const t = setup({ load: context.loadChangedSupabaseRecords });
  for (let i = 0; i < 401; i++) t.queue.push('devices', `row-${i}`);
  await t.run();
  assert.equal(t.applied.length, 0);
  assert.equal(t.queue.pendingCount(), 401);
  assert.equal(t.delay(), 3000);
  assert.match(t.errors[0].message, /page two failed/);
  t.queue.clear();
  assert.equal(t.timers.size, 0);
});

test('app logout clears both shared stores before any old-session data can be rendered', () => {
  const body = appFunction('clearSensitiveApplicationState');
  assert.match(body, /satisDataStore\?\.clear\(\)/);
  assert.match(body, /satisChangeQueue\?\.clear\(\)/);
});

function demoDocumentSyncFixture(customer = 'Klient B', overrides = {}) {
  let nextId = 0;
  const writes = [];
  const record = {
    id: 'demo-test', serialNumber: 'TEST123', currentUser: customer, phone: '500600700',
    loanDate: '2026-10-27', returnDate: '', status: 'WYPOŻYCZONY', location: 'P63',
    purpose: 'DO TESTOWANIA', currentAttachments: [{ id: 'current', path: 'current.pdf' }],
    loanHistory: [{ id: 'older', currentUser: 'Klient C', loanDate: '2026-09-01', returnDate: '2026-09-14', attachments: [] }],
    ...overrides
  };
  const entry = {
    id: 'loan-test', number: '26/10/2026', customer: 'Klient A', phone: '500100200',
    date: '2026-10-20', periodFrom: '2026-10-20', returnDate: '2026-10-25',
    rightDevice: { serial: 'TEST123' }, leftDevice: {}, city: 'T12'
  };
  const ctx = vm.createContext({
    demoRecords: [record], pricingLoanHistory: [entry], hasSupabaseConfig: true,
    SUPABASE_DEVICE_TABLE: 'devices', DEMO_STORAGE_KEY: 'demo',
    normalizePricingLoanHistory: entries => entries,
    normalizeSerialNumber: value => String(value || '').toUpperCase(),
    serialDuplicateKey: value => String(value || '').toUpperCase(),
    customerNameLookupKey: value => String(value || '').trim().toLowerCase(),
    titleCaseName: value => String(value || '').trim(),
    isoDateForSave: value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value : '',
    todayInputValue: () => '2026-10-29', documentLocationKey: value => value,
    normalizeLoanDemoPurpose: value => value || '', normalizeDemoPurpose: value => value,
    normalizeDemoRecordForUse: value => value, normalizeDemoLoanHistory: value => value || [],
    effectiveDemoLoanHistory: record => record.loanHistory || [],
    normalizeDemoAttachments: value => value || [], makeId: () => `history-${++nextId}`,
    auditCompareValue: value => JSON.stringify(value), auditSnapshot: value => JSON.parse(JSON.stringify(value)),
    satisDataStore: {
      prepare: (table, record) => ({table, record}),
      commit: async changes => writes.push(...changes), observe() {}, undoState: () => ({})
    },
    writeSensitiveStorage() {}, rebuildAfterDemoChange() {}, renderDemoRecords() {}, updateStats() {}, logAuditEvent() {},
    formatDate: value => value ? value.split('-').reverse().join('.') : '-'
  });
  for (const name of ['pricingLoanHistoryDevices', 'latestPricingLoanBySerial', 'completedDemoLoanEntry',
    'completedDemoLoanMatches', 'normalizeDemoLoanHistory', 'completeDemoLoan', 'demoRecordFromPricingLoan', 'demoLoanSyncChanged', 'pricingLoanDemoConflictMessage',
    'syncPricingLoansToDemo']) vm.runInContext(appFunction(name), ctx);
  return { ctx, record, entry, writes };
}

for (const customer of ['Klient B', 'Klient A']) test(`returned contract backfills history without changing a later loan for ${customer}`, async () => {
  const {ctx, record, entry, writes} = demoDocumentSyncFixture(customer);
  const result = await ctx.syncPricingLoansToDemo({entries: [entry], renderChanges: false});
  assert.equal(result.conflicts.length, 0);
  assert.equal(result.updated, 1);
  const {loanHistory, loanHistoryManaged, ...current} = ctx.demoRecords[0];
  const {loanHistory: previousHistory, ...previous} = record;
  assert.deepEqual(JSON.parse(JSON.stringify(current)), previous, 'keep current borrower, dates, phone, location and attachments');
  assert.equal(loanHistoryManaged, true);
  assert.equal(loanHistory.length, 2);
  assert.deepEqual(JSON.parse(JSON.stringify(loanHistory.at(-1))), {
    id: 'history-1', currentUser: 'Klient A', phone: '500100200',
    loanDate: '2026-10-20', returnDate: '2026-10-25', attachments: []
  });
  assert.equal(writes.length, 1);
  const repeated = await ctx.syncPricingLoansToDemo({entries: [entry], renderChanges: false});
  assert.equal(repeated.updated, 0);
  assert.equal(repeated.conflicts.length, 0);
  assert.equal(writes.length, 1, 'queue retries do not duplicate the history or write again');
});

test('a historical return and the next handover may occur on the same day', async () => {
  const {ctx, entry} = demoDocumentSyncFixture('Klient B', {loanDate: '2026-10-25'});
  const result = await ctx.syncPricingLoansToDemo({entries: [entry]});
  assert.equal(result.conflicts.length, 0);
  assert.equal(ctx.demoRecords[0].currentUser, 'Klient B');
});

test('overlap, open contracts, missing dates and invalid return periods remain conflicts without writes', async () => {
  for (const [recordPatch, entryPatch] of [
    [{}, {returnDate: '2026-10-28'}], [{}, {returnDate: ''}],
    [{loanDate: ''}, {}], [{}, {returnDate: '2026-10-19'}], [{loanDate: '2026-11-02'}, {returnDate: '2026-10-30'}]
  ]) {
    const {ctx, record, entry, writes} = demoDocumentSyncFixture('Klient B', recordPatch);
    const before = JSON.stringify(record);
    const result = await ctx.syncPricingLoansToDemo({entries: [{...entry, ...entryPatch}]});
    assert.equal(result.conflicts.length, 1);
    assert.equal(result.updated, 0);
    assert.equal(writes.length, 0);
    assert.equal(JSON.stringify(ctx.demoRecords[0]), before);
  }
});

test('a return for the actual current loan still closes it normally', async () => {
  const {ctx, entry} = demoDocumentSyncFixture('Klient A', {loanDate: '2026-10-20'});
  const result = await ctx.syncPricingLoansToDemo({entries: [entry]});
  assert.equal(result.conflicts.length, 0);
  assert.equal(ctx.demoRecords[0].status, 'NA STANIE');
  assert.equal(ctx.demoRecords[0].currentUser, '');
  assert.equal(ctx.demoRecords[0].returnDate, '2026-10-25');
});

test('pending returned contract is completed only after its history has been saved', async () => {
  for (const fail of [false, true]) {
    const {ctx, entry, record, writes} = demoDocumentSyncFixture();
    let completed = 0;
    Object.assign(ctx, {
      currentSupabaseUser: {id: 'owner'}, supabaseInitialDataReady: true,
      document: {hidden: false}, documentSyncRunning: false, documentSyncFailures: [], documentSyncNetworkPending: false,
      supabaseRefreshInProgress: false, recordDialog: {}, repairDialog: {}, demoDialog: {},
      SUPABASE_LOAN_CONTRACT_TABLE: 'loans', SUPABASE_ORDER_HISTORY_TABLE: 'orders',
      pricingOrderHistory: [], pricingComplaintHistory: [],
      readDocumentSyncRpc: async name => name === 'satis_pending_document_sync'
        ? [{id: entry.id, table: 'loans', revision: 3}]
        : [{id: record.id, table: 'devices', data: record, revision: 5}],
      loadChangedSupabaseRecords: async () => [{id: entry.id, data: entry, revision: 3}],
      applyChangedSupabaseRecords() {}, normalizePricingLoanHistoryEntry: value => value,
      isTransientSupabaseError: () => false, renderDocumentSyncState() {},
      supabaseClient: {rpc: async name => {
        assert.equal(name, 'satis_complete_document_sync');
        assert.equal(writes.length, 1, 'persist Demo history before acknowledging the document');
        completed++; return {data: true};
      }}
    });
    if (fail) ctx.satisDataStore.commit = async () => { throw Error('Write rejected'); };
    vm.runInContext(appFunction('processPendingDocumentSync'), ctx);
    await ctx.processPendingDocumentSync();
    assert.equal(completed, fail ? 0 : 1);
    assert.equal(ctx.documentSyncFailures.length, fail ? 1 : 0);
    if (fail) assert.equal(ctx.demoRecords[0].loanHistory.length, record.loanHistory.length, 'failed write restores previous history');
  }
});

for (const part of ['leftDevice', 'charger']) test(`delayed return backfill also works for ${part}`, async () => {
  const {ctx, entry} = demoDocumentSyncFixture();
  entry.rightDevice = {};
  if (part === 'charger') entry.chargerSerial = 'TEST123';
  else entry.leftDevice = {serial: 'TEST123'};
  const result = await ctx.syncPricingLoansToDemo({entries: [entry]});
  assert.equal(result.conflicts.length, 0);
  assert.equal(result.updated, 1);
  assert.equal(ctx.demoRecords[0].currentUser, 'Klient B');
});

test('real conflict explains serial, both borrowers and loan dates, including the recorded return', async () => {
  const {ctx, entry} = demoDocumentSyncFixture();
  const result = await ctx.syncPricingLoansToDemo({entries: [{...entry, returnDate: '2026-10-28'}]});
  const message = ctx.pricingLoanDemoConflictMessage(result.conflicts[0]);
  for (const text of ['TEST123', 'Klient B', '27.10.2026', 'Klient A', '20.10.2026', '28.10.2026', 'historii umów']) {
    assert.ok(message.includes(text), message);
  }
  const open = await ctx.syncPricingLoansToDemo({entries: [{...entry, returnDate: ''}]});
  assert.match(ctx.pricingLoanDemoConflictMessage(open.conflicts[0]), /bez zapisanego zwrotu/);
});
