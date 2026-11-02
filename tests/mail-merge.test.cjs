const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const root = process.env.SATIS_ROOT || path.resolve(__dirname, '..');
const m = require(process.env.SATIS_MODULE || path.join(root,'mail-merge.js'));
const example = {personRole:'applicant',firstName:'Jan',middleName:'Adam',surname:'Testowy',pesel:'90010112349',birthDate:'01.01.1990',
  city:'Żywiec',street:'Testowa',house:'12',flat:'3',postal:'34-300',postOffice:'Żywiec',phone:'500 600 700',email:'',
  province:'śląskie',county:'żywiecki',municipality:'Żywiec',degree:'moderate',certificateValidity:'indefinite',
  certificateNumber:'TEST/2026',subject:'Aparaty słuchowe, 2 szt.',orderNumber:'TEST-1; TEST-2',cost:'8 000,00',nfz:'2100',requested:'3 000',role:'we własnym imieniu'};
test('amounts use integer cents and reject invalid grants or malformed money',()=>{
  assert.equal(m.parseMoney('1 234,56 zł'),123456);assert.equal(m.parseMoney('0'),0);
  for(const value of ['',null,'-2','abc','12.345','9'.repeat(400)]) assert.equal(m.parseMoney(value),null);
  assert.deepEqual(m.amounts(example),{cost:800000,nfz:210000,requested:300000,own:290000});
  assert.equal(m.validate(example,()=>true).length,0);
  assert.ok(m.validate({...example,nfz:'0'},()=>true).some(error=>error.field==='nfz'));
  assert.ok(m.validate({...example,requested:'7000'},()=>true).some(error=>error.field==='requested'));
  assert.ok(m.validate({...example,postal:'34300'},()=>false).some(error=>error.field==='pesel'));
  assert.deepEqual(m.splitName('Jan Adam Testowy'),{firstName:'Jan',middleName:'Adam',surname:'Testowy'});
});
test('GUS dictionary distinguishes Bielsko-Biała city county and never guesses between namesakes',()=>{
  const data=JSON.parse(fs.readFileSync(path.join(root,'mail-merge/geography.json'),'utf8'));
  const index=m.geographyIndex(data);
  assert.ok(data.places.length>50000);
  const bielsko=m.geographyMatches(index,'bielsko-biala');assert.equal(bielsko.length,1);
  assert.match(bielsko[0].county,/miasto na prawach powiatu/);assert.equal(bielsko[0].province,'śląskie');
  assert.equal(m.geographyMatches(index,'zywiec')[0].county,'żywiecki');
  assert.ok(m.geographyMatches(index,'Cieszyn').length>1);
  assert.deepEqual(m.geographyMatches(index,'Nieznana Testowa Miejscowość'),[]);
});
test('checkbox marks fit realistic font widths without blocking valid printouts',()=>{
  const marks=m.placements({...example,gender:'female',sameAddress:true}).filter(item=>item.text==='X');
  assert.equal(marks.length,4);
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
    assert.ok([1,2,3,5].includes(item.page));assert.ok(item.x>=0&&item.x+item.width<=m.PAGE.width);
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
    constructor(tag){this.tag=tag;this.children=[];this.value='';this.checked=false;this.hidden=false;this.dataset={};this.style={};this.events={};this.attributes={};this._text='';this.className='';this.classList={add:n=>this.className+=' '+n,remove:n=>{this.className=this.className.replace(n,'');},toggle:(n,on)=>on?this.classList.add(n):this.classList.remove(n)};}
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
      if(name==='satis_mail_merge_list')return {data:{rows:[...stored.values()].map(entry=>({...entry})),total:stored.size}};
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
    click(text){const target=buttons().find(button=>button.textContent.startsWith(text));assert.ok(target,text);return target.emit('click');}};
}
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
test('persistent people accept incomplete drafts and reopen after clearing the session',async()=>{
  const t=fixture();t.api.open();await tick();
  assert.equal(t.nodes.get('mailMergePreviewPages').querySelectorAll('.mail-merge-page').length,7);
  assert.doesNotMatch(t.nodes.get('mailMergePreviewPages').textContent,/we własnym imieniu/);
  t.fill({firstName:'Jan',surname:'Testowy'});await t.click('Zapisz');assert.equal(t.stored.size,1);
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
  t.window.events.afterprint();await t.click('Nowa osoba');t.fill();await t.click('Zapisz');assert.equal(t.stored.size,1);
  assert.match(t.nodes.get('mailMergeMessage').textContent,/PESEL/);
  t.owner(false);await t.click('Drukuj wniosek');assert.equal(t.prints(),1);
  t.api.clear();assert.deepEqual(t.api.queue(),[]);assert.equal(t.nodes.get('mergepesel').value,'');
  assert.equal(t.nodes.get('mailMergePreviewPages').children.length,0);assert.equal(t.api.open(),false);
});
test('save button rejects double clicks, network failure retains edits, and deletion is explicit',async()=>{
  const t=fixture();t.fill();let release;t.pause(new Promise(resolve=>{release=resolve;}));
  const pending=t.click('Zapisz');await t.click('Zapisz');assert.equal(t.saveCalls(),1);release();await pending;
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
  await t.click('Zapisz');const saved=[...t.stored.values()][0].data;
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
  await t.click('Nowa osoba');t.fill({city:'bielsko'});await t.nodes.get('mergecity').emit('blur');
  assert.equal(t.nodes.get('mergecity').value,'Bielsko-Biała');assert.equal(t.nodes.get('mergepostal').value,'43-300');
  t.fill({city:'Żywiec'});await t.nodes.get('mergecity').emit('input');await t.nodes.get('mergecity').emit('blur');
  assert.equal(t.nodes.get('mergepostal').value,'34-300');assert.equal(t.nodes.get('mergepostOffice').value,'Żywiec');t.api.clear();
});
test('ambiguous addresses require a choice and do not overwrite manually entered postal codes',async()=>{
  const t=fixture(contactRules());t.fill({city:'Testowo'});await t.nodes.get('mergecity').emit('blur');
  assert.equal(t.nodes.get('mergepostal').value,'');assert.match(t.nodes.get('mailMergePostalChoices').textContent,/10-100/);
  await t.click('10-101');assert.equal(t.nodes.get('mergepostal').value,'10-101');
  await t.click('Nowa osoba');t.fill({city:'Żywiec',postal:'99-999'});await t.nodes.get('mergecity').emit('blur');
  assert.equal(t.nodes.get('mergepostal').value,'99-999');assert.match(t.nodes.get('mailMergePostalChoices').textContent,/34-300/);
  await t.click('Nowa osoba');t.fill({postal:'20200'});await t.nodes.get('mergepostal').emit('input');
  assert.equal(t.nodes.get('mergecity').value,'');assert.match(t.nodes.get('mailMergePostalChoices').textContent,/Druga Wieś/);
  await t.click('20-200 · Druga Wieś');assert.equal(t.nodes.get('mergecity').value,'Druga Wieś');t.api.clear();
});
