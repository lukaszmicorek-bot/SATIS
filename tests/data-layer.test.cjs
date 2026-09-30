const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createStore, applyChanges } = require('../data-layer.js');

// Offline transactional RPC double: validate the entire bundle before publishing it.
function server() {
  const records = new Map(), operations = new Map(), calls = [];
  const key = (table, id) => JSON.stringify([table, id]);
  let failure = null, loseResponse = false, serial = 0;
  const client = { async rpc(name, args) {
    assert.equal(name, 'satis_write_records');
    calls.push(structuredClone(args));
    if (operations.has(args.p_operation)) return { data: operations.get(args.p_operation) };
    if (failure) return { error: failure };
    for (const change of args.p_changes) {
      const current = records.get(key(change.table, change.id));
      if ((current?.revision ?? null) !== change.expectedRevision) {
        return { error: { code: 'PT409', message: 'revision conflict' } };
      }
    }
    const rows = args.p_changes.map(change => {
      const recordKey = key(change.table, change.id);
      const revision = (records.get(recordKey)?.revision || 0) + 1;
      if (change.delete) records.delete(recordKey);
      else records.set(recordKey, { id: change.id, data: structuredClone(change.data), revision });
      return { table: change.table, id: change.id, revision, deleted: change.delete };
    });
    operations.set(args.p_operation, rows);
    if (loseResponse) { loseResponse = false; throw Error('response lost'); }
    return { data: rows };
  } };
  return {
    calls, operations, client,
    store: options => createStore({ client, uuid: () => `op-${++serial}`, workstation: () => 'QA', ...options }),
    seed(table, id, data = {}, revision = 1) { records.set(key(table, id), { id, data, revision }); },
    get: (table, id) => records.get(key(table, id)),
    fail: error => { failure = error; },
    loseResponse: () => { loseResponse = true; }
  };
}

test('observations are monotonic, table scoped and reject invalid revisions', () => {
  const store = server().store();
  store.observe('devices', { id: 'a', revision: '4' });
  for (const revision of [3, 0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, undefined]) {
    store.observe('devices', { id: 'a', revision });
  }
  store.observe('payments', { record_id: 'a', revision: 2 });
  assert.equal(store.revision('devices', 'a'), 4);
  assert.equal(store.revision('payments', 'a'), 2);
  assert.equal(store.revision('unknown', 'a'), null);
});

for (const mutation of ['update', 'delete']) test(`two workstations: stale ${mutation} cannot overwrite a newer edit`, async () => {
  const remote = server(); remote.seed('devices', 'a', { value: 'original' });
  const first = remote.store(), second = remote.store();
  for (const store of [first, second]) {
    store.observe('devices', remote.get('devices', 'a'));
    store.beginEdit('devices', 'a');
  }
  await first.write('devices', { id: 'a', value: 'first workstation' });
  second.observe('devices', remote.get('devices', 'a'));
  assert.equal(second.revision('devices', 'a'), 2);
  assert.equal(second.prepare('devices', { id: 'a' }).expectedRevision, 1, 'refresh cannot rebase an open edit');
  await assert.rejects(mutation === 'delete' ? second.remove('devices', 'a')
    : second.write('devices', { id: 'a', value: 'stale' }), { code: 'PT409' });
  assert.equal(remote.get('devices', 'a').data.value, 'first workstation');
  assert.equal(second.prepare('devices', { id: 'a' }).expectedRevision, 1);
});

test('stale editor cannot recreate a remotely deleted record, even after refresh', async () => {
  const remote = server(); remote.seed('devices', 'a');
  const editor = remote.store(), deleter = remote.store();
  for (const store of [editor, deleter]) store.observe('devices', remote.get('devices', 'a'));
  editor.beginEdit('devices', 'a');
  await deleter.remove('devices', 'a');
  await assert.rejects(editor.write('devices', { id: 'a', value: 'stale' }), { code: 'PT409' });
  assert.equal(remote.get('devices', 'a'), undefined);
  assert.equal(deleter.revision('devices', 'a'), null);
});

test('new draft keeps insert-only expectation across a colliding observation', async () => {
  const remote = server(), store = remote.store();
  store.beginEdit('devices', 'new');
  remote.seed('devices', 'new', { value: 'someone else' });
  store.observe('devices', remote.get('devices', 'new'));
  await assert.rejects(store.write('devices', { id: 'new' }), { code: 'PT409' });
  assert.equal(remote.get('devices', 'new').data.value, 'someone else');
});

for (const code of ['PT409', '40001']) test(`database conflict ${code} keeps the edit available`, async () => {
  const remote = server();
  const store = remote.store();
  remote.fail({ code, message: 'revision conflict' });
  await assert.rejects(store.write('devices', { id: 'a' }), error =>
    error.code === code && error.message.includes('Ten rekord został zmieniony'));
});

