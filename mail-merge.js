(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.SatisMailMerge = api;
})(typeof window === "undefined" ? null : window, function () {
  "use strict";
  const PAGE = {width: 595.32, height: 841.92};
  const normalize = value => String(value || "").normalize("NFD").replace(/\p{M}/gu, "").replace(/ł/giu, "l").trim().replace(/\s+/gu, " ").toLowerCase();
  const personal = ["personRole", "firstName", "middleName", "surname", "pesel", "birthDate", "province", "county", "municipality", "city", "street", "house", "flat", "postal", "postOffice", "phone", "email", "applicationNumber", "degree", "certificateNumber", "certificateValidity", "certificateUntil", "subject", "orderNumber", "cost", "nfz", "requested"];
  function parseMoney(value) {
    const text = String(value ?? "").replace(/[\s\u00a0\u202f]/gu, "").replace(/zł$/iu, "").replace(",", ".");
    if (!/^\d+(?:\.\d{1,2})?$/u.test(text)) return null;
    const cents = Math.round(Number(text) * 100);
    return Number.isSafeInteger(cents) ? cents : null;
  }
  function money(value) {return (value / 100).toLocaleString("pl-PL", {minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: "always"});}
  function amounts(data) {
    const cost = parseMoney(data.cost), nfz = parseMoney(data.nfz), requested = parseMoney(data.requested);
    return {cost, nfz, requested, own: cost !== null && nfz !== null && requested !== null ? cost - nfz - requested : null};
  }
  function splitName(value) {
    const words = String(value || "").trim().split(/\s+/u).filter(Boolean);
    return {firstName: words[0] || "", middleName: words.length > 2 ? words.slice(1, -1).join(" ") : "", surname: words.length > 1 ? words.at(-1) : ""};
  }
  function geographyIndex(data) {
    const names = new Map();
    data.places.forEach(place => {const key = normalize(place[0]);if (!names.has(key)) names.set(key, []);names.get(key).push(place);});
    return {data, names};
  }
  function geographyMatches(index, city) {
    return (index?.names.get(normalize(city)) || []).map(place => {
      const unit = index.data.units[place[1]];
      return {id: place[2], city: place[0], municipality: unit[0], county: unit[1], province: unit[2], kind: place[3]};
    });
  }
  function validate(data, validPesel) {
    const errors = [];
    for (const [key, label] of [["firstName", "Imię"], ["surname", "Nazwisko"], ["city", "Miejscowość"], ["house", "Nr domu"], ["province", "Województwo"], ["county", "Powiat"], ["municipality", "Gmina"], ["degree", "Stopień niepełnosprawności"], ["subject", "Przedmiot wniosku"], ["orderNumber", "Numer zlecenia"]]) {
      if (!String(data[key] || "").trim()) errors.push({field: key, text: `Uzupełnij: ${label}.`});
    }
    if (!validPesel(data.pesel)) errors.push({field: "pesel", text: "Wpisz poprawny PESEL (11 cyfr i prawidłowa suma kontrolna)."});
    if (!/^\d{2}-\d{3}$/u.test(data.postal || "")) errors.push({field: "postal", text: "Kod pocztowy powinien mieć format 00-000."});
    const phone = String(data.phone || "").replace(/\D/gu, "");
    if (!/^(?:(?:48|0048))?\d{9}$/u.test(phone)) errors.push({field: "phone", text: "Wpisz prawidłowy numer telefonu."});
    if (data.certificateValidity === "periodic" && !data.certificateUntil) errors.push({field: "certificateUntil", text: "Podaj datę ważności orzeczenia."});
    const sums = amounts(data);
    for (const key of ["cost", "nfz", "requested"]) if (sums[key] === null) errors.push({field: key, text: "Uzupełnij prawidłowe kwoty zakupu i dofinansowania."});
    if (sums.nfz !== null && sums.nfz <= 0) errors.push({field: "nfz", text: "Ten wzór wymaga dofinansowania NFZ większego od 0."});
    if (sums.own !== null && sums.own < 0) errors.push({field: "requested", text: "NFZ i wnioskowane dofinansowanie nie mogą przekraczać kosztu zakupu."});
    return errors;
  }
  function placements(data) {
    const result = [];
    const add = (page, field, x, y, width = 360, height = 13, text = data[field]) => {
      if (text !== "" && text != null) result.push({page, field, x, y, width, height, text: String(text)});
    };
    const cell = (page, field, top, bottom, x = 203.5, right = 563) => add(page, field, x, top + 3, right - x, bottom - top - 6);
    const tick = (page, field, x, y) => add(page, field, x, y, 10, 11, "X");
    if (data.personRole === "ward") {
      cell(2,"firstName",522.6,542.2);cell(2,"middleName",542.2,561.9);cell(2,"surname",561.9,581.6);
      cell(2,"pesel",581.6,601.3);cell(2,"birthDate",601.3,620.7);
      cell(2,"province",690.7,710.4);cell(2,"county",710.4,730.1);cell(2,"municipality",730.1,749.7);
      cell(2,"city",749.7,769.4);cell(2,"street",769.4,788.2);
      cell(3,"house",59.8,78.1);cell(3,"flat",78.1,97.8);cell(3,"postal",97.8,117.5);cell(3,"postOffice",117.5,137.2);cell(3,"phone",137.2,156.9);cell(3,"email",156.9,176.7);
      if (data.gender) tick(2,"gender",data.gender === "male" ? 205.2 : 285.9,625.9);
    } else {
      cell(1, "role", 307.6, 340.7, 203.5, 563);
      cell(1,"firstName",578.8,598.5);cell(1,"middleName",598.5,618.3);cell(1,"surname",618.3,638);
      cell(1,"pesel",638,658.4);cell(1,"birthDate",658.4,677.3);
      cell(1,"province",735.6,755.3);cell(1,"county",755.3,774.9);cell(1,"municipality",774.9,793.8);
      cell(2,"city",59.8,78.1);cell(2,"street",78.1,97.8);cell(2,"house",97.8,117.5);cell(2,"flat",117.5,137.2);
      cell(2,"postal",137.2,156.9);cell(2,"postOffice",156.9,176.7);cell(2,"phone",196.4,216);cell(2,"email",216,235);
      if (data.sameAddress) tick(2,"sameAddress",28.6,259.5);
      if (data.gender) tick(1,"gender",data.gender === "male" ? 201.8 : 282.4,682.2);
    }
    const degreeY = {severe: 312.9, moderate: 326.7, mild: 340.5, none: 354.3};
    if (degreeY[data.degree]) tick(3,"degree",201.8,degreeY[data.degree]);
    if (data.certificateValidity === "indefinite") tick(3,"certificateValidity",201.8,373.6);
    if (data.certificateValidity === "periodic") {tick(3,"certificateValidity",201.8,387.4);add(3,"certificateUntil",352,387,185,13);}
    cell(3,"certificateNumber",415.8,435.3);
    cell(5,"subject",224.6,244.2,185,563);cell(5,"orderNumber",244.2,264,185,563);
    const sums = amounts(data);
    for (const [key, y, bottom, totalY, totalBottom] of [["cost",264,283.7,420.9,440.7],["nfz",283.7,303.4,440.7,460.4],["own",303.4,336.7,460.4,480.1],["requested",336.7,368.9,480.1,512.5]]) {
      if (sums[key] !== null) {add(5,key,185,y+3,378,bottom-y-6,money(sums[key]));add(5,`${key}Total`,240,totalY+3,323,totalBottom-totalY-6,money(sums[key]));}
    }
    if (data.applicationNumber) add(1,"applicationNumber",98,135.9,151,15);
    return result;
  }
  function fitText(text, width, height, measure) {
    for (let size = 10.5; size >= 8; size -= 0.5) {
      const lines = [];let line = "";
      for (const character of String(text)) {
        if (character === "\n" || measure(line + character, size) > width - 2) {lines.push(line);line = character === "\n" ? "" : character;}
        else line += character;
      }
      lines.push(line);
      if (lines.length * size * 1.05 <= height && lines.every(line => measure(line,size) <= width-2)) return {text: lines.join("\n"), size};
    }
    return null;
  }
  function create(a) {
    const document = a.document, host = document.getElementById("mailMergeNotebook");
    let geo = null, geoPromise = null, queue = [], editingId = "", serial = 0, printBusy = false, cleanupPrint = null, pendingPrint = null, dirty = false, generation = 0;
    const fields = new Map();
    const q = id => document.getElementById(id);
    const authorized = () => a.owner() && Boolean(a.user());
    const node = (tag, cls, text) => {const value = document.createElement(tag);if (cls) value.className = cls;if (text !== undefined) value.textContent = text;return value;};
    const button = (text, action, cls = "reset-filters-btn") => {const value = node("button",cls,text);value.type = "button";value.addEventListener("click", () => {if (authorized()) action();});return value;};
    const message = text => {q("mailMergeMessage").textContent = text;};
    function read() {
      const data = Object.fromEntries(personal.map(key => [key, fields.get(key).value.trim()]));
      data.sameAddress = fields.get("sameAddress").checked;data.role = data.personRole === "applicant" ? "we własnym imieniu" : "";
      if (a.iso(data.certificateUntil)) data.certificateUntil = a.date(a.iso(data.certificateUntil));
      data.gender = a.validPesel(data.pesel) ? Number(data.pesel[9]) % 2 ? "male" : "female" : "";
      return data;
    }
    function updateBirth() {
      const pesel = fields.get("pesel");pesel.value = pesel.value.replace(/\D/gu, "").slice(0,11);
      fields.get("birthDate").value = a.validPesel(pesel.value) ? a.birthDate(pesel.value) : "";
    }
    function updateAmounts() {
      const sums = amounts(read());q("mailMergeOwn").textContent = sums.own === null ? "—" : `${money(sums.own)} zł`;
    }
    function draftIssues() {
      updateBirth();
      const data = read(), errors = validate(data, a.validPesel);
      if (data.pesel && a.validPesel(data.pesel) && a.age(data.pesel) < 0) errors.push({field:"pesel",text:"Data urodzenia z PESEL-u nie może być w przyszłości."});
      if (data.certificateValidity === "periodic" && !a.iso(data.certificateUntil)) errors.push({field:"certificateUntil",text:"Wybierz prawidłową datę ważności orzeczenia."});
      if (data.personRole === "applicant" && data.pesel && a.validPesel(data.pesel) && a.age(data.pesel) < 18) errors.push({field:"personRole",text:"Dla osoby niepełnoletniej wybierz dane podopiecznego. Dane opiekuna uzupełnij osobno w części wnioskodawcy."});
      for (const item of placements(data)) if (!fitText(item.text,item.width,item.height,a.measure)) errors.push({field:item.field,text:"Tekst jest za długi do pola w oryginalnym wniosku. Skróć go przed wydrukiem."});
      fields.forEach((input,key) => {const error = errors.find(item => item.field === key);input.setCustomValidity(error?.text || "");input.setAttribute("aria-invalid",String(Boolean(error)));});
      return errors;
    }
    function reset() {
      editingId = "";fields.forEach(input => {input.value = "";if (input.type === "checkbox") input.checked = false;input.setCustomValidity("");input.removeAttribute("aria-invalid");});
      fields.get("personRole").value = "applicant";
      q("mailMergeMatches").replaceChildren();q("mailMergeGeoChoices").replaceChildren();q("mailMergeSearch").value = "";dirty = false;message("");updateAmounts();
    }
    function load(data, id = "") {
      reset();editingId = id;personal.forEach(key => {fields.get(key).value = data[key] || "";});fields.get("sameAddress").checked = Boolean(data.sameAddress);updateBirth();updateAmounts();
    }
    async function resolveGeo() {
      if (!authorized()) return;
      const city = fields.get("city").value.trim();if (!city) return;
      const lookup = ++generation;
      if (!geoPromise) geoPromise = a.loadGeography().then(data => geographyIndex(data)).catch(() => {geoPromise = null;throw new Error("Słownik GUS jest niedostępny. Uzupełnij region ręcznie i sprawdź dane.");});
      try {geo = await geoPromise;} catch (error) {if (authorized() && lookup === generation) message(error.message);return;}
      if (!authorized() || lookup !== generation || city !== fields.get("city").value.trim()) return;
      const matches = geographyMatches(geo,city), list = q("mailMergeGeoChoices");list.replaceChildren();
      const apply = item => {
        for (const key of ["city","municipality","county","province"]) fields.get(key).value = item[key];
        fields.get("postOffice").value ||= item.city;list.replaceChildren();dirty = true;message("Sprawdź dane adresowe przed dodaniem do kolejki.");
      };
      if (matches.length === 1) apply(matches[0]);
      else if (matches.length) {
        for (const key of ["municipality","county","province"]) fields.get(key).value = "";
        matches.slice(0,30).forEach(item => list.append(button(`${item.city} · ${item.municipality} · ${item.county} · ${item.province}`,() => apply(item))));
        message("Ta nazwa występuje w kilku miejscach. Wybierz właściwą gminę i powiat.");
      } else message("Brak jednoznacznego dopasowania w słowniku. Uzupełnij gminę, powiat i województwo ręcznie.");
    }
    function renderQueue() {
      const list = q("mailMergeQueue");list.replaceChildren();
      queue.forEach(entry => {
        const row = node("tr"), selected = node("input");selected.type = "checkbox";selected.checked = entry.selected;
        selected.setAttribute("aria-label",`Wybierz: ${entry.data.firstName} ${entry.data.surname}`);
        selected.addEventListener("change",() => {if (authorized()) {entry.selected = selected.checked;renderCount();}});
        const check = node("td");check.append(selected);row.append(check);
        for (const text of [`${entry.data.firstName} ${entry.data.middleName} ${entry.data.surname}`.replace(/\s+/gu," "),entry.data.city,entry.data.applicationNumber || "—",entry.data.subject]) row.append(node("td","",text));
        const actions = node("td","mail-merge-actions");actions.append(button("Edytuj",() => {load(entry.data,entry.id);fields.get("firstName").focus();}),button("Usuń",() => {if (a.confirm("Usunąć tę osobę z bieżącej kolejki?")) {queue = queue.filter(item => item.id !== entry.id);if (editingId === entry.id) reset();renderQueue();}}));row.append(actions);list.append(row);
      });renderCount();
    }
    function renderCount() {q("mailMergeCount").textContent = `${queue.filter(item => item.selected).length} / ${queue.length} wybranych · 7 stron na osobę`;}
    function saveDraft() {
      const errors = draftIssues();if (errors.length) {message([...new Set(errors.map(item => item.text))].join("\n"));const field = fields.get(errors[0].field);field?.focus();field?.reportValidity();return;}
      const data = read();if (queue.some(item => item.id !== editingId && item.data.pesel === data.pesel)) {message("Ta osoba jest już w kolejce (ten sam PESEL). Edytuj istniejącą pozycję.");return;}
      if (!editingId && queue.length >= 25) {message("W jednej partii można przygotować do 25 osób. Wydrukuj kolejkę przed dodaniem następnej partii.");return;}
      if (editingId) queue = queue.map(item => item.id === editingId ? {...item,data} : item);
      else queue.push({id:String(++serial),data,selected:true});
      reset();renderQueue();message("Dodano do bieżącej kolejki. Dane nie zostały zapisane na serwerze ani na dysku.");
    }
    function pages(data) {
      const fragment = document.createDocumentFragment(), marks = placements(data);
      for (let page = 1;page <= 7;page++) {
        const sheet = node("article","mail-merge-page"), background = node("img","mail-merge-template");
        background.src = `mail-merge/page-${page}.svg`;background.alt = `Wniosek PCPR Żywiec · strona ${page} z 7`;sheet.append(background);
        marks.filter(item => item.page === page).forEach(item => {
          const fit = fitText(item.text,item.width,item.height,a.measure);if (!fit) throw new Error("Tekst nie mieści się w oryginalnym polu wniosku.");
          const value = node("span","mail-merge-value",fit.text);
          Object.assign(value.style,{left:`${item.x/PAGE.width*100}%`,top:`${item.y/PAGE.height*100}%`,width:`${item.width/PAGE.width*100}%`,fontSize:`${fit.size/PAGE.width*100}cqw`});
          if (item.field === "applicationNumber") value.classList.add("mail-merge-number");sheet.append(value);
        });fragment.append(sheet);
      }return fragment;
    }
    async function print() {
      if (!authorized() || printBusy || cleanupPrint) return;const selected = queue.filter(item => item.selected);
      if (!selected.length) {message("Dodaj osoby do kolejki i zaznacz je do wydruku.");return;}
      if (dirty && !a.confirm("Formularz zawiera zmiany poza kolejką. Wydrukować tylko zapisane pozycje kolejki?")) return;
      printBusy = true;const account = a.user(), epoch = generation;
      try {
        await document.fonts?.ready;if (!authorized() || a.user() !== account || generation !== epoch) return;
        const output = node("section");output.id = "mailMergePrint";pendingPrint = output;
        selected.forEach(entry => output.append(pages(entry.data)));document.body.append(output);
        try {await Promise.all([...output.querySelectorAll("img")].map(img => img.decode()));} catch {output.remove();throw new Error("Nie udało się wczytać wszystkich stron wzoru. Wydruk został wstrzymany.");}
        if (!authorized() || a.user() !== account || generation !== epoch) {output.remove();pendingPrint = null;return;}
        document.body.classList.add("mail-merge-print");
        const cleanup = () => {output.remove();pendingPrint = null;document.body.classList.remove("mail-merge-print");a.window.removeEventListener("afterprint",cleanup);cleanupPrint = null;};
        cleanupPrint = cleanup;a.window.addEventListener("afterprint",cleanup,{once:true});await a.print(cleanup);
      } catch (error) {pendingPrint?.remove();pendingPrint = null;cleanupPrint?.();if (authorized()) message(error.message || "Nie udało się przygotować wydruku.");} finally {printBusy = false;}
    }
    const header = node("header","mail-merge-header");header.append(node("h2","","Korespondencja seryjna"),node("p","document-form-note","Wniosek PCPR Żywiec · oryginalny wzór, 7 stron. Wybierz, czy wpisujesz dane wnioskodawcy czy podopiecznego. Dane opiekuna, pozostałe sekcje i podpisy uzupełnij osobno. Sprawdź właściwość urzędu dla miejsca zamieszkania."));
    const editor = node("form","mail-merge-editor");editor.noValidate = true;
    const search = node("input","satis-private-search");search.id = "mailMergeSearch";search.type = "search";search.autocomplete = "off";search.placeholder = "Wyszukaj osobę w historii…";
    const matches = node("div","mail-merge-matches");matches.id = "mailMergeMatches";matches.setAttribute("role","group");matches.setAttribute("aria-label","Wybierz dane osoby z historii");
    const sections = [
      ["Dane personalne",[["personRole","Dane dotyczą",[["applicant","Wnioskodawcy"],["ward","Podopiecznego / mocodawcy"]]],["firstName","Imię *"],["middleName","Drugie imię"],["surname","Nazwisko *"],["pesel","PESEL *"],["birthDate","Data urodzenia (z PESEL-u)"]]],
      ["Adres zamieszkania",[["postal","Kod pocztowy *"],["city","Miejscowość *"],["street","Ulica"],["house","Nr domu *"],["flat","Nr lokalu"],["municipality","Gmina *"],["county","Powiat *"],["province","Województwo *"],["postOffice","Poczta"],["phone","Telefon *"],["email","E-mail"]]],
      ["Wniosek i orzeczenie",[["applicationNumber","Nr wniosku (jeśli nadany)"],["degree","Stopień niepełnosprawności *",[["","Wybierz…"],["severe","Znaczny"],["moderate","Umiarkowany"],["mild","Lekki"],["none","Nie dotyczy"]]],["certificateNumber","Nr orzeczenia"],["certificateValidity","Ważność orzeczenia",[["","Wybierz…"],["indefinite","Bezterminowo"],["periodic","Do wskazanej daty"]]],["certificateUntil","Ważne do"]]],
      ["Przedmiot wniosku",[["subject","Przedmiot / nazwa produktu *"],["orderNumber","Numer zlecenia / zleceń *"],["cost","Całkowity koszt zakupu (zł) *"],["nfz","Dofinansowanie NFZ (zł) *"],["requested","Wnioskowana kwota dofinansowania (zł) *"]]]
    ];
    editor.append(search,matches);
    for (const [title,items] of sections) {
      const section = node("section","mail-merge-fields"), heading = node("h3","",title);section.append(heading);
      items.forEach(([key,title,options]) => {
        const label = node("label"), input = node(options ? "select" : "input");input.id = `merge${key}`;input.autocomplete = "off";
        if (options) options.forEach(([value,text]) => {const option = node("option","",text);option.value = value;input.append(option);});
        else input.type = key === "phone" ? "tel" : key === "email" ? "email" : "text";
        if (key === "pesel") {input.inputMode = "numeric";input.maxLength = 11;}
        if (["cost","nfz","requested"].includes(key)) input.inputMode = "decimal";
        if (["certificateUntil"].includes(key)) {input.setAttribute("data-date-picker","");a.bindDate(input);}
        if (key === "birthDate") input.readOnly = true;
        fields.set(key,input);label.append(node("span","",title),input);section.append(label);
      });editor.append(section);
      if (title === "Adres zamieszkania") {const choices = node("div","mail-merge-matches");choices.id = "mailMergeGeoChoices";editor.append(choices);}
    }
    const same = node("input");same.type = "checkbox";same.id = "mergeSameAddress";fields.set("sameAddress",same);
    const sameLabel = node("label","mail-merge-check");sameLabel.append(same,node("span","","Adres korespondencyjny taki sam jak adres zamieszkania"));
    const own = node("p","document-form-note","Udział własny po dofinansowaniu: "), ownValue = node("strong");ownValue.id = "mailMergeOwn";own.append(ownValue);
    const status = node("p","mail-merge-message");status.id = "mailMergeMessage";status.setAttribute("role","status");status.setAttribute("aria-live","polite");
    const actions = node("div","mail-merge-actions");actions.append(button("Dodaj / aktualizuj w kolejce",saveDraft),button("Wyczyść formularz",() => {if (!dirty || a.confirm("Wyczyścić niezapisane pola formularza?")) reset();}));
    editor.append(sameLabel,own,status,actions);
    const batch = node("section","mail-merge-batch"), count = node("p","document-form-note");count.id = "mailMergeCount";
    const table = node("table","mail-merge-table"), thead = node("thead"), row = node("tr");
    ["Wybierz","Osoba","Miejscowość","Nr wniosku","Przedmiot","Akcje"].forEach(text => row.append(node("th","",text)));thead.append(row);
    const body = node("tbody");body.id = "mailMergeQueue";table.append(thead,body);
    const batchActions = node("div","mail-merge-actions");batchActions.append(button("Drukuj / PDF · wybrane",print),button("Wyczyść kolejkę",() => {if (a.confirm("Usunąć wszystkie osoby z bieżącej kolejki?")) {queue = [];reset();renderQueue();}}));
    batch.append(node("h3","","Kolejka wydruku"),count,table,batchActions,node("p","document-form-note","Dane pozostają tylko w pamięci tej sesji. Nie są zapisywane w bazie, pamięci przeglądarki ani wysyłane do usług adresowych. Zamknięcie lub odświeżenie strony usuwa kolejkę."));
    host.replaceChildren(header,editor,batch);reset();renderQueue();
    editor.addEventListener("submit",event => {event.preventDefault();if (authorized()) saveDraft();});
    editor.addEventListener("input",() => {if (!authorized()) return;dirty = true;updateBirth();updateAmounts();});
    editor.addEventListener("change",() => {if (authorized()) {dirty = true;updateAmounts();}});
    fields.get("city").addEventListener("input",() => {
      generation++;
      for (const key of ["municipality","county","province"]) fields.get(key).value = "";
      q("mailMergeGeoChoices").replaceChildren();
    });
    for (const key of ["firstName","middleName","surname","street","city"]) fields.get(key).addEventListener("blur",() => {
      fields.get(key).value = key === "city" ? a.city(fields.get(key).value) : a.name(fields.get(key).value);if (key === "city") void resolveGeo();
    });
    fields.get("phone").addEventListener("blur",() => {fields.get("phone").value = a.phone(fields.get("phone").value);});
    fields.get("postal").addEventListener("blur",() => {
      fields.get("postal").value = a.postal(fields.get("postal").value);
      const city = a.cityForPostal(fields.get("postal").value);
      if (city && normalize(city) !== normalize(fields.get("city").value)) {
        fields.get("city").value = city;
        for (const key of ["municipality","county","province"]) fields.get(key).value = "";
      }
      void resolveGeo();
    });
    search.addEventListener("input",() => {
      matches.replaceChildren();if (!authorized() || search.value.trim().length < 2) return;
      a.contacts(search.value).slice(0,8).forEach(entry => matches.append(button([entry.customer,entry.phone,entry.address,entry.document ? `Dokument: •••• ${entry.document.slice(-4)}` : ""].filter(Boolean).join(" · "),() => {
        if (dirty && !a.confirm("Wczytać inną osobę i wyczyścić niezapisane dane formularza?")) return;
        reset();search.value = entry.customer;
        const names = splitName(entry.customer), parts = a.address(entry.address || "");
        for (const [key,value] of Object.entries({...names,phone:entry.phone || "",city:parts.city || "",postal:parts.postalCode || ""})) fields.get(key).value = value;
        const street = String(parts.street || "").replace(/^(?:ul\.|al\.)\s*/iu,"");
        const parsed = street.match(/^(.*?)\s+(\d+[\p{L}]?)(?:\/(\d+[\p{L}]?))?$/u);
        fields.get("street").value = parsed?.[1] || street;fields.get("house").value = parsed?.[2] || "";fields.get("flat").value = parsed?.[3] || "";
        fields.get("pesel").value = a.validPesel(entry.document) ? entry.document : "";
        matches.replaceChildren();updateBirth();dirty = true;void resolveGeo();message("Sprawdź podział imienia, drugiego imienia i nazwiska oraz dane osoby. Nie połączono wpisów automatycznie.");
      })));
    });
    const beforeUnload = event => {if (authorized() && (dirty || queue.length)) {event.preventDefault();event.returnValue = "";}};
    a.window.addEventListener("beforeunload",beforeUnload);
    return {open() {if (!authorized()) {this.clear();return false;}return true;},
      clear() {generation++;pendingPrint?.remove();pendingPrint = null;cleanupPrint?.();queue = [];editingId = "";reset();renderQueue();host.hidden = true;},
      queue: () => authorized() ? queue.map(item => ({...item,data:{...item.data}})) : []};
  }
  return {PAGE,normalize,parseMoney,amounts,splitName,geographyIndex,geographyMatches,validate,placements,fitText,create};
});
