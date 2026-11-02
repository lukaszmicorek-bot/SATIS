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

function fixture() {
  const nodes=new Map();let owner=true,prints=0;
  class E {
    constructor(tag){this.tag=tag;this.children=[];this.value='';this.checked=false;this.hidden=false;this.dataset={};this.style={};this.events={};this.attributes={};this._text='';this.className='';this.classList={add:n=>this.className+=' '+n,remove:n=>{this.className=this.className.replace(n,'');}};}
    set id(value){this._id=value;nodes.set(value,this);}get id(){return this._id;}
    set textContent(value){this._text=String(value);this.children=[];}get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
    append(...children){for(const child of children){child.parent=this;this.children.push(child);}}
    replaceChildren(...children){this.children=[];this.append(...children);}
    remove(){if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this);this.parent=null;}
    setAttribute(k,v){this.attributes[k]=v;}removeAttribute(k){delete this.attributes[k];}
    addEventListener(k,fn){(this.events[k]||=[]).push(fn);}emit(k){for(const fn of this.events[k]||[])fn({preventDefault(){}});}
    setCustomValidity(value){this.validity=value;}reportValidity(){return !this.validity;}focus(){}
    querySelectorAll(selector){return this.children.flatMap(c=>[...((selector==='img'&&c.tag==='img'||selector.startsWith('.')&&c.className.split(' ').includes(selector.slice(1)))?[c]:[]),...c.querySelectorAll(selector)]);}
    decode(){return Promise.resolve();}
  }
  const host=new E('section');host.id='mailMergeNotebook';const body=new E('body');body.append(host);
  const window={events:{},addEventListener(k,fn){this.events[k]=fn;},removeEventListener(k){delete this.events[k];}};
  const api=m.create({document:{getElementById:id=>nodes.get(id),createElement:tag=>new E(tag),createDocumentFragment:()=>new E('fragment'),body,fonts:{ready:Promise.resolve()}},window,
    owner:()=>owner,user:()=>owner?'satis-test':'gabinet-test',validPesel:value=>/^\d{11}$/.test(value),age:()=>36,
    birthDate:()=> '01.01.1990',iso:value=>value,date:value=>value,name:value=>value,city:value=>value,phone:value=>value,postal:value=>value,
    cityForPostal:()=>'',contacts:()=>[],address:()=>({}),bindDate(){},confirm:()=>true,
    measure:(text,size)=>text.length*size*0.5,loadGeography:async()=>({units:{},places:[]}),print:async()=>{prints++;}});
  const buttons=()=>{const all=[];function visit(node){if(node.tag==='button')all.push(node);node.children.forEach(visit);}visit(host);return all;};
  return {api,nodes,body,window,owner(value){owner=value;},prints:()=>prints,
    fill(){for(const [key,value]of Object.entries(example)){const input=nodes.get('merge'+key);if(input)input.value=value;}},
    click(text){const target=buttons().find(button=>button.textContent.startsWith(text));assert.ok(target,text);target.emit('click');}};
}
test('owner-only queue prevents duplicate PESEL, does not persist and clears on role loss',async()=>{
  const t=fixture();t.fill();t.click('Dodaj / aktualizuj');assert.equal(t.api.queue().length,1);
  t.fill();t.click('Dodaj / aktualizuj');assert.equal(t.api.queue().length,1);
  assert.match(t.nodes.get('mailMergeMessage').textContent,/ten sam PESEL/);
  t.click('Drukuj / PDF');await new Promise(resolve=>setTimeout(resolve,0));
  assert.equal(t.prints(),1);assert.equal(t.nodes.get('mailMergePrint').querySelectorAll('.mail-merge-page').length,7);
  t.owner(false);t.click('Drukuj / PDF');assert.equal(t.prints(),1);
  t.api.clear();assert.deepEqual(t.api.queue(),[]);assert.equal(t.nodes.get('mergepesel').value,'');
  assert.equal(t.nodes.get('mailMergePrint').parent,null);assert.equal(t.api.open(),false);
});
test('integration protects the route, keeps geography lazy and never stores private mail-merge drafts',()=>{
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(html,/data-notebook="mailMerge" data-private-owner hidden/);
  assert.match(app,/\["workTime", "clients", "mailMerge"\]\.includes\(notebookName\) && !canViewPrivateModules/);
  assert.match(app,/mailMergeModule\?\.clear\(\)/);
  const source=fs.readFileSync(path.join(root,'mail-merge.js'),'utf8');
  assert.doesNotMatch(source,/localStorage|sessionStorage|indexedDB|innerHTML|fetch\(/);
  assert.match(source,/if \(!authorized\(\) \|\| printBusy \|\| cleanupPrint\) return/);
  assert.match(fs.readFileSync(path.join(root,'styles.css'),'utf8'),/@page mailMerge \{ size: A4 portrait; margin: 0; \}/);
});
