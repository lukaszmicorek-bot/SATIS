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
test('all four documents use the same save label, dirty state, reminder and reset', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const css = fs.readFileSync('styles.css', 'utf8');
  const keys = ['offer', 'loan', 'order', 'complaint'];
  const states = new Map();
  const views = {}, buttons = {};
  for (const key of keys) {
    const cap = key[0].toUpperCase() + key.slice(1);
    assert.match(html, new RegExp(`id="savePricing${cap}Btn" class="[^"]*document-save-btn[^"]*"[^>]*>Zapisz</button>`));
    const classes = new Set();
    buttons[key] = {classes, title: '', attributes: {}, classList: {
      add: name => classes.add(name), remove: (...names) => names.forEach(name => classes.delete(name)),
      toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name)
    }, setAttribute(name, value) {this.attributes[name] = value;},
    removeAttribute(name) {delete this.attributes[name];}, after() {}};
    const editor = {events: {}, addEventListener(name, handler) {this.events[name] = handler;}};
    views[key] = {querySelector: () => editor};
  }
  const timers = new Map(); let next = 0;
  const ctx = vm.createContext({agreementDraftStates: states, AGREEMENT_SAVE_REMINDER_DELAY_MS: 60000,
    window: {setTimeout(fn) {timers.set(++next, fn); return next;}, clearTimeout(id) {timers.delete(id);}},
    document: {createElement: () => ({hidden: true, setAttribute() {}})},
    ...Object.fromEntries(keys.flatMap(key => {
      const cap = key[0].toUpperCase() + key.slice(1);
      return [[`pricing${cap}View`, views[key]], [`savePricing${cap}Btn`, buttons[key]]];
    }))
  });
  for (const name of ['setPrimarySaveHighlight', 'markAgreementDraftDirty', 'markAgreementDraftSaved', 'setupAgreementDraftTracking']) {
    vm.runInContext(extract(name), ctx);
  }
  ctx.setupAgreementDraftTracking();
  assert.equal(states.size, 4);
  for (const key of keys) {
    const state = states.get(key);
    for (const eventName of ['input', 'change']) {
      state.editor.events[eventName]({target: {matches: () => true}});
      assert.equal(state.dirty, true);
      assert.ok(buttons[key].classes.has('has-unsaved-changes'));
      assert.equal(buttons[key].attributes['aria-label'], 'Zapisz wprowadzone zmiany');
    }
    timers.get(state.timer)();
    assert.ok(buttons[key].classes.has('save-reminder-active'));
    assert.equal(state.reminder.hidden, false);
    ctx.markAgreementDraftSaved(key);
    assert.equal(state.dirty, false);
    assert.equal(buttons[key].classes.size, 0);
    assert.equal(state.reminder.hidden, true);
    assert.equal(buttons[key].attributes['aria-label'], undefined);
  }
  assert.match(css, /\.offer-actions button\.document-save-btn\.has-unsaved-changes[\s\S]*?background: #bd354f;[\s\S]*?color: #fff/);
});
