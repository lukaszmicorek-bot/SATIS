// Isolated PostgreSQL: real CAS and vacation guards. No production connections.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { PGlite } = require('@electric-sql/pglite');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
(async () => {
  const db = new PGlite();
  const owner = '00000000-0000-0000-0000-000000000001';
  const staff = '00000000-0000-0000-0000-000000000002';
  const otherStaff = '00000000-0000-0000-0000-000000000003';
  const one = async (sql, args = []) => (await db.query(sql, args)).rows[0];
  const login = async (id, email) => {
    await db.exec('reset role');
    await db.query("select set_config('request.jwt.claims',$1,false)", [JSON.stringify({sub: id, email})]);
    await db.exec('set role authenticated');
  };
  const request = {id: 'pin-request', employeeId: 'oliwia', employeeName: 'Forged', year: 2026,
    dateFrom: '2026-10-19', dateTo: '2026-10-20', type: 'WYPOCZYNKOWY', hours: 0, days: 999,
    status: 'ZATWIERDZONY', ownerLeave: true, decidedBy: 'forged', notes: ''};
  const operation = randomUUID();
  const submit = async (data = request, op = operation) => (await one(
    'select vacation_submit_shared($1,$2,$3) result', [op, data, 'P63'])).result;
  const denied = promise => assert.rejects(promise, e => ['42501','23505','23514','PT409','22023'].includes(e.code));
  try {
    await db.exec(`
      create role anon nologin; create role authenticated nologin;
      create schema auth; create schema storage;
      create table auth.users(id uuid primary key,email text);
      create function auth.jwt() returns jsonb language sql stable as
        $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
      create function auth.uid() returns uuid language sql stable as $$ select (auth.jwt()->>'sub')::uuid $$;
      grant usage on schema auth,public to authenticated,anon;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid,bucket_id text,owner_id text);
      alter table storage.objects enable row level security;
      create publication supabase_realtime;
      alter default privileges in schema public grant select,insert,update,delete,truncate,references,trigger on tables to authenticated;
    `);
    await db.query('insert into auth.users values ($1,$2),($3,$4)', [owner,'satis@pracowniasluchu.pl',staff,'gabinet@example.test']);
    await db.query('insert into auth.users values ($1,$2)', [otherStaff, 'other@example.test']);
    for (const file of ['supabase-schema.sql','supabase-security-hardening.sql','supabase-document-write-guards.sql',
      'supabase-private-payments.sql','supabase-audit-log.sql']) await db.exec(read(file));
    await db.query('insert into vacation_employees(id,data) values ($1,$2),($3,$4)', [
      'oliwia', {id: 'oliwia', name: 'Oliwia Test', year: 2026, allowance: 26, unit: 'DAYS'},
      'justyna', {id: 'justyna', name: 'Justyna Test', year: 2026, allowance: 26, unit: 'DAYS'}]);
    await db.exec(read('supabase-audit-core.sql'));
    await db.exec(read('supabase-audit-vacation.sql'));
    await db.exec(read('supabase-vacation-shared.sql'));
    await db.exec(read('supabase-vacation-shared.sql'));
    await db.exec(read('supabase-vacation-weekend-range.sql'));
    await db.exec(read('supabase-vacation-weekend-range.sql'));
    await login(staff, 'gabinet@example.test');
    await denied(submit({...request, employeeId: 'unknown'}, randomUUID()));
    const saved = await submit();
    assert.equal(saved.ok, true);
    assert.equal(saved.receipt[0].data.status, 'OCZEKUJE');
    assert.equal(saved.receipt[0].data.employeeName, 'Oliwia Test');
    assert.equal(saved.receipt[0].data.ownerLeave, false);
    assert.equal(saved.receipt[0].data.days, 2);
    assert.deepEqual(await submit(), saved, 'same operation returns same receipt, not another insert');
    assert.equal((await one("select vacation_is_my_employee('oliwia') allowed")).allowed, false);
    assert.equal((await one('select count(*)::int n from vacation_requests')).n, 0, 'no persistent read grant');
    const before = (await one('select vacation_read_authorized() result')).result;
    assert.equal(before.requests.some(row => row.id === request.id), false,
      'reproduce the bug: a saved shared-account pending request disappears from the read');
    await db.exec('reset role');
    await db.exec(read('supabase-vacation-read-submitted.sql'));
    await db.exec(read('supabase-vacation-read-submitted.sql'));
    await login(staff, 'gabinet@example.test');
    const reread = (await one('select vacation_read_authorized() result')).result;
    const pending = reread.requests.find(row => row.id === request.id);
    assert.equal(pending.data.status, 'OCZEKUJE');
    assert.equal(pending.data.redacted, true);
    assert.equal(pending.data.notes, undefined);
    assert.equal(pending.data.hours, undefined);
    assert.equal(pending.revision, null);
    assert.equal((await one('select count(*)::int n from vacation_requests')).n, 0,
      'the fix does not grant raw-table access or editing');
    await login(otherStaff, 'other@example.test');
    assert.equal((await one('select vacation_read_authorized() result')).result.requests
      .some(row => row.id === request.id), false, 'another account cannot see this pending submission');
    await login(owner, 'satis@pracowniasluchu.pl');
    const ownerRead = (await one('select vacation_read_authorized() result')).result;
    assert.equal(ownerRead.requests.find(row => row.id === request.id).data.redacted, false);
    const approved = { ...saved.receipt[0].data, status: 'ZATWIERDZONY' };
    await db.query('select satis_write_records($1,$2,$3)', [randomUUID(),
      [{table: 'vacation_requests', id: request.id, data: approved, expectedRevision: 1, delete: false}], 'SATIS']);
    await login(staff, 'gabinet@example.test');
    assert.equal((await one('select vacation_read_authorized() result')).result.requests
      .find(row => row.id === request.id).data.status, 'ZATWIERDZONY');
    await denied(submit({...request, id: 'duplicate'}, randomUUID()));
    await denied(submit({...request, id: 'holiday', dateFrom: '2026-12-25', dateTo: '2026-12-25'}, randomUUID()));
    await denied(db.query('select * from private.vacation_submission_grants'));
    const direct = data => db.query('select satis_write_records($1,$2,$3)', [randomUUID(),
      [{table: 'vacation_requests', id: 'pin-request', data, expectedRevision: 2, delete: false}], 'P63']);
    await denied(direct({...saved.receipt[0].data, status: 'ZATWIERDZONY'}));
    await denied(db.query('select satis_write_records($1,$2,$3)', [randomUUID(),
      [{table: 'vacation_requests', id: 'no-pin', data: {...saved.receipt[0].data, id: 'no-pin'},
        expectedRevision: null, delete: false}], 'P63']));
    await db.exec('reset role');
    assert.equal((await one('select count(*)::int n from private.vacation_submission_grants')).n, 0);
    assert.equal((await one('select count(*)::int n from vacation_requests')).n, 1);
    await db.query('insert into vacation_employee_accounts(employee_id,user_id) values ($1,$2)', ['justyna', staff]);
    await login(staff, 'gabinet@example.test');
    assert.equal((await one("select vacation_is_my_employee('justyna') allowed")).allowed, true,
      'personal account mappings still work');
    const weekend = {...request, id: 'weekend-range', type: 'ZA WEEKEND',
      dateFrom: '2026-06-15', dateTo: '2026-06-16', compensationDate: '2026-06-13', compensationDateTo: '2026-06-14', compensationAmount: 2};
    const rangeSaved = await submit(weekend, randomUUID());
    assert.equal(rangeSaved.receipt[0].data.days, 2);
    assert.equal(rangeSaved.receipt[0].data.compensationDateTo, '2026-06-14');
    await denied(submit({...weekend, id: 'reuse-sunday', dateFrom: '2026-06-17', dateTo: '2026-06-17',
      compensationDate: '2026-06-14', compensationAmount: 1}, randomUUID()));
    await denied(submit({...weekend, id: 'weekday', compensationDate: '2026-06-11', compensationDateTo: '2026-06-11'}, randomUUID()));
    await denied(submit({...weekend, id: 'too-long', compensationDateTo: '2026-06-15'}, randomUUID()));
    const legacySaved = await submit({...weekend, id: 'single', dateFrom: '2026-06-18', dateTo: '2026-06-18',
      compensationDate: '2026-06-07', compensationDateTo: '', compensationAmount: 1}, randomUUID());
    assert.equal(legacySaved.receipt[0].data.compensationDateTo, '2026-06-07');
    await login(owner, 'satis@pracowniasluchu.pl');
    await db.query('select satis_write_records($1,$2,$3)', [randomUUID(),
      [{table: 'vacation_requests', id: request.id, data: {...approved, status: 'ODRZUCONY'}, expectedRevision: 2, delete: false}], 'SATIS']);
    await login(staff, 'gabinet@example.test');
    assert.equal((await one('select vacation_read_authorized() result')).result.requests
      .find(row => row.id === request.id).data.status, 'ODRZUCONY', 'a rejected submission remains visible to the submitting account');
    await login(otherStaff, 'other@example.test');
    assert.equal((await one('select vacation_read_authorized() result')).result.requests
      .some(row => row.id === request.id), false);
    await db.exec('reset role');
    await db.exec("select set_config('request.jwt.claims','{}',false); set role anon;");
    await denied(submit());
    console.log('PASS: shared submission, pending/approved/rejected rereads, redaction, CAS retry, duplicates, holidays and role isolation.');
  } finally { await db.close(); }
})().catch(error => { console.error(error.message, error.code || ''); process.exitCode = 1; });
