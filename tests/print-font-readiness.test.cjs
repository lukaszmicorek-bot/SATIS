const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf8');
const helper = source.slice(source.indexOf('async function printWithReadyFonts('), source.indexOf('\nfunction exportStockAuditPdf('));

test('offer, loan and order include the exact medical-device notice in preview and print', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const notice = '<p class="medical-device-notice">To jest wyrób medyczny. Używaj go zgodnie z instrukcją używania lub etykietą.</p>';
  assert.equal(html.split(notice).length - 1, 3);
  assert.ok(html.indexOf(notice) > html.indexOf('id="offerNotesPrint"'));
  assert.ok(html.indexOf(notice) < html.indexOf('<section class="document-description offer-description"'));
  assert.match(css, /body\.pricing-offer-print \.medical-device-notice,/);
  assert.ok(html.indexOf(notice) < html.indexOf('<section class="loan-doc-section loan-terms">'));
  assert.ok(html.lastIndexOf(notice) > html.indexOf('id="orderContent"'));
  assert.ok(html.lastIndexOf(notice) < html.indexOf('<section class="order-signatures"'));
  assert.match(css, /body\.pricing-loan-print \.medical-device-notice,[\s\S]*?body\.pricing-order-print \.medical-device-notice\s*\{[^}]*font-size: 11pt/);
  assert.match(css, /\.medical-device-notice\s*\{[^}]*break-inside: avoid/);
});

function harness(fonts) {
  const state = { prints: 0, cleaned: 0, alerts: [], removed: 0, timers: new Map() };
  const ctx = vm.createContext({
    document: { fonts },
    window: { print: () => state.prints++, removeEventListener: () => state.removed++ },
    alert: (message) => state.alerts.push(message),
    setTimeout: (callback) => { state.timers.set(1, callback); return 1; },
    clearTimeout: (id) => state.timers.delete(id)
  });
  vm.runInContext(helper, ctx);
  return { state, print: () => ctx.printWithReadyFonts(() => state.cleaned++) };
}

test('printing waits for regular, bold, italic and completed font layout', async () => {
  const requests = [];
  let finish;
  const { state, print } = harness({
    load: async (font, sample) => { requests.push({ font, sample }); return [{}]; },
    ready: new Promise((resolve) => { finish = resolve; })
  });
  const pending = print();
  await Promise.resolve();
  assert.equal(state.prints, 0);
  assert.equal(requests.length, 3);
  assert.ok(requests.some(({ font }) => font.includes('700')));
  assert.ok(requests.some(({ font }) => font.includes('italic')));
  assert.ok(requests.every(({ sample }) => sample.includes('ż')));
  finish();
  assert.equal(await pending, true);
  assert.equal(state.prints, 1);
  assert.equal(state.cleaned, 0);
  assert.equal(state.timers.size, 0);
});

test('missing or failed fonts stop printing and clean the print layout', async () => {
  for (const load of [async () => [], async () => { throw Error('offline'); }]) {
    const { state, print } = harness({ load, ready: Promise.resolve() });
    assert.equal(await print(), false);
    assert.equal(state.prints, 0);
    assert.equal(state.cleaned, 1);
    assert.equal(state.removed, 1);
    assert.equal(state.alerts.length, 1);
    assert.equal(state.timers.size, 0);
  }
});

test('stalled fonts time out and do not print later', async () => {
  let finish;
  const { state, print } = harness({ load: () => new Promise((resolve) => { finish = resolve; }) });
  const pending = print();
  state.timers.get(1)();
  assert.equal(await pending, false);
  finish([{}]);
  assert.equal(state.prints, 0);
  assert.equal(state.cleaned, 1);
  assert.equal(state.timers.size, 0);
});

test('all application print buttons use font readiness, with legacy browser fallback', async () => {
  const { state, print } = harness(undefined);
  assert.equal(await print(), true);
  assert.equal(state.prints, 1);
  assert.equal((source.match(/window\.print\(\)/g) || []).length, 1);
  assert.match(css, /@media print[\s\S]*-webkit-font-smoothing: auto/);
  assert.doesNotMatch(css, /text-rendering: geometricPrecision/);
  assert.match(css, /\.offer-description-grid span,[^}]*font-size: 7\.5pt/);
});

test('RODO print is aligned right and shares normal/hover styling with all four documents', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert.match(html, /class="pricing-document-actions offer-actions">\s*<button id="resetRodoBtn"[^>]*>[^<]*<\/button>\s*<button id="printRodoBtn" type="button">Drukuj \/ PDF/);
  assert.match(css, /\.offer-actions\s*\{[^}]*justify-content: flex-end/);
  assert.match(css, /#printPricingOfferBtn,[\s\S]*?#printPricingComplaintBtn,\s*#printRodoBtn\s*\{[^}]*background: #2b8a78/);
  assert.match(css, /#printPricingComplaintBtn:hover,\s*#printRodoBtn:hover\s*\{[^}]*background: #257867/);
});

test('RODO validates before print and routes to the same online/offline print pipeline', async () => {
  const rodo = source.slice(source.indexOf('async function printPricingRodo('), source.indexOf('\nfunction markAgreementDraftDirty('));
  let valid = false, offline = false, prints = 0, offlinePrints = 0;
  const context = vm.createContext({
    updateRodoFromPesel() {}, renderPricingRodo() {},
    document: {querySelector: () => ({reportValidity: () => valid}), body: {classList: {add() {}, remove() {}}}},
    window: {addEventListener() {}},
    offlineForms: {active: () => offline, print: async kind => {assert.equal(kind, 'rodo'); offlinePrints++;}},
    printWithReadyFonts: async () => {prints++; return true;}
  });
  vm.runInContext(rodo, context);
  assert.equal(await context.printPricingRodo(), false);
  assert.equal(prints, 0);
  valid = true;
  assert.equal(await context.printPricingRodo(), true);
  assert.equal(prints, 1);
  offline = true;
  await context.printPricingRodo();
  assert.equal(offlinePrints, 1);
  assert.equal(prints, 1);
});
