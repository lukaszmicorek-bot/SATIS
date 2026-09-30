const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { test } = require('node:test');
const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
function extract(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, name);
  const rest = source.slice(start);
  return rest.slice(0, rest.slice(1).search(/\n(?:async )?function /) + 1);
}
function node(id, dataset = {}, active = false) {
  const classes = new Set(active ? ['active'] : []);
  return { id, dataset, hidden: false, attributes: {}, children: [],
    classList: { contains: name => classes.has(name), toggle(name, on) { on ? classes.add(name) : classes.delete(name); } },
    setAttribute(name, value) { this.attributes[name] = value; },
    replaceChildren(...children) { this.children = children; }
  };
}
function setup() {
  const sections = ['devices', 'repairs', 'pricing', 'capd', 'vacation'].map(name => node(`${name}Notebook`));
  const tabs = Object.entries({devices: ['database', 'demo', 'stock', 'dataControl', 'offer', 'loan', 'rodo'], repairs: ['repairDatabase', 'repairOpen', 'order', 'complaint']})
    .flatMap(([group, views]) => views.map((view, index) => node(view, {view, viewGroup: group}, index === 0)));
  const views = ['database', 'demo', 'stock', 'dataControl', 'repairDatabase', 'repairOpen'].map(view =>
    node(`${view}View`, {viewGroup: view.startsWith('repair') ? 'repairs' : 'devices'}));
  const context = { activeNotebook: 'devices', activePricingView: '', activeDeviceView: 'database',
    currentSupabaseUser: {email: 'satis@pracowniasluchu.pl'}, owner: true,
    notebookSections: sections, tabButtons: tabs, viewSections: views, statsPanel: node('stats'),
    notebookSwitchButtons: ['devices', 'repairs', 'pricing', 'capd', 'pcpr', 'history', 'vacation'].map(name => node(name, {notebook: name})),
    canViewPrivateModules: () => context.owner,
    canViewDocumentHistory: () => Boolean(context.currentSupabaseUser),
    document: {querySelector: () => null},
    renderCounts: {}
  };
  for (const name of ['List', 'Offer', 'Loan', 'Rodo', 'Pcpr', 'Order', 'Complaint', 'History']) context[`pricing${name}View`] = node(name);
  for (const name of ['hideVacationPeriodPreview', 'updateCustomerRelationsPanelVisibility', 'renderCustomerRelations', 'setCurrentYearTitle',
    'renderPricingOfferDeviceList', 'renderPricingOffer', 'renderPricingLoan', 'renderPricingRodo', 'renderPricingPcprList', 'renderPricingOrder', 'renderPricingComplaint',
    'renderPricingDocumentHistory', 'renderPricingRecords', 'updateStats', 'renderRepairRecords', 'renderDataControlView', 'renderDemoRecords',
    'renderStockView', 'renderDeviceViews', 'updateCapdScope', 'renderCapdHistory', 'renderVacationModule']) {
    context[name] = () => { context.renderCounts[name] = (context.renderCounts[name] || 0) + 1; };
  }
  vm.createContext(context);
  for (const name of ['pricingViewNotebook', 'syncNotebookPanels', 'switchPricingView', 'switchView', 'switchNotebook']) vm.runInContext(extract(name), context);
  return context;
}
test('document views route to the correct notebook, preserve form nodes, and return to lists', () => {
  const ctx = setup();
  for (const [view, group] of Object.entries({offer: 'devices', loan: 'devices', rodo: 'devices', order: 'repairs', complaint: 'repairs'})) {
    const panel = ctx[`pricing${view[0].toUpperCase() + view.slice(1)}View`];
    panel.draft = 'unsaved text';
    ctx.switchPricingView(view);
    assert.equal(ctx.activeNotebook, group);
    assert.equal(ctx.activePricingView, view);
    assert.equal(panel.hidden, false);
    assert.equal(ctx.notebookSections.find(n => n.id === 'pricingNotebook').hidden, false);
    assert.equal(ctx.notebookSections.find(n => n.id === `${group}Notebook`).hidden, false);
    assert.equal(ctx.viewSections.filter(n => n.dataset.viewGroup === group).every(n => n.hidden), true);
    assert.equal(ctx.tabButtons.find(n => n.dataset.view === view).attributes['aria-selected'], 'true');
    assert.equal(ctx.statsPanel.hidden, true);
    ctx.switchNotebook('vacation');
    assert.equal(ctx.notebookSections.find(n => n.id === 'pricingNotebook').hidden, true);
    ctx.switchNotebook(group);
    assert.equal(ctx.activePricingView, view, 'return to the previously selected form');
    assert.equal(panel.draft, 'unsaved text');
    ctx.switchView(group === 'devices' ? 'database' : 'repairDatabase', group);
    assert.equal(ctx.notebookSections.find(n => n.id === 'pricingNotebook').hidden, true);
    assert.equal(ctx.statsPanel.hidden, group !== 'devices');
  }
});
test('PCPR and History stand alone, pricing stays available, and gabinet can open History', () => {
  const ctx = setup();
  for (const name of ['pcpr', 'history', 'pricing']) {
    ctx.switchNotebook(name);
    assert.equal(ctx.activeNotebook, name);
    assert.equal(ctx.notebookSections.filter(n => !n.hidden).map(n => n.id).join(','), 'pricingNotebook');
    assert.equal(ctx.activePricingView, name === 'pricing' ? 'list' : name);
  }
  ctx.owner = false;
  ctx.currentSupabaseUser = {email: 'gabinet@pracowniasluchu.pl'};
  ctx.switchNotebook('pcpr');
  ctx.switchNotebook('history');
  assert.equal(ctx.activeNotebook, 'history');
  ctx.switchPricingView('history');
  assert.equal(ctx.activePricingView, 'history');
  ctx.currentSupabaseUser = null;
  ctx.switchNotebook('devices');
  ctx.switchNotebook('history');
  assert.equal(ctx.activeNotebook, 'devices');
  ctx.switchPricingView('pcpr');
  assert.equal(ctx.activeNotebook, 'devices');
});
test('history renderers and previews refuse anonymous access but permit authenticated gabinet', () => {
  const ctx = setup();
  ctx.pricingHistorySelectableEntries = new Map();
  ctx.renderPricingHistoryRelations = () => {};
  ctx.owner = false;
  ctx.currentSupabaseUser = null;
  for (const name of ['loanHistoryList', 'offerHistoryList', 'orderHistoryList', 'complaintHistoryList', 'loanHistoryCount', 'loanDeadlineSummary']) {
    ctx[name] = node(name); ctx[name].children = ['private entry'];
  }
  for (const name of ['renderPricingLoanHistory', 'renderPricingDocumentHistory', 'showPricingHistoryPreview']) vm.runInContext(extract(name), ctx);
  ctx.renderPricingDocumentHistory();
  ctx.renderPricingLoanHistory();
  assert.equal(ctx.loanHistoryList.children.length, 0);
  assert.equal(ctx.offerHistoryList.children.length, 0);
  assert.equal(ctx.loanDeadlineSummary.hidden, true);
  assert.doesNotThrow(() => ctx.showPricingHistoryPreview('offer', {}));
  assert.match(extract('renderPricingDocumentHistory'), /!canViewDocumentHistory\(\)/);
  assert.match(extract('showPricingHistoryPreview'), /!canViewDocumentHistory\(\)/);
  assert.match(extract('updatePrivateModulesVisibility'), /!sharedVisible && \["capd", "vacation", "pcpr", "history"\]/);
});
test('navigation markup is unique, ordered, and linked; history no longer sits under the loan form', () => {
  const top = [...html.matchAll(/data-notebook="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(top, ['devices', 'repairs', 'capd', 'pcpr', 'history', 'pricing', 'vacation']);
  assert.match(html, /data-notebook="history" data-private-shared hidden/);
  for (const view of ['offer', 'loan', 'rodo', 'order', 'complaint']) {
    assert.match(html, new RegExp(`id="${view}Tab"[^>]*aria-controls="pricing${view[0].toUpperCase() + view.slice(1)}View"`));
  }
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size);
  assert.ok(html.indexOf('id="loanHistoryList"') > html.indexOf('id="pricingHistoryView"'));
  assert.doesNotMatch(source, /switchNotebook\("agreements"\)|loanHistorySearchInput|lastAgreementPricingView/);
  assert.match(extract('restorePricingLoanFromHistory'), /switchPricingView\("loan"\)/);
  assert.match(extract('addPricingRecordToOffer'), /switchPricingView\("offer"\)/);
});

test('document tabs form two separate styled groups without changing their roles or routes', () => {
  const groups = [...html.matchAll(/<div class="document-tab-group" role="presentation">([\s\S]*?)<\/div>/g)];
  assert.equal(groups.length, 2);
  assert.deepEqual(groups.map(match => [...match[1].matchAll(/data-view="([^"]+)"/g)].map(tab => tab[1])),
    [['offer', 'loan', 'rodo'], ['order', 'complaint']]);
  groups.forEach((match, index) => assert.equal((match[1].match(/role="tab"/g) || []).length, index === 0 ? 3 : 2));
  const css = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf8');
  assert.match(css, /\.document-tab-group \{[^}]*border-left: 1px solid/);
  assert.match(css, /\.document-tab-group \.tab-button\.active \{/);
  assert.match(css, /@media \(max-width: 640px\) \{\s*\.document-tab-group \{[^}]*border-left: 0;[^}]*border-top:/);
});

test('vacation follows pricing as a separate shortcut with the correct pressed state', () => {
  assert.match(html, /<\/div>\s*<button[^>]*data-notebook="pricing">\s*Cennik\s*<\/button>\s*<button[^>]*aria-pressed="false"[^>]*data-notebook="vacation" data-private-shared hidden>Urlop<\/button>/);
  const ctx = setup();
  const pricing = ctx.notebookSwitchButtons.find(button => button.dataset.notebook === 'pricing');
  const vacation = ctx.notebookSwitchButtons.find(button => button.dataset.notebook === 'vacation');
  for (const button of [pricing, vacation]) button.classList.toggle('notebook-shortcut', true);
  ctx.switchNotebook('vacation');
  assert.equal(vacation.attributes['aria-pressed'], 'true');
  assert.equal(pricing.attributes['aria-pressed'], 'false');
  ctx.switchNotebook('pricing');
  assert.equal(vacation.attributes['aria-pressed'], 'false');
  assert.equal(pricing.attributes['aria-pressed'], 'true');
});
