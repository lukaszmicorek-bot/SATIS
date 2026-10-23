const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
const audit = require('../stock-audit.js');
const item = (id, serialNumber, location = 'P63', source = 'stock') => ({id, serialNumber, location, source, deviceName: `Model ${id}`});
const fresh = items => ({workflowVersion: 2, sessionId: 'session-1', phase: 'active', location: 'P63',
  items, checkedItems: [], missingItems: [], history: [], checkedBy: 'Test Osoba', checkedAt: '2026-10-23'});

test('three independent states, repeat check and undo never turn unchecked into missing', () => {
  let state = fresh([item('a', 'AA'), item('b', 'BB'), item('c', 'CC')]);
  assert.deepEqual(audit.stats(state), {total: 3, pending: 3, present: 0, missing: 0});
  state = audit.mark(state, 'a', 'present', '2026-10-23T08:00:00Z');
  state = audit.mark(state, 'a', 'present');
  state = audit.mark(state, 'b', 'missing');
  assert.deepEqual(audit.stats(state), {total: 3, pending: 1, present: 1, missing: 1});
  state = audit.mark(state, 'b', 'present');
  assert.equal(audit.itemStatus(state, 'b'), 'present');
  state = audit.mark(state, 'a', 'pending');
  assert.deepEqual(audit.stats(state), {total: 3, pending: 2, present: 1, missing: 0});
  assert.equal(state.observations.a.by, 'Test Osoba');
  assert.equal(audit.mark(state, 'unknown', 'present'), state);
  assert.equal(audit.itemStatus({items: [item('old', 'OLD')], checkedItems: []}, 'old'), 'missing', 'legacy reports retain their original meaning');
});

test('scan requires full exact serial, handles duplicate, other place, unknown and unavailable', () => {
  const items = [item('a', '21AB12'), item('d', 'DEMO1', 'P63', 'demo')];
  const state = fresh(items), other = item('other', 'P50SER', 'P50'), sold = item('sold', 'SOLD');
  const all = [...items, other, sold], available = [...items, other];
  assert.equal(audit.scanMatch(state, '21ab-12', all, available).kind, 'present');
  assert.equal(audit.scanMatch(state, 'AB12', all, available).kind, 'unknown', 'never drop a 21 prefix during inventory');
  assert.equal(audit.scanMatch(state, '21AB', all, available).kind, 'unknown');
  assert.equal(audit.scanMatch(state, 'P50SER', all, available).kind, 'other');
  assert.equal(audit.scanMatch(state, 'SOLD', all, available).kind, 'unavailable');
  assert.equal(audit.scanMatch(state, 'DEMO1', all, available).kind, 'present');
  const checked = audit.mark(state, 'a', 'present');
  assert.equal(audit.scanMatch(checked, '21AB12', all, available).kind, 'duplicate');
  assert.equal(audit.scanMatch(state, '21AB12', [...all, item('copy', '21AB12')], available).kind, 'ambiguous');
  assert.equal(audit.scanMatch(state, '21AB12', all, available.filter(row => row.id !== 'a')).kind, 'changed');
  assert.equal(audit.scanMatch(state, '21AB12', all, [{...items[0], location: 'T12'}]).kind, 'changed');
  assert.equal(audit.scanMatch(state, 'brak numeru', all, available).kind, 'unknown');
});

test('frozen snapshot reports removed, changed and new records without changing audit counts', () => {
  const state = fresh([item('a', 'AA'), item('b', 'BB')]);
  const delta = audit.changes(state, [{...item('b', 'BB'), location: 'T12'}, item('new', 'NEW'), item('outside', 'OUT', 'P50')]);
  assert.deepEqual(delta.map(row => row.id), ['a', 'b', 'new']);
  assert.equal(state.items.length, 2);
  assert.equal(audit.stats(state).pending, 2);
});

