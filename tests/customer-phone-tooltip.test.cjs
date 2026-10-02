const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf8');
function extract(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0);
  const rest = source.slice(start);
  return rest.slice(0, rest.slice(1).search(/\n(?:async )?function /) + 1);
}
function element() {
  const classes = new Set();
  return {
    children: [], style: {},
    classList: {
      add: name => classes.add(name),
      contains: name => classes.has(name),
      toggle(name, force = !classes.has(name)) {
        if (force) classes.add(name); else classes.delete(name);
        return force;
      }
    },
    append(...items) { this.children.push(...items); },
    replaceChildren(...items) { this.children = items; },
    getBoundingClientRect() { return { width: 430, height: 150 }; }
  };
}
function setup() {
  const tooltip = element();
  const context = vm.createContext({
    document: { createElement: element, createDocumentFragment: element },
    tableHoverTooltipElement: () => tooltip,
    renderWarrantyDateText: (target, text) => target.replaceChildren(text),
    tableHoverHideTimer: 0,
    clearTimeout: () => {},
    window: { innerWidth: 1200, innerHeight: 800 }
  });
  for (const name of ['appendCustomerTooltipSections', 'renderCustomerPhoneTooltip', 'showTableHoverTooltip']) {
    vm.runInContext(extract(name), context);
  }
  return { context, tooltip };
}
test('Phone numbers precede subdued sources, preserving warnings and safe text rendering', () => {
  const { context, tooltip } = setup();
  const info = {
    uncertain: true, tooltip: 'phone summary',
    phones: [
      { formatted: '500 600 800', sources: ['Umowa · 31.08.2026', '<img src=x>'] },
      { formatted: '33 815 33 55', sources: [] }
    ]
  };
  context.renderCustomerPhoneTooltip(tooltip, info, `${info.tooltip}\n\nHistoria klienta`);
  const [heading, first, second, details] = tooltip.children[0].children;
  assert.match(heading.textContent, /Sprawdź zgodność osoby/);
  assert.equal(first.children[0].className, 'phone-tooltip-number');
  assert.equal(first.children[0].textContent, '500 600 800');
  assert.equal(first.children[1].className, 'phone-tooltip-source');
  assert.match(first.children[1].textContent, /Umowa.*<img src=x>/);
  assert.equal(first.children[1].children.length, 0);
  assert.equal(second.children.length, 1);
  assert.equal(details.children[0].children[0].textContent, 'Historia klienta');
});
test('Shared hover tooltip switches cleanly between phone and ordinary content', () => {
  const { context, tooltip } = setup();
  const info = { uncertain: false, tooltip: 'phone summary', phones: [{ formatted: '500 600 800', sources: ['Demo'] }] };
  const anchor = {
    closest: () => null,
    customerPhoneDetails: info,
    dataset: { customerTooltip: 'phone summary\n\nUmowa', customerPhoneTooltip: 'phone summary', priceTooltip: 'Cena aparatu' },
    getBoundingClientRect: () => ({ left: 100, top: 50, bottom: 70 })
  };
  anchor.dataset.currentDateTooltip = 'Calendar\n\nEvent';
  context.showTableHoverTooltip(anchor, 'currentDateTooltip');
  assert.equal(tooltip.classList.contains('calendar-event-tooltip'), true);
  assert.equal(tooltip.children[1].classList.contains('calendar-event-tooltip-separator'), true);
  for (const key of ['customerTooltip', 'customerPhoneTooltip']) {
    context.showTableHoverTooltip(anchor, key);
    assert.equal(tooltip.classList.contains('calendar-event-tooltip'), false);
    assert.equal(tooltip.classList.contains('customer-detail-tooltip'), true);
    assert.equal(tooltip.children[0].children[1].children[0].textContent, '500 600 800');
    assert.equal(tooltip.style.top, '78px');
  }
  context.showTableHoverTooltip(anchor, 'priceTooltip');
  assert.equal(tooltip.classList.contains('customer-detail-tooltip'), false);
  assert.equal(tooltip.children[0], 'Cena aparatu');
  assert.match(extract('createCustomerPhoneBadge'), /badge.customerPhoneDetails = info/);
  assert.doesNotMatch(extract('createCustomerPhoneBadge'), /badge.title\s*=/);
  assert.match(extract('createCustomerActivityCell'), /wrap.customerPhoneDetails = phoneInfo/);
  assert.match(css, /\.customer-name-line\s*\{[^}]*flex-wrap: nowrap;[^}]*align-items: baseline;/);
  assert.match(css, /\.phone-tooltip-number\s*\{[^}]*font-weight: 800;[^}]*white-space: nowrap;/);
  assert.match(css, /\.phone-tooltip-source\s*\{[^}]*font-weight: 400;/);
  assert.match(css, /\.table-hover-tooltip\.customer-detail-tooltip\s*\{/);
});

test('Info tooltip separates heading and lines without interpreting user text as HTML', () => {
  const { context, tooltip } = setup();
  const anchor = {
    closest: () => null,
    dataset: { customerTooltip: 'Dokumenty klienta:\n• Umowa <script>\n\nAktualnie przypisany aparat:\n• Demo' },
    getBoundingClientRect: () => ({ left: 100, top: 50, bottom: 70 })
  };
  context.showTableHoverTooltip(anchor, 'customerTooltip');
  assert.equal(tooltip.classList.contains('customer-detail-tooltip'), true);
  assert.equal(tooltip.children[0].children[0].textContent, 'Dokumenty klienta:');
  assert.equal(tooltip.children[0].children[1].className, 'customer-tooltip-entry');
  assert.equal(tooltip.children[0].children[1].children[0].textContent, 'Umowa <script>');
  assert.equal(tooltip.children[1].children[0].textContent, 'Aktualnie przypisany aparat:');
});

test('Info includes every matching document and its popup can be scrolled', () => {
  const context = vm.createContext({
    customerNameLookupKey: value => value,
    customerSameNameCount: () => 1,
    customerOfferMatches: () => Array.from({ length: 6 }, (_, index) => ({
      line: `Oferta ${index + 1} | model ${index + 1}`,
      score: index,
      date: '2026-10-01',
      uncertain: false
    })),
    customerLoanMatches: () => [],
    normalize: value => String(value).toLowerCase()
  });
  vm.runInContext(`${extract('customerDocumentInfoForRecord')}\nglobalThis.info = customerDocumentInfoForRecord;`, context);
  const info = context.info({ customerName: 'Anna Testowa' });
  assert.equal((info.tooltip.match(/• Oferta /g) || []).length, 6);
  assert.match(info.tooltip, /Oferta 6 \| model 6/);
  assert.match(css, /\.table-hover-tooltip\.customer-detail-tooltip\s*\{[^}]*max-height: min\(70vh, 640px\);[^}]*pointer-events: auto;/);
  assert.match(extract('attachTableHoverTooltip'), /setTimeout\(hideTableHoverTooltip, 180\)/);
});
