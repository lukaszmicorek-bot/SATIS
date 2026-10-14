(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SatisRepairReturns = api;
})(typeof globalThis === "undefined" ? this : globalThis, function () {
  function eventKey(record, iso) {
    return JSON.stringify([record.id, iso(record.returnDate), record.location]);
  }
  function pendingReturns(records, iso, location = "") {
    return records.filter(record => iso(record.returnDate) && !iso(record.pickupDate)
      && (!location || record.location === location))
      .sort((a, b) => iso(b.returnDate).localeCompare(iso(a.returnDate)) || String(a.id).localeCompare(String(b.id)));
  }
  async function bounded(request) {
    const controller = new AbortController();
    let timer;
    if (typeof request.abortSignal === "function") request = request.abortSignal(controller.signal);
    try {
      const result = await Promise.race([request, new Promise((resolve, reject) => {
        timer = setTimeout(() => { reject(new Error("Nie otrzymano potwierdzenia. Sprawdź połączenie i ponów odczyt.")); controller.abort(); }, 20000);
      })]);
      if (result.error) throw new Error(result.error.message || "Nie udało się odczytać powrotów.");
      return result.data;
    } finally { clearTimeout(timer); }
  }
  function create({ client, records, user, owner, place, workstation, iso, formatDate, openRecord, locationPill }) {
    const button = document.getElementById("repairReturnsBtn");
    const panel = document.getElementById("repairReturnsPanel");
    const list = document.getElementById("repairReturnsList");
    const message = document.getElementById("repairReturnsMessage");
    const filter = document.getElementById("repairReturnsPlace");
    const menuCount = document.getElementById("repairReturnsCount");
    const saving = new Set();
    let acknowledgements = new Map(), ready = false, generation = 0, loading = false, reloadNeeded = false;
    let previousEvents = null, toastTimer;
    const toast = document.createElement("p");
    toast.className = "repair-return-toast"; toast.hidden = true;
    toast.setAttribute("role", "status"); document.body.append(toast);
    function scope() { return owner() ? filter.value : place(); }
    function rows() { return !owner() && !place() ? [] : pendingReturns(records(), iso, scope()); }
    function render() {
      if (!button || !panel || !user()) {
        if (button) button.hidden = true;
        if (panel) panel.hidden = true;
        return;
      }
      filter.hidden = !owner();
      const entries = rows();
      const unseen = entries.filter(record => !acknowledgements.has(eventKey(record, iso)));
      const events = new Set(entries.map(record => eventKey(record, iso)));
      if (ready && previousEvents && [...events].some(key => !previousEvents.has(key))) {
        toast.textContent = "Nowy powrót produktu — sprawdź listę powrotów w Serwisie.";
        toast.hidden = false; clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toast.hidden = true; }, 6000);
      }
      if (ready) previousEvents = events;
      button.hidden = !entries.length && ready;
      button.textContent = ready ? `Powroty · ${unseen.length}` : "Powroty · sprawdzanie";
      button.classList.toggle("has-new-returns", ready && unseen.length > 0);
      if (menuCount) { menuCount.hidden = !ready || !unseen.length; menuCount.textContent = String(unseen.length); }
      list.replaceChildren();
      if (!owner() && !place()) message.textContent = "Nie rozpoznano miejsca stanowiska. Poproś SATIS o ustawienie T12, P50 lub P63.";
      if (!entries.length && ready) {
        const empty = document.createElement("p"); empty.textContent = "Brak produktów oczekujących na odbiór."; list.append(empty);
      }
      entries.forEach(record => {
        const item = document.createElement("article"); item.className = "repair-return-item";
        const content = document.createElement("div");
        const title = document.createElement("strong"); title.textContent = record.customerName || "Brak imienia i nazwiska";
        const product = document.createElement("span"); product.textContent = record.deviceName || "Produkt";
        const meta = document.createElement("small");
        meta.textContent = [record.sourceDocumentNumber, `Powrót: ${formatDate(record.returnDate)}`].filter(Boolean).join(" · ");
        content.append(title, product, meta, locationPill(record.location));
        const ack = acknowledgements.get(eventKey(record, iso));
        if (ack) {
          const info = document.createElement("small"); info.className = "repair-return-confirmed";
          const time = new Date(ack.acknowledged_at).toLocaleString("pl-PL");
          info.textContent = `Potwierdzono: ${time}`;
          info.title = [ack.user_email, ack.workstation].filter(Boolean).join(" · "); content.append(info);
        }
        const actions = document.createElement("div"); actions.className = "repair-return-actions";
        const open = document.createElement("button"); open.type = "button"; open.className = "reset-filters-btn";
        open.textContent = "Otwórz"; open.onclick = () => openRecord(record); actions.append(open);
        if (!ack) {
          const confirm = document.createElement("button"); confirm.type = "button"; confirm.className = "repair-return-confirm";
          confirm.textContent = saving.has(record.id) ? "Potwierdzanie…" : "Potwierdzam informację";
          confirm.disabled = !ready || saving.has(record.id);
          confirm.onclick = () => acknowledge(record); actions.append(confirm);
        }
        item.append(content, actions); list.append(item);
      });
    }
    async function load() {
      if (!client || !user()) return;
      if (loading) { reloadNeeded = true; return; }
      const current = generation, userId = user().id;
      loading = true;
      try {
        const loaded = [];
        const ids = pendingReturns(records(), iso).map(record => record.id);
        for (let offset = 0; offset < ids.length; offset += 200) {
          const data = await bounded(client.rpc("satis_repair_return_acknowledgements", { p_record_ids: ids.slice(offset, offset + 200) }));
          loaded.push(...(data || []));
        }
        if (current !== generation || user()?.id !== userId) return;
        acknowledgements = new Map(loaded.map(ack => [JSON.stringify([ack.record_id, ack.return_date, ack.location]), ack]));
        ready = true; message.textContent = "Potwierdzenie dotyczy informacji dla gabinetu, nie odbioru produktu przez klienta.";
      } catch (error) {
        if (current !== generation || user()?.id !== userId) return;
        ready = false;
        message.textContent = "Nie wczytano potwierdzeń. Sprawdź połączenie; przy pierwszym wdrożeniu uruchom supabase-repair-returns.sql.";
      } finally {
        loading = false; render();
        if (reloadNeeded) { reloadNeeded = false; void load(); }
      }
    }
    async function acknowledge(record) {
      if (!ready || saving.has(record.id) || !user()) return;
      const current = generation, userId = user().id;
      saving.add(record.id); render();
      try {
        const ack = await bounded(client.rpc("satis_acknowledge_repair_return", {
          p_record_id: record.id, p_return_date: iso(record.returnDate),
          p_location: record.location, p_workstation: workstation()
        }));
        if (current !== generation || user()?.id !== userId) return;
        if (!ack || ack.record_id !== record.id || ack.return_date !== iso(record.returnDate) || ack.location !== record.location || !ack.acknowledged_at) {
          throw new Error("Nieprawidłowe potwierdzenie serwera. Ponów odczyt.");
        }
        acknowledgements.set(eventKey(record, iso), ack);
      } catch (error) {
        if (current === generation && user()?.id === userId) message.textContent = `Nie potwierdzono informacji: ${error.message}`;
      } finally { saving.delete(record.id); render(); }
    }
    button?.addEventListener("click", () => { panel.hidden = !panel.hidden; if (!panel.hidden) { render(); panel.scrollIntoView({ block: "nearest", behavior: "smooth" }); } });
    filter?.addEventListener("change", () => { previousEvents = null; render(); });
    document.getElementById("repairReturnsRefresh")?.addEventListener("click", load);
    document.getElementById("repairReturnsClose")?.addEventListener("click", () => { panel.hidden = true; });
    return { render, load, clear() {
      generation++; ready = false; acknowledgements.clear(); previousEvents = null; reloadNeeded = false;
      filter.value = ""; clearTimeout(toastTimer); toast.hidden = true; panel.hidden = true; button.hidden = true;
      list.replaceChildren(); message.textContent = "";
      if (menuCount) { menuCount.textContent = ""; menuCount.hidden = true; }
    } };
  }
  return { eventKey, pendingReturns, create };
});
