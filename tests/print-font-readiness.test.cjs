const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf8');
const helper = source.slice(source.indexOf('async function printWithReadyFonts('), source.indexOf('\nfunction exportStockAuditPdf('));

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
