(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SatisData = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function applyChanges(records, changes, normalize = (value) => value) {
    const byId = new Map(records.map((record) => [record.id, record]));
    for (const change of changes) {
      const id = change.id || change.new?.id || change.old?.id;
      if (!id) continue;
      if (change.deleted || change.eventType === "DELETE") byId.delete(id);
      else {
        const row = change.new || change;
        const record = normalize([{ ...row.data, id }])[0];
        if (record) byId.set(id, record);
      }
    }
    return [...byId.values()];
  }

  function createStore({ client, uuid, retry = (action) => action(), workstation = () => "" }) {
    const versions = new Map();
    const edits = new Map();
    const pending = new Map();
    let generation = 0;
    const key = (table, id) => JSON.stringify([table, id]);
    function observe(table, row) {
      if (!row?.id && !row?.record_id) return;
      const id = row.id || row.record_id;
      const revision = Number(row.revision);
      if (!Number.isSafeInteger(revision) || revision < 1) return;
      const current = versions.get(key(table, id));
      if (current == null || revision >= current) versions.set(key(table, id), revision);
    }
    function beginEdit(table, id, revision) {
      if (id) edits.set(key(table, id), revision === undefined ? versions.get(key(table, id)) ?? null : revision);
    }
    function prepare(table, record, options = {}) {
      const id = String(record.id);
      const recordKey = key(table, id);
      const expectedRevision = Object.hasOwn(options, "expectedRevision") ? options.expectedRevision
        : edits.has(recordKey) ? edits.get(recordKey) : versions.get(recordKey) ?? null;
      const data = table === "device_private_payments"
        ? { amount: record.amount, receivedDate: record.receivedDate } : record;
      return { table, id, data: options.delete ? null : data, expectedRevision, delete: Boolean(options.delete) };
    }
    async function commit(changes) {
      if (!changes.length) return [];
      changes = structuredClone(changes);
      const startedGeneration = generation;
      const fingerprint = JSON.stringify(changes);
      const attempt = pending.get(fingerprint) || { operation: uuid(), workstation: workstation() };
      pending.set(fingerprint, attempt);
      try {
        const rows = await retry(async () => {
          const { data, error } = await client.rpc("satis_write_records", {
            p_operation: attempt.operation, p_changes: changes, p_workstation: attempt.workstation
          });
          if (error) throw error;
          if (!Array.isArray(data)) throw new Error("Nieprawidłowe potwierdzenie zapisu z serwera.");
          return data;
        });
        if (generation !== startedGeneration) {
          const error = new Error("Sesja zmieniła się podczas zapisu. Zaloguj się i sprawdź aktualny rekord.");
          error.code = "SESSION_CHANGED";
          throw error;
        }
        for (const row of rows) {
          const recordKey = key(row.table, row.id);
          if (row.deleted) versions.delete(recordKey);
          else observe(row.table, row);
          if (edits.has(recordKey)) edits.set(recordKey, versions.get(recordKey) ?? null);
        }
        pending.delete(fingerprint);
        return rows;
      } catch (error) {
        // A lost response may follow a committed transaction. Reuse its operation ID.
        if (/^(22|23|28|42|P0)/.test(String(error?.code || ""))) pending.delete(fingerprint);
        if (error?.code === "40001" || error?.code === "PT409") {
          const conflict = new Error("Ten rekord został zmieniony lub usunięty na innym stanowisku. Twoje pola pozostają w formularzu. Porównaj zmiany przed ponowną edycją.");
          conflict.code = error.code;
          throw conflict;
        }
        throw error;
      }
    }
    return {
      observe, beginEdit, prepare, commit,
      endEdit: (table, id) => edits.delete(key(table, id)),
      endTableEdits(table) { for (const entry of edits.keys()) if (JSON.parse(entry)[0] === table) edits.delete(entry); },
      write: (table, record) => commit([prepare(table, record)]),
      remove: (table, id) => commit([prepare(table, { id }, { delete: true })]),
      revision: (table, id) => versions.get(key(table, id)) ?? null,
      clear() { generation += 1; versions.clear(); edits.clear(); pending.clear(); }
    };
  }
  return { createStore, applyChanges };
});
