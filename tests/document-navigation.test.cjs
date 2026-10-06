const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { test } = require('node:test');
const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
function extract(name) {
  const asyncStart = source.indexOf(`async function ${name}(`);
  const start = asyncStart >= 0 ? asyncStart : source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, name);
  const rest = source.slice(start);
  return rest.slice(0, rest.slice(1).search(/\n(?:async )?function /) + 1);
}
function node(id, dataset = {}, active = false) {
  const classes = new Set(active ? ['active'] : []);
  return { id, dataset, hidden: false, attributes: {}, children: [],
    classList: { contains: name => classes.has(name), toggle(name, on) { on ? classes.add(name) : classes.delete(name); } },
    setAttribute(name, value) { this.attributes[name] = value; },
    replaceChildren(...children) { this.children = children; }
  };
}
function setup() {
  const sections = ['devices', 'repairs', 'pricing', 'capd', 'vacation', 'workTime'].map(name => node(`${name}Notebook`));
  const tabs = Object.entries({devices: ['database', 'demo', 'stock', 'dataControl', 'offer', 'loan', 'rodo'], repairs: ['repairDatabase', 'repairOpen', 'order', 'complaint']})
    .flatMap(([group, views]) => views.map((view, index) => node(view, {view, viewGroup: group}, index === 0)));
  const views = ['database', 'demo', 'stock', 'dataControl', 'repairDatabase', 'repairOpen'].map(view =>
    node(`${view}View`, {viewGroup: view.startsWith('repair') ? 'repairs' : 'devices'}));
  const context = { activeNotebook: 'devices', activePricingView: '', activeDeviceView: 'database',
    currentSupabaseUser: {email: 'satis@pracowniasluchu.pl'}, owner: true,
    notebookSections: sections, tabButtons: tabs, viewSections: views, statsPanel: node('stats'),
    notebookSwitchButtons: ['devices', 'repairs', 'pricing', 'capd', 'pcpr', 'history', 'vacation', 'workTime'].map(name => node(name, {notebook: name})),
    canViewPrivateModules: () => context.owner,
    canViewDocumentHistory: () => Boolean(context.currentSupabaseUser),
    document: {querySelector: () => null},
    renderCounts: {}
  };
  for (const name of ['List', 'Offer', 'Loan', 'Rodo', 'Pcpr', 'Order', 'Complaint', 'History']) context[`pricing${name}View`] = node(name);
  for (const name of ['hideVacationPeriodPreview', 'updateCustomerRelationsPanelVisibility', 'renderCustomerRelations', 'setCurrentYearTitle',
    'renderPricingOfferDeviceList', 'renderPricingOffer', 'renderPricingLoan', 'renderPricingRodo', 'renderPricingPcprList', 'renderPricingOrder', 'renderPricingComplaint',
    'renderPricingDocumentHistory', 'renderPricingRecords', 'updateStats', 'renderRepairRecords', 'renderDataControlView', 'renderDemoRecords',
    'renderStockView', 'renderDeviceViews', 'updateCapdScope', 'renderCapdHistory', 'renderVacationModule',
    'renderWorkTimeModule', 'loadWorkTimeRecords']) {
    context[name] = () => { context.renderCounts[name] = (context.renderCounts[name] || 0) + 1; };
  }
  vm.createContext(context);
  for (const name of ['pricingViewNotebook', 'syncNotebookPanels', 'switchPricingView', 'switchView', 'switchNotebook']) vm.runInContext(extract(name), context);
  return context;
}
test('document views route to the correct notebook, preserve form nodes, and return to lists', () => {
  const ctx = setup();
  for (const [view, group] of Object.entries({offer: 'devices', loan: 'devices', rodo: 'devices', order: 'repairs', complaint: 'repairs'})) {
    const panel = ctx[`pricing${view[0].toUpperCase() + view.slice(1)}View`];
    panel.draft = 'unsaved text';
    ctx.switchPricingView(view);
    assert.equal(ctx.activeNotebook, group);
    assert.equal(ctx.activePricingView, view);
    assert.equal(panel.hidden, false);
    assert.equal(ctx.notebookSections.find(n => n.id === 'pricingNotebook').hidden, false);
    assert.equal(ctx.notebookSections.find(n => n.id === `${group}Notebook`).hidden, false);
    assert.equal(ctx.viewSections.filter(n => n.dataset.viewGroup === group).every(n => n.hidden), true);
    assert.equal(ctx.tabButtons.find(n => n.dataset.view === view).attributes['aria-selected'], 'true');
    assert.equal(ctx.statsPanel.hidden, true);
    ctx.switchNotebook('vacation');
    assert.equal(ctx.notebookSections.find(n => n.id === 'pricingNotebook').hidden, true);
    ctx.switchNotebook(group);
    assert.equal(ctx.activePricingView, view, 'return to the previously selected form');
    assert.equal(panel.draft, 'unsaved text');
    ctx.switchView(group === 'devices' ? 'database' : 'repairDatabase', group);
    assert.equal(ctx.notebookSections.find(n => n.id === 'pricingNotebook').hidden, true);
    assert.equal(ctx.statsPanel.hidden, group !== 'devices');
  }
});
test('work time month boundaries and owner policy are explicit', () => {
  const ctx = vm.createContext({Date, String});
  vm.runInContext(extract('workTimeMonthBounds'), ctx);
  assert.equal(ctx.workTimeMonthBounds('2026-12').to, '2027-01-01');
  assert.equal(ctx.workTimeMonthBounds('2026-13'), null);
  assert.doesNotMatch(html, /data-notebook="attendance"/);
});
test('work time is a separate owner-only notebook with protected records', () => {
  const ctx = setup();
  ctx.switchNotebook('workTime');
  assert.equal(ctx.activeNotebook, 'workTime');
  assert.equal(ctx.notebookSections.find(n => n.id === 'workTimeNotebook').hidden, false);
  assert.equal(ctx.renderCounts.loadWorkTimeRecords, 1);
  ctx.owner = false;
  ctx.switchNotebook('devices');
  ctx.switchNotebook('workTime');
  assert.equal(ctx.activeNotebook, 'devices');
  const migration = fs.readFileSync(path.join(__dirname, '../supabase-work-time.sql'), 'utf8');
  assert.match(migration, /alter table public\.work_time_records enable row level security/i);
  assert.match(migration, /using \(public\.is_satis_owner\(\)\)/i);
  assert.match(migration, /revoke all on public\.work_time_records from public, anon, authenticated/i);
  assert.match(migration, /work_time_record_history/i);
});
test('work time rejects impossible or incomplete entries', () => {
  const ctx = vm.createContext({
    todayInputValue: () => '2026-10-06', isoDateForSave: value => /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '',
    WORK_TIME_KINDS: {WORK: 'Praca', FREE: 'Wolne', LEAVE: 'Urlop', RELEASE: 'Zwolnienie', EXCUSED: 'Usprawiedliwiona', UNEXCUSED: 'Nieusprawiedliwiona'}
  });
  vm.runInContext(extract('workTimeIntervalMinutes'), ctx);
  vm.runInContext(extract('workTimeCalculatedMinutes'), ctx);
  vm.runInContext(extract('validateWorkTimeDraft'), ctx);
  const base = {date: '2026-10-06', kind: 'WORK', start: '08:00', end: '16:00', hours: 8,
    secondStart: '', secondEnd: '', overtime: 0, absenceHours: 0, freeReason: '', absenceLabel: ''};
  assert.equal(ctx.validateWorkTimeDraft(base), '');
  assert.equal(ctx.workTimeCalculatedMinutes({...base, start: '08:00', end: '12:00', secondStart: '13:00', secondEnd: '17:00'}), 480);
  assert.match(ctx.validateWorkTimeDraft({...base, overtime: 9}), /nadliczbowe/);
  assert.match(ctx.validateWorkTimeDraft({...base, secondStart: '11:00', secondEnd: '13:00'}), /po zakończeniu/);
  assert.match(ctx.validateWorkTimeDraft({...base, date: '2026-10-07'}), /późniejszą/);
  assert.match(ctx.validateWorkTimeDraft({...base, kind: 'FREE'}), /tytuł/);
  assert.equal(ctx.validateWorkTimeDraft({...base, kind: 'FREE', freeReason: 'niedziela'}), '');
  assert.match(ctx.validateWorkTimeDraft({...base, kind: 'LEAVE', absenceHours: 8}), /rodzaj nieobecności/);
  assert.equal(ctx.validateWorkTimeDraft({...base, end: '', hours: 0}, '2026-10-06', true), '');
  assert.match(ctx.validateWorkTimeDraft({...base, end: '', hours: 0}), /zakończenia/);
  assert.equal(ctx.workTimeIntervalMinutes('24:00', '25:00'), 0);
});
test('work time shows only the three workers from the selected vacation year', () => {
  const ctx = vm.createContext({normalize: value => String(value).toLowerCase()});
  vm.runInContext(extract('workTimeRosterForYear'), ctx);
  const entries = ['Oliwia Piecha', 'Justyna Waliczek', 'Iwona Test', 'Dorota Test', 'Inna Osoba']
    .map((name, index) => ({id: String(index), name, year: 2026, redacted: false}));
  entries.push({id: 'old', name: 'Oliwia Piecha', year: 2025, redacted: false});
  assert.equal(ctx.workTimeRosterForYear(entries, 2026).map(item => item.name).join(','),
    'Oliwia Piecha,Justyna Waliczek,Iwona Test');
});
test('work time save persists calculated minutes and rejects a store that is not ready', async () => {
  const saved = [];
  const messages = [];
  let draft = {date: '2026-10-06', kind: 'WORK', start: '08:00', end: '12:00',
    plannedEnd: '16:00', secondStart: '13:00', secondEnd: '17:00', workMinutes: 480, hours: 8, overtime: 0};
  const ctx = vm.createContext({
    canViewPrivateModules: () => true, currentSupabaseUser: {id: 'owner'}, hasSupabaseConfig: true,
    workTimeStoreReady: false, workTimeEditingKey: '', workTimeRecords: [],
    workTimeFields: {Employee: {value: 'e1'}, Month: {value: '2026-10'}},
    vacationEmployees: [{id: 'e1', name: 'Oliwia Piecha', year: 2026, redacted: false}],
    workTimeSaveBtn: {disabled: false}, workTimeStartSaveBtn: {disabled: false},
    supabaseClient: {from: () => ({upsert: async (record, options) => {
      saved.push({record, options}); return {error: null};
    }})},
    workTimeDraft: () => draft, todayInputValue: () => '2026-10-06',
    validateWorkTimeDraft: () => '', workTimeSetMessage: message => messages.push(message),
    workTimeResetForm: () => {}, loadWorkTimeRecords: async () => {}, Date,
  });
  vm.runInContext(extract('saveWorkTimeRecord'), ctx);
  await ctx.saveWorkTimeRecord({preventDefault() {}});
  assert.equal(saved.length, 0);
  assert.match(messages.at(-1), /Zapis niedostępny/);
  ctx.workTimeStoreReady = true;
  draft = {...draft, end: '', secondStart: '', secondEnd: '', workMinutes: 0, hours: 0};
  await ctx.saveWorkTimeRecord({preventDefault() {}}, {startOnly: true});
  assert.equal(saved.length, 1);
  assert.equal(saved[0].record.payload.end, '');
  assert.equal(saved[0].record.payload.plannedEnd, '16:00');
  assert.equal(saved[0].record.payload.workMinutes, 0);
  assert.match(messages.at(-1), /Rozpoczęcie zapisane/);
  draft = {...draft, end: '12:00', secondStart: '13:00', secondEnd: '17:00', workMinutes: 480, hours: 8};
  await ctx.saveWorkTimeRecord({preventDefault() {}});
  assert.equal(saved.length, 2);
  assert.equal(saved[1].record.payload.workMinutes, 480);
  assert.equal(saved[1].record.payload.secondStart, '13:00');
  assert.equal(saved[1].options.onConflict, 'employee_id,work_date');
  assert.equal(saved[0].record.employee_id, saved[1].record.employee_id);
  assert.equal(saved[0].record.work_date, saved[1].record.work_date);
  assert.match(extract('loadWorkTimeRecords'), /!record\.payload\?\.deletedAt/);
  assert.match(html, /id="workTimeDateInput"[^>]*data-date-picker/);
  assert.match(extract('renderDatePicker'), /workTimeCalendar/);
});
test('only SATIS can remove a work time entry and the audit trail remains', async () => {
  const saved = [];
  const ctx = vm.createContext({
    canViewPrivateModules: () => true, workTimeStoreReady: true, currentSupabaseUser: {id: 'owner'},
    supabaseClient: {from: () => ({upsert: async (record) => {saved.push(record); return {error: null};}})},
    confirm: () => true, formatDate: value => value, Date, workTimeEditingKey: '',
    workTimeSetMessage: () => {}, loadWorkTimeRecords: async () => {}
  });
  vm.runInContext(extract('deleteWorkTimeRecord'), ctx);
  const record = {employee_id: 'e1', employee_name: 'Oliwia Piecha', work_date: '2026-10-06', payload: {kind: 'WORK'}};
  await ctx.deleteWorkTimeRecord(record, {disabled: false});
  assert.equal(saved.length, 1);
  assert.ok(saved[0].payload.deletedAt);
  assert.equal(saved[0].payload.kind, 'WORK');
  ctx.canViewPrivateModules = () => false;
  await ctx.deleteWorkTimeRecord(record, {disabled: false});
  assert.equal(saved.length, 1);
});
test('PCPR and History stand alone, pricing stays available, and gabinet can open History', () => {
  const ctx = setup();
  for (const name of ['pcpr', 'history', 'pricing']) {
    ctx.switchNotebook(name);
    assert.equal(ctx.activeNotebook, name);
    assert.equal(ctx.notebookSections.filter(n => !n.hidden).map(n => n.id).join(','), 'pricingNotebook');
    assert.equal(ctx.activePricingView, name === 'pricing' ? 'list' : name);
  }
  ctx.owner = false;
  ctx.currentSupabaseUser = {email: 'gabinet@pracowniasluchu.pl'};
  ctx.switchNotebook('pcpr');
  ctx.switchNotebook('history');
  assert.equal(ctx.activeNotebook, 'history');
  ctx.switchPricingView('history');
  assert.equal(ctx.activePricingView, 'history');
  ctx.currentSupabaseUser = null;
  ctx.switchNotebook('devices');
  ctx.switchNotebook('history');
  assert.equal(ctx.activeNotebook, 'devices');
  ctx.switchPricingView('pcpr');
  assert.equal(ctx.activeNotebook, 'devices');
});
test('history renderers and previews refuse anonymous access but permit authenticated gabinet', () => {
  const ctx = setup();
  ctx.pricingHistorySelectableEntries = new Map();
  ctx.renderPricingHistoryRelations = () => {};
  ctx.owner = false;
  ctx.currentSupabaseUser = null;
  for (const name of ['loanHistoryList', 'offerHistoryList', 'orderHistoryList', 'complaintHistoryList', 'loanHistoryCount', 'loanDeadlineSummary']) {
    ctx[name] = node(name); ctx[name].children = ['private entry'];
  }
  for (const name of ['renderPricingLoanHistory', 'renderPricingDocumentHistory', 'showPricingHistoryPreview']) vm.runInContext(extract(name), ctx);
  ctx.renderPricingDocumentHistory();
  ctx.renderPricingLoanHistory();
  assert.equal(ctx.loanHistoryList.children.length, 0);
  assert.equal(ctx.offerHistoryList.children.length, 0);
  assert.equal(ctx.loanDeadlineSummary.hidden, true);
  assert.doesNotThrow(() => ctx.showPricingHistoryPreview('offer', {}));
  assert.match(extract('renderPricingDocumentHistory'), /!canViewDocumentHistory\(\)/);
  assert.match(extract('showPricingHistoryPreview'), /!canViewDocumentHistory\(\)/);
  assert.match(extract('updatePrivateModulesVisibility'), /!sharedVisible && \["capd", "vacation", "pcpr", "history"\]/);
});
test('navigation markup is unique, ordered, and linked; history no longer sits under the loan form', () => {
  const top = [...html.matchAll(/data-notebook="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(top, ['devices', 'repairs', 'capd', 'pcpr', 'history', 'pricing', 'vacation', 'workTime']);
  assert.match(html, /data-notebook="history" data-private-shared hidden/);
  for (const view of ['offer', 'loan', 'rodo', 'order', 'complaint']) {
    assert.match(html, new RegExp(`id="${view}Tab"[^>]*aria-controls="pricing${view[0].toUpperCase() + view.slice(1)}View"`));
  }
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size);
  assert.ok(html.indexOf('id="loanHistoryList"') > html.indexOf('id="pricingHistoryView"'));
  assert.doesNotMatch(source, /switchNotebook\("agreements"\)|loanHistorySearchInput|lastAgreementPricingView/);
  assert.match(extract('restorePricingLoanFromHistory'), /switchPricingView\("loan"\)/);
  assert.match(extract('addPricingRecordToOffer'), /switchPricingView\("offer"\)/);
});

test('document tabs form two separate styled groups without changing their roles or routes', () => {
  const groups = [...html.matchAll(/<div class="document-tab-group" role="presentation">([\s\S]*?)<\/div>/g)];
  assert.equal(groups.length, 2);
  assert.deepEqual(groups.map(match => [...match[1].matchAll(/data-view="([^"]+)"/g)].map(tab => tab[1])),
    [['offer', 'loan', 'rodo'], ['order', 'complaint']]);
  groups.forEach((match, index) => assert.equal((match[1].match(/role="tab"/g) || []).length, index === 0 ? 3 : 2));
  const css = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf8');
  assert.match(css, /\.document-tab-group \{[^}]*border-left: 1px solid/);
  assert.match(css, /\.document-tab-group \.tab-button\.active \{/);
  assert.match(css, /@media \(max-width: 640px\) \{\s*\.document-tab-group \{[^}]*border-left: 0;[^}]*border-top:/);
});

test('RODO print names distinct legal bases and keeps optional consents separate', () => {
  const print = html.slice(html.indexOf('id="pricingRodoPrint"'), html.indexOf('id="pricingPcprView"'));
  assert.equal((print.match(/<article class="rodo-page">/g) || []).length, 2);
  assert.match(print, /Podstawy prawne przetwarzania/);
  for (const basis of ['art. 6 ust. 1 lit. b RODO', 'art. 6 ust. 1 lit. c RODO',
    'art. 6 ust. 1 lit. f RODO', 'art. 9 ust. 2 lit. a RODO', 'art. 9 ust. 2 lit. f RODO', 'art. 398 ust. 1']) {
    assert.ok(print.includes(basis), `${basis} missing from RODO print`);
  }
  for (const choice of ['health-yes', 'health-no', 'visits-yes', 'visits-no', 'marketing-none']) {
    assert.ok(print.includes(`data-rodo-choice="${choice}"`), `${choice} missing from RODO print`);
  }
  assert.doesNotMatch(print, /art\. 9 ust\. 2 lit\. h RODO|20 lat|dokumentacji medycznej/);
  assert.match(print, /Bez zgody na przetwarzanie danych dotyczących zdrowia nie możemy wykonać tych usług/);
  assert.match(print, /Informacja dla klienta/);
  const css = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf8');
  assert.match(css, /@page rodoPage \{ size: A4 portrait;/);
  assert.match(css, /\.rodo-signatures \{\s*display: flex; flex-wrap: wrap;/);
});

test('order deposit and remaining balance stay consistent in form, print, and calculation', () => {
  for (const id of ['orderDepositInput', 'orderTotalAmount', 'orderRemainingAmount']) {
    assert.ok(html.includes(`id="${id}"`), id);
  }
  for (const field of ['total', 'deposit', 'remaining']) {
    assert.ok(html.includes(`data-order-out="${field}"`), field);
  }
  const context = vm.createContext({ normalizePricingOrderItem: item => item });
  for (const name of ['normalizePricingPrice', 'normalizeServiceCost', 'pricingOrderTotalCost', 'pricingOrderPaymentSummary']) {
    vm.runInContext(extract(name), context);
  }
  const payment = context.pricingOrderPaymentSummary([
    { cost: 4000, quantity: '1' }, { cost: 250.25, quantity: '2' }
  ], '500,50');
  assert.equal(payment.total, 4500.5);
  assert.equal(payment.remaining, 4000);
  assert.equal(context.pricingOrderPaymentSummary([{ cost: 1000, quantity: '1' }, { cost: '', quantity: '1' }], '200').remaining, '');
  assert.equal(context.pricingOrderPaymentSummary([{ cost: 1000, quantity: '1' }], '1000,01').tooHigh, true);
});

test('an offer keeps a selected charger when its catalog price changes', () => {
  const charger = { idProduct: 'CH-123', model: 'Ładowarka Alpha', tradeName: 'Ładowarka Alpha',
    manufacturer: 'Philips', grossPrice: 500 };
  const updatedCharger = { ...charger, grossPrice: 650 };
  const context = vm.createContext({ formatPricingPrice: value => `${value} zł`,
    pricingOfferAccessoryRecords: kind => kind === 'charger' ? [updatedCharger] : [] });
  for (const name of ['normalize', 'pricingOfferDeviceLabel', 'pricingOfferRecordSearchText',
    'findPricingOfferRecordInCandidates', 'findPricingOfferAccessoryRecord']) {
    vm.runInContext(extract(name), context);
  }
  const oldLabel = context.pricingOfferDeviceLabel(charger);
  assert.equal(context.findPricingOfferAccessoryRecord(oldLabel, 'charger'), updatedCharger);
  assert.equal(context.findPricingOfferAccessoryRecord('Ładowarka Alpha | Philips | 500 zł', 'charger'), updatedCharger);
  assert.equal(context.pricingOfferDeviceLabel(updatedCharger).includes('650 zł'), true);
});

test('selecting both order sides locks quantity to two and charges for two pieces', () => {
  const context = vm.createContext({
    PRICING_ORDER_TYPES: ['APARAT SŁUCHOWY', 'WKŁADKA USZNA', 'WKŁADKA PRZECIWWODNA'],
    normalizeLoanHistoryText: value => String(value ?? '').trim()
  });
  for (const name of ['normalizePricingPrice', 'normalizeServiceCost', 'normalizePricingOrderType',
    'normalizePricingOrderSide', 'pricingOrderItemAllowsCost', 'normalizePricingOrderItem',
    'togglePricingOrderSide', 'updatePricingOrderSideButtons', 'pricingOrderTotalCost']) {
    vm.runInContext(extract(name), context);
  }
  const sideInput = { value: 'P' };
  const quantityInput = { value: '1', dataset: {}, readOnly: false, title: '' };
  const buttons = ['P', 'L'].map(side => ({ dataset: { orderSide: side }, attributes: {},
    classList: { toggle(name, selected) { this[name] = selected; } },
    setAttribute(name, value) { this.attributes[name] = value; } }));
  const row = {
    querySelector: selector => selector.includes('quantity') ? quantityInput : sideInput,
    querySelectorAll: () => buttons
  };
  sideInput.value = context.togglePricingOrderSide(sideInput.value, 'L');
  context.updatePricingOrderSideButtons(row);
  assert.equal(sideInput.value, 'PL');
  assert.equal(quantityInput.value, '2');
  assert.equal(quantityInput.readOnly, true);
  assert.deepEqual(buttons.map(button => button.attributes['aria-pressed']), ['true', 'true']);
  const item = context.normalizePricingOrderItem({ type: 'WKŁADKA PRZECIWWODNA', side: sideInput.value, quantity: '1', cost: 200 });
  assert.equal(item.quantity, '2');
  assert.equal(context.pricingOrderTotalCost([item]), 400);
  sideInput.value = context.togglePricingOrderSide(sideInput.value, 'P');
  context.updatePricingOrderSideButtons(row);
  assert.equal(sideInput.value, 'L');
  assert.equal(quantityInput.value, '1');
  assert.equal(quantityInput.readOnly, false);
});

test('waterproof inserts include glitter and suggest a 50% deposit without changing other orders', () => {
  const context = vm.createContext({ normalizePricingOrderItem: item => item });
  for (const name of ['normalizePricingPrice', 'normalizeServiceCost', 'pricingOrderTotalCost',
    'pricingOrderPaymentSummary', 'pricingOrderWaterproofCost', 'pricingOrderSuggestedDeposit']) {
    vm.runInContext(extract(name), context);
  }
  assert.equal(context.pricingOrderWaterproofCost('', ''), 200);
  assert.equal(context.pricingOrderWaterproofCost('Brokat złoty', ''), 210);
  assert.equal(context.pricingOrderWaterproofCost('', 'kolor: brokat'), 210);
  const inserts = [{ type: 'WKŁADKA PRZECIWWODNA', cost: 210, quantity: '2' }];
  assert.equal(context.pricingOrderSuggestedDeposit(inserts), 210);
  assert.equal(context.pricingOrderPaymentSummary(inserts, '210').remaining, 210);
  assert.equal(context.pricingOrderSuggestedDeposit([{ type: 'APARAT SŁUCHOWY', cost: 2000, quantity: '1' }]), '');
  assert.equal(context.pricingOrderSuggestedDeposit([...inserts, { type: 'WKŁADKA USZNA', cost: '', quantity: '1' }]), '');
  assert.match(html, /Odbiór zamówienia przez klienta<\/span><strong>data i podpis/);
});

test('weekend compensation accepts one full day and half-hour steps only for hourly staff', () => {
  assert.match(html, /id="vacationCompensationAmount"[^>]*min="1" max="1" step="1"/);
  const update = extract('updateVacationUnitFields');
  assert.match(update, /compensationAmount\.min = usesHours \? "0\.5" : "1"/);
  assert.match(update, /compensationAmount\.step = usesHours \? "0\.5" : "1"/);
});

test('APD and PCPR primary row actions use the larger button style only in their own lists', () => {
  assert.match(extract('renderCapdHistory'), /openButton\.className = "reset-filters-btn capd-history-open"/);
  assert.doesNotMatch(source, /openButton\.className = "reset-filters-btn capd-history-open";\s*openButton\.textContent = "Otwórz"/);
  const css = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf8');
  assert.match(css, /\.pcpr-edit-btn \{\s*min-height: 38px;\s*padding: 0 15px;/);
});

test('loan history opens with a slightly larger button and a visible hover tone', () => {
  assert.match(extract('renderPricingLoanHistory'), /openButton\.className = "reset-filters-btn loan-history-open";\s*openButton\.textContent = "Otwórz"/);
  const css = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf8');
  assert.match(css, /\.loan-history-actions \.loan-history-open \{\s*min-height: 35px;/);
  assert.match(css, /\.loan-history-actions \.loan-history-open:hover,/);
});

test('weekend work uses the shared calendar and rejected leave days have a separate tone', () => {
  assert.match(html, /id="vacationCompensationDate" type="text" data-date-picker/);
  assert.match(extract('editVacationRequest'), /setDateInputValue\(compensationDate, request\.compensationDate\)/);
  const picker = extract('createDatePickerMonth');
  assert.match(extract('renderDatePicker'), /weekendWorkCalendar = activeDateInput\?\.id === "vacationCompensationDate"/);
  assert.match(extract('renderDatePicker'), /picker\.classList\.toggle\("weekend-work-picker", weekendWorkCalendar\)/);
  assert.match(picker, /weekendWorkCalendar && weekday !== 0 && weekday !== 6/);
  assert.match(picker, /vacationHolidayBlocked \|\| invalidWeekendWorkDay/);
  assert.match(extract('renderVacationHistory'), /row\.dataset\.vacationStatus = request\.status/);
  const css = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf8');
  assert.match(css, /\.weekend-work-picker \.date-picker-day\.weekend:not\(\.public-holiday\)/);
  assert.match(css, /\.weekend-work-picker \.date-picker-day\.public-holiday\.invalid-weekend-work/);
  assert.match(css, /tr\[data-vacation-status="ODRZUCONY"\] \.vacation-history-days strong/);
});

test('Saturday and weekend compensation share a day tone, while pending requests differ from approved', () => {
  const history = extract('renderVacationHistory');
  assert.match(history, /request\.type === "ZA SOBOTĘ" \|\| request\.type === "ZA WEEKEND"/);
  assert.match(history, /"vacation-days-not-deducted", isCompensatoryTime \|\| vacationTypeUsesHours/);
  const css = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf8');
  assert.match(css, /tr\[data-vacation-status="OCZEKUJE"\] \.vacation-history-days strong/);
  assert.match(css, /tr\[data-vacation-status="ODRZUCONY"\] \.vacation-history-days strong/);
});

test('offer notes appear on the printout and survive a history round trip', () => {
  const offerView = html.slice(html.indexOf('id="pricingOfferView"'), html.indexOf('id="pricingLoanView"'));
  assert.match(offerView, /id="offerNotesInput"[^>]*maxlength="300"/);
  assert.match(offerView, /id="offerNotesPrint"[^>]*hidden/);
  assert.match(offerView, /id="offerNotesText"/);

  const context = {
    isoDateForSave: value => value || '',
    normalizeLoanHistoryText: value => String(value || '').trim(),
    normalizePricingOfferHistoryItem: item => item,
    pricingOfferHistoryPatientGroup: () => 'adult',
    titleCaseName: value => value,
    normalizeDocumentLocationValue: value => value,
    makeId: () => 'new-id'
  };
  vm.runInNewContext(extract('pricingOfferHistoryEntryHasContent') + extract('normalizePricingOfferHistoryEntry'), context);
  const saved = context.normalizePricingOfferHistoryEntry({
    id: 'offer-1', customer: 'Jan Testowy', notes: '  Dopasować kolor\nOdbiór po telefonie  ', items: []
  });
  assert.equal(saved.notes, 'Dopasować kolor\nOdbiór po telefonie');
  assert.equal(context.normalizePricingOfferHistoryEntry({ id: 'offer-2', customer: 'Jan Testowy' }).notes, '');

  assert.match(extract('currentPricingOfferSnapshot'), /notes: offerNotesInput\?\.value\.trim\(\)/);
  assert.match(extract('restorePricingOfferFromHistory'), /offerNotesInput\.value = saved\.notes/);
  assert.match(source, /appendPricingHistoryPreviewField\(summary, "Uwagi", saved\.notes\)/);
  assert.match(extract('renderPricingOffer'), /offerNotesPrint\.hidden = !notes/);
  assert.match(extract('renderPricingOffer'), /offerNotesText\.textContent = notes/);
});

test('vacation follows pricing as a separate shortcut with the correct pressed state', () => {
  assert.match(html, /<\/div>\s*<button[^>]*data-notebook="pricing">\s*Cennik\s*<\/button>\s*<button[^>]*aria-pressed="false"[^>]*data-notebook="vacation" data-private-shared hidden>Urlop<\/button>/);
  const ctx = setup();
  const pricing = ctx.notebookSwitchButtons.find(button => button.dataset.notebook === 'pricing');
  const vacation = ctx.notebookSwitchButtons.find(button => button.dataset.notebook === 'vacation');
  for (const button of [pricing, vacation]) button.classList.toggle('notebook-shortcut', true);
  ctx.switchNotebook('vacation');
  assert.equal(vacation.attributes['aria-pressed'], 'true');
  assert.equal(pricing.attributes['aria-pressed'], 'false');
  ctx.switchNotebook('pricing');
  assert.equal(vacation.attributes['aria-pressed'], 'false');
  assert.equal(pricing.attributes['aria-pressed'], 'true');
});
