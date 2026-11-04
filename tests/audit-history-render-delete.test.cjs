const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
function extract(name) {
  const match = new RegExp(`^(?:async )?function ${name}\\(`, 'm').exec(source);
  assert.ok(match, name);
  return source.slice(match.index, source.indexOf('\n}\n', match.index) + 2);
}

test('PCPR search combines personal data, both models and linked serials with place and office filters', () => {
  const ctx = vm.createContext({
    pcprSearchInput: { value: '' }, pricingPcprPlaceFilter: '', pricingPcprOfficeFilter: '',
    normalizeLoanHistoryText: value => String(value || '').trim(), normalizePcprPlace: value => value,
    records: [{ customerName: 'Łukasz Żak', serialNumber: 'ABC123' }],
    repairRecords: [{ customerName: 'Anna Nowak', serialNumber: 'SER001', serialNumber2: 'SER002' }],
    demoRecords: [{ currentUser: 'Jan Kot', serialNumber: 'DEM001', loanHistory: [{ currentUser: 'Łukasz Żak' }] }],
    repairSerialNumbers: entry => [entry.serialNumber, entry.serialNumber2],
    normalizeDemoLoanHistory: history => history || []
  });
  for (const name of ['normalize', 'normalizeDeviceSearchText', 'pcprCustomerSerialSearchIndex', 'filteredPricingPcprList']) {
    vm.runInContext(extract(name), ctx);
  }
  const entries = [
    { id: 'a', customer: 'Łukasz Żak', phone: '500 600 700', city: 'Żywiec', model: 'Audeo', model2: 'Naida', office: 'PCPR Żywiec', place: 'P50' },
    { id: 'b', customer: 'Anna Nowak', office: 'MOPS', place: 'P63', notes: 'Dokumenty' },
    { id: 'c', customer: 'Jan Kot', office: 'PCPR', place: 'T12' }
  ];
  const find = value => { ctx.pcprSearchInput.value = value; return Array.from(ctx.filteredPricingPcprList(entries), entry => entry.id); };
  for (const query of ['lukasz zak', 'Naida', '500600700', 'zywiec', 'ABC123', 'zak DEM001', 'audeo zak']) {
    assert.deepEqual(find(query), ['a'], query);
  }
  assert.deepEqual(find('SER002'), ['b']);
  assert.deepEqual(find('dokumenty'), ['b']);
  assert.deepEqual(find('DEM001'), ['a', 'c']);
  ctx.pricingPcprPlaceFilter = 'T12';
  assert.deepEqual(find('DEM001'), ['c']);
  ctx.pricingPcprOfficeFilter = 'MOPS';
  assert.deepEqual(find('DEM001'), []);
  assert.deepEqual(find('missing'), []);
  ctx.pcprSearchInput.value = 'Naida';
  ctx.updatePcprFilterTabs = () => {};
  ctx.renderPricingPcprList = () => {};
  vm.runInContext(extract('resetPricingPcprFilters'), ctx);
  ctx.resetPricingPcprFilters();
  assert.equal(ctx.pcprSearchInput.value, '');
  assert.equal(ctx.pricingPcprPlaceFilter, '');
  assert.equal(ctx.pricingPcprOfficeFilter, '');
});
function element(tag = 'div') {
  return {
    tag, children: [], textContent: '', className: '', dataset: {}, events: {},
    classList: { add() {}, toggle() {} },
    append(...nodes) { this.children.push(...nodes); },
    add(node) { this.children.push(node); },
    replaceChildren(...nodes) { this.children = nodes; },
    addEventListener(name, callback) { this.events[name] = callback; },
    querySelector() { return null; },
    setAttribute() {}
  };
}
function rows(count) {
  return Array.from({ length: count }, (_, index) => {
    const id = `row-${index}`;
    const date = new Date(Date.UTC(2026, 0, -index)).toISOString();
    return { id, number: id, customer: `Patient #${index}#`, patient: `Patient #${index}#`,
      savedAt: date, date, offerDate: date, createdAt: date, testDate: date,
      place: index === count - 1 ? 'P63' : 'T12', office: 'PCPR',
      age: '', items: [], results: [], repairCost: '', pesel: '12345678901' };
  });
}
const collections = [
  ['loan', 'pricingLoanHistory', 'SUPABASE_LOAN_CONTRACT_TABLE', 'deletePricingLoanHistoryEntry', 'saveLocalPricingLoanHistory', 'loanHistoryList', 'loanHistoryCount', 'renderPricingLoanHistory'],
  ['offer', 'pricingOfferHistory', 'SUPABASE_OFFER_HISTORY_TABLE', 'deletePricingOfferHistoryEntry', 'saveLocalPricingOfferHistory', 'offerHistoryList', 'offerHistoryCount', 'renderPricingDocumentHistory'],
  ['order', 'pricingOrderHistory', 'SUPABASE_ORDER_HISTORY_TABLE', 'deletePricingOrderHistoryEntry', 'saveLocalPricingOrderHistory', 'orderHistoryList', 'orderHistoryCount', 'renderPricingDocumentHistory'],
  ['complaint', 'pricingComplaintHistory', 'SUPABASE_COMPLAINT_HISTORY_TABLE', 'deletePricingComplaintHistoryEntry', 'saveLocalPricingComplaintHistory', 'complaintHistoryList', 'complaintHistoryCount', 'renderPricingDocumentHistory'],
  ['pcpr', 'pricingPcprList', 'SUPABASE_PCPR_LIST_TABLE', 'deletePricingPcprItem', 'saveLocalPricingPcprList', 'pcprList', 'pcprListCount', 'renderPricingPcprList'],
  ['capd', 'capdHistory', 'SUPABASE_CAPD_HISTORY_TABLE', 'deleteCapdHistoryEntry', 'saveLocalCapdHistory', 'capdHistoryList', 'capdHistoryCount', 'renderCapdHistory']
].map(([kind, state, table, remove, save, list, count, render]) => ({ kind, state, table, remove, save, list, count, render }));

