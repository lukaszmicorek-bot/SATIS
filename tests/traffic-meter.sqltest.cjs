// In-memory PostgreSQL only: no credentials, no production connection.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {PGlite} = require('@electric-sql/pglite');
(async () => {
  const db = new PGlite();
  const owner = '00000000-0000-0000-0000-000000000001';
  const staff = '00000000-0000-0000-0000-000000000002';
  const pc1 = '10000000-0000-0000-0000-000000000001';
  const pc2 = '10000000-0000-0000-0000-000000000002';
  const one = async (sql, args = []) => (await db.query(sql, args)).rows[0];
  const login = async user => {
    await db.exec('reset role');
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [user]);
    await db.exec('set role authenticated');
  };
  const report = (pc, months) => db.query('select satis_traffic_report($1,$2,$3)', [pc, '2026-10-20T10:00:00Z', months]);
  const denied = action => assert.rejects(action, e => ['42501','22023'].includes(e.code));
  try {
    await db.exec(`create role anon nologin; create role authenticated nologin;
      create schema auth; create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
      grant usage on schema auth, public to authenticated, anon;
      create function public.is_satis_app_user() returns boolean language sql stable as
        $$ select auth.uid() in ('${owner}'::uuid,'${staff}'::uuid) $$;
      create function public.is_satis_owner() returns boolean language sql stable as $$ select auth.uid()='${owner}'::uuid $$;`);
    await db.query('insert into auth.users values ($1),($2)', [owner, staff]);
    const migration = fs.readFileSync('supabase-traffic-meter.sql', 'utf8');
    await db.exec(migration); await db.exec(migration);
    await login(staff);
    const counters = {'2026-10': {sent: 100, received: 1000}};
    await report(pc1, counters); await report(pc1, counters);
    await report(pc1, {'2026-10': {sent: 50, received: 100}});
    await report(pc2, {'2026-09': {sent: 20, received: 30}, '2026-10': {sent: 200, received: 2000}});
    assert.equal((await one('select count(*)::int n from satis_traffic_counters')).n, 0, 'gabinet cannot read totals');
    await denied(db.query('select satis_traffic_summary()'));
    await denied(db.query('delete from satis_traffic_counters'));
    await denied(report(pc1, {'2026-10': {sent: -1, received: 0}}));
    await denied(report(pc1, {'2026-10': {sent: 1, received: 1, clientName: 'not allowed'}}));
    await denied(report(pc1, {'2026-99': {sent: 1, received: 1}}));
    await login(owner);
    const summary = (await one('select satis_traffic_summary() result')).result;
    assert.deepEqual(summary.months['2026-10'], {sent: 300, received: 3000});
    assert.deepEqual(summary.months['2026-09'], {sent: 20, received: 30});
    assert.equal((await one('select count(*)::int n from satis_traffic_counters')).n, 3);
    await db.exec("reset role; select set_config('request.jwt.claim.sub','',false); set role anon;");
    await denied(report(pc1, counters));
    await denied(db.query('select satis_traffic_summary()'));
    console.log('PASS: all-PC monthly totals, idempotent retry, stale counters, owner-only reads and anonymous denial.');
  } finally {await db.close();}
})().catch(error => {console.error(error.message, error.code || ''); process.exitCode = 1;});
