const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');
const { eventKey, pendingReturns, create } = require('../repair-returns.js');
const iso = value => value || '';
test('service/order archive uses a rolling 24-month boundary and preserves order/data', () => {
  const source = fs.readFileSync('app.js', 'utf8');
  const start = source.indexOf('function splitRepairArchive(');
  const ctx = vm.createContext({isoDateForSave: iso});
  vm.runInContext(source.slice(start, source.indexOf('\n}', start) + 2), ctx);
  const items = [
    {id: 'old-service', receivedDate: '2024-10-21', sourceDocumentType: 'COMPLAINT'},
    {id: 'boundary', receivedDate: '2024-10-22'},
    {id: 'old-order', receivedDate: '2023-01-01', sourceDocumentType: 'ORDER'},
    {id: 'recent', receivedDate: '2026-10-22'},
    {id: 'unknown', receivedDate: ''}
  ];
  const before = JSON.stringify(items);
  const result = ctx.splitRepairArchive(items, '2026-10-22');
  assert.deepEqual(Array.from(result.current, row => row.id), ['boundary', 'recent', 'unknown']);
  assert.deepEqual(Array.from(result.archived, row => row.id), ['old-service', 'old-order']);
  assert.equal(JSON.stringify(items), before);
  const leap = ctx.splitRepairArchive([{id: 'limit', receivedDate: '2022-02-28'}, {id: 'old', receivedDate: '2022-02-27'}], '2024-02-29');
  assert.equal(leap.current[0].id, 'limit');
  assert.equal(leap.archived[0].id, 'old');
  const archiveStart = source.indexOf('function renderRepairArchive(');
  const archive = source.slice(archiveStart, source.indexOf('\n}', archiveStart) + 2);
  assert.ok(archive.indexOf('if (!archive.open') < archive.indexOf('yearGroupedTableRows'), 'collapsed rows are not rendered');
  assert.match(archive, /visibleTableItems\(items, "repairArchive"\)/);
  const html = fs.readFileSync('index.html', 'utf8');
  assert.match(html, /<details id="repairArchive"[^>]* hidden>/);
  assert.doesNotMatch(html, /<details id="repairArchive"[^>]*\sopen(?:\s|>)/);
});
test('base/service toolbars share search, place, status ordering before secondary filters and actions', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  for (const ids of [
    ['searchInput', 'locationFilter', 'typeFilter', 'fifoFilter', 'ezwmFilter', 'resetDeviceFiltersBtn', 'addBtn'],
    ['repairSearchInput', 'repairLocationFilter', 'repairStatusFilter', 'repairCategoryFilter', 'resetRepairFiltersBtn', 'addRepairBtn']
  ]) {
    const positions = ids.map(id => html.indexOf(`id="${id}"`));
    assert.ok(positions.every((position, i) => position >= 0 && (!i || position > positions[i - 1])));
    for (const id of ids) assert.equal(html.split(`id="${id}"`).length - 1, 1, `${id} remains unique`);
  }
});
test('gabinet cannot open a new manual service entry; add button starts hidden and disabled', () => {
  const source = fs.readFileSync('app.js', 'utf8');
  const start = source.indexOf('function openRepairDialog(');
  const code = source.slice(start, source.indexOf('\n}', start) + 2);
  let readinessChecked = false;
  const ctx = vm.createContext({canViewPrivateModules: () => false,
    requireInitialDataReady: () => { readinessChecked = true; return false; }});
  vm.runInContext(code, ctx);
  ctx.openRepairDialog();
  assert.equal(readinessChecked, false, 'new entry is refused before touching the form');
  ctx.openRepairDialog({id: 'existing'});
  assert.equal(readinessChecked, true, 'existing entry still reaches normal editing flow');
  assert.match(fs.readFileSync('index.html', 'utf8'), /id="addRepairBtn"[^>]*data-private-owner hidden disabled/);
});
test('base/service place tiles stay on one line with their own intrinsic grid column', () => {
  const css = fs.readFileSync('styles.css', 'utf8');
  assert.match(css, /\.repair-location-tiles\s*\{[^}]*flex-wrap:\s*nowrap/s);
  assert.match(css, /\.repair-location-tiles \.pcpr-tab\s*\{[^}]*flex:\s*0 0 auto/s);
  for (const kind of ['database', 'repairs']) {
    assert.match(css, new RegExp(`\\.${kind}-controls\\.compact-filters\\s*\\{[^}]*grid-template-columns:[^;]*max-content`, 's'));
  }
});
test('base/service printing is removed; transfer menus are owner-only and closed after logout', () => {
  const source = fs.readFileSync('app.js', 'utf8');
  const html = fs.readFileSync('index.html', 'utf8');
  assert.doesNotMatch(html, /id="(?:printBtn|printRepairBtn)"/);
  assert.equal((html.match(/data-sensitive-transfer-menu hidden/g) || []).length, 2);
  assert.equal((html.match(/data-device-location-target="locationFilter"/g) || []).length, 4);
  const menu = {hidden: false, open: true};
  const button = {hidden: false, disabled: false};
  let allowed = false;
  const ctx = vm.createContext({canManagePricing: () => allowed,
    document: {querySelectorAll: () => [menu], querySelector: () => button}});
  const start = source.indexOf('function updateSensitiveTransferVisibility(');
  vm.runInContext(source.slice(start, source.indexOf('\n}', start) + 2), ctx);
  ctx.updateSensitiveTransferVisibility();
  assert.equal(menu.hidden, true);
  assert.equal(menu.open, false);
  assert.equal(button.disabled, true);
  allowed = true;
  ctx.updateSensitiveTransferVisibility();
  assert.equal(menu.hidden, false);
  assert.equal(menu.open, false, 'owner actions stay collapsed until explicitly opened');
  assert.equal(button.disabled, false);
});
test('service location tiles preserve workstation/manual choices and use customer history only as fallback', () => {
  const source = fs.readFileSync('app.js', 'utf8');
  const extract = name => {
    const start = source.indexOf(`function ${name}(`);
    return source.slice(start, source.indexOf('\n}', start) + 2);
  };
  const input = {id: 'repairLocation', value: 'P50', dataset: {workstationDefault: '1'}, classList: {add() {}}, title: ''};
  const buttons = ['T12', 'P63', 'P50'].map(value => ({dataset: {value}, classList: {toggle(_, active) { this.active = active; }}, setAttribute(_, value) { this.pressed = value; }}));
  const nodes = {'#repairId': {value: ''}, '#repairCustomerName': {value: 'Test Klient'}, '#repairLocation': input};
  const ctx = vm.createContext({document: {querySelector: selector => nodes[selector], querySelectorAll: () => buttons},
    suggestedRepairLocationForCustomer: () => 'T12', clearRepairLocationSuggestion() {}, updateDocumentLocationAccent() {}});
  for (const name of ['syncRepairLocationTiles', 'syncRepairLocationFromCustomerName']) vm.runInContext(extract(name), ctx);
  ctx.syncRepairLocationFromCustomerName({force: true});
  assert.equal(input.value, 'P50', 'station wins over customer history');
  delete input.dataset.workstationDefault;
  input.dataset.userChanged = '1';
  ctx.syncRepairLocationFromCustomerName({force: true});
  assert.equal(input.value, 'P50', 'explicit choice cannot be overwritten');
  delete input.dataset.userChanged;
  ctx.syncRepairLocationFromCustomerName();
  assert.equal(input.value, 'T12');
  assert.equal(buttons[0].pressed, 'true');
  assert.equal(buttons[2].pressed, 'false');
  nodes['#repairId'].value = 'existing';
  input.value = 'P63';
  ctx.syncRepairLocationFromCustomerName({force: true});
  assert.equal(input.value, 'P63', 'editing preserves saved location');
  assert.match(extract('openRepairDialog'), /const workstationLocation = documentLocationForWorkstation\(\)/);
  const html = fs.readFileSync('index.html', 'utf8');
  assert.equal((html.match(/data-repair-location-target="repairLocation"/g) || []).length, 3);
  assert.equal((html.match(/data-repair-location-target="repairLocationFilter"/g) || []).length, 4);
});
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
  assert.match(js.slice(resetStart, js.indexOf('\n}', resetStart)), /repairActiveOnlyFilter.checked = true/);
  assert.match(fs.readFileSync('index.html', 'utf8'), /id="repairActiveOnlyFilter" type="checkbox" role="switch" checked/);
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
