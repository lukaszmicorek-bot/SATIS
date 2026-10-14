const assert = require('node:assert/strict');
const fs = require('node:fs');
const { PGlite } = require('@electric-sql/pglite');
(async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated;
      create schema auth;
      create table auth.users(id uuid primary key, email text);
      insert into auth.users values ('00000000-0000-0000-0000-000000000001', 'synthetic@example.invalid');
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      create function public.is_satis_app_user() returns boolean language sql stable as $$
        select coalesce(auth.uid() = '00000000-0000-0000-0000-000000000001'::uuid, false) $$;
      create table public.repair_records(id text primary key, data jsonb);
      insert into public.repair_records values ('one', '{"returnDate":"2026-10-14","pickupDate":"","location":"P50"}');
    `);
    await db.exec(fs.readFileSync('supabase-repair-returns.sql', 'utf8'));
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false)`);
    const query = "select public.satis_acknowledge_repair_return('one', '2026-10-14', 'P50', 'P50') as ack";
    const first = (await db.query(query)).rows[0].ack;
    const again = (await db.query(query)).rows[0].ack;
    assert.equal(first.acknowledged_by, '00000000-0000-0000-0000-000000000001');
    assert.equal(first.user_email, 'synthetic@example.invalid');
    assert.equal(first.acknowledged_at, again.acknowledged_at);
    const read = (await db.query("select public.satis_repair_return_acknowledgements(array['one']) as data")).rows[0].data;
    assert.equal(read.length, 1);
    await assert.rejects(db.exec("insert into public.repair_return_acknowledgements(record_id) values ('fake')"), e => e.code === '42501');
    await db.exec("reset role; update public.repair_records set data=jsonb_set(data, '{returnDate}', '\"2026-10-15\"'); set role authenticated;");
    await assert.rejects(db.query(query), e => e.code === 'PT409');
    await db.exec("select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false)");
    await assert.rejects(db.query(query), e => e.code === '42501');
    await db.exec('reset role; set role anon;');
    await assert.rejects(db.query(query), e => e.code === '42501');
    await db.exec('reset role;');
    assert.equal((await db.query("select data->>'pickupDate' as pickup from repair_records where id='one'")).rows[0].pickup, '');
    console.log('OK: return acknowledgement permissions, idempotency, server identity and stale-event rejection; synthetic database only.');
  } finally { await db.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
