const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const catalog=require('../repair-catalog.js');
test('all 35 spreadsheet rows keep their net, gross, VAT, description and source row',()=>{
  assert.equal(catalog.rows.length,35);assert.equal(catalog.sourceRows.length,35);
  assert.equal(new Set(catalog.rows.map(row=>row.id)).size,35);
  for(const [index,row]of catalog.rows.entries()){
    assert.equal(row.sourceRow,index+2);
    assert.equal(row.originalName,catalog.sourceRows[index][0]);
    assert.equal(row.net,catalog.sourceRows[index][1]);assert.equal(row.gross,catalog.sourceRows[index][2]);
    assert.equal(row.description,catalog.sourceRows[index][3]);assert.equal(row.vat,catalog.sourceRows[index][4]);
    assert.equal(Math.round(row.net*(1+row.vat/100)*100),Math.round(row.gross*100));
  }
});
test('Phonak constructions remain separate and same-name Roger services are not deduplicated',()=>{
  const bte=catalog.filterRows({brand:'Phonak',construction:'BTE/RIC',query:'klasa 30'});
  const ite=catalog.filterRows({brand:'Phonak',construction:'ITE',query:'klasa 30'});
  assert.equal(bte.length,1);assert.equal(bte[0].gross,450);
  assert.equal(ite.length,1);assert.equal(ite[0].gross,400);
  const roger=catalog.filterRows({query:'roger'});assert.equal(roger.length,2);
  assert.deepEqual(roger.map(row=>[row.code,row.gross,row.vat]),[['U063.020',1100,8],['U063.030',1200,23]]);
  assert.deepEqual(roger.map(row=>row.variant),['Wyrób medyczny','Wyrób niemedyczny']);
});
test('U codes map to Phonak and 9 codes to Philips; uncoded WSA and Beltone stay unchanged',()=>{
  assert.equal(catalog.filterRows({brand:'unspecified'}).length,0);
  assert.equal(catalog.filterRows({brand:'Phonak'}).length,17);
  assert.equal(catalog.filterRows({brand:'Philips'}).length,7);
  for(const row of catalog.rows){
    if(row.code.startsWith('U'))assert.equal(row.brand,'Phonak',row.code);
    if(row.code.startsWith('9'))assert.equal(row.brand,'Philips',row.code);
  }
  assert.equal(catalog.filterRows({query:'U062.010'})[0].brand,'Phonak');
  assert.equal(catalog.filterRows({query:'U063.030'})[0].brand,'Phonak');
  assert.equal(catalog.filterRows({query:'90082522'})[0].brand,'Philips');
  assert.equal(catalog.filterRows({query:'90082039'})[0].brand,'Philips');
  assert.equal(catalog.filterRows({query:'90082041'})[0].brand,'Philips');
  const wsa=catalog.filterRows({brand:'WSA'});assert.equal(wsa.length,8);assert.ok(wsa.every(row=>!row.construction));
  assert.deepEqual(wsa.map(row=>row.gross),[350,400,480,580,730,400,1000,1200]);
  const beltone=catalog.filterRows({brand:'Beltone'});assert.equal(beltone.length,3);
  assert.equal(beltone.find(row=>row.warranty).warranty,12);
  assert.equal(beltone.find(row=>row.name.startsWith('Rezygnacja')).gross,100);
});
test('service categories and code/model searches combine; static catalog never writes to the database',()=>{
  assert.equal(catalog.filterRows({query:'90082517'})[0].gross,850);
  assert.equal(catalog.filterRows({category:'earmold'})[0].gross,190);
  assert.equal(catalog.filterRows({category:'parts'}).length,3);
  assert.equal(catalog.filterRows({query:'nieistniejący'}).length,0);
  const source=fs.readFileSync('repair-catalog.js','utf8');
  assert.doesNotMatch(source,/fetch\(|localStorage|supabase|repairRecords\s*=/);
  for(const file of ['scripts/public_assets.py','offline-sw.js','index.html'])assert.match(fs.readFileSync(file,'utf8'),/repair-catalog.js/);
});
