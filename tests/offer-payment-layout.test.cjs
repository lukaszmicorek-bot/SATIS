const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {test}=require('node:test');
const source=fs.readFileSync(require.resolve('../app.js'),'utf8');
const css=fs.readFileSync(require.resolve('../styles.css'),'utf8');
const html=fs.readFileSync(require.resolve('../index.html'),'utf8');
function extract(name){
  const start=source.indexOf(`function ${name}(`);assert.ok(start>=0,name);
  const rest=source.slice(start);return rest.slice(0,rest.slice(1).search(/\n(?:async )?function /)+1);
}
function element(tag){
  return {tagName:tag,children:[],className:'',_text:'',append(...children){this.children.push(...children);},
    classList:{names:new Set(),add(name){this.names.add(name);},toggle(name,on){if(on)this.names.add(name);else this.names.delete(name);}},
    setAttribute(){},addEventListener(){},
    replaceChildren(...children){this.children=children;this._text='';},
    set textContent(value){this._text=String(value);this.children=[];},
    get textContent(){return this._text+this.children.map(child=>child.textContent).join('');}};
}
function setup(){
  const body=element('tbody');
  const table=element('table'),itemsBody=element('tbody');itemsBody.closest=()=>table;
  const ctx=vm.createContext({offerPaymentsBody:body,offerItemsBody:itemsBody,offerCustomerInput:{value:'Anna Testowa'},titleCaseName:value=>value,
    pricingOfferNfzCodeMatchesAge:()=>false,
    document:{createElement:element},PRICING_OFFER_NFZ_PER_DEVICE:1050,
    createPricingPriceElement:value=>{const cell=element('span');cell.textContent=`${value} zł`;return cell;},
    formatPricingPrice:value=>`${value} zł`});
  vm.runInContext(source.match(/const PRICING_OFFER_NFZ_BY_CODE = \{[\s\S]*?\};/)[0],ctx);
  for(const name of ['normalizePricingNfzCode','pricingOfferDeviceName','pricingOfferNfzAmount','pricingOfferItemKindLabel',
    'pricingOfferItemDescription','renderPricingOfferItems','pricingOfferPaymentRows','appendOfferCell','appendOfferPriceCell','renderPricingOfferPayments'])vm.runInContext(extract(name),ctx);
  return {ctx,body,table,itemsBody};
}
const devices=[{kind:'device',slot:1,record:{model:'Długi model aparatu P',nfzCode:'P.01.01.00'}},
  {kind:'device',slot:2,record:{model:'Inny model aparatu L',nfzCode:'P.01.01.01'}}];
