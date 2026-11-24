// Browser fixture: no external API, credentials or customer data.
function installSyntheticSupabase() {
  const user = { id: '00000000-0000-4000-8000-000000000001', email: 'satis@pracowniasluchu.pl' };
  const calls = [];
  const stamp = '2026-09-08T09:00:00.000Z';
  const row = (id, data) => ({ id, data: { ...data, id }, revision: 1, updated_at: stamp });
  const make = (count, prefix, data) => Array.from({ length: count }, (_, index) => row(
    prefix + String(index).padStart(6, '0'), { ...data, serialNumber: prefix + index }
  ));
  const tables = {
    device_records: [...make(10000, 'test-device-', { deviceName: 'Model testowy', type: 'NA STANIE', location: 'P63', receivedDate: '2026-09-01' }),
      ...make(3, 'demo-test-', { deviceName: 'Demo testowe', location: 'P63' })],
    repair_records: make(160, 'test-repair-', { deviceName: 'Serwis testowy', receivedDate: '2026-09-01', location: 'P63' }),
    pricing_records: [row('test-price', { model: 'Model z cennika', manufacturer: 'PHONAK', idProduct: 'TEST', nfzCode: 'P.01.01.00', grossPrice: 1200 })],
    app_authorized_users: [{ user_id: user.id, active: true, role: 'satis' }],
    table_row_orders: ['devices', 'demo', 'repairs'].map(id => row(id, { ids: [] })),
    loan_contracts: [], pricing_offer_history: [], pricing_order_history: [],
    pricing_complaint_history: [], pcpr_list: [], capd_history: [], record_audit_logs: [], device_private_payments: []
  };

  class Query {
    constructor(table) { this.table = table; this.filters = []; this.orders = []; this.cap = Infinity; }
    select() { return this; }
    eq(key, value) { this.filters.push(row => row[key] === value); return this; }
    gt(key, value) { this.filters.push(row => row[key] > value); return this; }
    in(key, values) { this.filters.push(row => values.includes(row[key])); return this; }
    like(key, value) { this.filters.push(row => String(row[key]).startsWith(value.slice(0, -1))); return this; }
    not(key, operator, value) {
      if (operator !== 'like') throw new Error('Unsupported mock filter');
      this.filters.push(row => !String(row[key]).startsWith(value.slice(0, -1)));
      return this;
    }
    order(key, options = {}) { this.orders.push([key, options.ascending !== false]); return this; }
    limit(value) { this.cap = value; return this; }
    range(start, end) { this.start = start; this.cap = end - start + 1; return this; }
    maybeSingle() { this.singleRow = true; return this; }
    then(resolve, reject) {
      return Promise.resolve().then(async () => {
        await window.__qa.waitForTable?.(this.table);
        if (!Object.hasOwn(tables, this.table)) throw new Error(`Unmodelled query: ${this.table}`);
        let rows = tables[this.table].filter(row => this.filters.every(accept => accept(row)));
        for (const [key, asc] of [...this.orders].reverse()) {
          rows.sort((a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0) * (asc ? 1 : -1));
        }
        rows = rows.slice(this.start || 0, (this.start || 0) + this.cap);
        return { data: structuredClone(this.singleRow ? rows[0] || null : rows), error: null };
      }).then(resolve, reject);
    }
  }
  const responses = {
    satis_schema_version: 20260908, vacation_privacy_schema_version: 20260908,
    vacation_read_authorized: { userId: user.id, employees: [], requests: [], employeeIds: [], watermark: stamp },
    vacation_change_version: stamp, satis_pending_document_sync: [], satis_clients_upcoming: [],
    complaint_shipping_accounts_read: {}
  };
  window.__qaClient = {
    from: table => new Query(table),
    auth: {
      async getSession() { return { data: { session: { user, access_token: 'SYNTHETIC-NOT-A-TOKEN' } }, error: null }; },
      onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; },
      async signOut() { return { error: null }; }
    },
    rpc(name) {
      calls.push({ name });
      const request = Promise.resolve(Object.hasOwn(responses, name) ? { data: responses[name], error: null }
        : { data: null, error: { code: 'PGRST202', message: 'Unmodelled mock operation' } });
      request.abortSignal = () => request;
      return request;
    },
    channel() {
      const channel = { on() { return channel; }, subscribe(callback) { queueMicrotask(() => callback('SUBSCRIBED')); return channel; }, unsubscribe() {} };
      return channel;
    },
    removeChannel() {}
  };
  window.__qa = { calls };
  localStorage.setItem('zeszyt-aparatow-workstation-name-v1', 'P63');
  localStorage.setItem('zeszyt-aparatow-demo-return-reminder-last-shown', String(Date.now()));
}

module.exports = { installSyntheticSupabase };
