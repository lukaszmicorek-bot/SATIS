const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const wsa=require('../wsa-repair-groups.js');
const repairs=require('../repair-catalog.js').rows;
const examples=[
 ['Ace 1px',1],['Ace 3px',2],['Ace 7px',3],['Active Pro IX',5],['Carat 3px',2],['Carat 7px',3],
 ['Insio 1IX ITC',2],['Insio 7Nx',3],['Insio Charge&Go AX',5],['Intuis 3',1],['Intuis M 4.0',1],['Intuis P 4.3',2],['Intuis SP 4.7',3],
 ['Motion 1px',1],['Motion 3px',2],['Motion 7px',3],['Motion 13 1Nx',1],['Motion 13P 3Nx',2],['Motion 13P 7Nx',3],
 ['Motion Charge&Go 3X',5],['Orion Charge&Go',5],['Prompt',1],['Pure 1px',1],['Pure 3px',2],['Pure 7px',3],
 ['Pure 10 1Nx',1],['Pure 10 3Nx',2],['Pure 10 7Nx',3],['Pure 13 1Nx',1],['Pure 13 3Nx',2],['Pure 13 7Nx',3],
 ['Pure 312 1AX',1],['Pure 312 3AX',2],['Pure 312 7AX',3],['Pure C&G 5IX',5],['Silk 5X',3],['Silk C&G 3IX',5],['Styletto 7AX',7],
 ['Volta P B',1],['Audio Service Ilea 3 G4',1],['Audio Service Mood 8 G6',2],['Audio Service Rixx 16 G5',3],['Audio Service Mood Li-Ion 4 G6',5],
 ['Signia Connexx CROS',8],['Ładowarka indukcyjna Signia',6],['Ładowarka indukcyjna II Signia biała z pokrywką',6],
 ['Ładowarka standardowa Pure Charge&Go AX biała',6],['Ładowarka Dry&Clean Pure AX',4],['Ładowarka przenośna Pure AX',4],
 ['Ładowarka Styletto AX',4],['Ładowarka Active Pro IX',4],['Ładowarka Insio Charge&Go AX',4],['Ładowarka Silk Charge&Go IX',6],
 ['Ładowarka Smart Power',6],['Ładowarka indukcyjna Smart Li-Ion Power',6],['Ładowarka indukcyjna Charging Station czarna z pokrywką',6],
 ['Ładowarka standardowa Charging Station B-HP czarna',6],['Ładowarka Charging+ Station B-P',4],['Ładowarka przenośna R Li 7',4],
 ['Smart Transmiter',3],['Smart Transmiter 2,4',7],['Streamline TV',7],['Pilot miniPocket',2],['Pilot Smart Key',2],['Pilot Smart Remote',6],
 ['Smart Mic',8],['Streamline Mic',8],['Streamer Smart Connect',5],['Słuchawka HP ERU',3]
];
test('each of the 69 source rows has a tested representative and the correct current gross price',()=>{
 assert.equal(wsa.reference.length,69);assert.equal(examples.length,69);
 const covered=new Set(),prices=[0,350,400,480,580,730,400,1000,1200];
 for(const [name,group]of examples){const q=wsa.quote(name,[],repairs);assert.equal(q.status,'matched',name);assert.equal(q.group,group,name);assert.equal(q.gross,prices[group],name);covered.add(q.rule.id);}
 assert.equal(covered.size,69,'all source rows, not just all eight groups');
 assert.equal(wsa.quote('HP ERU',[],repairs).group,3);
});
test('all listed technology levels and generations follow the card, not retail price',()=>{
 for(const level of [1,2,3,5,7]){
   for(const gen of ['px','Nx','IX'])assert.equal(wsa.quote(`Insio ${level}${gen}`,[],repairs).group,level===7?3:2);
   for(const gen of ['Nx','X','AX'])assert.equal(wsa.quote(`Pure 312 ${level}${gen}`,[],repairs).group,level<3?1:level===7?3:2);
 }
 for(const gen of [4,5,6,7,8])for(const level of [3,4,6,8,12,16])assert.equal(wsa.quote(`Audio Service Mood ${level} G${gen}`,[],repairs).group,level<8?1:level<16?2:3);
 for(const gen of [5,6,7,8])assert.equal(wsa.quote(`Audio Service Mood Li 16 G${gen}`,[],repairs).group,5);
});
test('incomplete models, foreign brands and unspecified charger variants never get a guessed price',()=>{
 for(const name of ['Pure','Pure 5AX','Insio','Silk 5IX','Carat 1px','Intuis 4','Intuis 4.4','Styletto NX','Styletto Pro','Pure C&G BCT',
   'Audio Service Mood Li G4','Audio Service Mood 8 G9','Charger Pure AX','CROS','Phonak CROS','Oticon Silk 5X','Insio 1IX / Pure 312 7AX',
   'Pure 312 3AX / Pure 312 7AX','Insio 1IX i 7IX','Audio Service Mood 3 G6 / 16 G6'])assert.notEqual(wsa.quote(name,[],repairs).status,'matched',name);
});
test('main catalog resolves aliases, NFZ duplicates and AS brand; conflicting groups stop autofill',()=>{
 const rows=[
   {model:'Pure C&G 5AX',tradeName:'Aparat słuchowy zauszny Signia Pure C&G 5AX',manufacturer:'WSAUD A/S',nfzCode:'P.01.01.00'},
   {model:'Pure C&G 5AX',tradeName:'Signia Pure C&G 5AX',manufacturer:'WSAUD A/S',nfzCode:'P.01.01.01'},
   {model:'Insio 1IX ITC',manufacturer:'WSAUD A/S'},{model:'Insio 1IX ITE',manufacturer:'WSAUD A/S'},
   {model:'Mood Li-Ion 4 G6',manufacturer:'AS Audio-Service GmbH'}
 ];
 const q=wsa.quote('Pure 5AX',rows,repairs);assert.equal(q.group,5);assert.equal(q.matchedModel,'Pure C&G 5AX');assert.match(q.source,/Cennik aparatów/);
 assert.equal(wsa.quote('Insio1IX',rows,repairs).group,2);
 assert.equal(wsa.quote('Mood Li-Ion 4 G6',rows,repairs).group,5);
 const ambiguous=[...rows,{model:'Pure 5AX',manufacturer:'WSA'}];
 assert.equal(wsa.quote('Pure 5AX',ambiguous,repairs).status,'ambiguous');
 const foreign=[{model:'Silk 5X',manufacturer:'Oticon'}];assert.equal(wsa.quote('Silk 5X',foreign,repairs).status,'unknown');
});
test('price comes only from the current repair catalog; missing or duplicate price is not guessed',()=>{
 const changed=repairs.map(row=>row.name.endsWith('grupa 3')?{...row,gross:999}:row);
 assert.equal(wsa.quote('Silk 5X',[],changed).gross,999);
 assert.equal(wsa.quote('Silk 5X',[],[]).status,'missing-price');
 assert.equal(wsa.quote('Silk 5X',[],[...repairs,repairs.find(row=>row.name.endsWith('grupa 3'))]).status,'missing-price');
});
const source=fs.readFileSync('app.js','utf8');
function extract(name){const start=source.indexOf(`function ${name}(`),rest=source.slice(start);return rest.slice(0,rest.slice(1).search(/\n(?:async )?function /)+1);}
test('service autofills only out-of-warranty blank/automatic cost; manual and saved costs stay unchanged',()=>{
 const input={value:'',dataset:{}},hint={textContent:'',hidden:true};
 const fields={'#repairDeviceName':{value:'Silk 5X'},'#repairCategory':{value:'NAPRAWA POGWARANCYJNA'},'#repairServiceCostMatch':hint};
 const context=vm.createContext({window:{SatisWSARepairGroups:wsa,SatisRepairCatalog:{rows:repairs}},pricingRecords:[],repairServiceCostInput:input,
  document:{querySelector:s=>fields[s]}});
 for(const name of ['normalizeRepairCategory','normalizePricingPrice','normalizeServiceCost','formatPricingAmount','suggestedPhonakRepairCost','syncRepairServiceCostSuggestion'])vm.runInContext(extract(name),context);
 context.syncRepairServiceCostSuggestion();assert.equal(input.value,'480');assert.match(hint.textContent,/grupa 3/);assert.equal(hint.hidden,false);
 fields['#repairDeviceName'].value='Pure C&G 5AX';context.syncRepairServiceCostSuggestion();assert.equal(input.value,'730');
 input.value='123';input.dataset.manualCost='1';context.syncRepairServiceCostSuggestion();assert.equal(input.value,'123');assert.match(hint.textContent,/Zachowano/);
 input.value='0';context.syncRepairServiceCostSuggestion();assert.equal(input.value,'0');
 delete input.dataset.manualCost;delete input.dataset.autoValue;input.value='650';context.syncRepairServiceCostSuggestion();assert.equal(input.value,'650');
 input.value='';fields['#repairCategory'].value='NAPRAWA GWARANCYJNA';context.syncRepairServiceCostSuggestion();assert.equal(input.value,'');assert.equal(hint.hidden,true);
 fields['#repairCategory'].value='NAPRAWA POGWARANCYJNA';fields['#repairDeviceName'].value='Audeo P30';context.syncRepairServiceCostSuggestion();assert.equal(input.value,'450');
 fields['#repairDeviceName'].value='niepełna nazwa';context.syncRepairServiceCostSuggestion();assert.equal(input.value,'');
});
test('reference assets are included online/offline and no database operation is part of lookup',()=>{
 for(const file of ['scripts/public_assets.py','offline-sw.js','index.html'])assert.match(fs.readFileSync(file,'utf8'),/wsa-repair-groups.js/);
 for(const file of ['scripts/public_assets.py','offline-sw.js'])assert.match(fs.readFileSync(file,'utf8'),/repair-pricing\/wsa-groups-2024-11.pdf/);
 assert.ok(fs.statSync('repair-pricing/wsa-groups-2024-11.pdf').size>1000);
 assert.doesNotMatch(fs.readFileSync('wsa-repair-groups.js','utf8'),/fetch\(|supabase|localStorage/);
});
