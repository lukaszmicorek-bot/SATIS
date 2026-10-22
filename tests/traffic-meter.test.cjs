const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
const {create, monthFor, bytes} = require('../traffic-meter.js');
function storage() {
  const map = new Map();
  return {get length() {return map.size;}, key: n => [...map.keys()][n],
    getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), map};
}
test('measures UTF-8 payload once without reading or retaining credentials or response content', async () => {
  const store = storage();
  const meter = create({project: 'https://test.supabase.co', storage: () => store, id: () => 'one',
    clock: () => new Date('2026-10-20T10:00:00Z'),
    fetch: async () => new Response('Zażółć', {headers: {'Content-Type': 'text/plain'}})});
  const response = await meter.fetch('https://test.supabase.co/rest/v1/test', {method: 'POST', body: 'tajne-ż', headers: {Authorization: 'SECRET'}});
  assert.equal(await response.text(), 'Zażółć');
  meter.flush();
  assert.deepEqual(meter.snapshot().months['2026-10'], {sent: bytes('tajne-ż'), received: bytes('Zażółć')});
  assert.ok(!JSON.stringify([...store.map.values()]).includes('SECRET'));
  assert.ok(!JSON.stringify([...store.map.values()]).includes('tajne'));
  await (await meter.fetch('https://elsewhere.test/asset')).text();
  assert.equal(meter.snapshot().months['2026-10'].received, bytes('Zażółć'));
  meter.flush();
});
test('months use Warsaw time; tabs write separate counters and totals survive reopening', async () => {
  assert.equal(monthFor(new Date('2026-09-30T22:30:00Z')), '2026-10');
  const store = storage();
  const options = {project: 'https://test.supabase.co', storage: () => store,
    clock: () => new Date('2026-10-20T10:00:00Z'), fetch: async () => new Response('OK')};
  const first = create({...options, id: () => 'one'}), second = create({...options, id: () => 'two'});
  for (const meter of [first, second]) {await (await meter.fetch('https://test.supabase.co/auth/v1/user')).text(); meter.flush();}
  assert.equal(create({...options, id: () => 'three'}).snapshot().months['2026-10'].received, 4);
  assert.equal(first.snapshot().months['2026-10'].received, 4);
});
test('blocked storage and failed requests do not break the application', async () => {
  const meter = create({project: 'https://test.supabase.co', storage: () => {throw Error('blocked');}, id: () => 'one',
    fetch: async url => {if (url.endsWith('/failed')) throw Error('network'); return new Response('OK');}});
  await assert.rejects(meter.fetch('https://test.supabase.co/failed'), /network/);
  assert.deepEqual(meter.snapshot().months, {});
  assert.equal(await (await meter.fetch('https://test.supabase.co/rest/v1/test')).text(), 'OK');
  meter.flush();
  assert.equal(meter.snapshot().persistent, false);
});
test('owner-only UI and Supabase injection preserve existing authentication storage', () => {
  const app = fs.readFileSync('app.js', 'utf8');
  assert.match(app, /const permitted = canViewPrivateModules\(\) && Boolean\(trafficMeter\)/);
  assert.match(app, /global: \{ fetch: fetchSupabaseWithTimeout \}/);
  assert.match(app, /const fetcher = trafficMeter \? trafficMeter.fetch : window.fetch.bind\(window\)/);
  assert.match(app, /storage: window.sessionStorage/);
  const html = fs.readFileSync('index.html', 'utf8');
  assert.match(html, /id="trafficMeterBtn"[^>]*hidden/);
  assert.ok(html.indexOf('src="traffic-meter.js') < html.indexOf('src="app.js'));
});

test('shared reporting retries absolute counters, excludes its own requests and separates accounts', async () => {
  const store = storage();
  let next = 0;
  const meter = create({project: 'https://test.supabase.co', storage: () => store, id: () => `session-${++next}`,
    clock: () => new Date('2026-10-20T10:00:00Z'), fetch: async () => new Response('OK')});
  const reports = [], server = new Map();
  let fail = true;
  meter.connect({rpc: (name, args) => ({abortSignal: async () => {
    if (name === 'satis_traffic_report') {
      reports.push(args);
      server.set(args.p_client, args.p_months);
      if (fail) {fail = false; return {error: {message: 'lost response'}};}
      return {data: true};
    }
    return {data: {startedAt: '2026-10-20T10:00:00Z', months: {'2026-10': {sent: 0, received: 2}}}};
  }})});
  meter.setAccount('staff');
  await (await meter.fetch('https://test.supabase.co/rest/v1/test')).text();
  await meter.sync();
  assert.ok(meter.sharedSnapshot().error);
  await meter.sync({read: true});
  assert.equal(server.size, 1, 'lost response uses the same session counter');
  assert.deepEqual(reports[0], reports[1]);
  assert.equal(meter.sharedSnapshot().data.months['2026-10'].received, 2);
  const count = reports.length;
  await (await meter.fetch('https://test.supabase.co/rest/v1/rpc/satis_traffic_report')).text();
  await meter.sync();
  assert.equal(reports.length, count, 'telemetry itself never creates an endless reporting loop');
  meter.setAccount(null);
  assert.equal(meter.sharedSnapshot().data, null, 'logout clears owner summary');
  meter.setAccount('owner');
  await (await meter.fetch('https://test.supabase.co/rest/v1/test')).text();
  await meter.sync();
  assert.equal(server.size, 2, 'new account uses a new counter, never resubmits previous account totals');
  assert.equal(reports.at(-1).p_months['2026-10'].received, 2);
  meter.flush();
});
