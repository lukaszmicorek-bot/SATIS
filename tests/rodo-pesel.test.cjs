const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const render = source.slice(source.indexOf('function renderPricingRodo()'), source.indexOf('function resetPricingRodo()'));

test('RODO has an optional PESEL field and a printable identity output', () => {
  assert.match(html, /id="rodoPeselInput"[^>]*inputmode="numeric"[^>]*maxlength="11"/);
  assert.match(html, /data-rodo-out="birthIdentity"/);
});

for (const pesel of ['', '00000000000']) {
  test(`RODO renders identity with ${pesel ? 'a PESEL' : 'no PESEL'}`, () => {
    const output = { dataset: { rodoOut: 'birthIdentity' }, textContent: '' };
    const print = { querySelectorAll: selector => selector === '[data-rodo-out]' ? [output] : [] };
    const document = { querySelector: selector => selector === '#pricingRodoPrint' ? print : {
      value: selector === '#rodoBirthDateInput' ? '2000-01-01' : selector === '#rodoPeselInput' ? pesel : ''
    } };
    vm.runInNewContext(`${render}\nrenderPricingRodo();`, {
      document, pricingRodoView: { querySelectorAll: () => [] }, formatDate: () => '01.01.2000', formatRodoPhone: value => value,
      syncRodoGuardianFields: () => false
    });
    assert.equal(output.textContent, pesel ? `01.01.2000 · PESEL: ${pesel}` : '01.01.2000');
  });
}

function extract(name) {
  const start = source.indexOf(`function ${name}(`);
  return source.slice(start, source.indexOf('\nfunction ', start + 1));
}

test('PESEL supplies the correct birth date and rejects a bad checksum', () => {
  const pesel = { value: '44051401458', setCustomValidity(value) { this.error = value; }, setAttribute() {} };
  const birth = { value: '', dataset: {} };
  const context = vm.createContext({
    document: { querySelector: selector => selector === '#rodoPeselInput' ? pesel : birth },
    setDateInputValue(input, date) { input.value = date; }, renderPricingRodo() {}
  });
  vm.runInContext(['normalizeLoanIdentityValue', 'peselBirthDate', 'isValidPesel', 'updateRodoFromPesel'].map(extract).join('\n'), context);
  vm.runInContext('updateRodoFromPesel()', context);
  assert.equal(birth.value, '1944-05-14');
  assert.equal(pesel.error, '');
  pesel.value = '44051401459';
  vm.runInContext('updateRodoFromPesel()', context);
  assert.equal(birth.value, '');
  assert.ok(pesel.error);
  birth.value = '2000-01-01';
  pesel.value = '';
  vm.runInContext('updateRodoFromPesel()', context);
  assert.equal(birth.value, '2000-01-01');
});

test('RODO formats Polish phones and preserves foreign numbers', () => {
  const context = vm.createContext({});
  vm.runInContext(['pcprDigitGroups', 'pcprPhoneDigits', 'formatPcprPhone', 'formatRodoPhone'].map(extract).join('\n'), context);
  for (const [input, expected] of [['500600800', '500 600 800'], ['338153355', '33 815 33 55'], ['+48 500600800', '500 600 800'], ['+44 2071234567', '+44 2071234567']]) {
    context.input = input;
    assert.equal(vm.runInContext('formatRodoPhone(input)', context), expected);
  }
});

test('RODO recognises a minor as of the signature date and supports manual child choice without a birth date', () => {
  const c = vm.createContext({ isoDateForSave: value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value : '' });
  vm.runInContext([extract('ageOnDate'), extract('rodoPatientIsChild')].join('\n'), c);
  assert.equal(c.rodoPatientIsChild('2008-11-25', '2026-11-24'), true);
  assert.equal(c.rodoPatientIsChild('2008-11-24', '2026-11-24'), false);
  assert.equal(c.rodoPatientIsChild('2016-01-01', '2026-11-24', 'adult'), true);
  assert.equal(c.rodoPatientIsChild('', '2026-11-24', 'child'), true);
  assert.equal(c.rodoPatientIsChild('', '2026-11-24', 'adult'), false);
});

