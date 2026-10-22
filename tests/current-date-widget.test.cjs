const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
test('Offline forms launcher has one fixed small position outside header layout', () => {
  const offline = fs.readFileSync(path.join(root, 'offline-forms.js'), 'utf8');
  assert.match(offline, /launcher\.id = "offlineFormsLauncher";/);
  assert.match(offline, /document\.body\.append\(launcher\);/);
  assert.match(offline, /authLauncher\.removeAttribute\("id"\);/);
  assert.doesNotMatch(offline, /top-panel.*append\(launcher\)/);
  assert.match(css, /#offlineFormsLauncher \{ position: fixed; left: 14px; bottom: 14px;/);
  assert.match(css, /\.offline-launch \{[^}]*min-height: 27px;[^}]*font-size: 0\.7rem;/);
  assert.match(css, /body\.offline-form-mode #offlineFormsLauncher \{ display: none !important;/);
});
test('Header reserves a stable calendar slot independent of statistics and title width', () => {
  assert.match(css, /\.top-panel\s*\{[^}]*display: grid;[^}]*grid-template-columns: minmax\(0, 1fr\) 158px minmax\(0, 1fr\);/);
  assert.match(css, /\.current-date-widget\s*\{[^}]*grid-column: 2;[^}]*grid-row: 1;[^}]*width: 158px;/);
  assert.match(css, /html \{ scrollbar-gutter: stable; \}/);
  assert.match(css, /\.top-panel \.stats \{ grid-column: 1 \/ -1; grid-row: 2;/);
});
function extract(name) {
  const start = js.indexOf(`function ${name}(`);
  assert.ok(start >= 0, name);
  return js.slice(start, js.indexOf('\nfunction ', start + 1));
}
test('Current date widget is shared by every notebook and updates automatically', () => {
  const widget = html.match(/<div id="currentDateWidget"[\s\S]*?<\/div>\s*<\/div>/)?.[0] || '';
  assert.match(widget, /id="currentDateButton"/);
  assert.match(widget, /id="currentDateValue"/);
  assert.match(widget, /id="currentDateCalendar"[^>]*role="dialog"/);
  assert.ok(html.indexOf('id="currentDateWidget"') < html.indexOf('class="top-switch-row"'));
  assert.match(js, /setupCurrentDateWidget\(\);/);
  assert.match(js, /function currentDateUpcomingEvents\(/);
  assert.match(js, /"Koniec umowy"/);
  assert.match(js, /"Zwrot Demo do producenta"/);
  assert.match(js, /"Początek urlopu"/);
  assert.match(js, /setInterval\(refreshCurrentDateWidget, 60 \* 1000\)/);
  assert.match(js, /visibilityState === "visible"[\s\S]*?refreshCurrentDateWidget\(\)/);
  assert.match(css, /\.current-date-calendar-grid\s*\{[^}]*grid-template-columns: repeat\(7, 1fr\)/);
  assert.match(css, /\.current-date-calendar-grid \.today\s*\{/);
});

test('Calendar keeps known workstation with loan, Demo and vacation events', () => {
  const context = vm.createContext({
    isoDateFromParts: (year, month, day) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    addDaysToIsoDate: (iso, days) => { const date = new Date(`${iso}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10); },
    isoDateForSave: value => String(value || '').slice(0, 10),
    documentLocationKey: value => value === 'Traugutta 12' ? 'T12' : '',
    normalizePricingLoanHistory: entries => entries,
    hasLoanDeviceData: device => Boolean(device?.model),
    normalizeDemoPurpose: value => value,
    vacationTypeUsesHours: () => false,
    formatDate: value => value,
    pricingLoanHistory: [
      { id: 'loan', customer: 'Jan Kowalski', city: 'Traugutta 12', periodTo: '2026-09-30', rightDevice: { side: 'prawe', model: 'Model P' }, leftDevice: {} },
      { id: 'unknown', customer: 'Anna Nowak', periodTo: '2026-10-01', rightDevice: { side: 'prawe', model: 'Model L' }, leftDevice: {} }
    ],
    demoRecords: [{ id: 'demo', currentUser: 'Maria Testowa', deviceName: 'Demo 1', location: 'P63_gabinet' }],
    demoDerived: new Map([['demo', { returnDeadline: '2026-10-02', returnSource: 'loan' }]]),
    vacationEmployees: [{ id: 'employee', workstation: 'P50' }],
    vacationRequests: [{ id: 'leave', employeeId: 'employee', employeeName: 'Iwona Testowa', status: 'ZATWIERDZONY', dateFrom: '2026-10-03', dateTo: '2026-10-03' }]
  });
  for (const name of ['currentDateLocationKey', 'currentDateEventDetail', 'currentDateUpcomingEvents']) vm.runInContext(extract(name), context);
  const events = context.currentDateUpcomingEvents(new Date(2026, 8, 29), 7);
  assert.equal(events.get('2026-09-30')[0].location, 'T12');
  assert.equal(events.get('2026-10-01')[0].location, '');
  assert.equal(events.get('2026-10-02')[0].location, 'P63');
  assert.equal(events.get('2026-10-03')[0].location, 'P50');
  assert.match(context.currentDateEventDetail(events.get('2026-09-30')[0]), /Jan Kowalski\nMiejsce: T12\nP:/);
  assert.doesNotMatch(context.currentDateEventDetail(events.get('2026-10-01')[0]), /Miejsce:/);
  assert.match(css, /\.current-date-event-location\[data-location-tone="P63"\]/);
  context.demoRecords.push(
    {id: 'overdue', currentUser: 'Osoba Testowa', deviceName: 'Zaległy model', location: 'P63'},
    {id: 'client-returned', deviceName: 'Po zwrocie klienta', location: 'P50'}
  );
  context.demoDerived.set('overdue', {status: 'WYPOŻYCZONY', returnSource: 'loan', returnDeadline: '2026-09-20',
    manufacturerReturn: {returnSource: 'manufacturer', returnDeadline: '2026-09-25'}});
  context.demoDerived.set('client-returned', {status: 'ZWRÓCONO', returnSource: 'returned', returnDeadline: '2026-09-25',
    manufacturerReturn: {returnSource: 'manufacturer', returnDeadline: '2026-10-03'}});
  const complete = context.currentDateUpcomingEvents(new Date(2026, 8, 29), 7);
  const overdueEvents = complete.get('2026-09-29');
  assert.equal(overdueEvents.length, 2);
  assert.ok(overdueEvents.every(event => event.label.includes('po terminie')));
  assert.match(overdueEvents.find(event => event.kind === 'demo-client').detail, /Termin zwrotu: 2026-09-20/);
  assert.ok(complete.get('2026-10-03').some(event => event.kind === 'demo-manufacturer' && event.location === 'P50'),
    'a client return must not hide a still-pending manufacturer return');
  context.demoDerived.set('overdue', {returnSource: 'manufacturer', returnDeadline: '2026-10-03',
    manufacturerReturn: {returnSource: 'manufacturer', returnDeadline: '2026-10-03'}});
  const deduped = context.currentDateUpcomingEvents(new Date(2026, 8, 29), 7).get('2026-10-03');
  assert.equal(deduped.filter(event => event.summary === 'Zaległy model').length, 1);
  context.demoDerived.set('overdue', {status: 'WYPOŻYCZONY', returnSource: 'loan', returnDeadline: '2026-09-20'});
  const wholeMonth = context.currentDateUpcomingEvents(new Date(2026, 8, 1), 45, new Date(2026, 8, 29));
  assert.ok(wholeMonth.get('2026-09-29').some(event => event.label.includes('po terminie')),
    'the header loads from the first day of the month but overdue returns belong to today');
});

test('return popup is disabled independently of hourly storage while calendar events remain enabled', () => {
  const ctx = vm.createContext({});
  vm.runInContext(extract('canShowDemoReturnReminder'), ctx);
  assert.equal(ctx.canShowDemoReturnReminder(), false);
  assert.match(extract('showDemoReturnReminder'), /!canShowDemoReturnReminder\(\)/);
  assert.match(extract('refreshDemoReturnReminders'), /rebuildDemoDerivedData\(\)/);
});

test('Header calendar limits clinic workstations and gives ML all events with a filter', () => {
  const state = { workstation: 'P63_gabinet', owner: false };
  const context = vm.createContext({
    normalizeWorkstationName: value => String(value || '').trim(),
    currentWorkstationName: () => state.workstation,
    canViewPrivateModules: () => state.owner,
    currentDateLocationFilter: 'ALL',
    currentDateLocationKey: value => String(value).match(/T12|P50|P63/u)?.[0] || ''
  });
  for (const name of ['currentDateEventScope', 'filterCurrentDateEvents']) vm.runInContext(extract(name), context);
  assert.equal(context.currentDateEventScope().location, 'P63');
  state.workstation = 'P50_badania';
  assert.equal(context.currentDateEventScope().location, 'P50');
  state.workstation = 'T12';
  assert.equal(context.currentDateEventScope().location, 'T12');
  state.workstation = 'ML';
  assert.equal(context.currentDateEventScope().location, 'NONE');
  state.owner = true;
  assert.equal(context.currentDateEventScope().location, 'ALL');
  context.currentDateLocationFilter = 'P50';
  assert.equal(context.currentDateEventScope().location, 'P50');

  const events = new Map([['2026-10-02', [
    { location: 'P63', label: 'Umowa' },
    { location: 'P50', label: 'Demo' },
    { location: '', label: 'Bez miejsca' }
  ]]]);
  assert.equal(context.filterCurrentDateEvents(events, 'ALL').get('2026-10-02').length, 3);
  assert.equal(context.filterCurrentDateEvents(events, 'P63').get('2026-10-02')[0].label, 'Umowa');
  assert.equal(context.filterCurrentDateEvents(events, 'UNASSIGNED').get('2026-10-02')[0].label, 'Bez miejsca');
  assert.equal(context.filterCurrentDateEvents(events, 'NONE').size, 0);
  assert.match(extract('createCurrentDateCalendar'), /filterCurrentDateEvents\(currentDateUpcomingEvents\(range\.firstDay, range\.rangeDays, date\), scope\.location\)/);
  assert.match(extract('createCurrentDateCalendar'), /\["UNASSIGNED", "Bez miejsca"\]/);
});

test('Header calendar can browse complete months across year boundaries', () => {
  const context = vm.createContext({
    isoDateFromParts: (year, month, day) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  });
  for (const name of ['offsetCurrentDateMonth', 'currentDateCalendarRange']) vm.runInContext(extract(name), context);
  assert.equal(context.offsetCurrentDateMonth('2026-12', 1), '2027-01');
  assert.equal(context.offsetCurrentDateMonth('2026-01', -1), '2025-12');
  const otherMonth = context.currentDateCalendarRange(new Date(2026, 9, 2), '2026-02');
  assert.equal(otherMonth.days, 28);
  assert.equal(otherMonth.rangeDays, 27);
  assert.equal(otherMonth.isCurrentMonth, false);
  const currentMonth = context.currentDateCalendarRange(new Date(2026, 9, 2), '2026-10');
  assert.equal(currentMonth.days, 31);
  assert.equal(currentMonth.rangeDays, 46);
  assert.equal(currentMonth.isCurrentMonth, true);
  assert.match(extract('createCurrentDateCalendar'), /currentDateUpcomingEvents\(range\.firstDay, range\.rangeDays, date\)/);
  assert.match(extract('createCurrentDateCalendar'), /Poprzedni miesiąc/);
  assert.match(extract('createCurrentDateCalendar'), /Następny miesiąc/);
  assert.match(extract('createCurrentDateCalendar'), /Wydarzenia w miesiącu/);
  assert.match(extract('setupCurrentDateWidget'), /currentDateViewedMonth = ""/);
  assert.match(css, /\.current-date-calendar-navigation\s*\{/);
});
