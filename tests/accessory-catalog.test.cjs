const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const catalog=require('../accessory-catalog.js');
const find=(brand,name,price)=>catalog.rows.find(row=>row.brands.includes(brand)&&row.name===name&&(price===undefined||row.price===price));
test('source produces 58 distinct entries without duplicating repeated Beltone sections',()=>{
  assert.equal(catalog.rows.length,58);
  assert.equal(catalog.rows.filter(row=>row.kind==='charger').length,42);
  assert.equal(new Set(catalog.rows.map(row=>row.id)).size,58);
  assert.equal(catalog.rows.filter(row=>row.brands.includes('Beltone')&&row.name==='Ładowarka Standard').length,1);
  assert.ok(catalog.rows.every(row=>Array.isArray(row.notes)&&Array.isArray(row.warnings)));
});
test('discounts are the price of a single charger at one or two hearing aid purchases',()=>{
  assert.equal(find('Sonic','Charger miniRITE T R').onePrice,480);
  assert.equal(find('Sonic','Charger miniRITE T R').twoPrice,288);
  assert.equal(find('Oticon','SmartCharger miniRITE').onePrice,590);
  assert.equal(find('Oticon','SmartCharger miniRITE').twoPrice,354);
  assert.equal(find('Phonak','Charger RIC I EU EPS').onePrice,325);
  assert.equal(find('Phonak','Charger RIC I EU EPS').twoPrice,195);
  assert.equal(find('ReSound','Ładowarka Premium').onePrice,975);
  assert.equal(find('ReSound','Ładowarka Premium').twoPrice,650);
  assert.equal(catalog.discounted(1050,15),892.5);
});
test('disputed source values remain visible with arithmetic warnings instead of silent corrections',()=>{
  const standard=find('Beltone','Ładowarka Standard'),desktop=find('Beltone','Ładowarka Desktop'),tv=find('Beltone','TV Streamer');
  assert.equal(standard.twoPrice,370);assert.match(standard.warnings.join(' '),/375/);
  assert.equal(desktop.twoPrice,350);assert.match(desktop.warnings.join(' '),/420/);
  assert.equal(tv.patientPrice,807);assert.match(tv.warnings.join(' '),/807,50/);
  const ambiguous=catalog.rows.filter(row=>row.name==='Charger miniBTE T R');
  assert.equal(ambiguous.length,2);assert.deepEqual(ambiguous.map(row=>row.price),[960,1180]);
  assert.ok(ambiguous.every(row=>row.warnings.length));
  assert.match(catalog.sourceNotes.join(' '),/Audeo I-R: 3800/);
});
test('missing prices, VAT and guarantee terms are not fabricated',()=>{
  const silk=find('Signia','Ładowarka przenośna · Silk');
  assert.equal(silk.price,null);assert.equal(silk.vat,undefined);assert.equal(silk.warranty,36);
  const bernafon=find('Bernafon','Ładowarka do Encanta');
  assert.equal(bernafon.price,undefined);assert.equal(bernafon.specialPrice,250);assert.equal(bernafon.priceLabel,'Po rabacie');
  assert.equal(bernafon.warranty,undefined);
  assert.equal(find('Audibel','Ładowarka').price,550);assert.equal(find('Starkey','Ładowarka').vat,8);
  assert.equal(find('Phonak','Roger On iN V2').refundable,false);
  assert.equal(find('Philips','CROS 5050 / 1730').refundable,false);
  assert.equal(find('Oticon','Charger miniRITE').warranty,24);
  assert.match(catalog.warrantyGroups.find(group=>group.brands.includes('Philips')).items[1][1],/6 miesięcy/);
});
test('search, manufacturer and product type filters combine without touching existing pricing',()=>{
  const filtered=catalog.filterRows({query:'ric i',brand:'Phonak',kind:'charger'});
  assert.ok(filtered.length);assert.ok(filtered.every(row=>row.brands.includes('Phonak')&&row.kind==='charger'));
  assert.equal(catalog.filterRows({query:'nieistniejący model',kind:''}).length,0);
  assert.equal(catalog.filterRows({brand:'Beltone',kind:'cros'})[0].price,3200);
  assert.ok(catalog.filterRows({query:'ładowarka',brand:'Signia',kind:'charger'}).length);
  const source=fs.readFileSync('accessory-catalog.js','utf8');
  assert.doesNotMatch(source,/fetch\(|localStorage|supabase|pricingRecords\s*=/);
  assert.doesNotMatch(source,/innerHTML\s*[+]=/);
  assert.match(fs.readFileSync('offline-sw.js','utf8'),/"accessory-catalog.js"/);
  assert.match(fs.readFileSync('scripts/public_assets.py','utf8'),/"accessory-catalog.js"/);
});
