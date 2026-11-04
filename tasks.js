(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.SatisTasks=api;})(typeof window==="undefined"?null:window,function(){
  "use strict";
  const statuses={TODO:"Do zrobienia",IN_PROGRESS:"W trakcie",DONE:"Zakończone"};
  function validate(data){
    if(!data||!["title","note","assignee","due","place","status"].every(key=>typeof data[key]==="string")||typeof data.important!=="boolean")return "Sprawdź dane sprawy.";
    if(!data.title||data.title.length>160)return "Wpisz temat sprawy (do 160 znaków).";
    if(data.note.length>4000||data.assignee.length>100)return "Skróć notatkę lub nazwę osoby odpowiedzialnej.";
    if(!["ALL","T12","P50","P63"].includes(data.place)||!statuses[data.status])return "Wybierz miejsce i etap sprawy.";
    if(data.due&&!/^\d{4}-\d{2}-\d{2}$/u.test(data.due))return "Wybierz prawidłowy termin.";
    return "";
  }
  function create(a){
    const d=a.document,host=d.getElementById("tasksNotebook");
    let epoch=0,requestSequence=0,busy=false,dirty=false,editing=null,rows=[],offset=0,total=0,stage="ACTIVE",place="",request=null,searchTimer;
    const node=(tag,cls,text)=>{const n=d.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
    const authorized=()=>Boolean(a.user());
    const message=node("p","tasks-message");message.setAttribute("role","status");message.setAttribute("aria-live","polite");
    const button=(text,action,cls="reset-filters-btn")=>{const n=node("button",cls,text);n.type="button";n.addEventListener("click",()=>{if(authorized()&&!busy)return action();});return n;};
    const form=node("form","tasks-form"),formTitle=node("h2","","Nowa sprawa"),fields={};
    const field=(key,label,tag="input")=>{const wrap=node("label","tasks-field"),input=node(tag);input.id=`task-${key}`;input.autocomplete="off";wrap.append(node("span","",label),input);fields[key]=input;form.append(wrap);return input;};
    form.append(formTitle);
    field("title","Temat").maxLength=160;fields.title.required=true;
    field("note","Ustalenia / notatka","textarea").maxLength=4000;fields.note.rows=3;
    field("place","Miejsce","select");for(const value of ["T12","P63","P50","ALL"]){const o=node("option","",value==="ALL"?"Wszystkie":value);o.value=value;fields.place.append(o);}
    field("assignee","Osoba odpowiedzialna (opcjonalnie)").maxLength=100;
    const people=node("datalist");people.id="task-people";fields.assignee.setAttribute("list",people.id);form.append(people);
    field("due","Termin (opcjonalnie)").setAttribute("data-date-picker","");a.bindDate(fields.due);
    field("status","Etap","select");for(const [key,label]of Object.entries(statuses)){const o=node("option","",label);o.value=key;fields.status.append(o);}
    const priority=node("label","tasks-important"),important=node("input");important.type="checkbox";important.id="task-important";priority.append(important,node("span","","Ważne"));form.append(priority);
    const save=node("button","tasks-save","Dodaj sprawę");save.type="submit";
    const cancel=button("Nowa sprawa",()=>{if(!dirty||a.confirm("Porzucić niezapisane zmiany?"))reset();});
    const actions=node("div","tasks-actions");actions.append(cancel,save);form.append(actions);
    const privacy=node("p","document-form-note","Nie wpisuj PESEL-u, adresów ani wyników badań. Sprawy są wspólne dla zalogowanych pracowników.");
    const filters=node("div","tasks-filters"),search=node("input");search.type="search";search.placeholder="Szukaj tematu, ustaleń lub osoby…";search.maxLength=160;search.autocomplete="off";search.setAttribute("aria-label","Szukaj spraw");
    const stages=node("div","tasks-tiles"),places=node("div","tasks-tiles");stages.setAttribute("role","group");stages.setAttribute("aria-label","Etap sprawy");places.setAttribute("role","group");places.setAttribute("aria-label","Miejsce sprawy");
    const stageButtons=[],placeButtons=[];
    for(const [key,label]of Object.entries({ACTIVE:"Aktywne",...statuses,ALL:"Wszystkie"})){const b=button(label,()=>{stage=key;offset=0;return refresh();},"pcpr-tab");b.dataset.stage=key;stages.append(b);stageButtons.push(b);}
    for(const [key,label]of [["","Wszystkie miejsca"],["T12","T12"],["P63","P63"],["P50","P50"],["ALL","Wspólne"]]){const b=button(label,()=>{place=key;offset=0;return refresh();},"pcpr-tab");if(["T12","P50","P63"].includes(key))b.dataset.locationTone=key;places.append(b);placeButtons.push([key,b]);}
    filters.append(search,stages,places,button("Odśwież",()=>refresh()));
    const count=node("p","document-form-note"),list=node("div","tasks-list"),paging=node("div","tasks-actions");
    const previous=button("Poprzednie",()=>{offset=Math.max(0,offset-50);return refresh();}),next=button("Następne",()=>{offset+=50;return refresh();});paging.append(previous,next);
    host.replaceChildren(form,privacy,message,filters,count,list,paging);
    const report=error=>{message.textContent=error.message||"Nie udało się połączyć. Wpisane dane pozostały w formularzu.";};
    function lock(value){busy=value;host.setAttribute("aria-busy",String(value));for(const control of host.querySelectorAll("input,textarea,select,button"))control.disabled=value;if(!value){previous.disabled=offset===0;next.disabled=offset+rows.length>=total;}}
    async function rpc(name,args){const user=a.user(),version=epoch;const result=await a.rpc(name,args);if(!authorized()||user!==a.user()||version!==epoch)throw new Error("Sesja zakończona.");if(result.error){const code=result.error.code;throw new Error(["PGRST202","42P01","42883"].includes(code)?"Uruchom supabase-tasks.sql w SQL Editorze Supabase, a następnie kliknij Odśwież.":code==="PT409"?"Sprawa została zmieniona na innym komputerze. Wczytaj ją ponownie; Twoje wpisane dane pozostają w formularzu.":code==="42501"?"Brak uprawnień do tej operacji.":"Baza nie potwierdziła operacji. Sprawdź połączenie i ponów próbę.");}return result.data;}
    function snapshot(){return {title:fields.title.value.trim(),note:fields.note.value.trim(),place:fields.place.value,assignee:fields.assignee.value.trim(),due:fields.due.value.trim()?a.iso(fields.due.value)||"INVALID":"",status:fields.status.value,important:important.checked};}
    function reset(){editing=null;request=null;dirty=false;for(const input of Object.values(fields))input.value="";fields.place.value=a.station()||"P63";fields.status.value="TODO";important.checked=false;formTitle.textContent="Nowa sprawa";save.textContent="Dodaj sprawę";save.classList.remove("tasks-dirty");a.location(fields.place);}
    function render(){
      stageButtons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.stage===stage)));placeButtons.forEach(([key,b])=>b.setAttribute("aria-pressed",String(key===place)));
      count.textContent=`${total} spraw · ${total?offset+1:0}–${Math.min(offset+rows.length,total)}`;list.replaceChildren();
      if(!rows.length)list.append(node("p","document-form-note","Brak spraw dla wybranych filtrów."));
      for(const row of rows){
        const item=node("article","tasks-item"),data=row.data;item.dataset.status=data.status;
        const body=node("div","tasks-item-body"),heading=node("div","tasks-item-heading");heading.append(node("strong","",data.title));
        if(data.important)heading.append(node("span","tasks-priority","Ważne"));
        const badge=node("span","pcpr-place-badge",data.place==="ALL"?"Wszystkie":data.place);badge.dataset.locationTone=data.place;heading.append(badge,node("span","tasks-status",statuses[data.status]));body.append(heading);
        if(data.note)body.append(node("p","tasks-note",data.note));
        if(data.due){const due=node("span","tasks-due",`Termin: ${a.date(data.due)}`);due.dataset.overdue=String(data.status!=="DONE"&&data.due<a.today());body.append(due);}
        body.append(node("small","tasks-meta",[data.assignee?`Odpowiada: ${data.assignee}`:"",`Dodano: ${a.dateTime(row.created_at)} · ${row.created_by}`,`Zmieniono: ${a.dateTime(row.updated_at)} · ${row.updated_by}`].filter(Boolean).join(" · ")));
        const tools=node("div","tasks-actions");tools.append(button("Edytuj",()=>edit(row)),button(data.status==="DONE"?"Otwórz ponownie":"Zakończ",()=>complete(row)),button("Historia",()=>history(row,item)));
        if(a.owner())tools.append(button("Usuń",()=>remove(row),"reset-filters-btn tasks-delete"));item.append(body,tools);list.append(item);
      }
      previous.disabled=busy||offset===0;next.disabled=busy||offset+rows.length>=total;
    }
    async function refresh(){if(!authorized()||busy)return;const version=epoch,sequence=++requestSequence;message.textContent="Wczytywanie spraw…";try{const result=await rpc("satis_tasks_list",{p_query:search.value.trim(),p_status:stage,p_place:place,p_offset:offset});if(version!==epoch||sequence!==requestSequence)return;rows=result.rows;total=result.total;if(offset>=total&&offset>0){offset=0;return refresh();}render();message.textContent="";}catch(error){if(version===epoch&&sequence===requestSequence)report(error);}}
    async function detail(row){const result=await rpc("satis_task_detail",{p_id:row.id});if(!result.task)throw new Error("Sprawa została usunięta. Odśwież listę.");return result;}
    async function edit(row){if(dirty&&!a.confirm("Porzucić niezapisane zmiany?"))return;const version=epoch;lock(true);try{const result=await detail(row);editing=result.task;for(const key of Object.keys(fields))fields[key].value=key==="due"?a.displayDate(editing.data[key]):editing.data[key];important.checked=editing.data.important;dirty=false;request=null;save.classList.remove("tasks-dirty");save.textContent="Zapisz";formTitle.textContent="Edycja sprawy";a.location(fields.place);fields.title.focus();}catch(error){if(version===epoch)report(error);}finally{if(version===epoch)lock(false);}}
    async function write(action,row,data){const payload={p_action:action,p_id:row?.id||a.id(),p_revision:row?.revision??null,p_data:data};if(!row&&request?.payload.p_action===action)payload.p_id=request.payload.p_id;const fingerprint=JSON.stringify(payload);if(request?.fingerprint!==fingerprint)request={fingerprint,id:a.id(),payload};return rpc("satis_task_write",{p_request_id:request.id,...request.payload});}
    async function saveTask(){if(!authorized()||busy)return;const data=snapshot(),error=validate(data);if(error){message.textContent=error;return;}const version=epoch;lock(true);try{await write("SAVE",editing,data);if(version!==epoch)return;reset();message.textContent="Zapisano sprawę.";}catch(error){if(version===epoch)report(error);return;}finally{if(version===epoch)lock(false);}if(version===epoch)await refresh();}
    async function complete(row){if(dirty){message.textContent="Najpierw zapisz lub anuluj edycję.";return;}const version=epoch;lock(true);try{const current=(await detail(row)).task;if(current.revision!==row.revision)throw new Error("Sprawa uległa zmianie. Odśwież listę przed zmianą etapu.");await write("SAVE",current,{...current.data,status:current.data.status==="DONE"?"TODO":"DONE"});request=null;if(editing?.id===row.id)reset();}catch(error){if(version===epoch)report(error);return;}finally{if(version===epoch)lock(false);}if(version===epoch)await refresh();}
    async function remove(row){if(dirty){message.textContent="Najpierw zapisz lub anuluj edycję.";return;}if(!a.owner()||!a.confirm("Trwale usunąć sprawę? Historia operacji zostanie zachowana."))return;const version=epoch;lock(true);try{await write("DELETE",row,{});request=null;if(editing?.id===row.id)reset();}catch(error){if(version===epoch)report(error);return;}finally{if(version===epoch)lock(false);}if(version===epoch)await refresh();}
    async function history(row,item){const existing=item.querySelector(".tasks-history");if(existing){existing.remove();return;}const version=epoch,panel=node("div","tasks-history","Wczytywanie historii…");item.append(panel);try{const result=await detail(row);if(version!==epoch)return;panel.textContent="";for(const event of result.history){const entry=node("div");entry.append(node("strong","",`${a.dateTime(event.at)} · ${event.actor} · ${event.action==="CREATE"?"Utworzono":"Zmieniono"}`));for(const [key,label]of Object.entries({title:"Temat",note:"Ustalenia",status:"Etap",place:"Miejsce",assignee:"Osoba",due:"Termin",important:"Ważne"}))if(event.before?.[key]!==event.after?.[key])entry.append(node("p","",`${label}: ${String(event.before?.[key]??"—")} → ${String(event.after?.[key]??"—")}`));panel.append(entry);}}catch(error){panel.remove();if(version===epoch)report(error);}}
    form.addEventListener("submit",event=>{event.preventDefault();void saveTask();});
    for(const type of ["input","change"])form.addEventListener(type,event=>{if(!authorized()||busy||event.target?.type==="button")return;dirty=true;save.classList.add("tasks-dirty");a.location(fields.place);});
    search.addEventListener("input",()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{offset=0;void refresh();},250);});
    reset();
    return {open(){people.replaceChildren(...[...new Set(a.people())].map(name=>{const o=node("option");o.value=name;return o;}));return refresh();},clear(){epoch++;requestSequence++;clearTimeout(searchTimer);rows=[];total=0;offset=0;stage="ACTIVE";place="";search.value="";busy=false;reset();people.replaceChildren();list.replaceChildren();count.textContent="";message.textContent="";host.hidden=true;lock(false);},dirty:()=>dirty};
  }
  return {create,validate,statuses};
});