test('explicit expectedRevision wins; successful save advances the pinned edit', async () => {
  const remote = server(); remote.seed('devices', 'a', {}, 5);
  const store = remote.store();
  store.observe('devices', { id: 'a', revision: 2 }); store.beginEdit('devices', 'a');
  const change = store.prepare('devices', { id: 'a', value: 'checked' }, { expectedRevision: 5 });
  await store.commit([change]);
  assert.equal(store.prepare('devices', { id: 'a' }).expectedRevision, 6);
  assert.equal(store.prepare('devices', { id: 'a' }, { expectedRevision: null }).expectedRevision, null);
  store.observe('devices', { id: 'a', revision: 7 });
  store.endEdit('devices', 'a');
  assert.equal(store.prepare('devices', { id: 'a' }).expectedRevision, 7);
});

test('lost response retry reuses the same operation and applies exactly once', async () => {
  const remote = server(), store = remote.store();
  const record = { id: 'new', value: 'saved' };
  remote.loseResponse();
  await assert.rejects(store.write('devices', record), /response lost/);
  assert.equal(store.revision('devices', 'new'), null);
  assert.equal(remote.get('devices', 'new').revision, 1);
  await store.write('devices', record);
  assert.equal(remote.calls[0].p_operation, remote.calls[1].p_operation);
  assert.deepEqual(remote.calls[0].p_changes, remote.calls[1].p_changes);
  assert.equal(remote.calls[0].p_workstation, 'QA');
  assert.equal(remote.operations.size, 1);
  assert.equal(store.revision('devices', 'new'), 1);
  await store.write('devices', { ...record, value: 'next edit' });
  assert.notEqual(remote.calls[2].p_operation, remote.calls[1].p_operation);
  assert.equal(remote.get('devices', 'new').revision, 2);
});

test('automatic transport retries also retain one operation ID', async () => {
  const remote = server(); remote.loseResponse();
  const store = remote.store({ retry: async action => {
    try { return await action(); } catch { return action(); }
  } });
  await store.write('devices', { id: 'a' });
  assert.equal(remote.calls.length, 2);
  assert.equal(remote.calls[0].p_operation, remote.calls[1].p_operation);
  assert.equal(remote.get('devices', 'a').revision, 1);
});

test('retry freezes nested payload and workstation while keeping the same operation', async () => {
  let workstation = 'original', release, attempts = 0;
  const calls = [];
  const record = { id: 'a', items: [{ value: 'original' }] };
  const store = createStore({ uuid: () => 'frozen-operation', workstation: () => workstation,
    retry: async action => { try { return await action(); } catch { return action(); } },
    client: { async rpc(name, args) {
      calls.push(structuredClone(args));
      if (++attempts === 1) {
        await new Promise(done => { release = done; });
        throw Error('response lost');
      }
      return { data: [{ table: 'devices', id: 'a', revision: 1 }] };
    } }
  });
  const writing = store.write('devices', record);
  record.items[0].value = 'edited during request';
  workstation = 'changed';
  release(); await writing;
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[0], calls[1]);
  assert.equal(calls[1].p_changes[0].data.items[0].value, 'original');
  assert.equal(calls[1].p_workstation, 'original');
});

test('definitive rejection discards retry operation and does not advance revision', async () => {
  const remote = server(), store = remote.store();
  remote.fail({ code: '42501', message: 'denied' });
  await assert.rejects(store.write('devices', { id: 'a' }), { code: '42501' });
  assert.equal(store.revision('devices', 'a'), null);
  remote.fail(null);
  await store.write('devices', { id: 'a' });
  assert.notEqual(remote.calls[0].p_operation, remote.calls[1].p_operation);
});

test('malformed acknowledgement cannot advance local revision', async () => {
  const store = createStore({ client: { rpc: async () => ({ data: null }) }, uuid: () => 'a' });
  await assert.rejects(store.write('devices', { id: 'a' }), /potwierdzenie/);
  assert.equal(store.revision('devices', 'a'), null);
  assert.deepEqual(await store.commit([]), []);
});

test('payment conflict rolls back the entire device/payment bundle and retains both edit revisions', async () => {
  const remote = server();
  remote.seed('devices', 'a', { value: 'original' });
  remote.seed('device_private_payments', 'a', { amount: '100' }, 2);
  const store = remote.store();
  store.observe('devices', remote.get('devices', 'a'));
  store.observe('device_private_payments', { record_id: 'a', revision: 1 });
  for (const table of ['devices', 'device_private_payments']) store.beginEdit(table, 'a');
  const changes = [store.prepare('devices', { id: 'a', value: 'changed' }),
    store.prepare('device_private_payments', { id: 'a', amount: '200', receivedDate: '2026-09-08', privateNote: 'must not be sent' })];
  assert.deepEqual(changes[1].data, { amount: '200', receivedDate: '2026-09-08' });
  await assert.rejects(store.commit(changes), { code: 'PT409' });
  assert.equal(remote.calls.length, 1);
  assert.equal(remote.get('devices', 'a').data.value, 'original');
  assert.equal(remote.get('device_private_payments', 'a').data.amount, '100');
  assert.equal(store.prepare('devices', { id: 'a' }).expectedRevision, 1);
  assert.equal(store.prepare('device_private_payments', { id: 'a' }).expectedRevision, 1);
});

