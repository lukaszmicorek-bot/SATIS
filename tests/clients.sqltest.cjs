const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const migration = fs.readFileSync(path.join(__dirname, '../supabase-clients.sql'), 'utf8');

test('clients RPCs fail closed and expose no direct table access', () => {
  assert.equal((migration.match(/security definer set search_path = ''/g) || []).length, 4);
  assert.equal((migration.match(/public\.is_satis_owner\(\) is not true/g) || []).length, 4);
  assert.equal((migration.match(/public\.is_satis_app_user\(\) is not true/g) || []).length, 4);
  assert.equal((migration.match(/lower\(auth.jwt\(\)->>'email'\)='satis@pracowniasluchu.pl'/g) || []).length, 4);
  assert.match(migration, /force row level security/);
  assert.match(migration, /revoke all on public\.%I from public, anon, authenticated/);
  assert.doesNotMatch(migration, /grant\s+(select|insert|update|delete|all)\s+on\s+(table\s+)?public\.customer/i);
  assert.match(migration, /revision is distinct from p_expected_revision/);
  assert.match(migration, /primary key \(source_type, source_id\)/);
  assert.match(migration, /request_row\.fingerprint is distinct from fp/);
  assert.doesNotMatch(migration, /returning to_jsonb\(customer_/);
  assert.doesNotMatch(migration, /drop table|truncate|delete from public\.(device_records|repair_records|loan_contracts)/i);
});

const pg = '/opt/homebrew/opt/postgresql@17/bin';
test('isolated PostgreSQL: roles, writes, retry, conflict, links, visits, erasure', {
  skip: !fs.existsSync(`${pg}/initdb`) || process.getuid?.() === 0 ? 'Local PostgreSQL unavailable; SQL policy tests still run' : false,
}, () => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'satis-clients-test-'));
  fs.chmodSync(folder, 0o700);
  const data = path.join(folder, 'db');
  const run = (tool, args, input) => {
    const result = spawnSync(`${pg}/${tool}`, args, {input, encoding: 'utf8', timeout: 30000});
    assert.equal(result.status, 0, `${tool}: ${result.stderr || result.error || result.stdout}`);
    return result.stdout;
  };
  const sql = value => run('psql', ['-h', folder, '-p', '56387', '-d', 'postgres', '-X', '-v', 'ON_ERROR_STOP=1', '-q'], value);
  let started = false;
  try {
    run('initdb', ['-D', data, '-A', 'trust', '--no-locale', '--encoding=UTF8']);
    run('pg_ctl', ['-D', data, '-l', path.join(folder, 'postgres.log'), '-o', `-c listen_addresses='' -k ${folder} -p 56387`, '-w', 'start']);
    started = true;
    sql(`create role anon; create role authenticated; create schema auth;
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid',true),'')::uuid $$;
      create function auth.jwt() returns jsonb language sql stable as $$ select jsonb_build_object('email',coalesce(nullif(current_setting('test.email',true),''),'satis@pracowniasluchu.pl')) $$;
      grant usage on schema auth to public; grant execute on function auth.uid() to public;
      create function public.is_satis_app_user() returns boolean language sql stable as $$ select auth.uid() is not null $$;
      create function public.is_satis_owner() returns boolean language sql stable as $$ select auth.uid()='00000000-0000-0000-0000-000000000001'::uuid $$;
      create table public.device_records(id text primary key,data jsonb); create table public.repair_records(id text primary key,data jsonb);
      create table public.loan_contracts(id text primary key,data jsonb); create table public.pricing_offer_history(id text primary key,data jsonb);
      create table public.pricing_order_history(id text primary key,data jsonb); create table public.pricing_complaint_history(id text primary key,data jsonb);
      insert into public.device_records values ('synthetic-device','{"customerName":"Test Osoba"}');`);
    sql(migration);
    // Repeat migration must preserve schema/data and remain idempotent.
    sql(migration);
    const owner = `set role authenticated; select set_config('test.uid','00000000-0000-0000-0000-000000000001',false);`;
    sql(`${owner} do $$ declare r jsonb; begin
      r:=public.satis_clients_write('10000000-0000-0000-0000-000000000001','PROFILE','20000000-0000-0000-0000-000000000001',null,
        '{"full_name":"Test Osoba","phone":"500600800","location":"P63"}');
      if r->>'revision'<>'1' or r ? 'full_name' then raise exception 'Bad minimal response'; end if;
      r:=public.satis_clients_write('10000000-0000-0000-0000-000000000001','PROFILE','20000000-0000-0000-0000-000000000001',null,
        '{"full_name":"Test Osoba","phone":"500600800","location":"P63"}');
      if r->>'revision'<>'1' then raise exception 'Retry created mutation'; end if;
      begin
        perform public.satis_clients_write('10000000-0000-0000-0000-000000000009','PROFILE','20000000-0000-0000-0000-000000000002',null,
          '{"full_name":"Test Osoba","phone":"500600800","location":"P50"}');
        raise exception 'Duplicate card accepted';
      exception when sqlstate 'PT423' then null; end;
      begin
        perform public.satis_clients_write('10000000-0000-0000-0000-000000000002','PROFILE','20000000-0000-0000-0000-000000000001',0,
          '{"full_name":"Test Osoba","location":"P50"}');
        raise exception 'Stale revision accepted';
      exception when sqlstate 'PT409' then null; end;
      perform public.satis_clients_write('10000000-0000-0000-0000-000000000003','LINK','20000000-0000-0000-0000-000000000001',1,
        '{"source_type":"device","source_id":"synthetic-device"}');
      r:=public.satis_client_detail('20000000-0000-0000-0000-000000000001');
      if jsonb_array_length(r->'links')<>1 then raise exception 'Link missing'; end if;
      perform public.satis_clients_write('10000000-0000-0000-0000-000000000004','ACTIVITY','30000000-0000-0000-0000-000000000001',null,
        jsonb_build_object('customer_id','20000000-0000-0000-0000-000000000001','kind','VISIT','title','Wizyta','starts_at',now()+interval '1 day','location','P63','status','PLANNED','duration_minutes',30));
      if jsonb_array_length(public.satis_clients_upcoming())<>1 then raise exception 'Visit missing'; end if;
      begin
        perform public.satis_clients_write('10000000-0000-0000-0000-000000000005','ACTIVITY','30000000-0000-0000-0000-000000000002',null,
          jsonb_build_object('customer_id','20000000-0000-0000-0000-000000000001','kind','VISIT','title','Wizyta','starts_at',now()+interval '1 day','location','P63','status','PLANNED','duration_minutes',30));
        raise exception 'Overlap accepted';
      exception when sqlstate 'PT422' then null; end;
      begin
        perform public.satis_clients_write('10000000-0000-0000-0000-000000000006','DELETE','20000000-0000-0000-0000-000000000001',2,'{}');
        raise exception 'Delete with planned visit accepted';
      exception when sqlstate '22023' then null; end;
    end $$;`);
    for (const [role, uid] of [['anon',''], ['authenticated','00000000-0000-0000-0000-000000000002']]) {
      sql(`set role ${role}; select set_config('test.uid','${uid}',false); do $$ begin
        begin perform public.satis_clients_overview(); raise exception 'Read leaked'; exception when insufficient_privilege then null; end;
        begin perform public.satis_clients_upcoming(); raise exception 'Visits leaked'; exception when insufficient_privilege then null; end;
        begin perform public.satis_client_detail('20000000-0000-0000-0000-000000000001'); raise exception 'Detail leaked'; exception when insufficient_privilege then null; end;
        begin perform public.satis_clients_write('10000000-0000-0000-0000-000000000099','DELETE','20000000-0000-0000-0000-000000000001',2,'{}'); raise exception 'Write allowed'; exception when insufficient_privilege then null; end;
        begin perform 1 from public.customer_profiles; raise exception 'Direct access leaked'; exception when insufficient_privilege then null; end;
      end $$;`);
    }
    sql(`${owner} do $$ declare r jsonb; begin
      perform public.satis_clients_write('10000000-0000-0000-0000-000000000007','ACTIVITY','30000000-0000-0000-0000-000000000001',1,
        jsonb_build_object('customer_id','20000000-0000-0000-0000-000000000001','kind','VISIT','title','Wizyta','starts_at',now()+interval '1 day','location','P63','status','COMPLETED','duration_minutes',30));
      perform public.satis_clients_write('10000000-0000-0000-0000-000000000008','DELETE','20000000-0000-0000-0000-000000000001',2,'{}');
      r:=public.satis_clients_overview();
      if (r->>'total')::integer<>0 then raise exception 'Delete failed'; end if;
    end $$;
    reset role; do $$ begin
      if not exists(select 1 from public.device_records where id='synthetic-device') then raise exception 'Source deleted'; end if;
      if exists(select 1 from public.customer_activities) then raise exception 'Activity retained'; end if;
      if exists(select 1 from public.customer_write_requests where result ? 'full_name' or result ? 'note') then raise exception 'PII in retry ledger'; end if;
    end $$;`);
  } finally {
    if (started) spawnSync(`${pg}/pg_ctl`, ['-D', data, '-m', 'immediate', '-w', 'stop'], {encoding:'utf8',timeout:10000});
    fs.rmSync(folder, {recursive:true,force:true});
  }
});
