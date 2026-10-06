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
  for (const name of ['hideWorkTimeHourlyPreview', 'hideVacationPeriodPreview', 'updateCustomerRelationsPanelVisibility', 'renderCustomerRelations', 'setCurrentYearTitle',
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
test('work time is visible only to SATIS, including navigation and record loading', () => {
  const ctx = setup();
  ctx.switchNotebook('workTime');
  assert.equal(ctx.activeNotebook, 'workTime');
  assert.equal(ctx.notebookSections.find(n => n.id === 'workTimeNotebook').hidden, false);
  assert.equal(ctx.renderCounts.loadWorkTimeRecords, 1);
  ctx.owner = false;
  ctx.switchNotebook('devices');
  ctx.switchNotebook('workTime');
  assert.equal(ctx.activeNotebook, 'devices');
  assert.equal(ctx.notebookSections.find(n => n.id === 'workTimeNotebook').hidden, true);
  assert.equal(ctx.renderCounts.loadWorkTimeRecords, 1);
  assert.match(html, /data-notebook="workTime" data-private-owner/);
  assert.match(extract('loadWorkTimeRecords'), /if \(!currentSupabaseUser \|\| !canViewPrivateModules\(\)\) return/);
  const migration = fs.readFileSync(path.join(__dirname, '../supabase-work-time.sql'), 'utf8');
  assert.match(migration, /alter table public\.work_time_records enable row level security/i);
  assert.match(migration, /using \(public\.is_satis_owner\(\)\)/i);
  assert.match(migration, /revoke all on public\.work_time_records from public, anon, authenticated/i);
  assert.match(migration, /work_time_record_history/i);
  const pinMigration = fs.readFileSync(path.join(__dirname, '../supabase-work-time-pin.sql'), 'utf8');
  assert.match(pinMigration, /private\.work_time_employee_pins/);
  assert.match(pinMigration, /extensions\.crypt\(p_pin/);
  assert.match(pinMigration, /failed_attempts >= 5|v_attempts >= 5/);
  assert.match(pinMigration, /public\.is_satis_owner\(\)/);
  assert.match(pinMigration, /public\.is_satis_app_user\(\)/);
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
    secondStart: '13:00', secondEnd: '17:00', workMinutes: 480, hours: 8, overtime: 0};
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
    workTimeScheduleForDate: () => ({start: '08:00', end: '16:00', off: false, validFrom: '2026-01-01'}),
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
  assert.equal(saved[0].record.payload.plannedEnd, undefined);
  assert.equal(saved[0].record.payload.workMinutes, 0);
  assert.equal(saved[0].record.payload.schedule.start, '08:00');
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
test('gabinet saves only through the PIN-gated RPC for the selected worker', async () => {
  const calls = [];
  const ctx = vm.createContext({
    canViewPrivateModules: () => false, currentSupabaseUser: {id: 'gabinet'}, hasSupabaseConfig: true,
    workTimeStoreReady: true, workTimeEditingKey: '', workTimeRecords: [],
    workTimeFields: {Employee: {value: 'e1'}, Month: {value: '2026-10'}},
    workTimePinInput: {value: '381927'},
    vacationEmployees: [{id: 'e1', name: 'Oliwia Piecha', year: 2026, redacted: true}],
    workTimeSaveBtn: {disabled: false}, workTimeStartSaveBtn: {disabled: false},
    supabaseClient: {rpc: async (name, args) => {calls.push({name, args}); return {data: {ok: true}, error: null};}},
    workTimeDraft: () => ({date: '2026-10-06', kind: 'WORK', start: '08:00', end: '',
      secondStart: '', secondEnd: '', workMinutes: 0, hours: 0, overtime: 0}),
    todayInputValue: () => '2026-10-06', validateWorkTimeDraft: () => '',
    workTimeSetMessage: () => {}, workTimeResetForm: () => {}, loadWorkTimeRecords: async () => {}, Date
  });
  vm.runInContext(extract('saveWorkTimeRecord'), ctx);
  await ctx.saveWorkTimeRecord({preventDefault() {}}, {startOnly: true});
  assert.equal(calls.length, 1);
  assert.equal(calls[0].name, 'work_time_write_person');
  assert.equal(calls[0].args.p_employee_id, 'e1');
  assert.equal(calls[0].args.p_pin, '381927');
  assert.equal(calls[0].args.p_end, null);
});
test('work time suggests only the requested hours for each editable field', () => {
  const start = html.match(/id="workTimeStartSuggestions"[\s\S]*?<\/div>/)?.[0] || '';
  const end = html.match(/id="workTimeEndSuggestions"[\s\S]*?<\/div>/)?.[0] || '';
  assert.deepEqual([...start.matchAll(/data-time="([0-9:]+)"/g)].map(match => match[1]),
    ['07:00', '08:00', '09:00', '10:00', '11:00']);
  assert.deepEqual([...end.matchAll(/data-time="([0-9:]+)"/g)].map(match => match[1]),
    ['14:00', '15:00', '16:00', '17:00']);
  assert.match(html, /id="workTimeStartInput" type="time"/);
  assert.match(html, /id="workTimeEndInput" type="time"/);
  assert.doesNotMatch(html, /workTimePresetButtons|workTimePlannedEndInput/);
  const menus = {Start: {hidden: true}, End: {hidden: true}};
  const ctx = vm.createContext({workTimeTimeSuggestions: menus});
  vm.runInContext(extract('workTimeHideTimeSuggestions') + extract('workTimeShowTimeSuggestions'), ctx);
  ctx.workTimeShowTimeSuggestions('Start');
  assert.equal(menus.Start.hidden, false);
  assert.equal(menus.End.hidden, true);
  ctx.workTimeShowTimeSuggestions('End');
  assert.equal(menus.Start.hidden, true);
  assert.equal(menus.End.hidden, false);
  ctx.workTimeHideTimeSuggestions();
  assert.equal(menus.End.hidden, true);
});
test('schedule comparison distinguishes matching hours, lateness, excess, unfinished and short days', () => {
  const ctx = vm.createContext({});
  for (const name of ['workTimeIntervalMinutes', 'workTimeCalculatedMinutes', 'workTimeScheduleComparison']) {
    vm.runInContext(extract(name), ctx);
  }
  const plan = {start: '08:00', end: '16:00', off: false};
  const compare = (start, end, extra = {}, schedule = plan) => ctx.workTimeScheduleComparison(
    {payload: {kind: 'WORK', start, end, ...extra}}, schedule);
  assert.equal(compare('08:00', '16:00').tones.join(','), 'match');
  assert.equal(compare('08:10', '16:00').tones.join(','), 'late');
  assert.match(compare('08:10', '16:00').label, /10 min/);
  assert.equal(compare('08:00', '17:00').tones.join(','), 'extra');
  assert.equal(compare('08:10', '17:00').tones.join(','), 'late,extra');
  assert.match(compare('08:10', '17:00').label, /60 min/);
  assert.equal(compare('08:00', '').tones.length, 0);
  assert.equal(compare('08:10', '').tones.join(','), 'late');
  assert.equal(compare('08:00', '15:00').tones.join(','), 'difference');
  assert.equal(compare('08:00', '12:00', {secondStart: '13:00', secondEnd: '17:00'}).tones.join(','), 'extra');
  assert.equal(compare('08:00', '16:00', {}, null).tones.length, 0);
  assert.equal(compare('08:00', '10:00', {}, {off: true}).tones.join(','), 'extra');
});
test('effective schedule versions and holidays determine the plan without altering saved snapshots', () => {
  const versions = [{from: '2026-01-01', days: {2: {start: '08:00', end: '16:00'}}},
    {from: '2026-10-01', days: {2: {start: '09:00', end: '17:00'}}}];
  const ctx = vm.createContext({Date, workTimeSchedulesForEmployee: () => versions,
    polishPublicHolidayOnDate: date => date === '2026-12-25'});
  vm.runInContext(extract('workTimeScheduleForDate'), ctx);
  assert.equal(ctx.workTimeScheduleForDate('e1', '2026-09-29').start, '08:00');
  const snapshot = ctx.workTimeScheduleForDate('e1', '2026-10-06');
  assert.equal(snapshot.start, '09:00');
  versions[1].days[2].start = '10:00';
  assert.equal(snapshot.start, '09:00');
  assert.equal(ctx.workTimeScheduleForDate('e1', '2026-12-25').off, true);
  assert.equal(ctx.workTimeScheduleForDate('e1', '2025-12-30'), null);
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
test('work-time month choices use Polish names and preserve machine-readable values', () => {
  const ctx = vm.createContext({});
  vm.runInContext(extract('workTimeMonthOptions'), ctx);
  const options = ctx.workTimeMonthOptions(2026);
  assert.equal(options.length, 72);
  assert.equal(options.find(item => item.value === '2026-09').label, 'Wrzesień 2026');
  assert.equal(options.find(item => item.value === '2030-12').label, 'Grudzień 2030');
  assert.match(html, /<select id="workTimeMonthInput"/);
});

test('employee summaries show only missing or irregular work, not future days or off days', () => {
  const ctx = vm.createContext({Date, polishPublicHolidayOnDate: () => false, vacationWorkingDays: () => 1});
  for (const name of ['workTimeMonthBounds', 'workTimeIntervalMinutes', 'workTimeCalculatedMinutes',
    'workTimeScheduleComparison', 'workTimeApprovedLeave', 'workTimeEmployeeIssues']) vm.runInContext(extract(name), ctx);
  const days = {1: {start: '08:00', end: '16:00'}, 2: {start: '08:00', end: '16:00'},
    3: {start: '08:00', end: '16:00'}, 4: {start: '08:00', end: '16:00'}, 5: {start: '08:00', end: '16:00'}};
  const schedules = [{from: '2026-09-01', days}];
  const record = (date, start = '08:00', end = '16:00') => ({employee_id: 'a', work_date: date, payload: {kind: 'WORK', start, end}});
  assert.equal(ctx.workTimeEmployeeIssues('a', '2026-09', null, schedules, '2026-09-04').length, 0);
  assert.equal(ctx.workTimeEmployeeIssues('a', '2026-09', [record('2026-09-01')], schedules, '2026-09-02').length, 0);
  const issues = Array.from(ctx.workTimeEmployeeIssues('a', '2026-09', [record('2026-09-01', '08:15'), record('2026-09-02', '08:00', '')], schedules, '2026-09-04'));
  assert.deepEqual(issues, ['Brak wpisu: 1', 'Brak wyjścia: 1', 'Spóźnienia: 15 min']);
  assert.deepEqual(Array.from(ctx.workTimeEmployeeIssues('a', '2026-11', [], schedules, '2026-09-04')), []);
  assert.deepEqual(Array.from(ctx.workTimeEmployeeIssues('a', '2026-09', [], [], '2026-09-04')), ['Brak grafiku']);
  assert.deepEqual(Array.from(ctx.workTimeEmployeeIssues('a', '2026-09', [], schedules, '2026-10-06')), ['Brak wpisu: 22']);
  const leave = {employeeId: 'a', dateFrom: '2026-09-03', dateTo: '2026-09-03', type: 'WYPOCZYNKOWY', status: 'ZATWIERDZONY'};
  const regular = [record('2026-09-01'), record('2026-09-02')];
  assert.deepEqual(Array.from(ctx.workTimeEmployeeIssues('a', '2026-09', regular, schedules, '2026-09-04', [leave])), []);
  assert.deepEqual(Array.from(ctx.workTimeEmployeeIssues('a', '2026-09', regular, schedules, '2026-09-04', [{...leave, status: 'OCZEKUJE'}])), ['Brak wpisu: 1']);
  assert.deepEqual(Array.from(ctx.workTimeEmployeeIssues('a', '2026-09', regular, schedules, '2026-09-04', [{...leave, hours: 4}])), ['Brak wpisu: 1']);
  const monthTotals = Array.from(ctx.workTimeEmployeeIssues('a', '2026-09', [record('2026-09-01', '08:15', '17:00'), record('2026-09-02', '08:10', '16:30'), record('2026-08-31', '09:00', '18:00')], schedules, '2026-09-03'));
  assert.deepEqual(monthTotals, ['Spóźnienia: 25 min', 'Nadprogramowo: 90 min']);
  ctx.polishPublicHolidayOnDate = date => date === '2026-09-03';
  assert.deepEqual(Array.from(ctx.workTimeEmployeeIssues('a', '2026-09', [record('2026-09-01'), record('2026-09-02')], schedules, '2026-09-04')), []);
});

test('hourly bars split late, scheduled and additional time without counting gaps as work', () => {
  const ctx = vm.createContext({});
  vm.runInContext(extract('workTimeHourlySegments'), ctx);
  const plan = {start: '08:00', end: '16:00', off: false};
  const segments = (data, schedule = plan) => JSON.parse(JSON.stringify(ctx.workTimeHourlySegments({kind: 'WORK', ...data}, schedule)));
  assert.deepEqual(segments({start: '08:00', end: '16:00'}), [{from: 480, to: 960, tone: 'match'}]);
  assert.deepEqual(segments({start: '08:15', end: '17:00'}), [
    {from: 480, to: 495, tone: 'late'}, {from: 495, to: 960, tone: 'match'}, {from: 960, to: 1020, tone: 'extra'}]);
  assert.deepEqual(segments({start: '08:00', end: '12:00', secondStart: '13:00', secondEnd: '16:00'}), [
    {from: 480, to: 720, tone: 'match'}, {from: 780, to: 960, tone: 'match'}]);
  assert.deepEqual(segments({start: '08:00', end: ''}), []);
  assert.deepEqual(segments({start: '16:00', end: '08:00'}), []);
  assert.equal(segments({start: '08:00', end: '16:00'}, null)[0].tone, 'difference');
  assert.equal(segments({start: '08:00', end: '16:00'}, {off: true})[0].tone, 'extra');
});

test('hourly display focuses on working hours and the information column shows only deviations', () => {
  const ctx = vm.createContext({});
  for (const name of ['workTimeHourlyRange', 'workTimeDeviationText', 'workTimeIntervalMinutes',
    'workTimeCalculatedMinutes', 'workTimeScheduleComparison']) vm.runInContext(extract(name), ctx);
  const range = ctx.workTimeHourlyRange([{from: 480, to: 960}]);
  assert.equal(range.from, 360);
  assert.equal(range.to, 1080);
  const wide = ctx.workTimeHourlyRange([{from: 30, to: 1410}]);
  assert.equal(wide.from, 0);
  assert.equal(wide.to, 1440);
  const plan = {start: '08:00', end: '16:00'};
  const record = (start, end) => ({payload: {kind: 'WORK', start, end}});
  assert.equal(ctx.workTimeDeviationText(record('08:00', '16:00'), plan), '');
  assert.equal(ctx.workTimeDeviationText(record('08:00', ''), plan), '');
  assert.equal(ctx.workTimeDeviationText(record('08:00', '16:00'), null), '');
  assert.match(ctx.workTimeDeviationText(record('08:15', '16:00'), plan), /Spóźnienie: 15 min/);
  assert.match(ctx.workTimeDeviationText(record('08:00', '17:00'), plan), /Ponad grafik: 60 min/);
  assert.match(html, /<th>Poza grafikiem<\/th>/);
  assert.doesNotMatch(extract('renderWorkTimeRecords'), /toLocaleString/);
  assert.match(extract('renderWorkTimeRecords'), /row\.cells\[4\]\.replaceChildren\(hourly\)/);
  assert.doesNotMatch(extract('workTimeHourlyView'), /work-time-hourly-axis|work-time-hourly-legend|createElement\("details"\)/);
  assert.match(extract('workTimeHourlyView'), /bar\.title =/);
});

test('work-time duration is emphasized by the deviation and the hourly preview opens on hover and focus', () => {
  const ctx = vm.createContext({});
  for (const name of ['workTimeDurationTone', 'workTimeIntervalMinutes', 'workTimeCalculatedMinutes',
    'workTimeScheduleComparison']) vm.runInContext(extract(name), ctx);
  const plan = {start: '08:00', end: '16:00'};
  const record = (start, end, date = '2026-10-05') => ({work_date: date, payload: {kind: 'WORK', start, end}});
  assert.equal(ctx.workTimeDurationTone(record('08:00', '16:00'), plan, '2026-10-06'), '');
  assert.equal(ctx.workTimeDurationTone(record('08:15', '16:00'), plan, '2026-10-06'), 'late');
  assert.equal(ctx.workTimeDurationTone(record('08:00', '17:00'), plan, '2026-10-06'), 'extra');
  assert.equal(ctx.workTimeDurationTone(record('08:00', ''), plan, '2026-10-06'), 'missing');
  assert.equal(ctx.workTimeDurationTone(record('08:00', '', '2026-10-06'), plan, '2026-10-06'), '');
  const view = extract('workTimeHourlyView');
  assert.match(view, /addEventListener\("mouseenter", show\)/);
  assert.match(view, /addEventListener\("focus", show\)/);
  assert.match(extract('showWorkTimeHourlyPreview'), /document\.body\.append\(panel\)/);
  assert.match(extract('showWorkTimeHourlyPreview'), /window\.innerHeight/);
});

test('copying a schedule day updates only chosen fields and requires explicit save', () => {
  const row = (day, working, start, end) => {
    const fields = { 'input[type="checkbox"]': {checked: working}, '[data-time-field="start"]': {value: start}, '[data-time-field="end"]': {value: end} };
    return {dataset: {day}, fields, querySelector: selector => fields[selector]};
  };
  const days = [row('1', true, '08:00', '16:00'), row('2', false, '', ''), row('6', false, '', '')];
  const ctx = vm.createContext({canViewPrivateModules: () => true, workTimeExamplesActive: false,
    workTimeScheduleDays: {children: days}, workTimeScheduleMessage: {textContent: ''}});
  for (const name of ['workTimeIntervalMinutes', 'workTimeCopyScheduleDay']) vm.runInContext(extract(name), ctx);
  ctx.workTimeCopyScheduleDay('1', 'weekdays');
  assert.equal(days[1].fields['[data-time-field="start"]'].value, '08:00');
  assert.equal(days[1].fields['input[type="checkbox"]'].checked, true);
  assert.equal(days[2].fields['input[type="checkbox"]'].checked, false);
  assert.match(ctx.workTimeScheduleMessage.textContent, /Zapisz grafik/);
  ctx.workTimeExamplesActive = true;
  ctx.workTimeCopyScheduleDay('1', '6');
  assert.equal(days[2].fields['input[type="checkbox"]'].checked, false);
  ctx.workTimeExamplesActive = false;
  ctx.workTimeCopyScheduleDay('1', '6');
  assert.equal(days[2].fields['[data-time-field="end"]'].value, '16:00');
});

test('September examples contain normal, late and extra work without creating official entries', () => {
  const ctx = vm.createContext({Date});
  for (const name of ['workTimeExampleSchedule', 'workTimeExampleRecords', 'workTimeIntervalMinutes',
    'workTimeCalculatedMinutes', 'workTimeScheduleComparison']) vm.runInContext(extract(name), ctx);
  for (const name of ['Oliwia Piecha', 'Justyna Testowa', 'Iwona Testowa']) {
    const rows = ctx.workTimeExampleRecords({id: name, name});
    assert.equal(rows.length, 22);
    assert.equal(rows[0].work_date, '2026-09-30');
    assert.ok(rows.every(row => row.example && row.work_date.startsWith('2026-09-')));
    const tones = day => Array.from(ctx.workTimeScheduleComparison(
      rows.find(row => row.work_date === `2026-09-${day}`),
      rows.find(row => row.work_date === `2026-09-${day}`).payload.schedule).tones);
    assert.deepEqual(tones('01'), ['match']);
    assert.deepEqual(tones('03'), ['late']);
    assert.deepEqual(tones('08'), ['extra']);
    assert.deepEqual(tones('24'), ['late', 'extra']);
  }
  assert.equal(ctx.workTimeExampleRecords(null).length, 0);
  const loader = extract('loadWorkTimeRecords');
  assert.ok(loader.indexOf('workTimeExamplesActive') < loader.indexOf('supabaseClient.from'));
  assert.match(extract('renderWorkTimeRecords'), /if \(record.example\)/);
  assert.match(extract('saveWorkTimeSchedule'), /if \(workTimeExamplesActive\) return/);
});
