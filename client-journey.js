(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.SatisClientJourney=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const flags={rodo:"RODO potwierdzone",fitting:"Dopasowanie i instruktaż zakończone",receipt:"Potwierdzenie odbioru podpisane",instructions:"Instrukcje przekazane",warranty:"Karta gwarancyjna przekazana",care:"Pielęgnacja omówiona i przekazana"};
  const clean=value=>String(value||"").toLocaleLowerCase("pl-PL").normalize("NFD").replace(/\p{M}/gu,"").replace(/ł/gu,"l").replace(/\s+/gu," ").trim();
  const day=value=>/^\d{4}-\d{2}-\d{2}$/.test(String(value||""))?String(value):"";
  const key=row=>`${row.type}:${row.id}`;
  const visitLabels={PLANNED:"Zaplanowana",COMPLETED:"Odbyta",CANCELLED:"Anulowana",MISSED:"Nieobecność"};
  function historyEvents(history,state){
    const result=[];let previous={};
    for(const event of [...history].filter(e=>state.case_id?e.data?.case_id===state.case_id:!e.data?.case_id&&e.data?.started_on===state.started_on).sort((a,b)=>String(a.created_at).localeCompare(String(b.created_at)))){
      for(const [id,label]of Object.entries(flags))if(Boolean(event.data.confirmations?.[id])!==Boolean(previous.confirmations?.[id]))
        result.push({label:event.data.confirmations[id]?label:`Cofnięto: ${label}`,date:event.created_at,model:event.actor_email||"SATIS"});
      if(event.data.interest!==previous.interest&&event.data.interest!=="UNKNOWN")result.push({label:event.data.interest==="INTERESTED"?"Zainteresowanie zakupem potwierdzone":"Rezygnacja z zakupu",date:event.created_at,model:event.actor_email||"SATIS"});
      previous=event.data;
    }
    return result;
  }
  function localDay(value){const date=new Date(value);if(!Number.isFinite(date.getTime()))return "";return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;}
  function normalize(value={},today=""){
    return {kind:value.kind==="SERVICE"?"SERVICE":"PURCHASE",started_on:day(value.started_on)||today,interest:["UNKNOWN","INTERESTED","DECLINED"].includes(value.interest)?value.interest:"UNKNOWN",
      referral:["UNKNOWN","REQUESTED","READY","WITHOUT_REFUND"].includes(value.referral)?value.referral:"UNKNOWN",trial_required:value.trial_required===true,
      devices_required:value.devices_required===2?2:1,device_ids:[...new Set((Array.isArray(value.device_ids)?value.device_ids:[]).map(String))].slice(0,2),
      visit_id:String(value.visit_id||""),confirmations:Object.fromEntries(Object.keys(flags).map(id=>[id,value.confirmations?.[id]===true])),
      ...(value.case_id?{case_id:String(value.case_id),source_keys:[...new Set((Array.isArray(value.source_keys)?value.source_keys:[]).map(String))]}:{})};
  }
  function confirmedRows(context){
    const links=new Set((context.links||[]).map(link=>`${link.source_type}:${link.source_id}`));
    return (context.sources||[]).filter(row=>links.has(key(row))&&clean(row.name)===clean(context.profile?.full_name));
  }
  function initialState(context,today){
    const rows=confirmedRows(context),loans=rows.filter(row=>row.type==="loan").sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    return normalize({started_on:loans[0]?.date||today,trial_required:loans.length>0},today);
  }
  function demoSnapshots(){
    const profile={id:"DEMO-CLIENT-NOT-SAVED",full_name:"Klient demonstracyjny",phone:"",location:"P63"};
    const state=normalize({started_on:"2026-10-19",trial_required:true,devices_required:2},"2026-10-19");
    const sources=[{type:"loan",id:"DEMO-LOAN",name:profile.full_name,kind:"Umowa wypożyczenia",date:"2026-10-19",model:"Testowe aparaty P i L",number:"PRZYKŁAD/10/2026",workflow:{returnDate:""}}],activities=[],snapshots=[];
    function save(label,date){snapshots.push({label,date,state:structuredClone(state),context:{profile:{...profile},sources:structuredClone(sources),activities:structuredClone(activities),links:sources.map(row=>({source_type:row.type,source_id:row.id}))}});}
    save("1. Wypożyczenie i umowa","2026-10-19");
    sources[0].workflow.returnDate="2026-11-02";save("2. Zwrot aparatów Demo","2026-11-02");
    state.interest="INTERESTED";state.confirmations.rodo=true;
    sources.push({type:"offer",id:"DEMO-OFFER",name:profile.full_name,kind:"Oferta",date:"2026-11-02",model:"Dwa aparaty testowe"});
    state.referral="REQUESTED";save("3. Oferta, RODO i zlecenie w toku","2026-11-02");
    state.referral="READY";state.device_ids=["DEMO-SALE-P","DEMO-SALE-L"];
    for(const side of ["P","L"])sources.push({type:"device",id:`DEMO-SALE-${side}`,name:profile.full_name,kind:"Aparat",model:`Aparat testowy ${side}`,serial:`TEST-SALE-${side}`,date:"2026-10-01",workflow:{type:"REZERWACJA",hearingAid:true}});
    save("4. Dwa aparaty zarezerwowane","2026-11-03");
    activities.push({id:"DEMO-VISIT",kind:"VISIT",title:"Dopasowanie i odbiór aparatów",starts_at:"2026-11-04T10:00:00Z",status:"PLANNED"});state.visit_id="DEMO-VISIT";
    save("5. Wizyta umówiona","2026-11-03");
    activities[0].status="COMPLETED";
    for(const item of sources.filter(row=>row.type==="device")){item.date="2026-11-04";Object.assign(item.workflow,{type:"SPRZEDANY",pickupDate:"2026-11-04",invoice:"TEST-FS/11/2026",ezwm:"REALIZACJA"});}
    for(const id of Object.keys(flags))state.confirmations[id]=true;save("6. Zakup i dokumenty zakończone","2026-11-04");
    sources.push({type:"complaint",id:"DEMO-COMPLAINT",name:profile.full_name,kind:"Reklamacja",date:"2026-11-09",number:"TEST-REK/11/2026",model:"Aparat testowy P",serial:"TEST-SALE-P"});
    const repair={type:"service",id:"DEMO-SERVICE",name:profile.full_name,kind:"Serwis / reklamacja",date:"2026-11-09",number:"TEST-REK/11/2026",model:"Aparat testowy P",serial:"TEST-SALE-P",workflow:{sourceDocumentId:"DEMO-COMPLAINT",receivedDate:"2026-11-09"}};sources.push(repair);
    save("7. Reklamacja przyjęta","2026-11-09");
    repair.workflow.sentDate="2026-11-10";repair.date="2026-11-10";save("8. Wysłanie do naprawy","2026-11-10");
    repair.workflow.returnDate="2026-11-13";repair.date="2026-11-13";save("9. Powrót — trzeba zadzwonić","2026-11-13");
    repair.workflow.phoneNotifiedAt="2026-11-13T11:15:00Z";save("10. Telefon — czekamy na odbiór","2026-11-13");
    repair.workflow.pickupDate="2026-11-16";repair.date="2026-11-16";save("11. Odbiór — cała droga zakończona","2026-11-16");
    return snapshots;
  }
  function createDemo(a){
    if(!a.host)return null;
    const host=a.host,doc=a.document,snapshots=demoSnapshots();let current=snapshots[0];
    const header=doc.createElement("header"),heading=doc.createElement("h2"),close=doc.createElement("button"),note=doc.createElement("p"),label=doc.createElement("label"),select=doc.createElement("select"),body=doc.createElement("section");
    header.className="clients-section-heading";heading.textContent="Klient demonstracyjny · P63";close.type="button";close.className="reset-filters-btn";close.textContent="Zamknij przykład";
    note.className="clients-hint";note.textContent="Dane fikcyjne · tylko podgląd · bez zapisu do bazy. Wybierz etap, aby zobaczyć następny krok i powiązania.";
    label.className="client-demo-stage";label.append("Etap przykładu",select);select.setAttribute("aria-label","Etap klienta demonstracyjnego");
    snapshots.forEach((snapshot,index)=>{const option=doc.createElement("option");option.value=String(index);option.textContent=snapshot.label;select.append(option);});
    header.append(heading,close);host.append(header,note,label,body);body.className="client-journey";
    const view=create({host:body,document:doc,allowed:a.allowed,readOnly:true,today:()=>current.date,id:()=>"NO-WRITE-DEMO",setDate:a.setDate,iso:a.iso,dateTime:a.dateTime,
      confirm:()=>false,canNavigate:()=>false,devices:()=>[],openForm(){},visit(){},
      rpc:async name=>{if(name!=="satis_client_journey_read")throw new Error("Przykład nie zapisuje danych.");return {journey:{revision:1,data:current.state},events:[]};}});
    function show(){if(!a.allowed())return;for(const row of current.context.sources)row.open=()=>{};void view.show(current.context);}
    select.addEventListener("change",()=>{current=snapshots[Number(select.value)]||snapshots[0];show();});
    close.addEventListener("click",()=>{view.clear();host.hidden=true;a.onClose?.();});
    return {open(){if(!a.allowed())return;host.hidden=false;show();host.scrollIntoView?.({block:"start",behavior:"smooth"});},clear(){view.clear();host.hidden=true;}};
  }
  function build(context,state,today,manual=[]){
    const s=normalize(state,today),all=confirmedRows(context),selected=new Set(s.source_keys||[]);
    const belongs=row=>!s.case_id?day(row.date)>=s.started_on:selected.has(key(row))||row.type==="device"&&s.device_ids.includes(String(row.id))||row.type==="service"&&["complaint:","order:"].some(prefix=>selected.has(prefix+row.workflow?.sourceDocumentId));
    const rows=all.filter(belongs);
    const loans=rows.filter(row=>row.type==="loan"),activeLoans=all.filter(row=>row.type==="loan"&&(!row.workflow?.returnDate||row.workflow?.outstandingDemo));
    const devices=all.filter(row=>row.type==="device"&&row.workflow?.hearingAid!==false&&
      (s.device_ids.length?s.device_ids.includes(String(row.id)):!s.case_id&&day(row.workflow?.pickupDate)>=s.started_on));
    const reserved=devices.filter(row=>["REZERWACJA","SPRZEDANY"].includes(row.workflow?.type));
    const sold=devices.filter(row=>row.workflow?.type==="SPRZEDANY"&&row.workflow?.invoice&&day(row.workflow?.pickupDate));
    const serials=reserved.map(row=>String(row.serial||"").replace(/\s+/gu,"").toUpperCase());
    const validSerials=serials.every(serial=>serial&&!["BRAK","BRAKNUMERU","FV"].includes(serial))&&new Set(serials).size===serials.length;
    const refunded=reserved.length>=s.devices_required&&reserved.every(row=>["POBRANE","REALIZACJA"].includes(row.workflow?.ezwm));
    const noRefund=reserved.length>=s.devices_required&&reserved.every(row=>row.workflow?.ezwm==="BEZ REFUNDACJI");
    const visit=(context.activities||[]).find(row=>row.id===s.visit_id&&row.kind==="VISIT"&&localDay(row.starts_at)>=s.started_on);
    const events=[],steps=[],services=[];
    const add=(id,title,done,detail,action="",skipped=false)=>steps.push({id,title,done,detail,action,skipped});
    const interested=s.interest==="INTERESTED"||reserved.length>0||sold.length>=s.devices_required;
    add("loan","Wypożyczenie i umowa",!s.trial_required||loans.length>0,loans.length===1?"1 potwierdzona umowa":loans.length?`${loans.length} potwierdzonych umów`:s.trial_required?"Brak powiązanej umowy wypożyczenia":"Bez testowania", "loan",!s.trial_required);
    add("return","Zwrot po testowaniu",!s.trial_required&&!activeLoans.length||loans.length>0&&loans.every(row=>row.workflow?.returnDate)&&!activeLoans.length,
      activeLoans.length?`${activeLoans.length} niezakończonych umów`:loans.length?"Daty zwrotu zapisane w umowach":"Nie dotyczy","loan",!s.trial_required&&!activeLoans.length);
    add("interest","Decyzja klienta",interested||s.interest==="DECLINED",sold.length>=s.devices_required?"Zakup potwierdzony":s.interest==="DECLINED"?"Rezygnacja z zakupu":interested?"Zainteresowany zakupem":"Potwierdź zainteresowanie zakupem");
    const declined=s.interest==="DECLINED"&&!sold.length;
    if(!declined){
      const offers=rows.filter(row=>row.type==="offer");
      add("offer","Oferta",offers.length>0,offers.length===1?"1 powiązana oferta":offers.length?`${offers.length} powiązanych ofert`:"Brak oferty w bieżącej sprawie","offer");
      add("rodo","RODO",s.confirmations.rodo,s.confirmations.rodo?"Potwierdzono obsługę dokumentu":"Potwierdź po podpisaniu / przekazaniu","rodo");
      add("referral","Zlecenie / finansowanie",["READY","WITHOUT_REFUND"].includes(s.referral)||refunded||noRefund,
        noRefund||s.referral==="WITHOUT_REFUND"?"Zakup bez refundacji":refunded||s.referral==="READY"?"Zlecenie gotowe":s.referral==="REQUESTED"?"Zlecenie do uzyskania — w toku":"Ustal, czy potrzebne jest zlecenie NFZ");
      add("devices","Aparaty przypisane do klienta",reserved.length===s.devices_required&&validSerials,validSerials?`${reserved.length} / ${s.devices_required} aparatów przypisanych lub sprzedanych${reserved.length>s.devices_required?" — wybierz właściwe aparaty tej sprawy":""}`:"Brak lub powtórzenie numeru seryjnego — sprawdź aparaty");
      const visitReady=visit&&["PLANNED","COMPLETED"].includes(visit.status);
      add("visit","Wizyta po testowaniu",visit?.status==="COMPLETED",visitReady?(visit.status==="COMPLETED"?"Odbyta":"Umówiona — do odbycia"):"Wybierz wizytę albo umów termin","visit");
      if(visitReady)steps.at(-1).date=visit.starts_at;
      add("delivery","Sprzedaż i wydanie aparatów",sold.length===s.devices_required&&validSerials,`${sold.length} / ${s.devices_required} aparatów z fakturą i datą odbioru`,"receipt");
      const realization=reserved.length>=s.devices_required&&reserved.every(row=>row.workflow?.ezwm==="REALIZACJA");
      const exempt=noRefund||s.referral==="WITHOUT_REFUND"&&!reserved.some(row=>["POBRANE","REALIZACJA"].includes(row.workflow?.ezwm));
      add("ezwm","Realizacja zlecenia NFZ",realization||exempt,exempt?"Bez refundacji — nie dotyczy":realization?"EZWM: realizacja potwierdzona w Bazie":"Po sprzedaży uzupełnij EZWM: realizacja w Bazie","",exempt);
      for(const [id,title]of Object.entries(flags).filter(([id])=>id!=="rodo"))add(id,title,s.confirmations[id],s.confirmations[id]?"Potwierdzono wykonanie":"Wymaga potwierdzenia",id==="care"?"care":"receipt");
      if(visit?.status==="PLANNED"&&(localDay(visit.starts_at)<today||localDay(visit.starts_at)===today&&today===localDay(new Date())&&new Date(visit.starts_at).getTime()<Date.now()))steps.find(step=>step.id==="visit").detail="Termin minął — potwierdź odbycie lub zmień wizytę";
    }
    const serviceRows=all.filter(row=>row.type==="service"&&(s.case_id?belongs(row):!row.workflow?.pickupDate||day(row.date)>=s.started_on));
    const paired=new Set(serviceRows.map(row=>row.workflow?.sourceDocumentId).filter(Boolean));
    for(const row of serviceRows){
      const w=row.workflow||{},closed=Boolean(w.pickupDate);
      services.push({row,closed,steps:[{label:"Przyjęto",date:w.receivedDate},{label:"Wysłano",date:w.sentDate},{label:"Powrót",date:w.returnDate},
        {label:"Poinformowano tel.",date:w.phoneNotifiedAt},{label:"Odebrano",date:w.pickupDate}]});
    }
    for(const row of rows.filter(row=>["order","complaint"].includes(row.type)&&!paired.has(row.id)))services.push({row,closed:false,missingService:true,steps:[]});
    for(const row of rows){
      const w=row.workflow||{},dates=row.type==="loan"?[["Umowa wypożyczenia",row.date],["Zwrot po testowaniu",w.returnDate]]:
        row.type==="service"?[["Przyjęto",w.receivedDate],["Wysłano",w.sentDate],["Powrót",w.returnDate],["Poinformowano tel.",w.phoneNotifiedAt],["Odebrano",w.pickupDate]]:
          [[row.kind||row.type,row.date]];
      for(const [label,date]of dates)if(date)events.push({label,date,model:row.model,number:row.number,row});
    }
    for(const activity of context.activities||[])if(s.case_id?activity.id===s.visit_id:localDay(activity.starts_at||activity.created_at)>=s.started_on)events.push({label:activity.kind==="VISIT"?`Wizyta · ${visitLabels[activity.status]||activity.status}`:activity.title,date:activity.starts_at||activity.created_at,activity});
    events.sort((a,b)=>String(a.date).localeCompare(String(b.date))||a.label.localeCompare(b.label,"pl"));
    if(s.kind==="SERVICE"){
      steps.length=0;
      for(const item of services)add(`service:${key(item.row)}`,`${item.row.kind} · ${item.row.number||item.row.model||"sprawa"}`,item.closed,
        item.missingService?"Brak wpisu w Serwisie":item.closed?"Odbiór przez klienta zapisany":item.row.workflow?.returnDate?"Produkt wrócił — telefon i odbiór":"Sprawa w toku");
      if(!services.length)add("service","Serwis / zamówienie / reklamacja",false,"Powiąż formularz lub wpis serwisowy z tą kartą","complaint");
    }
    const openServices=services.filter(service=>!service.closed);
    let serviceNext=null;
    if(openServices.length){
      const item=openServices[0],w=item.row.workflow||{};
      const [title,detail]=item.missingService?["Potwierdź wpis w Serwisie","Formularz reklamacji lub zamówienia nie ma powiązanego wpisu serwisowego."]:
        !w.receivedDate?["Uzupełnij datę przyjęcia","Sprawdź przyjęcie produktu do obsługi."]:
        w.returnDate&&!w.phoneNotifiedAt?["Poinformuj klienta telefonicznie","Produkt wrócił i oczekuje na odbiór."]:
        w.returnDate?["Odbiór produktu przez klienta","Telefon zapisany. Po wydaniu uzupełnij datę odbioru."]:
        !w.sentDate?["Wyślij produkt / uzupełnij wysłanie","Sprawa została przyjęta i jest w obsłudze."]:
        ["Oczekiwanie na powrót produktu","Produkt wysłany. Po powrocie zapisz datę i poinformuj klienta."];
      serviceNext={id:`service-next:${key(item.row)}`,title,detail,row:item.row};
    }
    const activeCaseLoans=loans.filter(row=>!row.workflow?.returnDate||row.workflow?.outstandingDemo);
    const purchase=s.interest==="INTERESTED"||reserved.length>0||sold.length>0;
    const trial=s.trial_required||loans.length>0,returned=loans.length>0&&!activeCaseLoans.length;
    const hasOffer=rows.some(row=>row.type==="offer"),actualNfz=reserved.some(row=>["POBRANE","REALIZACJA"].includes(row.workflow?.ezwm));
    const needsNfz=actualNfz||!noRefund&&s.referral!=="WITHOUT_REFUND"&&["REQUESTED","READY"].includes(s.referral);
    const relevant=new Set(manual);
    if(trial){relevant.add("loan");if(loans.length)relevant.add("return");}
    if(returned||purchase||s.interest==="DECLINED")relevant.add("interest");
    if(hasOffer)relevant.add("offer");
    if(purchase){relevant.add("devices");if(reserved.length)relevant.add("delivery");if(needsNfz)relevant.add("referral");if(sold.length&&needsNfz)relevant.add("ezwm");}
    if(visit)relevant.add("visit");
    for(const id of Object.keys(flags))if(s.confirmations[id]||sold.length&&id!=="rodo")relevant.add(id);
    if(s.kind!=="SERVICE"){
      for(let index=steps.length-1;index>=0;index--)if(!relevant.has(steps[index].id))steps.splice(index,1);
      const loanStep=steps.find(step=>step.id==="loan"),returnStep=steps.find(step=>step.id==="return");
      if(loanStep)loanStep.skipped=false;
      if(returnStep){returnStep.skipped=false;returnStep.done=loans.length>0&&!activeCaseLoans.length;}
    }else if(!services.length)steps.length=0;
    const missing=steps.filter(step=>!step.done&&!step.skipped);
    const complete=steps.length>0&&missing.length===0&&openServices.length===0&&activeCaseLoans.length===0;
    const suggestions=[];
    const suggest=(id,title,detail,action="",row=null)=>suggestions.push({id,title,detail,action,row});
    if(serviceNext)suggestions.push(serviceNext);
    if(s.kind!=="SERVICE"){
      if(activeCaseLoans.length)suggest("return","Zapisz zwrot aparatów","Otwórz umowę i uzupełnij rzeczywistą datę zwrotu.","",activeCaseLoans[0]);
      else if(trial&&!loans.length)suggest("loan","Przygotuj umowę wypożyczenia","Wybierz aparaty i termin testowania.","loan");
      else if(returned&&!purchase&&s.interest!=="DECLINED")suggest("purchase","Ustal dalszą decyzję","Możesz przygotować ofertę albo przejść do zakupu.","purchase");
      if(purchase){
        const pending=missing.filter(step=>!["loan","return","interest","offer"].includes(step.id));
        const first=pending[0];
        if(first){if(first.id==="devices")suggest("devices","Dobierz aparaty dla klienta","Wybierz modele i numery seryjne do rezerwacji.","devices");
          else if(first.id==="delivery"&&devices.length)suggest("delivery","Sprzedaż i wydanie aparatów","Uzupełnij fakturę i datę odbioru w Bazie.","",devices[0]);
          else suggest(first.id,first.title,first.detail,first.action||(["referral","ezwm"].includes(first.id)?"settings":""));}
      }
      if(!purchase&&!trial&&!visit){suggest("loan","Wypożycz aparat","Przygotuj umowę na czas testowania.","loan");suggest("offer","Przygotuj ofertę","Bez obowiązku wcześniejszego wypożyczenia.","offer");suggest("purchase","Przejdź do zakupu","Dobierz aparaty dla klienta.","purchase");}
      else if(hasOffer&&!purchase&&!trial)suggest("purchase","Przejdź do zakupu","Kontynuuj na podstawie wybranej oferty.","purchase");
      if(visit?.status==="PLANNED")suggest("visit","Zaplanowana wizyta",aVisitDetail(visit,today),"visit");
    }else if(!services.length){suggest("complaint","Przyjmij reklamację","Wybierz produkt klienta i przygotuj zgłoszenie.","complaint");suggest("order","Przygotuj zamówienie","Wybierz potrzebne produkty.","order");}
    const phase=serviceNext?"Serwis w toku":activeCaseLoans.length?"Wypożyczenie w toku":s.kind==="SERVICE"?services.length?(complete?"Sprawa zakończona":"Obsługa zgłoszenia"):"Nowe zgłoszenie":purchase?sold.length?(complete?"Zakup zakończony":"Odbiór i dokumenty"):"Zakup":returned?"Po testowaniu":trial?"Wypożyczenie":hasOffer?"Oferta":visit?"Wizyta":"Wybierz czynność";
    return {state:s,steps,services,events,activeLoans,devices,missing,openServices,suggestions,phase,next:suggestions[0]||null,
      complete,done:steps.filter(step=>step.done&&!step.skipped).length,total:steps.filter(step=>!step.skipped).length};
  }
  function aVisitDetail(visit,today){return localDay(visit.starts_at)<today?"Termin minął. Potwierdź odbycie albo zmień datę.":"Otwórz szczegóły lub zmień termin wizyty.";}
  function create(a){
    const host=a.host,doc=a.document;if(!host)return null;
    let context=null,state=null,saved=null,revision=null,events=[],cases=[],manual=new Set(),caseSupport=false,loading=false,busy=false,dirty=false,available=false,hasStorage=false,generation=0,operation=null,reservationAttempt=null,notice=null;
    const node=(tag,text,cls)=>{const n=doc.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
    const allowed=()=>a.allowed()&&context;
    function button(label,action,cls="reset-filters-btn"){const b=node("button",label,cls);b.type="button";b.disabled=busy||Boolean(a.readOnly);b.addEventListener("click",()=>{if(allowed()&&!busy&&!a.readOnly)action();});return b;}
    function message(text,error=false){notice={text,error};const p=host.querySelector('[data-journey-message]');if(p){p.textContent=text;p.dataset.error=String(error);}}
    const editable=()=>allowed()&&available&&!busy&&!a.readOnly;
    function change(){if(!editable())return;dirty=true;operation=null;reservationAttempt=null;render();}
    function selectField(label,value,options,action){
      const box=node("label"),select=node("select");box.append(node("span",label),select);
      for(const [id,title]of options){const option=node("option",title);option.value=id;select.append(option);}select.value=String(value);select.disabled=busy||!available;
      select.addEventListener("change",()=>{if(!editable())return;action(select.value);change();});return box;
    }
    function go(kind){if(dirty){message("Zapisz przebieg przed otwarciem formularza lub wizyty.",true);return;}if(allowed()&&!busy&&a.canNavigate()){
      if(kind==="visit"||kind==="newVisit")a.visit(kind==="visit"?state.visit_id:"");else if(a.beforeNavigate?.()!==false)a.openForm(kind,context.profile,{device_ids:[...state.device_ids],case_id:state.case_id||""});}}
    function openSource(row){if(dirty){message("Zapisz przebieg przed otwarciem dokumentu źródłowego.",true);return;}if(allowed()&&!busy&&a.canNavigate()&&a.beforeNavigate?.()!==false)row.open();}
    function choose(kind){
      if(kind==="purchase"){if(!editable())return;state.kind="PURCHASE";state.interest="INTERESTED";change();return;}
      if(kind==="devices"||kind==="settings"){const section=host.querySelector(kind==="devices"?".client-journey-devices":".client-journey-options");if(section){section.open=true;section.scrollIntoView?.({block:"nearest",behavior:"smooth"});}return;}
      if(flags[kind]){manual.add(kind);render();return;}
      go(kind);
    }
    function render(){
      if(!allowed()){host.replaceChildren();host.hidden=true;return;}
      const opened=new Set([...host.querySelectorAll("details[open]")].map(section=>section.className));
      host.hidden=false;host.dataset.kind=state.kind;host.replaceChildren();
      const plan=build(context,state,a.today(),[...manual]),header=node("header",undefined,"clients-section-heading");
      const title=node("h3","Bieżąca sprawa"),summary=node("span",plan.phase,"client-journey-summary");summary.dataset.complete=String(plan.complete);header.append(title,summary);host.append(header);
      const status=node("p",loading?"Wczytywanie etapów…":"", "clients-hint");status.dataset.journeyMessage="";status.setAttribute("role","status");host.append(status);
      if(!hasStorage&&!loading){status.textContent="Zapis etapów wymaga uruchomienia supabase-client-journey.sql. Dokumenty źródłowe pozostają dostępne.";status.dataset.error="true";}
      if(context.profile.archived||saved?.archived)host.append(node("p",context.profile.archived?"Karta zarchiwizowana — przebieg tylko do odczytu.":"Poprzednia sprawa — tylko do odczytu. Bieżącą wybierzesz z listy.","clients-hint"));
      if(plan.suggestions.length){const suggested=node("div",undefined,"client-journey-suggestions");suggested.append(node("h4",plan.suggestions.length===1?"Następna czynność":"Proponowane czynności"));for(const item of plan.suggestions.slice(0,3)){const row=node("div",undefined,"client-journey-suggestion");row.append(button(item.title,()=>item.row?openSource(item.row):choose(item.action||item.id)),node("span",item.detail));suggested.append(row);}host.append(suggested);}
      if(plan.activeLoans.length)host.append(node("p",`Do sprawdzenia: ${plan.activeLoans.length} wypożyczeń — brak zakończenia umowy lub aktywny wpis w Demo.`,"client-journey-warning"));
      if(plan.devices.length){const assigned=node("div",undefined,"client-journey-assigned");assigned.append(node("strong","Aparaty tej sprawy"));for(const item of plan.devices)assigned.append(button(`${item.model} · ${item.serial}`,()=>openSource(item)));host.append(assigned);}
      const visit=(context.activities||[]).find(item=>item.id===state.visit_id&&item.status==="PLANNED");
      if(visit)host.append(node("p",`Najbliższa wizyta: ${a.dateTime(visit.starts_at)} · ${visit.location||context.profile.location}`,"clients-hint"));
      if(cases.length){const label=node("label",undefined,"client-journey-case-picker"),select=node("select");label.append(node("span","Sprawa klienta"),select);select.disabled=busy||loading;
        const selectedCase=state.case_id||saved?.case_id||"";
        if(!cases.some(item=>item.case_id===selectedCase)){const pending=node("option","Nowa sprawa · niezapisana");pending.value=selectedCase;select.append(pending);}
        for(const item of cases){const date=item.started_on||item.data?.started_on||"";const option=node("option",`${a.date?.(date)||date} · ${(item.kind||item.data?.kind)==="SERVICE"?"Serwis / zamówienie":"Testowanie i zakup"}${item.archived?" · poprzednia":" · bieżąca"} · ${String(item.case_id).slice(0,8)}`);option.value=item.case_id;select.append(option);}select.value=selectedCase;
        select.addEventListener("change",()=>{if(busy||dirty&&!a.confirm("Porzucić niezapisane zmiany przebiegu?")){select.value=selectedCase;return;}void switchCase(select.value);});host.append(label);}
      const settingsDetails=node("details",undefined,"client-journey-options");settingsDetails.append(node("summary","Ustawienia i dokumenty sprawy"));
      const settings=node("div",undefined,"client-journey-settings");
      settings.append(selectField("Rodzaj bieżącej sprawy",state.kind,[["PURCHASE","Testowanie i zakup"],["SERVICE","Serwis / reklamacja / zamówienie"]],v=>state.kind=v));
      const start=node("label"),date=node("input");start.append(node("span","Początek bieżącej sprawy"),date);date.type="text";date.dataset.datePicker="";date.placeholder="DD.MM.RRRR";a.setDate(date,state.started_on);date.disabled=busy||!available;
      date.addEventListener("change",()=>{if(!editable())return;const value=a.iso(date.value);if(!value){date.setCustomValidity("Wybierz prawidłową datę.");return;}date.setCustomValidity("");state.started_on=value;change();});a.bindDate?.(date);settings.append(start);
      settings.append(selectField("Decyzja klienta",state.interest,[["UNKNOWN","Do ustalenia"],["INTERESTED","Zainteresowany zakupem"],["DECLINED","Rezygnacja z zakupu"]],v=>state.interest=v),
        selectField("Zlecenie NFZ",state.referral,[["UNKNOWN","Do ustalenia"],["REQUESTED","Do uzyskania / w toku"],["READY","Zlecenie gotowe"],["WITHOUT_REFUND","Bez refundacji"]],v=>state.referral=v),
        selectField("Liczba aparatów",state.devices_required,[["1","1 aparat"],["2","2 aparaty"]],v=>state.devices_required=Number(v)),
        selectField("Testowanie",String(state.trial_required),[["false","Bez testowania"],["true","Z wypożyczeniem"]],v=>state.trial_required=v==="true"));
      const visits=(context.activities||[]).filter(row=>row.kind==="VISIT"&&localDay(row.starts_at)>=state.started_on);
      settings.append(selectField("Wizyta tej sprawy",state.visit_id,[["","Wybierz / umów wizytę"],...visits.map(row=>[row.id,`${a.dateTime(row.starts_at)} · ${row.title} · ${visitLabels[row.status]||row.status}`])],v=>state.visit_id=v));settingsDetails.append(settings);
      if(state.case_id){const documents=node("div",undefined,"client-journey-source-list");documents.append(node("strong","Dokumenty należące do tej sprawy"));
        const sources=confirmedRows(context).filter(row=>row.type!=="device").sort((a,b)=>String(b.date).localeCompare(String(a.date)));
        for(const item of sources){const label=node("label"),check=node("input");check.type="checkbox";check.checked=state.source_keys.includes(key(item));check.disabled=busy||!available;check.setAttribute("aria-label",`Dokument sprawy: ${item.kind||item.type} ${item.number||item.id}`);
          check.addEventListener("change",()=>{if(!editable())return;state.source_keys=state.source_keys.filter(value=>value!==key(item));if(check.checked)state.source_keys.push(key(item));change();});label.append(check,node("span",[item.date,item.kind,item.number,item.model].filter(Boolean).join(" · ")));documents.append(label);}
        if(!sources.length)documents.append(node("p","Najpierw potwierdź dokumenty tej osoby w sekcji Dokumenty do potwierdzenia.","clients-hint"));settingsDetails.append(documents);}
      host.append(settingsDetails);
      const chain=node("ol",undefined,"client-journey-chain"),completed=node("details",undefined,"client-journey-completed"),doneChain=node("ol",undefined,"client-journey-chain");completed.append(node("summary",`Wykonane czynności · ${plan.steps.filter(step=>step.done||step.skipped).length}`),doneChain);
      for(const step of plan.steps){const row=node("li");row.dataset.done=String(step.done);row.dataset.skipped=String(step.skipped);const content=node("div");content.append(node("strong",step.title),node("small",`${step.detail}${step.date?` · ${a.dateTime(step.date)}`:""}`));
        row.append(node("span",step.skipped?"—":step.done?"✓":"○","client-journey-mark"),content);
        if(flags[step.id]){const label=node("label",undefined,"client-journey-check"),check=node("input");check.type="checkbox";check.checked=state.confirmations[step.id];check.disabled=busy||!available;check.setAttribute("aria-label",flags[step.id]);check.addEventListener("change",()=>{if(!editable())return;state.confirmations[step.id]=check.checked;change();});label.append(check,node("span","Potwierdź"));row.append(label);}
        if(step.action)row.append(button("Otwórz",()=>go(step.action)));(step.done||step.skipped?doneChain:chain).append(row);
      }if(plan.missing.length)host.append(chain);if(plan.steps.some(step=>step.done||step.skipped))host.append(completed);
      const devices=node("details",undefined,"client-journey-devices");devices.append(node("summary",`Aparaty dla klienta · ${state.device_ids.length} wybrane`));
      const search=node("input");search.type="search";search.placeholder="Szukaj modelu lub numeru seryjnego";search.setAttribute("aria-label","Wybierz aparaty do rezerwacji");devices.append(search);
      const deviceList=node("div",undefined,"client-journey-device-list");devices.append(deviceList);
      function renderDevices(){deviceList.replaceChildren();const terms=clean(search.value).split(" ").filter(Boolean),items=a.devices(context.profile,context.links).filter(item=>terms.every(term=>clean(`${item.model} ${item.serial} ${item.location}`).includes(term)));
        for(const item of items.slice(0,40)){const label=node("label"),check=node("input");check.type="checkbox";check.checked=state.device_ids.includes(String(item.id));check.disabled=busy||!available;check.addEventListener("change",()=>{if(!editable())return;const ids=state.device_ids.filter(id=>id!==String(item.id));if(check.checked)ids.push(String(item.id));if(ids.length>state.devices_required){check.checked=false;message(`Wybierz maksymalnie ${state.devices_required} aparaty.`,true);return;}state.device_ids=ids;dirty=true;operation=null;renderDevices();devices.querySelector("summary").textContent=`Aparaty dla klienta · ${ids.length} wybrane`;updateSave();});
          label.append(check,node("span",`${item.model} · ${item.serial} · ${item.location} · ${item.type}`));deviceList.append(label);}
        if(!items.length)deviceList.append(node("p","Brak dostępnych aparatów dla wybranego wyszukiwania."));if(items.length>40)deviceList.append(node("small","Doprecyzuj wyszukiwanie — pokazano pierwsze 40 pozycji."));}
      search.addEventListener("input",renderDevices);renderDevices();
      const reserveButton=button("Przypisz / zarezerwuj wybrane",()=>void reserve());reserveButton.dataset.journeyReserve="";devices.append(reserveButton);host.append(devices);
      const allActions=node("details",undefined,"client-journey-all-actions");allActions.append(node("summary","Wszystkie czynności"));
      const forms=node("div",undefined,"clients-actions client-journey-forms");for(const [kind,label]of [["offer","Oferta"],["loan","Umowa wypożyczenia"],["purchase","Zakup"],["rodo","RODO"],["receipt","Odbiór"],["care","Pielęgnacja"],["order","Zamówienie"],["complaint","Reklamacja"],["newVisit","Umów wizytę"]])forms.append(button(label,()=>kind==="purchase"?choose(kind):go(kind)));allActions.append(forms);
      const confirmations=node("div",undefined,"clients-actions");for(const [id,label]of Object.entries(flags))confirmations.append(button(label,()=>choose(id)));allActions.append(node("h4","Potwierdzenia dokumentów"),confirmations,node("p","Potwierdzaj po podpisaniu lub przekazaniu. Sam wydruk nie potwierdza wykonania czynności.","clients-hint"));host.append(allActions);
      const actions=node("div",undefined,"clients-actions client-journey-actions");const save=button("Zapisz przebieg",()=>void saveState(),"primary");save.dataset.journeySave="";const newCase=button("Nowa sprawa",()=>{if(!editable()||!caseSupport||!a.confirm("Rozpocząć odrębną sprawę? Poprzednia pozostanie dostępna na liście spraw. Niezapisane zmiany zostaną pominięte."))return;state=normalize({case_id:a.id(),source_keys:[]},a.today());revision=null;saved=null;events=[];manual.clear();change();});newCase.disabled=busy||!available||!caseSupport;newCase.title=caseSupport?"Odrębny zakup, testowanie lub serwis":"Wymaga supabase-clients-audit.sql";actions.append(save,newCase);host.append(actions);
      if(plan.services.length){host.append(node("h4","Serwis, zamówienia i reklamacje"));for(const item of plan.services){const row=node("article",undefined,"client-journey-service");row.dataset.closed=String(item.closed);row.append(node("strong",[item.row.kind,item.row.number,item.row.model].filter(Boolean).join(" · ")));
        if(item.missingService)row.append(node("p","Brak powiązanego wpisu w Serwisie — sprawdź zapis formularza.","client-journey-warning"));
        else for(const stage of item.steps)row.append(node("span",`${stage.date?"✓":"○"} ${stage.label}${stage.date?` · ${a.dateTime(stage.date)}`:""}`));
        row.append(button("Otwórz sprawę",()=>openSource(item.row)));host.append(row);}}
      const timeline=node("details",undefined,"client-journey-events");timeline.append(node("summary","Zmiany etapów sprawy"));const list=node("ol");for(const event of historyEvents(events,state).sort((a,b)=>String(b.date).localeCompare(String(a.date)))){const li=node("li");li.append(node("time",a.dateTime(event.date)),node("strong",event.label),node("span",event.model||""));list.append(li);}timeline.append(list);host.append(timeline);
      if(events.length){const history=node("details");history.append(node("summary","Historia zapisanych etapów"));for(const event of events)history.append(node("p",`${a.dateTime(event.created_at)} · ${event.actor_email||"SATIS"} · ${event.data.started_on} · ${{UNKNOWN:"Decyzja do ustalenia",INTERESTED:"Zainteresowany zakupem",DECLINED:"Rezygnacja z zakupu"}[event.data.interest]} · ${{UNKNOWN:"Zlecenie do ustalenia",REQUESTED:"Zlecenie w toku",READY:"Zlecenie gotowe",WITHOUT_REFUND:"Bez refundacji"}[event.data.referral]}`));host.append(history);}
      for(const section of host.querySelectorAll("details"))if(section.className&&opened.has(section.className))section.open=true;
      if(notice){const current=notice;message(current.text,current.error);}updateSave();
    }
    function updateSave(){const b=host.querySelector('[data-journey-save]');if(b){b.disabled=busy||!available||!dirty;b.classList.toggle("client-journey-unsaved",dirty);b.textContent=busy?"Zapisywanie…":"Zapisz przebieg";}const reserve=host.querySelector('[data-journey-reserve]');if(reserve){reserve.disabled=busy||!available||!caseSupport||!state.device_ids.length;if(!caseSupport)reserve.title="Bezpieczna rezerwacja wymaga supabase-clients-audit.sql";}}
    async function saveState(){
      if(!allowed()||!available||busy||!dirty)return;
      if(state.device_ids.length>state.devices_required){message("Liczba wybranych aparatów przekracza ustawioną liczbę.",true);return;}
      const epoch=generation,profileId=context.profile.id,payload=normalize(state,a.today());operation=operation||a.id();notice=null;busy=true;render();
      try{const data=await a.rpc("satis_client_journey_write",{p_customer_id:profileId,p_request_id:operation,p_expected_revision:revision,p_data:payload});
        if(epoch!==generation||!allowed())return;saved=data.journey;revision=saved.revision;state=normalize(saved.data,a.today());dirty=false;operation=null;await read(epoch,state.case_id);a.changed?.();
      }catch(error){if(epoch===generation&&allowed())message(error.code==="PT409"?"Etapy zmieniły się na innym komputerze. Odśwież kartę przed zapisem.":error.message,true);}
      finally{if(epoch===generation&&allowed()){busy=false;render();}}
    }
    async function reserve(){
      if(!allowed()||!available||busy||!caseSupport||!state.device_ids.length||!a.canNavigate())return;
      if(state.device_ids.length!==state.devices_required){message("Wybierz właściwą liczbę aparatów.",true);return;}
      if(!a.confirm(`Zarezerwować ${state.device_ids.length} aparaty dla ${context.profile.full_name}? Stan magazynowy zostanie zmieniony.`))return;
      const epoch=generation;operation=operation||a.id();reservationAttempt=reservationAttempt||{state:normalize(state,a.today()),revision,requestId:operation};busy=true;render();
      try{const result=await a.reserve(context.profile,[...state.device_ids],reservationAttempt);if(epoch!==generation||!allowed())return;
        context=a.context();saved=result.journey;revision=saved.revision;state=normalize(saved.data,a.today());dirty=false;operation=null;await read(epoch,state.case_id);a.changed?.();message("Aparaty, powiązania i przebieg zapisano razem.");}
      catch(error){if(epoch===generation&&allowed())message(error.message,true);}
      finally{if(epoch===generation&&allowed()){busy=false;render();}}
    }
    async function read(epoch,caseId){const data=await a.rpc(caseId?"satis_client_journey_case_read":"satis_client_journey_read",{p_customer_id:context.profile.id,...(caseId?{p_case_id:caseId}:{})});if(epoch!==generation||!allowed())return;
      caseSupport=data.case_support===true;cases=data.cases||[];saved=data.journey;revision=saved?.revision??null;
      state=saved?normalize(saved.data,a.today()):caseSupport?normalize({case_id:a.id(),source_keys:[]},a.today()):initialState(context,a.today());events=data.events||[];hasStorage=true;available=!context.profile.archived&&!saved?.archived&&!a.readOnly;loading=false;render();}
    async function switchCase(caseId){if(!allowed()||busy||!caseSupport)return;const epoch=generation;busy=true;loading=true;notice=null;render();
      try{await read(epoch,caseId);manual.clear();dirty=false;operation=null;}catch(error){if(epoch===generation&&allowed()){loading=false;message(error.message,true);}}
      finally{if(epoch===generation&&allowed()){busy=false;render();}}}
    async function show(value){generation++;context=value;state=initialState(value,a.today());saved=null;revision=null;events=[];manual=new Set();dirty=false;busy=false;operation=null;available=false;hasStorage=false;loading=true;notice=null;render();const epoch=generation;
      try{await read(epoch);}catch(error){if(epoch===generation&&allowed()){loading=false;
        if(!/PGRST202|42883|42P01/.test(error.code||""))notice={text:"Nie udało się wczytać etapów. Odśwież kartę przed zapisem; dokumenty źródłowe pozostały bez zmian.",error:true};render();}}}
    function refresh(value){if(!allowed()||context.profile.id!==value?.profile.id)return;context=value;if(!busy)render();}
    function clear(){generation++;context=null;state=null;saved=null;events=[];cases=[];manual.clear();caseSupport=false;dirty=false;busy=false;available=false;operation=null;reservationAttempt=null;host.replaceChildren();host.hidden=true;}
    return {show,refresh,clear,dirty:()=>dirty,busy:()=>busy,ready:()=>available};
  }
  return {flags,normalize,confirmedRows,initialState,build,historyEvents,demoSnapshots,createDemo,create};
});
