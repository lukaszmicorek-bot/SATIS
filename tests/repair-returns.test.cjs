const assert = require('node:assert/strict');
const fs = require('node:fs');
const { test } = require('node:test');
const { eventKey, pendingReturns, create } = require('../repair-returns.js');
const iso = value => value || '';
test('pending returns are scoped by place, newest first and disappear on pickup', () => {
  const records = [
    { id: 'old', location: 'T12', returnDate: '2026-10-12' },
    { id: 'new', location: 'P50', returnDate: '2026-10-14' },
    { id: 'closed', location: 'P50', returnDate: '2026-10-14', pickupDate: '2026-10-14' },
    { id: 'sent', location: 'P63' }
  ];
  assert.deepEqual(pendingReturns(records, iso).map(r => r.id), ['new', 'old']);
  assert.deepEqual(pendingReturns(records, iso, 'P50').map(r => r.id), ['new']);
  assert.notEqual(eventKey(records[0], iso), eventKey({ ...records[0], returnDate: '2026-10-13' }, iso));
  assert.equal(records[0].pickupDate, undefined);
});
test('acknowledgement uses its own RPC, updates the counter and never changes a repair', async () => {
  const element = () => ({ children: [], value: '', hidden: false, textContent: '', dataset: {}, attributes: {}, events: {},
    classList: { toggle() {} }, append(...nodes) { this.children.push(...nodes); },
    replaceChildren(...nodes) { this.children = nodes; }, setAttribute(key, value) { this.attributes[key] = value; },
    querySelectorAll() { return this.children; }, contains(node) { return this.children.includes(node); },
    addEventListener(name, handler) { this.events[name] = handler; }, scrollIntoView() {} });
  const elements = new Map(['repairReturnsBtn','repairReturnsPanel','repairReturnsList','repairReturnsMessage',
    'repairReturnsPlace','repairReturnsCount','repairReturnsRefresh','repairReturnsClose'].map(id => [id, element()]));
  const previous = global.document;
  global.document = { getElementById: id => elements.get(id), createElement: element, body: element() };
  const record = { id: 'one', location: 'P50', returnDate: '2026-10-14', customerName: 'Synthetic', deviceName: 'Model' };
  let isOwner = false;
  const filter = elements.get('repairReturnsPlace');
  filter.children = ['', 'T12', 'P50', 'P63'].map(place => {
    const tile = element(); tile.dataset.returnPlace = place; tile.closest = () => tile; return tile;
  });
  let saves = 0;
  const client = { async rpc(name, args) {
    if (name === 'satis_repair_return_acknowledgements') return { data: [] };
    assert.equal(name, 'satis_acknowledge_repair_return'); saves++;
    assert.equal(args.p_location, 'P50');
    return { data: { record_id: 'one', return_date: '2026-10-14', location: 'P50',
      acknowledged_at: '2026-10-14T10:00:00Z', user_email: 'synthetic@example.invalid' } };
  } };
  let module;
  try {
    module = create({ client, records: () => [record], user: () => ({ id: 'user' }), owner: () => isOwner,
      place: () => 'P50', workstation: () => 'P50', iso, formatDate: value => value,
      openRecord() {}, locationPill: () => element(), isOrder: row => row.sourceDocumentType === 'ORDER' });
    await module.load();
    assert.equal(filter.hidden, true);
    filter.events.click({target: filter.children[1]});
    assert.equal(elements.get('repairReturnsList').children.length, 1, 'staff cannot override workstation scope');
    isOwner = true; module.render();
    assert.equal(filter.hidden, false);
    filter.events.click({target: filter.children[1]});
    assert.equal(elements.get('repairReturnsList').children.length, 1); // Empty-state message only.
    assert.equal(elements.get('repairReturnsList').children[0].textContent, 'Brak produktów oczekujących na odbiór.');
    assert.equal(filter.children[1].attributes['aria-pressed'], 'true');
    filter.events.click({target: filter.children[2]});
    assert.equal(filter.children[1].attributes['aria-pressed'], 'false');
    assert.equal(filter.children[2].attributes['aria-pressed'], 'true');
    let kind = elements.get('repairReturnsList').children[0].children[0].children[1];
    assert.equal(kind.textContent, 'Serwis');
    assert.match(kind.className, /kind-service/);
    record.sourceDocumentType = 'ORDER';
    module.render();
    kind = elements.get('repairReturnsList').children[0].children[0].children[1];
    assert.equal(kind.textContent, 'Zamówienie');
    assert.match(kind.className, /kind-order/);
    assert.equal(elements.get('repairReturnsCount').textContent, '1');
    const button = elements.get('repairReturnsList').children[0].children[1].children[1];
    await button.onclick();
    assert.equal(saves, 1);
    assert.equal(elements.get('repairReturnsCount').hidden, true);
    assert.equal(record.pickupDate, undefined);
    module.clear();
    assert.equal(elements.get('repairReturnsList').children.length, 0);
  } finally { module?.clear(); global.document = previous; }
});
test('database stamps account/time, rejects stale returns and grants no direct client writes', () => {
  assert.match(fs.readFileSync('app.js', 'utf8'), /locationPill: createLocationPill, isOrder: isOrderRepairRecord/);
  const sql = fs.readFileSync('supabase-repair-returns.sql', 'utf8');
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /auth\.uid\(\) is null or not public\.is_satis_app_user\(\)/);
  assert.match(sql, /primary key \(record_id, return_date, location\)/);
  assert.match(sql, /on conflict \(record_id, return_date, location\) do nothing/);
  assert.match(sql, /for share/);
  assert.doesNotMatch(sql, /update public\.repair_records|grant (?:insert|update|delete)/i);
});