function setup() {
  const issues = [];
  const context = vm.createContext({
    document: { createElement: element, querySelector: () => null },
    Option: function (label, value) { return { label, value }; },
    normalize: value => String(value || '').toLowerCase(),
    normalizeLoanHistoryText: value => String(value || '').trim(),
    normalizePcprPlace: value => value,
    formatDate: value => value,
    todayInputValue: () => "2026-11-04",
    capdPhoneNotifiedForPickup: () => false,
    formatAuditDateTime: () => '',
    formatOfferAge: () => '',
    formatServiceCost: () => '',
    canViewDocumentHistory: () => true,
    canManagePricingLoanHistory: () => false,
    canManagePricing: () => false,
    canViewPrivateModules: () => false,
    pricingHistorySelectableEntries: new Map(),
    pricingHistorySearchInput: { value: '' },
    pricingHistoryTypeFilter: { value: '' },
    pricingHistoryYearFilter: { value: '' },
    pricingHistoryLocationFilter: { value: '' },
    capdHistorySearchInput: { value: '' },
    capdHistoryStatusFilter: { dataset: { value: '' } },
    CAPD_HISTORY_STATUS_LABELS: { OPIS: 'Opis', DO_ODBIORU: 'Do odbioru', ODEBRANO: 'Odebrano' },
    capdHistoryEmpty: element(),
    activeCapdHistoryId: '',
    pricingPcprPlaceFilter: '', pricingPcprOfficeFilter: '', pcprSearchInput: { value: '' },
    normalizeDeviceSearchText: value => String(value || '').toLowerCase(),
    pricingHistoryEntryMatchesFilters: () => true,
    pricingHistoryEntryLocationValue: () => '',
    pricingLoanDeadlineStatus: () => null,
    updatePricingLoanDeadlineSummary() {},
    pricingLoanDataIssues: entry => { issues.push(entry.id); return []; },
    pricingDocumentDataIssues: entry => { issues.push(entry.id); return []; },
    pricingHistoryDuplicateLookup: () => () => null,
    pricingLoanHistorySearchText: entry => entry.customer.toLowerCase(),
    pricingOfferHistorySearchText: entry => entry.customer.toLowerCase(),
    pricingOrderHistorySearchText: entry => entry.customer.toLowerCase(),
    pricingComplaintHistorySearchText: entry => entry.customer.toLowerCase(),
    pricingLoanHistoryDeviceLabel: () => '',
    pricingOfferPatientGroupLabel: () => '',
    pricingComplaintRequestLabel: () => '',
    pricingLoanHistoryCountLabel: count => `${count} loans`,
    pricingDocumentHistoryCountLabel: count => `${count} documents`,
    pricingPcprListCountLabel: count => `${count} PCPR`,
    capdHistoryCountLabel: count => `${count} APD`,
    maskSensitiveIdentifier: value => value,
    yearGroupedListNodes: (entries, create) => entries.map(create),
    setPricingHistoryMetaText: (node, text) => { node.textContent = text; },
    bindPricingHistorySelection: (node, entry) => { node.recordId = entry.id; },
    createPricingDocumentHistoryItem: entry => Object.assign(element('article'), { recordId: entry.id }),
    createPricingPcprItem: entry => Object.assign(element('article'), { recordId: entry.id }),
    syncPricingHistoryFilters() {}, renderPricingHistoryRelations() {}, renderActivePricingLoans() {}
  });
  collections.forEach(config => {
    context[config.state] = [];
    context[config.list] = element();
    context[config.count] = element();
  });
  for (const name of ['normalizePricingLoanHistory', 'normalizePricingOfferHistory', 'normalizePricingOrderHistory', 'normalizePricingComplaintHistory', 'normalizePricingPcprList']) {
    context[name] = entries => entries;
  }
  for (const name of ['historyRenderBatch', 'appendHistoryLoadMore', 'pricingHistoryRenderFilterKey', 'renderPricingHistoryList', 'renderPricingLoanHistory', 'renderPricingDocumentHistory', 'filteredPricingPcprList', 'renderPricingPcprList', 'isoDateFromParts', 'isoDateForSave', 'parseIsoDate', 'isoDateDistanceDays', 'capdHistoryPickupOverdue', 'renderCapdHistory']) {
    vm.runInContext(extract(name), context);
  }
  return { context, issues };
}
const cards = list => list.children.filter(node => node.tag === 'article');
const more = list => list.children.find(node => node.className === 'reset-filters-btn history-load-more');

