const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
function extract(name) {
  const start = source.search(new RegExp(`^(?:async )?function ${name}\\(`, 'm'));
  assert.ok(start >= 0, name);
  const rest = source.slice(start);
  return rest.slice(0, rest.slice(1).search(/\n(?:async )?function /) + 1);
}
function setup() {
  const writes = [], alerts = [];
  const node = () => ({value: '', hidden: false, checked: false, dataset: {}, children: [], attributes: {}, events: {},
    classList: {toggle() {}, add() {}}, setAttribute(k, v) {this.attributes[k] = v;},
    getAttribute(k) {return this.attributes[k];}, append(...nodes) {this.children.push(...nodes);},
    addEventListener(k, fn) {this.events[k] = fn;}, focus() {}});
  const employee = {id: 'test', name: 'Test Testowy', year: 2026, unit: 'HOURS'};
  const button = node(); button.dataset.vacationType = 'L4';
  const ctx = vm.createContext({
    owner: true, employee, writes, alerts, button,
    canViewPrivateModules: () => ctx.owner,
    selectedVacationEmployee: () => employee, selectedVacationYear: () => 2026,
    vacationEmployeeUsesHours: e => e?.unit === 'HOURS',
    vacationTypeInput: {value: 'L4'}, vacationTypeChoices: {querySelectorAll: () => [button]},
    vacationDateFromInput: {value: '2026-11-06'}, vacationDateToInput: {value: '2026-11-11'},
    vacationHoursInput: {value: 'invalid stale hours'}, vacationHoursLabel: node(), vacationHoursField: node(),
    vacationOwnerLeaveField: node(), vacationOwnerLeaveInput: {checked: true},
    vacationNotesInput: {value: ''}, vacationSaturdayInput: {value: ''},
    currentSupabaseUser: {id: 'owner', email: 'satis@pracowniasluchu.pl'},
    activeVacationRequestId: '', vacationRequests: [],
    makeId: () => 'l4', titleCaseName: v => v, isoDateForSave: v => v || '',
    normalizeLoanHistoryText: v => v || '', normalizeVacationRequests: v => v,
    parseIsoDate: value => value ? new Date(`${value}T00:00:00`) : null,
    document: {querySelector: () => null, createElement: node},
    formatDate: v => v, displayDateForInput: v => v,
    persistVacationRecord: async (table, data) => writes.push(data),
    SUPABASE_VACATION_REQUEST_TABLE: 'vacation_requests', loadVacationData: {sequence: 0},
    saveLocalVacationData() {}, renderVacationModule() {}, resetVacationForm() {}, scheduleVacationPolling() {},
    alert: v => alerts.push(v),
    isVacationCalendarInput: () => true, vacationOccupiedPeopleOnDate: () => [],
    vacationOwnLeaveOnDate: () => null, vacationSaturdayLinksOnDate: () => [],
    activeDateInput: {value: '', dispatchEvent() {}}, Event: class {}, closeDatePicker() {}
  });
  for (const name of ['vacationTypeUsesHours', 'vacationRequestUsesHours', 'vacationRequestBlocksDay',
    'vacationTypeLabel', 'vacationIsSickLeave', 'vacationShowSickLeave', 'vacationUsesAnnualAllowance',
    'vacationSickLeaveDays', 'normalizeVacationRequest', 'updateVacationUnitFields', 'updateVacationOwnerLeaveField', 'updateVacationTypeChoices',
    'isoDateFromParts', 'addDaysToIsoDate', 'easterSundayIso', 'polishPublicHolidays', 'polishPublicHolidayOnDate',
    'vacationWorkingDays', 'vacationHolidayDateIssue', 'appendDatePickerTitle', 'createDatePickerMonth',
    'submitVacationRequest', 'decideVacationRequest', 'workTimeApprovedLeave']) vm.runInContext(extract(name), ctx);
  return ctx;
}
test('L4 has dates and calendar days, no hours even for hourly employees; no annual-pool deduction', () => {
  const ctx = setup();
  ctx.updateVacationUnitFields(); ctx.updateVacationOwnerLeaveField();
  assert.equal(ctx.vacationHoursField.hidden, true);
  assert.equal(ctx.vacationHoursInput.required, false);
  assert.equal(ctx.vacationHoursInput.disabled, true);
  assert.equal(ctx.vacationOwnerLeaveField.hidden, true);
  assert.equal(ctx.vacationOwnerLeaveInput.checked, false);
  const request = ctx.normalizeVacationRequest({employeeName: 'Test', type: 'L4',
    dateFrom: '2026-11-06', dateTo: '2026-11-11', hours: 99, status: 'ZATWIERDZONY', employeeId: 'test'});
  assert.equal(request.type, 'L4'); assert.equal(request.days, 6); assert.equal(request.hours, 0);
  assert.equal(ctx.vacationRequestUsesHours(request, ctx.employee), false);
  assert.equal(ctx.vacationRequestBlocksDay(request), true);
  assert.equal(ctx.vacationUsesAnnualAllowance(request), false);
  assert.equal(ctx.vacationShowSickLeave(request), true);
  assert.equal(ctx.vacationShowSickLeave({...request, redacted: true}), false);
  assert.equal(ctx.workTimeApprovedLeave('test', '2026-11-06', {start: '08:00', end: '16:00'}, [request]), true);
  ctx.vacationTypeInput.value = 'WYPOCZYNKOWY'; ctx.updateVacationUnitFields();
  assert.equal(ctx.vacationHoursField.hidden, false, 'ordinary hourly leave is unchanged');
  assert.equal(ctx.vacationHoursInput.required, true);
  assert.equal(ctx.vacationHoursInput.disabled, false);
});
test('L4 selection is hidden and reset on gabinet, forged form submission is rejected before write', async () => {
  const ctx = setup(); ctx.updateVacationTypeChoices();
  assert.equal(ctx.button.hidden, false); assert.equal(ctx.button.disabled, false);
  ctx.owner = false; ctx.updateVacationTypeChoices();
  assert.equal(ctx.button.hidden, true); assert.equal(ctx.button.disabled, true);
  assert.equal(ctx.vacationTypeInput.value, 'WYPOCZYNKOWY');
  ctx.vacationTypeInput.value = 'L4'; await ctx.submitVacationRequest();
  assert.equal(ctx.writes.length, 0); assert.match(ctx.alerts[0], /wyłącznie SATIS/);
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert.match(html, /data-vacation-type="L4" data-private-owner hidden/);
});

