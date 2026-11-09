const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const care=require('../care-form.js');
test('four maintenance variants keep rechargeable and battery instructions separate',()=>{
  for(const type of ['BTE','RIC'])for(const power of ['battery','rechargeable']){
    const text=care.instructions(type,power).flat().join(' ');
    assert.match(text,/Nie klej i nie naprawiaj/);
    if(power==='rechargeable'){
      assert.match(text,/ładuj aparat/);assert.match(text,/Nie otwieraj obudowy/);
      assert.doesNotMatch(text,/otwierając komorę/);
    }else assert.match(text,/otwierając komorę baterii/);
    if(type==='RIC'){assert.match(text,/Filtr przeciwwoskowinowy/);assert.doesNotMatch(text,/Czas działania tabletki/);}
    else {assert.match(text,/Odłącz wkładkę i wężyk/);assert.match(text,/bez elektroniki/);}
  }
});
test('only products matching construction and power are included',()=>{
  assert.ok(care.availableProducts('RIC','battery').some(p=>p.id==='filters'));
  assert.ok(!care.availableProducts('RIC','battery').some(p=>p.id==='tablets'));
  assert.ok(care.availableProducts('BTE','rechargeable').some(p=>p.id==='charger'));
  assert.ok(!care.availableProducts('BTE','rechargeable').some(p=>['batteries','drying','filters','domes'].includes(p.id)));
  assert.equal(new Set(care.products.map(p=>p.id)).size,care.products.length);
  assert.ok(care.products.every(p=>!Object.hasOwn(p,'price')),'no invented default prices');
});
test('prices support comma and decimal point; blank is not zero; totals are in integer cents',()=>{
  for(const [raw,expected]of [['',null],[' ',null],['0',0],['12,50',1250],['1 200.99',120099],['0.10',10]])assert.equal(care.priceCents(raw),expected);
  for(const raw of ['-1','12.345','Infinity','abc','1,2,3','100000'])assert.ok(Number.isNaN(care.priceCents(raw)));
  assert.deepEqual(care.totals([{price:'12,50',quantity:2},{price:'0.10',quantity:3}]),{cents:2530,missing:0});
  assert.deepEqual(care.totals([{price:'',quantity:1},{price:'0',quantity:1},{price:'1',quantity:100}]),{cents:0,missing:2});
});
test('new view follows receipt, is printable offline, and never stores or sends personal information',()=>{
  const html=fs.readFileSync('index.html','utf8'),app=fs.readFileSync('app.js','utf8');
  assert.ok(html.indexOf('id="careTab"')>html.indexOf('id="receiptTab"'));
  assert.ok(html.indexOf('id="careTab"')<html.indexOf('id="rodoTab"'));
  assert.match(html,/id="pricingCareView"/);assert.match(app,/care: "devices"/);
  assert.match(fs.readFileSync('offline-forms.js','utf8'),/kind === "care"/);
  assert.match(fs.readFileSync('offline-sw.js','utf8'),/"care-form.js"/);
  assert.match(fs.readFileSync('scripts/public_assets.py','utf8'),/"care-form.js"/);
  assert.doesNotMatch(fs.readFileSync('care-form.js','utf8'),/fetch\(|localStorage|sessionStorage|indexedDB|supabase/);
  const css=fs.readFileSync('styles.css','utf8');
  assert.match(css,/@page care \{ size: A4 portrait;/);
  assert.match(css,/body\.offline-care-print #offlinePrint/);
});
