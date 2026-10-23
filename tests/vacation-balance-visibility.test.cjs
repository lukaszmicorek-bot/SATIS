const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('app.js', 'utf8');
function extract(name) {
  const start = source.indexOf(`function ${name}(`);
  const rest = source.slice(start);
  return rest.slice(0, rest.slice(1).search(/\n(?:async )?function /) + 1);
}
function setup() {
  const node = () => ({children: [], value: '', textContent: '', hidden: false, dataset: {},
    classList: {toggle() {}}, append(...nodes) {this.children.push(...nodes);},
    replaceChildren(...nodes) {this.children = nodes;}, setAttribute() {}, addEventListener() {}});
  const employees = ['T12','P50','P63'].map((workstation, i) => ({id: String(i), name: `Test ${i}`, year: 2026,
    workstation, redacted: true, remaining: 10 + i, allowance: 26, unit: 'DAYS'}));
  const ctx = vm.createContext({
    owner: false, station: 'P50_gabinet', currentSupabaseUser: {id: 'shared'},
    canViewPrivateModules: () => ctx.owner, currentWorkstationName: () => ctx.station,
    normalizeWorkstationName: value => String(value || ''), normalize: value => String(value || '').toLowerCase(),
    loadVacationData: {access: {userId: 'shared', employeeIds: []}},
    vacationEmployeesForYear: () => employees, vacationMyEmployeeId: () => '',
    vacationEmployeeInput: node(), vacationEmployeeList: node(), vacationSaturdayMarkersDisabled: () => false,
    vacationEmployeeUsesHours: employee => employee?.unit === 'HOURS', formatVacationAmount: String,
    vacationEmployeeUsagePercent: () => 0, selectedVacationEmployee: () => employees.find(e => e.id === ctx.vacationEmployeeInput.value),
    selectedVacationYear: () => 2026, vacationRequests: [], vacationUsesAnnualAllowance: () => true,
    vacationExpectedUsage: () => 10, document: {createElement: node}
  });
  for (const name of ['vacationAllowanceTotal','vacationUsedTotal','vacationRemainingTotal','vacationRemainingCard',
    'vacationPendingTotal','vacationAllowanceUnitLabel','vacationExpectedTotal','vacationPlanLabel','vacationPlanCard']) ctx[name] = node();
  for (const name of ['normalizeVacationEmployeeWorkstation','vacationCanViewBalance','renderVacationEmployees','renderVacationSummary']) {
    vm.runInContext(extract(name), ctx);
  }
  return {ctx, employees};
}
test('gabinet tiles expose balance only for assigned workplace; selecting another hides and clears summary', () => {
  const {ctx} = setup();
  ctx.renderVacationEmployees();
  assert.equal(ctx.vacationEmployeeInput.value, '1');
  const buttons = ctx.vacationEmployeeList.children.map(entry => entry.children[0]);
  assert.ok(!buttons[0].children.some(child => child.className === 'vacation-employee-allowance'));
  assert.ok(buttons[1].children.some(child => child.textContent === 'Pozostało: 11 dni'));
  assert.ok(!buttons[2].children.some(child => child.className === 'vacation-employee-allowance'));
  ctx.renderVacationSummary();
  assert.equal(ctx.vacationRemainingCard.hidden, false);
  assert.equal(ctx.vacationRemainingTotal.textContent, '11');
  ctx.vacationEmployeeInput.value = '2';
  ctx.renderVacationSummary();
  assert.equal(ctx.vacationRemainingCard.hidden, true);
  assert.equal(ctx.vacationRemainingTotal.textContent, '-');
  assert.equal(ctx.vacationAllowanceTotal.textContent, '-');
});
test('SATIS keeps all balances; personal mapping overrides workplace; unknown, ambiguous and stale access fail closed', () => {
  const {ctx, employees} = setup();
  ctx.owner = true;
  assert.ok(employees.every(ctx.vacationCanViewBalance));
  ctx.owner = false;
  ctx.loadVacationData.access.employeeIds = ['2'];
  assert.equal(ctx.vacationCanViewBalance(employees[1]), false);
  assert.equal(ctx.vacationCanViewBalance(employees[2]), true);
  ctx.loadVacationData.access.employeeIds = [];
  for (const station of ['', 'Nie ustawiono', 'P50-P63']) {
    ctx.station = station;
    assert.ok(employees.every(e => !ctx.vacationCanViewBalance(e)));
  }
  ctx.station = 'T12_gabinet';
  assert.equal(ctx.vacationCanViewBalance(employees[0]), true);
  ctx.currentSupabaseUser = {id: 'another'};
  assert.equal(ctx.vacationCanViewBalance(employees[0]), false);
  ctx.currentSupabaseUser = null;
  assert.equal(ctx.vacationCanViewBalance(employees[0]), false);
});