test('Justyna: L4 history counts working days without hours, yearly tile counts calendar days, including legacy records', () => {
  const ctx = setup();
  ctx.employee.name = 'Justyna Testowa';
  const history = extract('renderVacationHistory');
  const amountBlock = history.slice(history.indexOf('    const daysCell ='), history.indexOf('    row.append(employeeCell'));
  assert.ok(amountBlock.includes('const amount ='));
  ctx.requestEmployee = ctx.employee;
  ctx.canViewDetails = true;
  ctx.formatVacationAmount = String;
  for (const [dateFrom, dateTo, workingDays, calendarDays] of [
    ['2026-11-06', '2026-11-11', 3, 6], ['2026-11-05', '2026-11-05', 1, 1],
    ['2026-03-28', '2026-03-30', 1, 3], ['2026-11-07', '2026-11-08', 0, 2],
    ['2026-11-11', '2026-11-11', 0, 1]
  ]) {
    for (const type of ['INNY', 'WYPOCZYNKOWY', 'NA ŻĄDANIE', 'L4']) {
      const record = ctx.normalizeVacationRequest({employeeName: ctx.employee.name, employeeId: ctx.employee.id,
        dateFrom, dateTo, type, notes: 'L4', hours: 0, status: 'ZATWIERDZONY'});
      ctx.request = record;
      ctx.usesHours = ctx.vacationRequestUsesHours(record, ctx.employee);
      ctx.showSickLeave = ctx.vacationShowSickLeave(record);
      assert.equal(ctx.usesHours, false);
      vm.runInContext(`{ ${amountBlock}\nglobalThis.amountCell = daysCell; }`, ctx);
      assert.equal(ctx.amountCell.children[0].textContent, String(workingDays));
      assert.match(ctx.amountCell.children[0].title, /Dni robocze:/);
      assert.match(ctx.amountCell.children[0].title, /nie pomniejsza urlopu rocznego/);
      assert.equal(ctx.vacationSickLeaveDays(ctx.employee, [record]), calendarDays);
      assert.equal(ctx.vacationUsesAnnualAllowance(record), false);
    }
  }
  assert.equal(ctx.vacationRequestUsesHours({type:'WYPOCZYNKOWY', notes:'bez L4'}, ctx.employee), true);
});
test('SATIS saves L4 without hours across weekends and holidays; duplicates and year boundaries still blocked', async () => {
  const ctx = setup(); await ctx.submitVacationRequest();
  assert.equal(ctx.writes.length, 1); assert.equal(ctx.writes[0].hours, 0);
  assert.equal(ctx.writes[0].days, 6); assert.equal(ctx.writes[0].ownerLeave, false);
  ctx.submitVacationRequest.draft = null; ctx.makeId = () => "duplicate";
  await ctx.submitVacationRequest(); assert.equal(ctx.writes.length, 1);
  assert.match(ctx.alerts.at(-1), /już istnieje/);
  ctx.vacationDateToInput.value = '2027-01-01'; await ctx.submitVacationRequest();
  assert.equal(ctx.writes.length, 1); assert.match(ctx.alerts.at(-1), /jednym roku/);
  ctx.vacationRequests[0].dateTo = '2026-11-11';
  await ctx.decideVacationRequest('l4', 'ZATWIERDZONY');
  assert.equal(ctx.writes.length, 2); assert.equal(ctx.writes[1].status, 'ZATWIERDZONY');
});
test('L4 calendar permits public holidays while ordinary leave keeps its holiday restriction', () => {
  const ctx = setup();
  const days = () => ctx.createDatePickerMonth(new Date(2026, 10, 1), null, new Date(2026, 10, 5)).children[1].children;
  let holiday = days().find(d => d.dataset.value === '2026-11-11');
  assert.equal(holiday.attributes['aria-disabled'], undefined); holiday.events.click();
  assert.equal(ctx.activeDateInput.value, '2026-11-11');
  ctx.vacationTypeInput.value = 'WYPOCZYNKOWY';
  holiday = days().find(d => d.dataset.value === '2026-11-11');
  assert.equal(holiday.attributes['aria-disabled'], 'true');
});

