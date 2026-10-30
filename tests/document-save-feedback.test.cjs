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
      assert.equal(buttons[key].classes.has('is-writing'), eventName === 'input');
      if (eventName === 'input') {
        const firstTimer = state.writingTimer;
        state.editor.events.input({target: {matches: () => true}});
        assert.equal(timers.has(firstTimer), false, 'continued typing replaces the previous idle timer');
        ctx.markAgreementDraftDirty(key);
        assert.ok(buttons[key].classes.has('is-writing'), 'autocomplete triggered during input retains typing feedback');
        timers.get(state.writingTimer)();
        assert.equal(buttons[key].classes.has('is-writing'), false);
        assert.equal(state.dirty, true, 'idle color does not mark unsaved changes as saved');
        assert.ok(buttons[key].classes.has('has-unsaved-changes'));
      }
    }
    timers.get(state.timer)();
    assert.ok(buttons[key].classes.has('save-reminder-active'));
    assert.equal(state.reminder.hidden, false);
    ctx.markAgreementDraftSaved(key);
    assert.equal(state.dirty, false);
    assert.equal(buttons[key].classes.size, 0);
    assert.equal(state.reminder.hidden, true);
    assert.equal(buttons[key].attributes['aria-label'], undefined);
    state.editor.events.input({target: {matches: () => true}});
    const writingTimer = state.writingTimer, reminderTimer = state.timer;
    ctx.markAgreementDraftSaved(key);
    assert.equal(timers.has(writingTimer), false);
    assert.equal(timers.has(reminderTimer), false);
    assert.equal(buttons[key].classes.size, 0, 'saving while typing clears both feedback states');
    ctx.markAgreementDraftDirty(key);
    assert.equal(buttons[key].classes.has('is-writing'), false, 'programmatic changes start as unsaved, not typing');
    ctx.markAgreementDraftSaved(key);
  }
  assert.match(css, /:is\(\.offer-actions button\.document-save-btn, \.offline-controls \[data-offline="save"\]\)\.has-unsaved-changes \{[^}]*background: #fff0dc;/);
  assert.match(css, /\.has-unsaved-changes\.is-writing \{[^}]*background: #bd354f;[^}]*color: #fff/);
  assert.match(css, /\.save-reminder-active \{[^}]*background: #ffe3ba;/);
  assert.match(css, /\.unified-document-editor button\.document-save-btn \{[^}]*width: 112px;[^}]*min-width: 112px;/);
  assert.match(css, /\.unified-document-editor #savePricingLoanBtn \{ width: auto; \}/);
  assert.match(css, /\.unified-document-editor :is\(\.form-undo-tools > button, \.offer-actions > button\) \{[^}]*height: 32px;[^}]*font-size: 12px;/);
});

test('offline save uses the same typing and unsaved states and clears them after local save', () => {
  const offline = fs.readFileSync('offline-forms.js', 'utf8');
  const classes = new Set(), timers = new Map(); let next = 0;
  const button = {classList: {
    toggle(name, enabled) { enabled ? classes.add(name) : classes.delete(name); },
    remove(name) { classes.delete(name); }
  }};
  const ctx = vm.createContext({dirty: true, writingTimer: 0, panel: {querySelector: () => button},
    setTimeout(fn) {timers.set(++next, fn); return next;}, clearTimeout(id) {timers.delete(id);}});
  const start = offline.indexOf('    function updateSaveState(');
  vm.runInContext(offline.slice(start, offline.indexOf('    function touch(', start)), ctx);
  ctx.updateSaveState(true);
  assert.ok(classes.has('is-writing'));
  assert.ok(classes.has('has-unsaved-changes'));
  timers.get(ctx.writingTimer)();
  assert.equal(classes.has('is-writing'), false);
  assert.ok(classes.has('has-unsaved-changes'));
  ctx.updateSaveState(true);
  const pending = ctx.writingTimer;
  ctx.dirty = false;
  ctx.updateSaveState();
  assert.equal(timers.has(pending), false);
  assert.equal(classes.size, 0);
  assert.match(offline, /updateSaveState\(event.type === "input"\)/);
});
