const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf8');

function extract(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, name);
  const rest = source.slice(start);
  return rest.slice(0, rest.slice(1).search(/\n(?:async )?function /) + 1);
}

test('overtime and early exit are preserved as hourly, non-leave records', () => {
  const context = vm.createContext({
    titleCaseName: value => String(value || '').trim(),
    isoDateForSave: value => String(value || '').trim(),
    vacationWorkingDays: () => 1,
    makeId: () => 'id',
    normalizeLoanHistoryText: value => String(value || '').trim(),
    normalize: value => String(value || '').trim().toLocaleLowerCase('pl-PL')
  });
  for (const name of [
    'normalizeVacationEmployeeUnit',
    'vacationEmployeeUsesHours',
    'vacationTypeUsesHours',
    'vacationRequestUsesHours',
    'vacationIsSickLeave', 'vacationUsesAnnualAllowance',
    'normalizeVacationRequest'
  ]) vm.runInContext(extract(name), context);

  for (const type of ['NADGODZINY', 'WCZEŚNIEJSZE WYJŚCIE']) {
    const record = context.normalizeVacationRequest({
      employeeName: 'Jan Kowalski', dateFrom: '2026-09-07', dateTo: '2026-09-07', type, hours: 2.5
    });
    assert.equal(record.type, type);
    assert.equal(record.hours, 2.5);
    assert.equal(record.days, 0);
    assert.equal(context.vacationRequestUsesHours(record), true);
    assert.equal(context.vacationUsesAnnualAllowance(record), false);
  }
});

test('vacation form exposes both time types and requires their hours', () => {
  assert.match(html, /data-vacation-type="NADGODZINY">Nadgodziny/);
  assert.match(html, /data-vacation-type="WCZEŚNIEJSZE WYJŚCIE">Wcześniejsze wyjście/);
  assert.match(html, /id="vacationHoursLabel"/);
  assert.match(extract('updateVacationUnitFields'), /usesHours \|\| vacationTypeUsesHours\(type\)/);
  assert.match(extract('submitVacationRequest'), /vacationTypeUsesHours\(type\) && dateFrom !== dateTo/);
  assert.match(extract('submitVacationRequest'), /requiresHours = usesHours \|\| vacationTypeUsesHours\(type\)/);
});

test('time records stay out of leave balances and full-day occupancy', () => {
  assert.match(extract('renderVacationSummary'), /vacationAnnualBalance\(employee\)/);
  assert.match(extract('calculateVacationAnnualBalance'), /vacationUsesAnnualAllowance\(request\)/);
  assert.match(extract('calculateVacationAnnualBalance'), /pending = sum\("OCZEKUJE"\)/);
  assert.match(extract('vacationOccupiedPeopleOnDate'), /vacationRequestBlocksDay\(request\)/);
  assert.match(extract('vacationOwnLeaveOnDate'), /vacationRequestBlocksDay\(request\)/);
  assert.match(extract('currentDateUpcomingEvents'), /vacationTypeUsesHours\(request\.type\)/);
  assert.match(extract('currentDateUpcomingEvents'), /canViewDetails \? vacationTypeLabel\(request\.type\) : "Termin pracownika"/);
  assert.match(css, /data-vacation-type="NADGODZINY"/);
  assert.match(css, /data-vacation-type="WCZEŚNIEJSZE WYJŚCIE"/);
});