function node() {
  return {value: '', textContent: '', hidden: false, disabled: false, dataset: {}, children: [], events: {}, open: false,
    setAttribute(key, value) {this[key] = value;}, append(...rows) {this.children.push(...rows);},
    replaceChildren(...rows) {this.children = rows;}, addEventListener(name, fn) {this.events[name] = fn;},
    querySelector() {return this.button ||= node();}, querySelectorAll() {return this.choices || [];}, focus() {}, select() {}};
}
function fixture({saved, failHistory = false} = {}) {
  const nodes = new Map(), q = id => {if (!nodes.has(id)) nodes.set(id, node()); return nodes.get(id);};
  q('stockAuditPerson').value = 'Test Osoba'; q('stockAuditDate').value = '2026-10-23';
  q('stockAuditSource').value = 'all';
  q('stockAuditLocations').choices = ['T12', 'P50', 'P63', 'all'].map(location => ({...node(), dataset: {auditLocation: location}}));
  q('stockAuditFilters').choices = ['pending', 'present', 'missing', 'all'].map(filter => ({...node(), dataset: {auditFilter: filter}}));
  let state = {items: [], checkedItems: [], history: []}, stored = {owner: 'owner', stockAudit: saved};
  let owner = 'owner', controller, writes = [], closed = false, unload;
  const entries = [item('a', 'SER1'), item('b', 'SER2'), item('outside', 'OTHER', 'T12')];
  const alerts = [];
  const a = {document: {querySelector: selector => q(selector.slice(1)), createElement: node},
    read: () => state, update: value => {state = structuredClone(value);}, refresh: () => controller.render(),
    ready: () => Boolean(owner), user: () => owner, station: () => 'P63', snapshot: () => entries, allItems: () => entries,
    historyEntry: data => ({...data, id: 'generated', items: data.items.map(row => ({...row, present: data.checkedItems.includes(row.id)}))}),
    saveHistory: async (entry, snapshot) => { writes.push(structuredClone({entry, snapshot})); if (failHistory) throw new Error('Network unavailable'); },
    createVault: name => {
      assert.equal(name, `satis-stock-audit-v1-${owner}`);
      return {unlock: async () => structuredClone(stored), change: async fn => {if (closed) throw new Error('Locked'); stored = fn(structuredClone(stored));}, lock() {closed = true;}};
    }, person: value => value.trim(), date: value => value, today: () => '2026-10-23', setDate: (n, value) => {n.value = value;},
    id: () => 'new-session', confirm: () => true, alert: text => alerts.push(text), onBeforeUnload: fn => {unload = fn;}};
  controller = audit.create(a);
  return {controller, q, a, alerts, writes, state: () => state, stored: () => stored,
    logout: () => {owner = ''; controller.reset();}, unload: () => unload, setFailure: value => {failHistory = value;}};
}
const tick = () => new Promise(resolve => setImmediate(resolve));
const click = n => n.events.click();

test('start fixes scope, pending cannot finish, scan and manual status support pause and resume', async () => {
  const f = fixture(); f.controller.render(); await tick();
  click(f.q('startStockAuditBtn'));
  assert.equal(f.state().items.length, 2, 'only selected P63 items included');
  assert.equal(f.state().phase, 'active');
  await f.controller.finish(); assert.equal(f.writes.length, 0);
  assert.match(f.alerts[0], /Pozostało do sprawdzenia: 2/);
  f.q('stockAuditScan').value = 'ser1';
  f.q('stockAuditScanForm').events.submit({preventDefault() {}});
  assert.equal(audit.stats(f.state()).present, 1);
  assert.equal(f.q('stockAuditScan').value, '');
  f.q('stockAuditScan').value = 'SER1';
  f.q('stockAuditScanForm').events.submit({preventDefault() {}});
  assert.match(f.q('stockAuditScanResult').textContent, /Już sprawdzony/);
  f.controller.setStatus('b', 'missing');
  click(f.q('pauseStockAuditBtn')); await tick();
  assert.equal(f.stored().stockAudit.phase, 'paused');
  f.controller.setStatus('a', 'missing');
  assert.equal(audit.itemStatus(f.state(), 'a'), 'present', 'paused draft is read-only');
  click(f.q('pauseStockAuditBtn')); await tick();
  await f.controller.finish();
  assert.equal(f.writes.length, 1);
  assert.equal(f.writes[0].entry.id, 'new-session');
  assert.equal(f.state().phase, 'completed');
  assert.equal(f.stored().stockAudit.phase, 'completed');
  assert.equal(f.state().history.length, 1);
  f.controller.reset();
});

