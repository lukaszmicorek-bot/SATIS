const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('app.js', 'utf8');
function extract(name) {
  const re = new RegExp(`(?:async )?function ${name}\\(`);
  const start = source.search(re);
  const rest = source.slice(start);
  return rest.slice(0, rest.slice(1).search(/\n(?:async )?function /) + 1);
}
async function main() {
  const writes = [];
  const alerts = [];
  let opened;
  const ctx = vm.createContext({
    currentSupabaseUser: { id: 'owner', email: 'satis@pracowniasluchu.pl' },
    PRIVATE_PAYMENT_EMAIL: 'satis@pracowniasluchu.pl', canManagePricing: () => true,
    pricingMutationInProgress: false, hasSupabaseConfig: true,
    requireInitialDataReady: () => true,
    pricingNfzFilter: { value: 'P.01.01.00' }, makeId: () => 'new-product-id',
    normalizePricingRecordForUse: record => ({ ...record }),
    openPricingRecordDialog: (...args) => { opened = args; },
    pricingRecords: [{ id: 'source', tradeName: 'Existing' }],
    SUPABASE_PRICING_TABLE: 'pricing_records',
    upsertSupabaseRecord: async (table, record) => { writes.push({ table, record }); },
    setPricingMutationBusy: value => { ctx.pricingMutationInProgress = value; },
    savePricingRecords() {}, markPricingUpdatedNow() {}, pricingMetaRecordForSupabase: () => ({ id: 'meta' }),
    rebuildDemoFormSuggestions() {}, renderPricingRecords() {}, renderPricingOfferDeviceList() {}, renderPricingOffer() {}, setCurrentYearTitle() {},
    alert: message => alerts.push(message), console
  });
  for (const name of ['canCreatePricingRecord', 'openNewPricingProduct', 'commitNewPricingRecord']) vm.runInContext(extract(name), ctx);
  assert.equal(ctx.canCreatePricingRecord(), true);
  ctx.currentSupabaseUser.email = 'gabinet@pracowniasluchu.pl';
  ctx.openNewPricingProduct(); assert.equal(opened, undefined);
  assert.equal(await ctx.commitNewPricingRecord({ id: 'blocked' }), false);
  assert.equal(writes.length, 0);
  ctx.currentSupabaseUser.email = 'satis@pracowniasluchu.pl';
  const sourceRecord = { id: 'source', idProduct: 'OLD', orderIndex: 'INDEX', swdCode: 'SWD', tradeName: 'New model', manufacturer: 'Sonic', grossPrice: '1500' };
  ctx.openNewPricingProduct(sourceRecord);
  assert.equal(opened[0].id, 'new-product-id'); assert.equal(opened[0].idProduct, '');
  assert.equal(opened[0].orderIndex, ''); assert.equal(opened[0].swdCode, '');
  assert.equal(sourceRecord.id, 'source'); assert.equal(sourceRecord.idProduct, 'OLD');
  assert.equal(opened[0].nfzCode, 'P.01.01.00'); assert.equal(opened[2].create, true);
  assert.equal(await ctx.commitNewPricingRecord(opened[0]), true);
  assert.equal(ctx.pricingRecords.length, 2); assert.equal(ctx.pricingRecords[0].id, 'source');
  assert.equal(writes[0].record.id, 'new-product-id');
  ctx.upsertSupabaseRecord = async () => { throw new Error('test unavailable'); };
  assert.equal(await ctx.commitNewPricingRecord({ id: 'failed' }), false);
  assert.equal(ctx.pricingRecords.length, 2, 'failed write never becomes a saved catalog row');
  assert.equal(ctx.pricingMutationInProgress, false);
  assert.match(extract('savePricingRecordEditor'), /pricingCreatingRecord.*nameKey|pricingCreatingRecord && nameKey/s);
  assert.match(source, /if \(pricingCreatingRecord && !canCreatePricingRecord\(\)\) return;/);
  const node = () => ({
    children: [], dataset: {}, style: { setProperty() {} }, classList: { add() {}, toggle() {} },
    handlers: {}, append(...children) { this.children.push(...children); },
    setAttribute() {}, addEventListener(name, handler) { this.handlers[name] = handler; }
  });
  Object.assign(ctx, {
    document: { createElement: node }, isPricingModelUnavailable: () => false,
    pricingManufacturerTone: () => ({}), formatPricingPrice: value => String(value),
    createPricingPriceElement: value => String(value), pricingChargerWarrantyTooltip: () => '',
    normalizePricingPrice: value => Number(value), pricingOfferPatientGroup: () => '',
    openPricingRecordDialog: record => { opened = record; }, pricingMutationInProgress: false
  });
  vm.runInContext(extract('createPricingRow'), ctx);
  const row = ctx.createPricingRow(sourceRecord, 0);
  const edit = row.children[3].children[0];
  assert.match(edit.className, /pricing-product-edit-btn/);
  assert.equal(edit.disabled, false, 'editing independent of patient group required for offer');
  edit.handlers.click(); assert.equal(opened, sourceRecord);
  ctx.canManagePricing = () => false;
  assert.equal(ctx.createPricingRow(sourceRecord, 0).children[3].children.length, 0, 'staff receives no product edit button');
  console.log('OK: owner-only pricing creation, fresh identity, source preserved, confirmed insert and failed-save recovery.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
