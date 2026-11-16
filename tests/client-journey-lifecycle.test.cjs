const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const journey=require('../client-journey.js'),source=fs.readFileSync('app.js','utf8');
function extract(name){const start=new RegExp(`^(?:async )?function ${name}\\(`,'m').exec(source).index,rest=source.slice(start);return rest.slice(0,rest.slice(1).search(/\n(?:async )?function /)+1);}
function fixture(){
 const profile={id:'20000000-0000-0000-0000-000000000001',full_name:'Klient Demonstracyjny',location:'P63',phone:''};
 const actor={id:'00000000-0000-0000-0000-000000000001',email:'test@example.invalid'};
 const identity=v=>v,iso=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')?v:'',key=v=>String(v||'').replace(/\s+/g,'').toUpperCase(),name=v=>String(v||'').trim().toLowerCase();
 const c=vm.createContext({profile,currentSupabaseUser:actor,sensitiveStateGeneration:1,hasSupabaseConfig:true,clientsSourceCache:{refs:[],rows:[]},
  records:['P','L'].map(side=>({id:`sale-${side}`,serialNumber:`TEST-SALE-${side}`,deviceName:`Aparat testowy ${side}`,type:'NA STANIE',receivedDate:'2026-10-01',location:'P63'})),
  repairRecords:[],demoRecords:['P','L'].map(side=>({id:`demo-${side}`,serialNumber:`TEST-DEMO-${side}`,deviceName:`Demo testowe ${side}`,currentUser:profile.full_name,loanDate:'2026-10-19',status:'WYPOŻYCZONY'})),
  pricingLoanHistory:[{id:'loan-test',customer:profile.full_name,date:'2026-10-19',periodFrom:'2026-10-19',periodTo:'2026-11-02',city:'P63',number:'TEST-UM/10/2026',rightDevice:{model:'Demo testowe P',serial:'TEST-DEMO-P'},leftDevice:{model:'Demo testowe L',serial:'TEST-DEMO-L'},returnDate:''}],
  pricingOfferHistory:[],pricingOrderHistory:[],pricingComplaintHistory:[],
  canViewPrivateModules:()=>true,requireInitialDataReady:()=>true,isFullPersonName:()=>true,isoDateForSave:iso,displayType:r=>r.type,deviceStatusDisplayLabel:identity,deviceEzwmStatus:r=>r.ezwm||'',
  normalizePricingLoanHistory:identity,normalizePricingOfferHistory:identity,normalizePricingOrderHistory:identity,normalizePricingComplaintHistory:identity,
  isOrderRepairRecord:r=>r.sourceDocumentType==='ORDER',repairDocumentInfo:r=>({number:r.sourceDocumentNumber}),repairSerialNumbers:r=>[r.serialNumber,r.serialNumber2].filter(Boolean),
  serialDuplicateKey:key,customerNameLookupKey:name,currentDateLocationKey:v=>v||'P63',titleCaseName:identity,
  pricingOfferAccessoryKind:r=>/charger|ładowar/i.test(r.model||'')?'charger':'',hasValidStockIdentity:r=>Boolean(r.deviceName&&r.serialNumber),isInStock:r=>r.type==='NA STANIE',
  satisChangeQueue:{flush:async()=>{}},SUPABASE_DEVICE_TABLE:'device_records',STORAGE_KEY:'synthetic-test',
  satisDataStore:{prepare:(_table,r)=>r,commit:async()=>{}},writeSensitiveStorage(){},rebuildAfterDeviceChange(){},logAuditEvent(){}});
 for(const fn of ['repairOrderProgress','repairPhoneReturnKey','repairPhoneNotifiedForReturn','clientsCurrentSources','reserveClientJourneyDevices'])vm.runInContext(extract(fn),c);
 const links=[{source_type:'loan',source_id:'loan-test'}],activities=[];
 const state=journey.normalize({started_on:'2026-10-19',trial_required:true,devices_required:2},'2026-10-19');
 return {c,profile,links,activities,state};
}
test('complete synthetic lifecycle: loan, return, offer, NFZ, two aids, sale, documents and later complaint',async()=>{
 const {c,profile,links,activities,state}=fixture(),snapshots=[],issues=[];
 function capture(id,label,date){const context={profile,links:[...links],activities:[...activities],sources:c.clientsCurrentSources()};const plan=journey.build(context,state,date);
  snapshots.push(JSON.parse(JSON.stringify({id,label,date,state,context,result:{done:plan.done,total:plan.total,complete:plan.complete,next:plan.next,openServices:plan.openServices.length,activeLoans:plan.activeLoans.length}})));return plan;}
 let p=capture('loan','Wypożyczenie dwóch aparatów i umowa','2026-10-19');assert.equal(p.activeLoans.length,1);assert.equal(p.complete,false);
 c.pricingLoanHistory=c.pricingLoanHistory.map(r=>({...r,returnDate:'2026-11-02'}));
 p=capture('demo-not-closed','Umowa zwrócona, ale Demo jeszcze niezakończone','2026-11-02');assert.equal(p.activeLoans.length,1,'stale Demo must block closure');
 c.demoRecords=c.demoRecords.map(r=>({...r,currentUser:'',returnDate:'2026-11-02',status:'NA STANIE'}));
 p=capture('returned','Zwrot umowy oraz zwolnienie obu Demo','2026-11-02');assert.equal(p.activeLoans.length,0);assert.equal(p.steps.find(s=>s.id==='return').done,true);
 state.interest='INTERESTED';c.pricingOfferHistory=[{id:'offer-test',customer:profile.full_name,offerDate:'2026-11-02',location:'P63',items:[{model:'Aparat testowy P'},{model:'Aparat testowy L'}]}];links.push({source_type:'offer',source_id:'offer-test'});state.confirmations.rodo=true;
 capture('offer-rodo','Zainteresowanie zakupem, oferta i potwierdzone RODO','2026-11-02');
 state.referral='REQUESTED';p=capture('referral-pending','Zlecenie NFZ do uzyskania','2026-11-03');assert.equal(p.steps.find(s=>s.id==='referral').done,false);
 state.referral='READY';await c.reserveClientJourneyDevices(profile,['sale-P','sale-L']);state.device_ids=['sale-P','sale-L'];links.push(...state.device_ids.map(id=>({source_type:'device',source_id:id})));
 p=capture('reserved','Zlecenie gotowe i dwa aparaty zarezerwowane','2026-11-03');assert.equal(p.devices.length,2);assert.equal(p.steps.find(s=>s.id==='devices').done,true);assert.ok(c.records.every(r=>r.type==='REZERWACJA'&&r.clientProfileId===profile.id));
 activities.push({id:'visit-test',kind:'VISIT',status:'PLANNED',starts_at:'2026-11-04T10:00:00Z',title:'Dopasowanie i odbiór aparatów',location:'P63'});state.visit_id='visit-test';
 p=capture('visit-planned','Wizyta zaplanowana na 04.11','2026-11-03');assert.equal(p.steps.find(s=>s.id==='visit').done,false);
 activities[0]={...activities[0],status:'COMPLETED'};c.records=c.records.map(r=>({...r,type:'SPRZEDANY',salesInvoice:'TEST-FS/11/2026',pickupDate:'2026-11-04',ezwm:'POBRANE'}));
 p=capture('sale-incomplete','Wizyta odbyta i sprzedaż; brak realizacji oraz części dokumentów','2026-11-04');assert.equal(p.complete,false);assert.equal(p.steps.find(s=>s.id==='delivery').done,true);assert.equal(p.steps.find(s=>s.id==='ezwm').done,false);assert.ok(p.missing.some(s=>s.id==='receipt'));
 c.records=c.records.map(r=>({...r,ezwm:'REALIZACJA'}));
 for(const flag of ['fitting','receipt','instructions','warranty','care'])state.confirmations[flag]=true;
 p=capture('purchase-complete','Zakup kompletny: EZWM, odbiór, instrukcje, gwarancja i pielęgnacja','2026-11-04');assert.equal(p.complete,true);assert.equal(p.done,p.total);
 c.pricingComplaintHistory=[{id:'complaint-test',customer:profile.full_name,date:'2026-11-09',location:'P63',number:'TEST-REK/11/2026',items:[{productName:'Aparat testowy P',serial:'TEST-SALE-P'}]}];links.push({source_type:'complaint',source_id:'complaint-test'});
 p=capture('complaint-without-service','Reklamacja: formularz bez wpisu Serwisu','2026-11-09');assert.equal(p.complete,false);assert.equal(p.openServices.length,1);assert.equal(p.services[0].missingService,true);if(!p.next)issues.push('Po zakończonym zakupie nowa reklamacja nie wskazuje następnego kroku.');
 c.repairRecords=[{id:'service-test',customerName:profile.full_name,category:'NAPRAWA GWARANCYJNA',deviceName:'Aparat testowy P',serialNumber:'TEST-SALE-P',location:'P63',receivedDate:'2026-11-09',sourceDocumentType:'COMPLAINT',sourceDocumentId:'complaint-test',sourceDocumentNumber:'TEST-REK/11/2026'}];links.push({source_type:'service',source_id:'service-test'});
 p=capture('service-received','Reklamacja przyjęta do Serwisu','2026-11-09');assert.equal(p.services.length,1,'form and service must be one branch');assert.equal(p.complete,false);
 c.repairRecords=c.repairRecords.map(r=>({...r,sentDate:'2026-11-10'}));capture('service-sent','Aparat wysłany do naprawy','2026-11-10');
 c.repairRecords=c.repairRecords.map(r=>({...r,returnDate:'2026-11-13'}));p=capture('service-returned','Aparat wrócił — klient jeszcze niepoinformowany','2026-11-13');assert.equal(p.complete,false);if(!p.next||!/telefon|poinform/i.test(p.next.title))issues.push('Po powrocie reklamacji brak wskazania telefonu jako następnego kroku.');
 c.repairRecords=c.repairRecords.map(r=>({...r,phoneNotifiedAt:'2026-11-13T11:15:00Z',phoneNotifiedBy:'test@example.invalid',phoneNotifiedReturnKey:'2026-11-13'}));
 p=capture('service-phoned','Poinformowano telefonicznie; oczekiwanie na odbiór','2026-11-13');assert.ok(p.services[0].steps.find(s=>s.label==='Poinformowano tel.').date);assert.equal(p.complete,false);if(!p.next||!/odb[iió]/i.test(p.next.title))issues.push('Po telefonie brak wskazania odbioru reklamacji jako następnego kroku.');
 c.repairRecords=c.repairRecords.map(r=>({...r,pickupDate:'2026-11-16'}));
 p=capture('all-complete','Reklamacja odebrana; cała droga zakończona','2026-11-16');assert.equal(p.complete,true);assert.equal(p.openServices.length,0);assert.equal(p.activeLoans.length,0);assert.equal(p.events.filter(e=>e.label==='Odebrano').length,1);
 const report={test:'SATIS — fikcyjna droga klienta',client:profile.full_name,scope:'Lokalny test integracji źródeł i logiki przebiegu. Bez połączenia z produkcją i bez wysyłania dokumentów.',snapshots,issues};
 if(process.env.SATIS_LIFECYCLE_RESULT)fs.writeFileSync(process.env.SATIS_LIFECYCLE_RESULT,JSON.stringify(report,null,2));
 for(const s of snapshots)console.log(`${s.id}: ${s.result.done}/${s.result.total}; zakończona=${s.result.complete}; otwarte serwisy=${s.result.openServices}`);
 assert.deepEqual(issues,[]);
});
