(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SatisClients = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const normalized = value => String(value || "").toLocaleLowerCase("pl-PL").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l").replace(/\s+/g, " ").trim();
  const phoneKey = value => {
    const digits = String(value || "").replace(/\D/g, "");
    if (digits.length === 13 && digits.startsWith("0048")) return digits.slice(4);
    return digits.length === 11 && digits.startsWith("48") ? digits.slice(2) : digits;
  };
  function postalCities(code, entries, knownCity = "") {
    if (!/^\d{2}-\d{3}$/.test(code)) return [];
    if (knownCity) return [knownCity];
    const cities = new Map();
    for (const entry of entries) if (entry.postalCode === code && entry.city) cities.set(normalized(entry.city), entry.city);
    return [...cities.values()].sort((x, y) => x.localeCompare(y, "pl"));
  }
  const sourceKey = row => `${row.type}:${row.id}`;
  const visitLabels = { PLANNED: "Zaplanowana", COMPLETED: "Odbyta", CANCELLED: "Anulowana", MISSED: "Nieobecność" };
  function sourceIndex(rows) {
    const byName = new Map(), byKey = new Map();
    for (const row of rows) {
      const key = normalized(row.name);
      if (!key || !row.id) continue;
      byKey.set(sourceKey(row), row);
      if (!byName.has(key)) byName.set(key, []);
      byName.get(key).push(row);
    }
    return { byName, byKey };
  }
  function suggestions(index, query = "") {
    const tokens = normalized(query).split(" ").filter(Boolean);
    return [...index.byName.values()].filter(rows => tokens.every(token => normalized(rows.map(row =>
      [row.name, row.phone, row.model, row.serial, row.number].join(" ")).join(" ")).includes(token)))
      .map(rows => {
        const sorted = [...rows].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
        const phones = [...new Set(rows.map(row => phoneKey(row.phone)).filter(Boolean))];
        const addresses = [...new Set(rows.map(row => row.address).filter(Boolean))];
        return {name: sorted[0].name, rows: sorted, phone: phones.length === 1 ? phones[0] : "",
          address: addresses.length === 1 ? addresses[0] : "", ambiguous: phones.length > 1 || addresses.length > 1,
          location: sorted[0].location || "P63"};
      }).sort((a, b) => a.name.localeCompare(b.name, "pl"));
  }
  function linkedTimeline(index, links) {
    return links.map(link => index.byKey.get(`${link.source_type}:${link.source_id}`)).filter(Boolean)
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  }
  function visitEvents(visits, from, to) {
    return visits.filter(visit => {
      const date = new Date(visit.starts_at);
      const local = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      return Number.isFinite(date.getTime()) && local >= from && local <= to;
    }).map(visit => ({...visit, localDate: localInput(visit.starts_at).slice(0, 10)}));
  }
  function localInput(value) {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "";
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }
  function visitStart(day, time) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error("Podaj prawidłowy dzień i godzinę wizyty.");
    const value = `${day}T${time}`, date = new Date(value);
    if (!Number.isFinite(date.getTime()) || localInput(date) !== value) throw new Error("Podaj prawidłowy dzień i godzinę wizyty.");
    return date.toISOString();
  }
  function profilePayload(form, person, street, city) {
    const name = person(form.name.trim()), phone = phoneKey(form.phone);
    if (name.split(/\s+/).length < 2 || name.length > 160) throw new Error("Wpisz imię i nazwisko klienta.");
    if (phone && !/^\d{9}$/.test(phone)) throw new Error("Wpisz prawidłowy numer telefonu (9 cyfr).");
    if (form.postal && !/^\d{2}-\d{3}$/.test(form.postal)) throw new Error("Kod pocztowy: 00-000.");
    return {full_name: name, phone, street: street(form.street), postal_code: form.postal, city: city(form.city), location: form.location, archived: Boolean(form.archived)};
  }
  function create(a) {
    const d = a.document, q = id => d.getElementById(id);
    const requiredIds = ["clientsNotebook","clientsMessage","clientsSearch","clientsArchived","clientsRefresh","clientsMore","clientsNew","clientsForm",
      "clientsList","clientsCount","clientsListEmpty","clientsSuggestions","clientsSuggestionsSection","clientsCard","clientsCardTitle",
      "clientName","clientPhone","clientStreet","clientPostal","clientCity","clientLocation","clientArchive","clientDelete","clientIdentityWarning",
      "clientActivitySection","clientActivityEditor","clientActivityKind","clientActivityTitle","clientActivityNote","clientVisitFields","clientVisitDate","clientVisitTime",
      "clientVisitDuration","clientVisitLocation","clientVisitStatus","clientAddVisit","clientAddNote","clientCancelActivity","clientSourceSection",
      "clientCandidates","clientCandidatesEmpty","clientCandidatesCount","clientHistory","clientTimelineFilters","clientOperations",
      "clientsReminderBtn","clientsPlaceFilter","clientsVisitList","clientsVisitsEmpty","clientAddressHint","clientCitySuggestions"];
    if (requiredIds.some(id=>!q(id))) throw new Error("Widok Klientów wymaga odświeżenia strony.");
    let index = sourceIndex([]), sourceRows = null, generation = 0, listSequence = 0, detailSequence = 0, visitSequence = 0;
    let profiles = [], total = 0, detail = null, visits = [], operations = new Map();
    let busy = false, loaded = false, missingSchema = false, editingActivity = null, newProfileId = "", activityId = "", searchTimer, pollTimer;
    let clientLocation = "", timelineKind = "all", profileDirty = false, activityDirty = false, autoCity = "", autoPostal = "";
    const discard = () => !(profileDirty || activityDirty) || a.confirm("Porzucić niezapisane zmiany na karcie klienta?");
    function unsaved() {
      if (!profileDirty && !activityDirty) return false;
      notify("Zapisz lub anuluj edycję przed zmianą powiązań.", true); return true;
    }
    const allowed = () => a.owner() && Boolean(a.user());
    function node(tag, text = "", className = "") { const n = d.createElement(tag); n.textContent = text; n.className = className; return n; }
    function button(text, action, className = "reset-filters-btn") {
      const b = node("button", text, className); b.type = "button"; b.addEventListener("click", action); return b;
    }
    function notify(text, error = false) { q("clientsMessage").textContent = text; q("clientsMessage").dataset.error = String(error); }
    function getIndex() {
      const rows = a.sources();
      if (rows !== sourceRows) { sourceRows = rows; index = sourceIndex(rows); }
      return index;
    }
    async function rpc(name, args = {}) {
      if (!allowed()) throw new Error("Brak dostępu do kartoteki.");
      const epoch = generation, user = a.user();
      const result = await a.rpc(name, args);
      if (epoch !== generation || !allowed() || user !== a.user()) throw new Error("Sesja została zakończona.");
      if (result.error) {
        const e = new Error(result.error.code === "PT409" ? "Dane zmieniły się na innym komputerze. Odśwież kartę przed kolejnym zapisem."
          : result.error.code === "PT423" ? "Karta z tym nazwiskiem i telefonem już istnieje. Wyszukaj ją również w archiwum."
          : result.error.code === "PT422" ? "Termin nakłada się na inną wizytę w tym gabinecie."
          : result.error.code === "42501" ? "Baza nie przyznała dostępu do kartoteki temu kontu."
          : /PGRST202|42883|42P01/.test(result.error.code || "") ? "Kartoteka wymaga uruchomienia supabase-clients.sql w SQL Editor."
          : "Nie udało się wykonać operacji. Sprawdź połączenie; niezapisane dane pozostają w formularzu.");
        e.code = result.error.code;
        if (/PGRST202|42883|42P01/.test(e.code || "")) missingSchema = true;
        throw e;
      }
      missingSchema = false;
      return result.data;
    }
    async function write(action, id, data, revision) {
      const fingerprint = JSON.stringify([action, id, data, revision ?? null]);
      if (!operations.has(fingerprint)) operations.set(fingerprint, a.id());
      const result = await rpc("satis_clients_write", {p_request_id: operations.get(fingerprint), p_action: action,
        p_id: id, p_expected_revision: revision ?? null, p_data: data});
      operations.delete(fingerprint);
      return result;
    }
    async function guarded(work) {
      if (!allowed() || busy) return;
      const epoch = generation; busy = true; setBusy(true);
      try { await work(); }
      catch (e) { if (epoch === generation && allowed()) notify(e.message, true); }
      finally { if (epoch === generation && allowed()) { busy = false; setBusy(false); } }
    }
    function setBusy(value) {
      q("clientsNotebook").querySelectorAll("input,select,textarea,button").forEach(control => {control.disabled = value;});
      q("clientsNotebook").querySelectorAll("[data-client-write]").forEach(control => {control.disabled = value || !loaded || missingSchema;});
    }
    function renderList() {
      if (!allowed()) return clear();
      const location = clientLocation;
      const filtered = profiles.filter(profile => !location || profile.location === location);
      const list = q("clientsList");
      list.replaceChildren(...filtered.map(profile => {
        const b = button("", () => {void guarded(() => select(profile.id));}, "clients-person");
        b.setAttribute("aria-pressed", String(detail?.profile.id === profile.id));
        const heading = node("div", "", "clients-person-heading");
        heading.append(node("strong", profile.full_name), a.locationPill(profile.location));
        b.append(heading, node("span", a.phone(profile.phone) || "Brak telefonu"));
        return b;
      }));
      q("clientsCount").textContent = `${filtered.length} na liście · razem ${total}`;
      q("clientsMore").hidden = profiles.length >= total;
      q("clientsListEmpty").hidden = filtered.length > 0;
      const query = q("clientsSearch").value.trim();
      const proposed = q("clientsSuggestions");
      proposed.replaceChildren();
      if (query.length >= 2 && !q("clientsArchived").checked) {
        for (const candidate of suggestions(getIndex(), query).filter(item => !location || item.rows.some(row => row.location === location)).slice(0, 30)) {
          const b = button("", () => newCard(candidate), "clients-person clients-proposed");
          const heading = node("div", "", "clients-person-heading"), places = node("span", "", "clients-person-places");
          for (const place of [...new Set(candidate.rows.map(row=>row.location))].filter(place=>["T12","P63","P50"].includes(place))) places.append(a.locationPill(place));
          heading.append(node("strong", candidate.name), places);
          b.append(heading, node("span", `${candidate.rows.length} wpisów źródłowych · wymaga potwierdzenia osoby`));
          if (candidate.ambiguous) b.append(node("small", "Różne dane kontaktowe — możliwe różne osoby", "clients-warning"));
          proposed.append(b);
        }
      }
      q("clientsSuggestionsSection").hidden = !proposed.children.length;
    }
    async function list(append = false) {
      if (!allowed()) return;
      const sequence = ++listSequence;
      const offset = append ? profiles.length : 0;
      const data = await rpc("satis_clients_overview", {p_query: q("clientsSearch").value.trim(), p_offset: offset, p_archived: q("clientsArchived").checked, p_location: clientLocation});
      if (sequence !== listSequence) return;
      profiles = append ? [...profiles, ...(data.profiles || [])] : data.profiles || [];
      total = Number(data.total) || 0; loaded = true;
      renderList(); setBusy(busy);
    }
    function fillProfile(profile) {
      profileDirty = false; activityDirty = false;
      autoCity = ""; autoPostal = "";
      q("clientAddressHint").textContent = ""; q("clientCitySuggestions").replaceChildren();
      for (const [id, field] of [["clientName","full_name"],["clientPhone","phone"],["clientStreet","street"],
        ["clientPostal","postal_code"],["clientCity","city"],["clientLocation","location"]]) q(id).value = profile[field] || (field === "location" ? a.station() : "");
      q("clientPhone").value = a.phone(profile.phone);
      a.locationAccent(q("clientLocation"));
      q("clientsCard").hidden = false;
      q("clientsCardTitle").textContent = profile.full_name || "Nowy klient";
      q("clientArchive").hidden = !profile.id;
      q("clientArchive").textContent = profile.archived ? "Przywróć kartę" : "Archiwizuj";
      q("clientDelete").hidden = !profile.id;
      q("clientActivitySection").hidden = !profile.id || profile.archived;
      q("clientSourceSection").hidden = !profile.id;
      q("clientActivityEditor").hidden = true;
      editingActivity = null;
    }
    function newCard(candidate = null) {
      if (!allowed() || busy || !discard()) return;
      detailSequence++; detail = null; newProfileId = a.id();
      const parts = a.addressParts(candidate?.address || "");
      fillProfile({full_name: candidate?.name || "", phone: candidate?.phone || "", street: parts.street || "",
        postal_code: parts.postalCode || "", city: parts.city || "", location: candidate?.location || a.station()});
      q("clientHistory").replaceChildren(); q("clientOperations").replaceChildren();
      q("clientIdentityWarning").hidden = !candidate;
      q("clientIdentityWarning").textContent = candidate ? "To propozycja danych, nie potwierdzona tożsamość. Sprawdź osobę i dane kontaktowe. Po zapisaniu wybierz jej właściwe dokumenty." : "";
      q("clientName").focus();
    }
    async function select(id) {
      if (!discard()) return;
      const sequence = ++detailSequence;
      const data = await rpc("satis_client_detail", {p_id: id});
      if (sequence !== detailSequence) return;
      detail = data; fillProfile(data.profile);
      q("clientIdentityWarning").hidden = true;
      renderHistory(); renderLinks(); renderList();
    }
    async function saveProfile() {
      normalizeContact();
      const data = profilePayload({name:q("clientName").value,phone:q("clientPhone").value,street:q("clientStreet").value,
        postal:q("clientPostal").value.trim(),city:q("clientCity").value,location:q("clientLocation").value,archived:detail?.profile.archived}, a.person, a.street, a.city);
      const id = detail?.profile.id || newProfileId || (newProfileId = a.id());
      if (!detail && profiles.some(p => normalized(p.full_name) === normalized(data.full_name) && data.phone && phoneKey(p.phone) === data.phone)) {
        throw new Error("Karta z tym nazwiskiem i telefonem już jest na liście. Otwórz ją zamiast tworzyć kolejną.");
      }
      await write("PROFILE", id, data, detail?.profile.revision);
      profileDirty = false; activityDirty = false;
      await select(id); await list(); notify("Karta zapisana. Dane źródłowe nie zostały zmienione.");
    }
    async function archive() {
      if (!detail || !discard() || !a.confirm(detail.profile.archived ? "Przywrócić kartę klienta?" : "Zarchiwizować kartę? Dane pozostaną w archiwum; najpierw zakończ lub anuluj zaplanowane wizyty.")) return;
      const p = detail.profile;
      const data = Object.fromEntries(["full_name","phone","street","postal_code","city","location"].map(key => [key,p[key]]));
      await write("PROFILE", p.id, {...data,archived:!p.archived},p.revision);
      profileDirty = false; activityDirty = false;
      await select(p.id); await list(); await upcoming(); notify("Zmieniono archiwizację karty.");
    }
    async function remove() {
      if (!detail || !discard() || !a.confirm("Trwale usunąć tę kartę, jej wizyty, notatki i powiązania? Oryginalne wpisy w Bazie, Serwisie i Umowach nie zostaną usunięte. Nie można tego cofnąć w aplikacji.")) return;
      await write("DELETE", detail.profile.id, {}, detail.profile.revision);
      profileDirty = false; activityDirty = false;
      detail = null; q("clientsCard").hidden = true; q("clientsForm").reset(); q("clientActivityEditor").reset();
      q("clientHistory").replaceChildren(); q("clientOperations").replaceChildren();
      await list(); await upcoming(); notify("Karta usunięta. Dokumenty źródłowe pozostały bez zmian.");
    }
    function renderLinks() {
      if (!detail || !allowed()) return;
      const idx = getIndex(), linked = new Set(detail.links.map(link => `${link.source_type}:${link.source_id}`));
      const rows = idx.byName.get(normalized(detail.profile.full_name)) || [];
      const candidates = rows.filter(row => !linked.has(sourceKey(row)));
      q("clientCandidates").replaceChildren(...candidates.slice(0, 100).map(row => {
        const line = node("div", "", "client-source-row");
        const content = node("div");
        content.append(node("strong", `${row.kind} · ${row.date ? a.date(row.date) : "bez daty"}`),
          node("span", [row.name,row.model,row.serial,row.number,row.location].filter(Boolean).join(" · ")),
          node("small", [row.phone ? a.phone(row.phone) : "brak telefonu",row.address || "brak adresu"].join(" · ")));
        if (phoneKey(row.phone) && detail.profile.phone && phoneKey(row.phone) !== detail.profile.phone) content.append(node("small", "Inny telefon — sprawdź osobę", "clients-warning"));
        line.append(content, button("Potwierdź powiązanie", () => {void guarded(async () => {
          if (unsaved()) return;
          if (!a.confirm("Potwierdzasz, że ten dokument dotyczy tej osoby? Samo zgodne imię i nazwisko nie wystarcza.")) return;
          await write("LINK",detail.profile.id,{source_type:row.type,source_id:row.id},detail.profile.revision);
          await select(detail.profile.id); notify("Powiązanie potwierdzone.");
        });}));
        return line;
      }));
      q("clientCandidatesEmpty").hidden = candidates.length > 0;
      q("clientCandidatesCount").textContent = `${candidates.length}${candidates.length > 100 ? " · pokazano pierwsze 100" : ""}`;
    }
    function renderHistory() {
      if (!detail || !allowed()) return;
      const idx = getIndex(), linked = linkedTimeline(idx,detail.links);
      const changedPerson = linked.filter(row => normalized(row.name) !== normalized(detail.profile.full_name));
      const lines = linked.filter(row => !changedPerson.includes(row)).map(row => ({...row,date:row.date || "",time:row.date || "",source:true}));
      for (const event of detail.activities) lines.push({...event,time:event.starts_at || event.created_at,source:false});
      lines.sort((x,y) => String(y.time).localeCompare(String(x.time)));
      q("clientHistory").replaceChildren(...lines.filter(row => timelineKind === "all" || (timelineKind === "source") === row.source).map(row => {
        const item = node("article", "", "client-timeline-item"), content = node("div");
        if (row.source) {
          content.append(node("strong", `${row.kind} · ${row.date ? a.date(row.date) : "bez daty"}`), node("span",[row.model,row.serial,row.number,row.status,row.location].filter(Boolean).join(" · ")));
          item.append(content,button("Otwórz", () => {if (allowed() && !busy && discard()) row.open();}),button("Odłącz", () => {void guarded(async () => {
            if (unsaved()) return;
            if (!a.confirm("Odłączyć ten dokument od karty? Oryginalny dokument pozostanie bez zmian.")) return;
            await write("UNLINK",detail.profile.id,{source_type:row.type,source_id:row.id},detail.profile.revision); await select(detail.profile.id);
          });}));
        } else {
          content.append(node("strong", row.kind === "VISIT" ? `${a.dateTime(row.starts_at)} · ${visitLabels[row.status]}` : `${a.dateTime(row.created_at)} · Notatka`), node("span",row.title),node("p",row.note,"client-note"));
          item.dataset.visitStatus = row.status;
          item.append(content,button("Edytuj", () => editActivity(row.kind,row)));
        }
        return item;
      }));
      const unavailable = detail.links.filter(link => !idx.byKey.has(`${link.source_type}:${link.source_id}`));
      for (const row of changedPerson) {
        const warning = node("div","","client-source-row clients-warning");
        warning.append(node("span",`${row.kind}: dokument ma teraz inne dane osoby. Sprawdź powiązanie w źródle.`),button("Odłącz",()=>{void guarded(async()=>{
          if (unsaved()) return;
          if(!a.confirm("Odłączyć dokument z innymi danymi osoby? Oryginał pozostanie bez zmian."))return;
          await write("UNLINK",detail.profile.id,{source_type:row.type,source_id:row.id},detail.profile.revision);await select(detail.profile.id);
        });}));
        q("clientHistory").append(warning);
      }
      if (unavailable.length) q("clientHistory").append(node("p",`Nie załadowano ${unavailable.length} powiązanych rekordów źródłowych. Odśwież dane aplikacji; powiązania nie zostały usunięte.`));
      if (!lines.length) q("clientHistory").append(node("p","Brak potwierdzonych powiązań i działań."));
      if (detail.activities.length >= 200) q("clientHistory").append(node("p","Pokazano 200 ostatnich działań na karcie."));
      q("clientOperations").replaceChildren(...detail.operations.map(event => node("p",`${a.dateTime(event.created_at)} · ${event.operation} · ${event.actor_id}`)));
    }
    function editActivity(kind, event = null) {
      if (!detail || detail.profile.archived || !allowed() || busy) return;
      if (profileDirty) { notify("Zapisz najpierw zmienione dane kontaktowe.", true); return; }
      if (activityDirty && !discard()) return;
      activityDirty = false;
      editingActivity = event; activityId = event?.id || a.id();
      q("clientActivityEditor").hidden = false; q("clientActivityKind").value = kind;
      q("clientActivityTitle").value = event?.title || (kind === "VISIT" ? "Wizyta kontrolna" : "Ustalenia");
      q("clientActivityNote").value = event?.note || "";
      const localDate = event?.starts_at ? localInput(event.starts_at) : "";
      a.setDate(q("clientVisitDate"), localDate.slice(0, 10));
      q("clientVisitTime").value = localDate.slice(11, 16);
      q("clientVisitDate").required = kind === "VISIT";
      q("clientVisitTime").required = kind === "VISIT";
      q("clientVisitDuration").value = String(event?.duration_minutes || 30);
      q("clientVisitLocation").value = event?.location || detail.profile.location;
      a.locationAccent(q("clientVisitLocation"));
      q("clientVisitStatus").value = event?.status || "PLANNED";
      q("clientVisitFields").hidden = kind !== "VISIT";
      q("clientActivityTitle").focus();
    }
    async function saveActivity() {
      if (!detail) return;
      const kind = q("clientActivityKind").value, title = q("clientActivityTitle").value.trim(), note = q("clientActivityNote").value.trim();
      if (!title || title.length > 160 || note.length > 2000) throw new Error("Podaj krótki tytuł; notatka może mieć maksymalnie 2000 znaków.");
      if (/(?:^|\D)\d{11}(?!\d)/.test(`${title} ${note}`)) throw new Error("Nie wpisuj numeru PESEL w temacie ani notatce.");
      const startsAt = kind === "VISIT" ? visitStart(a.isoDate(q("clientVisitDate").value), q("clientVisitTime").value) : null;
      const data = {customer_id:detail.profile.id,kind,title,note,starts_at:startsAt,
        duration_minutes:Number(q("clientVisitDuration").value),location:q("clientVisitLocation").value,
        status:kind === "VISIT" ? q("clientVisitStatus").value : "COMPLETED"};
      try { await write("ACTIVITY",activityId,data,editingActivity?.revision); }
      catch (e) {
        if (e.code !== "PT422" || !a.confirm("W tym gabinecie jest już wizyta w tym czasie. Zapisać mimo nakładania terminów?")) throw e;
        await write("ACTIVITY",activityId,{...data,allow_overlap:true},editingActivity?.revision);
      }
      activityDirty = false;
      await select(detail.profile.id); await upcoming(); notify("Wpis zapisany w historii klienta.");
    }
    async function upcoming() {
      if (!allowed()) return;
      const sequence = ++visitSequence;
      const data = await rpc("satis_clients_upcoming");
      if (sequence !== visitSequence) return;
      visits = Array.isArray(data) ? data : [];
      renderVisits(); a.refreshCalendar();
    }
    function renderVisits() {
      if (!allowed()) return;
      const now = Date.now(), today = localInput(now).slice(0,10);
      const due = visits.filter(visit => localInput(visit.starts_at).slice(0,10) <= today);
      q("clientsReminderBtn").hidden = due.length === 0;
      q("clientsReminderBtn").textContent = `Wizyty · ${due.length}`;
      q("clientsVisitList").replaceChildren(...visits.filter(visit => !clientLocation || visit.location === clientLocation).slice(0,100).map(visit => {
        const b = button("", () => {void guarded(() => select(visit.customer_id));},"client-visit");
        b.dataset.overdue = String(new Date(visit.starts_at).getTime() < now);
        const heading = node("div", "", "clients-person-heading");
        heading.append(node("strong",a.dateTime(visit.starts_at)),a.locationPill(visit.location));
        b.append(heading,node("span",visit.full_name),node("small",visit.title)); return b;
      }));
      q("clientsVisitsEmpty").hidden = visits.some(visit => !clientLocation || visit.location === clientLocation);
    }
    async function open() {
      if (!allowed()) return clear();
      try { setBusy(busy); getIndex(); renderList(); await list(); await upcoming(); notify(""); }
      catch (e) { if (allowed()) { notify(e.message,true); setBusy(false); } }
    }
    function refreshSources() {
      if (!allowed() || !a.active()) return;
      try { getIndex(); renderList(); renderLinks(); renderHistory(); }
      catch { notify("Nie udało się odczytać powiązanych dokumentów. Odśwież dane; zapisane karty nie zostały usunięte.",true); }
    }
    function clear() {
      generation++; listSequence++; detailSequence++; visitSequence++; clearTimeout(searchTimer); clearTimeout(pollTimer);
      profiles=[];visits=[];detail=null;operations.clear();sourceRows=null;index=sourceIndex([]);loaded=false;busy=false;missingSchema=false;newProfileId="";editingActivity=null;activityId="";profileDirty=false;activityDirty=false;
      for (const id of ["clientsList","clientsSuggestions","clientCandidates","clientHistory","clientOperations","clientsVisitList"]) q(id)?.replaceChildren();
      q("clientsForm")?.reset(); q("clientActivityEditor")?.reset();
      q("clientsSearch").value="";q("clientsCard").hidden=true;q("clientsReminderBtn").hidden=true;notify("");
      for (const id of ["clientsCardTitle","clientIdentityWarning","clientsCount","clientCandidatesCount","clientAddressHint"]) q(id).textContent="";
      q("clientCitySuggestions").replaceChildren(); autoCity="";autoPostal="";
    }
    function startReminders() {
      clearTimeout(pollTimer);
      if (!allowed()) return;
      const epoch = generation;
      void upcoming().catch(() => {});
      pollTimer = setTimeout(function poll() {
        if (epoch !== generation || !allowed()) return;
        if (!d.hidden) void upcoming().catch(() => {});
        pollTimer=setTimeout(poll,300000);
      },300000);
    }
    function syncPostalCity() {
      const code = q("clientPostal").value, city = q("clientCity");
      const candidates = postalCities(code, a.postalEntries?.() || [], a.cityForPostal?.(code) || "");
      q("clientCitySuggestions").replaceChildren(...candidates.map(value => {const option=node("option");option.value=value;return option;}));
      if (!city.value || city.value === autoCity) {
        const value = candidates.length === 1 ? a.city(candidates[0]) : "";
        if (city.value !== value) { city.value = value; profileDirty = true; }
        autoCity = value;
      }
      q("clientAddressHint").textContent = candidates.length > 1 ? "Ten kod ma kilka miejscowości. Wybierz właściwą lub wpisz ją ręcznie."
        : candidates.length === 1 && city.value && normalized(city.value) !== normalized(candidates[0])
          ? `Sprawdź miejscowość: zapisane adresy dla ${code} wskazują ${candidates[0]}.`
          : /^\d{2}-\d{3}$/.test(code) && !candidates.length && !city.value ? "Nie znamy miejscowości dla tego kodu. Wpisz ją ręcznie." : "";
    }
    function normalizeContact() {
      const before = ["clientName","clientStreet","clientCity","clientPostal","clientPhone"].map(id=>q(id).value);
      q("clientName").value = a.person(q("clientName").value.trim());
      q("clientStreet").value = a.street(q("clientStreet").value);
      q("clientCity").value = a.city(q("clientCity").value);
      const phone = phoneKey(q("clientPhone").value);
      if (!phone || /^\d{9}$/.test(phone)) q("clientPhone").value = a.phone(phone);
      syncPostalCity();
      const postal = q("clientPostal");
      if ((!postal.value || postal.value === autoPostal) && q("clientCity").value) {
        const suggested = a.postalCode?.(q("clientCity").value, q("clientStreet").value) || "";
        if (suggested) { postal.value = suggested; autoPostal = suggested; syncPostalCity(); }
        else if (autoPostal) {postal.value="";autoPostal="";syncPostalCity();}
      }
      if (before.some((value,i)=>value!==q(["clientName","clientStreet","clientCity","clientPostal","clientPhone"][i]).value)) profileDirty=true;
    }
    q("clientsSearch").addEventListener("input", () => {
      clearTimeout(searchTimer); renderList(); searchTimer=setTimeout(() => {void list().catch(e => {if(allowed())notify(e.message,true);});},250);
    });
    q("clientsArchived").addEventListener("change", () => {void guarded(() => list());});
    q("clientsRefresh").addEventListener("click", () => {void guarded(open);});
    q("clientsMore").addEventListener("click", () => {void guarded(() => list(true));});
    q("clientsNew").addEventListener("click", () => newCard());
    q("clientsForm").addEventListener("submit", event => {event.preventDefault();void guarded(saveProfile);});
    q("clientArchive").addEventListener("click", () => {void guarded(archive);});
    q("clientDelete").addEventListener("click", () => {void guarded(remove);});
    q("clientAddVisit").addEventListener("click", () => editActivity("VISIT"));
    q("clientAddNote").addEventListener("click", () => editActivity("NOTE"));
    q("clientActivityEditor").addEventListener("submit", event => {event.preventDefault();void guarded(saveActivity);});
    q("clientCancelActivity").addEventListener("click", () => {if(!activityDirty || a.confirm("Porzucić niezapisany wpis?")){activityDirty=false;q("clientActivityEditor").hidden=true;q("clientActivityEditor").reset();}});
    q("clientsForm").addEventListener("input", () => {profileDirty=true;});
    q("clientActivityEditor").addEventListener("input", () => {activityDirty=true;});
    q("clientPostal").addEventListener("input", () => {const digits=q("clientPostal").value.replace(/\D/g,"").slice(0,5);q("clientPostal").value=digits.length>2?`${digits.slice(0,2)}-${digits.slice(2)}`:digits;autoPostal="";syncPostalCity();});
    for (const id of ["clientName","clientStreet","clientCity","clientPostal"]) q(id).addEventListener("blur", normalizeContact);
    q("clientCity").addEventListener("input", () => {autoCity="";});
    q("clientStreet").addEventListener("paste", event => {
      const parts = a.addressParts(event.clipboardData?.getData("text") || "");
      if (!parts.street || !parts.city) return;
      event.preventDefault();
      q("clientStreet").value=parts.street;q("clientPostal").value=parts.postalCode||"";q("clientCity").value=parts.city;
      autoCity="";autoPostal="";profileDirty=true;normalizeContact();
    });
    q("clientLocation").addEventListener("change", () => a.locationAccent(q("clientLocation")));
    q("clientVisitLocation").addEventListener("change", () => a.locationAccent(q("clientVisitLocation")));
    q("clientPhone").addEventListener("blur", () => {const phone=phoneKey(q("clientPhone").value);if(!phone || /^\d{9}$/.test(phone))q("clientPhone").value=a.phone(phone);});
    q("clientsPlaceFilter").addEventListener("click", event => {
      const b=event.target.closest("[data-client-place]");if(!b)return;clientLocation=b.dataset.clientPlace;
      q("clientsPlaceFilter").querySelectorAll("button").forEach(button=>button.setAttribute("aria-pressed",String(button===b)));renderList();renderVisits();void list().catch(e=>{if(allowed())notify(e.message,true);});
    });
    q("clientTimelineFilters").addEventListener("click", event => {
      const b=event.target.closest("[data-client-timeline]");if(!b)return;timelineKind=b.dataset.clientTimeline;
      q("clientTimelineFilters").querySelectorAll("button").forEach(button=>button.setAttribute("aria-pressed",String(button===b)));renderHistory();
    });
    q("clientsReminderBtn").addEventListener("click", () => {if(allowed())a.navigate();});
    a.onBeforeUnload?.(event => {if(allowed() && (profileDirty || activityDirty)){event.preventDefault();event.returnValue="";}});
    setBusy(false);
    return {open,clear,refreshSources,startReminders,events:(from,to)=>allowed()?visitEvents(visits,from,to):[],
      select: id => guarded(() => select(id))};
  }
  return {normalized,phoneKey,postalCities,sourceKey,sourceIndex,suggestions,linkedTimeline,visitEvents,localInput,visitStart,profilePayload,create};
});
