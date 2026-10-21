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
  for (const id of ['vacationCompensationDate', 'vacationCompensationDateTo']) {
    assert.match(html, new RegExp(`id="${id}"[^>]*readonly`));
  }
  assert.ok(html.indexOf('id="vacationCompensationField"') < html.indexOf('id="vacationDateFromInput"'));
  assert.match(extract('updateVacationUnitFields'), /Odbiór wolnego · od/);
  const css = fs.readFileSync('styles.css', 'utf8');
  assert.match(css, /\[data-vacation-type="ZA WEEKEND"\]\.active,[\s\S]*?background: #607f91/);
  assert.match(css, /\.weekend-work-picker \.date-picker-day\.weekend[^{}]*\{[^}]*background: #f0f5f9/);
  assert.match(css, /\.weekend-work-picker \.date-picker-weekday\.weekend-label\s*\{[^}]*background: #f0f5f9/);
});

test('weekend picker actually disables weekdays and ignores attempted weekday selection', () => {
  const element = () => ({children: [], dataset: {}, attributes: {}, events: {}, title: '',
    classList: {add() {}}, append(...nodes) {this.children.push(...nodes);},
    setAttribute(name, value) {this.attributes[name] = value;}, getAttribute(name) {return this.attributes[name];},
    addEventListener(name, callback) {this.events[name] = callback;}});
  const selected = {value: '', dispatchEvent() {}};
  const ctx = vm.createContext({document: {createElement: element},
    activeDateInput: selected, Event: class {}, closeDatePicker() {},
    isoDateFromParts: (year, month, day) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    displayDateForInput: value => value, formatDate: value => value,
    polishPublicHolidayOnDate: () => null, isVacationCalendarInput: () => false,
    vacationOccupiedPeopleOnDate: () => [], vacationOwnLeaveOnDate: () => null,
    vacationSaturdayLinksOnDate: () => []});
  for (const name of ['appendDatePickerTitle', 'createDatePickerMonth']) vm.runInContext(extract(name), ctx);
  for (const id of ['vacationCompensationDate', 'vacationCompensationDateTo']) {
    selected.id = id; selected.value = '';
    const days = ctx.createDatePickerMonth(new Date(2026, 5, 1), null, new Date(2026, 5, 15), null, null, true).children[1].children;
    const monday = days.find(day => day.dataset.value === '2026-06-15');
    const saturday = days.find(day => day.dataset.value === '2026-06-13');
    const sunday = days.find(day => day.dataset.value === '2026-06-14');
    assert.equal(monday.disabled, true);
    assert.equal(monday.attributes['aria-disabled'], 'true');
    assert.notEqual(saturday.disabled, true);
    assert.notEqual(sunday.disabled, true);
    monday.events.click();
    assert.equal(selected.value, '');
    saturday.events.click();
    assert.equal(selected.value, '2026-06-13');
  }
  const regular = ctx.createDatePickerMonth(new Date(2026, 5, 1), null, new Date(2026, 5, 15)).children[1].children;
  assert.notEqual(regular.find(day => day.dataset.value === '2026-06-15').disabled, true,
    'actual leave may still be received on a workday');
});
