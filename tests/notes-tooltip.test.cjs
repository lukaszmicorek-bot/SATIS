const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {test} = require('node:test');
const source = fs.readFileSync('app.js', 'utf8');
function extract(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0);
  const rest = source.slice(start);
  return rest.slice(0, rest.slice(1).search(/\n(?:async )?function /) + 1);
}
function context() {
  const node = () => ({children: [], style: {}, hidden: true, textContent: '',
    append(...children) {this.children.push(...children);},
    replaceChildren(...children) {this.children = children;},
    getBoundingClientRect: () => ({width: 460, height: 300})});
  const tooltip = node();
  const ctx = vm.createContext({document: {createElement: node, querySelector: () => tooltip},
    window: {innerWidth: 1024, innerHeight: 768, clearTimeout, setTimeout},
    repairNotesTooltipElement: () => tooltip});
  for (const name of ['repairNotesSections', 'hideRepairNotesTooltip', 'scheduleRepairNotesTooltipHide', 'showRepairNotesTooltip']) {
    vm.runInContext(extract(name), ctx);
  }
  return {ctx, tooltip};
}
test('newlines and explicit labels in legacy summaries become separate readable blocks', () => {
  const {ctx} = context();
  const input = 'Reklamacja 1/10/2026 Telefon: 500 600 700 Żądanie: Naprawa Opis wady: Nie działa. Uwagi: Pilne';
  assert.deepEqual(Array.from(ctx.repairNotesSections(input), row => row.label), ['', 'Telefon', 'Żądanie', 'Opis wady', 'Uwagi']);
  const sections = ctx.repairNotesSections('Pozycje:\n1. Aparat słuchowy · TEST\n2. Ładowarka · TEST\nUwagi: Odbiór\npo telefonie');
  assert.equal(sections.length, 5);
  assert.equal(sections[1].text, '1. Aparat słuchowy · TEST');
  assert.equal(ctx.repairNotesSections('Cena 200.50 zł, data 19.10.2026.').length, 1);
  assert.equal(ctx.repairNotesSections('Pozycje: 1. P · Aparat słuchowy TEST 2. L · Wkładka uszna TEST').length, 3);
});
test('tooltip uses safe text nodes, clamps position and supports delayed hide for scrolling', async () => {
  const {ctx, tooltip} = context();
  ctx.showRepairNotesTooltip({dataset: {repairNotesTooltip: 'Uwagi: <img src=x onerror=alert(1)>'},
    getBoundingClientRect: () => ({top: 15, bottom: 35, right: 200})});
  assert.equal(tooltip.children[0].textContent, 'Uwagi');
  assert.equal(tooltip.children[1].children[0].textContent, 'Uwagi');
  assert.equal(tooltip.children[1].children[1].textContent, '<img src=x onerror=alert(1)>');
  assert.equal(tooltip.style.left, '12px');
  assert.equal(tooltip.style.top, '43px');
  assert.equal(tooltip.hidden, false);
  ctx.scheduleRepairNotesTooltipHide();
  assert.equal(tooltip.hidden, false);
  ctx.hideRepairNotesTooltip();
  assert.equal(tooltip.hidden, true);
  assert.match(fs.readFileSync('styles.css', 'utf8'), /\.repair-notes-tooltip-section > p\s*\{[^}]*margin: 0/);
});
