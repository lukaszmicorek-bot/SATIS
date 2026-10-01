const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createQueue } = require('../sync-layer.js');

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
