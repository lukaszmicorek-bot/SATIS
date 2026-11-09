(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.SatisCareForm=api;})(typeof window==="undefined"?null:window,function(){
  "use strict";
  const products = [
    {id:"brush",name:"Szczoteczka do czyszczenia"},
    {id:"wipes",name:"Chusteczki do pielęgnacji"},
    {id:"tablets",name:"Tabletki czyszczące do wkładek",type:"BTE"},
    {id:"blower",name:"Gruszka do osuszania wkładek",type:"BTE"},
    {id:"filters",name:"Filtry przeciwwoskowinowe",type:"RIC"},
    {id:"domes",name:"Kopułki",type:"RIC"},
    {id:"drying",name:"Kapsułki osuszające",power:"battery"},
    {id:"batteries",name:"Baterie",power:"battery"},
    {id:"charger",name:"Ładowarka",power:"rechargeable"}
  ];
  const money = value => new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN"}).format(value/100);
  function priceCents(value){
    const text=String(value??"").trim().replace(/\s/gu,"").replace(",",".");
    if(!text)return null;
    if(!/^\d{1,5}(?:\.\d{1,2})?$/u.test(text))return NaN;
    return Math.round(Number(text)*100);
  }
  function availableProducts(type,power){return products.filter(item=>(!item.type||item.type===type)&&(!item.power||item.power===power));}
  function totals(items){
    return items.reduce((sum,item)=>{
      const price=priceCents(item.price),quantity=Number(item.quantity);
      if(!Number.isFinite(price)||!Number.isInteger(quantity)||quantity<1||quantity>99)sum.missing++;
      else sum.cents+=price*quantity;
      return sum;
    },{cents:0,missing:0});
  }
  function instructions(type,power){
    const steps=type==="BTE"?[
      ["Czyszczenie wkładki usznej","Odłącz wkładkę i wężyk od aparatu. Czyść wyłącznie odłączone elementy bez elektroniki, używając przeznaczonych do tego środków. Czas działania tabletki i sposób płukania dobierz według instrukcji środka i wkładki. Przed ponownym podłączeniem dokładnie osusz wkładkę i wężyk; wodę z kanałów usuń gruszką osuszającą."],
      ["Obudowa aparatu","Usuwaj zabrudzenia szczoteczką i odpowiednią chusteczką. Nie zanurzaj aparatu w wodzie i nie podłączaj wilgotnej wkładki."]
    ]:[
      ["Wkładka, kopułka i słuchawka","Usuwaj woskowinę szczoteczką, a powierzchnię wkładki lub kopułki delikatnie przecieraj przeznaczoną do tego chusteczką. Nie mocz słuchawki, przewodu ani aparatu."],
      ["Filtr przeciwwoskowinowy","Kontroluj filtr przy słuchawce i wymieniaj go zgodnie z instrukcją producenta. Dobierz właściwy rodzaj filtra oraz kopułki; w razie wątpliwości poproś o pomoc w gabinecie."]
    ];
    steps.push(["Osuszanie","Stosuj wyłącznie sposób osuszania dopuszczony dla danego modelu. Kapsułki, pojemnik lub osuszacz stosuj zgodnie z ich instrukcją. Nie używaj gorącego powietrza ani źródeł ciepła."]);
    steps.push(power==="battery"
      ?["Bateria i wyłączanie","Na noc wyłącz aparat, otwierając komorę baterii. Baterie przechowuj poza zasięgiem dzieci; postępuj zgodnie z instrukcją aparatu."]
      :["Ładowanie i wyłączanie","Wyłączaj i ładuj aparat zgodnie z instrukcją producenta. Używaj właściwej ładowarki i odkładaj do niej suchy aparat. Nie otwieraj obudowy ani komory akumulatora. Osuszacz stosuj tylko wtedy, gdy producent dopuszcza go dla tego modelu."]);
    steps.push(["Uszkodzenie lub nieprawidłowe działanie","Nie klej i nie naprawiaj samodzielnie wkładki, słuchawki ani aparatu. Skontaktuj się z gabinetem protetycznym."]);
    return steps;
  }
  function create(a){
    const view=a.view,doc=a.document;if(!view)return null;
    view.innerHTML=`<section class="offer-builder care-builder unified-document-editor" aria-label="Pielęgnacja aparatów słuchowych">
      <div class="form-undo-tools care-toolbar"><button type="button" class="reset-filters-btn" data-care-new>Nowy formularz</button><div class="pricing-document-actions offer-actions"><span class="document-save-status">Tylko wydruk · bez zapisu</span><button type="button" data-care-print>Drukuj / PDF</button></div></div>
      <div class="care-person-row"><label class="person-name-field"><span>Imię i nazwisko (opcjonalnie)</span><input id="careCustomerInput" data-person-format="name" autocomplete="off"></label><label><span>Data</span><input id="careDateInput" data-date-picker placeholder="DD.MM.RRRR" autocomplete="off"></label></div>
      <div class="care-choice-row"><fieldset><legend>Rodzaj aparatu</legend><label><input type="radio" name="careType" value="BTE" checked><span>Zauszny · BTE</span></label><label><input type="radio" name="careType" value="RIC"><span>Ze słuchawką na zewnątrz · RIC</span></label></fieldset>
      <fieldset><legend>Zasilanie</legend><label><input type="radio" name="carePower" value="battery" checked><span>Bateryjny</span></label><label><input type="radio" name="carePower" value="rechargeable"><span>Ładowalny</span></label></fieldset></div>
      <details class="care-products-editor"><summary>Środki pielęgnacyjne i ceny</summary><div class="care-product-list"></div><p class="document-form-note">Zaznacz wybrane produkty. Ceny brutto za sztukę lub opakowanie uzupełnij według cennika.</p></details>
    </section><article id="pricingCarePrint" class="care-document"><header class="rodo-print-head"><div><span class="rodo-print-kicker">SATIS · Pracownia Słuchu</span><h2>Pielęgnacja aparatów słuchowych</h2><p data-care-variant></p></div><img src="satis-monogram.png" alt="SATIS"></header>
      <p class="care-person-output" data-care-person></p><ol class="care-instructions"></ol>
      <section class="care-price-section" hidden><h3>Wybrane środki i akcesoria</h3><table><thead><tr><th>Produkt</th><th>Ilość</th><th>Cena brutto</th><th>Wartość</th></tr></thead><tbody></tbody></table><p class="care-total"></p></section>
      <p class="care-safety">Pielęgnację dostosuj do konkretnego modelu aparatu, wkładki i akcesoriów. Zawsze stosuj instrukcję producenta; w razie wątpliwości skontaktuj się z gabinetem.</p>
      <footer class="care-footer">SATIS · Pracownia Słuchu</footer></article>`;
    const find=selector=>view.querySelector(selector),all=selector=>[...view.querySelectorAll(selector)];
    const name=find("#careCustomerInput"),date=find("#careDateInput"),output=find("#pricingCarePrint");
    const rows=new Map();
    function variant(){return {type:find('[name="careType"]:checked').value,power:find('[name="carePower"]:checked').value};}
    function node(tag,text){const item=doc.createElement(tag);if(text!==undefined)item.textContent=text;return item;}
    for(const product of products){
      const row=node("div");row.className="care-product-row";row.dataset.careProduct=product.id;
      const label=node("label"),check=node("input");check.type="checkbox";check.id=`careProduct-${product.id}`;
      label.append(check,node("span",product.name));
      const quantityLabel=node("label"),quantity=node("input");quantity.id=`careQuantity-${product.id}`;quantity.type="number";quantity.min="1";quantity.max="99";quantity.value="1";quantity.step="1";
      quantityLabel.append(node("span","Ilość"),quantity);
      const priceLabel=node("label"),price=node("input");price.id=`carePrice-${product.id}`;price.type="text";price.inputMode="decimal";price.placeholder="Do uzupełnienia";
      priceLabel.append(node("span","Cena brutto (zł)"),price);
      row.append(label,quantityLabel,priceLabel);find(".care-product-list").append(row);
      rows.set(product.id,{row,check,quantity,price,product});
    }
    function selected(){
      const {type,power}=variant();
      return availableProducts(type,power).map(item=>rows.get(item.id)).filter(item=>item.check.checked)
        .map(item=>({...item.product,quantity:item.quantity.value,price:item.price.value}));
    }
    function render(){
      const {type,power}=variant();
      const available=new Set(availableProducts(type,power).map(item=>item.id));
      for(const [id,item]of rows){
        item.row.hidden=!available.has(id);
        item.quantity.disabled=item.price.disabled=!available.has(id)||!item.check.checked;
        const price=priceCents(item.price.value);
        item.price.setCustomValidity(Number.isNaN(price)?"Wpisz cenę od 0 do 99 999,99 zł, z maksymalnie dwoma miejscami po przecinku.":"");
      }
      find("[data-care-variant]").textContent=`${type==="BTE"?"Aparaty zauszne (BTE)":"Aparaty ze słuchawką na zewnątrz (RIC)"} · ${power==="battery"?"bateryjne":"ładowalne"}`;
      find("[data-care-person]").textContent=[name.value.trim(),date.value.trim()].filter(Boolean).join(" · ");
      const steps=find(".care-instructions");steps.replaceChildren();
      for(const [title,text]of instructions(type,power)){const li=node("li");li.append(node("h3",title),node("p",text));steps.append(li);}
      const items=selected(),section=find(".care-price-section"),body=section.querySelector("tbody");
      section.hidden=!items.length;body.replaceChildren();
      for(const item of items){
        const row=node("tr"),price=priceCents(item.price),quantity=Number(item.quantity);
        const valid=Number.isFinite(price)&&Number.isInteger(quantity)&&quantity>=1&&quantity<=99;
        for(const text of [item.name,Number.isInteger(quantity)&&quantity>0?String(quantity):"—",Number.isFinite(price)?money(price):"Do uzupełnienia",valid?money(price*quantity):"Do uzupełnienia"])row.append(node("td",text));
        body.append(row);
      }
      const sum=totals(items);
      find(".care-total").textContent=sum.missing?`Wycenione pozycje: ${money(sum.cents)} · do uzupełnienia: ${sum.missing}`:`Razem: ${money(sum.cents)}`;
    }
    function validate(){
      render();
      return all(".care-product-row:not([hidden]) input:not(:disabled), #careDateInput").every(input=>input.reportValidity());
    }
    function reset(){
      name.value="";date.value=a.today();
      find('[name="careType"][value="BTE"]').checked=true;find('[name="carePower"][value="battery"]').checked=true;
      for(const item of rows.values()){item.check.checked=false;item.quantity.value="1";item.price.value="";}
      render();
    }
    find(".care-builder").addEventListener("input",render);
    find(".care-builder").addEventListener("change",render);
    find("[data-care-new]").addEventListener("click",()=>{
      if((name.value.trim()||selected().length)&&!a.confirm("Rozpocząć nowy formularz i wyczyścić bieżące dane?"))return;
      reset();
    });
    find("[data-care-print]").addEventListener("click",()=>{if(validate())void a.print();});
    reset();
    return {render,reset,validate,printSource:()=>output};
  }
  return {products,availableProducts,priceCents,totals,instructions,create};
});
