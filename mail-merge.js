(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.SatisMailMerge = api;
})(typeof window === "undefined" ? null : window, function () {
  "use strict";
  const PAGE = {width: 595.32, height: 841.92};
  const normalize = value => String(value || "").normalize("NFD").replace(/\p{M}/gu, "").replace(/ł/giu, "l").trim().replace(/\s+/gu, " ").toLowerCase();
  const personal = ["gender", "localityType", "invalidityGroup", "personRole", "firstName", "middleName", "surname", "pesel", "birthDate", "province", "county", "municipality", "city", "street", "house", "flat", "postal", "postOffice", "phone", "email", "applicationNumber", "degree", "certificateNumber", "certificateValidity", "certificateUntil", "subject", "orderNumber", "subject2", "orderNumber2", "itemCount", "cost", "nfz", "requested"];
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
    return {data, names, byId:new Map(data.places.map(place=>[place[2],place]))};
  }
  function geographyMatches(index, city) {
    return (index?.names.get(normalize(city)) || []).map(place => {
      const unit = index.data.units[place[1]];
      return {id: place[2], city: place[0], municipality: unit[0], county: unit[1], province: unit[2], kind: place[3] === "miasto" || ["1","4","8","9"].includes(place[1].slice(-1)) ? "miasto" : ["2","5"].includes(place[1].slice(-1)) ? "wieś" : ""};
    });
  }
  function geographyPostalMatches(index, code){
    const entry=index?.data.postalCodes?.[code];if(!entry)return [];
    return entry.places.flatMap(id=>{
      const place=index.byId.get(id);if(!place)return [];
      return geographyMatches(index,place[0]).filter(match=>match.id===id).map(match=>({...match,postOffice:entry.postOffice}));
    });
  }
  function sharedGeography(matches){
    const shared={};if(!matches.length)return shared;
    for(const key of ["municipality","county","province","kind","postOffice"]){
      const value=matches[0][key];if(value && matches.every(item=>normalize(item[key])===normalize(value)))shared[key]=value;
    }
    return shared;
  }
  function validate(data, validPesel) {
    const errors = [];
    for (const [key, label] of [["firstName", "Imię"], ["middleName", "Drugie imię (lub Brak)"], ["surname", "Nazwisko"], ["birthDate", "Data urodzenia"], ["gender", "Płeć"], ["localityType", "Rodzaj miejscowości"], ["invalidityGroup", "Grupa inwalidzka"], ["street", "Ulica (lub Nie dotyczy)"], ["flat", "Nr lokalu (lub Brak)"], ["postOffice", "Poczta"], ["email", "E-mail (lub Brak)"], ["applicationNumber", "Nr wniosku (lub Nie nadano)"], ["certificateNumber", "Nr orzeczenia"], ["certificateValidity", "Ważność orzeczenia"], ["city", "Miejscowość"], ["house", "Nr domu"], ["province", "Województwo"], ["county", "Powiat"], ["municipality", "Gmina"], ["degree", "Stopień niepełnosprawności"], ["subject", "Przedmiot wniosku"], ["orderNumber", "Numer zlecenia"]]) {
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
    if (!["male","female"].includes(data.gender)) errors.push({field:"gender",text:"Wybierz płeć albo wpisz poprawny PESEL."});
    if (!["city","village"].includes(data.localityType)) errors.push({field:"localityType",text:"Wybierz miasto lub wieś."});
    if (!["I","II","III","none"].includes(data.invalidityGroup)) errors.push({field:"invalidityGroup",text:"Wybierz grupę inwalidzką albo Nie dotyczy."});
    if(applicationItems(data).length===2)for(const [field,label]of [["subject2","Przedmiot 2"],["orderNumber2","Numer zlecenia 2"]])if(!String(data[field]||"").trim())errors.push({field,text:`Uzupełnij: ${label}.`});
    return errors;
  }
  function applicationItems(data){
    const items=[{subject:data.subject||"",orderNumber:data.orderNumber||""}];
    if(data.itemCount==="2" || (!data.itemCount && (data.subject2 || data.orderNumber2)))items.push({subject:data.subject2||"",orderNumber:data.orderNumber2||""});
    return items;
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
      if (["city","village"].includes(data.localityType)) tick(3,"localityType",201.8,data.localityType === "city" ? 181.6 : 195.4);
    } else {
      cell(1, "role", 307.6, 340.7, 203.5, 563);
      cell(1,"firstName",578.8,598.5);cell(1,"middleName",598.5,618.3);cell(1,"surname",618.3,638);
      cell(1,"pesel",638,658.4);cell(1,"birthDate",658.4,677.3);
      cell(1,"province",735.6,755.3);cell(1,"county",755.3,774.9);cell(1,"municipality",774.9,793.8);
      cell(2,"city",59.8,78.1);cell(2,"street",78.1,97.8);cell(2,"house",97.8,117.5);cell(2,"flat",117.5,137.2);
      cell(2,"postal",137.2,156.9);cell(2,"postOffice",156.9,176.7);cell(2,"phone",196.4,216);cell(2,"email",216,235);
      if (["city","village"].includes(data.localityType)) add(2,"localityType",203.5,179.7,359.5,13.7,data.localityType === "city" ? "Miasto" : "Wieś");
      if (data.sameAddress) tick(2,"sameAddress",28.6,259.5);
      if (data.gender) tick(1,"gender",data.gender === "male" ? 201.8 : 282.4,682.2);
    }
    const groupY={I:440.3,II:454.1,III:467.9,none:481.7};
    if (groupY[data.invalidityGroup]) tick(3,"invalidityGroup",201.8,groupY[data.invalidityGroup]);
    const degreeY = {severe: 312.9, moderate: 326.7, mild: 340.5, none: 354.3};
    if (degreeY[data.degree]) tick(3,"degree",201.8,degreeY[data.degree]);
    if (data.certificateValidity === "indefinite") tick(3,"certificateValidity",201.8,373.6);
    if (data.certificateValidity === "periodic") {tick(3,"certificateValidity",201.8,387.4);add(3,"certificateUntil",352,387,185,13);}
    cell(3,"certificateNumber",415.8,435.3,203.5,563);
    const certificate=result.find(item=>item.field==="certificateNumber");if(certificate)certificate.text=certificate.text.toLocaleUpperCase("pl-PL");
    const items=applicationItems(data);
    if(items.length===1){cell(5,"subject",224.6,244.2,185,563);cell(5,"orderNumber",244.2,264,185,563);}
    else{
      add(5,"subject",185,225.0,378,19.2,items.map((item,index)=>`${index+1}. ${item.subject}`).join("\n"));
      add(5,"orderNumber",185,244.5,378,19.2,items.map((item,index)=>`${index+1}. ${item.orderNumber}`).join("\n"));
    }
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
    for (const key of ["firstName","surname"]) if (data[key] && !/[\p{L}]/u.test(data[key])) errors.push({field:key,text:"Wpisz poprawne imię i nazwisko."});
    if (data.gender && !["male","female"].includes(data.gender)) errors.push({field:"gender",text:"Sprawdź oznaczenie płci."});
    if (data.localityType && !["city","village"].includes(data.localityType)) errors.push({field:"localityType",text:"Sprawdź rodzaj miejscowości."});
    if (data.invalidityGroup && !["I","II","III","none"].includes(data.invalidityGroup)) errors.push({field:"invalidityGroup",text:"Sprawdź grupę inwalidzką."});
    if (data.pesel && !validPesel(data.pesel)) errors.push({field:"pesel",text:"Sprawdź PESEL: 11 cyfr i prawidłowa suma kontrolna."});
    if (data.postal && !/^\d{2}-\d{3}$/u.test(data.postal)) errors.push({field:"postal",text:"Kod pocztowy: 00-000."});
    if (data.phone && !/^(?:(?:48|0048))?\d{9}$/u.test(data.phone.replace(/\D/gu,""))) errors.push({field:"phone",text:"Wpisz prawidłowy numer telefonu."});
    if (data.email && data.email !== "-" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(data.email)) errors.push({field:"email",text:"Sprawdź adres e-mail."});
    if(data.itemCount && !["1","2"].includes(data.itemCount))errors.push({field:"itemCount",text:"Wybierz jeden lub dwa przedmioty."});
    for (const key of ["cost","nfz","requested"]) if (data[key] && parseMoney(data[key]) === null) errors.push({field:key,text:"Sprawdź kwotę: użyj cyfr i maksymalnie dwóch miejsc po przecinku."});
    if (amounts(data).own < 0) errors.push({field:"requested",text:"Suma dofinansowań przekracza koszt zakupu."});
    return errors;
  }
  function create(a) {
    const document = a.document, host = document.getElementById("mailMergeNotebook"), fields = new Map(), labels = new Map();
    let geoPromise = null, geoIndex = null, postalSequence = 0, deferredPostal = false, rows = [], total = 0, offset = 0, editingId = "", editingRevision = null, newId = "";
    let dirty = false, busy = false, ready = false, printBusy = false, cleanupPrint = null, pendingPrint = null;
    let generation = 0, session = 0, readSequence = 0, geoSequence = 0, previewTimer, searchTimer, writeRequest = null;
    let autoCity="", autoPostal="", autoPostOffice="", autoGender="", printPages=7, schemaVersion=0;
    let periodicDate="", activeTemplate=null, candidateTemplate=null, templateImportController=null;
    const addressHistory=new Map();
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
      updateConditionalFields();updateTemplateControls();updatePrintMode();
      if(!value && deferredPostal){deferredPostal=false;void syncCityFromPostal();}
    }
    async function rpc(name,args={}) {
      if(!authorized())throw new Error("Zaloguj się na konto SATIS.");
      const account=a.user(), epoch=session, result=await a.rpc(name,args);
      if(!authorized() || account!==a.user() || epoch!==session)throw new Error("Sesja została zakończona.");
      if(result.error){
        const code=result.error.code;
        if(["PGRST202","PGRST205","42P01","42883"].includes(code)){ready=false;throw new Error("Baza PCPR Żywiec nie jest jeszcze uruchomiona. W SQL Editor Supabase uruchom plik supabase-mail-merge.sql, a następnie kliknij Odśwież listę.");}
        throw new Error(code==="PT409"?"Dane zmieniły się na innym komputerze. Wczytaj osobę ponownie przed zapisem."
          :["PT423","23505"].includes(code)?"Osoba z tym numerem PESEL już istnieje. Wyszukaj i otwórz jej wpis."
          :code==="42501"?"Baza nie przyznała dostępu kontu SATIS. Sprawdź uprawnienia."
          :code==="22023"?"Sprawdź dane osoby, PESEL i format wpisanych kwot."
          :"Baza nie potwierdziła operacji. Dane formularza pozostają bez zmian. Spróbuj ponownie.");
      }
      return result.data;
    }
    function enrich(data) {
      return {...data,itemCount:data.itemCount||((data.subject2||data.orderNumber2)?"2":"1"),certificateNumber:String(data.certificateNumber||"").toLocaleUpperCase("pl-PL"),certificateUntil:data.certificateValidity==="indefinite"?"":data.certificateUntil||"",birthDate:a.validPesel(data.pesel)?a.birthDate(data.pesel):"",
        role:data.firstName && data.personRole!=="ward"?"we własnym imieniu":"",
        gender:a.validPesel(data.pesel)?Number(data.pesel[9])%2?"male":"female":data.gender||""};
    }
    function read() {
      const data=Object.fromEntries(personal.map(key=>[key,fields.get(key).value.trim()]));
      data.sameAddress=fields.get("sameAddress").checked;
      if(a.iso(data.certificateUntil))data.certificateUntil=a.date(a.iso(data.certificateUntil));
      if(data.itemCount!=="2"){data.subject2="";data.orderNumber2="";}
      return enrich(data);
    }
    function updateConditionalFields(restore=false){
      const indefinite=fields.get("certificateValidity").value==="indefinite",until=fields.get("certificateUntil"),second=fields.get("itemCount").value==="2";
      if(indefinite){if(until.value)periodicDate=until.value;until.value="";until.setCustomValidity("");until.removeAttribute("aria-invalid");}
      else if(restore&&!until.value&&periodicDate)until.value=periodicDate;
      until.disabled=busy||indefinite;until.placeholder=indefinite?"Nie dotyczy":"";
      labels.get("certificateUntil").classList.toggle("mail-merge-muted",indefinite);
      for(const key of ["subject2","orderNumber2"]){labels.get(key).hidden=!second;fields.get(key).disabled=busy||!second;}
      q("mailMergeFundingNote").textContent=second?"Kwoty poniżej dotyczą łącznie obu przedmiotów.":"Kwoty poniżej dotyczą jednego przedmiotu.";
    }
    function normalizeFields() {
      let updated=false;
      const put=(key,value)=>{if(fields.get(key).value!==value){fields.get(key).value=value;updated=true;}};
      for(const key of ["firstName","middleName","surname","municipality","postOffice"])put(key,a.name(fields.get(key).value));
      for(const key of ["county","province"]){
        const value=fields.get(key).value.trim(),bracket=value.indexOf("(");
        put(key,bracket<0?a.name(value):`${a.name(value.slice(0,bracket))} ${value.slice(bracket)}`);
      }
      put("city",a.city(fields.get("city").value));
      put("street",fields.get("street").value.trim() === "-" ? "-" : a.street?a.street(fields.get("street").value):a.name(fields.get("street").value));
      for(const key of ["house","flat"])put(key,fields.get(key).value.trim().toLocaleUpperCase("pl-PL"));
      put("certificateNumber",fields.get("certificateNumber").value.toLocaleUpperCase("pl-PL"));
      if(fields.get("certificateValidity").value==="indefinite")put("certificateUntil","");
      put("postal",a.postal(fields.get("postal").value));put("phone",a.phone(fields.get("phone").value));
      return updated;
    }
    function rememberAddress(data) {
      if(/^\d{2}-\d{3}$/u.test(data.postal||"") && data.city){
        const entry={postalCode:data.postal,city:data.city,street:data.street||""};
        addressHistory.set(JSON.stringify(entry),entry);
      }
    }
    function addressEntries(){
      const reference=Object.keys(geoIndex?.data.postalCodes||{}).flatMap(code=>geographyPostalMatches(geoIndex,code).map(item=>({postalCode:code,city:item.city,street:""})));
      return [...(a.postalEntries?.()||[]),...addressHistory.values(),...reference];
    }
    async function getGeography(){
      if(!geoPromise)geoPromise=a.loadGeography().then(geographyIndex).catch(()=>{geoPromise=null;throw new Error("Słownik adresowy jest niedostępny. Sprawdź połączenie lub uzupełnij region ręcznie.");});
      const index=await geoPromise;geoIndex=index;return index;
    }
    function applyGeography(item){
      let updated=false;
      for(const key of ["municipality","county","province"]){
        if(!item[key])continue;
        const value=key==="county"&&item[key].includes("(")?item[key]:a.name(item[key]);
        if(fields.get(key).value!==value){fields.get(key).value=value;updated=true;}
      }
      if(item.kind){const value=item.kind==="miasto"?"city":"village";if(fields.get("localityType").value!==value){fields.get("localityType").value=value;updated=true;}}
      if(item.postOffice)updated=updatePostOffice(a.city(item.postOffice))||updated;
      addressChanged(updated);
    }
    function addressChanged(updated){if(updated){dirtyState();updateAmounts();renderPreview();}}
    function updatePostOffice(city){
      const field=fields.get("postOffice");
      if(!field.value || field.value===autoPostOffice){const changed=field.value!==city;field.value=city;autoPostOffice=city;return changed;}
      return false;
    }
    function clearRegion(){geoSequence++;for(const key of ["municipality","county","province","localityType"])fields.get(key).value="";q("mailMergeGeoChoices").replaceChildren();}
    async function syncCityFromPostal() {
      if(!authorized()||busy)return;
      const code=fields.get("postal").value,city=fields.get("city"),choices=q("mailMergePostalChoices"),sequence=++postalSequence,epoch=session;choices.replaceChildren();
      const clearAutomaticCity=()=>{if(autoCity && city.value===autoCity){city.value="";autoCity="";clearRegion();updatePostOffice("");addressChanged(true);}};
      if(!/^\d{2}-\d{3}$/u.test(code)){if(!code)clearAutomaticCity();return;}
      let geo;
      try{geo=await getGeography();}catch(error){if(authorized()&&epoch===session&&sequence===postalSequence)choices.append(node("span","document-form-note",error.message));return;}
      if(!authorized()||epoch!==session||sequence!==postalSequence||code!==fields.get("postal").value)return;
      if(busy){deferredPostal=true;return;}
      const verified=geographyPostalMatches(geo,code),candidates=[];
      if(verified.length)candidates.push(...verified);
      else{
        const names=new Map();for(const entry of addressEntries())if(entry.postalCode===code)names.set(normalize(entry.city),a.city(entry.city));
        const known=a.cityForPostal(code);if(known)names.set(normalize(known),a.city(known));
        for(const name of names.values()){
          const matches=geographyMatches(geo,name);
          if(matches.length===1)candidates.push(matches[0]);else candidates.push({city:name});
        }
      }
      const apply=item=>{
        if(city.value!==item.city)clearRegion();city.value=item.city;autoCity=item.city;
        const postChanged=updatePostOffice(a.city(item.postOffice||item.city));
        choices.replaceChildren();addressChanged(true);applyGeography(item);
        if(postChanged)renderPreview();if(!item.id)void resolveGeo();
      };
      const matching=candidates.filter(item=>normalize(item.city)===normalize(city.value));
      if((!city.value||city.value===autoCity)&&candidates.length===1){apply(candidates[0]);return;}
      if(matching.length===1){apply(matching[0]);return;}
      if(!city.value||city.value===autoCity){clearAutomaticCity();applyGeography(sharedGeography(candidates));}
      if(candidates.length){
        choices.append(node("span","document-form-note",candidates.length>1?"Kod obejmuje kilka miejscowości. Wspólne dane administracyjne uzupełniono, jeśli są jednoznaczne. Wybierz miejscowość:":"Kod i wpisana miejscowość mogą się różnić. Wybierz właściwą miejscowość lub popraw kod:"));
        candidates.forEach(item=>choices.append(button(`${code} · ${item.city}${item.municipality?` · gm. ${item.municipality}`:""}`,()=>apply(item))));
      }else choices.append(node("span","document-form-note","Brak powiązania kodu w słowniku i historii. Wpisz miejscowość, aby dobrać gminę, powiat i województwo z GUS."));
    }
    function syncPostalFromCity() {
      if(!authorized()||busy)return;
      const city=fields.get("city").value,postal=fields.get("postal"),choices=q("mailMergePostalChoices");choices.replaceChildren();
      if(!city)return;
      const suggestion=a.postalSuggestion?.(city,fields.get("street").value,addressEntries())||{code:"",codes:[]};
      if(suggestion.code && (!postal.value||postal.value===autoPostal)){
        const updated=postal.value!==suggestion.code;postal.value=suggestion.code;autoPostal=suggestion.code;addressChanged(updated);
      }else if(suggestion.codes.length && !suggestion.codes.includes(postal.value)){
        choices.append(node("span","document-form-note","Kody z zapisanych adresów — wybierz właściwy lub wpisz ręcznie:"));
        suggestion.codes.forEach(code=>choices.append(button(code,()=>{postal.value=code;autoPostal=code;choices.replaceChildren();addressChanged(true);})));
      }else if(!postal.value && !suggestion.codes.length)choices.append(node("span","document-form-note","Brak kodu w zapisanych adresach. Uzupełnij go ręcznie."));
      const verified=geographyPostalMatches(geoIndex,postal.value).find(item=>normalize(item.city)===normalize(city));
      addressChanged(updatePostOffice(verified?.postOffice||city));
    }
    function updateBirth() {
      const input=fields.get("pesel");input.value=input.value.replace(/\D/gu,"").slice(0,11);
      fields.get("birthDate").value=a.validPesel(input.value)?a.birthDate(input.value):"";
      const gender=fields.get("gender");
      if(a.validPesel(input.value)){gender.value=Number(input.value[9])%2?"male":"female";autoGender=gender.value;}
      else if(autoGender && gender.value===autoGender){gender.value="";autoGender="";}
    }
    function updateAmounts() {const own=amounts(read()).own;q("mailMergeOwn").textContent=own===null?"—":`${money(own)} zł`;}
    function issues(data, full=false) {
      const errors=full?[...draftValidate(data,a.validPesel),...validate(data,a.validPesel)]:draftValidate(data,a.validPesel);
      if(data.pesel && a.validPesel(data.pesel) && a.age(data.pesel)<0)errors.push({field:"pesel",text:"Data urodzenia z PESEL-u nie może być w przyszłości."});
      if(data.certificateValidity!=="indefinite" && data.certificateUntil && !a.iso(data.certificateUntil))errors.push({field:"certificateUntil",text:"Wybierz prawidłową datę ważności orzeczenia."});
      if(full && data.personRole==="applicant" && a.validPesel(data.pesel) && a.age(data.pesel)<18)errors.push({field:"personRole",text:"Dla osoby niepełnoletniej wybierz dane podopiecznego. Dane opiekuna uzupełnij osobno."});
      const postalPlaces=geographyPostalMatches(geoIndex,data.postal);
      if(full && data.city && postalPlaces.length && !postalPlaces.some(item=>normalize(item.city)===normalize(data.city)))errors.push({field:"postal",text:"Kod pocztowy i miejscowość nie pasują do zweryfikowanego słownika. Sprawdź adres."});
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
    function pages(data, preview=false, count=printPages) {
      const fragment=document.createDocumentFragment(),marks=placements(data);let oversized=false;
      for(let page=1;page<=count;page++){
        const sheet=node("article","mail-merge-page"),background=node("img","mail-merge-template");
        const template=candidateTemplate||activeTemplate;
        background.src=template?.images[page-1]||`mail-merge/page-${page}.svg`;background.alt=`Wniosek PCPR Żywiec · strona ${page} z ${template?.count||7}`;
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
      q("mailMergeCompleteness").textContent=`Kompletność do wydruku: ${new Set(issues(read(),true).map(error=>error.field)).size} pól wymaga sprawdzenia.`;
      q("mailMergePreviewTitle").textContent=read().firstName?`Wniosek · ${read().firstName} ${read().surname}`:"Wniosek · pusty wzór";
    }
    function changed() {if(!authorized() || busy)return;dirtyState();updateBirth();updateConditionalFields();updateAmounts();clearTimeout(previewTimer);previewTimer=setTimeout(renderPreview,180);}
    function reset() {
      generation++;geoSequence++;postalSequence++;deferredPostal=false;editingId="";editingRevision=null;newId="";writeRequest=null;autoCity="";autoPostal="";autoPostOffice="";autoGender="";periodicDate="";
      fields.forEach(input=>{input.value="";if(input.type==="checkbox")input.checked=false;input.setCustomValidity("");input.removeAttribute("aria-invalid");});
      fields.get("personRole").value="applicant";fields.get("itemCount").value="1";updateConditionalFields();
      q("mailMergeMatches").replaceChildren();q("mailMergeGeoChoices").replaceChildren();q("mailMergeSearch").value="";q("mailMergePostalChoices").replaceChildren();
      dirtyState(false);message("");updateAmounts();renderPreview();
    }
    function load(entry) {
      reset();editingId=entry.id;editingRevision=entry.revision;
      personal.forEach(key=>{fields.get(key).value=entry.data[key]||"";});fields.get("personRole").value||="applicant";
      fields.get("sameAddress").checked=Boolean(entry.data.sameAddress);rememberAddress(entry.data);
      fields.get("itemCount").value=entry.data.itemCount||((entry.data.subject2||entry.data.orderNumber2)?"2":"1");
      const updated=normalizeFields();updateBirth();updateConditionalFields();updateAmounts();dirtyState(updated);renderPreview();
    }
    async function resolveGeo() {
      if(!authorized())return;const city=fields.get("city").value.trim();if(!city)return;
      const sequence=++geoSequence,epoch=session;
      let geo;try{geo=await getGeography();}catch(error){if(authorized()&&epoch===session&&sequence===geoSequence)message(error.message);return;}
      if(!authorized()||busy||epoch!==session||sequence!==geoSequence||city!==fields.get("city").value.trim())return;
      const postalMatches=geographyPostalMatches(geo,fields.get("postal").value).filter(item=>normalize(item.city)===normalize(city));
      const matches=postalMatches.length?postalMatches:geographyMatches(geo,city),list=q("mailMergeGeoChoices");list.replaceChildren();
      const apply=item=>{
        let updated=false;
        for(const key of ["city","municipality","county","province"]){
          const value=key==="city"?a.city(item[key]):key==="county"&&item[key].includes("(")?item[key]:a.name(item[key]);
          if(fields.get(key).value!==value){fields.get(key).value=value;updated=true;}
        }
        const kind=item.kind === "miasto" ? "city" : item.kind === "wieś" ? "village" : "";
        if(fields.get("localityType").value!==kind){fields.get("localityType").value=kind;updated=true;}
        updated=updatePostOffice(a.city(item.postOffice||item.city))||updated;list.replaceChildren();addressChanged(updated);syncPostalFromCity();
      };
      if(matches.length===1)apply(matches[0]);
      else if(matches.length){
        for(const key of ["municipality","county","province","localityType"])fields.get(key).value="";
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
        for(const text of [entry.data.phone||"—",entry.data.city||"—",degrees[entry.data.degree]||"—",entry.data.applicationNumber||"—",[entry.data.subject,entry.data.subject2].filter(Boolean).join(" · ")||"—"])row.append(node("td","",text));
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
        ready=true;schemaVersion=Number(result.schemaVersion||1);const selected=new Set(rows.filter(row=>row.selected).map(row=>row.id));
        rows=result.rows.map(row=>({...row,selected:selected.has(row.id)}));total=Number(result.total);renderRows();
        q("mailMergeDatabaseStatus").textContent=schemaVersion>=3?"Zapis w bazie · dostęp tylko dla SATIS":"Nowe pola wymagają aktualizacji. Uruchom aktualny plik supabase-mail-merge.sql i kliknij Odśwież listę. Dotychczasowe wpisy pozostają bez zmian.";
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
    async function saveDraft(draft=false) {
      if(normalizeFields())dirtyState();
      if(fields.get("postal").value && !fields.get("city").value)syncCityFromPostal();else syncPostalFromCity();
      updateBirth();const data=read(),errors=issues(data,!draft);markIssues(errors);if(errors.length)return;
      lock(true);const epoch=session,wasEditing=Boolean(editingId);
      try{
        if(schemaVersion<3){await refresh();if(schemaVersion<3){message("Przed zapisem nowych pól uruchom aktualny plik supabase-mail-merge.sql w Supabase, a następnie kliknij Odśwież listę.");return;}}
        newId||=a.id();const stored={...data};delete stored.birthDate;delete stored.role;
        const result=await write("SAVE",editingId||newId,editingRevision,stored);
        editingId=result.id;editingRevision=result.revision;writeRequest=null;newId="";rememberAddress(data);dirtyState(false);renderPreview();
        offset=0;q("mailMergeListSearch").value="";await refresh();
        if(authorized()&&epoch===session)message(draft?"Zapisano roboczo. Przed wydrukiem sprawdź kompletność pól.":wasEditing?"Zmiany zapisane w bazie.":"Osoba zapisana w bazie.");
      }catch(error){if(authorized()&&epoch===session)message(error.message);}finally{if(authorized()&&epoch===session)lock(false);}
    }
    async function deleteEntry(entry) {
      if(dirty && editingId===entry.id){message("Najpierw zapisz zmiany lub wybierz Nowa osoba, aby odrzucić edycję.");return;}
      if(!a.confirm("Trwale usunąć dane tej osoby z bazy PCPR Żywiec?"))return;
      lock(true);const epoch=session;
      try{await write("DELETE",entry.id,entry.revision,{});writeRequest=null;if(editingId===entry.id)reset();offset=0;await refresh();if(authorized())message("Osoba usunięta z bazy.");}
      catch(error){if(authorized()&&epoch===session)message(error.message);}finally{if(authorized()&&epoch===session)lock(false);}
    }
    async function print(mode="selected") {
      if(!authorized()||busy||printBusy||cleanupPrint)return;
      if(candidateTemplate){message("Najpierw zatwierdź albo anuluj podgląd nowego wzoru PDF.");return;}
      const epoch=session,account=a.user(),count=printPages;printBusy=true;
      try{
        let documents=[];
        if(mode==="blank")documents=[{}];
        else if(mode==="current"){
          if(normalizeFields())dirtyState();updateBirth();const data=read(),errors=issues(data,true);markIssues(errors);if(errors.length)return;documents=[data];
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
        documents.forEach(data=>output.append(pages(data,false,count)));document.body.append(output);
        try{await Promise.all([...output.querySelectorAll("img")].map(img=>img.decode()));}catch{throw new Error("Nie udało się wczytać wszystkich stron wzoru. Wydruk został wstrzymany.");}
        if(!authorized()||epoch!==session||account!==a.user()){output.remove();pendingPrint=null;return;}
        document.body.classList.add("mail-merge-print");
        const cleanup=()=>{output.remove();pendingPrint=null;document.body.classList.remove("mail-merge-print");a.window.removeEventListener("afterprint",cleanup);cleanupPrint=null;};
        cleanupPrint=cleanup;a.window.addEventListener("afterprint",cleanup,{once:true});await a.print(cleanup);
      }catch(error){pendingPrint?.remove();pendingPrint=null;cleanupPrint?.();if(authorized()&&epoch===session)message(error.message||"Nie udało się przygotować wydruku.");}finally{if(epoch===session)printBusy=false;}
    }
    const header=node("header","mail-merge-header");header.append(node("h2","","PCPR Żywiec"),node("p","document-form-note","Wniosek PCPR Żywiec · 7 stron. Dane opiekuna, pozostałe sekcje i podpisy uzupełnij osobno. Sprawdź właściwość urzędu dla miejsca zamieszkania."));
    const editor=node("form","mail-merge-editor");editor.noValidate=true;
    const toolbar=node("div","mail-merge-editor-toolbar"),editorTitle=node("h3");editorTitle.id="mailMergeEditorTitle";
    toolbar.append(editorTitle,button("Nowy wniosek",()=>{if(!dirty||a.confirm("Porzucić niezapisane zmiany?"))reset();}));editor.append(toolbar);
    const search=node("input","satis-private-search");search.id="mailMergeSearch";search.type="search";search.autocomplete="off";search.placeholder="Uzupełnij z historii · imię i nazwisko…";
    const matches=node("div","mail-merge-matches");matches.id="mailMergeMatches";editor.append(search,matches);
    const sections=[
      ["Dane personalne","person",[["firstName","Imię *"],["middleName","Drugie imię"],["surname","Nazwisko *"],["pesel","PESEL"],["birthDate","Data urodzenia z PESEL-u"],["gender","Płeć (z PESEL-u)",[["","Wybierz…"],["male","Mężczyzna"],["female","Kobieta"]]],["personRole","Dane dotyczą",[["applicant","Wnioskodawcy"],["ward","Podopiecznego / mocodawcy"]]]]],
      ["Adres zamieszkania","address",[["street","Ulica"],["house","Nr domu"],["flat","Nr lokalu"],["postal","Kod pocztowy"],["city","Miejscowość"],["postOffice","Poczta"],["municipality","Gmina"],["county","Powiat"],["province","Województwo"],["localityType","Rodzaj miejscowości (GUS)",[["","Wybierz…"],["city","Miasto"],["village","Wieś"]]]]],
      ["Kontakt","contact",[["phone","Telefon"],["email","E-mail"]]],
      ["Wniosek i orzeczenie","certificate",[["applicationNumber","Nr wniosku (jeśli nadany)"],["degree","Stopień niepełnosprawności",[["","Wybierz…"],["severe","Znaczny"],["moderate","Umiarkowany"],["mild","Lekki"],["none","Nie dotyczy"]]],["invalidityGroup","Grupa inwalidzka",[["","Wybierz…"],["I","I grupa"],["II","II grupa"],["III","III grupa"],["none","Nie dotyczy"]]],["certificateNumber","Nr orzeczenia"],["certificateValidity","Ważność orzeczenia",[["","Wybierz…"],["indefinite","Bezterminowo"],["periodic","Do wskazanej daty"]]],["certificateUntil","Ważne do"]]],
      ["Przedmiot wniosku","subject",[["itemCount","Liczba przedmiotów",[["1","1 przedmiot"],["2","2 przedmioty"]]],["subject","Przedmiot 1 / nazwa produktu"],["orderNumber","Numer zlecenia 1"],["subject2","Przedmiot 2 / nazwa produktu"],["orderNumber2","Numer zlecenia 2"]]],
      ["Dofinansowanie","funding",[["cost","Całkowity koszt zakupu (zł)"],["nfz","Dofinansowanie NFZ (zł)"],["requested","Wnioskowana kwota (zł)"]]]
    ];
    for(const [title,group,items]of sections){
      const section=node("fieldset",`mail-merge-fields mail-merge-group-${group}`);section.append(node("legend","",title));
      items.forEach(([key,title,options])=>{
        const label=node("label"),input=node(options?"select":"input");input.id=`merge${key}`;input.autocomplete="off";input.maxLength=["subject","orderNumber","subject2","orderNumber2"].includes(key)?1000:key==="firstName"?100:key==="surname"?160:240;
        if(options)options.forEach(([value,text])=>{const option=node("option","",text);option.value=value;input.append(option);});
        else input.type=key==="phone"?"tel":key==="email"?"email":"text";
        if(key==="pesel"){input.inputMode="numeric";input.maxLength=11;}
        if(["cost","nfz","requested"].includes(key))input.inputMode="decimal";
        if(key==="certificateUntil"){input.setAttribute("data-date-picker","");a.bindDate(input);}
        if(key==="birthDate")input.readOnly=true;
        fields.set(key,input);labels.set(key,label);label.append(node("span","",title),input);
        const absent={middleName:"Brak",flat:"Brak",street:"Nie dotyczy",email:"Brak e-maila",applicationNumber:"Nie nadano"}[key];
        if(absent){const blank=button(absent,()=>{input.value="-";input.setCustomValidity("");changed();renderPreview();},"mail-merge-absent");blank.setAttribute("aria-label",`${title}: ${absent}`);label.append(blank);}
        section.append(label);
      });
      if(group==="address"){
        for(const id of ["mailMergePostalChoices","mailMergeGeoChoices"]){const choices=node("div","mail-merge-matches mail-merge-full");choices.id=id;choices.setAttribute("aria-live","polite");section.append(choices);}
      }
      editor.append(section);
    }
    const same=node("input");same.type="checkbox";same.id="mergeSameAddress";fields.set("sameAddress",same);
    const sameLabel=node("label","mail-merge-check");sameLabel.append(same,node("span","","Adres korespondencyjny taki sam jak adres zamieszkania"));
    const fundingNote=node("p","document-form-note");fundingNote.id="mailMergeFundingNote";editor.append(fundingNote);
    const own=node("p","document-form-note","Udział własny po dofinansowaniu: "),ownValue=node("strong");ownValue.id="mailMergeOwn";own.append(ownValue);
    const status=node("p","mail-merge-message");status.id="mailMergeMessage";status.setAttribute("role","status");status.setAttribute("aria-live","polite");
    const save=button("Zapisz",saveDraft,"mail-merge-save" );save.id="mailMergeSave";
    const completeness=node("p","document-form-note");completeness.id="mailMergeCompleteness";
    const printMode=node("div","mail-merge-actions mail-merge-print-mode");printMode.setAttribute("role","group");printMode.setAttribute("aria-label","Liczba stron wydruku");printMode.append(node("span","","Wydruk:"));
    for(const count of [5,7]){const control=button(`${count} stron`,()=>{if(count>(activeTemplate?.count||7))return;printPages=count;updatePrintMode();renderPreview();});control.id=`mailMergePrint${count}`;printMode.append(control);}
    const printNotice=node("p","mail-merge-message");printNotice.id="mailMergePrintNotice";
    function updatePrintMode(){
      const available=(candidateTemplate||activeTemplate)?.count||7;if(printPages>available)printPages=available;
      for(const count of [5,7]){q(`mailMergePrint${count}`).setAttribute("aria-pressed",String(printPages===count));q(`mailMergePrint${count}`).disabled=busy||count>available;}
      q("mailMergePrintNotice").textContent=printPages===5?available===7?"Wydruk stron 1–5 z oryginału. Pomija dalszą część oświadczenia, klauzulę informacyjną i wykaz załączników. Pełny wzór ma 7 stron.":"Wybrany wzór ma 5 stron. Sprawdź, czy zawiera wszystkie wymagane oświadczenia i załączniki.":"";
    }
    const actions=node("div","mail-merge-actions mail-merge-main-actions");actions.append(button("Zapisz roboczo",()=>saveDraft(true)),save,button("Sprawdź kompletność",()=>{normalizeFields();updateBirth();markIssues(issues(read(),true));renderPreview();}),button("Drukuj wniosek / PDF",()=>print("current")),button("Drukuj pusty wzór",()=>print("blank")));
    editor.append(sameLabel,own,node("p","document-form-note","Zapisz roboczo — imię i nazwisko wystarczą. Zapisz i wydruk wypełnionego wniosku — wszystkie właściwe pola muszą być uzupełnione; przy braku danych wybierz Brak lub Nie dotyczy."),completeness,status,printMode,printNotice,actions);
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
    const templatePanel=node("details","mail-merge-template-settings");templatePanel.append(node("summary","","Zmień wzór PDF"));
    templatePanel.append(node("p","document-form-note","Wybierz pusty PDF, 5 lub 7 stron A4, z takim samym układem pól. Importowany wzór działa tylko w tej sesji na tym komputerze. Plik nie jest wysyłany na serwer. Zmieniony układ wymaga osobnego dopasowania."));
    const templateFile=node("input");templateFile.id="mailMergeTemplateFile";templateFile.type="file";templateFile.accept=".pdf,application/pdf";templateFile.setAttribute("aria-label","Nowy pusty wzór PDF PCPR Żywiec");
    const templateStatus=node("p","document-form-note");templateStatus.id="mailMergeTemplateStatus";templateStatus.setAttribute("role","status");
    const reviewLine=node("label","mail-merge-check");reviewLine.id="mailMergeTemplateReview";
    const review=node("input");review.id="mailMergeTemplateConfirm";review.type="checkbox";
    reviewLine.append(review,node("span","","PDF nie zawiera danych osoby. Sprawdzono podgląd wszystkich stron i zgodność położenia wpisanych danych z polami nowego wzoru."));
    const templateActions=node("div","mail-merge-actions");
    const applyTemplate=button("Zastosuj wzór",()=>{
      if(!candidateTemplate||!review.checked)return;
      activeTemplate?.dispose();activeTemplate=candidateTemplate;candidateTemplate=null;review.checked=false;updateTemplateControls();updatePrintMode();renderPreview();message("Nowy wzór aktywny w tej sesji. Dane osób nie zostały zmienione.");
    });applyTemplate.id="mailMergeTemplateApply";
    let previousPrintPages=7;
    const cancelTemplate=button("Anuluj podgląd wzoru",()=>{candidateTemplate?.dispose();candidateTemplate=null;review.checked=false;printPages=Math.min(previousPrintPages,activeTemplate?.count||7);updateTemplateControls();updatePrintMode();renderPreview();});cancelTemplate.id="mailMergeTemplateCancel";
    const restoreTemplate=button("Przywróć oryginalny wzór",()=>{
      if(!a.confirm("Przywrócić oryginalny wzór? Dane wpisane do wniosku pozostaną bez zmian."))return;
      candidateTemplate?.dispose();activeTemplate?.dispose();candidateTemplate=null;activeTemplate=null;review.checked=false;templateFile.value="";printPages=7;updateTemplateControls();updatePrintMode();renderPreview();
    });restoreTemplate.id="mailMergeTemplateRestore";
    templateActions.append(applyTemplate,cancelTemplate,restoreTemplate);templatePanel.append(templateFile,templateStatus,reviewLine,templateActions);
    const cancelImport=node("button","reset-filters-btn","Anuluj import");cancelImport.type="button";
    cancelImport.addEventListener("click",()=>{if(authorized())templateImportController?.abort();});templatePanel.append(cancelImport);
    function updateTemplateControls(){
      cancelImport.hidden=!templateImportController;cancelImport.disabled=!authorized()||!templateImportController;
      reviewLine.hidden=!candidateTemplate;review.disabled=busy;
      applyTemplate.disabled=busy||!candidateTemplate||!review.checked;cancelTemplate.disabled=busy||!candidateTemplate;restoreTemplate.disabled=busy||!(activeTemplate||candidateTemplate);templateFile.disabled=busy;
      if(!templateImportController)templateStatus.textContent=candidateTemplate?`Podgląd do zatwierdzenia: ${candidateTemplate.name}`:activeTemplate?`Aktywny w tej sesji: ${activeTemplate.name}`:"Oryginalny wzór PCPR Żywiec · 7 stron";
    }
    review.addEventListener("change",updateTemplateControls);
    templateFile.addEventListener("change",async()=>{
      if(!authorized()||busy||!templateFile.files?.length)return;
      const file=templateFile.files[0],epoch=session,controller=new AbortController();templateImportController=controller;lock(true);
      try{
        templateStatus.textContent="Sprawdzanie pustego wzoru PDF…";
        const parsed=await a.importTemplate(file,{document,signal:controller.signal,progress:text=>{if(authorized()&&epoch===session)templateStatus.textContent=text;}});
        if(!authorized()||epoch!==session){parsed.dispose();return;}
        candidateTemplate?.dispose();candidateTemplate=parsed;previousPrintPages=printPages;review.checked=false;updatePrintMode();renderPreview();
        message("Sprawdź podgląd wszystkich stron poniżej. Wydruk nowego wzoru będzie możliwy dopiero po potwierdzeniu zgodności pól.");
      }catch(error){if(authorized()&&epoch===session)message(error.message||"Nie udało się wczytać wzoru. Poprzedni wzór pozostaje bez zmian.");}
      finally{if(authorized()&&epoch===session){templateImportController=null;templateFile.value="";lock(false);}}
    });

    host.replaceChildren(header,templatePanel,editor,database,preview);updatePrintMode();reset();renderRows();
    editor.addEventListener("submit",event=>{event.preventDefault();if(authorized()&&!busy)void saveDraft();});
    editor.addEventListener("input",changed);editor.addEventListener("change",changed);
    fields.get("certificateNumber").addEventListener("input",()=>{
      const input=fields.get("certificateNumber"),start=input.selectionStart,end=input.selectionEnd,before=input.value;input.value=before.toLocaleUpperCase("pl-PL");
      if(typeof start==="number" && input.setSelectionRange)input.setSelectionRange(before.slice(0,start).toLocaleUpperCase("pl-PL").length,before.slice(0,end).toLocaleUpperCase("pl-PL").length);
    });
    fields.get("certificateValidity").addEventListener("change",()=>{updateConditionalFields(true);changed();renderPreview();});
    fields.get("itemCount").addEventListener("change",()=>{
      if(fields.get("itemCount").value==="1" && (fields.get("subject2").value||fields.get("orderNumber2").value)){
        if(!a.confirm("Usunąć drugi przedmiot i jego numer zlecenia z bieżącego wniosku?")){fields.get("itemCount").value="2";return;}
        fields.get("subject2").value="";fields.get("orderNumber2").value="";
      }changed();renderPreview();
    });
    fields.get("city").addEventListener("input",()=>{
      clearRegion();autoCity="";q("mailMergePostalChoices").replaceChildren();
      if(autoPostal && fields.get("postal").value===autoPostal){fields.get("postal").value="";autoPostal="";}
    });
    const formatContact=()=>{if(!authorized()||busy)return;addressChanged(normalizeFields());renderPreview();};
    for(const key of ["firstName","middleName","surname","street","city","house","flat","postOffice","municipality","county","province","phone"])fields.get(key).addEventListener("blur",()=>{
      formatContact();if(["street","city"].includes(key)){syncPostalFromCity();return resolveGeo();}
    });
    fields.get("postal").addEventListener("input",()=>{
      const input=fields.get("postal"),before=input.value,caret=input.selectionStart,digits=typeof caret==="number"?before.slice(0,caret).replace(/\D/gu,"").length:null;
      input.value=a.postal(before);autoPostal="";
      if(digits!==null && input.setSelectionRange){let position=0,count=0;while(position<input.value.length && count<digits){if(/\d/u.test(input.value[position]))count++;position++;}input.setSelectionRange(position,position);}
      return syncCityFromPostal();
    });
    fields.get("postal").addEventListener("blur",async()=>{formatContact();await syncCityFromPostal();await resolveGeo();});
    search.addEventListener("input",()=>{
      matches.replaceChildren();if(!authorized()||busy||search.value.trim().length<2)return;
      a.contacts(search.value).slice(0,8).forEach(entry=>matches.append(button([entry.customer,entry.phone,entry.address,entry.document?`Dokument: •••• ${entry.document.slice(-4)}`:""].filter(Boolean).join(" · "),()=>{
        if(dirty&&!a.confirm("Wczytać osobę z historii i odrzucić niezapisane dane?"))return;
        reset();search.value=entry.customer;const parts=a.address(entry.address||"");
        for(const [key,value]of Object.entries({...splitName(entry.customer),phone:entry.phone||"",city:parts.city||"",postal:parts.postalCode||""}))fields.get(key).value=value;
        const street=String(parts.street||"").replace(/^(?:ul\.|al\.)\s*/iu,""),parsed=street.match(/^(.*?)\s+(\d+[\p{L}]?)(?:\/(\d+[\p{L}]?))?$/u);
        fields.get("street").value=parsed?.[1]||street;fields.get("house").value=parsed?.[2]||"";fields.get("flat").value=parsed?.[3]||"";
        fields.get("pesel").value=a.validPesel(entry.document)?entry.document:"";normalizeFields();changed();syncPostalFromCity();void resolveGeo();renderPreview();message("Sprawdź podział imion i nazwiska oraz dane osoby przed zapisem.");
      })));
    });
    listSearch.addEventListener("input",()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{offset=0;void refresh();},250);});
    a.window.addEventListener("beforeunload",event=>{if(authorized()&&dirty){event.preventDefault();event.returnValue="";}});
    document.fonts?.ready.then(()=>{if(authorized())renderPreview();});
    return {open(){if(!authorized()){this.clear();return false;}host.hidden=false;if(!ready)void refresh();renderPreview();return true;},
      clear(){session++;generation++;readSequence++;geoSequence++;clearTimeout(searchTimer);clearTimeout(previewTimer);pendingPrint?.remove();pendingPrint=null;cleanupPrint?.();printBusy=false;rows=[];total=0;offset=0;ready=false;schemaVersion=0;templateImportController?.abort();templateImportController=null;activeTemplate?.dispose();candidateTemplate?.dispose();activeTemplate=null;candidateTemplate=null;q("mailMergeTemplateFile").value="";q("mailMergeTemplateConfirm").checked=false;updateTemplateControls();printPages=7;updatePrintMode();addressHistory.clear();reset();q("mailMergePreviewPages").replaceChildren();q("mailMergeListSearch").value="";q("mailMergeDatabaseStatus").textContent="";renderRows();lock(false);host.hidden=true;},
      queue:()=>authorized()?rows.map(row=>({...row,data:{...row.data}})):[]};
  }
  return {PAGE,normalize,parseMoney,amounts,splitName,geographyIndex,geographyMatches,geographyPostalMatches,sharedGeography,validate,draftValidate,placements,applicationItems,fitText,create};
});
