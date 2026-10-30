const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
const {definitions, score, create} = require('../tinnitus-forms.js');

test('THI and TRQ retain their separate question counts, response orders and maxima', () => {
  assert.equal(definitions.thi.questions.length, 25);
  assert.equal(definitions.trq.questions.length, 26);
  assert.deepEqual(definitions.thi.answers.map(answer => answer.value), [4, 0, 2]);
  assert.deepEqual(definitions.trq.answers.map(answer => answer.value), [0, 1, 2, 3, 4]);
  assert.match(definitions.thi.questions[8][1], /przeszkadza/);
  assert.doesNotMatch(definitions.thi.questions[8][1], /nie przeszkadza/);
  assert.match(definitions.trq.questions[23][1], /myśli samobójcze/);
  assert.match(definitions.trq.instruction, /ostatniego tygodnia/);
  assert.equal(score('thi', Array(25).fill(4)).total, 100);
  assert.equal(score('trq', Array(26).fill(4)).total, 104);
  assert.equal(score('thi', Array(25).fill('0')).complete, true, 'zero is a valid answer, not an omitted one');
});
test('THI interpretation honors every interval boundary; incomplete results are never graded', () => {
  for (const [total, stage] of [[0,1],[16,1],[18,2],[36,2],[38,3],[56,3],[58,4],[76,4],[78,5],[100,5]]) {
    let rest = total;
    const answers = Array.from({length:25}, () => {const value = Math.min(4, rest);rest -= value;return value;});
    const result = score('thi', answers);
    assert.equal(result.total, total);assert.ok(result.grade.label.startsWith(`Stopień ${stage}`));
  }
  const result = score('thi', [4, null, '', undefined, ' ', false, 1, 3, NaN, 'bad']);
  assert.equal(result.answered, 1);assert.equal(result.complete, false);assert.equal(result.grade, null);
  assert.equal(score('trq', Array(26).fill(4)).grade, null, 'THI thresholds must not be applied to TRQ');
  const answers = Array(26).fill(0);assert.equal(score('trq', answers).review, false);
  answers[23] = 1;assert.equal(score('trq', answers).review, true);
  assert.throws(() => score('unknown', []));
});

