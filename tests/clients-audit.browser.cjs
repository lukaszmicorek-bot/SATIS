// All API responses are synthetic. No production or external request is permitted.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const markup=html.slice(html.indexOf('<section id="clientsNotebook"'),html.indexOf('<section id="pricingNotebook"'));
async function run(){
 const browser=await chromium.launch({headless:true,...(process.env.SATIS_CHROMIUM?{executablePath:process.env.SATIS_CHROMIUM}:{})});
 try{
 const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/*',route=>{
  const url=new URL(route.request().url()),name=url.pathname.slice(1);
  if(url.origin!=='http://satis.test')return route.abort();
  if(!name)return route.fulfill({contentType:'text/html',body:`<!doctype html><html lang="pl"><head><meta charset="utf-8"><link rel="stylesheet" href="styles.css"></head><body><button id="clientsReminderBtn" hidden></button><main class="app-shell">${markup}</main><script src="client-journey.js"></script><script src="clients.js"></script><script>
  const profile={id:'20000000-0000-0000-0000-000000000001',full_name:'Klient Testowy',phone:'123 456 789',street:'',postal_code:'',city:'',location:'P63',revision:1};
  let sources=[{type:'offer',id:'offer-test',name:profile.full_name,date:'2026-11-17',kind:'Oferta',model:'Model testowy',open(){}},
   {type:'device',id:'sold-test',name:profile.full_name,date:'2026-11-17',kind:'Aparat',model:'Model testowy',serial:'TEST-SOLD',workflow:{type:'SPRZEDANY',pickupDate:'2026-11-17',invoice:'TEST-FS',ezwm:'REALIZACJA'},open(){}}];
  const detail={profile,links:sources.map(row=>({source_type:row.type,source_id:row.id})),activities:[],operations:[]};
  let journey={case_id:'30000000-0000-0000-0000-000000000001',revision:1,archived:false,data:SatisClientJourney.normalize({case_id:'30000000-0000-0000-0000-000000000001',source_keys:['offer:offer-test'],device_ids:['sold-test'],started_on:'2026-11-17',interest:'INTERESTED',referral:'REQUESTED'},'2026-11-17')};
  const stored=new Map([[journey.case_id,journey]]),confirmationStamps=new Map(),serverStamp='2026-11-17T10:15:00Z',appointments=[],bookingWrites=[];
  const testService={id:'service-test',name:'Kontrola testowa',price:150,duration_minutes:30,enabled:true};
  let writes=0,ids=10,hold=false,release=null,missing=false,calls=[],reserveCalls=0,confirmDiscard=true,todayValue='2026-11-17',holdBooking=false,releaseBooking=null;
  const response=selected=>({journey:selected,events:[],case_support:!missing,follow_up_support:!missing,confirmation_times:confirmationStamps.get(selected?.case_id)||{},rodo_confirmed_at:[...stored.values()].some(row=>row.data.confirmations.rodo)?serverStamp:null,rodo_confirmed_elsewhere:[...stored.values()].some(row=>row.case_id!==selected?.case_id&&row.data.confirmations.rodo),cases:[...stored.values()].map(row=>({case_id:row.case_id,kind:row.data.kind,started_on:row.data.started_on,archived:row.archived}))});
  const rpc=async(name,args)=>{calls.push(name);switch(name){
   case 'satis_clients_overview':case 'satis_clients_search':return {data:{profiles:[profile],total:1}};
   case 'satis_client_detail':return {data:detail};
   case 'satis_client_schedule_read':return {data:{hours:[{location:'P63',days:Array.from({length:7},(_,i)=>({closed:i>4,from:'08:00',to:'17:00'}))}],services:[testService]}};
   case 'satis_clients_upcoming':return {data:appointments};
   case 'satis_clients_write':{
    if(args.p_action!=='ACTIVITY')throw Error('Unexpected write');bookingWrites.push(args);
    if(holdBooking)await new Promise(resolve=>releaseBooking=resolve);
    const activity={...args.p_data,id:args.p_id,revision:1,full_name:profile.full_name};appointments.push(activity);detail.activities.push(activity);return {data:activity};
   }
   case 'satis_client_journey_read':return {data:response(journey)};
   case 'satis_client_journey_case_read':return {data:response(stored.get(args.p_case_id))};
   case 'satis_client_journey_write':writes++;if(hold)await new Promise(resolve=>release=resolve);
    {const previous=stored.get(args.p_data.case_id)?.data.confirmations||{},stamps={...(confirmationStamps.get(args.p_data.case_id)||{})};for(const [id,value]of Object.entries(args.p_data.confirmations)){if(value&&!previous[id])stamps[id]=serverStamp;if(!value)delete stamps[id];}confirmationStamps.set(args.p_data.case_id,stamps);}
    for(const row of stored.values())if(row.case_id!==args.p_data.case_id)row.archived=true;
    journey={case_id:args.p_data.case_id,revision:(args.p_expected_revision||0)+1,archived:false,data:args.p_data};stored.set(journey.case_id,journey);return {data:{journey}};
   default:throw Error('Unexpected RPC: '+name);
  }};
  const identity=value=>value||'';
  const module=SatisClients.create({document,journey:SatisClientJourney,owner:()=>true,user:()=> 'owner',active:()=>true,sources:()=>sources,rpc,
   id:()=> '40000000-0000-0000-0000-'+String(++ids).padStart(12,'0'),person:identity,phone:identity,street:identity,city:identity,addressParts:()=>({}),station:()=> 'P63',date:identity,dateTime:identity,
   setDate:(input,value)=>input.value=value,isoDate:identity,today:()=> todayValue,locationPill:place=>{const node=document.createElement('span');node.textContent=place;return node;},locationAccent(){},confirm:()=>confirmDiscard,refreshCalendar(){},navigate(){},openForm(){},
   availableDevices:()=>[{id:'available-one',model:'Aparat testowy',serial:'TEST-ONE',location:'P63',type:'NA STANIE'}],
   reserveDevices:async(_profile,ids,_links,attempt)=>{reserveCalls++;journey={case_id:attempt.state.case_id,revision:2,archived:false,data:attempt.state};stored.set(journey.case_id,journey);detail.links.push({source_type:'device',source_id:ids[0]});sources=[...sources,{type:'device',id:ids[0],name:profile.full_name,kind:'Aparat',date:'2026-11-17',model:'Aparat testowy',serial:'TEST-ONE',workflow:{type:'REZERWACJA'},open(){}}];return {journey,device_rows:[]};},onBeforeUnload(){}});
  window.testModule=module;document.getElementById('clientsNotebook').hidden=false;module.open().then(()=>module.select(profile.id));
  </script></body></html>`});
  if(!['clients.js','client-journey.js','styles.css','InterVariable.woff2','InterVariable-Italic.woff2'].includes(name))return route.abort();
  return route.fulfill({body:fs.readFileSync(path.join(root,name)),contentType:name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'font/woff2'});
 });
 await page.goto('http://satis.test');
 await page.waitForSelector('#clientJourney [data-journey-save]');
 assert.equal(await page.locator('#clientsDialog').evaluate(node=>node.open),true,'client opens in a separate native modal');
 assert.equal(await page.locator('#clientsDialogTitle').textContent(),'Klient Testowy');
 assert.equal(await page.locator('#clientsCasePanel').isVisible(),true);
 await page.getByRole('tab',{name:'Dane',exact:true}).click();
 await page.locator('#clientCity').fill('Miasto testowe');
 await page.getByRole('tab',{name:'Historia',exact:true}).click();
 assert.equal(await page.locator('#clientHistory').isVisible(),true);assert.equal(await page.locator('#clientJourney').isVisible(),false);
 await page.keyboard.press('ArrowRight');assert.equal(await page.getByRole('tab',{name:'Dane',exact:true}).getAttribute('aria-selected'),'true');
 assert.equal(await page.locator('#clientCity').inputValue(),'Miasto testowe','switching sections preserves typed contact data');
 await page.evaluate(()=>testModule.select(profile.id));
 await page.getByRole('tab',{name:'Sprawa',exact:true}).click();
 await page.locator('.client-journey-all-actions > summary').click();
 await page.getByRole('button',{name:'RODO potwierdzone',exact:true}).click();
 await page.locator('.client-journey-options > summary').click();
 await page.getByRole('checkbox',{name:'RODO potwierdzone',exact:true}).click();
 await page.evaluate(()=>hold=true);
 await page.locator('[data-journey-save]').click();await page.waitForFunction(()=>release!==null);
 await page.evaluate(()=>testModule.open());
 assert.equal(await page.getByRole('combobox',{name:'Zlecenie NFZ',exact:true}).isDisabled(),true,'core refresh must not unlock journey during save');
 await page.keyboard.press('Escape');assert.equal(await page.locator('#clientsDialog').evaluate(node=>node.open),true,'cannot close an in-flight save');
 await page.evaluate(()=>{const select=[...document.querySelectorAll('#clientJourney select')].find(node=>node.parentElement.textContent.startsWith('Zlecenie NFZ'));select.value='READY';select.dispatchEvent(new Event('change'));hold=false;release();});
 await page.waitForFunction(()=>!document.querySelector('[data-journey-save]').classList.contains('client-journey-unsaved'));
 assert.equal(await page.getByRole('combobox',{name:'Zlecenie NFZ',exact:true}).inputValue(),'REQUESTED');
 await page.getByRole('button',{name:'Nowa sprawa',exact:true}).click();
 assert.equal(await page.locator('#clientJourney .client-journey-chain li').count(),0,'new case has no mandatory generic checklist');
 assert.equal(await page.locator('#clientJourney .client-journey-summary').textContent(),'Wybierz czynność');
 for(const viewport of [{width:1366,height:768},{width:390,height:844}]){
  await page.setViewportSize(viewport);
  const tiles=await page.locator('.client-journey-suggestion button').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return {top:r.top,left:r.left,right:r.right,height:r.height};}));
  assert.ok(tiles.length>=2);assert.ok(Math.abs(tiles[0].top-tiles[1].top)<1,'action tiles share a row');assert.ok(tiles[0].right<tiles[1].left,'tiles do not overlap');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.locator('.clients-dialog-scroll').evaluate(node=>node.scrollTop=0);
  if(process.env.SATIS_QA_DIR)await page.locator('#clientsDialog').screenshot({path:path.join(process.env.SATIS_QA_DIR,'clients-actions-'+viewport.width+'.png')});
 }
 await page.setViewportSize({width:1366,height:768});
 await page.locator('[data-journey-save]').click();await page.waitForFunction(()=>stored.size===2);
 const currentId=await page.evaluate(()=>journey.case_id);
 await page.getByRole('combobox',{name:'Sprawa klienta',exact:true}).selectOption('30000000-0000-0000-0000-000000000001');
 await page.waitForFunction(()=>document.querySelector('#clientJourney').textContent.includes('tylko do odczytu'));
 assert.equal(await page.locator('[data-journey-save]').isDisabled(),true,'older case cannot be overwritten');
 await page.getByRole('combobox',{name:'Sprawa klienta',exact:true}).selectOption(currentId);
 await page.locator('.client-journey-devices summary').click();await page.locator('.client-journey-device-list input').check();
 await page.locator('[data-journey-reserve]').click();await page.waitForFunction(()=>reserveCalls===1&&!document.querySelector('[data-journey-save]').classList.contains('client-journey-unsaved'));
 assert.equal(await page.evaluate(()=>calls.filter(name=>name==='satis_clients_write').length),0,'no separate LINK after atomic reservation');
 await page.getByRole('button',{name:'Zamknij kartę klienta',exact:true}).click();
 await page.getByRole('button',{name:'Do kontaktu',exact:true}).click();await page.waitForFunction(()=>calls.includes('satis_clients_search'));
 await page.locator('[data-client-stage=""]').click();
 await page.evaluate(()=>testModule.select(profile.id));
 await page.evaluate(()=>{document.querySelector('.clients-dialog-scroll').scrollTop=0;document.querySelector('.client-journey-options').open=false;});
 assert.equal(await page.getByRole('combobox',{name:'Sprawa klienta',exact:true}).isVisible(),false,'case configuration is collapsed by default');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 if(process.env.SATIS_QA_DIR)await page.locator('#clientsDialog').screenshot({path:path.join(process.env.SATIS_QA_DIR,'clients-desktop.png')});
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 const aligned=await page.evaluate(()=>{const children=[...document.querySelector('#clientsContactSummary').children];const [phone,place]=children.map(node=>node.getBoundingClientRect());return Math.abs((phone.top+phone.height/2)-(place.top+place.height/2))<1;});
 assert.equal(aligned,true,'phone and location remain on one line in the customer heading');
 const heading=await page.evaluate(()=>{const [name,summary]=['#clientsDialogTitle','#clientsContactSummary'].map(selector=>document.querySelector(selector).getBoundingClientRect());return {sameRow:Math.abs((name.top+name.height/2)-(summary.top+summary.height/2))<1,noOverlap:name.right<=summary.left};});
 assert.deepEqual(heading,{sameRow:true,noOverlap:true},'name, phone and location share one header row');
 assert.equal(await page.locator('.client-journey-suggestions h4').count(),0,'suggestion heading has been removed');
 assert.ok((await page.locator('.client-journey-suggestion button').first().boundingBox()).height>=60,'suggested action tiles are larger');
 await page.getByRole('tab',{name:'Dane',exact:true}).click();
 const fields=await page.evaluate(()=>{const phone=document.querySelector('#clientPhone').getBoundingClientRect(),place=document.querySelector('#clientLocation').getBoundingClientRect();return {sameRow:Math.abs(phone.top-place.top)<1,notOverlapping:phone.right<place.left};});
 assert.deepEqual(fields,{sameRow:true,notOverlapping:true},'phone and location fields share one row on mobile');
 await page.getByRole('tab',{name:'Sprawa',exact:true}).click();
 if(process.env.SATIS_QA_DIR)await page.locator('#clientsDialog').screenshot({path:path.join(process.env.SATIS_QA_DIR,'clients-mobile.png')});
 await page.evaluate(async()=>{missing=true;await testModule.select(profile.id);});
 assert.equal(await page.locator('[data-journey-reserve]').isDisabled(),true,'no unsafe reservation fallback before migration');
 assert.equal(await page.getByRole('button',{name:'Nowa sprawa',exact:true}).isDisabled(),true);
 await page.evaluate(async()=>{missing=false;sources=[{type:'loan',id:'follow-loan',name:profile.full_name,date:'2026-11-01',kind:'Umowa wypożyczenia',workflow:{periodFrom:'2026-11-01',returnDate:''},open(){}}];detail.links=[{source_type:'loan',source_id:'follow-loan'}];journey={...journey,data:SatisClientJourney.normalize({case_id:journey.case_id,source_keys:['loan:follow-loan'],started_on:'2026-11-01'},todayValue)};stored.clear();stored.set(journey.case_id,journey);await testModule.select(profile.id);});
 assert.equal(await page.locator('.client-consent-notice').isVisible(),true);
 assert.equal(await page.locator('.client-follow-up.due').isVisible(),true);
 await page.getByRole('button',{name:'Potwierdź dokument',exact:true}).click();
 await page.waitForFunction(()=>journey.data.confirmations.rodo&&!document.querySelector('[data-journey-save]').classList.contains('client-journey-unsaved'));
 assert.equal(await page.locator('.client-consent-notice').count(),0);
 assert.ok((await page.locator('.client-confirmation-stamp').textContent()).includes('2026-11-17T10:15:00Z'),'confirmation shows the saved server timestamp');
 await page.locator('.client-follow-up-later summary').click();
 await page.getByRole('textbox',{name:'Data ponownego kontaktu',exact:true}).fill('2026-11-20');
 assert.equal(await page.locator('[data-journey-save]').isEnabled(),true,'draft contact date is protected as an unsaved edit');
 await page.getByRole('button',{name:'Zapisz termin',exact:true}).click();
 await page.waitForFunction(()=>journey.data.follow_up?.contact_on==='2026-11-20'&&!document.querySelector('[data-journey-save]').classList.contains('client-journey-unsaved'));
 assert.equal(await page.locator('.client-follow-up.due').count(),0);
 await page.evaluate(async()=>{todayValue='2026-11-20';await testModule.select(profile.id);});
 assert.equal(await page.locator('.client-follow-up.due').isVisible(),true,'postponed reminder reappears on the chosen day');
 await page.getByRole('button',{name:'Rezygnacja',exact:true}).click();await page.waitForFunction(()=>journey.data.interest==='DECLINED'&&!document.querySelector('[data-journey-save]').classList.contains('client-journey-unsaved'));
 assert.equal(await page.locator('.client-follow-up').count(),0);assert.ok((await page.locator('#clientJourney').textContent()).includes('wypożyczeń'),'declining purchase must not finish the loan');
 await page.getByRole('button',{name:'Zamknij kartę klienta',exact:true}).click();
 assert.equal(await page.locator('#clientsDialog').evaluate(node=>node.open),false);
 assert.equal(await page.locator('#clientsDemoBtn, #clientsDemoPanel').count(),0,'no demonstration client is offered');
 await page.evaluate(async()=>{testModule.clear();await testModule.open();});
 await page.setViewportSize({width:1366,height:900});
 await page.evaluate(()=>todayValue='2026-11-17');await page.locator('#clientsScheduleToday').click();
 await page.getByRole('button',{name:'Dzień',exact:true}).click();
 const day=page.locator('.clients-schedule-day[data-day="2026-11-17"]');
 const start=day.locator('button[aria-label^="2026-11-17, 09:00"]'),end=day.locator('button[aria-label^="2026-11-17, 09:45"]');
 await start.scrollIntoViewIfNeeded();const first=await start.boundingBox(),last=await end.boundingBox();
 await page.mouse.move(first.x+first.width/2,first.y+first.height/2);await page.mouse.down();
 await page.mouse.move(last.x+last.width/2,last.y+last.height/2,{steps:5});await page.keyboard.press('Escape');await page.mouse.up();
 assert.equal(await page.locator('#clientsBookingDialog').evaluate(node=>node.open),false,'Escape cancels a mouse selection without opening a booking');
 await page.mouse.move(first.x+first.width/2,first.y+first.height/2);await page.mouse.down();
 await page.mouse.move(last.x+last.width/2,last.y+last.height/2,{steps:5});
 assert.equal(await day.locator('.clients-schedule-selection').textContent(),'09:00–10:00');
 await page.mouse.up();
 assert.equal(await page.locator('#clientsBookingDialog').evaluate(node=>node.open),true);
 assert.equal(await page.locator('#clientsBookingFrom').inputValue(),'09:00');assert.equal(await page.locator('#clientsBookingTo').inputValue(),'10:00');
 assert.equal(await page.evaluate(()=>bookingWrites.length),0,'selecting time never writes');
 assert.equal(await page.locator('#clientsBookingSearch').inputValue(),'','no prior client is required to start a booking');
 await page.locator('#clientsBookingClose').click();
 await page.mouse.move(last.x+last.width/2,last.y+last.height/2);await page.mouse.down();await page.mouse.move(first.x+first.width/2,first.y+first.height/2,{steps:5});await page.mouse.up();
 assert.equal(await page.locator('#clientsBookingFrom').inputValue(),'09:00');assert.equal(await page.locator('#clientsBookingTo').inputValue(),'10:00','reverse dragging selects the same interval');
 await page.locator('#clientsBookingSearch').fill('Testowy');await page.locator('#clientsBookingResults button').first().click();
 await page.locator('#clientsBookingService').selectOption('service-test');
 assert.equal(await page.locator('#clientsBookingTo').inputValue(),'10:00','service selection preserves the dragged duration');
 await page.locator('#clientsBookingTo').fill('07:00');await page.locator('#clientsBookingSave').click();
 assert.equal(await page.evaluate(()=>bookingWrites.length),0);assert.ok((await page.locator('#clientsBookingMessage').textContent()).includes('przedział'));
 await page.locator('#clientsBookingTo').fill('10:00');
 if(process.env.SATIS_QA_DIR)await page.locator('#clientsBookingDialog').screenshot({path:path.join(process.env.SATIS_QA_DIR,'clients-booking-desktop.png')});
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 if(process.env.SATIS_QA_DIR)await page.locator('#clientsBookingDialog').screenshot({path:path.join(process.env.SATIS_QA_DIR,'clients-booking-mobile.png')});
 await page.evaluate(()=>holdBooking=true);await page.locator('#clientsBookingSave').click();await page.waitForFunction(()=>releaseBooking!==null);
 await page.keyboard.press('Escape');assert.equal(await page.locator('#clientsBookingDialog').evaluate(node=>node.open),true);
 await page.evaluate(()=>{document.getElementById('clientsBookingForm').dispatchEvent(new Event('submit',{cancelable:true}));holdBooking=false;releaseBooking();});
 await page.waitForFunction(()=>!document.getElementById('clientsBookingDialog').open);
 assert.equal(await page.evaluate(()=>bookingWrites.length),1,'double submission cannot create two visits');
 assert.equal(await page.evaluate(()=>bookingWrites[0].p_data.duration_minutes),60);
 assert.equal(await page.evaluate(()=>bookingWrites[0].p_data.customer_id),await page.evaluate(()=>profile.id));
 assert.equal(await day.locator('.clients-schedule-event').count(),1);
 assert.equal(await page.locator('#clientsBookingSearch').inputValue(),'','closed booking clears customer data');
 await page.evaluate(()=>testModule.clear());assert.equal(await page.locator('#clientJourney').textContent(),'');assert.deepEqual(errors,[]);
 assert.equal(await page.locator('#clientsContactSummary').textContent(),'');assert.equal(await page.locator('#clientsDialogTitle').textContent(),'Karta klienta');
 console.log('OK: client modal, action tiles, confirmation dates, isolated cases, atomic reservation, mouse range booking, client/service selection, protected duplicate submission and responsive layouts.');
 }finally{await browser.close();}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