for (const config of collections) {
  test(`${config.kind}: render 500, load more to 1000/1001, preserve counts and filter the full collection`, () => {
    const { context, issues } = setup();
    context[config.state] = rows(1001);
    const list = context[config.list];
    context[config.render]();
    assert.equal(cards(list).length, 500);
    assert.match(context[config.count].textContent, /1001/);
    assert.match(more(list).textContent, /500 z 1001/);
    if (['loan', 'offer', 'order', 'complaint'].includes(config.kind)) assert.equal(issues.length, 500);
    more(list).events.click();
    assert.equal(cards(list).length, 1000);
    assert.match(more(list).textContent, /1000 z 1001/);
    more(list).events.click();
    assert.equal(cards(list).length, 1001);
    assert.equal(more(list), undefined);
    const filter = value => {
      if (config.kind === 'pcpr') context.pricingPcprPlaceFilter = value;
      else (config.kind === 'capd' ? context.capdHistorySearchInput : context.pricingHistorySearchInput).value = value;
      context[config.render]();
    };
    filter(config.kind === 'pcpr' ? 'P63' : '#1000#');
    assert.equal(cards(list).length, 1, 'oldest record beyond the first batch remains searchable');
    if (config.kind !== 'capd') assert.equal(cards(list)[0].recordId, 'row-1000');
    else assert.equal(cards(list)[0].children[0].children[0].textContent, 'Patient #1000#');
    assert.match(context[config.count].textContent, /^1\b/);
    assert.equal(more(list), undefined);
    filter('no-match');
    assert.equal(cards(list).length, 0);
    assert.equal(more(list), undefined);
    filter('');
    assert.equal(cards(list).length, 500, 'changing filters resets the visible batch');
    assert.equal(context[config.state].length, 1001, 'rendering never truncates source data');
  });

  test(`${config.kind}: CAS delete waits for confirmation, preserves concurrent rows and keeps data on failure`, async () => {
    const initial = rows(2);
    const calls = [];
    const alerts = [];
    let resolveDelete;
    const context = vm.createContext({
      [config.state]: initial,
      [config.table]: config.kind,
      [config.state + 'SupabaseAvailable']: true,
      [config.save]: () => calls.push('cache'),
      hasSupabaseConfig: true, currentSupabaseUser: { id: 'user' },
      canManagePricing: () => true, canManagePricingLoanHistory: () => true,
      canManagePricingPcprList: () => true, canViewPrivateModules: () => true,
      activePricingLoanHistoryId: initial[0].id, activeCapdHistoryId: initial[0].id,
      loanContractNumberInput: null,
      confirm: () => true, formatDate: value => value,
      alert: value => alerts.push(value),
      rebuildCustomerDocumentIndex() {}, rebuildCustomerNameSuggestions() {},
      renderPricingLoanHistory() {}, renderPricingDocumentHistory() {}, renderDeviceViews() {},
      renderPricingPcprList() {}, renderCapdHistory() {}, renderCapdPractitionerProfiles() {},
      deleteSupabaseRecord: (table, id) => { calls.push([table, id]); return new Promise(resolve => { resolveDelete = resolve; }); }
    });
    vm.runInContext(extract(config.remove), context);
    const deleting = context[config.remove](initial[0].id);
    assert.equal(context[config.state], initial, 'pending server confirmation must not mutate the cache');
    assert.deepEqual(calls, [[config.kind, initial[0].id]]);
    context[config.state] = [...initial, { id: 'realtime-arrival' }];
    resolveDelete();
    await deleting;
    assert.deepEqual(Array.from(context[config.state], row => row.id), [initial[1].id, 'realtime-arrival']);
    assert.equal(calls[1], 'cache');
    for (const error of [new Error('CAS conflict'), new Error('offline')]) {
      const before = context[config.state];
      context.deleteSupabaseRecord = async () => { throw error; };
      await context[config.remove](initial[1].id);
      assert.equal(context[config.state], before);
      assert.match(alerts.at(-1), new RegExp(error.message));
    }
    context.currentSupabaseUser = null;
    const before = context[config.state];
    await context[config.remove](initial[1].id);
    assert.equal(context[config.state], before, 'signed-out deletion must not silently delete only locally');
    assert.doesNotMatch(extract(config.remove), /\.delete\(\)/);
  });
}

