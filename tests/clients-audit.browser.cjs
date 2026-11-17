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
  const profile={id:'20000000-0000-0000-0000-000000000001',full_name:'Klient Testowy',phone:'',street:'',postal_code:'',city:'',location:'P63',revision:1};
  let sources=[{type:'offer',id:'offer-test',name:profile.full_name,date:'2026-11-17',kind:'Oferta',model:'Model testowy',open(){}},
   {type:'device',id:'sold-test',name:profile.full_name,date:'2026-11-17',kind:'Aparat',model:'Model testowy',serial:'TEST-SOLD',workflow:{type:'SPRZEDANY',pickupDate:'2026-11-17',invoice:'TEST-FS',ezwm:'REALIZACJA'},open(){}}];
  const detail={profile,links:sources.map(row=>({source_type:row.type,source_id:row.id})),activities:[],operations:[]};
  let journey={case_id:'30000000-0000-0000-0000-000000000001',revision:1,archived:false,data:SatisClientJourney.normalize({case_id:'30000000-0000-0000-0000-000000000001',source_keys:['offer:offer-test'],device_ids:['sold-test'],started_on:'2026-11-17',interest:'INTERESTED',referral:'REQUESTED'},'2026-11-17')};
  const stored=new Map([[journey.case_id,journey]]);let writes=0,ids=10,hold=false,release=null,missing=false,calls=[],reserveCalls=0,confirmDiscard=true;
  const response=selected=>({journey:selected,events:[],case_support:!missing,cases:[...stored.values()].map(row=>({case_id:row.case_id,kind:row.data.kind,started_on:row.data.started_on,archived:row.archived}))});
  const rpc=async(name,args)=>{calls.push(name);switch(name){
   case 'satis_clients_overview':case 'satis_clients_search':return {data:{profiles:[profile],total:1}};
   case 'satis_client_detail':return {data:detail};
   case 'satis_client_schedule_read':return {data:{hours:[],services:[]}};
   case 'satis_clients_upcoming':return {data:[]};
   case 'satis_client_journey_read':return {data:response(journey)};
   case 'satis_client_journey_case_read':return {data:response(stored.get(args.p_case_id))};
   case 'satis_client_journey_write':writes++;if(hold)await new Promise(resolve=>release=resolve);
    for(const row of stored.values())if(row.case_id!==args.p_data.case_id)row.archived=true;
    journey={case_id:args.p_data.case_id,revision:(args.p_expected_revision||0)+1,archived:false,data:args.p_data};stored.set(journey.case_id,journey);return {data:{journey}};
   default:throw Error('Unexpected RPC: '+name);
  }};
  const identity=value=>value||'';
  const module=SatisClients.create({document,journey:SatisClientJourney,owner:()=>true,user:()=> 'owner',active:()=>true,sources:()=>sources,rpc,
   id:()=> '40000000-0000-0000-0000-'+String(++ids).padStart(12,'0'),person:identity,phone:identity,street:identity,city:identity,addressParts:()=>({}),station:()=> 'P63',date:identity,dateTime:identity,
   setDate:(input,value)=>input.value=value,isoDate:identity,today:()=> '2026-11-17',locationPill:place=>{const node=document.createElement('span');node.textContent=place;return node;},locationAccent(){},confirm:()=>confirmDiscard,refreshCalendar(){},navigate(){},openForm(){},
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
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 if(process.env.SATIS_QA_DIR)await page.locator('#clientsDialog').screenshot({path:path.join(process.env.SATIS_QA_DIR,'clients-desktop.png')});
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 if(process.env.SATIS_QA_DIR)await page.locator('#clientsDialog').screenshot({path:path.join(process.env.SATIS_QA_DIR,'clients-mobile.png')});
 await page.evaluate(async()=>{missing=true;await testModule.select(profile.id);});
 assert.equal(await page.locator('[data-journey-reserve]').isDisabled(),true,'no unsafe reservation fallback before migration');
 assert.equal(await page.getByRole('button',{name:'Nowa sprawa',exact:true}).isDisabled(),true);
 await page.getByRole('button',{name:'Zamknij kartę klienta',exact:true}).click();
 assert.equal(await page.locator('#clientsDialog').evaluate(node=>node.open),false);
 await page.locator('#clientsDemoBtn').click();const count=await page.evaluate(()=>calls.length);
 for(const index of ['0','5','8','10'])await page.getByRole('combobox',{name:'Etap klienta demonstracyjnego',exact:true}).selectOption(index);
 assert.equal(await page.evaluate(()=>calls.length),count,'demonstration remains local and read-only');
 await page.evaluate(()=>testModule.clear());assert.equal(await page.locator('#clientJourney').textContent(),'');assert.deepEqual(errors,[]);
 console.log('OK: separate scrollable client modal, contextual actions, protected pending save, isolated cases, historical read-only view, atomic reservation, migration safety, demo privacy and responsive layouts.');
 }finally{await browser.close();}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
