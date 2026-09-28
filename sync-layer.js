(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SatisSync = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  function createQueue({ load, apply, ready = () => true, onError = () => {}, delay = 220,
    schedule = setTimeout, cancel = clearTimeout }) {
    let pending = new Map(), timer = null, running = false, generation = 0;
    function enqueue(table, ids) {
      if (!pending.has(table)) pending.set(table, new Set());
      for (const id of ids) if (id) pending.get(table).add(id);
    }
    function arm(wait = delay) {
      cancel(timer);
      timer = schedule(flush, wait);
    }
    async function flush() {
      if (running) return;
      if (!pending.size) return;
      if (!ready()) { arm(1000); return; }
      const batch = pending;
      pending = new Map();
      running = true;
      const currentGeneration = generation;
      let failed = false;
      try {
        for (const [table, keys] of batch) {
          try {
            const ids = [...keys];
            const rows = await load(table, ids);
            if (generation !== currentGeneration) return;
            await apply(table, ids, rows);
          } catch (error) {
            if (generation !== currentGeneration) return;
            enqueue(table, keys);
            failed = true;
            onError(error);
          }
        }
      } finally {
        running = false;
        if (pending.size) arm(failed ? 3000 : delay);
      }
    }
    return {
      push(table, id) { enqueue(table, [id]); arm(); },
      flush,
      clear() { generation += 1; pending.clear(); cancel(timer); },
      pendingCount: () => [...pending.values()].reduce((sum, ids) => sum + ids.size, 0)
    };
  }
  return { createQueue };
});