test('ambiguous network failure keeps identical commit payload and ID for retry after reload', async () => {
  const f = fixture({failHistory: true}); f.controller.render(); await tick(); click(f.q('startStockAuditBtn'));
  f.controller.setStatus('a', 'present'); f.controller.setStatus('b', 'missing');
  await f.controller.finish();
  assert.equal(f.state().phase, 'active');
  assert.equal(f.state().history.length, 0, 'unconfirmed server write does not appear as completed');
  const persisted = structuredClone(f.stored().stockAudit);
  assert.equal(persisted.pendingCommit.entry.id, 'new-session');
  f.controller.setStatus('b', 'present');
  assert.equal(audit.itemStatus(f.state(), 'b'), 'missing', 'do not alter a potentially committed payload');
  f.controller.reset();
  const resumed = fixture({saved: persisted}); resumed.controller.render(); await tick();
  assert.equal(resumed.state().phase, 'paused');
  click(resumed.q('pauseStockAuditBtn')); await tick();
  await resumed.controller.finish();
  assert.deepEqual(resumed.writes[0], f.writes[0], 'exact same write is replayed, no new ID or timestamp');
  resumed.controller.reset();
});

test('logout cancels draft work and leaves no serials in the working table', async () => {
  const f = fixture(); f.controller.render(); await tick(); click(f.q('startStockAuditBtn'));
  f.controller.setStatus('a', 'present');
  let blocked = false; f.unload()({preventDefault() {blocked = true;}});
  assert.equal(blocked, true, 'warn before closing while encrypted save is pending');
  f.logout(); await tick();
  assert.equal(f.q('stockAuditWorkspace').hidden, true);
  assert.equal(f.q('stockAuditScan').value, '');
});

test('ten thousand items keep counts correct and mutations scoped', () => {
  const items = Array.from({length: 10000}, (_, i) => item(String(i), `S${i}`));
  const state = audit.mark(fresh(items), '9999', 'present');
  assert.equal(audit.stats(state).pending, 9999);
  assert.equal(audit.scanMatch(state, 'S9999', items, items).kind, 'duplicate');
  assert.equal(items.length, 10000);
});

test('draft is encrypted and recoverable after a fresh vault instance, not stored as plain serials', async () => {
  const {create} = require('../offline-vault.js');
  const {webcrypto} = require('node:crypto');
  let stored;
  const disk = {get: async () => structuredClone(stored), put: async value => {stored = structuredClone(value);}};
  const first = create({disk, crypto: webcrypto});
  await first.unlock(null, {owner: 'owner'});
  await first.change(data => ({...data, stockAudit: fresh([item('a', 'PRIVATE-SERIAL-123')])}));
  assert.equal(stored.version, 2);
  assert.ok(stored.ciphertext.byteLength > 0);
  assert.equal(stored.key.extractable, false);
  assert.ok(!JSON.stringify(stored).includes('PRIVATE-SERIAL-123'));
  first.lock();
  const second = create({disk, crypto: webcrypto});
  const restored = await second.unlock(null, {owner: 'owner'});
  assert.equal(restored.stockAudit.items[0].serialNumber, 'PRIVATE-SERIAL-123');
  second.lock();
});

test('published shell includes module, encrypted namespace, inventory history and print changes', () => {
  for (const name of ['index.html', 'offline-sw.js', 'scripts/public_assets.py']) assert.ok(fs.readFileSync(name, 'utf8').includes('stock-audit.js'), name);
  const app = fs.readFileSync('app.js', 'utf8');
  assert.match(app, /\.in\("action", \["audit", "inventory"\]\)/, 'RPC records inventory, old audit entries remain visible');
  assert.match(app, /if \(latestSnapshot && !stockAuditWorkflow\?\.isDraft\(\)\)/);
  assert.match(app, /stockAuditReportChanges/);
  const source = fs.readFileSync('stock-audit.js', 'utf8');
  assert.doesNotMatch(source, /localStorage|sessionStorage|\.innerHTML/);
  assert.match(source, /items\.slice\(0, limit\)/);
});
