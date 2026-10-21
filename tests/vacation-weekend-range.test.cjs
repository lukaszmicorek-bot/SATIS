const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('app.js', 'utf8');
function extract(name) {
  const rest = source.slice(source.indexOf(`function ${name}(`));
  return rest.slice(0, rest.slice(1).search(/\n(?:async )?function /) + 1);
}
test('weekend source is one Saturday/Sunday or a contiguous Saturday-Sunday range', () => {
  const ctx = vm.createContext({parseIsoDate: value => value ? new Date(`${value}T12:00:00Z`) : null,
    addDaysToIsoDate: (value, days) => {const date = new Date(`${value}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10);}});
  vm.runInContext(extract('vacationWeekendRangeDays'), ctx);
  assert.equal(ctx.vacationWeekendRangeDays('2026-06-13', '2026-06-14'), 2);
  assert.equal(ctx.vacationWeekendRangeDays('2026-06-13'), 1);
  assert.equal(ctx.vacationWeekendRangeDays('2026-06-14'), 1);
  for (const [from, to] of [['2026-06-12','2026-06-14'], ['2026-06-14','2026-06-15'],
    ['2026-06-13','2026-06-20'], ['2026-06-14','2026-06-13'], ['', '']]) {
    assert.equal(ctx.vacationWeekendRangeDays(from, to), 0);
  }
});
test('both source date fields use the weekend-only calendar; editing and history retain the range', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.match(html, /Praca w weekend · od<\/span><input id="vacationCompensationDate"/);
  assert.match(html, /Praca w weekend · do<\/span><input id="vacationCompensationDateTo"[^>]*data-date-picker/);
  assert.match(extract('renderDatePicker'), /\["vacationCompensationDate", "vacationCompensationDateTo"\]\.includes/);
  assert.match(extract('createDatePickerMonth'), /weekendWorkCalendar && weekday !== 0 && weekday !== 6/);
  assert.match(extract('normalizeVacationRequest'), /compensationDateTo: isoDateForSave\(entry\?\.compensationDateTo \|\| entry\?\.compensationDate\)/);
  assert.match(extract('editVacationRequest'), /setDateInputValue\(compensationDateTo, request.compensationDateTo \|\| request.compensationDate\)/);
  assert.match(extract('renderVacationHistory'), /formatDate\(request.compensationDateTo\)/);
});
