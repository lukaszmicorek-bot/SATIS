(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SatisStockAudit = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const labels = { pending: "Do sprawdzenia", present: "Potwierdzony", missing: "Brak" };
  const serialKey = value => String(value || "").toUpperCase().replace(/[\s-]+/gu, "");
  function itemStatus(audit, id) {
    if ((audit.checkedItems || []).includes(id)) return "present";
    if (audit.workflowVersion !== 2 || (audit.missingItems || []).includes(id)) return "missing";
    return "pending";
  }
  function stats(audit) {
    const checked = new Set(audit.checkedItems || []), missing = new Set(audit.missingItems || []);
    const result = { total: 0, present: 0, missing: 0, pending: 0 };
    for (const item of audit.items || []) {
      result.total++;
      result[checked.has(item.id) ? "present" : audit.workflowVersion !== 2 || missing.has(item.id) ? "missing" : "pending"]++;
    }
    return result;
  }
  function mark(audit, id, status, at = new Date().toISOString()) {
    if (!audit.items?.some(item => item.id === id) || !labels[status]) return audit;
    const checked = new Set(audit.checkedItems || []), missing = new Set(audit.missingItems || []);
    checked.delete(id); missing.delete(id);
    if (status === "present") checked.add(id);
    if (status === "missing") missing.add(id);
    return { ...audit, checkedItems: [...checked], missingItems: [...missing],
      observations: { ...audit.observations, [id]: { status, at, by: audit.checkedBy } } };
  }
  function changes(audit, available) {
    const current = new Map(available.map(item => [item.id, item]));
    const before = new Map((audit.items || []).map(item => [item.id, item]));
    const result = [];
    for (const item of before.values()) {
      const now = current.get(item.id);
      if (!now) result.push({ ...item, reason: "Poza aktualnym stanem (sprzedany, wypożyczony, zwrócony lub usunięty)" });
      else if (item.location !== now.location || serialKey(item.serialNumber) !== serialKey(now.serialNumber)
        || item.deviceName !== now.deviceName) {
        result.push({ ...item, reason: `Zmienione dane: ${now.deviceName} · ${now.serialNumber} · ${now.location}` });
      }
    }
    for (const item of current.values()) {
      if (!before.has(item.id) && (audit.location === "all" || item.location === audit.location)) {
        result.push({ ...item, reason: "Dodany do stanu po rozpoczęciu remanentu" });
      }
    }
    return result;
  }
  function scanMatch(audit, value, allItems, available) {
    const key = serialKey(value);
    if (!key || key === "BRAKNUMERU") return { kind: "unknown", message: "Wpisz pełny numer seryjny." };
    const expected = (audit.items || []).filter(item => serialKey(item.serialNumber) === key);
    const all = allItems.filter(item => serialKey(item.serialNumber) === key);
    if (expected.length > 1 || all.length > 1) return { kind: "ambiguous", message: "Numer występuje w kilku pozycjach. Sprawdź właściwy aparat na liście; nic nie zaznaczono." };
    if (expected.length) {
      const item = expected[0], now = available.find(row => row.id === item.id);
      if (!now || now.location !== item.location || serialKey(now.serialNumber) !== key) {
        return { kind: "changed", item, message: "Stan lub miejsce zmieniły się od rozpoczęcia. Sprawdź sekcję zmian; nic nie zaznaczono." };
      }
      return { kind: itemStatus(audit, item.id) === "present" ? "duplicate" : "present", item };
    }
    if (!all.length) return { kind: "unknown", message: "Numer nieznany. Sprawdź numer w Bazie lub Demo; nie utworzono nowej pozycji." };
    const item = all[0];
    return available.some(row => row.id === item.id)
      ? { kind: "other", item, message: `Poza zakresem remanentu · miejsce ${item.location}. Stan nie został zmieniony.` }
      : { kind: "unavailable", item, message: "Poza oczekiwanym stanem: sprawdź sprzedaż, wypożyczenie lub zwrot w Bazie / Demo." };
  }
  function create(a) {
    const d = a.document, q = id => d.querySelector(`#${id}`);
    const workspace = q("stockAuditWorkspace");
    let filter = "pending", limit = 120, vault = null, owner = "", generation = 0;
    let ready = false, loading = false, timer = null, writing = 0, dirty = false, error = "";
    let saving = null, finishing = false, initializedSession = "", savingDraft = Promise.resolve();
    const isDraft = () => a.read().workflowVersion === 2 && ["active", "paused"].includes(a.read().phase);
    const editable = () => ready && !finishing && !a.read().pendingCommit && a.ready() && a.read().phase === "active" && isDraft();
    const message = (text, tone = "") => {
      q("stockAuditScanResult").textContent = text; q("stockAuditScanResult").dataset.tone = tone;
    };
    function renderDraftStatus() {
      q("stockAuditDraftStatus").textContent = error || (!ready ? "Odczytywanie szkicu…" : dirty || writing
        ? "Zapisywanie szyfrowanego szkicu…" : isDraft() ? "Szkic zapisany na tym komputerze. Możesz wznowić po ponownym zalogowaniu." : "");
      q("stockAuditDraftStatus").dataset.error = String(Boolean(error));
    }
    async function ensureDraft() {
      const user = a.user();
      if (!user || !a.ready() || loading || ((ready || error) && owner === user)) return;
      loading = true; owner = user;
      const epoch = generation;
      try {
        vault = a.createVault(`satis-stock-audit-v1-${user}`);
        const saved = await vault.unlock(null, { owner: user });
        if (epoch !== generation || a.user() !== user) return;
        if (saved.owner !== user) throw new Error("Szkic należy do innego konta.");
        const draft = saved.stockAudit;
        if (draft?.workflowVersion === 2 && ["active", "paused"].includes(draft.phase)) {
          a.update({ ...draft, phase: "paused", history: a.read().history });
          q("stockGroupedSummary").open = false;
        }
        ready = true; error = "";
      } catch {
        if (epoch !== generation) return;
        error = "Nie można otworzyć szyfrowanego szkicu. Sprawdź uprawnienia przeglądarki i odśwież stronę.";
      } finally {
        if (epoch === generation) { loading = false; a.refresh(); renderDraftStatus(); }
      }
    }
    function scheduleDraft() {
      dirty = true; clearTimeout(timer);
      timer = setTimeout(() => { timer = null; void flushDraft().catch(() => {}); }, 180);
      renderDraftStatus();
    }
    function flushDraft() {
      clearTimeout(timer); timer = null;
      if (!ready || !vault || !owner || a.user() !== owner) return Promise.reject(new Error("Szkic nie jest gotowy."));
      const { history, ...snapshot } = a.read();
      const epoch = generation, store = vault;
      dirty = false; writing++; renderDraftStatus();
      savingDraft = savingDraft.catch(() => {}).then(() => {
        if (epoch !== generation || a.user() !== owner) throw new Error("Sesja zakończona.");
        return store.change(data => ({ ...data, stockAudit: snapshot }));
      }).then(() => { if (epoch === generation) error = ""; }).catch(e => {
        if (epoch === generation) { dirty = true; error = "Szkic nie został zapisany. Nie zamykaj strony; spróbuj wstrzymać ponownie."; }
        throw e;
      }).finally(() => { if (epoch === generation) { writing--; renderDraftStatus(); } });
      return savingDraft;
    }
    function syncIdentity() {
      if (!isDraft() || !editable()) return;
      a.update({ ...a.read(), checkedBy: q("stockAuditPerson").value.trim(), checkedAt: a.date(q("stockAuditDate").value) || a.today() });
      scheduleDraft();
    }
    function start() {
      if (!ready || !a.ready() || finishing || a.read().pendingCommit) return;
      if (isDraft() && !a.confirm("Zastąpić niezakończony szkic nowym remanentem? Dotychczasowe zaznaczenia zostaną usunięte.")) return;
      const checkedBy = a.person(q("stockAuditPerson").value);
      if (!checkedBy) { a.alert("Wpisz, kto sprawdza remanent."); q("stockAuditPerson").focus(); return; }
      const location = q("stockAuditLocations").dataset.location || a.station();
      const items = a.snapshot().filter(item => location === "all" || item.location === location);
      if (!items.length) { a.alert("Brak aparatów na stanie w wybranym miejscu."); return; }
      const previous = a.read();
      a.update({ checkedBy, checkedAt: a.date(q("stockAuditDate").value) || a.today(),
        workflowVersion: 2, sessionId: a.id(), phase: "active", location,
        startedAt: new Date().toISOString(), checkedItems: [], missingItems: [], observations: {}, items, history: previous.history, savedAt: "" });
      q("stockGroupedSummary").open = false;
      filter = "pending"; limit = 120; saving = null; message(""); scheduleDraft(); a.refresh(); q("stockAuditScan").focus();
    }
    async function pauseResume() {
      if (!ready || !isDraft() || finishing) return;
      const next = a.read().phase === "active" ? "paused" : "active";
      a.update({ ...a.read(), phase: next });
      await flushDraft(); a.refresh();
      if (next === "active") q("stockAuditScan").focus();
    }
    function setStatus(id, status) {
      if (!editable()) return;
      a.update(mark(a.read(), id, status)); saving = null; scheduleDraft();
      if (q("stockGroupedSummary").open) a.refresh();
      else render();
    }
    function scan(event) {
      event.preventDefault();
      if (!editable()) return;
      const field = q("stockAuditScan");
      const result = scanMatch(a.read(), field.value, a.allItems(), a.snapshot());
      const detail = result.item ? ` · ${result.item.deviceName} · ${result.item.serialNumber} · ${result.item.location}` : "";
      if (result.kind === "present") setStatus(result.item.id, "present");
      message((result.message || (result.kind === "duplicate" ? "Już sprawdzony — bez ponownego zliczania" : "Potwierdzono")) + detail,
        result.kind === "present" ? "success" : "warning");
      if (["present", "duplicate"].includes(result.kind)) field.value = "";
      else field.select();
      field.focus();
    }
    async function finish() {
      if (!ready || !a.ready() || !isDraft() || a.read().phase !== "active" || finishing) return;
      if (!a.read().pendingCommit) syncIdentity();
      const audit = a.read(), totals = stats(audit), checkedBy = a.person(audit.checkedBy);
      if (!checkedBy) { a.alert("Wpisz, kto sprawdził remanent."); q("stockAuditPerson").focus(); return; }
      if (!totals.total || totals.pending) { a.alert(`Pozostało do sprawdzenia: ${totals.pending}. Potwierdź aparat albo świadomie oznacz brak.`); filter = "pending"; render(); return; }
      const differences = changes(audit, a.snapshot());
      if (!audit.pendingCommit && differences.length && !a.confirm(`Stan zmienił się dla ${differences.length} pozycji. Wyniki dotyczą stanu z początku remanentu; zmiany będą dołączone do raportu. Czy sprawdzono te różnice i zakończyć remanent?`)) return;
      saving = audit.pendingCommit || saving;
      if (!saving) {
        const { history, pendingCommit, ...frozen } = audit;
        const entry = a.historyEntry({ ...audit, checkedBy, savedAt: new Date().toISOString() });
        entry.id = audit.sessionId;
        entry.location = audit.location; entry.startedAt = audit.startedAt; entry.changes = differences;
        entry.observations = audit.observations; entry.workflowVersion = 2;
        saving = { entry, snapshot: { ...frozen, checkedBy, savedAt: entry.savedAt, phase: "completed", completedChanges: differences } };
        a.update({ ...audit, pendingCommit: saving });
      }
      finishing = true; const epoch = generation, user = a.user(); let historySaved = false; render();
      try {
        await flushDraft();
        await a.saveHistory(saving.entry, saving.snapshot);
        historySaved = true;
        if (epoch !== generation || a.user() !== user) return;
        a.update({ ...saving.snapshot, history: [saving.entry, ...(a.read().history || []).filter(item => item.id !== saving.entry.id)] });
        await flushDraft();
        filter = totals.missing ? "missing" : "all";
        message("Remanent zakończony i zapisany w historii.", "success"); saving = null; a.refresh();
      } catch (e) {
        if (epoch === generation) {
          a.alert(historySaved ? "Remanent zapisany w historii, ale nie udało się zamknąć lokalnego szkicu. Po ponownym otwarciu ponów zakończenie — ten sam zapis nie utworzy duplikatu."
            : `Nie udało się potwierdzić zapisu remanentu. Szkic pozostał dostępny. ${e.message || "Spróbuj ponownie."}`);
        }
      } finally { if (epoch === generation) { finishing = false; render(); } }
    }
    function render() {
      if (!workspace) return;
      const audit = a.read(), active = audit.workflowVersion === 2;
      if (!owner || !ready) { void ensureDraft(); }
      workspace.hidden = !active;
      const locations = q("stockAuditLocations");
      if (!locations.dataset.location) locations.dataset.location = a.station();
      locations.querySelectorAll("[data-audit-location]").forEach(button => {
        button.setAttribute("aria-pressed", String(button.dataset.auditLocation === (isDraft() ? audit.location : locations.dataset.location)));
        button.disabled = isDraft() || !ready || finishing;
      });
      q("startStockAuditBtn").disabled = !ready || !a.ready() || finishing || Boolean(audit.pendingCommit);
      q("pauseStockAuditBtn").hidden = !isDraft();
      q("pauseStockAuditBtn").disabled = finishing;
      q("pauseStockAuditBtn").textContent = audit.phase === "paused" ? "Wznów remanent" : "Wstrzymaj";
      q("saveStockAuditBtn").disabled = !ready || !a.ready() || !isDraft() || audit.phase !== "active" || finishing;
      q("saveStockAuditBtn").textContent = finishing ? "Zapisywanie…" : audit.pendingCommit ? "Ponów zakończenie" : "Zakończ remanent";
      q("clearStockAuditBtn").disabled = !editable();
      q("stockAuditPerson").disabled = finishing || audit.phase === "paused" || Boolean(audit.pendingCommit);
      q("stockAuditDate").disabled = finishing || audit.phase === "paused" || Boolean(audit.pendingCommit);
      if (!active) { renderDraftStatus(); return; }
      if (initializedSession !== audit.sessionId) {
        initializedSession = audit.sessionId;
        q("stockAuditPerson").value = audit.checkedBy;
        a.setDate(q("stockAuditDate"), audit.checkedAt);
      }
      const totals = stats(audit);
      q("stockAuditProgress").textContent = `${audit.location === "all" ? "Wszystkie miejsca" : audit.location} · potwierdzono ${totals.present}/${totals.total} · do sprawdzenia ${totals.pending} · braki ${totals.missing}${audit.phase === "paused" ? " · Wstrzymany" : audit.phase === "completed" ? " · Zakończony" : ""}`;
      q("stockAuditSummary").textContent = q("stockAuditProgress").textContent;
      q("stockAuditProgressBar").max = totals.total || 1;
      q("stockAuditProgressBar").value = totals.present + totals.missing;
      q("stockAuditScan").disabled = !editable();
      q("stockAuditScanForm").querySelector("button").disabled = !editable();
      q("stockAuditFilters").querySelectorAll("[data-audit-filter]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.auditFilter === filter)));
      const query = q("stockAuditSearch").value.toLocaleLowerCase("pl-PL").trim(), source = q("stockAuditSource").value;
      const items = audit.items.filter(item => (filter === "all" || itemStatus(audit, item.id) === filter)
        && (source === "all" || source === item.source)
        && (!query || `${item.deviceName} ${item.serialNumber}`.toLocaleLowerCase("pl-PL").includes(query)))
        .sort((x, y) => x.location.localeCompare(y.location) || x.deviceName.localeCompare(y.deviceName, "pl") || x.serialNumber.localeCompare(y.serialNumber));
      const body = q("stockAuditWorkBody");
      body.replaceChildren(...items.slice(0, limit).map(item => {
        const row = d.createElement("tr"), status = itemStatus(audit, item.id);
        row.dataset.result = status;
        for (const [index, text] of [`${item.deviceName}${item.source === "demo" ? " · Demo" : ""}`, item.serialNumber, item.location, labels[status]].entries()) {
          const cell = d.createElement("td");
          if (index === 2 && a.locationPill) cell.append(a.locationPill(item.location));
          else cell.textContent = text;
          row.append(cell);
        }
        const cell = d.createElement("td"), group = d.createElement("div"); group.className = "stock-audit-row-actions";
        for (const [value, label] of [["present", "Potwierdź"], ["missing", "Brak"], ["pending", "Cofnij"]]) {
          const button = d.createElement("button"); button.type = "button"; button.textContent = label;
          button.dataset.status = value; button.setAttribute("aria-label", `${label}: ${item.serialNumber}`);
          button.disabled = !editable() || status === value;
          button.addEventListener("click", () => setStatus(item.id, value)); group.append(button);
        }
        cell.append(group); row.append(cell); return row;
      }));
      q("stockAuditWorkEmpty").hidden = items.length > 0;
      q("stockAuditShowMore").hidden = items.length <= limit;
      const differences = audit.phase === "completed" ? audit.completedChanges || [] : changes(audit, a.snapshot());
      q("stockAuditChanges").hidden = differences.length === 0;
      q("stockAuditChangesSummary").textContent = `Zmiany stanu od rozpoczęcia: ${differences.length}`;
      q("stockAuditChangesList").replaceChildren(...differences.map(item => {
        const li = d.createElement("li"); li.textContent = `${item.serialNumber} · ${item.deviceName} · ${item.location} — ${item.reason}`; return li;
      }));
      renderDraftStatus();
    }
    function reset() {
      generation++; clearTimeout(timer); timer = null; vault?.lock(); vault = null;
      owner = ""; ready = false; loading = false; dirty = false; writing = 0; finishing = false; saving = null; error = "";
      initializedSession = "";
      if (workspace) workspace.hidden = true;
      q("stockAuditScan").value = ""; q("stockAuditSearch").value = "";
      q("stockAuditScanResult").textContent = "";
      q("stockAuditWorkBody").replaceChildren();
      q("stockAuditChangesList").replaceChildren();
      q("stockAuditDraftStatus").textContent = "";
    }
    q("startStockAuditBtn").addEventListener("click", start);
    q("pauseStockAuditBtn").addEventListener("click", () => { void pauseResume().catch(() => renderDraftStatus()); });
    q("stockAuditScanForm").addEventListener("submit", scan);
    q("stockAuditFilters").addEventListener("click", event => {
      const button = event.target.closest("[data-audit-filter]");
      if (button) { filter = button.dataset.auditFilter; limit = 120; render(); }
    });
    for (const id of ["stockAuditSearch", "stockAuditSource"]) q(id).addEventListener("input", () => { limit = 120; render(); });
    for (const id of ["stockAuditPerson", "stockAuditDate"]) q(id).addEventListener("change", syncIdentity);
    q("stockAuditShowMore").addEventListener("click", () => { limit += 120; render(); });
    q("stockGroupedSummary").addEventListener("toggle", () => { if (q("stockGroupedSummary").open) a.refresh(); });
    q("stockAuditLocations").addEventListener("click", event => {
      const button = event.target.closest("[data-audit-location]");
      if (button && !isDraft()) { q("stockAuditLocations").dataset.location = button.dataset.auditLocation; render(); }
    });
    a.onBeforeUnload(event => { if (dirty || writing || finishing) { event.preventDefault(); event.returnValue = ""; } });
    return { render, reset, finish, isDraft, setStatus,
      flush: () => ready && isDraft() && (dirty || writing) ? flushDraft() : Promise.resolve(),
      changed() { saving = null; scheduleDraft(); },
      toggle(id) { if (editable()) setStatus(id, itemStatus(a.read(), id) === "present" ? "pending" : "present"); } };
  }
  return { itemStatus, stats, mark, changes, scanMatch, serialKey, create };
});
