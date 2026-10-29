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
    effectiveDeviceType:(record,type)=>type,normalizeDeviceName:value=>value
  });
  controls['#recordId']={value:''};
  for(const name of ['normalizeEzwmStatus','normalizeDeviceType','isDeviceCharger','deviceEzwmStatus',
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
  for(const name of ['createEzwmCell','filteredRecords','buildDataControlIssues','normalizeImportedRecordFields','exportCsv']) {
    assert.match(extract(name),/deviceEzwmStatus\(/,name);
  }
  assert.match(source,/deviceModelInput\.addEventListener\("input", syncDeviceEzwmForType\)/);
});
