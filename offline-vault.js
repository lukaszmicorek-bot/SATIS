(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SatisOfflineVault = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const legacyContext = encoder.encode("SATIS offline drafts v1");
  const context = encoder.encode("SATIS offline drafts v2");
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
    let key = null, value = null, queue = Promise.resolve(), generation = 0;
    async function derive(password, bytes) {
      const material = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
      return crypto.subtle.deriveKey({ name: "PBKDF2", salt: bytes, iterations, hash: "SHA-256" }, material,
        { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    }
    async function encode(data, usedKey) {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: context }, usedKey,
        encoder.encode(JSON.stringify(data)));
      return { version: 2, key: usedKey, iv, ciphertext };
    }
    return {
      exists: async () => Boolean(await disk.get()),
      needsMigration: async () => (await disk.get())?.version === 1,
      unlocked: () => Boolean(key),
      read() { if (!key) throw new Error("Otwórz formularze offline."); return structuredClone(value); },
      async unlock(password, initial) {
        const start = ++generation;
        const stored = await disk.get();
        if (!stored && !initial?.owner) throw new Error("Najpierw zaloguj się online, aby włączyć formularze offline.");
        if (stored && ![1, 2].includes(stored.version)) throw new Error("Nieobsługiwana wersja szkiców offline.");
        let newKey, data;
        if (stored?.version === 1) {
          if (stored.iterations !== iterations) throw new Error("Nieobsługiwana wersja szkiców offline.");
          if (!password) throw new Error("Podaj dotychczasowe hasło tylko raz, aby zachować szkice.");
          const oldKey = await derive(password, stored.salt);
          try {
            data = JSON.parse(decoder.decode(await crypto.subtle.decrypt(
              { name: "AES-GCM", iv: stored.iv, additionalData: legacyContext }, oldKey, stored.ciphertext)));
          } catch { throw new Error("Nieprawidłowe hasło lub uszkodzone szkice offline."); }
          if (initial?.owner && initial.owner !== data.owner) throw new Error("Szkice należą do innego konta.");
        } else if (stored) {
          newKey = stored.key;
          try {
            data = JSON.parse(decoder.decode(await crypto.subtle.decrypt(
              { name: "AES-GCM", iv: stored.iv, additionalData: context }, newKey, stored.ciphertext)));
          } catch { throw new Error("Uszkodzone szkice offline lub brak klucza tego urządzenia."); }
        } else {
          data = { owner: initial.owner, drafts: [], pricing: initial.pricing || [], createdAt: new Date().toISOString() };
        }
        if (generation !== start) throw new Error("Odblokowanie anulowane.");
        if (!stored || stored.version === 1) {
          newKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
          if (generation !== start) throw new Error("Odblokowanie anulowane.");
          await disk.put(await encode(data, newKey));
        }
        if (generation !== start) throw new Error("Odblokowanie anulowane.");
        key = newKey; value = data;
        return structuredClone(data);
      },
      change(update) {
        const start = generation;
        const action = queue.catch(() => {}).then(async () => {
          if (!key || generation !== start) throw new Error("Szkice zostały zablokowane.");
          const next = update(structuredClone(value));
          const encrypted = await encode(next, key);
          if (generation !== start) throw new Error("Szkice zostały zablokowane.");
          await disk.put(encrypted);
          if (generation === start) value = next;
          return structuredClone(next);
        });
        queue = action;
        return action;
      },
      lock() { generation += 1; key = null; value = null; }
    };
  }
  return { create };
});