function guardianContext(child) {
  const fields = {
    '#rodoGuardianFields': { hidden: true }, '#rodoPhoneLabel': { textContent: '' },
    '#rodoBirthDateInput': { value: '' }, '#rodoDateInput': { value: '2026-11-24' },
    '#rodoGuardianNameInput': { value: '', setCustomValidity(message) {this.error = message;}, reportValidity() {return !this.error;}, focus() {this.focused = true;} }
  };
  const kinds = [{value: 'adult'}, {value: 'child'}], roles = [{value: 'Matka'}, {value: 'Ojciec'}, {value: 'Opiekun prawny'}];
  kinds[child ? 1 : 0].checked = true;
  for (const role of roles) {role.reportValidity = () => !role.required || roles.some(r => r.checked);role.focus = () => {role.focused = true;};}
  const c = vm.createContext({document: {querySelector: selector => fields[selector]},
    pricingRodoView: {
      querySelector: selector => selector.includes('rodoPatientKind') ? kinds.find(r=>r.checked) : selector.includes(':checked') ? roles.find(r=>r.checked) : roles[0],
      querySelectorAll: selector => selector.includes('rodoPatientKind') ? kinds : roles
    },
    todayInputValue: () => '2026-11-24', rodoPatientIsChild: (birth, date, kind) => kind === 'child',
    titleCaseName: value => String(value || '').trim(), isFullPersonName: value => String(value).trim().split(/\s+/).length >= 2
  });
  vm.runInContext([extract('syncRodoGuardianFields'), extract('validateRodoGuardian')].join('\n'), c);
  return {c, fields, kinds, roles};
}

test('child RODO requires a named parent or legal guardian and a role; adult RODO hides and disables those fields', () => {
  const {c, fields, kinds, roles} = guardianContext(true);
  assert.equal(c.validateRodoGuardian(), false);assert.equal(fields['#rodoGuardianNameInput'].focused, true);
  fields['#rodoGuardianNameInput'].value = 'Rodzic Testowy';
  assert.equal(c.validateRodoGuardian(), false, 'a role is required too');
  roles[0].checked = true;assert.equal(c.validateRodoGuardian(), true);
  assert.equal(fields['#rodoGuardianFields'].hidden, false);
  assert.equal(fields['#rodoPhoneLabel'].textContent, 'Telefon rodzica / opiekuna');
  kinds[0].checked = true;kinds[1].checked = false;
  assert.equal(c.validateRodoGuardian(), true);
  assert.equal(fields['#rodoGuardianFields'].hidden, true);
  assert.equal(fields['#rodoGuardianNameInput'].disabled, true);
  assert.equal(fields['#rodoGuardianNameInput'].required, false);
  assert.ok(roles.every(r=>r.disabled && !r.required));
});

test('child print identifies the child, parent and signature, but an adult print excludes stale guardian details', () => {
  const {c, fields, kinds, roles} = guardianContext(true);
  fields['#rodoGuardianNameInput'].value = 'Rodzic Testowy';roles[1].checked = true;
  const outputs = ['name', 'guardianName', 'guardianRole'].map(key=>({dataset: {rodoOut:key}}));
  const labels = new Map(['health-subject', 'name-label', 'phone-label', 'signature-label'].map(key=>[key, [{}]]));
  const childOnly = [{hidden: true}];
  fields['#pricingRodoPrint'] = {querySelectorAll: selector => selector === '[data-rodo-out]' ? outputs : selector === '[data-rodo-child-only]' ? childOnly : labels.get(selector.slice(11,-1)) || []};
  fields['#rodoNameInput'] = {value: 'Dziecko Testowe'};
  c.formatRodoPhone = value => value || '';c.formatDate = value => value;
  const queryAll = c.pricingRodoView.querySelectorAll;
  c.pricingRodoView.querySelectorAll = selector => selector.includes('name^=') ? [] : queryAll(selector);
  vm.runInContext(extract('renderPricingRodo'), c);
  c.renderPricingRodo();
  assert.equal(outputs[1].textContent, 'Rodzic Testowy');assert.equal(outputs[2].textContent, 'Ojciec');
  assert.equal(childOnly[0].hidden, false);
  assert.equal(labels.get('signature-label')[0].textContent, 'Podpis rodzica / opiekuna prawnego');
  kinds[0].checked = true;kinds[1].checked = false;c.renderPricingRodo();
  assert.equal(outputs[1].textContent, '');assert.equal(outputs[2].textContent, '');assert.equal(childOnly[0].hidden, true);
  assert.equal(labels.get('health-subject')[0].textContent, 'mojego zdrowia');
  assert.match(extract('printPricingRodo'), /validateRodoGuardian\(\)/);
  assert.match(source, /kind === "rodo"[\s\S]*reportValidity\(\) && validateRodoGuardian\(\)/);
  assert.doesNotMatch(html, /id="rodoGuardianPesel|id="rodoGuardianDocument/);
});
