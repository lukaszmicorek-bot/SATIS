const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {test} = require('node:test');
const source = fs.readFileSync(require.resolve('../app.js'), 'utf8');
function extract(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, name);
  const rest = source.slice(start);
  return rest.slice(0, rest.slice(1).search(/\n(?:async )?function /) + 1);
}
function setup() {
  const fields = ['manufacturer','deviceName','customerName','serialNumber','salesInvoice','location','type','ezwm','notes'];
  const controls = {'#ezwm':{value:'REALIZACJA'},'#deviceName':{value:'Charger Philips'}};
  const ctx = vm.createContext({
    document:{querySelector:id=>controls[id]}, typeSelect:{value:'NA STANIE'},
    recordForm:{},fields,DEVICE_DATE_FIELDS:[],normalizeFormDateFields(){},
    FormData:class {entries(){return Object.entries({deviceName:controls['#deviceName'].value,type:ctx.typeSelect.value});}},
    correctDeviceNameFromHistory:value=>value,titleCaseName:value=>value,normalizeSerialNumber:value=>value,
    normalizeSalesInvoice:value=>value,normalizeRepairLocation:value=>value,correctPolishNotes:value=>value,
    effectiveDeviceType:(record,type)=>type,normalizeDeviceName:value=>value,
    todayInputValue:()=> '2026-10-29', displayType:record=>record.type
  });
  controls['#recordId']={value:''};
  for(const name of ['normalizeEzwmStatus','normalizeDeviceType','isDeviceCharger','deviceEzwmStatus',
    'isoDateFromParts','isoDateForSave','deviceEzwmRealizationDelay','formatDaysLabel',
    'syncDeviceEzwmForType','normalizeDeviceRecordForUse','formRecord'])vm.runInContext(extract(name),ctx);
  return {ctx,controls};
}
test('chargers use no reimbursement for old and new records regardless of previous EZWM',()=>{
  const {ctx}=setup();
  for(const deviceName of ['Ładowarka','ŁADOWARKA Philips','ladowarka Phonak','Oticon CHARGER 1.0','SmartCharger']) {
    for(const ezwm of ['', 'POBRANE','REALIZACJA','BEZ ZLECENIA']) {
      const record={deviceName,ezwm,type:'SPRZEDANY'};
      assert.equal(ctx.deviceEzwmStatus(record),'BEZ REFUNDACJI');
      assert.equal(ctx.normalizeDeviceRecordForUse(record).ezwm,'BEZ REFUNDACJI');
    }
  }
  for(const deviceName of ['Audeo L90','HearLink 3050','Radiant 100']) {
    assert.equal(ctx.deviceEzwmStatus({deviceName,ezwm:'POBRANE'}),'POBRANE');
    assert.equal(ctx.deviceEzwmStatus({deviceName,ezwm:''}),'');
  }
});
test('return overrides no reimbursement, form locks charger choice and unlocks for a hearing aid',()=>{
  const {ctx,controls}=setup();
  ctx.syncDeviceEzwmForType();
  assert.equal(controls['#ezwm'].value,'BEZ REFUNDACJI');assert.equal(controls['#ezwm'].disabled,true);
  ctx.typeSelect.value='ZWROT';ctx.syncDeviceEzwmForType();
  assert.equal(controls['#ezwm'].value,'');assert.equal(controls['#ezwm'].disabled,true);
  assert.equal(ctx.deviceEzwmStatus({deviceName:'Charger',type:'ZWROT',ezwm:'REALIZACJA'}),'');
  ctx.typeSelect.value='NA STANIE';controls['#deviceName'].value='HearLink 3050';ctx.syncDeviceEzwmForType();
  assert.equal(controls['#ezwm'].disabled,false);assert.equal(controls['#ezwm'].title,'');
});
test('saving derives EZWM even when disabled control is absent from FormData',()=>{
  const {ctx}=setup();
  assert.equal(ctx.formRecord().ezwm,'BEZ REFUNDACJI');
  ctx.typeSelect.value='ZWROT';assert.equal(ctx.formRecord().ezwm,'');
});
test('list, filters, data checks, imports and export share the charger rule',()=>{
  for(const name of ['createEzwmCell','filteredRecords','normalizeImportedRecordFields','exportCsv']) {
    assert.match(extract(name),/deviceEzwmStatus\(/,name);
  }
  assert.match(source,/deviceModelInput\.addEventListener\("input", syncDeviceEzwmForType\)/);
  assert.match(extract('buildDataControlIssues'),/deviceEzwmRealizationDelay\(/);
});

test('missing realization becomes orange on day 2 and red on day 5, including picked-up EZWM',()=>{
  const {ctx}=setup();
  for(const ezwm of ['', 'POBRANE']) {
    const record={deviceName:'HearLink',type:'SPRZEDANY',pickupDate:'2026-10-24',salesInvoice:'FS 1/P/2026',ezwm};
    for(const [today,days,level] of [['2026-10-24',0,'pending'],['2026-10-25',1,'pending'],
      ['2026-10-26',2,'warning'],['2026-10-28',4,'warning'],['2026-10-29',5,'critical'],['2026-11-01',8,'critical']]) {
      const result=ctx.deviceEzwmRealizationDelay(record,today);
      assert.equal(result.days,days);assert.equal(result.level,level);
    }
    assert.equal(ctx.deviceEzwmRealizationDelay(record).level,'critical');
  }
});
test('realization delay excludes refunds, chargers, returns, incomplete or future sale and invalid dates',()=>{
  const {ctx}=setup();
  const record={deviceName:'Audeo',type:'SPRZEDANY',pickupDate:'2026-10-01',salesInvoice:'FS 1',ezwm:''};
  for(const patch of [{ezwm:'REALIZACJA'},{ezwm:'BEZ REFUNDACJI'},{deviceName:'Ładowarka'},
    {deviceName:'Charger'},{type:'ZWROT'},{salesInvoice:' '},{pickupDate:''},{pickupDate:'2026-11-01'},
    {pickupDate:'2026-02-30'},{pickupDate:'invalid'}])assert.equal(ctx.deviceEzwmRealizationDelay({...record,...patch}),null);
  assert.equal(ctx.deviceEzwmRealizationDelay({...record,pickupDate:'24.10.26'}).days,5);
  assert.equal(ctx.deviceEzwmRealizationDelay({...record,pickupDate:'2026-03-28'},'2026-03-30').days,2);
  assert.equal(ctx.deviceEzwmRealizationDelay({...record,pickupDate:'2026-10-24'},'2026-10-26').days,2);
});
test('EZWM icon uses neutral, orange and red stages and returns to green after realization',()=>{
  const {ctx}=setup();
  function element(){return {children:[],attributes:{},classList:{add(){}},setAttribute(key,value){this.attributes[key]=value;},append(...nodes){this.children.push(...nodes);}};}
  ctx.document.createElement=element;ctx.document.createElementNS=element;
  vm.runInContext(extract('createEzwmCell'),ctx);
  const base={type:'SPRZEDANY',deviceName:'Audeo',salesInvoice:'FS 1',ezwm:''};
  for(const [pickupDate,css] of [['2026-10-28','ezwm-pending'],['2026-10-27','ezwm-warning'],['2026-10-24','ezwm-alert']]) {
    const cell=ctx.createEzwmCell({...base,pickupDate});assert.ok(cell.className.includes(css));
    assert.match(cell.title,/od sprzedaży:/);
  }
  assert.ok(ctx.createEzwmCell({...base,pickupDate:'2026-10-01',ezwm:'REALIZACJA'}).className.includes('ezwm-picked'));
  assert.ok(ctx.createEzwmCell({...base,deviceName:'Charger'}).className.includes('ezwm-none'));
  assert.equal(ctx.createEzwmCell({...base,type:'ZWROT'}),'');
});
