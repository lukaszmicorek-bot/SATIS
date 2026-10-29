const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
function extract(name) {
  let start = source.indexOf(`function ${name}(`);
  assert(start >= 0, name);
  if (source.slice(start - 6, start) === 'async ') start -= 6;
  const rest = source.slice(start);
  const end = rest.slice(1).search(/\n(?:async )?function /);
  return rest.slice(0, end + 1);
}
function searchContext() {
  const ctx = vm.createContext({
    records: [], demoRecords: [], repairRecords: [],
    deviceDerived: new Map(), demoDerived: new Map(), repairDerived: new Map(),
    searchInput: { value: '' }, typeFilter: { value: '' }, ezwmFilter: { value: '' },
    fifoFilter: { value: '' }, locationFilter: { value: '' },
    sortState: { key: 'receivedDate', direction: 'desc' }, collator: new Intl.Collator('pl'),
    displayType: (record) => record.type, normalizeEzwmStatus: (value) => value || '',
    normalizeRepairLocation: (value) => value || '', deviceSortValue: (record, key) => record[key],
    updateDeviceTypeSelectStyles() {}, updateDocumentLocationAccents() {}, resetAndRenderDeviceViews() {}
  });
  vm.runInContext(source.match(/const fields = \[[\s\S]*?\];/)[0], ctx);
  for (const name of ['normalize', 'normalizeDeviceSearchText', 'deviceSearchQuery', 'deviceMatchesSearch',
    'isDeviceCharger', 'deviceEzwmStatus', 'filteredRecords', 'compareByAge', 'searchMatchCounts', 'showDeviceSearchAcrossFilters', 'renderDeviceSearchFilterNotice']) {
    vm.runInContext(extract(name), ctx);
  }
  return ctx;
}

test('old serials and names are found across all years, beyond the displayed first 500 rows', () => {
  const ctx = searchContext();
  ctx.records = Array.from({ length: 10000 }, (_, index) => ({
    id: String(index), receivedDate: '2026-08-31', deviceName: 'Recent model', serialNumber: `NEW${index}`, type: 'NA STANIE'
  }));
  const old = { id: 'old', receivedDate: '2020-05-10', deviceName: 'Starszy model', serialNumber: 'AB - 123 456', customerName: 'Łucja\u00a0  Żółkiewska-Kocoń', type: 'SPRZEDANY', location: 'T12' };
  ctx.records.push(old);
  for (const query of ['AB123456', 'ab 123-456', '123456', 'Lucja Zolkiewska Kocon', 'kocon lucja', 'ŻÓŁKIEWSKA', 'Lucja Starszy']) {
    ctx.searchInput.value = query;
    assert.deepEqual(Array.from(ctx.filteredRecords(), (record) => record.id), ['old'], query);
    assert.equal(ctx.searchMatchCounts(query).devices, 1, 'counter must use the same matching rule');
  }
  assert.equal(old.serialNumber, 'AB - 123 456', 'search does not rewrite saved data');
  assert.equal(old.customerName, 'Łucja\u00a0  Żółkiewska-Kocoń');
});

test('cached search and fallback have identical results; unrelated records are not matches', () => {
  const ctx = searchContext();
  const record = { id: 'old', serialNumber: 'AB\u200b123-456', customerName: 'Jan   Koń', deviceName: 'Model Test' };
  const fields = ['serialNumber', 'customerName', 'deviceName'];
  const queries = ['AB123456', 'kon jan', 'KON MODEL', 'XYZ999', 'Nowak'];
  const before = queries.map((value) => ctx.deviceMatchesSearch(record, ctx.deviceSearchQuery(value)));
  ctx.deviceDerived.set(record.id, {
    deviceSearchText: ctx.normalizeDeviceSearchText(fields.map((key) => record[key]).join(' ')),
    serialSearchText: ctx.normalizeDeviceSearchText(record.serialNumber).replaceAll(' ', '')
  });
  assert.deepEqual(queries.map((value) => ctx.deviceMatchesSearch(record, ctx.deviceSearchQuery(value))), before);
  assert.deepEqual(before, [true, true, true, false, false]);
});

test('EZWM filters use no reimbursement for legacy chargers without changing hearing-aid statuses',()=>{
  const ctx=searchContext();
  ctx.records=[{id:'charger',deviceName:'Philips Charger',ezwm:'REALIZACJA',type:'SPRZEDANY'},
    {id:'aid',deviceName:'HearLink 3050',ezwm:'REALIZACJA',type:'SPRZEDANY'},
    {id:'returned',deviceName:'Ładowarka',ezwm:'REALIZACJA',type:'ZWROT'}];
  ctx.ezwmFilter.value='BEZ REFUNDACJI';assert.deepEqual(Array.from(ctx.filteredRecords(),row=>row.id),['charger']);
  ctx.ezwmFilter.value='REALIZACJA';assert.deepEqual(Array.from(ctx.filteredRecords(),row=>row.id),['aid']);
  ctx.ezwmFilter.value='BRAK';assert.deepEqual(Array.from(ctx.filteredRecords(),row=>row.id),['returned']);
});