test('duplicate lookup matches legacy semantics, including unseen complaint intake duplicates and stable ties', () => {
  const normalize = value => String(value || '').toLowerCase();
  const context = vm.createContext({
    normalize, canonicalLoanContractNumber: normalize, pricingDocumentNumberKey: normalize,
    pricingLoanSemanticKey: row => row.semantic,
    pricingOfferSnapshotKey: row => row.semantic,
    pricingOrderSemanticKey: row => row.semantic,
    pricingComplaintSemanticKey: row => row.semantic,
    normalizePricingLoanHistory: entries => entries,
    normalizePricingComplaintItems: row => row.items || [],
    serialDuplicateKey: normalize,
    isoDateForSave: value => value || ''
  });
  for (const name of ['pricingHistoryDuplicateLookup', 'pricingLoanDuplicateOf', 'pricingDocumentDuplicateOf', 'pricingComplaintsShareIntake']) {
    vm.runInContext(extract(name), context);
  }
  const entries = rows(1001).map((row, index) => ({ ...row, semantic: `semantic-${index}` }));
  entries[1000].number = entries[0].number;
  entries[998].semantic = entries[1].semantic;
  entries[999].date = entries[2].date;
  entries[999].items = [{ serial: 'same-serial' }];
  entries[2].items = [{ serial: 'SAME-SERIAL' }];
  entries[997].savedAt = entries[998].savedAt;
  entries[997].number = entries[1].number;
  for (const kind of ['loan', 'offer', 'order', 'complaint']) {
    const lookup = context.pricingHistoryDuplicateLookup(entries, kind);
    for (const index of [0, 1, 2, 3, 997, 998, 999, 1000]) {
      const legacy = kind === 'loan'
        ? context.pricingLoanDuplicateOf(entries[index], entries)
        : context.pricingDocumentDuplicateOf(entries[index], entries, kind);
      assert.equal(lookup(entries[index])?.id, legacy?.id, `${kind} row ${index}`);
    }
  }
});

