(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.SatisVacationAttendance=api;})(typeof window==="undefined"?null:window,function(){
  "use strict";
  const monthNames=["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];
  const weekdays=["Niedziela","Poniedziałek","Wtorek","Środa","Czwartek","Piątek","Sobota"];
  function normalizeSchedule(value){
    if(!value||typeof value!=="object"||Array.isArray(value))return null;
    const result={};
    for(let day=0;day<=6;day++){
      const pair=value[day];
      if(Array.isArray(pair)&&pair.length===2&&pair.every(time=>/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(String(time)))&&pair[0]<pair[1])result[day]=[...pair];
    }
    return result;
  }
  function build({year,month,employee,requests=[],holiday=()=>null,sick=()=>false}){
    if(!Number.isInteger(year)||year<2025||year>2030||!Number.isInteger(month)||month<1||month>12||!employee?.id)return null;
    const schedule=normalizeSchedule(employee.attendanceSchedule);
    const days=new Date(Date.UTC(year,month,0)).getUTCDate();
    const relevant=requests.filter(r=>r.employeeId===employee.id&&r.status==="ZATWIERDZONY"&&!r.ownerLeave);
    const rows=Array.from({length:days},(_,index)=>{
      const day=index+1,date=`${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`,weekday=new Date(Date.UTC(year,month-1,day)).getUTCDay();
      const feast=holiday(date),weekend=weekday===0||weekday===6;
      let start="",end="",note=feast?"Święto":weekend?"Dzień wolny":"";
      const plan=schedule&&!weekend&&!feast?schedule[weekday]:null;
      const sickAbsence=relevant.find(r=>(!r.redacted||r.attendanceSickLeave===true)&&r.dateFrom<=date&&r.dateTo>=date&&sick(r));
      const absence=!weekend&&!feast&&(!schedule||plan)?relevant.find(r=>r.dateFrom<=date&&r.dateTo>=date&&!['NADGODZINY','WCZEŚNIEJSZE WYJŚCIE','TERMIN GODZINOWY'].includes(r.type)):null;
      const partial=!weekend&&!feast&&(!schedule||plan)?relevant.find(r=>r.dateFrom<=date&&r.dateTo>=date&&r.type==='WCZEŚNIEJSZE WYJŚCIE'):null;
      if(sickAbsence)note="L4 - chorobowe";
      else if(absence)note=Number(absence.hours)>0?"Nieobecność godzinowa":({WYPOCZYNKOWY:"Urlop wypoczynkowy","NA ŻĄDANIE":"Urlop na żądanie","ZA SOBOTĘ":"Wolne za sobotę","ZA WEEKEND":"Wolne za weekend"}[absence.type]||"Nieobecność");
      else if(partial)note="Wcześniejsze wyjście";
      else if(plan)[start,end]=plan;
      else if(schedule&&!weekend&&!feast)note="Wolne wg grafiku";
      return {date,day,weekday:weekdays[weekday],weekend,holiday:feast?.name||"",shaded:weekend||Boolean(feast),start,end,note};
    });
    return {title:`Lista obecności · ${monthNames[month-1]} ${year}`,employee:employee.name,year,month,scheduled:Boolean(schedule),rows};
  }
  function create(a){
    const d=a.document,host=d.getElementById("vacationAttendance"),node=(tag,cls,text)=>{const n=d.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
    const summary=node("summary","","Lista obecności · wydruk miesięczny"),tools=node("div","attendance-tools"),label=node("label"),select=node("select");
    select.id="vacationAttendanceMonth";select.setAttribute("aria-label","Miesiąc listy obecności");
    monthNames.forEach((name,index)=>{const option=node("option","",name);option.value=String(index+1);select.append(option);});
    select.value=String(a.month());label.append(node("span","","Miesiąc"),select);
    const print=node("button","reset-filters-btn","Drukuj / PDF");print.type="button";tools.append(label,print);
    const notice=node("p","document-form-note","Godziny są wpisane według grafiku, nie stanowią potwierdzenia obecności. Obecność potwierdza podpis pracownika."),body=node("div","attendance-preview");
    host.replaceChildren(summary,tools,notice,body);
    let model=null,printing=false,printNode=null,cleanup=null;
    function sheet(data){
      const page=node("article","attendance-sheet");page.append(node("h2","",data.title),node("p","attendance-person",`Imię i nazwisko: ${data.employee}`));
      const table=node("table","attendance-table"),head=node("thead"),tr=node("tr");
      ["Data","Dzień","Od","Do","Podpis pracownika","Uwagi"].forEach(text=>tr.append(node("th","",text)));head.append(tr);
      const tbody=node("tbody");
      data.rows.forEach(row=>{const tr=node("tr");if(row.shaded)tr.className="attendance-day-off";if(row.holiday)tr.title=row.holiday;
        [row.date.split('-').reverse().join('.'),row.weekday,row.start,row.end,"",row.note].forEach(text=>tr.append(node("td","",text)));tbody.append(tr);
      });table.append(head,tbody);page.append(table);
      const holidays=data.rows.filter(row=>row.holiday).map(row=>`${String(row.day).padStart(2,"0")}.${String(data.month).padStart(2,"0")}: ${row.holiday}`);
      if(holidays.length)page.append(node("p","attendance-holidays",holidays.join(" · ")));
      if(!data.scheduled)page.append(node("p","attendance-footnote","Grafik nieustawiony: godziny do ręcznego uzupełnienia."));
      if(data.scheduled)page.append(node("p","attendance-footnote","Godziny według grafiku. Obecność potwierdza podpis. Zatwierdzone nieobecności wymagają rozliczenia w ewidencji czasu pracy."));
      return page;
    }
    function render(){
      const context=a.context();host.hidden=!context.allowed||!context.employee;
      model=host.hidden?null:build({...context,month:Number(select.value)});print.disabled=!model||printing;
      if(!model){body.replaceChildren();return;}
      body.replaceChildren(sheet(model));
    }
    select.addEventListener("change",render);host.addEventListener("toggle",()=>{if(host.open)render();});
    print.addEventListener("click",async()=>{
      if(printing)return;render();if(!model)return;
      printing=true;print.disabled=true;
      printNode=node("section");printNode.id="vacationAttendancePrint";printNode.append(sheet(model));d.body.append(printNode);d.body.classList.add("vacation-attendance-print");
      cleanup=()=>{printNode?.remove();printNode=null;d.body.classList.remove("vacation-attendance-print");a.window.removeEventListener("afterprint",cleanup);printing=false;print.disabled=!model;cleanup=null;};
      a.window.addEventListener("afterprint",cleanup,{once:true});
      try{await a.print(cleanup);}catch(error){cleanup?.();a.error(error.message||"Nie udało się przygotować wydruku.");}
    });
    return {render,clear(){cleanup?.();model=null;body.replaceChildren();host.hidden=true;host.open=false;select.value=String(a.month());}};
  }
  return {build,create,monthNames,normalizeSchedule};
});