test('yearly L4 counter includes legacy entries, excludes pending/rejected/other people and merges overlapping dates', () => {
  const ctx = setup();
  const record = {employeeId:'test',type:'L4',status:'ZATWIERDZONY',dateFrom:'2026-11-06',dateTo:'2026-11-11'};
  const records = [record, {...record,dateFrom:'2026-11-09',dateTo:'2026-11-12'},
    {...record,type:'INNY',notes:'L4',dateFrom:'2026-11-14',dateTo:'2026-11-15'},
    {...record,status:'OCZEKUJE',dateFrom:'2026-11-16',dateTo:'2026-11-17'},
    {...record,status:'ODRZUCONY',dateFrom:'2026-11-18',dateTo:'2026-11-19'},
    {...record,employeeId:'other',dateFrom:'2026-11-20',dateTo:'2026-11-21'},
    {...record,type:'WYPOCZYNKOWY',dateFrom:'2026-11-22',dateTo:'2026-11-23'},
    {...record,dateFrom:'2025-12-31',dateTo:'2026-01-01'},
    {...record,dateFrom:'2026-12-31',dateTo:'2027-01-01'}];
  assert.equal(ctx.vacationSickLeaveDays(ctx.employee, records), 11);
  assert.equal(ctx.vacationSickLeaveDays(ctx.employee, []), 0);
  ctx.owner = false; assert.equal(ctx.vacationSickLeaveDays(ctx.employee, records), 0);
  const render = extract('renderVacationEmployees');
  assert.match(render, /if \(canViewPrivateModules\(\)\) \{[\s\S]*vacationSickLeaveDays\(employee\)/);
  assert.match(render, /vacation-employee-sick-days/);
});

test('L4 day amount has the same raspberry color as its employee badge and type choice, not the generic olive absence color', () => {
  const css = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf8');
  const selectors = [
    '.vacation-employee-item .vacation-employee-sick-days',
    '.vacation-type-choices button[data-vacation-type="L4"].active',
    '.vacation-history-table tr.vacation-sick-leave:not([data-vacation-status="ODRZUCONY"]) .vacation-history-days strong'
  ];
  for (const selector of selectors) {
    const start = css.indexOf(`${selector} {`);
    assert.ok(start >= 0, selector);
    const block = css.slice(start, css.indexOf('}', start));
    assert.match(block, /color: #8b344b;/);
    assert.match(block, /background: #f9e9ee;/);
  }
  assert.ok(css.indexOf(selectors[2]) > css.indexOf('.vacation-history-table tr[data-vacation-status="OCZEKUJE"] .vacation-history-days strong'));
  assert.match(css, /tr\[data-vacation-status="ODRZUCONY"\] \.vacation-history-days strong \{\s*color: #914d58;/);
});
