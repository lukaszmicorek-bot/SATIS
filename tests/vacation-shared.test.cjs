const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../app.js'), 'utf8');
function extract(name) {
  const start = source.search(new RegExp(`^(?:async )?function ${name}\\(`, 'm'));
  assert.ok(start >= 0);
  const rest = source.slice(start);
  return rest.slice(0, rest.slice(1).search(/\n(?:async )?function /) + 1);
}
function setup(response) {
  const calls = [], observed = [];
  let id = 0;
  const context = vm.createContext({
    AbortController, window: {setTimeout, clearTimeout},
    hasSupabaseConfig: true, currentSupabaseUser: {id: 'shared'}, vacationRequestsSupabaseAvailable: true,
    submitVacationRequest: {draft: {userId: 'shared'}}, makeId: () => `operation-${++id}`,
    currentWorkstationName: () => 'P63', SUPABASE_VACATION_REQUEST_TABLE: 'vacation_requests',
    satisDataStore: {observe: (...args) => observed.push(args)}, normalizeVacationRequest: data => data,
    supabaseClient: {rpc: (name, args) => {
      calls.push({name, args});
      return {abortSignal: async signal => { assert.ok(signal); return response(args); }};
    }}
  });
  vm.runInContext(extract('persistSharedVacationRequest'), context);
  return {context, calls, observed};
}
const request = {id: 'request', employeeId: 'oliwia', status: 'OCZEKUJE'};
test('shared submission uses server receipt and stable operation on retry, without PIN', async () => {
  const {context, calls, observed} = setup(args => ({data: {ok: true,
    receipt: [{table: 'vacation_requests', id: 'request', data: {...args.p_request, employeeName: 'Server Name'}, revision: 1}]}}));
  assert.equal((await context.persistSharedVacationRequest(request)).employeeName, 'Server Name');
  await context.persistSharedVacationRequest(request);
  assert.equal(calls[0].args.p_operation, calls[1].args.p_operation);
  assert.equal(calls[0].name, 'vacation_submit_shared');
  assert.ok(!('p_pin' in calls[0].args));
  assert.equal(observed.length, 2);
  await context.persistSharedVacationRequest({...request, dateFrom: '2026-10-20'});
  assert.notEqual(calls[2].args.p_operation, calls[0].args.p_operation);
});
test('unavailable migration and invalid receipt never become successful local writes', async () => {
  for (const [result, message] of [
    [{data: {ok: false, message: 'Request rejected'}}, /Request rejected/],
    [{error: {code: 'PGRST202'}}, /supabase-vacation-shared.sql/],
    [{data: {ok: true, receipt: []}}, /potwierdzenia/]
  ]) {
    const {context, observed} = setup(() => result);
    await assert.rejects(context.persistSharedVacationRequest(request), message);
    assert.equal(observed.length, 0);
  }
});
test('account switch discards response, and vacation form has no PIN field', async () => {
  const {context, observed} = setup(() => {
    context.submitVacationRequest.draft = null;
    return {data: {ok: true, receipt: [{table: 'vacation_requests', id: 'request', data: request}]}};
  });
  await assert.rejects(context.persistSharedVacationRequest(request), /Sesja/);
  assert.equal(observed.length, 0);
  const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
  assert.ok(!html.includes('vacationPinInput'));
  assert.match(extract('submitVacationRequest'), /persistSharedVacationRequest\(request\)/);
  assert.match(extract('clearSensitiveApplicationState'), /submitVacationRequest\.draft = null/);
});
test('confirmed submission invalidates older reads only after the write and session check', () => {
  const submit = extract('submitVacationRequest');
  const invalidate = submit.indexOf('loadVacationData.sequence =');
  assert.ok(invalidate > submit.indexOf('if (!sharedAccount) await persistVacationRecord'));
  assert.ok(invalidate > submit.indexOf('if (authUser !== currentSupabaseUser || submitVacationRequest.draft?.userId'));
  assert.ok(invalidate < submit.indexOf('vacationRequests = normalizeVacationRequests'));
  const load = extract('loadVacationData');
  assert.match(load, /sequence !== loadVacationData.sequence/);
});
