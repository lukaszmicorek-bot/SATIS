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