const items=[...devices,{kind:'charger',record:{model:'Charger'}},{kind:'earmold',record:{model:'Wkładka'}}];
const totals={nfz:4050,pfron:1000,patient:2000,pfronEnabled:true,withoutNfz:false};
test('funding lines separate each ear, model and NFZ limit, with unchanged payment amounts',()=>{
  const {ctx}=setup(),rows=ctx.pricingOfferPaymentRows(items,devices,totals,'Anna Testowa');
  assert.deepEqual(Array.from(rows,row=>row.amount),[4050,1000,2000]);
  assert.equal(rows[0].products.length,2);
  assert.equal(rows[0].products[0].label,'Aparat P');assert.equal(rows[0].products[1].label,'Aparat L');
  assert.match(rows[0].products[0].detail,/P\.01\.01\.00 · Limit NFZ: 1050 zł/);
  assert.match(rows[0].products[1].detail,/Limit NFZ: 3000 zł/);
  assert.equal(rows[2].payer,'Pacjent');assert.equal(rows[2].customer,'Anna Testowa');
  assert.equal(rows[2].summary,'Aparat P · Aparat L · Ładowarka · Wkładka uszna');
  assert.doesNotMatch(rows[2].summary,/Długi model|Inny model/);
});
test('no NFZ, hidden PFRON, zero patient payment and capped NFZ stay accurate',()=>{
  const {ctx}=setup();
  const rows=ctx.pricingOfferPaymentRows(items,devices,{...totals,withoutNfz:true,nfz:0,pfron:0,pfronEnabled:false});
  assert.equal(rows.length,2);assert.match(rows[0].title,/bez refundacji NFZ/);assert.equal(rows[0].products.length,0);
  assert.equal(rows[1].title,'Pełna wartość zakupu');
  const covered=ctx.pricingOfferPaymentRows(items,devices,{...totals,nfz:500,pfron:0,patient:0});
  assert.equal(covered[0].amount,500,'descriptive limits cannot replace actual capped refund');
  assert.equal(covered[2].amount,0);assert.equal(covered[2].title,'Dopłata po dofinansowaniu');
});
test('same two models retain P/L distinction; a single device does not invent a second ear',()=>{
  const {ctx}=setup(),same=devices.map(item=>({...item,record:devices[0].record}));
  const rows=ctx.pricingOfferPaymentRows(same,same,totals);
  assert.equal(rows[0].products.length,2);
  assert.notEqual(rows[0].products[0].label,rows[0].products[1].label);
  assert.equal(ctx.pricingOfferPaymentRows([devices[0]],[devices[0]],totals)[0].products.length,1);
});
test('rendered rows use structured text, separate customer, no interpreted markup',()=>{
  const {ctx,body}=setup(),unsafe='<img src=x onerror=alert(1)>';
  ctx.offerCustomerInput.value=unsafe;
  const data=[{...devices[0],record:{...devices[0].record,model:unsafe}}];
  ctx.renderPricingOfferPayments(data,data,totals);
  assert.equal(body.children.length,3);
  const patient=body.children[2];assert.equal(patient.children.length,3);
  assert.equal(patient.children[0].children[0].className,'offer-payer-name');
  assert.equal(patient.children[0].children[0].textContent,unsafe);
  const detail=body.children[0].children[1];
  assert.equal(detail.className,'offer-payment-description');
  assert.equal(detail.children[1].children[0].children[1].textContent,unsafe);
  assert.doesNotMatch(extract('renderPricingOfferPayments'),/innerHTML|insertAdjacentHTML/);
  ctx.renderPricingOfferPayments(data,data,{...totals,pfronEnabled:false});
  assert.equal(body.children.length,2,'rerender replaces rows rather than appending duplicates');
});
test('description takes most table width on screen and print, long text wraps and amounts stay aligned',()=>{
  assert.match(html,/<table class="offer-payments-table">\s*<colgroup>[\s\S]*?offer-payer-col[\s\S]*?offer-description-col[\s\S]*?offer-amount-col[\s\S]*?<\/colgroup>/);
  assert.match(css,/\.offer-payments-table \.offer-description-col \{ width: 64%; \}/);
  assert.match(css,/\.offer-payments-table \.offer-payer-col \{ width: 20%; \}/);
  assert.match(css,/\.offer-payment-description \{ overflow-wrap: anywhere; \}/);
  assert.match(css,/\.offer-payment-products li \{[^}]*grid-template-columns: max-content minmax\(0, 1fr\)/);
  assert.match(css,/body\.pricing-offer-print \.offer-payment-products li \{ break-inside: avoid; \}/);
  assert.match(css,/\.offer-payments-table td:nth-child\(3\) \{[^}]*text-align: right;[^}]*white-space: nowrap;/);
});

test('without refund hides all product codes and mismatch warnings, restoring them when enabled',()=>{
  const {ctx,table,itemsBody}=setup();
  ctx.renderPricingOfferItems(items,true);
  assert.equal(table.classList.names.has('offer-without-nfz'),true);
  assert.ok(itemsBody.children.every(row=>!row.classList.names.has('offer-age-mismatch')));
  assert.doesNotMatch(itemsBody.textContent,/P\.01\.01\./);
  assert.ok(itemsBody.children.every(row=>row.children[2].className==='offer-nfz-column'));
  ctx.renderPricingOfferItems(items,false);
  assert.equal(table.classList.names.has('offer-without-nfz'),false);
  assert.match(itemsBody.textContent,/P\.01\.01\.00/);
  assert.equal(itemsBody.children[0].classList.names.has('offer-age-mismatch'),true);
  assert.match(html,/<th class="offer-nfz-column">Kod NFZ<\/th>/);
  assert.match(css,/\.offer-items-table\.offer-without-nfz \.offer-nfz-column\s*\{\s*display: none;/);
  assert.match(extract('renderPricingOfferAgeWarning'),/offerNoNfzInput\?\.checked/);
});
