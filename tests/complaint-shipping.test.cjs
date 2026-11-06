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
test('recipient choices and address blocks are alphabetical regardless of product order',async()=>{
  const labels=shipping.routes.map(route=>route.label);
  assert.deepEqual(labels,[...labels].sort((a,b)=>a.localeCompare(b,'pl',{sensitivity:'base',numeric:true})));
  const s=setup();s.module.render([{...product,manufacturer:'Sonova'},
    {...product,manufacturer:'Audibel',serial:'TEST2'},{...product,manufacturer:'ReSound',serial:'TEST3'}]);
  await new Promise(setImmediate);
  const select=nodes(s.host).find(n=>n.tag==='select');
  assert.deepEqual(select.children.slice(1).map(n=>n.textContent),labels);
  const blocks=nodes(s.host).filter(n=>n.className==='complaint-shipping-address');
  assert.deepEqual(blocks.map(n=>n.children.find(child=>child.tag==='strong').textContent),
    ['AUDIBEL · Warszawa','GNP / ReSound · Olsztyn','SONOVA · Warszawa']);
  assert.match(text(blocks[0]),/Pozycje: 2/);assert.match(text(blocks[2]),/Pozycje: 1/);
  assert.equal(nodes(blocks[0]).filter(n=>n.className==='complaint-shipping-company').length,1);
  assert.equal(nodes(blocks[0]).filter(n=>n.className==='complaint-shipping-postal').length,1);
});
test('courier details and phone are on separate lines from account and NIP',async()=>{
  const s=setup(async()=>({interton:[{carrier:'DHL',code:'TEST-ACCOUNT',detail:'TEST-DETAIL'}]}));
  s.module.render([{...product,manufacturer:'Beltone'}]);await new Promise(setImmediate);
  const courier=nodes(s.host).find(n=>n.className==='complaint-shipping-courier');
  assert.deepEqual(courier.children.map(n=>n.textContent),['DHL: TEST-ACCOUNT','TEST-DETAIL']);
  const details=nodes(s.host).filter(n=>n.className==='complaint-shipping-detail').map(n=>n.textContent);
  assert.ok(details.some(value=>value.startsWith('NIP: ')));
  assert.ok(details.some(value=>value.startsWith('Tel.: ')));
});
test('Sonova uses only DHL even when private configuration still contains UPS',async()=>{
  assert.deepEqual(shipping.routes.find(route=>route.id==='sonova').carriers,['DHL']);
  const sonova={...product,manufacturer:'Phonak'};
  const fallback=setup();fallback.module.render([sonova]);await new Promise(setImmediate);
  assert.match(text(fallback.host),/Kurier: DHL/);assert.doesNotMatch(text(fallback.host),/UPS/);
  const s=setup(async()=>({sonova:[{carrier:'UPS',code:'TEST-UPS'},{carrier:'DHL',code:'TEST-DHL'}]}));
  s.module.render([sonova]);await new Promise(setImmediate);
  assert.match(text(s.host),/DHL: TEST-DHL/);assert.doesNotMatch(text(s.host),/UPS|TEST-UPS/);
});
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
  const oticon=nodes(s.host).find(n=>n.className==='complaint-shipping-address'&&text(n).includes('Oticon Polska'));
  await nodes(oticon).find(n=>n.tag==='button').events.click();assert.match(s.copied[0],/Oticon Polska/);
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
