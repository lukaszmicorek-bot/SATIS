(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SatisTraffic = api;
})(typeof globalThis === "undefined" ? this : globalThis, function () {
  const monthFormatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit"
  });
  const monthFor = date => monthFormatter.format(date);
  const bytes = body => {
    if (typeof body === "string" || body instanceof URLSearchParams) return new TextEncoder().encode(String(body)).byteLength;
    if (typeof Blob !== "undefined" && body instanceof Blob) return body.size;
    if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) return body.byteLength;
    return 0;
  };
  function create({ project, fetch: originalFetch, storage, clock = () => new Date(), id = () => crypto.randomUUID() }) {
    const origin = new URL(project).origin;
    const prefix = `satis-api-traffic-v1:${new URL(project).host}:`;
    let clientId = id(), key = prefix + clientId;
    let current = { startedAt: "", months: {} };
    let timer = 0, listener = () => {}, persistent = true;
    let account = null, connection = null, syncing = false, shared = null, syncError = "", generation = 0;
    const store = () => { try { return storage(); } catch (_) { return null; } };
    function flush() {
      clearTimeout(timer); timer = 0;
      const target = store();
      if (current.startedAt) {
        try { if (!target) throw new Error(); target.setItem(key, JSON.stringify(current)); persistent = true; }
        catch (_) { persistent = false; }
      }
      listener();
    }
    function add(sent, received) {
      const date = clock();
      if (!current.startedAt) current.startedAt = date.toISOString();
      const row = current.months[monthFor(date)] ||= { sent: 0, received: 0 };
      row.sent += sent; row.received += received;
      if (!timer) timer = setTimeout(flush, 2000);
    }
    async function measuredFetch(input, init) {
      let tracked = false;
      try {
        const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
        tracked = url.origin === origin && !/\/rest\/v1\/rpc\/satis_traffic_(?:report|summary)$/.test(url.pathname);
      } catch (_) {}
      const response = await originalFetch(input, init);
      if (!tracked) return response;
      add(bytes(init?.body), 0);
      if (!response.body || typeof TransformStream === "undefined") return response;
      const body = response.body.pipeThrough(new TransformStream({
        transform(chunk, controller) { add(0, chunk.byteLength); controller.enqueue(chunk); }
      }));
      const result = new Response(body, {status: response.status, statusText: response.statusText, headers: response.headers});
      for (const name of ["url", "redirected", "type"]) Object.defineProperty(result, name, {value: response[name]});
      return result;
    }
    function snapshot() {
      const months = {}; let startedAt = current.startedAt;
      const entries = new Map([[key, current]]);
      const target = store();
      try {
        for (let i = 0; target && i < target.length; i++) {
          const name = target.key(i);
          if (!name?.startsWith(prefix) || name === key) continue;
          try { entries.set(name, JSON.parse(target.getItem(name))); } catch (_) {}
        }
      } catch (_) { persistent = false; }
      for (const entry of entries.values()) {
        if (!entry || !Number.isFinite(Date.parse(entry.startedAt)) || !entry.months || typeof entry.months !== "object") continue;
        if (!startedAt || entry.startedAt < startedAt) startedAt = entry.startedAt;
        for (const [month, row] of Object.entries(entry.months)) {
          if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || !row) continue;
          const total = months[month] ||= {sent: 0, received: 0};
          for (const field of ["sent", "received"]) if (Number.isSafeInteger(row[field]) && row[field] >= 0) total[field] += row[field];
        }
      }
      return {months, startedAt, persistent, currentMonth: monthFor(clock())};
    }
    function setAccount(userId) {
      if ((userId || null) === account) return;
      flush();
      if (account !== null) {
        clientId = id(); key = prefix + clientId;
        current = {startedAt: "", months: {}};
      }
      account = userId || null;
      current.reportUser = account;
      shared = null; syncError = ""; generation++;
      flush();
    }
    async function rpc(name, args) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const {data, error} = await connection.rpc(name, args).abortSignal(controller.signal);
        if (error) throw error;
        return data;
      } finally { clearTimeout(timeout); }
    }
    async function sync({read = false} = {}) {
      if (!account || !connection || syncing) return;
      const userId = account, epoch = generation;
      syncing = true;
      try {
        flush();
        const target = store();
        const entries = new Map([[key, current]]);
        for (let i = 0; target && i < target.length; i++) {
          const name = target.key(i);
          if (!name?.startsWith(prefix) || name === key) continue;
          try { entries.set(name, JSON.parse(target.getItem(name))); } catch (_) {}
        }
        for (const [name, entry] of entries) {
          if (account !== userId || epoch !== generation) return;
          if (entry?.reportUser !== userId || !entry.startedAt || !entry.months) continue;
          const signature = JSON.stringify(entry.months);
          if (entry.syncedSignature === signature || target?.getItem(`${name}:ack`) === signature) continue;
          const payload = JSON.parse(signature);
          const accepted = await rpc("satis_traffic_report", {p_client: name.slice(prefix.length),
            p_started_at: entry.startedAt, p_months: payload});
          if (account !== userId || epoch !== generation) return;
          if (accepted !== true) throw new Error("Brak potwierdzenia statystyk.");
          entry.syncedSignature = signature;
          // Never rewrite another active tab's counters with an older snapshot.
          try { target?.setItem(`${name}:ack`, signature); } catch (_) {}
        }
        if (read) {
          const summary = await rpc("satis_traffic_summary");
          if (account !== userId || epoch !== generation) return;
          if (!summary || typeof summary.months !== "object" || !summary.months) throw new Error("Niepoprawne statystyki serwera.");
          shared = {...summary, currentMonth: monthFor(clock())};
        }
        syncError = "";
      } catch (error) {
        if (account !== userId || epoch !== generation) return;
        syncError = ["PGRST202", "42883"].includes(error.code)
          ? "Uruchom supabase-traffic-meter.sql w SQL Editor Supabase."
          : "Nie odświeżono statystyk ze wszystkich komputerów. Sprawdź połączenie i kliknij Odśwież.";
      } finally { syncing = false; listener(); }
    }
    return {fetch: measuredFetch, flush, snapshot, setAccount, sync,
      connect(client) { connection = client; },
      sharedSnapshot: () => ({data: shared, error: syncError, syncing}),
      subscribe(callback) { listener = callback; }};
  }
  return {create, monthFor, bytes};
});