function appFunction(name) {
  const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
  const start = source.search(new RegExp(`(?:async )?function ${name}\\(`));
  assert.ok(start >= 0, name);
  return source.slice(start, start + 1 + source.slice(start + 1).search(/\n(?:async )?function /));
}

test('app device/payment save sends one atomic RPC and never reports online on bundle failure', async () => {
  const remote = server(), statuses = [], store = remote.store();
  remote.fail({ code: '42501', message: 'payment denied' });
  const context = vm.createContext({ hasSupabaseConfig: true, satisDataStore: store,
    SUPABASE_DEVICE_TABLE: 'devices', SUPABASE_PRIVATE_PAYMENTS_TABLE: 'device_private_payments',
    normalizePrivatePaymentEntry: value => value,
    setConnectionStatus: status => statuses.push(status),
    persistDeviceRecord: () => assert.fail('must not save device separately'),
    persistPrivatePaymentUpdates: () => assert.fail('must not save payment separately')
  });
  for (const name of ['privatePaymentChanges', 'persistDeviceAndPayments']) vm.runInContext(appFunction(name), context);
  await assert.rejects(context.persistDeviceAndPayments({ id: 'a' },
    [{ recordId: 'a', entry: { amount: '200', receivedDate: '2026-09-08' } }]), { code: '42501' });
  assert.equal(remote.calls.length, 1);
  assert.deepEqual(remote.calls[0].p_changes.map(change => change.table), ['devices', 'device_private_payments']);
  assert.equal(remote.get('devices', 'a'), undefined);
  assert.equal(store.revision('devices', 'a'), null);
  assert.equal(statuses.includes('online'), false);
});

test('clear removes versions, pinned edits and pending retry identities', async () => {
  const remote = server(), store = remote.store();
  store.observe('devices', { id: 'a', revision: 5 }); store.beginEdit('devices', 'a');
  remote.fail(Error('offline'));
  await assert.rejects(store.write('devices', { id: 'a' }), /offline/);
  store.clear();
  assert.equal(store.revision('devices', 'a'), null);
  assert.equal(store.prepare('devices', { id: 'a' }).expectedRevision, null);
  remote.fail(null); await store.write('devices', { id: 'a' });
  assert.notEqual(remote.calls[0].p_operation, remote.calls[1].p_operation);
});

test('logout clear cannot be undone by a late write acknowledgement', async () => {
  let resolve;
  const store = createStore({ uuid: () => 'old-session', client: {
    rpc: () => new Promise(done => { resolve = done; })
  } });
  const writing = store.write('devices', { id: 'a' });
  const rejected = assert.rejects(writing, { code: 'SESSION_CHANGED' });
  store.clear();
  resolve({ data: [{ table: 'devices', id: 'a', revision: 1 }] });
  await rejected;
  assert.equal(store.revision('devices', 'a'), null, 'old session must not repopulate cleared state');
});

test('10k changed rows normalize only changes and retain 10k untouched object references', () => {
  const records = Array.from({ length: 20000 }, (_, i) => Object.freeze({ id: `row-${i}`, value: i }));
  const changes = Array.from({ length: 10000 }, (_, i) => ({ id: `row-${i}`, data: { value: -i, id: 'untrusted' } }));
  let normalized = 0;
  const result = applyChanges(records, changes, rows => { normalized += rows.length; return rows; });
  assert.equal(result.length, 20000);
  assert.equal(normalized, 10000);
  assert.equal(new Set(result.map(row => row.id)).size, 20000);
  for (let i = 0; i < 20000; i++) {
    assert.equal(result[i].id, `row-${i}`);
    assert.equal(records[i].value, i);
    if (i < 10000) { assert.notEqual(result[i], records[i]); assert.equal(result[i].value, -i); }
    else assert.equal(result[i], records[i]);
  }
});

test('incremental changes handle insert/update/delete, missing IDs and authoritative IDs without mutating input', () => {
  const original = [{ id: 'keep' }, { id: 'remove' }, { id: 'update', value: 1 }];
  const result = applyChanges(original, [
    { eventType: 'DELETE', old: { id: 'remove' } },
    { eventType: 'UPDATE', new: { id: 'update', data: { id: 'wrong', value: 2 } } },
    { id: 'new', data: { value: 3 } }, { data: { value: 'no id' } }, { id: 'absent', deleted: true }
  ]);
  assert.deepEqual(result, [{ id: 'keep' }, { id: 'update', value: 2 }, { id: 'new', value: 3 }]);
  assert.equal(result[0], original[0]);
  assert.equal(original.length, 3);
  assert.equal(original[2].value, 1);
});
