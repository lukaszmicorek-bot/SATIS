(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.SatisAccessoryCatalog=api;})(typeof window==="undefined"?null:window,function(){
  "use strict";
  const demant=["Sonic","Philips"],demantAll=["Sonic","Philips","Oticon"];
  const rows=[];
  const discounted=(price,percent)=>Math.round(Math.round(price*100)*(100-percent)/100)/100;
  function add(brands,kind,name,values={}){rows.push({id:`accessory-${rows.length+1}`,brands,kind,name,notes:[],warnings:[],...values});}
  function charger(brands,name,price,vat,values={}){
    add(brands,"charger",name,{price,vat,onePrice:price==null?null:discounted(price,50),twoPrice:price==null?null:discounted(price,70),
      notes:["Rabat przy zakupie 1 aparatu: 50%; przy zakupie 2 aparatów: 70%. Ceny dotyczą jednej ładowarki."],...values});
  }
  const duplicateBte="W pliku nazwa Charger miniBTE T R występuje przy cenie 960 zł oraz 1180 zł. Potwierdź wariant ładowarki; nie określono, czy droższy model to Charger Plus.";
  for(const [name,vat,compatibility]of [
    ["Charger miniRITE T R",23,"miniRITE T R"],
    ["Charger miniBTE T R",23,"miniBTE T R"],
    ["Charger miniRITE (50/60)",8,"miniRITE 50 / 60"],
    ["Charger miniBTE R (50)",8,"miniBTE R 50"]
  ])charger(demant,name,960,vat,{compatibility,warranty:24,...(name==="Charger miniBTE T R"?{warnings:[duplicateBte]}:{})});
  for(const [name,vat,compatibility]of [
    ["Charger Plus miniRITE T R",23,"miniRITE T R"],
    ["Charger miniBTE T R",23,"miniBTE T R"],
    ["Charger Plus miniRITE (50/60)",8,"miniRITE 50 / 60"],
    ["Charger Plus miniBTE R (50)",8,"miniBTE R 50"],
    ["Charger Plus X miniRITE (50/60)",8,"miniRITE 50 / 60"],
    ["Charger Plus X miniBTE R (50)",8,"miniBTE R 50"]
  ])charger(demant,name,1180,vat,{compatibility,warranty:24,...(name==="Charger miniBTE T R"?{warnings:[duplicateBte]}:{})});
  for(const name of ["Charger miniRITE","Charger miniBTE"])charger(["Oticon"],name,960,8,{warranty:24});
  for(const name of ["SmartCharger nxtCIC R","SmartCharger miniRITE","SmartCharger miniBTE"])charger(["Oticon"],name,1180,8,{warranty:24});
  for(const [name,price,vat]of [["TV Adapter",1100,8],["Audio Clip / ConnectClip",1250,8],["Adapter Easy LE",250,23]]){
    add(demantAll,"accessory",name,{price,vat,warranty:24,patientPrice:discounted(price,15),notes:["Możliwy rabat 15% dla naszych pacjentów. Dobór wersji do producenta i aparatu wymaga potwierdzenia."]});
  }
  add(demantAll,"cros","Nadajnik CROS II miniRITE R",{price:3800,vat:8,warranty:24});
  add(demantAll,"cros","Nadajnik CROS miniRITE T R",{price:3500,vat:8,warranty:24});
  for(const [name,price]of [
    ["Charger RIC I EU EPS",650],["ChargerGo RIC I EU EPS",950],["Charger Go RICSPH I EU EPS",950],
    ["Charger Case Combi 2 incl. EU EPS",500],["Charger Combi BTE 2 incl. EU EPS",500],
    ["Charger Virto I incl. EU EPS",550],["Charger Ease",550],["Charger BTE RIC (EU Plug)",500],
    ["Charger Case Go (EU Plug)",950],["Phonak Life Charger (EU Plug)",550]
  ])charger(["Phonak"],name,price,8,{warranty:36});
  for(const [name,price,vat,warranty]of [["TV Connector",1050,23,24],["Phonak Remote Control",1200,8,null],
    ["Phonak PartnerMic",2100,23,null],["Roger On iN V2",7200,23,null],["Roger Select iN",6800,23,null],["Roger Table Mic II iN",8500,23,null]]){
    add(["Phonak"],"accessory",name,{price,vat,warranty,patientPrice:discounted(price,15),
      ...(name.startsWith("Roger")?{refundable:false}:{}),notes:["Możliwy rabat 15% dla naszych pacjentów."]});
  }
  add(["Phonak"],"cros","Nadajnik CROS I-R",{price:3400,vat:8,warranty:36});
  add(["Phonak"],"cros","Nadajnik CROS E-R",{price:3600,vat:8,warranty:36});
  add(["Beltone"],"charger","Ładowarka Premium",{price:950,vat:8,warranty:24,onePrice:665,twoPrice:475,
    notes:["Klapka i powerbank. Rabat przy 1 aparacie: 30%; przy 2 aparatach: 50%."]});
  add(["Beltone"],"charger","Ładowarka Standard",{price:750,warranty:24,onePrice:525,twoPrice:370,
    notes:["Z klapką. Rabat przy 1 aparacie: 30%; przy 2 aparatach: 50% wg pliku."],
    warnings:["Przy 2 aparatach podano 370 zł i rabat 50%. Z ceny 750 zł rabat 50% daje 375 zł. Zachowano kwotę z pliku: 370 zł."]});
  add(["Beltone"],"charger","Ładowarka Desktop",{price:700,warranty:24,onePrice:490,twoPrice:350,
    notes:["Otwarta. W pliku nazwa DESKOPT. Rabat przy 1 aparacie: 30%; przy 2 aparatach: 40% wg pliku."],
    warnings:["Przy 2 aparatach podano 350 zł i rabat 40%. Z ceny 700 zł rabat 40% daje 420 zł, a 350 zł oznacza rabat 50%. Zachowano kwotę z pliku: 350 zł."]});
  add(["Beltone"],"accessory","TV Streamer",{price:950,vat:8,warranty:24,onePrice:665,twoPrice:665,patientPrice:807,
    notes:["Przy zakupie aparatu: 30% rabatu, cena 665 zł. Przy późniejszym zakupie dla naszych pacjentów: rabat 15% wg pliku."],
    warnings:["Podano 807 zł po rabacie 15%. Obliczenie od 950 zł daje 807,50 zł. Zachowano kwotę z pliku: 807 zł."]});
  add(["Beltone"],"cros","Nadajnik Envision",{price:3200,vat:8,warranty:24});
  for(const [name,compatibility,onePrice,twoPrice]of [
    ["Dry&Clean · Pure AX/IX","Pure AX / IX",650,450],
    ["Dry&Clean · Motion X","Motion X",650,450],
    ["Dry&Clean · Styletto AX/IX","Styletto AX / IX",850,650]
  ])add(["Signia"],"charger",name,{compatibility,onePrice,twoPrice,warranty:36,notes:["Ładowanie, czyszczenie i osuszanie. W pliku podano ceny przy zakupie aparatów; nie podano ceny regularnej."]});
  for(const [name,compatibility,price]of [
    ["Ładowarka przenośna · Pure AX/IX","Pure AX / IX",450],
    ["Ładowarka przenośna · Silk","Silk Charge&Go IX",null],
    ["Ładowarka przenośna · Styletto","Styletto AX / IX",null],
    ["Ładowarka przenośna · Active","Active Pro / Active",450],
    ["Ładowarka przenośna · Insio","Insio Charge&Go AX",null]
  ])add(["Signia"],"charger",name,{compatibility,price,warranty:36,
    notes:[price==null?"Cena nie została podana w pliku.":"Cena podana w pliku bez określenia, czy jest ceną regularną, czy promocyjną."],priceLabel:price==null?"":"Cena wg pliku"});
  for(const model of ["Motion X","Pure AX"])add(["Signia"],"charger",`Ładowarka stacjonarna · ${model}`,{compatibility:model,onePrice:400,twoPrice:200,warranty:36,notes:["W pliku podano ceny przy zakupie aparatów; nie podano ceny regularnej."]});
  add(["ReSound"],"charger","Ładowarka Premium",{price:1300,warranty:24,onePrice:975,twoPrice:650,notes:["Przy 1 aparacie: 25% rabatu. Przy 2 aparatach: 50% rabatu."]});
  add(["ReSound"],"charger","Ładowarka podstawowa",{price:850,warranty:24,notes:["Bez klapki i bez powerbanku. W pliku nie podano rabatu."]});
  add(["Audibel","Starkey"],"charger","Ładowarka",{price:550,vat:8,notes:["W pliku: każda ładowarka. Nie wskazano modeli ani okresu gwarancji."]});
  add(["Philips"],"cros","CROS 5050 / 1730",{price:3600,refundable:false,warranty:24,compatibility:"Warianty ładowalne 5050 / 1730",notes:["Pozycja z końcowej sekcji Cennik CROS. Nie łączono automatycznie z nadajnikami miniRITE o innych cenach."]});
  add(["Bernafon"],"charger","Ładowarka do Encanta",{specialPrice:250,priceLabel:"Po rabacie",compatibility:"Encanta",notes:["W pliku: 250 zł po rabacie, każda ładowarka do modeli Encanta. Nie podano ceny regularnej ani warunków rabatu."]});
  const warrantyGroups=[
    {brands:demantAll,items:[["Aparaty słuchowe","36 miesięcy"],["Akumulatory w aparatach ładowalnych","6 miesięcy"],["Ładowarki","24 miesiące"],["Pozostałe akcesoria i CROS","24 miesiące"]],notes:["Gwarancja+: rozszerzenie do 7 dni od sprzedaży pacjentowi, pod warunkiem że od naszego zakupu aparatu upłynęło mniej niż 2 miesiące."]},
    {brands:["Phonak"],items:[["Aparaty, akumulatory w aparatach i ładowarki","36 miesięcy"],["CROS","36 miesięcy"],["TV Connector","24 miesiące"]],notes:["Nie podano gwarancji pozostałych akcesoriów.","Informacja dodatkowa wg pliku: aparaty produkowane w Wietnamie, wewnątrzuszne w Hiszpanii, patenty szwajcarskie."]},
    {brands:["Beltone"],items:[["Aparaty łącznie z akumulatorami","36 miesięcy"],["Ładowarki, pozostałe akcesoria i CROS","24 miesiące"]],notes:[]},
    {brands:["Signia"],items:[["Wszystkie ładowarki","36 miesięcy"]],notes:["Dla pozostałych produktów nie podano w tej sekcji warunków gwarancji."]},
    {brands:["ReSound"],items:[["Ładowarki, streamery i Multi Mic","24 miesiące"],["Akumulatory w aparatach","36 miesięcy"]],notes:[]},
    {brands:["Audibel","Starkey","Bernafon"],items:[],notes:["W pliku nie podano okresu gwarancji dla ładowarek tych marek."]}
  ];
  const sourceNotes=[
    duplicateBte,
    "Beltone Standard: cena 370 zł nie zgadza się z rabatem 50% od 750 zł (375 zł).",
    "Beltone Desktop: cena 350 zł nie zgadza się z rabatem 40% od 700 zł (420 zł).",
    "Beltone TV Streamer: podano 807 zł, ale rabat 15% od 950 zł daje 807,50 zł.",
    "Końcowa pozycja Audeo I-R: 3800 zł przy zakupie aparatu. Nie określono jednoznacznie, czy chodzi o CROS czy inny produkt; nie przypisano jej do kategorii ładowarek.",
    "Część cen, stawek VAT i okresów gwarancji nie została podana. Braków nie zastąpiono zerami ani warunkami innych producentów."
  ];
  function key(value){return String(value??"").normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().replace(/ł/gu,"l").replace(/[^a-z0-9]+/gu," ").trim();}
  function filterRows({query="",brand="",kind="charger"}={}){
    const terms=key(query).split(" ").filter(Boolean);
    return rows.filter(row=>(!brand||row.brands.includes(brand))&&(!kind||row.kind===kind)&&terms.every(term=>key([row.name,...row.brands,row.compatibility,...row.notes].join(" ")).includes(term)))
      .sort((a,b)=>a.brands[0].localeCompare(b.brands[0],"pl")||a.name.localeCompare(b.name,"pl",{numeric:true})||Number(a.price||0)-Number(b.price||0));
  }
  function create(a){
    const host=a.host,doc=a.document;if(!host)return null;
    host.classList.add("accessory-catalog");
    host.innerHTML=`<div class="accessory-catalog-toolbar"><label class="search-box"><span>Szukaj</span><input id="accessoryCatalogSearch" type="search" autocomplete="off" placeholder="Model, producent, zgodność..."></label><label><span>Producent</span><select id="accessoryCatalogBrand"><option value="">Wszyscy</option></select></label><div class="accessory-kind-filter" role="group" aria-label="Rodzaj akcesoriów"><button type="button" data-accessory-kind="" aria-pressed="false">Wszystkie</button><button type="button" data-accessory-kind="charger" aria-pressed="true">Ładowarki</button><button type="button" data-accessory-kind="accessory" aria-pressed="false">Akcesoria</button><button type="button" data-accessory-kind="cros" aria-pressed="false">CROS</button></div></div>
      <div class="accessory-catalog-meta"><strong>Ładowarki i akcesoria · 2026</strong><span>Ceny brutto · zł</span><span data-accessory-count role="status" aria-live="polite"></span></div>
      <p class="accessory-catalog-hint">Cena przy 1 lub 2 aparatach dotyczy jednej ładowarki lub jednego akcesorium, nie całego zestawu. Rabaty są możliwe na warunkach podanych w szczegółach.</p>
      <div class="accessory-catalog-scroll" tabindex="0" aria-label="Cennik ładowarek i akcesoriów"><table class="accessory-catalog-table"><thead><tr><th>Producent</th><th>Produkt</th><th>Cena regularna</th><th>Przy 1 aparacie</th><th>Przy 2 aparatach</th><th>Szczegóły</th></tr></thead><tbody></tbody></table></div>
      <p class="empty-state" data-accessory-empty hidden>Brak pasujących pozycji.</p>
      <details class="accessory-warranties"><summary>Gwarancje i warunki producentów</summary><div data-accessory-warranties></div></details>
      <details class="accessory-source-notes"><summary>Informacje do potwierdzenia (${sourceNotes.length})</summary><ul></ul></details>`;
    const find=selector=>host.querySelector(selector);
    const search=find("#accessoryCatalogSearch"),brand=find("#accessoryCatalogBrand");
    let kind="charger";const open=new Set();
    const format=value=>new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN"}).format(value);
    const node=(tag,text,cls)=>{const item=doc.createElement(tag);if(text!==undefined)item.textContent=text;if(cls)item.className=cls;return item;};
    const brands=[...new Set(rows.flatMap(row=>row.brands))].sort((a,b)=>a.localeCompare(b,"pl"));
    for(const value of brands){const option=node("option",value);option.value=value;brand.append(option);}
    for(const text of sourceNotes)find(".accessory-source-notes ul").append(node("li",text));
    function field(list,label,value){const term=node("dt",label),description=node("dd",value);list.append(term,description);}
    function renderWarranties(){
      const output=find("[data-accessory-warranties]");output.replaceChildren();
      for(const group of warrantyGroups){
        if(brand.value&&!group.brands.includes(brand.value))continue;
        const section=node("section"),list=node("dl");section.append(node("h3",(brand.value?[brand.value]:group.brands).join(" · ")));
        for(const [label,value]of group.items)field(list,label,value);
        section.append(list);for(const text of group.notes)section.append(node("p",text));output.append(section);
      }
    }
    function render(){
      const visible=filterRows({query:search.value,brand:brand.value,kind}),body=find("tbody");body.replaceChildren();
      find("[data-accessory-count]").textContent=`Pozycje: ${visible.length} / ${rows.length}`;
      find("[data-accessory-empty]").hidden=visible.length>0;
      host.querySelectorAll("[data-accessory-kind]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.accessoryKind===kind)));
      for(const item of visible){
        const row=node("tr"),detailsRow=node("tr");row.dataset.accessoryId=item.id;detailsRow.className="accessory-detail-row";detailsRow.id=`${item.id}-details`;detailsRow.hidden=!open.has(item.id);
        row.append(node("td",item.brands.join(" / "),"accessory-brand"));
        const product=node("td");product.append(node("strong",item.name,"accessory-product-name"));
        product.append(node("span",item.warranty?`Gwarancja: ${item.warranty} mies.`:"Gwarancja: nie podano","accessory-product-caption"));
        if(item.warnings.length)product.append(node("span","Do potwierdzenia","accessory-price-warning"));
        if(item.patientPrice!=null)product.append(node("span",`Dla naszych pacjentów: ${format(item.patientPrice)}`,"accessory-patient-price"));
        if(item.refundable===false)product.append(node("span","Bez refundacji","accessory-product-caption"));
        row.append(product);
        for(const [index,value]of [item.price??item.specialPrice,item.onePrice,item.twoPrice].entries()){
          const cell=node("td",undefined,"accessory-price");cell.append(node("span",value==null?"Nie podano":format(value)));
          if(index===0&&item.priceLabel)cell.append(node("small",item.priceLabel));row.append(cell);
        }
        const actions=node("td"),button=node("button","Szczegóły","reset-filters-btn");button.type="button";button.setAttribute("aria-expanded",String(!detailsRow.hidden));button.setAttribute("aria-controls",detailsRow.id);button.setAttribute("aria-label",`Szczegóły: ${item.brands.join(" / ")} · ${item.name}`);
        button.addEventListener("click",()=>{detailsRow.hidden=!detailsRow.hidden;button.setAttribute("aria-expanded",String(!detailsRow.hidden));detailsRow.hidden?open.delete(item.id):open.add(item.id);});actions.append(button);row.append(actions);
        const detailCell=node("td"),detail=node("div",undefined,"accessory-details"),list=node("dl");detailCell.colSpan=6;
        field(list,"Produkt",item.name);field(list,"Producent",item.brands.join(" / "));
        field(list,"Zgodność wg pliku",item.compatibility||"Nie określono dokładnej zgodności. Potwierdź wariant do konkretnego aparatu.");
        field(list,"VAT",item.vat==null?"Nie podano stawki w pliku":`${item.vat}%`);
        field(list,"Gwarancja produktu",item.warranty?`${item.warranty} miesięcy`:"Nie podano w pliku");
        if(item.refundable===false)field(list,"Refundacja","Nie przysługuje wg pliku");
        detail.append(list);
        for(const text of item.notes)detail.append(node("p",text));
        for(const text of item.warnings)detail.append(node("p",text,"accessory-detail-warning"));
        detailCell.append(detail);detailsRow.append(detailCell);body.append(row,detailsRow);
      }
      renderWarranties();
    }
    search.addEventListener("input",render);brand.addEventListener("change",render);
    host.querySelectorAll("[data-accessory-kind]").forEach(button=>button.addEventListener("click",()=>{kind=button.dataset.accessoryKind;render();}));
    render();return {render};
  }
  return {rows,warrantyGroups,sourceNotes,discounted,filterRows,create};
});
