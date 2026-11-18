const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {summarize,day}=require('../statistics.js');
const source=fs.readFileSync(require.resolve('../app.js'),'utf8');
const today='2026-11-18';
const device=(id,extra={})=>({id,model:'Aparat testowy',manufacturer:'Producent',location:'P63',type:'NA STANIE',validStockIdentity:true,accessory:false,receivedDate:'2026-01-10',...extra});
const service=(id,extra={})=>({id,location:'P63',category:'NAPRAWA GWARANCYJNA',receivedDate:'2026-01-12',order:false,closed:false,...extra});
const count=(data,options={})=>summarize({devices:[],services:[],...data},{today,...options});
function extract(name){const start=source.indexOf(`function ${name}(`);assert.ok(start>=0,name);const rest=source.slice(start);return rest.slice(0,rest.slice(1).search(/\n(?:async )?function /)+1);}

test('sales use actual sale dates and current sold status; accessories, returns and stock are separate',()=>{
 const result=count({devices:[device('stock'),device('reserved',{type:'REZERWACJA'}),device('sold',{type:'SPRZEDANY',receivedDate:'2025-12-31',saleDate:'2026-02-01'}),
  device('charger',{type:'SPRZEDANY',accessory:true,saleDate:'2026-02-03'}),device('returned',{type:'ZWROT',saleDate:'2026-02-01',returnDate:'2026-03-01'}),device('invalid-stock',{validStockIdentity:false}),device('stock-charger',{accessory:true})]});
 assert.equal(result.totals.soldAids,1);assert.equal(result.totals.soldAccessories,1);assert.equal(result.totals.returnedAids,1);
 assert.equal(result.rows[1].soldAids,1);assert.equal(result.rows[2].returnedAids,1);assert.equal(result.rows[0].receivedAids,4);
 assert.equal(result.current.stockAids,1);assert.equal(result.current.stockAccessories,1);assert.equal(result.current.reservedAids,1);
 assert.equal(result.topModels[0].count,1);assert.deepEqual(result.availableYears,[2025,2026]);
});
test('one case remains one case, with intake and completion assigned independently',()=>{
 const result=count({services:[service('older',{receivedDate:'2025-12-31',closed:true,completedDate:'2026-01-02'}),service('repair'),service('order',{order:true,closed:true,completedDate:'2026-02-05'}),service('open-order',{order:true})]});
 assert.equal(result.totals.serviceIntake,1);assert.equal(result.totals.orderIntake,2);assert.equal(result.totals.completedCases,2);
 assert.equal(result.current.openServices,1);assert.equal(result.current.openOrders,1);
 assert.equal(result.categories.find(row=>row.category==='Zamówienia').count,2);
});
test('year and location filters intersect, while current stock is not a historical snapshot',()=>{
 const devices=[device('one',{type:'SPRZEDANY',saleDate:'2025-02-02'}),device('two',{type:'SPRZEDANY',location:'P50',saleDate:'2026-02-02'}),device('stock')];
 const older=count({devices},{year:2025,place:'P63'});assert.equal(older.totals.soldAids,1);assert.equal(older.current.stockAids,1);
 assert.equal(count({devices},{year:2026,place:'P63'}).totals.soldAids,0);
 const annual=count({devices},{mode:'years'});assert.equal(annual.totals.soldAids,2);assert.equal(annual.rows.find(row=>row.key==='2025').soldAids,1);
 const monthly=count({devices});assert.equal(monthly.rows.reduce((sum,row)=>sum+row.soldAids,0),monthly.totals.soldAids);
 assert.equal(monthly.rows[10].partial,true);assert.equal(monthly.rows[11].future,true);
});
test('missing, invalid and future event dates are flagged, never invented; IDs deduplicate within each source only',()=>{
 const rows=[device('missing',{receivedDate:'',type:'SPRZEDANY',saleDate:''}),device('bad',{receivedDate:'2026-02-30'}),device('future',{receivedDate:'2027-01-01'}),device('one'),device('one')];
 const result=count({devices:rows,services:[service('one'),service('other',{serial:'same-as-one'})]});
 assert.deepEqual(result.quality,{missingDates:2,invalidDates:1,futureDates:1,duplicateIds:1});
 assert.equal(result.totals.receivedAids,1);assert.equal(result.totals.serviceIntake,2);assert.equal(result.sourceCounts.devices,4);
 assert.deepEqual(result.availableYears,[2026]);assert.equal(day('2024-02-29'),'2024-02-29');assert.equal(day('2025-02-29'),'');
 assert.throws(()=>summarize({}),/Nieprawidłowa/);assert.equal(count({}).totals.soldAids,0);
});
test('application projects only aggregate fields; whole order is completed on the latest item date',()=>{
 const c=vm.createContext({records:[{id:'device',deviceName:'Charger',location:'P63',type:'SPRZEDANY',pickupDate:'2026-02-02',customerName:'Private',serialNumber:'SECRET',salesInvoice:'PRIVATE',payment:99}],
  repairRecords:[{id:'order',category:'ZAMÓWIENIE',pickupDate:'2026-01-01',items:[{pickupDate:'2026-01-02'},{pickupDate:'2026-01-05'}]},
   {id:'partial',items:[{pickupDate:'2026-02-01'},{pickupDate:''}]}],
  canViewPrivateModules:()=>true,normalizeRepairLocation:value=>value||'',displayType:row=>row.type,
  soldDeviceSaleDate:row=>row.pickupDate,pricingOfferAccessoryKind:row=>row.model==='Charger'?'charger':'',hasValidStockIdentity:()=>true,
  repairOrderItemsForRecord:row=>row.items||[],effectiveRepairStatus:()=> 'ODEBRANE',isoDateForSave:value=>value||'',
  normalizeRepairCategory:value=>value,repairDocumentInfo:row=>({type:row.category==='ZAMÓWIENIE'?'ORDER':'COMPLAINT'})});
 vm.runInContext(extract('statisticsCurrentSources'),c);
 const data=JSON.parse(JSON.stringify(c.statisticsCurrentSources()));
 assert.equal(data.devices[0].accessory,true);assert.equal(data.services[0].completedDate,'2026-01-05');assert.equal(data.services[0].order,true);
 assert.equal(data.services[1].completedDate,'');assert.doesNotMatch(JSON.stringify(data),/Private|SECRET|PRIVATE|payment|serialNumber|salesInvoice|customerName/);
 c.canViewPrivateModules=()=>false;assert.deepEqual(JSON.parse(JSON.stringify(c.statisticsCurrentSources())),{devices:[],services:[]});
});
test('owner access is checked before module initialization and navigation; data is cleared on role change',()=>{
 const c=vm.createContext({canViewPrivateModules:()=>false});vm.runInContext(extract('initializeStatisticsModule'),c);
 assert.equal(c.initializeStatisticsModule(),null);
 vm.runInContext(extract('switchNotebook'),c);assert.doesNotThrow(()=>c.switchNotebook('statistics'));
 assert.match(extract('updatePrivateModulesVisibility'),/statisticsModule\?\.clear\(\)/);
 assert.match(extract('clearSensitiveApplicationState'),/statisticsModule\?\.clear\(\)/);
 assert.match(extract('render'),/activeNotebook === "statistics"/);
 const html=fs.readFileSync(require.resolve('../index.html'),'utf8');
 assert.match(html,/data-notebook="statistics" data-private-owner hidden/);assert.match(html,/src="statistics\.js\?v=/);
 assert.doesNotMatch(fs.readFileSync(require.resolve('../statistics.js'),'utf8'),/localStorage|sessionStorage|fetch\(|innerHTML/);
});
test('10,000 devices and 10,000 cases aggregate in one bounded pass per collection',()=>{
 const data={devices:Array.from({length:10000},(_,i)=>device(String(i),{type:'SPRZEDANY',saleDate:'2026-02-01'})),services:Array.from({length:10000},(_,i)=>service(String(i)))};
 const started=performance.now(),result=count(data);
 assert.equal(result.totals.soldAids,10000);assert.equal(result.totals.serviceIntake,10000);
 assert.ok(performance.now()-started<3000,'aggregation should not block for seconds');
});
