// Real offer markup and rendering functions, synthetic catalog, no external requests.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process'),{chromium}=require('playwright');
const root=path.join(__dirname,'..'),source=fs.readFileSync(path.join(root,'app.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const markup=html.slice(html.indexOf('<section id="pricingOfferView"'),html.indexOf('<section id="pricingLoanView"'));
function extract(name){const start=source.indexOf(`function ${name}(`);assert.ok(start>=0,name);const rest=source.slice(start);return rest.slice(0,rest.slice(1).search(/\n(?:async )?function /)+1);}
const names=['normalizePricingPrice','normalizePricingManufacturerName','normalizePricingNfzCode','pricingOfferAccessoryKind','isPricingModelUnavailable',
 'normalizeAudibelTradeName','repairShiftedPricingModel','repairPricingRecordColumns','normalizePricingRecordForUse','normalizePricingRecordsForUse',
 'pricingGeneralOfferBrand','normalizePricingGeneralRanges','pricingGeneralOfferRanges','currentPricingGeneralRanges','appendOfferCell','formatPricingAmount','formatPricingPrice',
 'renderPricingGeneralOffer','renderPricingOffer','normalizePricingOfferHistoryItem','pricingOfferHistoryEntryHasContent','normalizePricingOfferHistoryEntry',
 'currentPricingOfferSnapshot','restorePricingOfferFromHistory','resetOfferChargerPrice','selectedPricingOfferItems','setPricingOfferPatientGroup','pricingOfferPatientGroup','pricingOfferHistoryPatientGroup'];
const bindings=['pricingOfferView','offerGeneralInput','offerCustomerInput','offerLocationInput','offerDeviceInput1','offerDeviceInput2','offerTransferSidesBtn','offerChargerInput','offerChargerPriceInput','offerEarmoldInput','offerPfronInput','offerPfronEnabledInput','offerNoNfzInput','offerNotesInput','offerNotesText','offerNotesPrint','offerAgeWarning','offerEmptyState','offerContent','savePricingOfferBtn','printPricingOfferBtn','offerTitle','offerMeta','offerGrossTotal','offerPatientTotal','offerItemsBody','offerPaymentsBody','offerDateInput','pricingOfferDeviceList'];
const brands=['Audibel','Audio Service','Beltone','Bernafon','Oticon','Philips','Phonak','ReSound','Signia','Sonic','Starkey'];
const seed={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'pricing-data.js'),'utf8'),seed);
async function run(){
 const browser=await chromium.launch({headless:true,...(process.env.SATIS_CHROMIUM?{executablePath:process.env.SATIS_CHROMIUM}:{})});
 try{
  const page=await browser.newPage({viewport:{width:1366,height:1000}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',route=>{
   const url=new URL(route.request().url()),name=url.pathname.slice(1);if(url.origin!=='http://satis.test')return route.abort();
   if(!name)return route.fulfill({contentType:'text/html',body:`<!doctype html><html lang="pl"><head><meta charset="utf-8"><link rel="stylesheet" href="styles.css"></head><body><main class="app-shell"><section id="pricingNotebook"><section class="pricing-panel">${markup}</section></section></main><script>
    ${bindings.map(id=>`const ${id}=document.getElementById('${id}');`).join('\n')}
    const offerPatientGroupInputs=[...document.querySelectorAll('input[name="offerPatientGroup"]')],collator=new Intl.Collator('pl'),documentSaveLocks=new Map(),PRICING_OFFER_VALID_DAYS=30;
    const pricingFields=['idProduct','nfzCode','tradeName','model','manufacturer','orderIndex','grossPrice','swdCode'];
    const currentSupabaseUser={email:'owner@example.invalid'};
    let pricingGeneralOfferSavedRanges=null,pricingRecords=${JSON.stringify(brands.flatMap((manufacturer,index)=>[1000,6000].map(price=>({manufacturer,tradeName:manufacturer+' aparat',model:manufacturer+' model',nfzCode:'P.01.01.00',grossPrice:price+index*100}))))};
    const normalize=value=>String(value??'').toLowerCase().trim(),normalizeLoanHistoryText=value=>String(value??'').trim(),titleCaseName=value=>value;
    const isoDateForSave=value=>value||'',normalizeDocumentLocationValue=value=>value||'',makeId=()=> 'synthetic-offer',currentWorkstationName=()=> 'P63';
    const ensurePricingOfferDate=()=>offerDateInput.value||'2026-11-18',ensurePricingOfferLocation=()=> 'P63',addDaysToIsoDate=()=> '2026-12-18',formatDate=value=>value;
    function updateDocumentLocationAccent(){}function bindDocumentDraft(){}function renderPricingOfferDeviceList(){}function switchPricingView(){}function markAgreementDraftSaved(){}
    function setDateInputValue(input,value){input.value=value;}function pricingOfferDeviceLabel(record){return record.model;}
    function findPricingOfferRecord(value){return pricingRecords.find(row=>row.model===value)||null;}function findPricingOfferAccessoryRecord(){return null;}
    function selectedPricingOfferAllItems(){return selectedPricingOfferItems().map(item=>({...item,kind:'device'}));}function selectedPricingOfferAccessoryItems(){return [];}
    function updateOfferDevicePriceLabels(){}function pricingOfferNfzAmount(){return 1050;}function pricingOfferPfronAmount(){return 0;}
    function createPricingPriceElement(value){const node=document.createElement('span');node.textContent=value+' zł';return node;}
    function renderPricingOfferItems(items){offerItemsBody.replaceChildren(...items.map(item=>{const row=document.createElement('tr');appendOfferCell(row,item.record.model);return row;}));}
    function renderPricingOfferPayments(){offerPaymentsBody.replaceChildren();}function renderPricingOfferAgeWarning(){offerAgeWarning.hidden=true;}
    ${names.map(extract).join('\n')}
    pricingOfferView.hidden=false;offerCustomerInput.value='Osoba Testowa';offerDateInput.value='2026-11-18';offerDeviceInput1.value='Phonak model';offerPatientGroupInputs[0].checked=true;
    offerGeneralInput.addEventListener('change',()=>{pricingGeneralOfferSavedRanges=null;renderPricingOffer();});
    renderPricingOffer();
   </script></body></html>`});
   if(!['styles.css','satis-monogram.png','InterVariable.woff2','InterVariable-Italic.woff2'].includes(name))return route.abort();
   return route.fulfill({body:fs.readFileSync(path.join(root,name)),contentType:name.endsWith('.css')?'text/css':name.endsWith('.png')?'image/png':'font/woff2'});
  });
  await page.goto('http://satis.test');
  assert.equal(await page.locator('#offerGeneralContent').isVisible(),false);
  await page.locator('#offerGeneralInput').check();
  assert.equal(await page.locator('.offer-side-devices').isVisible(),false);assert.equal(await page.locator('.offer-patient-group').isVisible(),false);
  assert.equal(await page.locator('#printPricingOfferBtn').isEnabled(),true,'general offer needs no age group or selected model');
  assert.equal(await page.locator('#offerGeneralRows tr').count(),11);assert.equal(await page.locator('.offer-payments-table').isVisible(),false);
  assert.equal(await page.locator('.offer-items-table').isVisible(),false);assert.equal(await page.locator('.offer-total-line').isVisible(),false);
  const snapshot=await page.evaluate(()=>normalizePricingOfferHistoryEntry(currentPricingOfferSnapshot()));
  assert.equal(snapshot.items.length,0);assert.equal(snapshot.generalInformation,true);assert.equal(snapshot.priceRanges.length,11);
  await page.evaluate(saved=>{pricingRecords=[];restorePricingOfferFromHistory(saved);},snapshot);
  assert.equal(await page.locator('#offerGeneralRows tr').count(),11,'history keeps the original price ranges after catalog deletion');
  await page.evaluate(()=>{const output=document.createElement('div');output.id='clone';const copy=document.getElementById('pricingOfferPrint').cloneNode(true);copy.removeAttribute('id');output.append(copy);document.body.append(output);});
  assert.equal(await page.locator('#clone .offer-payments-table').isVisible(),false,'offline clone retains general-only presentation');
  await page.locator('#clone').evaluate(node=>node.remove());
  await page.locator('#pricingOfferPrint').scrollIntoViewIfNeeded();
  if(process.env.SATIS_QA_DIR)await page.locator('#pricingOfferPrint').screenshot({path:path.join(process.env.SATIS_QA_DIR,'offer-general-desktop.png')});
  await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if(process.env.SATIS_QA_DIR)await page.locator('#pricingOfferPrint').screenshot({path:path.join(process.env.SATIS_QA_DIR,'offer-general-mobile.png')});
  await page.setViewportSize({width:1366,height:1000});
  await page.evaluate(records=>{pricingRecords=normalizePricingRecordsForUse(records);pricingGeneralOfferSavedRanges=null;offerNotesInput.value='Dodatkowe ustalenia dotyczące doboru i testowania aparatów. '.repeat(6).slice(0,300);renderPricingOffer();},seed.window.PRICING_SEED_RECORDS);
  assert.ok(await page.locator('#offerGeneralRows tr').count()>=11,'the full local catalog includes all later manufacturers');
  await page.evaluate(()=>document.body.classList.add('pricing-offer-print'));await page.emulateMedia({media:'print'});await page.evaluate(()=>document.fonts.ready);
  if(process.env.SATIS_QA_DIR){const pdf=path.join(process.env.SATIS_QA_DIR,'offer-general.pdf');await page.pdf({path:pdf,format:'A4',printBackground:true,preferCSSPageSize:true});
   const info=execFileSync(process.env.SATIS_PDFINFO||'pdfinfo',[pdf],{encoding:'utf8'});assert.match(info,/Pages:\s+1\b/,'general offer fits on a single A4 page');}
  await page.emulateMedia({media:'screen'});await page.evaluate(()=>document.body.classList.remove('pricing-offer-print'));
  await page.locator('#offerGeneralInput').uncheck();assert.equal(await page.locator('.offer-side-devices').isVisible(),true);assert.equal(await page.locator('#offerGeneralContent').isVisible(),false);
  assert.equal(await page.locator('.offer-items-table').isVisible(),false,'restored general history does not secretly create product rows');
  await page.evaluate(()=>{pricingRecords=[];});await page.locator('#offerGeneralInput').check();assert.equal(await page.locator('#printPricingOfferBtn').isDisabled(),true,'empty catalog cannot produce made-up prices');
  assert.deepEqual(errors,[]);console.log('OK: general offer, 11 firms, no models or payment totals, history round trip, empty catalog, offline clone, mobile and single A4 print.');
 }finally{await browser.close();}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
