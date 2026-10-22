const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');
const source = fs.readFileSync('app.js', 'utf8');
function extract(name) {
  let start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0);
  if (source.slice(start - 6, start) === 'async ') start -= 6;
  const rest = source.slice(start);
  return rest.slice(0, rest.slice(1).search(/\n(?:async )?function /) + 1);
}
function context() {
  const storage = new Map();
  const ctx = vm.createContext({
    currentSupabaseUser: { id: 'owner' }, owner: true, hasSupabaseConfig: false,
    sharedRowOrders: new Map(), sharedRowOrdersReady: true, sharedRowOrderSaving: new Set(),
    SUPABASE_ROW_ORDER_TABLE: 'table_row_orders',
    localStorage: { getItem: k => storage.get(k), setItem: (k, v) => storage.set(k, v) },
    isoDateForSave: v => v || '', alert: () => assert.fail('unexpected failure'),
    console, renderSharedRowOrderViews() {}
  });
  ctx.canViewPrivateModules = () => ctx.owner;
  for (const name of ['localRowOrderStorageKey', 'readLocalRowOrder', 'applyLocalRowOrder',
    'moveLocalTableRow', 'loadSharedRowOrders', 'persistSharedRowOrder']) vm.runInContext(extract(name), ctx);
  return ctx;
}
const items = ['a', 'b', 'c'].map(id => ({ id, receivedDate: '2026-10-12' }));
test('restore order is tucked into the data menu and hidden when no saved order exists', () => {
  const setup = extract('setupLocalRowDrag');
  assert.match(setup, /querySelector\("\.notebook-transfer-actions"\)/);
  assert.match(setup, /if \(menu\) menu.append\(reset\)/);
  assert.match(setup, /reset.hidden = !canViewPrivateModules\(\) \|\| !readLocalRowOrder\(tableKey\).length/);
  assert.match(setup, /persistSharedRowOrder\(tableKey, \[\]\)/);
});
test('local fallback preserves filtered rows and restricts moves to the same year and owner', async () => {
  const ctx = context();
  assert.equal(await ctx.moveLocalTableRow('repairs', items, 'c', 'a'), true);
  assert.deepEqual(Array.from(ctx.applyLocalRowOrder(items, 'repairs'), r => r.id), ['c', 'a', 'b']);
  assert.equal(await ctx.moveLocalTableRow('repairs', items, 'c', 'b', true), true);
  assert.deepEqual(Array.from(ctx.applyLocalRowOrder(items, 'repairs'), r => r.id), ['a', 'b', 'c']);
  assert.equal(await ctx.moveLocalTableRow('repairs', [...items, { id: 'old', receivedDate: '2025-10-12' }], 'a', 'old'), false);
  await ctx.moveLocalTableRow('repairs', items, 'c', 'a');
  await ctx.moveLocalTableRow('repairs', [items[0], items[2]], 'a', 'c');
  assert.equal(ctx.readLocalRowOrder('repairs').includes('b'), true);
  ctx.owner = false;
  assert.equal(await ctx.moveLocalTableRow('repairs', items, 'b', 'a'), false);
});
test('shared order is saved with a revision check and displayed for gabinet', async () => {
  const ctx = context();
  ctx.hasSupabaseConfig = true;
  ctx.sharedRowOrders.set('repairs', { ids: [], revision: 1 });
  let payload;
  const filters = {};
  ctx.supabaseClient = { from(table) {
    assert.equal(table, 'table_row_orders');
    return { update(value) {
      payload = value;
      return { eq(key, value) { filters[key] = value; return this; }, select() { return this; },
        async maybeSingle() { return { data: { id: 'repairs', data: payload.data, revision: 2 } }; } };
    } };
  } };
  assert.equal(await ctx.moveLocalTableRow('repairs', items, 'c', 'a'), true);
  assert.equal(filters.revision, 1);
  assert.equal(filters.id, 'repairs');
  ctx.owner = false;
  ctx.currentSupabaseUser.id = 'gabinet';
  assert.deepEqual(Array.from(ctx.applyLocalRowOrder(items, 'repairs'), r => r.id), ['c', 'a', 'b']);
  assert.equal(await ctx.moveLocalTableRow('repairs', items, 'b', 'a'), false);
  assert.deepEqual(Array.from(ctx.applyLocalRowOrder(items, 'devices'), r => r.id), ['a', 'b', 'c']);
});
test('failed or conflicting writes keep the saved order', async () => {
  const ctx = context();
  ctx.hasSupabaseConfig = true;
  ctx.sharedRowOrders.set('repairs', { ids: ['a', 'b', 'c'], revision: 4 });
  let warning = '';
  ctx.alert = text => { warning = text; };
  ctx.loadSharedRowOrders = async () => {};
  ctx.supabaseClient = { from() { return { update() { return {
    eq() { return this; }, select() { return this; }, maybeSingle: async () => ({ data: null })
  }; } }; } };
  assert.equal(await ctx.moveLocalTableRow('repairs', items, 'c', 'a'), false);
  assert.ok(warning.includes('innym komputerze'));
  assert.deepEqual(Array.from(ctx.readLocalRowOrder('repairs')), ['a', 'b', 'c']);
  ctx.sharedRowOrdersReady = false;
  assert.equal(await ctx.moveLocalTableRow('repairs', items, 'c', 'a'), false);
});
test('row order migration permits reads for app users and writes only for SATIS', () => {
  const sql = fs.readFileSync('supabase-row-order.sql', 'utf8');
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /grant update\(data\)/i);
  assert.match(sql, /public\.is_satis_app_user\(\) and public\.is_satis_owner\(\)/);
  assert.match(sql, /new\.revision := old\.revision \+ 1/);
  assert.doesNotMatch(sql, /delete from|drop table|truncate /i);
});