class Element {
  constructor(tag) {
    this.tag = tag;this.children = [];this.attributes = {};this.listeners = {};this.value = '';this.checked = false;
    this.dataset = {};this.className = '';this._text = '';this.validityMessage = '';
    this.classList = {
      toggle: (name, on) => {const names = new Set(this.className.split(' ').filter(Boolean));on ? names.add(name) : names.delete(name);this.className = [...names].join(' ');},
      add: name => this.classList.toggle(name, true), remove: name => this.classList.toggle(name, false)
    };
  }
  get textContent() {return this._text + this.children.map(child => child.textContent).join('');}
  set textContent(value) {this._text = String(value);this.children = [];}
  append(...nodes) {for (const child of nodes) {child.remove();child.parent = this;this.children.push(child);}}
  prepend(child) {child.remove();child.parent = this;this.children.unshift(child);}
  remove() {if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this);this.parent = null;}
  setAttribute(name, value) {this.attributes[name] = value;}
  removeAttribute(name) {delete this.attributes[name];if (name === 'id') this.id = '';}
  addEventListener(name, fn) {(this.listeners[name] ||= []).push(fn);}
  matches(selector) {
    if (selector === '[id]') return Boolean(this.id);
    if (selector === 'input:checked') return this.tag === 'input' && this.checked;
    if (selector.startsWith('.')) return this.className.split(' ').includes(selector.slice(1));
    return this.tag === selector;
  }
  querySelectorAll(selector) {return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]);}
  querySelector(selector) {return this.querySelectorAll(selector)[0] || null;}
  setCustomValidity(value) {this.validityMessage = value;}
  checkValidity() {return !this.validityMessage && !(this.required && !this.value.trim());}
  reportValidity() {return this.checkValidity();}
  scrollIntoView() {this.scrolled = true;}
  focus() {this.focused = true;}
  cloneNode(deep) {
    const copy = new Element(this.tag);
    for (const key of ['id','value','type','name','checked','className','_text','hidden']) copy[key] = this[key];
    copy.attributes = {...this.attributes};
    if (deep) this.children.forEach(child => copy.append(child.cloneNode(true)));
    return copy;
  }
}
function setup() {
  const body = new Element('body'), views = {thi: new Element('section'), trq: new Element('section')};
  const events = new Map();let printed = 0, offlinePrinted = 0, offline = false, fail = false, confirm = true;
  const api = create({document: {body, createElement: tag => new Element(tag)}, views,
    name: value => value.trim(), fullName: value => value.trim().split(/\s+/u).length > 1,
    iso: value => /^2026-\d{2}-\d{2}$/u.test(value) ? value : '', formatDate: value => value,
    today: () => '2026-10-30', confirm: () => confirm, clearUndo() {},
    offlineActive: () => offline, offlinePrint: async () => {offlinePrinted++;},
    print: async () => {printed++;if (fail) throw new Error('Print failed');},
    window: {addEventListener: (key, fn) => events.set(key, fn), removeEventListener: key => events.delete(key)}
  });
  const field = (kind, suffix) => views[kind].querySelectorAll('input').find(input => input.id === `${kind}${suffix}`);
  const fill = (kind, value = 0) => {
    field(kind, 'CustomerInput').value = 'Jan Testowy';
    views[kind].querySelectorAll('input').filter(input => input.type === 'radio').forEach(input => {input.checked = Number(input.value) === value;});
    api.render(kind);
  };
  return {api, views, body, events, field, fill,
    offline(value) {offline = value;}, fail() {fail = true;}, confirm(value) {confirm = value;},
    counts: () => ({printed, offlinePrinted})};
}
test('questionnaires start unanswered, use shared date inputs and validate every required response', () => {
  const t = setup();
  for (const [kind, count] of [['thi', 75], ['trq', 130]]) {
    const inputs = t.views[kind].querySelectorAll('input');
    assert.equal(inputs.filter(input => input.type === 'radio').length, count);
    assert.equal(inputs.some(input => input.checked), false);
    assert.ok('data-date-picker' in t.field(kind, 'DateInput').attributes);
    assert.equal(t.api.validate(kind), false);
    assert.equal(t.field(kind, 'CustomerInput').focused, true);
    t.fill(kind);
    assert.equal(t.api.validate(kind), true);
    assert.match(t.api.printSource(kind).querySelector('.tinnitus-summary').textContent, /^Wynik: 0/);
    const one = inputs.find(input => input.type === 'radio' && input.checked);one.checked = false;t.api.render(kind);
    assert.equal(t.api.validate(kind, false), false);
    assert.match(t.api.printSource(kind).querySelector('.tinnitus-summary').textContent, /^Wynik częściowy:/);
  }
});
test('print preparation keeps checked marks, isolates patient text and cleans up after print or failure', async () => {
  const t = setup();await t.api.print('thi');assert.equal(t.counts().printed, 0);
  t.fill('thi', 4);await t.api.print('thi');
  assert.equal(t.counts().printed, 1);assert.equal(t.body.children.length, 1);
  await t.api.print('thi');assert.equal(t.counts().printed, 1, 'repeat clicks do not create another print packet');
  const copy = t.body.children[0];assert.equal(copy.querySelectorAll('[id]').length, 0);
  assert.equal(copy.querySelectorAll('.tinnitus-print-mark').filter(node => node.textContent === 'X').length, 25);
  assert.match(copy.textContent, /Jan Testowy/);assert.match(copy.textContent, /100 \/ 100/);
  assert.equal(copy.querySelectorAll('.tinnitus-grade-row').length, 5);
  assert.equal(copy.querySelectorAll('.tinnitus-grade-current').length, 1);
  t.events.get('afterprint')();assert.equal(t.body.children.length, 0);
  t.fail();await assert.rejects(t.api.print('thi'));assert.equal(t.body.children.length, 0);assert.equal(t.events.size, 0);
});
test('THI interpretation table shows all ranges and marks only a complete current result', () => {
  const t = setup(), paper = t.api.printSource('thi');
  const rows = paper.querySelectorAll('.tinnitus-grade-row');
  assert.equal(rows.length, 5);
  for (const [index, grade] of definitions.thi.grades.entries()) {
    assert.ok(rows[index].className.split(' ').includes(`tinnitus-grade-${index + 1}`));
    assert.ok(rows[index].textContent.includes(grade.range));
    assert.ok(rows[index].textContent.includes(grade.description));
    assert.equal(rows[index].querySelector('.tinnitus-grade-marker').hidden, true);
  }
  assert.equal(paper.querySelectorAll('.tinnitus-grade-current').length, 0);
  t.fill('thi', 4);
  assert.equal(rows[4].attributes['aria-current'], 'true');
  assert.equal(rows[4].querySelector('.tinnitus-grade-marker').hidden, false);
  t.fill('thi', 0);
  assert.equal(rows[0].attributes['aria-current'], 'true');
  assert.equal(rows[4].attributes['aria-current'], undefined);
  assert.equal(rows[4].querySelector('.tinnitus-grade-marker').hidden, true);
  const first = t.views.thi.querySelectorAll('input').find(input => input.type === 'radio' && input.checked);
  first.checked = false;t.api.render('thi');
  assert.equal(paper.querySelectorAll('.tinnitus-grade-current').length, 0, 'partial scores cannot select a severity interval');
  assert.equal(t.api.printSource('trq').querySelectorAll('.tinnitus-grade-table').length, 0);
});
test('offline uses the same validation and print source without persisting data; reset clears both questionnaires', async () => {
  const t = setup();t.offline(true);
  await t.api.print('trq');assert.equal(t.counts().offlinePrinted, 0);
  t.fill('trq', 1);await t.api.print('trq');assert.equal(t.counts().offlinePrinted, 1);
  assert.equal(t.body.children.length, 0);assert.equal(t.counts().printed, 0);
  assert.equal(t.views.trq.querySelector('.tinnitus-review').hidden, false);
  t.fill('thi', 2);t.api.clear();
  for (const kind of ['thi','trq']) {
    assert.equal(t.field(kind, 'CustomerInput').value, '');
    assert.equal(t.views[kind].querySelectorAll('input').some(input => input.checked), false);
    assert.equal(t.api.validate(kind), false);
  }
});
test('navigation, offline caching, signout cleanup and print layouts include both forms', () => {
  const source = fs.readFileSync('app.js','utf8'), html = fs.readFileSync('index.html','utf8');
  const offline = fs.readFileSync('offline-forms.js','utf8'), css = fs.readFileSync('styles.css','utf8');
  for (const kind of ['thi','trq']) {
    assert.match(html, new RegExp(`id="${kind}Tab"[^>]*data-view="${kind}"`));
    assert.ok(offline.includes(`kind === "${kind}"`));assert.ok(offline.includes(`api.reset("${kind}")`));
  }
  assert.match(source, /tinnitusForms\?\.clear\(\)/);
  assert.match(source, /if \(\["thi", "trq"\]\.includes\(kind\)\) return tinnitusForms\?\.validate\(kind\) \|\| false/);
  assert.match(fs.readFileSync('offline-sw.js','utf8'), /"tinnitus-forms.js"/);
  assert.match(fs.readFileSync('scripts/public_assets.py','utf8'), /"tinnitus-forms.js"/);
  assert.match(css, /@page tinnitus \{ size: A4 portrait; margin: 10mm; \}/);
  assert.match(css, /\.tinnitus-table tr \{ break-inside: avoid;/);
  for (let stage = 1; stage <= 5; stage++) {
    assert.match(css, new RegExp(`\\.tinnitus-grade-${stage} \\{[^}]*--grade-background: #[0-9a-f]{6};[^}]*--grade-selected: #[0-9a-f]{6};[^}]*--grade-ink: #[0-9a-f]{6};`));
  }
  assert.match(css, /\.tinnitus-grade-current > td \{ background: var\(--grade-selected\); \}/);
  assert.match(css, /\.tinnitus-grade-table \{[^}]*print-color-adjust: exact;/);
  assert.doesNotMatch(fs.readFileSync('tinnitus-forms.js','utf8'), /innerHTML|localStorage|sessionStorage|fetch\(|supabase/);
});
