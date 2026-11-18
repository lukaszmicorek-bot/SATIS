(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SatisStatistics=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const months=['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
  const fields=['soldAids','soldAccessories','receivedAids','returnedAids','serviceIntake','orderIntake','completedCases'];
  const empty=()=>Object.fromEntries(fields.map(key=>[key,0]));
  const text=value=>String(value??'').replace(/\s+/gu,' ').trim();
  function day(value){
    if(!/^\d{4}-\d{2}-\d{2}$/u.test(String(value||'')))return '';
    const date=new Date(`${value}T12:00:00Z`);return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value?value:'';
  }
  function summarize(source,{today,year=Number(String(today||'').slice(0,4)),mode='months',place=''}={}){
    if(!day(today))throw new Error('Nieprawidłowa data statystyk.');
    const years=new Set([Number(today.slice(0,4))]),events=[],quality={missingDates:0,invalidDates:0,futureDates:0,duplicateIds:0};
    const current={stockAids:0,stockAccessories:0,reservedAids:0,openServices:0,openOrders:0};
    const accept=row=>!place||row.location===place;
    function add(date,metric,row){
      const valid=day(date);
      if(!valid){if(accept(row))quality[date?'invalidDates':'missingDates']++;return;}
      if(valid>today){if(accept(row))quality.futureDates++;return;}
      years.add(Number(valid.slice(0,4)));
      if(accept(row))events.push({date:valid,metric,model:text(row.model)||'Bez nazwy',manufacturer:text(row.manufacturer)||'Nieuzupełniony producent',category:row.order?'Zamówienia':text(row.category)||'Pozostałe'});
    }
    function unique(rows){const seen=new Set();return (rows||[]).filter(row=>{if(!row.id)return true;if(seen.has(row.id)){if(accept(row))quality.duplicateIds++;return false;}seen.add(row.id);return true;});}
    for(const row of unique(source.devices)){
      if(accept(row)){
        if(row.type==='NA STANIE'&&row.validStockIdentity)current[row.accessory?'stockAccessories':'stockAids']++;
        if(row.type==='REZERWACJA'&&!row.accessory)current.reservedAids++;
      }
      if(!row.accessory)add(row.receivedDate,'receivedAids',row);
      if(row.type==='SPRZEDANY')add(row.saleDate,row.accessory?'soldAccessories':'soldAids',row);
      if(row.type==='ZWROT'&&!row.accessory)add(row.returnDate,'returnedAids',row);
    }
    for(const row of unique(source.services)){
      if(accept(row)&&!row.closed)current[row.order?'openOrders':'openServices']++;
      add(row.receivedDate,row.order?'orderIntake':'serviceIntake',row);
      if(row.closed)add(row.completedDate,'completedCases',row);
    }
    const availableYears=[...years].sort((a,b)=>a-b),annual=mode==='years';
    const rows=(annual?availableYears:Array.from({length:12},(_,index)=>index+1)).map(value=>{
      const key=annual?String(value):`${year}-${String(value).padStart(2,'0')}`;
      return {key,label:annual?String(value):months[value-1],future:key>today.slice(0,annual?4:7),partial:key===today.slice(0,annual?4:7),...empty()};
    });
    const byKey=new Map(rows.map(row=>[row.key,row])),totals=empty(),models=new Map(),categories=new Map();
    for(const event of events){
      const key=event.date.slice(0,annual?4:7),row=byKey.get(key);if(!row)continue;
      row[event.metric]++;totals[event.metric]++;
      if(event.metric==='soldAids'){
        const modelKey=JSON.stringify([event.model.toLocaleLowerCase('pl'),event.manufacturer.toLocaleLowerCase('pl')]);
        const model=models.get(modelKey)||{model:event.model,manufacturer:event.manufacturer,count:0};model.count++;models.set(modelKey,model);
      }
      if(['serviceIntake','orderIntake'].includes(event.metric))categories.set(event.category,(categories.get(event.category)||0)+1);
    }
    const topModels=[...models.values()].sort((a,b)=>b.count-a.count||a.model.localeCompare(b.model,'pl')).slice(0,10);
    return {today,year,mode:annual?'years':'months',place,availableYears,rows,totals,current,topModels,
      categories:[...categories].map(([category,count])=>({category,count})).sort((a,b)=>b.count-a.count||a.category.localeCompare(b.category,'pl')),quality,
      sourceCounts:{devices:uniqueCount(source.devices,accept),services:uniqueCount(source.services,accept)}};
  }
  function uniqueCount(rows,accept){const ids=new Set();let count=0;for(const row of rows||[]){if(row.id&&ids.has(row.id))continue;if(row.id)ids.add(row.id);if(accept(row))count++;}return count;}
  function create(a){
    const host=a.host,d=a.document;if(!host)return null;
    let year=null,mode='months',place='';
    const node=(tag,value,cls)=>{const n=d.createElement(tag);if(value!==undefined)n.textContent=String(value);if(cls)n.className=cls;return n;};
    const number=value=>new Intl.NumberFormat('pl-PL').format(value);
    function button(label,action,active=false){const b=node('button',label,`pcpr-tab${active?' active':''}`);b.type='button';b.setAttribute('aria-pressed',String(active));b.addEventListener('click',()=>{if(a.allowed())action();else clear();});return b;}
    function clear(){host.replaceChildren();host.hidden=true;year=null;mode='months';place='';}
    function table(headings,rows){const wrap=node('div',undefined,'statistics-table-wrap'),t=node('table',undefined,'statistics-table'),head=node('thead'),tr=node('tr');
      for(const heading of headings){const th=node('th',heading);th.scope='col';tr.append(th);}head.append(tr);t.append(head);const body=node('tbody');
      for(const values of rows){const row=node('tr');values.forEach((value,index)=>{const cell=node(index===0?'th':'td',value);if(index===0)cell.scope='row';row.append(cell);});body.append(row);}t.append(body);wrap.append(t);return wrap;}
    function metrics(values){const list=node('dl',undefined,'statistics-metrics');for(const [label,value]of values){const item=node('div');item.append(node('dt',label),node('dd',number(value)));list.append(item);}return list;}
    function chart(data,title,metric,tone){const figure=node('figure',undefined,'statistics-chart');figure.dataset.tone=tone;figure.append(node('figcaption',title));
      const values=data.rows.map(row=>metric(row)),max=Math.max(1,...values),scale=node('p',`0 – ${number(max)}`,'statistics-chart-scale');figure.append(scale);
      const list=node('ol');data.rows.forEach((row,index)=>{const item=node('li'),label=node('span',row.label,'statistics-period-label'),track=node('span',undefined,'statistics-bar-track'),bar=node('span',undefined,'statistics-bar');
        bar.style.width=`${values[index]/max*100}%`;track.append(bar);track.setAttribute('aria-hidden','true');
        item.append(label,track,node('strong',row.future?'—':number(values[index])));if(row.future)item.dataset.future='true';if(row.partial){label.append(node('small',data.mode==='months'?'w toku':'do dziś'));}list.append(item);});figure.append(list);return figure;}
    function render(){
      if(!a.allowed())return clear();host.hidden=false;
      if(!a.ready()){host.replaceChildren(node('p','Trwa pobieranie kompletu danych…','statistics-message'));return;}
      const today=a.today();year=year??Number(today.slice(0,4));
      let data;try{data=summarize(a.data(),{today,year,mode,place});}catch{host.replaceChildren(node('p','Nie udało się obliczyć statystyk. Odśwież dane aplikacji.','statistics-message'));return;}
      host.replaceChildren();
      const heading=node('header',undefined,'statistics-heading');heading.append(node('h2',mode==='years'?'Statystyki · lata':`Statystyki ${year}`));
      const controls=node('div',undefined,'statistics-controls'),periods=node('div',undefined,'pcpr-tab-group');periods.setAttribute('role','group');periods.setAttribute('aria-label','Okres statystyk');
      periods.append(button('Miesiące',()=>{mode='months';render();},mode==='months'),button('Lata',()=>{mode='years';render();},mode==='years'));controls.append(periods);
      if(mode==='months'){const label=node('label','Rok'),select=node('select');select.setAttribute('aria-label','Rok statystyk');
        for(const value of [...new Set([...data.availableYears,year])].sort((a,b)=>b-a)){const option=node('option',value);option.value=String(value);select.append(option);}select.value=String(year);
        select.addEventListener('change',()=>{if(!a.allowed())return clear();year=Number(select.value);render();host.querySelector('[aria-label="Rok statystyk"]')?.focus();});label.append(select);controls.append(label);}
      const locations=node('div',undefined,'pcpr-tab-group statistics-places');locations.setAttribute('role','group');locations.setAttribute('aria-label','Miejsce statystyk');
      for(const [value,label]of [['','Wszystkie'],['T12','T12'],['P63','P63'],['P50','P50']]){const b=button(label,()=>{place=value;render();},place===value);if(value)b.dataset.locationTone=value;locations.append(b);}controls.append(locations);heading.append(controls);host.append(heading);
      const current=node('section',undefined,'statistics-current');current.append(node('h3','Stan na dziś'),metrics([
        ['Aparaty na stanie',data.current.stockAids],['Akcesoria na stanie',data.current.stockAccessories],['Rezerwacje aparatów',data.current.reservedAids],['Nieodebrane sprawy',data.current.openServices+data.current.openOrders]]));host.append(current);
      const scope=mode==='years'?`${data.availableYears[0]}–${data.availableYears.at(-1)}`:String(year);
      const domains=node('div',undefined,'statistics-domains'),devices=node('section'),services=node('section');
      devices.append(node('h3',`Aparaty · ${scope}`),metrics([['Sprzedane aparaty · szt.',data.totals.soldAids],['Sprzedane akcesoria · szt.',data.totals.soldAccessories],['Przyjęte aparaty · szt.',data.totals.receivedAids]]),chart(data,'Sprzedane aparaty słuchowe · szt.',row=>row.soldAids,'devices'));
      services.append(node('h3',`Serwis i zamówienia · ${scope}`),metrics([['Przyjęte do serwisu · sprawy',data.totals.serviceIntake],['Zamówienia · sprawy',data.totals.orderIntake],['Odebrane · sprawy',data.totals.completedCases]]),chart(data,'Przyjęte sprawy · serwis i zamówienia',row=>row.serviceIntake+row.orderIntake,'services'));domains.append(devices,services);host.append(domains);
      const breakdown=node('div',undefined,'statistics-breakdowns'),models=node('section'),types=node('section');models.append(node('h3',`Najczęściej sprzedawane aparaty · ${scope}`));
      models.append(data.topModels.length?table(['Model','Producent','Szt.'],data.topModels.map(row=>[row.model,row.manufacturer,number(row.count)])):node('p','Brak sprzedanych aparatów w tym okresie.','statistics-message'));
      types.append(node('h3',`Przyjęte sprawy według typu · ${scope}`));types.append(data.categories.length?table(['Typ','Sprawy'],data.categories.map(row=>[row.category,number(row.count)])):node('p','Brak przyjętych spraw w tym okresie.','statistics-message'));breakdown.append(models,types);host.append(breakdown);
      const details=node('details',undefined,'statistics-details');details.append(node('summary','Dokładne liczby według okresu'));
      details.append(table([mode==='years'?'Rok':'Miesiąc','Sprzedane aparaty','Sprzedane akcesoria','Przyjęte aparaty','Zwroty aparatów','Przyjęte do serwisu','Zamówienia','Odebrane sprawy'],data.rows.map(row=>[row.label,...fields.map(key=>row.future?'—':number(row[key]))])));host.append(details);
      const warnings=data.quality.missingDates+data.quality.invalidDates+data.quality.futureDates;
      if(warnings||data.quality.duplicateIds)host.append(node('p',`Do sprawdzenia: ${warnings} dat${data.quality.duplicateIds?` · powtórzone ID: ${data.quality.duplicateIds}`:''}. Pozycje bez prawidłowej daty nie są zaliczane do danego okresu.`,'statistics-warning'));
      const source=node('details',undefined,'statistics-details');source.append(node('summary','Zakres i jakość danych'),node('p',`Baza: ${number(data.sourceCounts.devices)} pozycji · Serwis i zamówienia: ${number(data.sourceCounts.services)} spraw. Filtr miejsca dotyczy wszystkich zestawień. Stan na dziś nie zależy od wybranego roku.`),
        node('p','Sprzedaż: aktualny status Sprzedany i data sprzedaży/odbioru z Bazy; zwroty są wyłączone. Aparaty i akcesoria liczone osobno. Demo nie jest wliczane.'),
        node('p','Sprawy liczone według dat przyjęcia i odbioru, nie numeru dokumentu. Jedno zamówienie z kilkoma pozycjami to jedna sprawa; odbiór następuje po odebraniu wszystkich pozycji. Odebrane w danym okresie sprawy mogły być przyjęte wcześniej.'),
        node('p',`Brakujące daty: ${data.quality.missingDates} · nieprawidłowe: ${data.quality.invalidDates} · przyszłe: ${data.quality.futureDates}. Powtórzone ID pominięte; sam wspólny numer seryjny nie łączy różnych napraw. Bieżący miesiąc i rok są niepełne.`));host.append(source);
    }
    return {render,clear};
  }
  return {day,summarize,create};
});
