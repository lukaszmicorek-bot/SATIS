const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const root = process.env.SATIS_ROOT || path.resolve(__dirname, '..');
const m = require(process.env.SATIS_MODULE || path.join(root,'mail-merge.js'));
const example = {personRole:'applicant',firstName:'Jan',middleName:'Adam',surname:'Testowy',pesel:'90010112349',birthDate:'01.01.1990',
  city:'Żywiec',street:'Testowa',house:'12',flat:'3',postal:'34-300',postOffice:'Żywiec',monthlyIncome:'2 500,50',householdSize:'3',phone:'500 600 700',email:'-',applicationNumber:'-',gender:'female',localityType:'city',invalidityGroup:'none',
  province:'śląskie',county:'żywiecki',municipality:'Żywiec',degree:'moderate',certificateValidity:'indefinite',
  certificateNumber:'TEST/2026',subject:'Aparaty słuchowe, 2 szt.',orderNumber:'TEST-1; TEST-2',cost:'8 000,00',nfz:'2100',requested:'3 000',role:'we własnym imieniu'};
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
  assert.equal(marks.length,6);
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
    addEventListener(k,fn){(this.events[k]||=[]).push(fn);}emit(k){return Promise.all((this.events[k]||[]).map(fn=>fn({preventDefault(){}})));}
    setCustomValidity(value){this.validity=value;}reportValidity(){return !this.validity;}focus(){}
    querySelectorAll(selector){return this.children.flatMap(c=>[...((selector===c.tag||selector.startsWith('.')&&c.className.split(' ').includes(selector.slice(1)))?[c]:[]),...c.querySelectorAll(selector)]);}
    decode(){return Promise.resolve();}
  }
  const host=new E('section');host.id='mailMergeNotebook';const body=new E('body');body.append(host);
  const window={events:{},addEventListener(k,fn){this.events[k]=fn;},removeEventListener(k){delete this.events[k];}};
  const api=m.create({document:{getElementById:id=>nodes.get(id),createElement:tag=>new E(tag),createDocumentFragment:()=>new E('fragment'),body,fonts:{ready:Promise.resolve()}},window,
    owner:()=>owner,user:()=>owner?'satis-test':'gabinet-test',validPesel:value=>/^\d{11}$/.test(value),age:()=>36,
    birthDate:()=> '01.01.1990',iso:value=>value,date:value=>value,name:value=>value,city:value=>value,phone:value=>value,postal:value=>value,
    cityForPostal:()=>'',contacts:()=>[],address:()=>({}),bindDate(){},confirm:()=>true,id:()=>String(++sequence),
    measure:(text,size)=>text.length*size*0.5,loadGeography:async()=>({units:{},places:[]}),print:async()=>{prints++;},
    rpc:async(name,args)=>{
      if(failure)return {error:{code:failure}};
      if(name==='satis_mail_merge_list')return {data:{rows:[...stored.values()].map(entry=>({...entry})),total:stored.size,schemaVersion:4}};
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
    click(text){const target=buttons().find(button=>button.textContent===text || (!['Zapisz','Zapisz zmiany'].includes(text) && button.textContent.startsWith(text)));assert.ok(target,text);return target.emit('click');}};
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
test('database access is SATIS-only and private data is never persisted in browser storage',()=>{
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(html,/data-view="mailMerge" data-view-group="pcpr" data-private-owner hidden/);
  assert.match(html,/id="mailMergeTab"[^>]*>PCPR Żywiec<\/button>/);
  assert.doesNotMatch(fs.readFileSync(path.join(root,'mail-merge.js'),'utf8'),/Korespondencja seryjna|bazy korespondencji/);
  assert.match(app,/\["workTime", "clients", "mailMerge"\]\.includes\(notebookName\) && !canViewPrivateModules/);
  assert.match(app,/mailMergeModule\?\.clear\(\)/);
  const source=fs.readFileSync(process.env.SATIS_MODULE||path.join(root,'mail-merge.js'),'utf8');
  assert.doesNotMatch(source,/localStorage|sessionStorage|indexedDB|innerHTML|fetch\(/);
  assert.match(source,/satis_mail_merge_write/);
  const sql=fs.readFileSync(process.env.SATIS_SQL||path.join(root,'supabase-mail-merge.sql'),'utf8');
  assert.equal((sql.match(/public\.is_satis_owner\(\) is not true/g)||[]).length,3);
  assert.equal((sql.match(/lower\(auth.jwt\(\)->>'email'\)='satis@pracowniasluchu.pl'/g)||[]).length,3);
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
  vm.createContext(ctx);for(const name of ['titleCaseName','formatLoanStreet','formatPcprPostalCode','formatPcprPhone','normalizePcprCity','suggestPostalCode'])vm.runInContext(extract(name),ctx);
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
  for(const key of ['middleName','flat','street','postOffice','email','certificateNumber','certificateValidity','gender','localityType','invalidityGroup']){
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
  const marks=m.placements(saved);assert.match(marks.find(item=>item.field==='subject').text,/2\. Aparat L/);
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
test('certificate expiry uses calendar days, includes today and 30 days, and ignores indefinite or invalid dates',()=>{
  const notice=value=>m.certificateExpiry({certificateValidity:'periodic',certificateUntil:value},'2026-11-03');
  assert.equal(notice('02.11.2026').level,'expired');assert.equal(notice('2026-11-03').days,0);
  assert.match(notice('04.11.26').text,/1 dzień/);assert.equal(notice('03.12.2026').days,30);
  assert.equal(notice('04.12.2026'),null);assert.equal(notice('31.11.2026'),null);assert.equal(notice(''),null);
  assert.equal(m.certificateExpiry({certificateValidity:'indefinite',certificateUntil:'01.01.2020'},'2026-11-03'),null);
  assert.equal(m.certificateExpiry({certificateValidity:'periodic',certificateUntil:'2026-03-30'},'2026-03-28').days,2);
});
test('certificate warning updates immediately on typing, selection, loading, reset and indefinite switch',async()=>{
  const t=fixture({today:()=> '2026-11-03'});t.fill({...example,certificateValidity:'periodic',certificateUntil:'02.11.2026'});
  await t.nodes.get('mergecertificateUntil').emit('input');
  const warning=t.nodes.get('mailMergeCertificateWarning'),label=t.nodes.get('mergecertificateUntil').parent;
  assert.equal(warning.hidden,false);assert.match(warning.textContent,/minął/);assert.match(label.className,/mail-merge-certificate-expired/);
  t.fill({certificateUntil:'03.12.2026'});await t.nodes.get('mergecertificateUntil').emit('change');
  assert.match(warning.textContent,/30 dni/);assert.match(label.className,/mail-merge-certificate-soon/);
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
