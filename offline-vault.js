(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SatisOfflineVault = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const context = encoder.encode("SATIS offline drafts v1");
  const iterations = 600000;
  function storage() {
    const ready = new Promise((resolve, reject) => {
      const request = indexedDB.open("satis-offline-v1", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("vault");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return {
      async get() {
        const db = await ready;
        return new Promise((resolve, reject) => {
          const request = db.transaction("vault").objectStore("vault").get("data");
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      },
      async put(value) {
        const db = await ready;
        return new Promise((resolve, reject) => {
          const transaction = db.transaction("vault", "readwrite");
          transaction.objectStore("vault").put(value, "data");
          transaction.oncomplete = resolve;
          transaction.onerror = () => reject(transaction.error);
          transaction.onabort = () => reject(transaction.error || new Error("Zapis lokalny przerwany."));
        });
      }
    };
  }
  function create({ disk = storage(), crypto = globalThis.crypto } = {}) {
    let key = null, salt = null, value = null, queue = Promise.resolve(), generation = 0;
    async function derive(password, bytes) {
      const material = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
      return crypto.subtle.deriveKey({ name: "PBKDF2", salt: bytes, iterations, hash: "SHA-256" }, material,
        { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    }
    async function encode(data, usedKey, usedSalt) {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: context }, usedKey,
        encoder.encode(JSON.stringify(data)));
      return { version: 1, iterations, salt: usedSalt, iv, ciphertext };
    }
    return {
      exists: async () => Boolean(await disk.get()),
      unlocked: () => Boolean(key),
      read() { if (!key) throw new Error("Odblokuj szkice hasłem."); return structuredClone(value); },
      async unlock(password, initial) {
        const start = ++generation;
        const stored = await disk.get();
        if (!stored && (!initial?.owner || password.length < 12)) throw new Error("Ustaw hasło mające co najmniej 12 znaków po zalogowaniu online.");
        if (stored && (stored.version !== 1 || stored.iterations !== iterations)) throw new Error("Nieobsługiwana wersja szkiców offline.");
        const newSalt = stored?.salt || crypto.getRandomValues(new Uint8Array(16));
        const newKey = await derive(password, newSalt);
        let data;
        try {
          data = stored ? JSON.parse(decoder.decode(await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: stored.iv, additionalData: context }, newKey, stored.ciphertext)))
            : { owner: initial.owner, drafts: [], pricing: initial.pricing || [], createdAt: new Date().toISOString() };
        } catch { throw new Error("Nieprawidłowe hasło lub uszkodzone szkice offline."); }
        if (generation !== start) throw new Error("Odblokowanie anulowane.");
        if (!stored) await disk.put(await encode(data, newKey, newSalt));
        if (generation !== start) throw new Error("Odblokowanie anulowane.");
        key = newKey; salt = newSalt; value = data;
        return structuredClone(data);
      },
      change(update) {
        const start = generation;
        const action = queue.catch(() => {}).then(async () => {
          if (!key || generation !== start) throw new Error("Szkice zostały zablokowane.");
          const next = update(structuredClone(value));
          const encrypted = await encode(next, key, salt);
          if (generation !== start) throw new Error("Szkice zostały zablokowane.");
          await disk.put(encrypted);
          if (generation === start) value = next;
          return structuredClone(next);
        });
        queue = action;
        return action;
      },
      lock() { generation += 1; key = null; salt = null; value = null; }
    };
  }
  return { create };
});
