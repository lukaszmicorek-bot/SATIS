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
    for (const file of ['supabase-schema.sql','supabase-security-hardening.sql','supabase-document-write-guards.sql',
      'supabase-private-payments.sql','supabase-audit-log.sql']) await db.exec(read(file));
    await db.query('insert into vacation_employees(id,data) values ($1,$2),($3,$4)', [
      'oliwia', {id: 'oliwia', name: 'Oliwia Test', year: 2026, allowance: 26, unit: 'DAYS'},
      'justyna', {id: 'justyna', name: 'Justyna Test', year: 2026, allowance: 26, unit: 'DAYS'}]);
    await db.exec(read('supabase-audit-core.sql'));
    await db.exec(read('supabase-audit-vacation.sql'));
    await db.exec(read('supabase-vacation-shared.sql'));
    await db.exec(read('supabase-vacation-shared.sql'));
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
    await denied(submit({...request, id: 'duplicate'}, randomUUID()));
    await denied(submit({...request, id: 'holiday', dateFrom: '2026-12-25', dateTo: '2026-12-25'}, randomUUID()));
    await denied(db.query('select * from private.vacation_submission_grants'));
    const direct = data => db.query('select satis_write_records($1,$2,$3)', [randomUUID(),
      [{table: 'vacation_requests', id: 'pin-request', data, expectedRevision: 1, delete: false}], 'P63']);
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
    await db.exec('reset role');
    await db.exec("select set_config('request.jwt.claims','{}',false); set role anon;");
    await denied(submit());
    console.log('PASS: shared submission without PIN, pending-only, CAS retry, duplicates, holidays, private grants and role isolation.');
  } finally { await db.close(); }
})().catch(error => { console.error(error.message, error.code || ''); process.exitCode = 1; });
