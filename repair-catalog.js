(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.SatisRepairCatalog=api;})(typeof window==="undefined"?null:window,function(){
  "use strict";
  const sourceRows=[
    ["Naprawa aparatu Phonak BTE/RIC Basic",324.07,350,"U060.015",8],
    ["Naprawa aparatu Phonak BTE/RIC klasa 30",416.67,450,"U060.030",8],
    ["Naprawa aparatu Phonak BTE/RIC klasa 50",462.96,500,"U060.050",8],
    ["Naprawa aparatu Phonak BTE/RIC klasa 70",555.56,600,"U060.070",8],
    ["Naprawa aparatu Phonak BTE/RIC klasa 90",694.44,750,"U060.090",8],
    ["Naprawa aparatu Phonak BTE/RIC klasa Cros",324.07,350,"U060.100",8],
    ["Naprawa aparatu Phonak BTE/RIC klasa Trial",351.85,380,"U060.110",8],
    ["Naprawa aparatu Phonak ITE Basic",324.07,350,"U061.015",8],
    ["Naprawa aparatu Phonak ITE klasa 30",370.37,400,"U061.030",8],
    ["Naprawa aparatu Phonak ITE klasa 50",509.26,550,"U061.050",8],
    ["Naprawa aparatu Phonak ITE klasa 70",601.85,650,"U061.070",8],
    ["Naprawa aparatu Phonak ITE klasa 90",740.74,800,"U061.090",8],
    ["Naprawa aparatu Phonak ITE klasa Cros",351.85,380,"U061.100",8],
    ["Naprawa wkładki SDS",154.47,190,"U062.010",23],
    ["Naprawa akcesoria bezprzewodowe DWA",308.94,380,"U063.010",23],
    ["Naprawa akcesoria bezprzewodowe Roger",1018.52,1100,"U063.020 - wyrób medyczny",8],
    ["Naprawa akcesoria bezprzewodowe Roger",975.61,1200,"U063.030 - wyrób niemedyczny",23],
    ["Naprawa aparatu Philips R PREMIUM 100 HL90",787.04,850,"90082517",8],
    ["Naprawa aparatu Philips R ADVANCED 80 HL70",648.15,700,"90082518",8],
    ["Naprawa aparatu Philips R REGULAR 60 HL50",648.15,700,"90082519",8],
    ["Naprawa aparatu Philips R ESSENTIAL 40/20 HL30/20",509.26,550,"90082520",8],
    ["Wymiana akumulatora",231.48,250,"90082522",8],
    ["Naprawa mikrofonu/słuchawki",231.48,250,"90082039",8],
    ["Wymiana obudowy ITE",324.07,350,"90082041",8],
    ["Naprawa aparatu Beltone BTE/RIC",601.85,650,"wymiana elektroniki    12 miesięcy gwarancja",8],
    ["Diagnoza aparatu Beltone BTE/RIC",120.37,130,"diagnoza/przegląd/czyszczenie",8],
    ["Rezygnacja z naprawy aparatu Beltone BTE/RIC",92.59,100,"",8],
    ["Naprawa aparatu WSA - grupa 1",324.07,350,"",8],
    ["Naprawa aparatu WSA - grupa 2",370.37,400,"",8],
    ["Naprawa aparatu WSA - grupa 3",444.44,480,"",8],
    ["Naprawa aparatu WSA - grupa 4",537.04,580,"",8],
    ["Naprawa aparatu WSA - grupa 5",675.93,730,"",8],
    ["Naprawa aparatu WSA - grupa 6",370.37,400,"",8],
    ["Naprawa aparatu WSA - grupa 7",925.93,1000,"",8],
    ["Naprawa aparatu WSA - grupa 8",1111.11,1200,"",8]
  ];
  const key=value=>String(value??"").normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().replace(/ł/gu,"l").replace(/[^a-z0-9]+/gu," ").trim();
  const rows=sourceRows.map(([originalName,net,gross,description,vat],index)=>{
    const category=/wkładki/u.test(originalName)?"earmold":/akcesoria/u.test(originalName)?"accessory":/aparatu/u.test(originalName)?"device":"parts";
    const code=description.match(/^(?:U\d{3}\.\d{3}|\d{8})(?=$|\s)/u)?.[0]||"";
    const brand=code.startsWith("U")?"Phonak":code.startsWith("9")?"Philips":originalName.match(/\b(Phonak|Philips|Beltone|WSA)\b/u)?.[1]||"";
    const construction=/BTE\/RIC/u.test(originalName)?"BTE/RIC":/\bITE\b/u.test(originalName)?"ITE":"";
    return {id:`repair-price-${index+2}`,sourceRow:index+2,originalName,name:originalName.replace("Naprawa akcesoria bezprzewodowe","Naprawa akcesoriów bezprzewodowych").replace(/\bCros\b/u,"CROS"),
      brand,category,construction,code,net,gross,vat,description,
      variant:/niemedyczny/u.test(description)?"Wyrób niemedyczny":/medyczny/u.test(description)?"Wyrób medyczny":"",
      warranty:brand==="Beltone"&&/wymiana elektroniki/u.test(description)?12:null};
  });
  function filterRows({query="",brand="",category="",construction=""}={}){
    const terms=key(query).split(" ").filter(Boolean);
    return rows.filter(row=>(!brand||(brand==="unspecified"?!row.brand:row.brand===brand))&&(!category||row.category===category)&&(!construction||row.construction===construction)
      &&terms.every(term=>key([row.name,row.brand,row.code,row.description,row.construction,row.variant].join(" ")).includes(term)))
      .sort((a,b)=>(a.brand||"Ż").localeCompare(b.brand||"Ż","pl")||a.name.localeCompare(b.name,"pl",{numeric:true})||a.code.localeCompare(b.code,"pl"));
  }
  function create(a){
    const host=a.host,doc=a.document;if(!host)return null;
    host.classList.add("accessory-catalog","repair-price-catalog");
    host.innerHTML=`<div class="accessory-catalog-toolbar"><label class="search-box"><span>Szukaj</span><input id="repairCatalogSearch" type="search" autocomplete="off" placeholder="Usługa, model, klasa, kod..."></label>
      <label><span>Producent</span><select id="repairCatalogBrand"><option value="">Wszyscy</option><option>Phonak</option><option>Philips</option><option>Beltone</option><option>WSA</option><option value="unspecified">Nie podano</option></select></label>
      <label><span>Konstrukcja</span><select id="repairCatalogConstruction"><option value="">Wszystkie</option><option value="BTE/RIC">Zauszne · BTE/RIC</option><option value="ITE">Wewnątrzuszne · ITE</option></select></label>
      <div class="accessory-kind-filter" role="group" aria-label="Rodzaj naprawy"><button type="button" data-repair-price-kind="" aria-pressed="true">Wszystkie</button><button type="button" data-repair-price-kind="device" aria-pressed="false">Aparaty</button><button type="button" data-repair-price-kind="earmold" aria-pressed="false">Wkładki</button><button type="button" data-repair-price-kind="accessory" aria-pressed="false">Akcesoria</button><button type="button" data-repair-price-kind="parts" aria-pressed="false">Części i wymiany</button></div></div>
      <div class="accessory-catalog-meta"><strong>Cennik napraw</strong><span>Ceny w zł · netto i brutto</span><span data-repair-price-count role="status" aria-live="polite"></span></div>
      <p class="accessory-catalog-hint">Ceny, kody i VAT według dostarczonego arkusza. Kody zaczynające się od U: Phonak; od 9: Philips. Grupy WSA pozostają bez przypisania konkretnych modeli.</p>
      <div class="accessory-catalog-scroll" tabindex="0" aria-label="Tabela cennika napraw"><table class="accessory-catalog-table repair-price-table"><thead><tr><th>Producent</th><th>Usługa</th><th>Kod</th><th>Netto</th><th>VAT</th><th>Brutto</th><th>Szczegóły</th></tr></thead><tbody></tbody></table></div><p class="empty-state" data-repair-price-empty hidden>Brak pasujących pozycji napraw.</p>`;
    const find=selector=>host.querySelector(selector),search=find("#repairCatalogSearch"),brand=find("#repairCatalogBrand"),construction=find("#repairCatalogConstruction");
    const node=(tag,text,cls)=>{const element=doc.createElement(tag);if(text!==undefined)element.textContent=text;if(cls)element.className=cls;return element;};
    const money=value=>new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN"}).format(value);
    let category="";const expanded=new Set();
    function field(list,label,value){list.append(node("dt",label),node("dd",value));}
    function render(){
      const visible=filterRows({query:search.value,brand:brand.value,category,construction:construction.value}),body=find("tbody");body.replaceChildren();
      find("[data-repair-price-count]").textContent=`Pozycje: ${visible.length} / ${rows.length}`;find("[data-repair-price-empty]").hidden=visible.length>0;
      host.querySelectorAll("[data-repair-price-kind]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.repairPriceKind===category)));
      for(const item of visible){
        const row=node("tr"),detailRow=node("tr"),name=node("td");row.dataset.repairPriceId=item.id;
        row.append(node("td",item.brand||"Nie podano","accessory-brand"));
        name.append(node("strong",item.name,"accessory-product-name"));
        if(item.variant)name.append(node("span",item.variant,"repair-price-variant"));
        if(item.construction)name.append(node("span",item.construction,"accessory-product-caption"));
        if(item.warranty)name.append(node("span",`Wymiana elektroniki · gwarancja naprawy: ${item.warranty} mies.`,"accessory-patient-price"));
        if(item.brand==="Beltone"&&/Diagnoza/u.test(item.name))name.append(node("span","Diagnoza · przegląd · czyszczenie","accessory-product-caption"));
        row.append(name,node("td",item.code||"—","repair-price-code"),node("td",money(item.net),"accessory-price repair-price-net"),node("td",`${item.vat}%`,"repair-price-vat"),node("td",money(item.gross),"accessory-price"));
        const actions=node("td"),button=node("button","Szczegóły","reset-filters-btn");button.type="button";detailRow.id=`${item.id}-details`;detailRow.className="accessory-detail-row";detailRow.hidden=!expanded.has(item.id);
        button.setAttribute("aria-expanded",String(!detailRow.hidden));button.setAttribute("aria-controls",detailRow.id);button.setAttribute("aria-label",`Szczegóły: ${item.name}${item.code?` · ${item.code}`:""}`);
        button.addEventListener("click",()=>{detailRow.hidden=!detailRow.hidden;button.setAttribute("aria-expanded",String(!detailRow.hidden));detailRow.hidden?expanded.delete(item.id):expanded.add(item.id);});actions.append(button);row.append(actions);
        const cell=node("td"),details=node("div",undefined,"accessory-details"),list=node("dl");cell.colSpan=7;
        field(list,"Nazwa w arkuszu",item.originalName);field(list,"Producent",item.brand||"Nie wskazano w nazwie pozycji; wymaga potwierdzenia");
        field(list,"Kod",item.code||"Nie podano");field(list,"Opis z arkusza",item.description.replace(/\s+/gu," ")||"Nie podano");
        field(list,"Cena netto",money(item.net));field(list,"VAT",`${item.vat}%`);field(list,"Cena brutto",money(item.gross));
        if(item.warranty)field(list,"Gwarancja naprawy",`${item.warranty} miesięcy przy wymianie elektroniki`);
        field(list,"Źródło",`Arkusz.xlsx · Sheet1 · wiersz ${item.sourceRow}`);details.append(list);cell.append(details);detailRow.append(cell);body.append(row,detailRow);
      }
    }
    search.addEventListener("input",render);brand.addEventListener("change",render);construction.addEventListener("change",render);
    host.querySelectorAll("[data-repair-price-kind]").forEach(button=>button.addEventListener("click",()=>{category=button.dataset.repairPriceKind;render();}));
    render();return {render};
  }
  return {sourceRows,rows,filterRows,create};
});
