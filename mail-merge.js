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
  function draftValidate(data, validPesel) {
    const errors = [];
    for (const key of ["firstName", "surname"]) if (!String(data[key] || "").trim()) errors.push({field:key,text:"Wpisz imię i nazwisko osoby."});
    if (data.pesel && !validPesel(data.pesel)) errors.push({field:"pesel",text:"Sprawdź PESEL: 11 cyfr i prawidłowa suma kontrolna."});
    if (data.postal && !/^\d{2}-\d{3}$/u.test(data.postal)) errors.push({field:"postal",text:"Kod pocztowy: 00-000."});
    if (data.phone && !/^(?:(?:48|0048))?\d{9}$/u.test(data.phone.replace(/\D/gu,""))) errors.push({field:"phone",text:"Wpisz prawidłowy numer telefonu."});
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(data.email)) errors.push({field:"email",text:"Sprawdź adres e-mail."});
    for (const key of ["cost","nfz","requested"]) if (data[key] && parseMoney(data[key]) === null) errors.push({field:key,text:"Sprawdź kwotę: użyj cyfr i maksymalnie dwóch miejsc po przecinku."});
    if (amounts(data).own < 0) errors.push({field:"requested",text:"Suma dofinansowań przekracza koszt zakupu."});
    return errors;
  }
  function create(a) {
    const document = a.document, host = document.getElementById("mailMergeNotebook"), fields = new Map();
    let geoPromise = null, rows = [], total = 0, offset = 0, editingId = "", editingRevision = null, newId = "";
    let dirty = false, busy = false, ready = false, printBusy = false, cleanupPrint = null, pendingPrint = null;
    let generation = 0, session = 0, readSequence = 0, geoSequence = 0, previewTimer, searchTimer, writeRequest = null;
    const q = id => document.getElementById(id), authorized = () => a.owner() && Boolean(a.user());
    const node = (tag, cls, text) => {const value=document.createElement(tag);if(cls)value.className=cls;if(text!==undefined)value.textContent=text;return value;};
    const button = (text, action, cls="reset-filters-btn") => {
      const value=node("button",cls,text);value.type="button";
      value.addEventListener("click",()=>{if(authorized() && !busy) return action();});return value;
    };
    const message = text => {q("mailMergeMessage").textContent=text;};
    function lock(value) {
      busy=value;host.setAttribute("aria-busy",String(value));
      fields.forEach(input=>{input.disabled=value;});
      for(const control of host.querySelectorAll("button"))control.disabled=value;
      if(!value){q("mailMergePrevious").disabled=offset===0;q("mailMergeNext").disabled=offset+rows.length>=total;}
    }
    async function rpc(name,args={}) {
      if(!authorized())throw new Error("Zaloguj się na konto SATIS.");
      const account=a.user(), epoch=session, result=await a.rpc(name,args);
      if(!authorized() || account!==a.user() || epoch!==session)throw new Error("Sesja została zakończona.");
      if(result.error){
        const code=result.error.code;
        if(["PGRST202","PGRST205","42P01","42883"].includes(code)){ready=false;throw new Error("Baza korespondencji nie jest jeszcze uruchomiona. W SQL Editor Supabase uruchom plik supabase-mail-merge.sql, a następnie kliknij Odśwież listę.");}
        throw new Error(code==="PT409"?"Dane zmieniły się na innym komputerze. Wczytaj osobę ponownie przed zapisem."
          :["PT423","23505"].includes(code)?"Osoba z tym numerem PESEL już istnieje. Wyszukaj i otwórz jej wpis."
          :code==="42501"?"Baza nie przyznała dostępu kontu SATIS. Sprawdź uprawnienia."
          :code==="22023"?"Sprawdź dane osoby, PESEL i format wpisanych kwot."
          :"Baza nie potwierdziła operacji. Dane formularza pozostają bez zmian. Spróbuj ponownie.");
      }
      return result.data;
    }
    function enrich(data) {
      return {...data,birthDate:a.validPesel(data.pesel)?a.birthDate(data.pesel):"",
        role:data.firstName && data.personRole!=="ward"?"we własnym imieniu":"",
        gender:a.validPesel(data.pesel)?Number(data.pesel[9])%2?"male":"female":""};
    }
    function read() {
      const data=Object.fromEntries(personal.map(key=>[key,fields.get(key).value.trim()]));
      data.sameAddress=fields.get("sameAddress").checked;
      if(a.iso(data.certificateUntil))data.certificateUntil=a.date(a.iso(data.certificateUntil));
      return enrich(data);
    }
    function updateBirth() {
      const input=fields.get("pesel");input.value=input.value.replace(/\D/gu,"").slice(0,11);
      fields.get("birthDate").value=a.validPesel(input.value)?a.birthDate(input.value):"";
    }
    function updateAmounts() {const own=amounts(read()).own;q("mailMergeOwn").textContent=own===null?"—":`${money(own)} zł`;}
    function issues(data, full=false) {
      const errors=full?[...draftValidate(data,a.validPesel),...validate(data,a.validPesel)]:draftValidate(data,a.validPesel);
      if(data.pesel && a.validPesel(data.pesel) && a.age(data.pesel)<0)errors.push({field:"pesel",text:"Data urodzenia z PESEL-u nie może być w przyszłości."});
      if(data.certificateUntil && !a.iso(data.certificateUntil))errors.push({field:"certificateUntil",text:"Wybierz prawidłową datę ważności orzeczenia."});
      if(full && data.personRole==="applicant" && a.validPesel(data.pesel) && a.age(data.pesel)<18)errors.push({field:"personRole",text:"Dla osoby niepełnoletniej wybierz dane podopiecznego. Dane opiekuna uzupełnij osobno."});
      if(full)for(const item of placements(data))if(!fitText(item.text,item.width,item.height,a.measure))errors.push({field:item.field,text:"Tekst nie mieści się w polu oryginalnego wniosku. Skróć go przed wydrukiem."});
      return errors;
    }
    function markIssues(errors) {
      fields.forEach((input,key)=>{const error=errors.find(item=>item.field===key);input.setCustomValidity(error?.text||"");input.setAttribute("aria-invalid",String(Boolean(error)));});
      if(errors.length){message([...new Set(errors.map(item=>item.text))].join("\n"));fields.get(errors[0].field)?.focus();fields.get(errors[0].field)?.reportValidity();}
    }
    function dirtyState(value=true) {
      dirty=value;q("mailMergeSave").classList.toggle("mail-merge-unsaved",value);
      q("mailMergeSave").textContent=value?"Zapisz zmiany":"Zapisz";
      q("mailMergeEditorTitle").textContent=editingId?"Dane osoby · edycja":"Nowa osoba";
    }
    function pages(data, preview=false) {
      const fragment=document.createDocumentFragment(),marks=placements(data);let oversized=false;
      for(let page=1;page<=7;page++){
        const sheet=node("article","mail-merge-page"),background=node("img","mail-merge-template");
        background.src=`mail-merge/page-${page}.svg`;background.alt=`Wniosek PCPR Żywiec · strona ${page} z 7`;
        if(preview)background.loading="lazy";sheet.append(background);
        for(const item of marks.filter(item=>item.page===page)){
          const fit=fitText(item.text,item.width,item.height,a.measure);
          if(!fit){if(!preview)throw new Error("Tekst nie mieści się w oryginalnym polu wniosku.");oversized=true;continue;}
          const value=node("span","mail-merge-value",fit.text);
          Object.assign(value.style,{left:`${item.x/PAGE.width*100}%`,top:`${item.y/PAGE.height*100}%`,width:`${item.width/PAGE.width*100}%`,fontSize:`${fit.size/PAGE.width*100}cqw`});
          if(item.field==="applicationNumber")value.classList.add("mail-merge-number");sheet.append(value);
        }fragment.append(sheet);
      }
      if(preview)q("mailMergePreviewNotice").textContent=oversized?"Część tekstu jest za długa do oryginalnych pól. Skróć ją przed wydrukiem; zbyt długi tekst nie jest pokazywany w podglądzie.":"";
      return fragment;
    }
    function renderPreview() {
      clearTimeout(previewTimer);if(!authorized())return;
      q("mailMergePreviewPages").replaceChildren(pages(read(),true));
      q("mailMergePreviewTitle").textContent=read().firstName?`Wniosek · ${read().firstName} ${read().surname}`:"Wniosek · pusty wzór";
    }
    function changed() {if(!authorized() || busy)return;dirtyState();updateBirth();updateAmounts();clearTimeout(previewTimer);previewTimer=setTimeout(renderPreview,180);}
    function reset() {
      generation++;geoSequence++;editingId="";editingRevision=null;newId="";writeRequest=null;
      fields.forEach(input=>{input.value="";if(input.type==="checkbox")input.checked=false;input.setCustomValidity("");input.removeAttribute("aria-invalid");});
      fields.get("personRole").value="applicant";
      q("mailMergeMatches").replaceChildren();q("mailMergeGeoChoices").replaceChildren();q("mailMergeSearch").value="";
      dirtyState(false);message("");updateAmounts();renderPreview();
    }
    function load(entry) {
      reset();editingId=entry.id;editingRevision=entry.revision;
      personal.forEach(key=>{fields.get(key).value=entry.data[key]||"";});fields.get("personRole").value||="applicant";
      fields.get("sameAddress").checked=Boolean(entry.data.sameAddress);updateBirth();updateAmounts();dirtyState(false);renderPreview();
    }
    async function resolveGeo() {
      if(!authorized())return;const city=fields.get("city").value.trim();if(!city)return;
      const sequence=++geoSequence,epoch=session;
      if(!geoPromise)geoPromise=a.loadGeography().then(geographyIndex).catch(()=>{geoPromise=null;throw new Error("Słownik GUS jest niedostępny. Uzupełnij region ręcznie.");});
      let geo;try{geo=await geoPromise;}catch(error){if(authorized()&&epoch===session&&sequence===geoSequence)message(error.message);return;}
      if(!authorized()||busy||epoch!==session||sequence!==geoSequence||city!==fields.get("city").value.trim())return;
      const matches=geographyMatches(geo,city),list=q("mailMergeGeoChoices");list.replaceChildren();
      const apply=item=>{for(const key of ["city","municipality","county","province"])fields.get(key).value=item[key];fields.get("postOffice").value||=item.city;list.replaceChildren();changed();};
      if(matches.length===1)apply(matches[0]);
      else if(matches.length){
        for(const key of ["municipality","county","province"])fields.get(key).value="";
        matches.slice(0,30).forEach(item=>list.append(button(`${item.city} · ${item.municipality} · ${item.county} · ${item.province}`,()=>apply(item))));
        message("Wybierz właściwą gminę i powiat — nazwa miejscowości nie jest jednoznaczna.");
      }else message("Brak dopasowania w słowniku. Uzupełnij gminę, powiat i województwo ręcznie.");
    }
    function renderRows() {
      const list=q("mailMergeQueue");list.replaceChildren();
      for(const entry of rows){
        const row=node("tr");if(entry.id===editingId)row.className="mail-merge-selected";
        const cell=node("td"),check=node("input");check.type="checkbox";check.checked=entry.selected;check.disabled=busy;
        check.setAttribute("aria-label",`Wydrukuj: ${entry.data.firstName} ${entry.data.surname}`);
        check.addEventListener("change",()=>{if(authorized()&&!busy){entry.selected=check.checked;renderCount();}});cell.append(check);row.append(cell);
        const name=node("td"),label=node("strong","",`${entry.data.firstName} ${entry.data.middleName||""} ${entry.data.surname}`.replace(/\s+/gu," "));
        name.append(label);if(entry.pesel_tail)name.append(node("small","mail-merge-pesel",`PESEL: •••••••${entry.pesel_tail}`));row.append(name);
        const degrees={severe:"Znaczny",moderate:"Umiarkowany",mild:"Lekki",none:"Nie dotyczy"};
        for(const text of [entry.data.phone||"—",entry.data.city||"—",degrees[entry.data.degree]||"—",entry.data.applicationNumber||"—",entry.data.subject||"—"])row.append(node("td","",text));
        const actions=node("td","mail-merge-actions");actions.append(button("Edytuj",()=>openEntry(entry)),button("Usuń",()=>deleteEntry(entry),"ghost mail-merge-delete"));row.append(actions);list.append(row);
      }
      q("mailMergeEmpty").hidden=rows.length>0;renderCount();
      q("mailMergePrevious").disabled=busy||offset===0;q("mailMergeNext").disabled=busy||offset+rows.length>=total;
    }
    function renderCount(){q("mailMergeCount").textContent=`${total} osób · ${rows.filter(entry=>entry.selected).length} wybranych do wydruku${total>50?` · pozycje ${offset+1}–${offset+rows.length}`:""}`;}
    async function refresh() {
      if(!authorized())return;const sequence=++readSequence,epoch=session;
      try{
        const result=await rpc("satis_mail_merge_list",{p_query:q("mailMergeListSearch").value.trim(),p_offset:offset});
        if(sequence!==readSequence||epoch!==session)return;
        ready=true;const selected=new Set(rows.filter(row=>row.selected).map(row=>row.id));
        rows=result.rows.map(row=>({...row,selected:selected.has(row.id)}));total=Number(result.total);renderRows();
        q("mailMergeDatabaseStatus").textContent="Zapis w bazie · dostęp tylko dla SATIS";
      }catch(error){if(authorized()&&sequence===readSequence){q("mailMergeDatabaseStatus").textContent=error.message;}}
    }
    async function openEntry(entry) {
      if(dirty&&!a.confirm("Porzucić niezapisane zmiany i otworzyć wybraną osobę?"))return;
      lock(true);const epoch=session;
      try{const result=await rpc("satis_mail_merge_detail",{p_id:entry.id});load(result);renderRows();fields.get("firstName").focus();}
      catch(error){if(authorized()&&epoch===session)message(error.message);}finally{if(authorized()&&epoch===session)lock(false);}
    }
    async function write(action,id,revision,data) {
      const fingerprint=JSON.stringify({action,id,revision,data});
      if(writeRequest?.fingerprint!==fingerprint)writeRequest={fingerprint,id:a.id()};
      return rpc("satis_mail_merge_write",{p_request_id:writeRequest.id,p_action:action,p_id:id,p_expected_revision:revision,p_data:data});
    }
    async function saveDraft() {
      updateBirth();const data=read(),errors=issues(data);markIssues(errors);if(errors.length)return;
      lock(true);const epoch=session,wasEditing=Boolean(editingId);
      try{
        newId||=a.id();const stored={...data};delete stored.birthDate;delete stored.gender;delete stored.role;
        const result=await write("SAVE",editingId||newId,editingRevision,stored);
        editingId=result.id;editingRevision=result.revision;writeRequest=null;newId="";dirtyState(false);
        offset=0;q("mailMergeListSearch").value="";await refresh();
        if(authorized()&&epoch===session)message(wasEditing?"Zmiany zapisane w bazie.":"Osoba zapisana w bazie. Pozostałe dane wniosku możesz uzupełnić później.");
      }catch(error){if(authorized()&&epoch===session)message(error.message);}finally{if(authorized()&&epoch===session)lock(false);}
    }
    async function deleteEntry(entry) {
      if(dirty && editingId===entry.id){message("Najpierw zapisz zmiany lub wybierz Nowa osoba, aby odrzucić edycję.");return;}
      if(!a.confirm("Trwale usunąć dane tej osoby z bazy korespondencji?"))return;
      lock(true);const epoch=session;
      try{await write("DELETE",entry.id,entry.revision,{});writeRequest=null;if(editingId===entry.id)reset();offset=0;await refresh();if(authorized())message("Osoba usunięta z bazy.");}
      catch(error){if(authorized()&&epoch===session)message(error.message);}finally{if(authorized()&&epoch===session)lock(false);}
    }
    async function print(mode="selected") {
      if(!authorized()||busy||printBusy||cleanupPrint)return;
      const epoch=session,account=a.user();printBusy=true;
      try{
        let documents=[];
        if(mode==="blank")documents=[{}];
        else if(mode==="current"){
          updateBirth();const data=read(),errors=issues(data,true);markIssues(errors);if(errors.length)return;documents=[data];
        }else{
          const selected=rows.filter(row=>row.selected);
          if(!selected.length){message("Zaznacz osoby w tabeli albo wybierz Drukuj wniosek pod formularzem.");return;}
          if(selected.length>25){message("Jednorazowo wybierz maksymalnie 25 osób do wydruku.");return;}
          if(dirty&&!a.confirm("Wydrukować zapisane dane z tabeli? Niezapisane zmiany w formularzu nie zostaną uwzględnione."))return;
          for(const entry of selected){
            const saved=await rpc("satis_mail_merge_detail",{p_id:entry.id}),data=enrich(saved.data),errors=issues(data,true);
            if(errors.length){message(`${data.firstName} ${data.surname}: ${[...new Set(errors.map(error=>error.text))].join(" ")}`);return;}documents.push(data);
          }
        }
        await document.fonts?.ready;if(!authorized()||epoch!==session||account!==a.user())return;
        const output=node("section");output.id="mailMergePrint";pendingPrint=output;
        documents.forEach(data=>output.append(pages(data)));document.body.append(output);
        try{await Promise.all([...output.querySelectorAll("img")].map(img=>img.decode()));}catch{throw new Error("Nie udało się wczytać wszystkich stron wzoru. Wydruk został wstrzymany.");}
        if(!authorized()||epoch!==session||account!==a.user()){output.remove();pendingPrint=null;return;}
        document.body.classList.add("mail-merge-print");
        const cleanup=()=>{output.remove();pendingPrint=null;document.body.classList.remove("mail-merge-print");a.window.removeEventListener("afterprint",cleanup);cleanupPrint=null;};
        cleanupPrint=cleanup;a.window.addEventListener("afterprint",cleanup,{once:true});await a.print(cleanup);
      }catch(error){pendingPrint?.remove();pendingPrint=null;cleanupPrint?.();if(authorized()&&epoch===session)message(error.message||"Nie udało się przygotować wydruku.");}finally{if(epoch===session)printBusy=false;}
    }
    const header=node("header","mail-merge-header");header.append(node("h2","","Korespondencja seryjna"),node("p","document-form-note","Wniosek PCPR Żywiec · 7 stron. Dane opiekuna, pozostałe sekcje i podpisy uzupełnij osobno. Sprawdź właściwość urzędu dla miejsca zamieszkania."));
    const editor=node("form","mail-merge-editor");editor.noValidate=true;
    const toolbar=node("div","mail-merge-editor-toolbar"),editorTitle=node("h3");editorTitle.id="mailMergeEditorTitle";
    toolbar.append(editorTitle,button("Nowa osoba",()=>{if(!dirty||a.confirm("Porzucić niezapisane zmiany?"))reset();}));editor.append(toolbar);
    const search=node("input","satis-private-search");search.id="mailMergeSearch";search.type="search";search.autocomplete="off";search.placeholder="Uzupełnij z historii · imię i nazwisko…";
    const matches=node("div","mail-merge-matches");matches.id="mailMergeMatches";editor.append(search,matches);
    const sections=[
      ["Dane personalne","person",[["firstName","Imię *"],["middleName","Drugie imię"],["surname","Nazwisko *"],["pesel","PESEL"],["birthDate","Data urodzenia z PESEL-u"],["personRole","Dane dotyczą",[["applicant","Wnioskodawcy"],["ward","Podopiecznego / mocodawcy"]]]]],
      ["Adres zamieszkania","address",[["street","Ulica"],["house","Nr domu"],["flat","Nr lokalu"],["postal","Kod pocztowy"],["city","Miejscowość"],["postOffice","Poczta"],["municipality","Gmina"],["county","Powiat"],["province","Województwo"]]],
      ["Kontakt","contact",[["phone","Telefon"],["email","E-mail"]]],
      ["Wniosek i orzeczenie","certificate",[["applicationNumber","Nr wniosku (jeśli nadany)"],["degree","Stopień niepełnosprawności",[["","Wybierz…"],["severe","Znaczny"],["moderate","Umiarkowany"],["mild","Lekki"],["none","Nie dotyczy"]]],["certificateNumber","Nr orzeczenia"],["certificateValidity","Ważność orzeczenia",[["","Wybierz…"],["indefinite","Bezterminowo"],["periodic","Do wskazanej daty"]]],["certificateUntil","Ważne do"]]],
      ["Przedmiot wniosku","subject",[["subject","Przedmiot / nazwa produktu"],["orderNumber","Numer zlecenia / zleceń"]]],
      ["Dofinansowanie","funding",[["cost","Całkowity koszt zakupu (zł)"],["nfz","Dofinansowanie NFZ (zł)"],["requested","Wnioskowana kwota (zł)"]]]
    ];
    for(const [title,group,items]of sections){
      const section=node("fieldset",`mail-merge-fields mail-merge-group-${group}`);section.append(node("legend","",title));
      items.forEach(([key,title,options])=>{
        const label=node("label"),input=node(options?"select":"input");input.id=`merge${key}`;input.autocomplete="off";input.maxLength=key==="subject"||key==="orderNumber"?1000:key==="firstName"?100:key==="surname"?160:240;
        if(options)options.forEach(([value,text])=>{const option=node("option","",text);option.value=value;input.append(option);});
        else input.type=key==="phone"?"tel":key==="email"?"email":"text";
        if(key==="pesel"){input.inputMode="numeric";input.maxLength=11;}
        if(["cost","nfz","requested"].includes(key))input.inputMode="decimal";
        if(key==="certificateUntil"){input.setAttribute("data-date-picker","");a.bindDate(input);}
        if(key==="birthDate")input.readOnly=true;
        fields.set(key,input);label.append(node("span","",title),input);section.append(label);
      });
      if(group==="address"){const choices=node("div","mail-merge-matches mail-merge-full");choices.id="mailMergeGeoChoices";section.append(choices);}
      editor.append(section);
    }
    const same=node("input");same.type="checkbox";same.id="mergeSameAddress";fields.set("sameAddress",same);
    const sameLabel=node("label","mail-merge-check");sameLabel.append(same,node("span","","Adres korespondencyjny taki sam jak adres zamieszkania"));
    const own=node("p","document-form-note","Udział własny po dofinansowaniu: "),ownValue=node("strong");ownValue.id="mailMergeOwn";own.append(ownValue);
    const status=node("p","mail-merge-message");status.id="mailMergeMessage";status.setAttribute("role","status");status.setAttribute("aria-live","polite");
    const save=button("Zapisz",saveDraft,"mail-merge-save" );save.id="mailMergeSave";
    const actions=node("div","mail-merge-actions mail-merge-main-actions");actions.append(save,button("Drukuj wniosek / PDF",()=>print("current")),button("Drukuj pusty wzór",()=>print("blank")));
    editor.append(sameLabel,own,node("p","document-form-note","Do zapisu osoby wystarczą imię i nazwisko. Kompletność wniosku jest sprawdzana przed wydrukiem."),status,actions);
    const database=node("section","mail-merge-batch"),tools=node("div","mail-merge-list-tools"),listSearch=node("input");listSearch.id="mailMergeListSearch";listSearch.type="search";listSearch.autocomplete="off";listSearch.maxLength=160;listSearch.placeholder="Szukaj w bazie · osoba, telefon, PESEL, nr wniosku, przedmiot…";
    tools.append(listSearch,button("Odśwież listę",()=>refresh()),button("Drukuj wybrane / PDF",()=>print()));
    const databaseStatus=node("p","document-form-note");databaseStatus.id="mailMergeDatabaseStatus";databaseStatus.setAttribute("role","status");
    const count=node("p","document-form-note");count.id="mailMergeCount";
    const table=node("table","mail-merge-table"),thead=node("thead"),row=node("tr");
    ["Wybierz","Osoba","Telefon","Miejscowość","Stopień","Nr wniosku","Przedmiot","Akcje"].forEach(text=>row.append(node("th","",text)));thead.append(row);
    const body=node("tbody");body.id="mailMergeQueue";table.append(thead,body);const scroll=node("div","mail-merge-table-scroll");scroll.append(table);
    const empty=node("p","document-form-note","Brak zapisanych osób dla wybranego wyszukiwania.");empty.id="mailMergeEmpty";
    const paging=node("div","mail-merge-actions"),previous=button("Poprzednie",()=>{offset=Math.max(0,offset-50);return refresh();}),next=button("Następne",()=>{offset+=50;return refresh();});previous.id="mailMergePrevious";next.id="mailMergeNext";paging.append(previous,next);
    database.append(node("h3","","Baza osób"),tools,databaseStatus,count,scroll,empty,paging);
    const preview=node("section","mail-merge-preview"),previewTitle=node("h3");previewTitle.id="mailMergePreviewTitle";
    const previewNotice=node("p","mail-merge-message");previewNotice.id="mailMergePreviewNotice";
    const previewPages=node("div","mail-merge-preview-pages");previewPages.id="mailMergePreviewPages";preview.append(previewTitle,previewNotice,previewPages);
    host.replaceChildren(header,editor,database,preview);reset();renderRows();
    editor.addEventListener("submit",event=>{event.preventDefault();if(authorized()&&!busy)void saveDraft();});
    editor.addEventListener("input",changed);editor.addEventListener("change",changed);
    fields.get("city").addEventListener("input",()=>{geoSequence++;for(const key of ["municipality","county","province"])fields.get(key).value="";q("mailMergeGeoChoices").replaceChildren();});
    for(const key of ["firstName","middleName","surname","street","city"])fields.get(key).addEventListener("blur",()=>{
      fields.get(key).value=key==="city"?a.city(fields.get(key).value):a.name(fields.get(key).value);if(key==="city")void resolveGeo();renderPreview();
    });
    fields.get("phone").addEventListener("blur",()=>{fields.get("phone").value=a.phone(fields.get("phone").value);renderPreview();});
    fields.get("postal").addEventListener("blur",()=>{
      fields.get("postal").value=a.postal(fields.get("postal").value);const city=a.cityForPostal(fields.get("postal").value);
      if(city&&normalize(city)!==normalize(fields.get("city").value)){fields.get("city").value=city;for(const key of ["municipality","county","province"])fields.get(key).value="";}
      void resolveGeo();renderPreview();
    });
    search.addEventListener("input",()=>{
      matches.replaceChildren();if(!authorized()||busy||search.value.trim().length<2)return;
      a.contacts(search.value).slice(0,8).forEach(entry=>matches.append(button([entry.customer,entry.phone,entry.address,entry.document?`Dokument: •••• ${entry.document.slice(-4)}`:""].filter(Boolean).join(" · "),()=>{
        if(dirty&&!a.confirm("Wczytać osobę z historii i odrzucić niezapisane dane?"))return;
        reset();search.value=entry.customer;const parts=a.address(entry.address||"");
        for(const [key,value]of Object.entries({...splitName(entry.customer),phone:entry.phone||"",city:parts.city||"",postal:parts.postalCode||""}))fields.get(key).value=value;
        const street=String(parts.street||"").replace(/^(?:ul\.|al\.)\s*/iu,""),parsed=street.match(/^(.*?)\s+(\d+[\p{L}]?)(?:\/(\d+[\p{L}]?))?$/u);
        fields.get("street").value=parsed?.[1]||street;fields.get("house").value=parsed?.[2]||"";fields.get("flat").value=parsed?.[3]||"";
        fields.get("pesel").value=a.validPesel(entry.document)?entry.document:"";changed();void resolveGeo();renderPreview();message("Sprawdź podział imion i nazwiska oraz dane osoby przed zapisem.");
      })));
    });
    listSearch.addEventListener("input",()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{offset=0;void refresh();},250);});
    a.window.addEventListener("beforeunload",event=>{if(authorized()&&dirty){event.preventDefault();event.returnValue="";}});
    document.fonts?.ready.then(()=>{if(authorized())renderPreview();});
    return {open(){if(!authorized()){this.clear();return false;}host.hidden=false;if(!ready)void refresh();renderPreview();return true;},
      clear(){session++;generation++;readSequence++;geoSequence++;clearTimeout(searchTimer);clearTimeout(previewTimer);pendingPrint?.remove();pendingPrint=null;cleanupPrint?.();printBusy=false;rows=[];total=0;offset=0;ready=false;reset();q("mailMergePreviewPages").replaceChildren();q("mailMergeListSearch").value="";q("mailMergeDatabaseStatus").textContent="";renderRows();lock(false);host.hidden=true;},
      queue:()=>authorized()?rows.map(row=>({...row,data:{...row.data}})):[]};
  }
  return {PAGE,normalize,parseMoney,amounts,splitName,geographyIndex,geographyMatches,validate,draftValidate,placements,fitText,create};
});
