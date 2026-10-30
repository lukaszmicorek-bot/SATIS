const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf8');
function extract(name) {
  let start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0);
  if (source.slice(start - 6, start) === 'async ') start -= 6;
  const rest = source.slice(start);
  return rest.slice(0, rest.slice(1).search(/\n(?:async )?function /) + 1);
}
class Element {
  constructor(tag, attrs = {}, text = '') {
    this.tag = tag; this.attrs = { ...attrs }; this.text = text; this.childNodes = [];
    this.classList = { add: (name) => { this.className = `${this.className} ${name}`.trim(); },
      remove: (name) => { this.className = this.className.split(' ').filter((value) => value !== name).join(' '); } };
  }
  get className() { return this.attrs.class || ''; }
  set className(value) { this.attrs.class = value; }
  get textContent() { return this.text + this.childNodes.map((child) => child.textContent).join(''); }
  set textContent(value) { this.text = value; this.childNodes = []; }
  setAttribute(name, value) { this.attrs[name] = value; }
  removeAttribute(name) { delete this.attrs[name]; }
  append(...nodes) { nodes.forEach((node) => { node.parent = this; this.childNodes.push(node); }); }
  prepend(node) { node.parent = this; this.childNodes.unshift(node); }
  remove() { if (this.parent) this.parent.childNodes = this.parent.childNodes.filter((node) => node !== this); }
  cloneNode(deep) {
    const clone = new Element(this.tag, this.attrs, this.text);
    if (deep) this.childNodes.forEach((child) => clone.append(child.cloneNode(true)));
    return clone;
  }
  matches(selector) {
    if (selector.startsWith('.')) return this.className.split(' ').includes(selector.slice(1));
    if (selector.startsWith('[')) {
      const [, name, value] = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
      return name in this.attrs && (value === undefined || this.attrs[name] === value);
    }
    return this.tag === selector;
  }
  querySelectorAll(selector) {
    if (selector.startsWith(':scope > ')) return this.childNodes.filter((node) => node.matches(selector.slice(9)));
    const [parentSelector, childSelector] = selector.split(' > ');
    if (childSelector) return this.querySelectorAll(parentSelector).flatMap((node) => node.childNodes.filter((child) => child.matches(childSelector)));
    return this.childNodes.flatMap((node) => [...(node.matches(selector) ? [node] : []), ...node.querySelectorAll(selector)]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}
const preview = new Element('section', { id: 'pricingLoanPrint', class: 'loan-document' });
const header = new Element('header', { class: 'offer-document-head' });
header.append(new Element('div', {}, 'Umowa'));
const number = new Element('strong', { id: 'number', 'data-loan-out': 'number' }, '1/09/2026');
const legal = new Element('section', { class: 'loan-terms' }, 'Warunki i zabezpieczenia');
const rules = new Element('section', { class: 'loan-testing-information' });
rules.append(new Element('header', {}, 'Zasady testowania'), new Element('p', {}, '15 zł za aparat'));
preview.append(header, number, legal, rules, new Element('address', {}, 'Nasze gabinety'));
const body = new Element('body');
const listeners = new Map();
let saves = 0, prints = 0, valid = true, saved = true, failedPrint = false;
const alerts = [];
const ctx = vm.createContext({
  setTimeout, clearTimeout,
  loanPrintTestingRulesInput: { checked: true },
  document: { querySelector: () => preview, createElement: (tag) => new Element(tag), body },
  window: {
    addEventListener: (name, handler) => listeners.set(name, handler),
    removeEventListener: (name) => listeners.delete(name),
    print: () => { prints++; if (failedPrint) throw Error('cancelled'); }
  },
  validatePricingLoanForAction: () => valid, renderPricingLoan() {},
  saveCurrentPricingLoanToHistory: async () => { saves++; return saved ? { id: 'one-contract' } : null; },
  alert: (message) => alerts.push(message)
});
for (const name of ['printWithReadyFonts', 'clearLoanPrintCopies', 'prepareLoanPrintCopies', 'printPricingLoan']) vm.runInContext(extract(name), ctx);
async function check() {
  await ctx.printPricingLoan();
  const copies = preview.querySelectorAll(':scope > .loan-print-copy');
  assert.equal(copies.length, 2);
  assert.equal(copies[0].attrs['aria-label'], 'Egzemplarz dla SATIS');
  assert.equal(copies[1].attrs['aria-label'], 'Egzemplarz dla klienta');
  assert.equal(copies[0].querySelectorAll('.loan-testing-information').length, 0);
  assert.equal(copies[1].querySelectorAll('.loan-testing-information').length, 1);
  for (const copy of copies) {
    assert.equal(copy.querySelectorAll('[id]').length, 0);
    assert.equal(copy.querySelectorAll('[data-loan-out]').length, 0);
    assert.equal(copy.querySelectorAll('.loan-terms').length, 1);
    assert.match(copy.textContent, /1\/09\/2026/);
    assert.match(copy.textContent, /Nasze gabinety/);
  }
  assert.equal(saves, 1);
  assert.equal(prints, 1);
  ctx.prepareLoanPrintCopies();
  assert.equal(preview.querySelectorAll(':scope > .loan-print-copy').length, 2);
  ctx.loanPrintTestingRulesInput.checked = false;
  ctx.prepareLoanPrintCopies();
  for (const copy of preview.querySelectorAll(':scope > .loan-print-copy')) {
    assert.equal(copy.querySelectorAll('.loan-testing-information').length, 0);
    assert.equal(copy.querySelectorAll('.loan-terms').length, 1, 'optional testing rules never remove contract terms');
  }
  ctx.loanPrintTestingRulesInput.checked = true;
  ctx.prepareLoanPrintCopies();
  assert.equal(preview.querySelectorAll(':scope > .loan-print-copy')[1].querySelectorAll('.loan-testing-information').length, 1);
  listeners.get('afterprint')();
  assert.equal(preview.querySelectorAll(':scope > .loan-print-copy').length, 0);
  assert.equal(preview.querySelectorAll('.loan-testing-information').length, 1);
  assert.equal(body.className, '');
  valid = false;
  await ctx.printPricingLoan();
  assert.equal(saves, 1);
  valid = true; saved = false;
  await ctx.printPricingLoan();
  assert.equal(prints, 1);
  saved = true; failedPrint = true;
  await ctx.printPricingLoan();
  assert.equal(preview.querySelectorAll(':scope > .loan-print-copy').length, 0);
  assert.equal(body.className, '');
  assert.equal(alerts.length, 1);
  assert.match(css, /\.loan-print-copy \+ \.loan-print-copy \{\s*break-before: page/);
  assert.match(css, /\.loan-testing-information \{[^}]*break-before: page/);
  assert.match(css, /#pricingLoanPrint.loan-print-packet > :not\(\.loan-print-copy\) \{\s*display: none !important/);
  assert.match(extract('clearSensitiveApplicationState'), /clearLoanPrintCopies/);
  console.log('OK: two labeled copies, client-only testing rules, legal terms retained, one history save, print cleanup/failure and page breaks');
}

const choice = {checked: true, dataset: {}};
const choiceRules = {hidden: false};
const choiceCtx = vm.createContext({
  customerNameLookupKey: value => String(value || '').trim().replace(/\s+/gu, ' ').toLowerCase(),
  loanInputValue: input => input?.value || '',
  loanPrintTestingRulesInput: choice, loanCustomerInput: {value: 'Nowy Pacjent'},
  loanDocumentInput: {value: ''}, loanPhoneInput: {value: ''},
  pricingLoanHistory: [], activePricingLoanHistoryId: '',
  pricingLoanView: {querySelectorAll: () => [choiceRules]}
});
for (const name of ['normalizeLoanIdentityValue', 'defaultLoanTestingRules', 'updateLoanTestingRulesChoice', 'restoreLoanTestingRulesChoice']) {
  vm.runInContext(extract(name), choiceCtx);
}
const previous = {id: 'previous', customer: 'Jan Testowy', document: 'ABC123456', phone: '500 600 700'};
assert.equal(choiceCtx.defaultLoanTestingRules('Nowy Pacjent', '', '', [previous]), true);
assert.equal(choiceCtx.defaultLoanTestingRules('JAN  TESTOWY', '', '', [previous]), false);
assert.equal(choiceCtx.defaultLoanTestingRules('Jan Testowy', 'ABC123456', '', [previous], 'previous'), true, 'current agreement is not a previous visit');
assert.equal(choiceCtx.defaultLoanTestingRules('Jan Testowy', 'XYZ654321', '', [previous]), true, 'different identity with same name remains a first visit');
assert.equal(choiceCtx.defaultLoanTestingRules('Jan Testowy', '', '+48 500 600 700', [previous]), false);
assert.equal(choiceCtx.defaultLoanTestingRules('Jan Testowy', '', '501 600 700', [previous]), true);
choiceCtx.updateLoanTestingRulesChoice();
assert.equal(choice.checked, true);
choiceCtx.loanCustomerInput.value = 'Jan Testowy';
choiceCtx.pricingLoanHistory = [previous];
choiceCtx.updateLoanTestingRulesChoice();
assert.equal(choice.checked, false);assert.equal(choiceRules.hidden, true);
choice.checked = true;choice.dataset.manual = '1';
choiceCtx.updateLoanTestingRulesChoice();
assert.equal(choice.checked, true, 'manual choice for a repeat visit is preserved');
choiceCtx.restoreLoanTestingRulesChoice(false);
choiceCtx.updateLoanTestingRulesChoice();assert.equal(choice.checked, false, 'saved unchecked option is preserved');
choiceCtx.loanCustomerInput.value = 'Inny Pacjent';
choiceCtx.updateLoanTestingRulesChoice();assert.equal(choice.checked, true, 'another patient gets an independent default');
choiceCtx.loanCustomerInput.value = '';
choiceCtx.restoreLoanTestingRulesChoice(null);
assert.equal(choice.checked, true);assert.equal(choice.dataset.manual, undefined);
assert.match(source, /printTestingRules: typeof entry\.printTestingRules === "boolean" \? entry\.printTestingRules : null/);
assert.match(extract('currentPricingLoanSnapshot'), /printTestingRules: loanPrintTestingRulesInput\?\.checked !== false/);
assert.match(extract('restorePricingLoanFromHistory'), /restoreLoanTestingRulesChoice\(historyEntry\.printTestingRules\)/);
assert.match(extract('startNewPricingLoan'), /restoreLoanTestingRulesChoice\(null\)/);
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
assert.match(html, /id="loanPrintTestingRulesInput" type="checkbox" checked/);
assert.match(html, /Drukuj zasady testowania AS/);
check().catch((error) => { console.error(error); process.exitCode = 1; });