test('duplicate indexing computes each semantic key once, not once per visible card', () => {
  let semanticCalls = 0;
  const context = vm.createContext({
    pricingDocumentNumberKey: value => value,
    pricingOfferSnapshotKey: row => { semanticCalls++; return row.id; }
  });
  vm.runInContext(extract('pricingHistoryDuplicateLookup'), context);
  const entries = rows(10000);
  const lookup = context.pricingHistoryDuplicateLookup(entries, 'offer');
  for (const row of entries) assert.equal(lookup(row), null);
  assert.equal(semanticCalls, entries.length);
});

test('related documents retain all links while rendering and loading more in batches of 500', () => {
  const { context } = setup();
  const panel = element();
  const list = element();
  const label = element();
  const all = rows(1002);
  context.document.querySelector = selector => ({
    '#pricingHistoryRelatedPanel': panel,
    '#pricingHistoryRelatedList': list,
    '#pricingHistoryRelatedSelection': label
  })[selector];
  context.pricingHistoryTypeFilter.value = 'loan';
  context.pricingHistorySelectedKey = 'loan:row-0';
  context.pricingHistorySelectableEntries.set('loan:row-0', { kind: 'loan', entry: all[0], item: element() });
  context.pricingHistoryEntriesWithKinds = () => all.map(entry => ({ kind: 'loan', entry }));
  context.pricingHistoryRelationReason = (selected, candidate) => selected.entry.id === candidate.entry.id ? '' : 'Related';
  context.pricingHistoryEntryDate = entry => entry.date;
  for (const name of ['restorePricingLoanFromHistory', 'restorePricingOfferFromHistory', 'restorePricingOrderFromHistory', 'restorePricingComplaintFromHistory']) context[name] = () => {};
  vm.runInContext(extract('renderPricingHistoryRelations'), context);
  context.renderPricingHistoryRelations();
  assert.equal(cards(list).length, 500);
  assert.match(more(list).textContent, /500 z 1001/);
  more(list).events.click();
  assert.equal(cards(list).length, 1000);
  more(list).events.click();
  assert.equal(cards(list).length, 1001);
  assert.ok(cards(list).some(card => card.recordId === 'row-1001'));
  assert.equal(more(list), undefined);
  context.pricingHistorySelectableEntries.set('loan:row-1', { kind: 'loan', entry: all[1], item: element() });
  context.pricingHistorySelectedKey = 'loan:row-1';
  context.renderPricingHistoryRelations();
  assert.equal(cards(list).length, 500, 'selecting a different document resets its related results batch');
});

test('APD date warning is rendered only for overdue ready studies and clears after pickup',()=>{
  const {context}=setup();
  const entry=rows(1)[0];
  context.capdHistory=[{...entry,status:'DO_ODBIORU',testDate:'2026-09-05'}];
  const dateNode=()=>cards(context.capdHistoryList)[0].children[0].children[1].children[0];
  context.renderCapdHistory();
  assert.equal(dateNode().dataset.overdue,'true');
  assert.equal(dateNode().textContent,'Data badania: 2026-09-05');
  assert.match(dateNode().title,/60 dni/);
  context.capdHistory[0].status='ODEBRANO';context.renderCapdHistory();
  assert.equal(dateNode().dataset.overdue,'false');
  context.capdHistory[0].status='DO_ODBIORU';context.capdHistory[0].testDate='2026-09-06';context.renderCapdHistory();
  assert.equal(dateNode().dataset.overdue,'false');
});