test('filters remain intentional and can be cleared without erasing the search', () => {
  const ctx = searchContext();
  ctx.syncRepairLocationTiles = () => {};
  const old = { id: 'old', serialNumber: 'ABC123', type: 'SPRZEDANY', location: 'T12', receivedDate: '2021-01-01' };
  ctx.records = [old];
  ctx.deviceDerived.set(old.id, { displayType: 'SPRZEDANY', fifoExcluded: true, location: 'T12' });
  ctx.searchInput.value = 'ABC123';
  for (const [filter, value] of [['typeFilter', 'NA STANIE'], ['locationFilter', 'P63'], ['ezwmFilter', 'REALIZACJA'], ['fifoFilter', '180']]) {
    ctx[filter].value = value;
    assert.equal(ctx.filteredRecords().length, 0, filter);
    assert.equal(ctx.searchMatchCounts(ctx.searchInput.value).devices, 1);
    ctx.showDeviceSearchAcrossFilters();
    assert.equal(ctx.searchInput.value, 'ABC123');
    assert.equal(ctx.filteredRecords().length, 1);
  }
  const notice = { children: [], replaceChildren() { this.children = []; }, append(...children) { this.children.push(...children); } };
  ctx.document = { querySelector: () => notice, createElement: () => ({ addEventListener(name, listener) { this.listener = listener; } }) };
  ctx.renderDeviceSearchFilterNotice(1, 0);
  assert.equal(notice.hidden, false);
  assert.match(notice.children[0].textContent, /Ukryte przez filtry: 1/);
  assert.equal(notice.children[1].textContent, 'Pokaż bez filtrów');
  ctx.renderDeviceSearchFilterNotice(1, 1);
  assert.equal(notice.hidden, true);
});

test('Supabase keyset loading continues past server caps, observes revisions and includes the oldest record', async () => {
  for (const cap of [400, 1000]) {
    const rows = Array.from({ length: 2350 }, (_, i) => ({ id: String(i).padStart(5, '0'), revision: i + 1,
      data: { serialNumber: `SER${i}`, receivedDate: i === 2349 ? '2019-01-01' : '2026-01-01' } }));
    const cursors = [], observed = [];
    let normalizations = 0;
    const ctx = vm.createContext({ SUPABASE_PAGE_SIZE: 1000,
      satisDataStore: { observe: (table, row) => observed.push([table, row.id, row.revision]) }, supabaseClient: {
      from: table => {
        assert.equal(table, 'device_records');
        let after = '';
        const query = {
          select(columns) { assert.equal(columns, 'id,data,updated_at,revision'); return this; },
          not(column, operator, value) { assert.deepEqual([column, operator, value], ['id', 'like', 'demo-%']); return this; },
          order(column, options) { assert.equal(column, 'id'); assert.equal(options.ascending, true); return this; },
          gt(column, value) { assert.equal(column, 'id'); after = value; return this; },
          async limit(size) {
            assert.equal(size, 1000);
            cursors.push(after);
            // Updates to timestamps cannot move a row across an ID cursor.
            rows[0].updated_at = `refresh-${cursors.length}`;
            return { data: rows.filter(row => row.id > after).slice(0, Math.min(cap, size)), error: null };
          }
        };
        return query;
      }
    } });
    vm.runInContext(extract('loadSupabaseTable'), ctx);
    const result = await ctx.loadSupabaseTable('device_records', (items) => { normalizations++; return items; }, { excludeIdPrefix: 'demo-' });
    assert.equal(result.length, 2350);
    assert.equal(result.at(-1).receivedDate, '2019-01-01');
    assert.equal(result.at(-1).serialNumber, 'SER2349');
    assert.equal(new Set(result.map((item) => item.id)).size, 2350);
    assert.equal(cursors[1], rows[cap - 1].id, 'advance by last returned ID, not requested page size');
    assert.equal(cursors.at(-1), rows.at(-1).id, 'read through the final empty page');
    assert.equal(normalizations, 1);
    assert.deepEqual(observed, rows.map(row => ['device_records', row.id, row.revision]));
  }
});

test('a failed later page does not silently return partial history', async () => {
  let normalizations = 0;
  const ctx = vm.createContext({ SUPABASE_PAGE_SIZE: 1000, satisDataStore: { observe() {} }, supabaseClient: {
    from: () => {
      let after = '';
      return { select() { return this; }, order() { return this; },
        gt(column, id) { assert.equal(column, 'id'); after = id; return this; },
        async limit() { return after ? { error: { message: 'offline' } } : { data: [{ id: 'one', data: {}, revision: 1 }] }; }
      };
    }
  } });
  vm.runInContext(extract('loadSupabaseTable'), ctx);
  await assert.rejects(ctx.loadSupabaseTable('device_records', (items) => { normalizations++; return items; }), /offline/);
  assert.equal(normalizations, 0);
});
