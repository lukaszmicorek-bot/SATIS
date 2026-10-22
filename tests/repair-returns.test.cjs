const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');
const { eventKey, pendingReturns, create } = require('../repair-returns.js');
const iso = value => value || '';
test('active-only service filter hides completed records but preserves every open stage and other filters', () => {
  const js = fs.readFileSync('app.js', 'utf8');
  const start = js.indexOf('function filteredRepairRecords(');
  const ctx = vm.createContext({
    repairSearchInput: {value: ''}, repairCategoryFilter: {value: ''}, repairStatusFilter: {value: ''},
    repairLocationFilter: {value: ''}, repairActiveOnlyFilter: {checked: false},
    repairRecords: ['PRZYJĘTE', 'W TRAKCIE', 'GOTOWE', 'ODEBRANE'].map((status, id) => ({id, status, category: 'REPAIR', location: 'P63'})),
    repairDerived: new Map(), normalize: value => String(value || '').toLowerCase(),
    normalizeRepairCategory: value => value, normalizeRepairLocation: value => value,
    effectiveRepairStatus: row => row.status, matchesRepairKind: () => true, sortRepairRecords: rows => rows
  });
  vm.runInContext(js.slice(start, js.indexOf('\n}', start) + 2), ctx);
  assert.equal(ctx.filteredRepairRecords().length, 4);
  ctx.repairActiveOnlyFilter.checked = true;
  assert.deepEqual(Array.from(ctx.filteredRepairRecords(), row => row.status), ['PRZYJĘTE', 'W TRAKCIE', 'GOTOWE']);
  ctx.repairStatusFilter.value = 'GOTOWE';
  assert.equal(ctx.filteredRepairRecords().length, 1);
  ctx.repairLocationFilter.value = 'P50';
  assert.equal(ctx.filteredRepairRecords().length, 0);
  const resetStart = js.indexOf('function resetRepairFilters(');
  assert.match(js.slice(resetStart, js.indexOf('\n}', resetStart)), /repairActiveOnlyFilter.checked = false/);
  assert.match(fs.readFileSync('index.html', 'utf8'), /id="repairActiveOnlyFilter" type="checkbox" role="switch"/);
});
test('pre-2025 pending returns are archived, but 2025 and recent returns on older cases stay visible', () => {
  const rows = [
    {id: 'archive', returnDate: '2024-12-31'},
    {id: 'boundary', returnDate: '2025-01-01'},
    {id: 'recent', receivedDate: '2020-01-01', returnDate: '2026-10-22'},
    {id: 'undated'},
    {id: 'closed', returnDate: '2026-10-22', pickupDate: '2026-10-22'}
  ];
  assert.deepEqual(pendingReturns(rows, iso).map(row => row.id), ['recent', 'boundary']);
  assert.equal(rows[0].returnDate, '2024-12-31', 'archival data is not changed');
});

test('unfinished service list excludes archival stages without hiding recent progress', () => {
  const js = fs.readFileSync('app.js', 'utf8');
  const extract = name => {
    const start = js.indexOf(`function ${name}(`);
    return js.slice(start, js.indexOf('\n}', start) + 2);
  };
  const ctx = vm.createContext({
    repairRecords: [
      {id: 'old-ready', receivedDate: '2024-01-01', returnDate: '2024-12-31'},
      {id: 'old-sent', sentDate: '2024-12-31'},
      {id: 'old-received', receivedDate: '2024-12-31'},
      {id: 'current', receivedDate: '2024-01-01', returnDate: '2025-01-01'},
      {id: 'missing'}
    ],
    isoDateForSave: iso, matchesRepairKind: () => true, isRepairClosed: () => false,
    matchesRepairOpenPriorityFilter: () => true, sortOpenRepairRecords: rows => rows,
    effectiveRepairStatus: row => row.status
  });
  vm.runInContext(extract('openRepairRecords'), ctx);
  vm.runInContext(extract('repairStatusAge'), ctx);
  assert.deepEqual(Array.from(ctx.openRepairRecords(), row => row.id), ['current', 'missing']);
  assert.equal(ctx.repairStatusAge({returnDate: '2024-12-31'}, 'GOTOWE'), null);
  assert.ok(ctx.repairStatusAge({returnDate: '2025-01-01'}, 'GOTOWE') > 0);
  assert.match(extract('filteredRepairRecords'), /matchesRepairKind/);
  assert.doesNotMatch(extract('filteredRepairRecords'), /2025-01-01/, 'the full base remains searchable');
});
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
