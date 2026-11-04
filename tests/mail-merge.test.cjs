const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const root = process.env.SATIS_ROOT || path.resolve(__dirname, '..');
const m = require(process.env.SATIS_MODULE || path.join(root,'mail-merge.js'));
const example = {personRole:'applicant',firstName:'Jan',middleName:'Adam',surname:'Testowy',pesel:'90010112349',birthDate:'01.01.1990',
  city:'Żywiec',street:'Testowa',house:'12',flat:'3',postal:'34-300',postOffice:'Żywiec',monthlyIncome:'2 500,50',householdSize:'3',phone:'500 600 700',email:'-',applicationNumber:'-',gender:'female',localityType:'city',invalidityGroup:'none',
  province:'śląskie',county:'żywiecki',municipality:'Żywiec',degree:'moderate',certificateValidity:'indefinite',
  careHome:'no',householdType:'shared',paymentMode:'transfer',bankOwner:'Jan Adam Testowy',bankName:'Bank testowy',bankAccount:'61109010140000071219812874',certificateNumber:'TEST/2026',subject:'Aparaty słuchowe, 2 szt.',orderNumber:'TEST-1; TEST-2',cost:'8 000,00',nfz:'2100',requested:'3 000',role:'we własnym imieniu'};
test('amounts use integer cents and reject invalid grants or malformed money',()=>{
  assert.equal(m.parseMoney('1 234,56 zł'),123456);assert.equal(m.parseMoney('0'),0);
  for(const value of ['',null,'-2','abc','12.345','9'.repeat(400)]) assert.equal(m.parseMoney(value),null);
  assert.deepEqual(m.amounts(example),{cost:800000,nfz:210000,requested:300000,own:590000,remaining:290000});
  assert.equal(m.validate(example,()=>true).length,0);
  assert.ok(m.validate({...example,nfz:'0'},()=>true).some(error=>error.field==='nfz'));
  assert.ok(m.validate({...example,requested:'7000'},()=>true).some(error=>error.field==='requested'));
  assert.ok(m.validate({...example,postal:'34300'},()=>false).some(error=>error.field==='pesel'));
  assert.deepEqual(m.splitName('Jan Adam Testowy'),{firstName:'Jan',middleName:'Adam',surname:'Testowy'});
});
test('GUS dictionary is limited to Żywiec county and stays small enough for immediate loading',()=>{
  const filename=path.join(root,'mail-merge/geography.json');
  const data=JSON.parse(fs.readFileSync(filename,'utf8')),index=m.geographyIndex(data);
  assert.equal(data.countyScope,'2417');assert.equal(data.places.length,69);assert.equal(Object.keys(data.units).length,15);
  assert.ok(data.places.every(place=>place[1].startsWith('2417')));assert.ok(fs.statSync(filename).size<10000);
  assert.equal(m.geographyMatches(index,'zywiec')[0].county,'żywiecki');
  assert.deepEqual(m.geographyMatches(index,'Bielsko-Biała'),[]);assert.deepEqual(m.geographyMatches(index,'Cieszyn'),[]);
  assert.deepEqual(m.geographyMatches(index,'Nieznana Testowa Miejscowość'),[]);
});
test('checkbox marks fit realistic font widths without blocking valid printouts',()=>{
  const marks=m.placements({...example,gender:'female',sameAddress:true}).filter(item=>item.text==='X');
  assert.equal(marks.length,9);
  for(const mark of marks) assert.ok(m.fitText(mark.text,mark.width,mark.height,(text,size)=>text.length*size*0.72),mark.field);
});
test('placements retain original blank sections and map applicant or ward fields to their own cells',()=>{
  const applicant=m.placements(example), ward=m.placements({...example,personRole:'ward',role:''});
  assert.equal(applicant.find(item=>item.field==='firstName').page,1);
  assert.equal(ward.find(item=>item.field==='firstName').page,2);
  assert.equal(ward.find(item=>item.field==='phone').page,3);
  assert.equal(ward.some(item=>item.field==='role'),false);
  assert.equal(applicant.find(item=>item.field==='degree').page,3);
  assert.equal(applicant.find(item=>item.field==='requested').text,'3 000,00');
  for(const item of [...applicant,...ward]) {
    assert.ok([1,2,3,4,5].includes(item.page));assert.ok(item.x>=0&&item.x+item.width<=m.PAGE.width);
    assert.ok(item.y>=0&&item.y+item.height<=m.PAGE.height);
  }
  for(let page=1;page<=7;page++) {
    const svg=fs.readFileSync(path.join(root,`mail-merge/page-${page}.svg`),'utf8');
    assert.match(svg,/<svg/);assert.doesNotMatch(svg,/<script|<foreignObject|href="https?:/i);
  }
});
test('long text wraps or reduces size without silently discarding characters',()=>{
  const measure=(text,size)=>text.length*size*0.5;
  const value='Bielsko-Biała (miasto na prawach powiatu)';
  const fit=m.fitText(value,360,14,measure);assert.ok(fit);assert.equal(fit.text.replace(/\n/g,''),value);
  assert.equal(m.fitText('X'.repeat(500),40,10,measure),null);
  assert.equal(m.fitText('X',1,20,measure),null);
});

function fixture(overrides={}) {
  const nodes=new Map(),stored=new Map();let owner=true,prints=0,sequence=0,saveCalls=0,failure=null,pauseSave=null;
  class E {
    constructor(tag){this.tag=tag;this.children=[];this.value='';this.checked=false;this.hidden=false;this.dataset={};this.style={};this.events={};this.attributes={};this._text='';this.className='';this.classList={add:n=>{this.className=[...new Set([...this.className.split(/\s+/u).filter(Boolean),n])].join(' ');},remove:n=>{this.className=this.className.split(/\s+/u).filter(value=>value&&value!==n).join(' ');},toggle:(n,on)=>on?this.classList.add(n):this.classList.remove(n)};}
    set id(value){this._id=value;nodes.set(value,this);}get id(){return this._id;}
    set textContent(value){this._text=String(value);this.children=[];}get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
    append(...children){for(const child of children){child.parent=this;this.children.push(child);}}
    replaceChildren(...children){this.children=[];this.append(...children);}
    remove(){if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this);this.parent=null;}
    setAttribute(k,v){this.attributes[k]=v;}removeAttribute(k){delete this.attributes[k];}
    dispatchEvent(event){return this.emit(event.type);}
    addEventListener(k,fn){(this.events[k]||=[]).push(fn);}emit(k){return Promise.all((this.events[k]||[]).map(fn=>fn({preventDefault(){}})));}
    setCustomValidity(value){this.validity=value;}reportValidity(){return !this.validity;}focus(){}
    querySelectorAll(selector){return this.children.flatMap(c=>[...((selector===c.tag||selector.startsWith('.')&&c.className.split(' ').includes(selector.slice(1)))?[c]:[]),...c.querySelectorAll(selector)]);}
    decode(){return Promise.resolve();}
  }
  const host=new E('section');host.id='mailMergeNotebook';const body=new E('body');body.append(host);
  const window={Event:class{constructor(type){this.type=type;}},events:{},addEventListener(k,fn){this.events[k]=fn;},removeEventListener(k){delete this.events[k];}};
  const api=m.create({document:{getElementById:id=>nodes.get(id),createElement:tag=>new E(tag),createDocumentFragment:()=>new E('fragment'),body,fonts:{ready:Promise.resolve()}},window,
    owner:()=>owner,user:()=>owner?'satis-test':'gabinet-test',validPesel:value=>/^\d{11}$/.test(value),age:()=>36,
    birthDate:()=> '01.01.1990',iso:value=>value,date:value=>value,name:value=>value,city:value=>value,phone:value=>value,postal:value=>value,
    cityForPostal:()=>'',contacts:()=>[],address:()=>({}),bindDate(){},confirm:()=>true,id:()=>String(++sequence),
    measure:(text,size)=>text.length*size*0.5,loadGeography:async()=>({units:{},places:[]}),print:async()=>{prints++;},
    rpc:async(name,args)=>{
      if(failure)return {error:{code:failure}};
      if(name==='satis_mail_merge_list')return {data:{rows:[...stored.values()].map(entry=>({...entry})),total:stored.size,schemaVersion:6}};
      if(name==='satis_mail_merge_detail')return {data:stored.get(args.p_id)};
      if(args.p_action==='DELETE'){stored.delete(args.p_id);return {data:{id:args.p_id,deleted:true}};}
      saveCalls++;if(pauseSave)await pauseSave;
      if([...stored.values()].some(entry=>entry.id!==args.p_id && entry.data.pesel && entry.data.pesel===args.p_data.pesel))return {error:{code:'PT423'}};
      const entry={id:args.p_id,revision:(stored.get(args.p_id)?.revision||0)+1,data:{...args.p_data}};stored.set(args.p_id,entry);return {data:{id:entry.id,revision:entry.revision}};
    },...overrides});
  const buttons=()=>host.querySelectorAll('button');
  return {api,nodes,body,window,stored,owner(value){owner=value;},prints:()=>prints,saveCalls:()=>saveCalls,
    fail(code){failure=code;},pause(promise){pauseSave=promise;},
    fill(data=example){for(const [key,value]of Object.entries(data)){const input=nodes.get('merge'+key);if(input)input.value=value;}},
    click(text){const target=['Zapisz','Zapisz zmiany'].includes(text)?nodes.get('mailMergeSave'):buttons().find(button=>button.textContent===text || button.textContent.startsWith(text));assert.ok(target,text);return target.emit('click');}};
}
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
test('persistent people accept incomplete drafts and reopen after clearing the session',async()=>{
  const t=fixture();t.api.open();await tick();
  assert.equal(t.nodes.get('mailMergePreviewPages').querySelectorAll('.mail-merge-page').length,7);
  assert.doesNotMatch(t.nodes.get('mailMergePreviewPages').textContent,/we własnym imieniu/);
  t.fill({firstName:'Jan',surname:'Testowy'});await t.click('Zapisz roboczo');assert.equal(t.stored.size,1);
  t.api.clear();assert.equal(t.nodes.get('mailMergePreviewPages').children.length,0);
  t.api.open();await tick();assert.equal(t.api.queue().length,1);
  await t.click('Edytuj');assert.equal(t.nodes.get('mergefirstName').value,'Jan');assert.equal(t.nodes.get('mergepesel').value,'');
  await t.click('Drukuj wniosek');assert.equal(t.prints(),0);assert.match(t.nodes.get('mailMergeMessage').textContent,/PESEL/);
  await t.click('Drukuj pusty');assert.equal(t.prints(),1);
  assert.equal(t.nodes.get('mailMergePrint').querySelectorAll('.mail-merge-page').length,7);
  t.api.clear();
});
test('live preview, saved-person batch printing, duplicate PESEL and owner session cleanup',async()=>{
  const t=fixture();t.fill();await t.nodes.get('mergefirstName').emit('blur');
  assert.match(t.nodes.get('mailMergePreviewPages').textContent,/Testowy/);
  await t.click('Zapisz');assert.equal(t.stored.size,1);
  const row=t.api.queue()[0];assert.equal(row.data.birthDate,undefined);
  const selected=t.nodes.get('mailMergeQueue').querySelectorAll('input')[0];selected.checked=true;await selected.emit('change');
  await t.click('Drukuj wybrane');assert.equal(t.prints(),1);
  t.window.events.afterprint();await t.click('Nowy wniosek');t.fill();await t.click('Zapisz');assert.equal(t.stored.size,1);
  assert.match(t.nodes.get('mailMergeMessage').textContent,/PESEL/);
  t.owner(false);await t.click('Drukuj wniosek');assert.equal(t.prints(),1);
  t.api.clear();assert.deepEqual(t.api.queue(),[]);assert.equal(t.nodes.get('mergepesel').value,'');
  assert.equal(t.nodes.get('mailMergePreviewPages').children.length,0);assert.equal(t.api.open(),false);
});
test('save button rejects double clicks, network failure retains edits, and deletion is explicit',async()=>{
  const t=fixture();t.fill();let release;t.pause(new Promise(resolve=>{release=resolve;}));
  const pending=t.click('Zapisz');await tick();await t.click('Zapisz');assert.equal(t.saveCalls(),1);release();await pending;
  t.pause(null);t.fail('PT409');t.fill({firstName:'Adam'});await t.click('Zapisz');
  assert.equal(t.nodes.get('mergefirstName').value,'Adam');assert.match(t.nodes.get('mailMergeMessage').textContent,/innym komputerze/);
  t.fail(null);await t.click('Usuń');assert.equal(t.stored.size,0);t.api.clear();
});
test('missing database schema does not prevent a blank preview and explains the migration',async()=>{
  const t=fixture();t.fail('PGRST202');t.api.open();await tick();
  assert.match(t.nodes.get('mailMergeDatabaseStatus').textContent,/supabase-mail-merge.sql/);
  assert.equal(t.nodes.get('mailMergePreviewPages').querySelectorAll('.mail-merge-page').length,7);t.api.clear();
});
test('database access is restricted to SATIS and gabinet, with no personal data in browser storage',()=>{
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(html,/data-view="mailMerge" data-view-group="pcpr" data-private-shared hidden/);
  assert.match(html,/id="mailMergeTab"[^>]*>PCPR Żywiec<\/button>/);
  assert.doesNotMatch(fs.readFileSync(path.join(root,'mail-merge.js'),'utf8'),/Korespondencja seryjna|bazy korespondencji/);
  assert.match(app,/\["workTime", "clients"\]\.includes\(notebookName\) && !canViewPrivateModules/);
  assert.match(app,/mailMergeModule\?\.clear\(\)/);
  const source=fs.readFileSync(process.env.SATIS_MODULE||path.join(root,'mail-merge.js'),'utf8');
  assert.doesNotMatch(source,/localStorage|sessionStorage|indexedDB|innerHTML|fetch\(/);
  assert.match(source,/satis_mail_merge_write/);
  const sql=fs.readFileSync(process.env.SATIS_SQL||path.join(root,'supabase-mail-merge.sql'),'utf8');
  assert.equal((sql.match(/public\.is_satis_owner\(\) is not true/g)||[]).length,1);
  assert.equal((sql.match(/lower\(auth.jwt\(\)->>'email'\)='gabinet@pracowniasluchu.pl'/g)||[]).length,3);assert.match(sql,/Delete requires SATIS owner/);
  assert.match(sql,/force row level security/);assert.match(sql,/revoke all on public\.%I from public, anon, authenticated/);
  assert.match(sql,/req\.fingerprint is distinct from fp/);assert.match(sql,/revision is distinct from p_expected_revision/);
  assert.match(sql,/unique index if not exists mail_merge_people_pesel_idx/);
  assert.doesNotMatch(sql,/drop table|truncate|delete from public\.(device_records|repair_records|loan_contracts)/i);
  assert.match(fs.readFileSync(path.join(root,'styles.css'),'utf8'),/@page mailMerge \{ size: A4 portrait; margin: 0; \}/);
});

function contactRules() {
  const source=fs.readFileSync(path.join(root,'app.js'),'utf8'),vm=require('node:vm');
  function extract(name){const start=source.indexOf(`function ${name}(`),rest=source.slice(start);return rest.slice(0,rest.slice(1).search(/\n(?:async )?function /)+1);}
  const ctx={normalize:value=>String(value||'').toLocaleLowerCase('pl-PL'),normalizeLoanHistoryText:value=>String(value||'').trim().replace(/\s+/gu,' '),pcprPhoneDigits:value=>String(value||'').replace(/\D/gu,''),pcprDigitGroups:(value,groups)=>{let i=0;return groups.map(size=>{const part=value.slice(i,i+size);i+=size;return part;}).filter(Boolean).join(' ');},postalStreetKey:value=>String(value||'').toLowerCase().replace(/^ul\.\s*/u,'').trim()};
  vm.createContext(ctx);for(const name of ['titleCaseName','formatLoanStreet','formatPcprPostalCode','pcprPhoneDigits','formatPcprPhone','normalizePcprCity','suggestPostalCode'])vm.runInContext(extract(name),ctx);
  const entries=[{city:'Żywiec',postalCode:'34-300',street:'ul. Przykładowa'},{city:'Bielsko-Biała',postalCode:'43-300',street:'ul. Traugutta'},{city:'Testowo',postalCode:'10-100',street:'ul. Pierwsza'},{city:'Testowo',postalCode:'10-101',street:'ul. Druga'},{city:'Druga Wieś',postalCode:'20-200',street:''},{city:'Trzecia Wieś',postalCode:'20-200',street:''}];
  return {name:ctx.titleCaseName,street:ctx.formatLoanStreet,city:value=>/^bielsko$/iu.test(value.trim())?'Bielsko-Biała':ctx.normalizePcprCity(value),phone:ctx.formatPcprPhone,postal:ctx.formatPcprPostalCode,
    postalEntries:()=>entries,postalSuggestion:ctx.suggestPostalCode,cityForPostal:()=>'',loadGeography:async()=>({units:{},places:[]})};
}
test('PCPR contact fields normalize before save even when Enter avoids blur',async()=>{
  const t=fixture(contactRules());t.fill({firstName:'jan',middleName:'adam',surname:'testowy-kowalski',city:'bielsko',street:'traugutta',house:'12a',flat:'3b',postal:'43300',phone:'500600800',province:'śląskie'});
  await t.click('Zapisz roboczo');const saved=[...t.stored.values()][0].data;
  assert.equal(saved.firstName,'Jan');assert.equal(saved.middleName,'Adam');assert.equal(saved.surname,'Testowy-Kowalski');
  assert.equal(saved.city,'Bielsko-Biała');assert.equal(saved.street,'ul. Traugutta');assert.equal(saved.postal,'43-300');
  assert.equal(saved.house,'12A');assert.equal(saved.phone,'500 600 800');assert.equal(saved.province,'Śląskie');t.api.clear();
});
test('postal code fills a unique city, city fills a known code and changing city clears only automatic codes',async()=>{
  const t=fixture(contactRules());t.fill({postal:'34300'});await t.nodes.get('mergepostal').emit('input');
  assert.equal(t.nodes.get('mergepostal').value,'34-300');assert.equal(t.nodes.get('mergecity').value,'Żywiec');
  assert.equal(t.nodes.get('mergepostOffice').value,'Żywiec');
  t.fill({postal:'99999'});await t.nodes.get('mergepostal').emit('input');
  assert.equal(t.nodes.get('mergecity').value,'');assert.equal(t.nodes.get('mergepostOffice').value,'');
  await t.click('Nowy wniosek');t.fill({city:'bielsko'});await t.nodes.get('mergecity').emit('blur');
  assert.equal(t.nodes.get('mergecity').value,'Bielsko-Biała');assert.equal(t.nodes.get('mergepostal').value,'43-300');
  t.fill({city:'Żywiec'});await t.nodes.get('mergecity').emit('input');await t.nodes.get('mergecity').emit('blur');
  assert.equal(t.nodes.get('mergepostal').value,'34-300');assert.equal(t.nodes.get('mergepostOffice').value,'Żywiec');t.api.clear();
});
test('ambiguous addresses require a choice and do not overwrite manually entered postal codes',async()=>{
  const t=fixture(contactRules());t.fill({city:'Testowo'});await t.nodes.get('mergecity').emit('blur');
  assert.equal(t.nodes.get('mergepostal').value,'');assert.match(t.nodes.get('mailMergePostalChoices').textContent,/10-100/);
  await t.click('10-101');assert.equal(t.nodes.get('mergepostal').value,'10-101');
  await t.click('Nowy wniosek');t.fill({city:'Żywiec',postal:'99-999'});await t.nodes.get('mergecity').emit('blur');
  assert.equal(t.nodes.get('mergepostal').value,'99-999');assert.match(t.nodes.get('mailMergePostalChoices').textContent,/34-300/);
  await t.click('Nowy wniosek');t.fill({postal:'20200'});await t.nodes.get('mergepostal').emit('input');
  assert.equal(t.nodes.get('mergecity').value,'');assert.match(t.nodes.get('mailMergePostalChoices').textContent,/Druga Wieś/);
  await t.click('20-200 · Druga Wieś');assert.equal(t.nodes.get('mergecity').value,'Druga Wieś');t.api.clear();
});

test('all applicable fields are required for a completed application but absence may be explicit',()=>{
  for(const key of ['middleName','street','postOffice','certificateNumber','certificateValidity','gender','localityType','invalidityGroup']){
    assert.ok(m.validate({...example,[key]:''},()=>true).some(error=>error.field===key),key);
  }
  assert.equal(m.validate({...example,middleName:'-',street:'-',flat:'-',email:'-',applicationNumber:'-'},()=>true).length,0);
  assert.equal(m.draftValidate({firstName:'Jan',surname:'Testowy'},()=>true).length,0);
});
test('GUS resolves city and rural municipality kind without guessing between namesakes',()=>{
  const index=m.geographyIndex(JSON.parse(fs.readFileSync(path.join(root,'mail-merge/geography.json'),'utf8')));
  assert.equal(m.geographyMatches(index,'Żywiec')[0].kind,'miasto');
  assert.equal(m.geographyMatches(index,'Łodygowice')[0].kind,'wieś');
  assert.deepEqual(m.geographyMatches(index,'Cieszyn'),[]);
});
test('gender, locality kind and invalidity group map to original applicant and ward fields',()=>{
  const marks=m.placements({...example,gender:'female',invalidityGroup:'II'});
  assert.equal(marks.find(item=>item.field==='invalidityGroup').y,454.1);
  assert.equal(marks.find(item=>item.field==='localityType').text,'X');
  assert.equal(marks.find(item=>item.field==='localityType').x,202.6);
  assert.deepEqual(marks.filter(item=>item.checkbox).map(item=>item.text),['Miasto','Wieś']);
  assert.equal(m.placements({...example,localityType:'village'}).find(item=>item.field==='localityType').x,286.7);
  const ward=m.placements({...example,personRole:'ward',localityType:'village',invalidityGroup:'III'});
  assert.equal(ward.find(item=>item.field==='localityType').page,3);
  assert.equal(ward.find(item=>item.field==='localityType').y,195.4);
});
test('page selection changes blank, current and batch print count and warns about omitted sections',async()=>{
  const t=fixture();await t.click('5 stron');
  assert.match(t.nodes.get('mailMergePrintNotice').textContent,/oświadczenia/);
  assert.equal(t.nodes.get('mailMergePreviewPages').querySelectorAll('.mail-merge-page').length,5);
  await t.click('Drukuj pusty');assert.equal(t.nodes.get('mailMergePrint').querySelectorAll('.mail-merge-page').length,5);t.window.events.afterprint();
  t.fill();await t.click('Drukuj wniosek');assert.equal(t.nodes.get('mailMergePrint').querySelectorAll('.mail-merge-page').length,5);t.window.events.afterprint();
  await t.click('Zapisz');const check=t.nodes.get('mailMergeQueue').querySelectorAll('input')[0];check.checked=true;await check.emit('change');
  await t.click('Drukuj wybrane');assert.equal(t.nodes.get('mailMergePrint').querySelectorAll('.mail-merge-page').length,5);t.window.events.afterprint();
  await t.click('7 stron');assert.equal(t.nodes.get('mailMergePrintNotice').textContent,'');
  await t.click('Drukuj pusty');assert.equal(t.nodes.get('mailMergePrint').querySelectorAll('.mail-merge-page').length,7);t.api.clear();
});
test('gender follows PESEL and missing fields block regular save without blocking drafts',async()=>{
  const t=fixture();t.fill({firstName:'Jan',surname:'Testowy',pesel:'90010112349'});
  await t.nodes.get('mergepesel').emit('input');await t.click('Sprawdź kompletność');
  assert.equal(t.nodes.get('mergegender').value,'female');
  await t.click('Zapisz');assert.equal(t.stored.size,0);
  await t.click('Zapisz roboczo');assert.equal(t.stored.size,1);t.api.clear();
});
test('settlement type updates from an unambiguous GUS result',async()=>{
  const t=fixture({loadGeography:async()=>({units:{'2400002':['Gmina Testowa','Powiat Testowy','Śląskie']},places:[['Wieś Testowa','2400002','1000','']]})});
  t.fill({city:'Wieś Testowa'});await t.nodes.get('mergecity').emit('blur');await tick();
  assert.equal(t.nodes.get('mergelocalityType').value,'village');t.api.clear();
});
test('outdated SQL explicitly blocks new writes without deleting existing data',async()=>{
  let writes=0;
  const t=fixture({rpc:async(name)=>{if(name==='satis_mail_merge_list')return {data:{rows:[],total:0}};writes++;return {data:{}};}});
  t.fill();await t.click('Zapisz');assert.equal(writes,0);
  assert.match(t.nodes.get('mailMergeMessage').textContent,/aktualny plik supabase-mail-merge.sql/);t.api.clear();
});

test('certificate number is uppercase on input and save; indefinite dates are dimmed, disabled and omitted',async()=>{
  const t=fixture();t.fill({...example,certificateNumber:'pzon.ab/2026',certificateValidity:'periodic',certificateUntil:'31.12.2027'});
  await t.nodes.get('mergecertificateNumber').emit('input');assert.equal(t.nodes.get('mergecertificateNumber').value,'PZON.AB/2026');
  t.fill({certificateValidity:'indefinite'});await t.nodes.get('mergecertificateValidity').emit('change');
  assert.equal(t.nodes.get('mergecertificateUntil').disabled,true);assert.equal(t.nodes.get('mergecertificateUntil').value,'');
  assert.match(t.nodes.get('mergecertificateUntil').parent.className,/mail-merge-muted/);
  t.fill({certificateValidity:'periodic'});await t.nodes.get('mergecertificateValidity').emit('change');
  assert.equal(t.nodes.get('mergecertificateUntil').disabled,false);assert.equal(t.nodes.get('mergecertificateUntil').value,'31.12.2027');
  t.fill({certificateValidity:'indefinite'});await t.nodes.get('mergecertificateValidity').emit('change');await t.click('Zapisz zmiany');
  const saved=[...t.stored.values()][0].data;assert.equal(saved.certificateNumber,'PZON.AB/2026');assert.equal(saved.certificateUntil,'');t.api.clear();
});
test('one or two products keep their order numbers paired and require the second pair only when enabled',async()=>{
  const t=fixture();t.fill();t.fill({itemCount:'2',subject2:'Aparat L',orderNumber2:''});await t.nodes.get('mergeitemCount').emit('change');
  assert.equal(t.nodes.get('mergesubject2').parent.hidden,false);await t.click('Zapisz zmiany');assert.equal(t.stored.size,0);
  assert.match(t.nodes.get('mailMergeMessage').textContent,/Numer zlecenia 2/);
  t.fill({orderNumber2:'NFZ-2'});await t.click('Zapisz zmiany');const saved=[...t.stored.values()][0].data;
  assert.equal(saved.subject2,'Aparat L');assert.equal(saved.orderNumber2,'NFZ-2');
  const marks=m.placements(saved);assert.equal(marks.find(item=>item.field==='subject').text,saved.subject);
  assert.match(marks.find(item=>item.field==='orderNumber').text,/2\. NFZ-2/);
  for(const item of marks)assert.ok(m.fitText(item.text,item.width,item.height,(text,size)=>text.length*size*0.5),item.field);
  t.fill({itemCount:'1'});await t.nodes.get('mergeitemCount').emit('change');assert.equal(t.nodes.get('mergesubject2').value,'');assert.equal(t.nodes.get('mergesubject2').parent.hidden,true);t.api.clear();
});
test('a locally imported blank template requires review before printing and never changes saved people',async()=>{
  let disposed=0;
  const t=fixture({importTemplate:async()=>({name:'Pusty wzór.pdf',count:5,images:Array(5).fill('data:image/png;base64,AA'),dispose(){disposed++;}})});
  const input=t.nodes.get('mailMergeTemplateFile');input.files=[{name:'Pusty wzór.pdf'}];await input.emit('change');
  assert.equal(t.nodes.get('mailMergeTemplateApply').disabled,true);assert.equal(t.nodes.get('mailMergePrint7').disabled,true);
  await t.click('Drukuj pusty');assert.equal(t.prints(),0);
  t.nodes.get('mailMergeTemplateConfirm').checked=true;await t.nodes.get('mailMergeTemplateConfirm').emit('change');await t.click('Zastosuj wzór');
  await t.click('Drukuj pusty');assert.equal(t.prints(),1);assert.equal(t.nodes.get('mailMergePrint').querySelectorAll('.mail-merge-page').length,5);
  assert.equal(t.stored.size,0);t.window.events.afterprint();await t.click('Przywróć oryginalny');assert.equal(disposed,1);
  assert.equal(t.nodes.get('mailMergePrint7').disabled,false);assert.equal(t.nodes.get('mailMergePreviewPages').querySelectorAll('.mail-merge-page').length,7);t.api.clear();
});

function regionalGeography(){return {...JSON.parse(fs.readFileSync(path.join(root,'mail-merge/geography.json'),'utf8')),postalCodes:JSON.parse(fs.readFileSync(path.join(root,'mail-merge/postal-reference.json'),'utf8')).codes};}
test('34-325 immediately fills common administrative fields but asks for Bierna or Łodygowice',async()=>{
  const t=fixture({...contactRules(),loadGeography:async()=>regionalGeography()});
  t.fill({postal:'34325'});await t.nodes.get('mergepostal').emit('input');
  assert.equal(t.nodes.get('mergepostal').value,'34-325');assert.equal(t.nodes.get('mergecity').value,'');
  assert.equal(t.nodes.get('mergemunicipality').value,'Łodygowice');assert.equal(t.nodes.get('mergecounty').value,'Żywiecki');assert.equal(t.nodes.get('mergeprovince').value,'Śląskie');
  assert.equal(t.nodes.get('mergelocalityType').value,'village');assert.equal(t.nodes.get('mergepostOffice').value,'Łodygowice');
  assert.match(t.nodes.get('mailMergePostalChoices').textContent,/Bierna/);assert.match(t.nodes.get('mailMergePostalChoices').textContent,/Łodygowice/);
  await t.click('34-325 · Bierna');assert.equal(t.nodes.get('mergecity').value,'Bierna');assert.equal(t.nodes.get('mergepostOffice').value,'Łodygowice');
  await t.nodes.get('mergecity').emit('blur');assert.equal(t.nodes.get('mergemunicipality').value,'Łodygowice');assert.equal(t.nodes.get('mergecounty').value,'Żywiecki');t.api.clear();
});
test('known locality plus postal code resolves region without a second choice and reverse lookup works',async()=>{
  const t=fixture({...contactRules(),loadGeography:async()=>regionalGeography()});
  t.fill({city:'Łodygowice',postal:'34325'});await t.nodes.get('mergepostal').emit('input');
  assert.equal(t.nodes.get('mergecounty').value,'Żywiecki');assert.equal(t.nodes.get('mergeprovince').value,'Śląskie');assert.equal(t.nodes.get('mailMergePostalChoices').children.length,0);
  await t.click('Nowy wniosek');t.fill({city:'Łodygowice'});await t.nodes.get('mergecity').emit('blur');
  assert.equal(t.nodes.get('mergepostal').value,'34-325');assert.equal(t.nodes.get('mergemunicipality').value,'Łodygowice');t.api.clear();
});
test('34-326 does not select the wrong Zarzecze from another municipality',async()=>{
  const t=fixture({...contactRules(),loadGeography:async()=>regionalGeography()});
  t.fill({postal:'34326'});await t.nodes.get('mergepostal').emit('input');
  await t.click('34-326 · Zarzecze');await t.nodes.get('mergecity').emit('blur');
  assert.equal(t.nodes.get('mergecity').value,'Zarzecze');assert.equal(t.nodes.get('mergemunicipality').value,'Łodygowice');assert.equal(t.nodes.get('mergecounty').value,'Żywiecki');assert.equal(t.nodes.get('mergepostOffice').value,'Pietrzykowice');t.api.clear();
});
test('common fields are filled only if all candidates agree and late lookups cannot restore cleared data',async()=>{
  assert.deepEqual(m.sharedGeography([{municipality:'A',county:'Wspólny',province:'Śląskie'},{municipality:'B',county:'Wspólny',province:'Śląskie'}]),{county:'Wspólny',province:'Śląskie'});
  let release;const t=fixture({...contactRules(),loadGeography:()=>new Promise(resolve=>{release=resolve;})});
  t.fill({postal:'34325'});const pending=t.nodes.get('mergepostal').emit('input');t.api.clear();release(regionalGeography());await pending;
  assert.equal(t.nodes.get('mergemunicipality').value,'');assert.equal(t.nodes.get('mergecity').value,'');
});

test('income and household size allow zero income but reject negative, fractional or missing household data',()=>{
  assert.equal(m.validate({...example,monthlyIncome:'0',householdSize:'1'},()=>true).length,0);
  for(const value of ['', '-1', 'abc'])assert.ok(m.validate({...example,monthlyIncome:value},()=>true).some(error=>error.field==='monthlyIncome'));
  for(const value of ['', '0','2.5','-2','100','abc'])assert.ok(m.validate({...example,householdSize:value},()=>true).some(error=>error.field==='householdSize'));
  assert.ok(m.draftValidate({...example,monthlyIncome:'-1'},()=>true).some(error=>error.field==='monthlyIncome'));
});
test('own contribution before PCPR and remaining payment after requested support are distinct',async()=>{
  const t=fixture();t.fill();await t.click('Sprawdź kompletność');
  assert.equal(t.nodes.get('mergeown').readOnly,true);assert.equal(t.nodes.get('mergeown').value,'5 900,00');
  assert.equal(t.nodes.get('mailMergeOwn').textContent,'2 900,00 zł');
  const data=m.amounts({...example,requested:'0'});assert.equal(data.own,590000);assert.equal(data.remaining,590000);
  assert.equal(m.amounts({...example,requested:''}).own,590000);
  t.api.clear();
});
test('income is printed per person as entered, household size is printed on page 4 and own contribution on page 5',()=>{
  const marks=m.placements(example);
  assert.equal(marks.find(item=>item.field==='monthlyIncome').text,'2 500,50');
  assert.equal(marks.find(item=>item.field==='monthlyIncome').page,4);
  assert.equal(marks.find(item=>item.field==='householdSize').text,'3');
  assert.equal(marks.find(item=>item.field==='householdSize').page,4);
  assert.equal(marks.find(item=>item.field==='own').text,'5 900,00');
});
test('income and household size persist while derived own contribution is not accepted from the browser',async()=>{
  const t=fixture();t.fill();await t.click('Zapisz');const saved=[...t.stored.values()][0].data;
  assert.equal(saved.monthlyIncome,'2 500,50');assert.equal(saved.householdSize,'3');assert.equal(saved.own,undefined);
  await t.click('Nowy wniosek');await t.click('Edytuj');
  assert.equal(t.nodes.get('mergemonthlyIncome').value,'2 500,50');assert.equal(t.nodes.get('mergehouseholdSize').value,'3');assert.equal(t.nodes.get('mergeown').value,'5 900,00');t.api.clear();
});

test('changing a loaded postal code replaces all dependent fields, including manually saved post office',async()=>{
  const t=fixture({...contactRules(),loadGeography:async()=>regionalGeography()});
  t.fill({...example,postOffice:'Poprzednia poczta'});await t.click('Zapisz roboczo');await t.click('Edytuj');
  t.fill({postal:'43300'});await t.nodes.get('mergepostal').emit('input');
  for(const key of ['city','postOffice','municipality','county','province','localityType'])assert.equal(t.nodes.get('merge'+key).value,'',key);
  assert.match(t.nodes.get('mailMergePostalChoices').textContent,/powiatu żywieckiego/);
  t.fill({postal:'34325'});await t.nodes.get('mergepostal').emit('input');
  assert.equal(t.nodes.get('mergecity').value,'');assert.equal(t.nodes.get('mergepostOffice').value,'Łodygowice');assert.equal(t.nodes.get('mergemunicipality').value,'Łodygowice');
  await t.click('34-325 · Bierna');t.fill({postal:'34326'});await t.nodes.get('mergepostal').emit('input');
  assert.equal(t.nodes.get('mergecity').value,'');assert.equal(t.nodes.get('mergepostOffice').value,'Pietrzykowice');
  await t.click('34-326 · Zarzecze');assert.equal(t.nodes.get('mergecity').value,'Zarzecze');
  t.fill({postal:'99999'});await t.nodes.get('mergepostal').emit('input');
  for(const key of ['city','postOffice','municipality','county','province','localityType'])assert.equal(t.nodes.get('merge'+key).value,'',key);
  assert.match(t.nodes.get('mailMergePostalChoices').textContent,/nie jest potwierdzony/);t.api.clear();
});
test('partial or cleared postal code immediately clears the previous address; blur retains current choices',async()=>{
  const t=fixture({...contactRules(),loadGeography:async()=>regionalGeography()});
  t.fill({postal:'43300'});await t.nodes.get('mergepostal').emit('input');
  t.fill({postal:'34'});await t.nodes.get('mergepostal').emit('input');
  for(const key of ['city','postOffice','municipality','county','province','localityType'])assert.equal(t.nodes.get('merge'+key).value,'',key);
  t.fill({postal:'34325'});await t.nodes.get('mergepostal').emit('input');await t.nodes.get('mergepostal').emit('blur');
  await t.click('34-325 · Bierna');await t.nodes.get('mergepostal').emit('blur');assert.equal(t.nodes.get('mergecity').value,'Bierna');assert.equal(t.nodes.get('mergepostOffice').value,'Łodygowice');
  t.fill({postal:''});await t.nodes.get('mergepostal').emit('input');
  for(const key of ['city','postOffice','municipality','county','province','localityType'])assert.equal(t.nodes.get('merge'+key).value,'',key);t.api.clear();
});
test('older postal lookups cannot overwrite a newer code or a manual city edit',async()=>{
  let release;const t=fixture({...contactRules(),loadGeography:()=>new Promise(resolve=>{release=resolve;})});
  t.fill({postal:'34325'});const first=t.nodes.get('mergepostal').emit('input');
  t.fill({postal:'34300'});const second=t.nodes.get('mergepostal').emit('input');release(regionalGeography());await first;await second;
  assert.equal(t.nodes.get('mergecity').value,'Żywiec');assert.equal(t.nodes.get('mergepostOffice').value,'Żywiec');t.api.clear();
  let finish;const edited=fixture({...contactRules(),loadGeography:()=>new Promise(resolve=>{finish=resolve;})});
  edited.fill({postal:'43300'});const pending=edited.nodes.get('mergepostal').emit('input');
  edited.fill({city:'Żywiec'});await edited.nodes.get('mergecity').emit('input');finish(regionalGeography());await pending;
  assert.equal(edited.nodes.get('mergecity').value,'Żywiec');assert.equal(edited.nodes.get('mergepostOffice').value,'');edited.api.clear();
});

test('county-only postal lookup ignores outside history and warns without guessing for unknown codes',async()=>{
  const rules=contactRules();
  const t=fixture({...rules,cityForPostal:code=>code==='43-300'?'Bielsko-Biała':'',loadGeography:async()=>regionalGeography()});
  t.fill({postal:'43300'});await t.nodes.get('mergepostal').emit('input');
  assert.equal(t.nodes.get('mergecity').value,'');assert.match(t.nodes.get('mailMergePostalChoices').textContent,/spoza powiatu żywieckiego/);
  assert.equal(t.nodes.get('mailMergePostalChoices').querySelectorAll('button').length,0);
  t.fill({postal:'34325'});await t.nodes.get('mergepostal').emit('input');await t.click('34-325 · Bierna');
  assert.equal(t.nodes.get('mergecity').value,'Bierna');assert.doesNotMatch(t.nodes.get('mailMergePostalChoices').textContent,/Uwaga/);
  t.fill({postal:'99999'});await t.nodes.get('mergepostal').emit('input');
  assert.match(t.nodes.get('mailMergePostalChoices').textContent,/nie jest potwierdzony/);assert.equal(t.nodes.get('mergecity').value,'');
  t.fill({city:'Bielsko-Biała'});await t.nodes.get('mergecity').emit('blur');
  assert.equal(t.nodes.get('mergemunicipality').value,'');assert.match(t.nodes.get('mailMergeMessage').textContent,/powiatu żywieckiego/);t.api.clear();
});
test('county scope filters defensive index construction, including any mixed or cached national data',()=>{
  const data=regionalGeography();data.units['2461011']=['Bielsko-Biała','Bielsko-Biała','śląskie'];
  data.places.push(['Bielsko-Biała','2461011','OUTSIDE','miasto']);
  data.postalCodes['43-300']={places:['OUTSIDE'],postOffice:'Bielsko-Biała'};
  const index=m.geographyIndex(data);
  assert.deepEqual(m.geographyMatches(index,'Bielsko-Biała'),[]);assert.deepEqual(m.geographyPostalMatches(index,'43-300'),[]);
});

test('both order numbers become uppercase on input, paste, save without blur, reopening and print',async()=>{
  const t=fixture();t.fill({...example,itemCount:'2',subject2:'Aparat L',orderNumber:'nfz ab/2026',orderNumber2:'nfz cd-2/2026'});
  const first=t.nodes.get('mergeorderNumber');first.selectionStart=4;first.selectionEnd=6;
  let selection;first.setSelectionRange=(start,end)=>{selection=[start,end];};
  await first.emit('input');await t.nodes.get('mergeorderNumber2').emit('input');
  assert.equal(first.value,'NFZ AB/2026');assert.deepEqual(selection,[4,6]);assert.equal(t.nodes.get('mergeorderNumber2').value,'NFZ CD-2/2026');
  t.fill({orderNumber:'nfz ef/2026',orderNumber2:'nfz gh/2026'});await t.click('Zapisz');
  const entry=[...t.stored.values()][0];assert.equal(entry.data.orderNumber,'NFZ EF/2026');assert.equal(entry.data.orderNumber2,'NFZ GH/2026');
  entry.data.orderNumber='stare ab/2025';entry.data.orderNumber2='stare cd/2025';await t.click('Edytuj');
  assert.equal(first.value,'STARE AB/2025');assert.equal(t.nodes.get('mergeorderNumber2').value,'STARE CD/2025');
  assert.match(t.nodes.get('mailMergePreviewPages').textContent,/STARE AB\/2025/);
  const one=m.placements({...example,orderNumber:'nfz ab/2026'}).find(item=>item.field==='orderNumber');assert.equal(one.text,'NFZ AB/2026');
  const two=m.placements({...example,itemCount:'2',orderNumber:'nfz ab/2026',orderNumber2:'nfz cd/2026'}).find(item=>item.field==='orderNumber');
  assert.equal(two.text,'1. NFZ AB/2026\n2. NFZ CD/2026');t.api.clear();
});

test('application number is removed from editor, table, required fields, save payload and print overlays',async()=>{
  const t=fixture();t.fill({...example,applicationNumber:'OLD/01'});
  assert.equal(t.nodes.has('mergeapplicationNumber'),false);
  assert.equal(m.validate({...example,applicationNumber:''},()=>true).length,0);
  assert.equal(m.placements({...example,applicationNumber:'OLD/01'}).some(item=>item.field==='applicationNumber'),false);
  await t.click('Zapisz');assert.equal([...t.stored.values()][0].data.applicationNumber,undefined);
  assert.equal(t.nodes.get('mailMergeQueue').children[0].children.length,7);
  assert.doesNotMatch(t.nodes.get('mailMergeListSearch').placeholder,/nr wniosku/);t.api.clear();
});
test('certificate expiry uses six calendar months, includes the boundary, and ignores indefinite or invalid dates',()=>{
  const notice=value=>m.certificateExpiry({certificateValidity:'periodic',certificateUntil:value},'2026-11-03');
  assert.equal(notice('02.11.2026').level,'expired');assert.equal(notice('2026-11-03').days,0);
  assert.match(notice('04.11.26').text,/1 dzień/);assert.equal(notice('03.12.2026').days,30);
  assert.equal(notice('03.05.2027').level,'soon');assert.equal(notice('04.05.2027'),null);
  assert.equal(notice('31.11.2026'),null);assert.equal(notice(''),null);
  assert.equal(m.certificateExpiry({certificateValidity:'indefinite',certificateUntil:'01.01.2020'},'2026-11-03'),null);
  assert.equal(m.certificateExpiry({certificateValidity:'periodic',certificateUntil:'2026-03-30'},'2026-03-28').days,2);
});
test('six-month certificate horizon clamps month ends and respects leap years',()=>{
  const notice=(today,until)=>m.certificateExpiry({certificateValidity:'periodic',certificateUntil:until},today);
  assert.equal(notice('2026-08-31','2027-02-28').level,'soon');assert.equal(notice('2026-08-31','2027-03-01'),null);
  assert.equal(notice('2023-08-31','2024-02-29').level,'soon');assert.equal(notice('2023-08-31','2024-03-01'),null);
  assert.equal(notice('2024-02-29','2024-08-29').level,'soon');assert.equal(notice('2024-02-29','2024-08-30'),null);
});
test('certificate warning updates immediately on typing, selection, loading, reset and indefinite switch',async()=>{
  const t=fixture({today:()=> '2026-11-03'});t.fill({...example,certificateValidity:'periodic',certificateUntil:'02.11.2026'});
  await t.nodes.get('mergecertificateUntil').emit('input');
  const warning=t.nodes.get('mailMergeCertificateWarning'),label=t.nodes.get('mergecertificateUntil').parent;
  assert.equal(warning.hidden,false);assert.match(warning.textContent,/minął/);assert.match(label.className,/mail-merge-certificate-expired/);
  t.fill({certificateUntil:'03.12.2026'});await t.nodes.get('mergecertificateUntil').emit('change');
  assert.match(warning.textContent,/30 dni/);assert.match(label.className,/mail-merge-certificate-soon/);
  t.fill({certificateUntil:'03.05.2027'});await t.nodes.get('mergecertificateUntil').emit('input');assert.equal(warning.hidden,false);
  t.fill({certificateUntil:'04.05.2027'});await t.nodes.get('mergecertificateUntil').emit('input');assert.equal(warning.hidden,true);
  t.fill({certificateUntil:'03.12.2026'});await t.nodes.get('mergecertificateUntil').emit('change');
  await t.click('Zapisz');await t.click('Nowy wniosek');assert.equal(warning.hidden,true);
  await t.click('Edytuj');assert.equal(warning.hidden,false);assert.match(warning.textContent,/30 dni/);
  t.fill({certificateValidity:'indefinite'});await t.nodes.get('mergecertificateValidity').emit('change');
  assert.equal(warning.hidden,true);assert.doesNotMatch(label.className,/mail-merge-certificate-(soon|expired)/);
  t.fill({certificateValidity:'periodic'});await t.nodes.get('mergecertificateValidity').emit('change');assert.equal(warning.hidden,false);
  t.fill({certificateUntil:'31.12.2027'});await t.nodes.get('mergecertificateUntil').emit('input');assert.equal(warning.hidden,true);
  t.api.clear();assert.equal(warning.textContent,'');
});

test('required empty fields have a gentle hint that disappears immediately when filled',async()=>{
  const t=fixture(),hint=key=>t.nodes.get('merge'+key).className.includes('mail-merge-required-empty');
  for(const key of ['firstName','middleName','surname','pesel','postal','city','phone','degree','certificateNumber','cost','monthlyIncome','householdSize'])assert.equal(hint(key),true,key);
  for(const key of ['birthDate','own','personRole','itemCount','certificateUntil','subject2','orderNumber2'])assert.equal(hint(key),false,key);
  t.fill({firstName:'Jan'});await t.nodes.get('mergefirstName').emit('input');assert.equal(hint('firstName'),false);
  t.fill({firstName:'   '});await t.nodes.get('mergefirstName').emit('input');assert.equal(hint('firstName'),true);
  t.fill({degree:'moderate'});await t.nodes.get('mergedegree').emit('change');assert.equal(hint('degree'),false);
  t.fill({monthlyIncome:'0'});await t.nodes.get('mergemonthlyIncome').emit('input');assert.equal(hint('monthlyIncome'),false);
  await t.click('Brak e-maila');assert.equal(hint('email'),false);
  t.fill();await t.nodes.get('mergefirstName').emit('blur');
  for(const key of ['firstName','surname','phone','city','certificateNumber','cost','monthlyIncome'])assert.equal(hint(key),false,key);
  await t.click('Zapisz zmiany');await t.click('Nowy wniosek');assert.equal(hint('surname'),true);
  await t.click('Edytuj');assert.equal(hint('surname'),false);assert.equal(hint('email'),false);t.api.clear();
});
test('required hints follow certificate validity, second product and automatic address completion',async()=>{
  const t=fixture({...contactRules(),loadGeography:async()=>regionalGeography()}),hint=key=>t.nodes.get('merge'+key).className.includes('mail-merge-required-empty');
  t.fill({certificateValidity:'periodic'});await t.nodes.get('mergecertificateValidity').emit('change');assert.equal(hint('certificateUntil'),true);
  t.fill({certificateUntil:'31.12.2027'});await t.nodes.get('mergecertificateUntil').emit('input');assert.equal(hint('certificateUntil'),false);
  t.fill({certificateValidity:'indefinite'});await t.nodes.get('mergecertificateValidity').emit('change');assert.equal(hint('certificateUntil'),false);
  t.fill({itemCount:'2'});await t.nodes.get('mergeitemCount').emit('change');assert.equal(hint('subject2'),true);assert.equal(hint('orderNumber2'),true);
  t.fill({itemCount:'1'});await t.nodes.get('mergeitemCount').emit('change');assert.equal(hint('subject2'),false);assert.equal(hint('orderNumber2'),false);
  t.fill({postal:'34325'});await t.nodes.get('mergepostal').emit('input');
  assert.equal(hint('city'),true);assert.equal(hint('municipality'),false);assert.equal(hint('postOffice'),false);
  await t.click('34-325 · Bierna');assert.equal(hint('city'),false);
  t.fill({postal:'99999'});await t.nodes.get('mergepostal').emit('input');assert.equal(hint('city'),true);assert.equal(hint('municipality'),true);t.api.clear();
});

test('new applications default to hearing aids and same mailing address, while stored choices are preserved',async()=>{
  const t=fixture();assert.equal(t.nodes.get('mergesubject').value,'Aparaty słuchowe');assert.equal(t.nodes.get('mergeSameAddress').checked,true);
  assert.match(t.nodes.get('mailMergePreviewPages').textContent,/Aparaty słuchowe/);
  t.fill({...example,subject:'Wkładka uszna',email:'',flat:''});t.nodes.get('mergeSameAddress').checked=false;
  await t.click('Zapisz');assert.equal(t.stored.size,1);
  const saved=[...t.stored.values()][0].data;assert.equal(saved.sameAddress,false);assert.equal(saved.subject,'Wkładka uszna');
  assert.equal(saved.email,'');assert.equal(saved.flat,'');
  await t.click('Nowy wniosek');assert.equal(t.nodes.get('mergesubject').value,'Aparaty słuchowe');assert.equal(t.nodes.get('mergeSameAddress').checked,true);
  await t.click('Edytuj');assert.equal(t.nodes.get('mergesubject').value,'Wkładka uszna');assert.equal(t.nodes.get('mergeSameAddress').checked,false);t.api.clear();
});
test('email and apartment number are optional without empty-field highlighting but entered email is validated',async()=>{
  const data={...example,email:'',flat:''};assert.equal(m.validate(data,()=>true).length,0);assert.equal(m.draftValidate(data,()=>true).length,0);
  assert.ok(m.draftValidate({...data,email:'bledny-adres'},()=>true).some(error=>error.field==='email'));
  const t=fixture();
  for(const key of ['email','flat'])assert.doesNotMatch(t.nodes.get('merge'+key).className,/mail-merge-required-empty/);
  t.fill(data);await t.click('Drukuj wniosek');assert.equal(t.prints(),1);
  const printed=t.nodes.get('mailMergePrint').textContent;assert.match(printed,/Testowy/);
  assert.equal(m.placements(data).some(item=>['email','flat'].includes(item.field)),false);t.api.clear();
});

test('item count is a two-button switch with synchronized reset, saved state and second item fields',async()=>{
  const t=fixture(),one=t.nodes.get('mailMergeItemCount1'),two=t.nodes.get('mailMergeItemCount2');
  assert.equal(t.nodes.get('mergeitemCount').type,'hidden');assert.equal(t.nodes.get('mergeitemCount').tag,'input');
  assert.equal(one.attributes['aria-pressed'],'true');assert.equal(two.attributes['aria-pressed'],'false');
  await two.emit('click');assert.equal(t.nodes.get('mergeitemCount').value,'2');assert.equal(two.attributes['aria-pressed'],'true');
  assert.equal(t.nodes.get('mergesubject2').parent.hidden,false);
  t.fill({...example,itemCount:'2',subject2:'Aparat L',orderNumber2:'NFZ-2'});await t.click('Zapisz zmiany');
  await t.click('Nowy wniosek');assert.equal(one.attributes['aria-pressed'],'true');
  await t.click('Edytuj');assert.equal(two.attributes['aria-pressed'],'true');
  await one.emit('click');assert.equal(t.nodes.get('mergesubject2').value,'');assert.equal(t.nodes.get('mergesubject2').parent.hidden,true);
  assert.equal(one.attributes['aria-pressed'],'true');assert.equal(two.attributes['aria-pressed'],'false');t.api.clear();
});
test('cancelling a reduction to one product preserves both entries and the selected switch',async()=>{
  const t=fixture({confirm:()=>false});await t.nodes.get('mailMergeItemCount2').emit('click');
  t.fill({subject2:'Wkładka uszna',orderNumber2:'NFZ-2'});await t.nodes.get('mailMergeItemCount1').emit('click');
  assert.equal(t.nodes.get('mergeitemCount').value,'2');assert.equal(t.nodes.get('mergesubject2').value,'Wkładka uszna');
  assert.equal(t.nodes.get('mergeorderNumber2').value,'NFZ-2');assert.equal(t.nodes.get('mailMergeItemCount2').attributes['aria-pressed'],'true');t.api.clear();
});

test('Polish bank account accepts NRB and PL IBAN, formats groups and rejects wrong checksum or foreign IBAN',()=>{
  for(const value of ['61109010140000071219812874','61 1090 1014 0000 0712 1981 2874','PL61 1090 1014 0000 0712 1981 2874'])assert.equal(m.validBankAccount(value),true);
  for(const value of ['', '0'.repeat(26),'61109010140000071219812875','PL6110901014000007121981287','DE61109010140000071219812874','61x109010140000071219812874'])assert.equal(m.validBankAccount(value),false);
  assert.equal(m.formatBankAccount('PL61109010140000071219812874'),'61 1090 1014 0000 0712 1981 2874');
  assert.ok(m.validate({...example,bankAccount:''},()=>true).some(error=>error.field==='bankAccount'));
  assert.equal(m.validate({...example,paymentMode:'cash',bankAccount:'',bankOwner:'',bankName:''},()=>true).length,0);
});
test('DPS, household and transfer selections map to exact original form fields without leaking bank data into cash print',()=>{
  const marks=m.placements({...example,careHome:'yes',householdType:'individual'});
  assert.deepEqual(marks.filter(item=>['careHome','householdType','paymentMode'].includes(item.field)).map(item=>[item.field,item.page,item.x,item.y]),[['careHome',4,28.3,598.8],['householdType',4,28.3,632.1],['paymentMode',5,28.3,551.2]]);
  assert.equal(marks.find(item=>item.field==='bankOwner').page,5);assert.equal(marks.find(item=>item.field==='bankAccount').text,'61 1090 1014 0000 0712 1981 2874');
  const cash=m.placements({...example,paymentMode:'cash'});assert.equal(cash.some(item=>['bankOwner','bankName','bankAccount'].includes(item.field)),false);
  assert.equal(cash.find(item=>item.field==='paymentMode').y,660.2);
});
test('transfer is selected by default, account validation updates on paste, and bank data survive private record roundtrip',async()=>{
  const t=fixture();assert.equal(t.nodes.get('mergepaymentMode').value,'transfer');
  t.fill({...example,bankAccount:'PL61 1090 1014 0000 0712 1981 2875'});await t.nodes.get('mergebankAccount').emit('input');
  assert.equal(t.nodes.get('mailMergeBankWarning').hidden,false);await t.click('Zapisz');assert.equal(t.stored.size,0);
  t.fill({bankAccount:'PL61109010140000071219812874'});await t.nodes.get('mergebankAccount').emit('input');assert.equal(t.nodes.get('mailMergeBankWarning').hidden,true);
  await t.click('Zapisz zmiany');const saved=[...t.stored.values()][0].data;assert.equal(saved.bankAccount,'61109010140000071219812874');assert.equal(saved.careHome,'no');assert.equal(saved.householdType,'shared');
  await t.click('Nowy wniosek');await t.click('Edytuj');assert.equal(t.nodes.get('mergebankOwner').value,'Jan Adam Testowy');
  assert.equal(t.nodes.get('mergebankAccount').value,'61 1090 1014 0000 0712 1981 2874');
  t.fill({paymentMode:'cash'});await t.nodes.get('mergepaymentMode').emit('change');assert.equal(t.nodes.get('mergebankAccount').disabled,true);
  assert.equal(t.nodes.get('mergebankAccount').className.includes('mail-merge-required-empty'),false);
  await t.click('Zapisz zmiany');assert.equal([...t.stored.values()][0].data.bankAccount,'');t.api.clear();
});

test('gabinet can open, save, edit and print PCPR but cannot delete or replace templates',async()=>{
  const t=fixture({access:()=>true});t.owner(false);assert.equal(t.api.open(),true);await tick();
  t.fill();await t.click('Zapisz');assert.equal(t.stored.size,1);assert.equal(t.api.queue().length,1);
  await t.click('Edytuj');await t.click('Drukuj wniosek');assert.equal(t.prints(),1);
  assert.equal(t.nodes.get('mailMergeQueue').querySelectorAll('button').some(button=>button.textContent==='Usuń'),false);
  assert.equal(t.nodes.get('mailMergeTemplateFile').disabled,true);assert.equal(t.nodes.get('mailMergeTemplateApply').disabled,true);t.api.clear();
  assert.equal(t.nodes.get('mergefirstName').value,'');assert.equal(t.nodes.get('mailMergePreviewPages').children.length,0);
  const rejected=fixture({access:()=>false});assert.equal(rejected.api.open(),false);assert.deepEqual(rejected.api.queue(),[]);
});

test('contractor checkbox below bank account selects one payment mode and persists with the record',async()=>{
  const t=fixture(),check=t.nodes.get('mailMergeContractorAccount');assert.equal(check.checked,false);
  const section=check.parent.parent,accountLabel=t.nodes.get('mergebankAccount').parent;
  assert.equal(section.children.indexOf(check.parent),section.children.indexOf(accountLabel)+1);
  t.fill();check.checked=true;await check.emit('change');
  assert.equal(t.nodes.get('mergepaymentMode').value,'contractor');assert.equal(t.nodes.get('mergebankAccount').disabled,true);
  await t.click('Zapisz');const data=[...t.stored.values()][0].data;assert.equal(data.paymentMode,'contractor');assert.equal(data.bankAccount,'');
  const marks=m.placements(data).filter(item=>item.field==='paymentMode');assert.equal(marks.length,1);assert.equal(marks[0].y,674);
  await t.click('Nowy wniosek');assert.equal(check.checked,false);await t.click('Edytuj');assert.equal(check.checked,true);
  check.checked=false;await check.emit('change');assert.equal(t.nodes.get('mergepaymentMode').value,'transfer');assert.equal(t.nodes.get('mergebankAccount').disabled,false);
  t.fill({paymentMode:'contractor'});await t.nodes.get('mergepaymentMode').emit('change');assert.equal(check.checked,true);
  t.fill({paymentMode:'cash'});await t.nodes.get('mergepaymentMode').emit('change');assert.equal(check.checked,false);t.api.clear();
});

test('bank name is uppercase on typing, paste, save without blur, reopening and print',async()=>{
  const t=fixture(),input=t.nodes.get('mergebankName');t.fill({...example,bankName:'bank spółdzielczy'});
  input.selectionStart=5;input.selectionEnd=8;let selection;input.setSelectionRange=(start,end)=>{selection=[start,end];};
  await input.emit('input');assert.equal(input.value,'BANK SPÓŁDZIELCZY');assert.deepEqual(selection,[5,8]);
  t.fill({bankName:'  mbank  s.a.  '});await t.click('Zapisz');const saved=[...t.stored.values()][0];
  assert.equal(saved.data.bankName,'MBANK S.A.');saved.data.bankName='bank testowy';
  await t.click('Edytuj');assert.equal(input.value,'BANK TESTOWY');
  assert.equal(m.placements({...example,bankName:'bank testowy'}).find(item=>item.field==='bankName').text,'BANK TESTOWY');t.api.clear();
});

test('first product description and both order numbers fit their original cells without extra lines',()=>{
  const data={...example,itemCount:'2',subject:'Aparat słuchowy Phonak Audeo Lumity L90-R Trial / dłuższa nazwa modelu',subject2:'Aparat słuchowy Philips HearLink 9050 MNR T R Demo / model do testowania',orderNumber:'1/P.01.01.00/2026/1234567890',orderNumber2:'2/P.01.01.00/2026/0987654321'};
  const measure=(text,size)=>text.length*size*0.72;
  for(const item of m.placements(data).filter(item=>['subject','orderNumber'].includes(item.field))){
    const fit=m.fitText(item.text,item.width,item.height,measure,item.fit);assert.ok(fit,item.field);
    const lines=item.field==='subject'?1:2;assert.equal(fit.text,item.text);assert.equal(fit.text.split('\n').length,lines);assert.ok(fit.size>=6.5&&fit.size<=item.fit.maxSize);
    assert.ok(fit.text.split('\n').every(line=>measure(line,fit.size)<=item.width-2));assert.ok(lines*fit.size*1.05<=item.height);
    const [top,bottom]=item.field==='subject'?[224.6,244.2]:[244.2,264];assert.ok(item.y>=top+1);assert.ok(item.y+item.height<=bottom-1);
  }
  const long=m.placements({...data,subject:'X'.repeat(1000)}).find(item=>item.field==='subject');
  assert.equal(m.fitText(long.text,long.width,long.height,measure,long.fit),null);
});
test('preview and printing use identical compact fitting for two products, without changing entered names',async()=>{
  const t=fixture();t.fill({...example,itemCount:'2',subject:'Aparat słuchowy / model testowy',subject2:'Aparat słuchowy / drugi model testowy',orderNumber2:'NFZ-2'});
  await t.nodes.get('mergefirstName').emit('blur');
  const preview=t.nodes.get('mailMergePreviewPages').querySelectorAll('.mail-merge-fitted-items');assert.equal(preview.length,2);
  assert.deepEqual(preview.map(item=>item.textContent.split('\n').length),[1,2]);assert.ok(preview.every(item=>item.style.height));
  assert.equal(preview[0].textContent,'Aparat słuchowy / model testowy');
  await t.click('Drukuj wniosek');assert.equal(t.prints(),1);
  const printed=t.nodes.get('mailMergePrint').querySelectorAll('.mail-merge-fitted-items');
  assert.deepEqual(printed.map(item=>[item.textContent,item.style.fontSize,item.style.height]),preview.map(item=>[item.textContent,item.style.fontSize,item.style.height]));
  assert.equal(t.nodes.get('mergesubject2').value,'Aparat słuchowy / drugi model testowy');t.api.clear();
});

test('two items print only the first description, without numbering or repeating a second description',()=>{
  const marks=m.placements({...example,itemCount:'2',subject:'Aparaty słuchowe',subject2:'Inny opis drugiej pozycji',orderNumber:'NFZ-1',orderNumber2:'NFZ-2'});
  assert.equal(marks.filter(item=>item.field==='subject').length,1);assert.equal(marks.find(item=>item.field==='subject').text,'Aparaty słuchowe');
  assert.equal(marks.find(item=>item.field==='orderNumber').text,'1. NFZ-1\n2. NFZ-2');
  assert.equal(marks.some(item=>item.text.includes('Inny opis drugiej pozycji')),false);
  const empty=m.placements({...example,itemCount:'2',subject:'',subject2:'Nie zastępuje pierwszego'});
  assert.equal(empty.some(item=>item.field==='subject'),false);assert.equal(empty.filter(item=>item.fit).length,1);
});

test('two order numbers use a fixed number column, equal font size and aligned text starts in preview and print',async()=>{
  const t=fixture();t.fill({...example,itemCount:'2',subject2:'Aparaty słuchowe',orderNumber:'111111/2026',orderNumber2:'222222/2026'});
  await t.nodes.get('mergefirstName').emit('blur');
  const rows=t.nodes.get('mailMergePreviewPages').querySelectorAll('.mail-merge-order-line');assert.equal(rows.length,2);
  assert.equal(rows[0].style.gridTemplateColumns,rows[1].style.gridTemplateColumns);
  assert.deepEqual(rows.map(row=>row.children[0].textContent),['1. ','2. ']);
  assert.deepEqual(rows.map(row=>row.children[1].textContent),['111111/2026','222222/2026']);
  await t.click('Drukuj wniosek');assert.equal(t.prints(),1);
  assert.deepEqual(t.nodes.get('mailMergePrint').querySelectorAll('.mail-merge-order-line').map(row=>row.style.gridTemplateColumns),rows.map(row=>row.style.gridTemplateColumns));t.api.clear();
});
test('individual household immediately sets one person, updates preview and stores it without changing shared counts on load',async()=>{
  const t=fixture();t.fill({...example,householdSize:'4',householdType:'shared'});
  t.fill({householdType:'individual'});await t.nodes.get('mergehouseholdType').emit('change');
  assert.equal(t.nodes.get('mergehouseholdSize').value,'1');assert.doesNotMatch(t.nodes.get('mergehouseholdSize').className,/mail-merge-required-empty/);
  await t.click('Zapisz');assert.equal([...t.stored.values()][0].data.householdSize,'1');
  t.fill({householdType:'shared'});await t.nodes.get('mergehouseholdType').emit('change');
  t.fill({householdSize:'3'});await t.click('Zapisz zmiany');await t.click('Nowy wniosek');await t.click('Edytuj');
  assert.equal(t.nodes.get('mergehouseholdSize').value,'3');assert.equal(t.nodes.get('mergehouseholdType').value,'shared');t.api.clear();
});

test('visible choices count only real values and longer lists remain dropdowns',()=>{
  assert.equal(m.shortChoices([['','Wybierz'],['a','A']]),null);
  assert.equal(m.shortChoices([['','Wybierz'],['a','A'],['b','B']]).length,2);
  assert.equal(m.shortChoices([['','Wybierz'],['a','A'],['b','B'],['c','C'],['d','D']]).length,4);
  assert.equal(m.shortChoices([['a','A'],['b','B'],['c','C'],['d','D'],['e','E']]),null);
});
test('short choices are visible exclusive native radios, sync defaults and automatic fields, and preserve saved choices',async()=>{
  const t=fixture();
  for(const [key,count]of Object.entries({gender:2,personRole:2,localityType:2,degree:4,invalidityGroup:4,certificateValidity:2,careHome:3,householdType:2,paymentMode:3})){
    assert.equal(t.nodes.get('merge'+key).type,'hidden',key);
    const controls=t.nodes.get('merge'+key).parent.children.find(child=>child.attributes.role==='radiogroup');assert.equal(controls.querySelectorAll('input').length,count,key);
  }
  assert.equal(t.nodes.get('mergeChoice-personRole-applicant').checked,true);assert.equal(t.nodes.get('mergeChoice-paymentMode-transfer').checked,true);
  const choose=async(key,value)=>{const radio=t.nodes.get(`mergeChoice-${key}-${value}`);radio.checked=true;await radio.emit('change');};
  t.fill();await choose('householdType','individual');assert.equal(t.nodes.get('mergehouseholdSize').value,'1');assert.equal(t.nodes.get('mergeChoice-householdType-shared').checked,false);
  await choose('certificateValidity','periodic');assert.equal(t.nodes.get('mergecertificateUntil').disabled,false);
  await choose('certificateValidity','indefinite');assert.equal(t.nodes.get('mergecertificateUntil').disabled,true);
  await choose('paymentMode','contractor');assert.equal(t.nodes.get('mailMergeContractorAccount').checked,true);assert.equal(t.nodes.get('mergebankAccount').disabled,true);
  await t.click('Zapisz');await t.click('Nowy wniosek');assert.equal(t.nodes.get('mergeChoice-paymentMode-transfer').checked,true);
  await t.click('Edytuj');assert.equal(t.nodes.get('mergeChoice-paymentMode-contractor').checked,true);assert.equal(t.nodes.get('mergeChoice-householdType-individual').checked,true);
  await t.click('Drukuj wniosek');assert.equal(t.prints(),1);t.api.clear();
  assert.equal(t.nodes.get('mergeChoice-householdType-individual').checked,false);
});
test('visible choices follow PESEL and postal auto-fill, retain missing hints, and are disabled during save',async()=>{
  const t=fixture({...contactRules(),loadGeography:async()=>regionalGeography()});
  assert.match(t.nodes.get('mergeChoice-careHome-yes').parent.parent.className,/mail-merge-choice-missing/);
  t.fill();await t.nodes.get('mergefirstName').emit('blur');assert.equal(t.nodes.get('mergeChoice-gender-female').checked,true);
  t.fill({postal:'34325'});await t.nodes.get('mergepostal').emit('input');assert.equal(t.nodes.get('mergeChoice-localityType-village').checked,true);
  await t.click('34-325 · Bierna');t.fill({careHome:'no'});await t.nodes.get('mergecareHome').emit('change');
  assert.doesNotMatch(t.nodes.get('mergeChoice-careHome-no').parent.parent.className,/mail-merge-choice-missing/);
  let release;t.pause(new Promise(resolve=>{release=resolve;}));const pending=t.click('Zapisz');await tick();
  assert.equal(t.nodes.get('mergeChoice-careHome-yes').disabled,true);release();await pending;assert.equal(t.nodes.get('mergeChoice-careHome-yes').disabled,false);t.api.clear();
});

test('native radio input is handled before form refresh and its change keeps the new selection',async()=>{
  const t=fixture(),radio=t.nodes.get('mergeChoice-householdType-individual');radio.checked=true;
  let stopped=false;for(const handler of radio.events.input||[])handler({stopPropagation(){stopped=true;}});
  assert.equal(stopped,true);assert.equal(radio.checked,true);
  await radio.emit('change');assert.equal(t.nodes.get('mergehouseholdType').value,'individual');assert.equal(radio.checked,true);assert.equal(t.nodes.get('mergehouseholdSize').value,'1');t.api.clear();
});
test('missing visible choice receives the validation focus and clears its error after a selection',async()=>{
  const t=fixture();t.fill({...example,careHome:''});const first=t.nodes.get('mergeChoice-careHome-yes');let focused=false;first.focus=()=>{focused=true;};
  await t.click('Zapisz');assert.equal(t.stored.size,0);assert.equal(focused,true);assert.equal(first.parent.parent.attributes['aria-invalid'],'true');
  const no=t.nodes.get('mergeChoice-careHome-no');no.checked=true;await no.emit('change');
  assert.equal(no.parent.parent.attributes['aria-invalid'],undefined);assert.equal(first.validity,'');t.api.clear();
});

test('PCPR P50 contacts fill structured name, phone and address without guessing missing identity data',async()=>{
  const t=fixture({contacts:()=>[{customer:'Anna Maria Testowa',phone:'500 600 700',source:'PCPR / MOPS',place:'P50',
    address:'34-300 Żywiec, ul. Testowa 12/3',addressParts:{postalCode:'34-300',city:'Żywiec',street:'ul. Testowa 12/3'}}]});
  t.api.open();await tick();const search=t.nodes.get('mailMergeSearch');search.value='Anna';await search.emit('input');
  const matches=t.nodes.get('mailMergeMatches');assert.equal(matches.children.length,1);
  assert.match(matches.children[0].textContent,/PCPR · P50/);await matches.children[0].emit('click');
  for(const [key,value]of Object.entries({firstName:'Anna',middleName:'Maria',surname:'Testowa',phone:'500 600 700',postal:'34-300',city:'Żywiec',street:'Testowa',house:'12',flat:'3',pesel:''}))
    assert.equal(t.nodes.get(`merge${key}`).value,value,key);
  assert.equal(t.stored.size,0,'selection does not automatically save or send an application');t.api.clear();
});

test('PCPR Żywiec uses only P50 PCPR profiles but retains existing document history from other locations',()=>{
  const source=fs.readFileSync(path.join(root,'app.js'),'utf8'),vm=require('node:vm');
  function extract(name){const start=source.indexOf(`function ${name}(`);assert.ok(start>=0,name);const rest=source.slice(start);return rest.slice(0,rest.slice(1).search(/\n(?:async )?function /)+1);}
  const pcpr=[{customer:'Anna Testowa',place:'P50',phone:'500 600 700',postalCode:'34-300',city:'Żywiec',street:'ul. Testowa 12/3'},
    {customer:'Anna Testowa',place:'P63',phone:'999 999 999',postalCode:'43-300',city:'Bielsko-Biała',street:'ul. Inna 1'},
    {customer:'Adam Testowy',place:'T12',phone:'111 111 111'},{customer:'Ewa Testowa',place:'P50'},
    ...Array.from({length:10},(_,i)=>({customer:`Aaa Testowy${i}`,place:'T12'}))];
  const ctx=vm.createContext({currentSupabaseUser:{id:'user'},access:true,canAccessMailMerge:()=>ctx.access,
    pricingPcprList:pcpr,normalizePricingPcprList:rows=>rows,
    customerNameLookupKey:value=>String(value||'').trim().toLowerCase(),normalize:value=>String(value||'').trim().toLowerCase(),
    normalizeLoanHistoryText:value=>String(value||'').trim(),normalizeLoanIdentityValue:value=>String(value||'').trim(),
    formatLoanAddress:value=>String(value||''),customerRelationTimeValue:()=>0,isoDateForSave:value=>String(value||''),
    normalizePcprPlace:value=>value,pcprAddressLabel:entry=>[entry.postalCode,entry.city,entry.street].filter(Boolean).join(' '),
    pricingLoanHistory:[{customer:'Irena Testowa',phone:'123 123 123',address:'Adres z umowy'}],pricingOrderHistory:[],pricingComplaintHistory:[],pricingOfferHistory:[],
    records:[{customerName:'Jan Testowy'}],repairRecords:[],demoRecords:[]});
  ctx.SatisDocumentCustomerNames=[...pcpr.map(e=>e.customer),'Irena Testowa','Jan Testowy'];
  for(const name of ['documentCustomerNameMatches','customerHistoryContactEntries','mailMergeContactMatches'])vm.runInContext(extract(name),ctx);
  const anna=ctx.mailMergeContactMatches('Anna');assert.equal(anna.length,1);assert.equal(anna[0].place,'P50');assert.equal(anna[0].phone,'500 600 700');
  assert.equal(anna[0].addressParts.postalCode,'34-300');
  assert.equal(ctx.mailMergeContactMatches('Adam').length,0);
  assert.equal(ctx.mailMergeContactMatches('Ewa')[0].customer,'Ewa Testowa','name-only PCPR P50 entries are still offered');
  assert.equal(ctx.mailMergeContactMatches('Irena')[0].source,'Umowa');
  assert.equal(ctx.mailMergeContactMatches('Jan')[0].customer,'Jan Testowy','keep name-only profiles from the existing database');
  assert.ok(ctx.mailMergeContactMatches('Testowy').some(entry=>entry.customer==='Jan Testowy'),'excluded PCPR rows do not consume the result limit');
  assert.equal(ctx.customerHistoryContactEntries('Anna Testowa').length,2,'other forms keep all their PCPR contacts');
  ctx.currentSupabaseUser=null;assert.equal(ctx.mailMergeContactMatches('Anna').length,0);
  ctx.currentSupabaseUser={id:'other'};ctx.access=false;assert.equal(ctx.mailMergeContactMatches('Anna').length,0);
});

test('PCPR Żywiec capitalizes all name fields immediately while preserving spaces, hyphens, selection and composition',async()=>{
  const t=fixture(contactRules());
  for(const [key,value,expected]of [['firstName','jan ','Jan '],['middleName','anna maria','Anna Maria'],['surname','testowy-kowalski','Testowy-Kowalski']]){
    const input=t.nodes.get(`merge${key}`);input.value=value;input.selectionStart=2;input.selectionEnd=4;input.selectionDirection='backward';
    input.setSelectionRange=(start,end,direction)=>{input.selectionStart=start;input.selectionEnd=end;input.selectionDirection=direction;};
    await input.emit('input');assert.equal(input.value,expected);assert.equal(input.selectionStart,2);assert.equal(input.selectionEnd,4);assert.equal(input.selectionDirection,'backward');
  }
  const surname=t.nodes.get('mergesurname');surname.value='testowy';
  for(const listener of surname.events.input)listener({isComposing:true});assert.equal(surname.value,'testowy');
  await surname.emit('compositionend');assert.equal(surname.value,'Testowy');
  t.api.clear();
});
test('PCPR Żywiec groups phone digits immediately, including paste, middle edits, country prefixes and landlines',async()=>{
  const t=fixture(contactRules()),input=t.nodes.get('mergephone');
  input.setSelectionRange=(start,end,direction)=>{input.selectionStart=start;input.selectionEnd=end;input.selectionDirection=direction;};
  for(const [value,expected]of [['5','5'],['5006','500 6'],['500600800','500 600 800'],['+48 500600800','500 600 800'],['0048500600800','500 600 800'],['338153355','33 815 33 55']]){
    input.value=value;input.selectionStart=input.selectionEnd=value.length;input.selectionDirection='none';
    await input.emit('input');assert.equal(input.value,expected);assert.equal(input.selectionStart,expected.length);
  }
  input.value='500960 080';input.selectionStart=input.selectionEnd=4;
  await input.emit('input');assert.equal(input.value,'500 960 080');assert.equal(input.selectionStart,5,'caret follows the inserted digit, not the end of the phone');
  input.value='500600 800';input.selectionStart=input.selectionEnd=3;
  for(const listener of input.events.input)listener({inputType:'deleteContentForward'});
  assert.equal(input.value,'500 600 800');assert.equal(input.selectionStart,4,'delete can continue past a separator');
  t.fill({firstName:'Jan',surname:'Testowy'});await t.click('Zapisz roboczo');
  assert.equal([...t.stored.values()][0].data.phone,'500 600 800');t.api.clear();
});
