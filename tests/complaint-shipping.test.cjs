const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const shipping=require('../complaint-shipping.js');
class Element {
  constructor(tag){this.tag=tag;this.children=[];this.events={};this.attributes={};this.textContent='';this.value='';this.hidden=false;}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=nodes;}
  setAttribute(name,value){this.attributes[name]=value;}
  addEventListener(name,fn){this.events[name]=fn;}
}
function nodes(root){return [root,...root.children.flatMap(nodes)];}
function text(root){return nodes(root).map(n=>n.textContent).join('\n');}
function setup(read=async()=>({})){const host=new Element('section');let user='owner',reads=0;const copied=[];
  const module=shipping.create({document:{getElementById:()=>host,createElement:tag=>new Element(tag)},user:()=>user,
    read:async()=>{reads++;return read();},copy:async value=>copied.push(value)});
  return {host,module,copied,reads:()=>reads,user:value=>{user=value;}};
}
const product={productName:'HearLink 3050',manufacturer:'Philips',serial:'TEST'};
test('manufacturer routes follow supplied destinations, including Beltone/Interton and Olsztyn default',()=>{
  for(const [manufacturer,id]of [['Phonak','sonova'],['SONOVA POLSKA','sonova'],['SIGNIA','sivantos'],['Audio Service','sivantos'],['WSA','sivantos'],
    ['Audibel','audibel'],['Interton.pl','interton'],['Beltone','interton'],['ReSound','gnp'],['Oticon','dgs'],['Philips','dgs'],['Sonic','dgs'],['Bernafon','acustica']])assert.equal(shipping.recommend(manufacturer),id,manufacturer);
  for(const manufacturer of ['', 'Starkey', 'Unknown', 'Oticon Phonak', 'Notphonak'])assert.equal(shipping.recommend(manufacturer),'');
  assert.match(shipping.routes.find(r=>r.id==='gnp').address,/Olsztyn/);
  assert.match(shipping.routes.find(r=>r.id==='sivantos').address,/Przemysłowa 18/);
});
test('same destination groups multiple products; changing address is informational and resets when product changes',async()=>{
  const s=setup();s.module.render([product,{...product,serial:'TEST2',manufacturer:'Oticon'}]);await new Promise(setImmediate);
  assert.equal(nodes(s.host).filter(n=>n.className==='complaint-shipping-address').length,1);
  assert.match(text(s.host),/Pozycje: 1, 2/);assert.match(text(s.host),/Mierzyn/);
  const select=nodes(s.host).find(n=>n.tag==='select');select.value='oticon';select.events.change();
  assert.equal(nodes(s.host).filter(n=>n.className==='complaint-shipping-address').length,2);
  await nodes(s.host).find(n=>n.tag==='button').events.click();assert.match(s.copied[0],/Oticon Polska/);
  s.module.render([{...product,manufacturer:'Beltone',productName:'Envision'}]);
  assert.match(text(s.host),/Kraków/);assert.equal(s.reads(),1);
});
test('unknown manufacturers require selection and all content is inserted as text',async()=>{
  const s=setup();s.module.render([{productName:'<img onerror=alert(1)>',manufacturer:''}]);await new Promise(setImmediate);
  assert.equal(nodes(s.host).filter(n=>n.className==='complaint-shipping-address').length,0);
  assert.match(text(s.host),/Nie rozpoznano adresu/);assert.equal(nodes(s.host).some(n=>n.tag==='img'),false);
  s.module.render([]);assert.equal(s.host.hidden,true);
});
test('private courier identifiers are read once per session, sanitized and cleared on logout',async()=>{
  const s=setup(async()=>({dgs:[{carrier:'UPS',code:'TEST-ACCOUNT'}],unknown:[{carrier:'UPS',code:'HIDDEN'}]}));
  s.module.render([product]);await new Promise(setImmediate);
  assert.match(text(s.host),/TEST-ACCOUNT/);assert.ok(!text(s.host).includes('HIDDEN'));
  s.module.render([product]);assert.equal(s.reads(),1);
  s.user('');s.module.clear();assert.equal(s.host.hidden,true);assert.ok(!text(s.host).includes('TEST-ACCOUNT'));
  assert.deepEqual(shipping.cleanAccounts({dgs:[{carrier:'BAD',code:'X'},{carrier:'UPS',code:''}]}),{dgs:[]});
});
test('late courier response cannot restore private data after logout',async()=>{
  let resolve;const s=setup(()=>new Promise(done=>{resolve=done;}));
  s.module.render([product]);s.user('');s.module.clear();resolve({dgs:[{carrier:'UPS',code:'LATE-SECRET'}]});
  await new Promise(setImmediate);assert.equal(s.host.hidden,true);assert.ok(!text(s.host).includes('LATE-SECRET'));
});
test('missing private configuration never blocks public addresses, and shipping information never prints',async()=>{
  const s=setup(async()=>{throw new Error('Unavailable');});s.module.render([product]);await new Promise(setImmediate);
  assert.match(text(s.host),/Lubieszyńska/);assert.match(text(s.host),/Kody kurierskie niedostępne/);
  const html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('styles.css','utf8');
  assert.ok(html.indexOf('id="complaintShippingInfo"')<html.indexOf('id="pricingComplaintPrint"'));
  assert.match(css,/@media print \{ #complaintShippingInfo \{ display: none !important; \} \}/);
  assert.doesNotMatch(fs.readFileSync('complaint-shipping.js','utf8'),/innerHTML|localStorage|sessionStorage/);
  assert.match(fs.readFileSync('scripts/public_assets.py','utf8'),/"complaint-shipping.js"/);
  assert.match(fs.readFileSync('.gitignore','utf8'),/\/private\//);
});
