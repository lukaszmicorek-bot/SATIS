/* Local drafts are encrypted for this browser profile; this workspace never grants a Supabase session. */
window.SatisOfflineForms = {
  mount(api) {
    const kinds = { offer: "Oferta", loan: "Umowa", order: "Zamówienie", complaint: "Reklamacja" };
    const vault = window.SatisOfflineVault.create();
    let workspace = false, syncing = false, current = "offer", timer = 0, idle = 0, release = null;
    let writing = Promise.resolve(), selected = new Map(), dirty = false;
    const places = new Map();
    const panel = document.createElement("section");
    panel.id = "offlineWorkspace";
    panel.hidden = true;
    panel.innerHTML = `<header class="offline-controls"><img src="satis-monogram.png" alt="SATIS" width="44" height="44"><strong>Formularze offline</strong><button type="button" data-offline="save">Zapisz szkic</button><button type="button" data-offline="print">Drukuj / PDF</button><button type="button" data-offline="sync">Synchronizuj</button><button type="button" data-offline="exit">Wróć do aplikacji</button><button type="button" data-offline="lock">Zamknij formularze</button></header><p class="offline-status" role="status"></p><p class="offline-warning">Wersja robocza. Numeracja i dostępność aparatu wymagają sprawdzenia online. Dostęp do szkiców ma każdy, kto używa tego profilu przeglądarki. Blokuj komputer; pliki PDF przechowuj bezpiecznie.</p><nav class="offline-tabs" aria-label="Formularze offline"></nav><div class="offline-drafts"></div><div class="offline-forms-host"></div>`;
    document.body.append(panel);
    const status = panel.querySelector(".offline-status");
    const drafts = panel.querySelector(".offline-drafts");
    const host = panel.querySelector(".offline-forms-host");
    const dialog = document.createElement("dialog");
    dialog.id = "offlineUnlockDialog";
    dialog.innerHTML = `<form><h2>Przenieś dotychczasowe szkice</h2><p>Wpisz stare hasło do szkiców tylko raz. Po przeniesieniu formularze offline będą otwierać się bez hasła na tym urządzeniu.</p><label>Dotychczasowe hasło<input type="password" autocomplete="off" required></label><p role="status"></p><div class="offline-controls"><button type="submit">Przenieś szkice</button><button type="button">Anuluj</button></div></form>`;
    document.body.append(dialog);
    const launcher = document.createElement("button");
    launcher.type = "button"; launcher.className = "ghost offline-launch"; launcher.textContent = "Formularze offline";
    document.querySelector(".top-panel")?.append(launcher);
    const authLauncher = launcher.cloneNode(true);
    document.querySelector("#authForm")?.append(authLauncher);
    function message(text) { status.textContent = text; }
    function touch() {
      clearTimeout(idle);
      if (vault.unlocked()) idle = setTimeout(() => lock(), 15 * 60 * 1000);
    }
    function raw(kind) {
      return [...api.views[kind].querySelectorAll("input[id],select[id],textarea[id]")]
        .filter(input => input.type !== "password" && input.type !== "file")
        .map(input => ({ id: input.id, value: input.value, checked: input.checked }));
    }
    function take(kind) {
      const snapshot = api.snapshot(kind);
      const identity = api.identity(kind);
      const previous = selected.get(kind)?.id === identity.id ? selected.get(kind) : null;
      const id = previous?.id || identity.id;
      return { id, kind, snapshot: { ...snapshot, id }, raw: raw(kind),
        revision: previous ? previous.revision : identity.revision,
        saved: previous ? previous.saved : identity.saved,
        updatedAt: new Date().toISOString(), pending: true };
    }
    function list() {
      drafts.replaceChildren();
      if (!vault.unlocked()) return;
      const add = document.createElement("button");
      add.type = "button"; add.textContent = `Nowa: ${kinds[current]}`;
      add.onclick = () => run(async () => { await save(current); selected.delete(current); api.reset(current); show(current); });
      drafts.append(add);
      for (const entry of vault.read().drafts.filter(item => item.kind === current).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))) {
        const item = document.createElement("span"); item.className = "offline-draft";
        const open = document.createElement("button"); open.type = "button";
        open.textContent = `${entry.snapshot.customer || "Bez nazwiska"} · ${entry.pending ? "szkic" : "zsynchronizowano"}`;
        open.onclick = () => run(async () => { await save(current); load(entry); });
        const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "×";
        remove.setAttribute("aria-label", "Usuń lokalny szkic");
        remove.onclick = () => run(async () => {
          if (!confirm("Usunąć szkic z tego komputera? Zapis na serwerze pozostanie bez zmian.")) return;
          await vault.change(data => ({ ...data, drafts: data.drafts.filter(row => row.id !== entry.id) }));
          if (selected.get(current)?.id === entry.id) { selected.delete(current); api.reset(current); }
          list();
        });
        item.append(open, remove); drafts.append(item);
      }
    }
    function show(kind) {
      current = kind;
      api.render(kind);
      for (const [key, view] of Object.entries(api.views)) view.hidden = key !== kind;
      panel.querySelectorAll("[data-kind]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.kind === kind)));
      list(); touch();
    }
    function load(entry) {
      api.restore(entry.kind, entry.snapshot);
      for (const field of entry.raw || []) {
        const input = document.getElementById(field.id);
        if (!input || !api.views[entry.kind].contains(input)) continue;
        input.value = field.value;
        if ("checked" in input) input.checked = field.checked;
      }
      selected.set(entry.kind, entry);
      api.pin(entry);
      show(entry.kind);
      dirty = false;
    }
    async function enter() {
      if (!vault.unlocked()) return unlock();
      api.hideAuth();
      if (!workspace) {
        for (const [kind, view] of Object.entries(api.views)) {
          const placeholder = document.createComment(`offline-${kind}`);
          view.before(placeholder); places.set(kind, placeholder); host.append(view);
        }
        workspace = true;
        document.body.classList.add("offline-form-mode"); panel.hidden = false;
      }
      show(current);
      message("Szkice są zapisane na tym komputerze. Nie są jeszcze zapisane w historii serwera.");
    }
    async function save(kind = current) {
      if (!vault.unlocked()) throw new Error("Najpierw otwórz formularze offline.");
      if (!dirty && selected.get(kind)?.id === api.identity(kind).id) return selected.get(kind);
      clearTimeout(timer);
      const entry = take(kind);
      if (!entry.snapshot.customer && !entry.snapshot.items?.length && !entry.snapshot.rightDevice?.model && !entry.snapshot.leftDevice?.model) return null;
      writing = vault.change(data => ({ ...data, drafts: [entry, ...data.drafts.filter(item => item.id !== entry.id)] }));
      await writing;
      selected.set(kind, entry); dirty = false;
      api.localSaved(kind);
      message("Zapisano na tym komputerze — oczekuje na synchronizację.");
      list(); return entry;
    }
    async function print(kind = current) {
      const entry = await save(kind);
      if (!entry?.snapshot.customer?.trim()) throw new Error("Uzupełnij imię i nazwisko przed wydrukiem.");
      show(kind);
      const source = api.printSource(kind);
      const output = document.createElement("section"); output.id = "offlinePrint";
      const mark = document.createElement("p"); mark.className = "offline-print-mark";
      mark.textContent = `WERSJA ROBOCZA OFFLINE · ${entry.id.slice(0, 8)} · bez zatwierdzonej numeracji`;
      const copy = source.cloneNode(true);
      if (!entry.saved && entry.snapshot.number) {
        const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) walker.currentNode.textContent = walker.currentNode.textContent.split(entry.snapshot.number).join(`OFF-${entry.id.slice(0, 8)}`);
      }
      copy.querySelectorAll("[id]").forEach(node => node.removeAttribute("id")); copy.removeAttribute("id");
      const printClass = `pricing-${kind}-print`;
      output.append(mark, copy); document.body.append(output); document.body.classList.add("offline-printing", printClass);
      const cleanup = () => { output.remove(); document.body.classList.remove("offline-printing", printClass); };
      window.addEventListener("afterprint", cleanup, { once: true });
      try { await api.print(cleanup); } catch (error) { cleanup(); throw error; }
    }
    async function sync() {
      if (syncing || !vault.unlocked() || !navigator.onLine) return;
      if (!api.user() || api.user().id !== vault.read().owner) {
        message("Aby synchronizować, wróć do aplikacji i zaloguj się na konto, które włączyło te szkice."); return;
      }
      if (workspace) await save(current);
      if (!workspace) { message("Otwórz Formularze offline, aby sprawdzić i synchronizować szkice."); return; }
      syncing = true; panel.inert = true;
      const owner = api.user().id;
      let done = 0;
      try {
        for (const entry of vault.read().drafts.filter(item => item.pending)) {
          if (!entry.snapshot.customer?.trim()) continue;
          if (!vault.unlocked() || api.user()?.id !== owner) break;
          load(entry);
          await api.prepareSync(entry);
          const result = await api.save(entry.kind);
          if (!result) { message("Synchronizacja zatrzymana. Sprawdź formularz i komunikat walidacji; szkic pozostaje na komputerze."); return; }
          if (!vault.unlocked() || api.user()?.id !== owner) return;
          const saved = { ...entry, snapshot: result, saved: true, revision: api.revision(entry.kind, result.id), pending: false, raw: [] };
          await vault.change(data => ({ ...data, drafts: data.drafts.map(row => row.id === entry.id ? saved : row) }));
          selected.set(entry.kind, saved); done += 1;
        }
        message(`Zapisano na serwerze: ${done}. Niekompletne szkice pozostają lokalnie.`);
      } finally { syncing = false; panel.inert = false; list(); }
    }
    function leave() {
      workspace = false; panel.hidden = true; document.body.classList.remove("offline-form-mode");
      for (const [kind, placeholder] of places) { placeholder.replaceWith(api.views[kind]); }
      places.clear(); api.renderApp();
    }
    function lock() {
      clearTimeout(timer); clearTimeout(idle); vault.lock(); selected.clear(); dirty = false;
      if (workspace) leave();
      api.clearForms(); release?.(); release = null;
      if (!api.user()) api.showAuth("Otwórz lokalne formularze albo zaloguj się online.");
    }
    async function run(action) {
      try { return await action(); } catch (error) { message(`Nie zapisano: ${error.message}`); alert(error.message); return null; }
    }
    async function open(password) {
      try {
        if (!navigator.locks) throw new Error("Ta przeglądarka nie obsługuje bezpiecznej blokady szkiców. Użyj aktualnej przeglądarki Chrome lub Edge.");
        if (!release) await new Promise((resolve, reject) => navigator.locks.request("satis-offline-workspace", { ifAvailable: true }, async acquired => {
          if (!acquired) { reject(new Error("Szkice są otwarte w innej karcie. Najpierw je tam zablokuj.")); return; }
          await new Promise(done => { release = done; resolve(); });
        }).catch(reject));
        const existing = await vault.exists();
        if (!existing && (!navigator.onLine || !api.user())) throw new Error("Najpierw zaloguj się online, aby włączyć formularze offline.");
        if (!existing) await install();
        const data = await vault.unlock(password, { owner: api.user()?.id, pricing: api.pricing() });
        if (api.user() && api.user().id !== data.owner) { vault.lock(); throw new Error("Szkice należą do innego konta. Wyloguj się przed pracą lokalną."); }
        if (!api.pricing().length) api.setPricing(data.pricing);
        await enter();
        if (data.drafts.length) load(data.drafts[0]);
        if (navigator.onLine && api.user()?.id === data.owner && data.drafts.some(entry => entry.pending)) {
          message("Szkice oczekują na synchronizację. Sprawdź je i wybierz Synchronizuj.");
        }
      } catch (error) { release?.(); release = null; throw error; }
    }
    async function unlock() {
      if (await vault.needsMigration()) {
        dialog.querySelector("[role=status]").textContent = "";
        dialog.showModal(); dialog.querySelector("input").focus();
        return;
      }
      await open();
    }
    dialog.querySelector("button[type=button]").onclick = () => dialog.close();
    dialog.querySelector("form").onsubmit = async event => {
      event.preventDefault();
      const button = dialog.querySelector("button[type=submit]"); button.disabled = true;
      try {
        await open(dialog.querySelector("input").value);
        dialog.querySelector("input").value = "";
        dialog.close();
      } catch (error) { dialog.querySelector("[role=status]").textContent = error.message; }
      finally { button.disabled = false; }
    };
    async function install() {
      if (!isSecureContext || !navigator.serviceWorker) throw new Error("Offline wymaga strony HTTPS lub localhost.");
      const registration = await navigator.serviceWorker.register("offline-sw.js");
      const worker = registration.installing || registration.waiting || registration.active;
      if (worker && worker.state !== "activated" && worker.state !== "installed") await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Nie udało się pobrać formularzy offline. Sprawdź połączenie.")), 60000);
        worker.addEventListener("statechange", () => {
          if (["installed", "activated"].includes(worker.state)) { clearTimeout(timeout); resolve(); }
          if (worker.state === "redundant") { clearTimeout(timeout); reject(new Error("Nie udało się pobrać kompletnej wersji offline.")); }
        });
      });
    }
    for (const [kind, title] of Object.entries(kinds)) {
      const button = document.createElement("button"); button.type = "button"; button.textContent = title; button.dataset.kind = kind;
      button.onclick = () => run(async () => { if (dirty) await save(current); show(kind); });
      panel.querySelector("nav").append(button);
      const changed = () => {
        if (!vault.unlocked() || syncing) return;
        dirty = true; touch(); clearTimeout(timer);
        message("Niezapisane zmiany lokalne…");
        timer = setTimeout(() => run(() => save(kind)), 800);
      };
      api.views[kind].addEventListener("input", changed);
      api.views[kind].addEventListener("change", changed);
    }
    panel.addEventListener("click", event => {
      const action = event.target.closest("[data-offline]")?.dataset.offline;
      if (!action) return;
      run(async () => {
        if (action === "save") await save();
        if (action === "print") await print();
        if (action === "sync") await sync();
        if (action === "exit") { if (dirty) await save(); leave(); if (!api.user()) api.showAuth("Zaloguj się, aby synchronizować szkice."); }
        if (action === "lock") { if (dirty) await save(); lock(); }
      });
    });
    launcher.onclick = authLauncher.onclick = () => run(() => vault.unlocked() ? enter() : unlock());
    window.addEventListener("online", () => run(() => sync()));
    window.addEventListener("offline", () => { if (vault.unlocked()) run(() => enter()); });
    window.addEventListener("beforeunload", event => { if (dirty) { event.preventDefault(); event.returnValue = ""; } });
    return {
      active: () => workspace && !syncing,
      unlocked: () => vault.unlocked(), save: kind => run(() => save(kind)), print: kind => run(() => print(kind)), lock,
      async boot() {
        if (navigator.onLine) return false;
        if (!await vault.exists()) { api.showAuth("Brak internetu. Włącz formularze offline po zalogowaniu online na tym urządzeniu."); return true; }
        api.showAuth("Brak internetu. Otwieram przygotowane formularze offline.");
        await run(() => unlock()); return true;
      },
      connected() { if (workspace) run(() => sync()); },
      editing: () => dirty || workspace
    };
  }
};