test('L4 does not use annual allowance, including legacy annual-leave entries', () => {
  const {ctx} = setup();
  for (const name of ['vacationIsSickLeave', 'vacationShowSickLeave', 'vacationUsesAnnualAllowance']) {
    vm.runInContext(extract(name), ctx);
  }
  for (const notes of ['L4', 'l-4 od lekarza', 'Zwolnienie lekarskie', 'chorobowe', 'L 4']) {
    for (const type of ['WYPOCZYNKOWY', 'NA ŻĄDANIE', 'INNY']) {
      const request = {type, notes};
      assert.equal(ctx.vacationUsesAnnualAllowance(request), false, `${type}: ${notes}`);
      ctx.owner = true;
      assert.equal(ctx.vacationShowSickLeave(request), true);
      ctx.owner = false;
      assert.equal(ctx.vacationShowSickLeave(request), false);
    }
  }
  for (const notes of ['', 'Urlop rodzinny', 'bez L4', 'brak L4', 'nie L4', 'XL4A']) {
    assert.equal(ctx.vacationUsesAnnualAllowance({type: 'WYPOCZYNKOWY', notes}), true, notes);
  }
  ctx.owner = true;
  assert.equal(ctx.vacationShowSickLeave({type: 'INNY', notes: 'L4', redacted: true}), false);
  assert.equal(ctx.vacationUsesAnnualAllowance({type: 'INNY', notes: ''}), false);
  assert.match(extract('submitVacationRequest'), /vacationIsSickLeave\(\{ notes: vacationNotesInput\?\.value \}\) \? "INNY"/);
  assert.match(fs.readFileSync('supabase-vacation-read-submitted.sql', 'utf8'), /and not \([\s\S]*?CHOROBOWE/);
});

test('L4 stays out of used and pending totals for days and hours', () => {
  const {ctx, employees} = setup();
  vm.runInContext(extract('vacationIsSickLeave'), ctx);
  vm.runInContext(extract('vacationUsesAnnualAllowance'), ctx);
  ctx.owner = true;
  employees[0].redacted = false;
  ctx.vacationEmployeeInput.value = '0';
  ctx.vacationRequests = [
    {employeeId: '0', year: 2026, type: 'WYPOCZYNKOWY', status: 'ZATWIERDZONY', days: 3, hours: 24},
    {employeeId: '0', year: 2026, type: 'WYPOCZYNKOWY', notes: 'L4', status: 'ZATWIERDZONY', days: 5, hours: 40},
    {employeeId: '0', year: 2026, type: 'NA ŻĄDANIE', notes: 'L4', status: 'OCZEKUJE', days: 2, hours: 16}
  ];
  ctx.renderVacationSummary();
  assert.equal(String(ctx.vacationUsedTotal.textContent), '3');
  assert.equal(String(ctx.vacationRemainingTotal.textContent), '23');
  assert.equal(String(ctx.vacationPendingTotal.textContent), '0');
  employees[0].unit = 'HOURS';
  employees[0].allowance = 40;
  ctx.renderVacationSummary();
  assert.equal(String(ctx.vacationUsedTotal.textContent), '24');
  assert.equal(String(ctx.vacationRemainingTotal.textContent), '16');
});
