const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('app.js', 'utf8');
function extract(name) {
  const start = source.search(new RegExp(`^(?:async )?function ${name}\\(`, 'm'));
  assert.ok(start >= 0, name);
  const rest = source.slice(start), next = rest.slice(1).search(/\n(?:async )?function /);
  return next < 0 ? rest : rest.slice(0, next + 1);
}
function fixture() {
  const events = [], hints = [], remembered = [];
  const input = {id: 'serial', value: '', placeholder: '', isConnected: true, focus() {},
    dispatchEvent(event) {events.push(event.type);}};
  const c = vm.createContext({
    input, events, sensitiveStateGeneration: 1, lastCopiedSerialNumber: 'OLD123',
    navigator: {clipboard: {readText: async () => 'new456', writeText: async () => {}}},
    document: {getElementById: id => id === input.id ? input : null}, Event: class {constructor(type) {this.type = type;}},
    normalizeSerialNumber: text => String(text || '').trim().toUpperCase(), normalizeLoanHistoryText: text => String(text || '').trim(),
    setTimeout() {}, copyTextWithFallback: () => false,
    rememberCopiedSerialNumber: value => {c.lastCopiedSerialNumber = value;remembered.push(value);},
    showSerialCopied: () => hints.push('copied'), showSerialCopyToast: text => hints.push(text)
  });
  for (const name of ['readClipboardInputText','pasteClipboardToInput','copySerialNumber','pasteCopiedSerialToLoanDevice']) vm.runInContext(extract(name), c);
  return {c,input,events,hints,remembered};
}

test('serial paste prefers the current system clipboard and emits normal editing events', async () => {
  const {c,input,events} = fixture();
  assert.equal(await c.pasteClipboardToInput('serial','serial'), true);
  assert.equal(input.value, 'NEW456');assert.deepEqual(events, ['input','change']);
});

test('an empty readable clipboard never resurrects an older copied number', async () => {
  const {c,input,events} = fixture();c.navigator.clipboard.readText = async () => '';
  assert.equal(await c.pasteClipboardToInput('serial','serial'), false);
  assert.equal(input.value, '');assert.equal(events.length, 0);
});

test('blocked or unavailable clipboard can use a number successfully copied inside SATIS', async () => {
  const {c,input} = fixture();c.navigator.clipboard.readText = async () => {throw Error('denied');};
  assert.equal(await c.pasteClipboardToInput('serial','serial'), true);assert.equal(input.value,'OLD123');
  input.value = '';c.navigator.clipboard = undefined;
  assert.equal(await c.pasteClipboardToInput('serial','serial'),true);assert.equal(input.value,'OLD123');
});

test('late clipboard response cannot overwrite typing, a readonly field or a logged-out session', async () => {
  for (const change of [c=>{c.input.value='TYPED';},c=>{c.input.readOnly=true;},c=>{c.input.disabled=true;},c=>{c.sensitiveStateGeneration++;},c=>{c.input.isConnected=false;}]) {
    const {c,input,events} = fixture();let release;
    c.navigator.clipboard.readText = () => new Promise(resolve=>{release=resolve;});
    const pending = c.pasteClipboardToInput('serial','serial');change(c);release('new456');
    assert.equal(await pending,false);assert.equal(events.length,0);assert.notEqual(input.value,'NEW456');
  }
});

test('multiple order serials retain their separators and are normalized independently', async () => {
  const {c,input} = fixture();c.navigator.clipboard.readText = async () => 'abc1; def2\nghi3';
  await c.pasteClipboardToInput('serial','serials');assert.equal(input.value,'ABC1, DEF2, GHI3');
  input.value='';assert.equal(await c.pasteClipboardToInput('serial','serial'),false);assert.equal(input.value,'');
});

test('loan paste uses the same event pipeline so save tracking, autofill and offline drafts are notified', async () => {
  const {c,input,events} = fixture();
  c.loanDeviceInputs = () => ({serial:input});c.loanInputValue = field => field.value;
  c.updateLoanSerialPasteHints = () => {};c.renderPricingLoan = () => {};
  await c.pasteCopiedSerialToLoanDevice('right');
  assert.equal(input.value,'NEW456');assert.deepEqual(events,['input','change']);
  input.value='KEEP';events.length=0;
  await c.pasteCopiedSerialToLoanDevice('right');assert.equal(input.value,'KEEP');assert.equal(events.length,0);
});

test('copy retries the fallback when async clipboard is denied and reports only confirmed success', async () => {
  const {c,hints} = fixture();const button={title:''};
  c.navigator.clipboard.writeText = async () => {throw Error('denied');};c.copyTextWithFallback = () => true;
  assert.equal(await c.copySerialNumber('ABC123',button,'Copy'),true);
  assert.equal(c.lastCopiedSerialNumber,'ABC123');assert.deepEqual(hints,['copied']);
  c.copyTextWithFallback = () => false;hints.length=0;
  assert.equal(await c.copySerialNumber('OTHER',button,'Copy'),false);
  assert.equal(c.lastCopiedSerialNumber,'');assert.equal(hints.includes('copied'),false);
  assert.equal(button.title,'Nie udało się skopiować numeru');
});

test('a rejected legacy copy and a session change never display a copied confirmation', async () => {
  const {c,hints} = fixture();c.navigator.clipboard = undefined;
  assert.equal(await c.copySerialNumber('ABC123',{},''),false);assert.equal(hints.includes('copied'),false);
  c.navigator.clipboard = {writeText:async()=>{c.sensitiveStateGeneration++;}};hints.length=0;
  assert.equal(await c.copySerialNumber('ABC123',{},''),false);assert.equal(hints.length,0);
});

test('fallback copies inside the open dialog, returns the browser result and restores focus/selection', () => {
  const {c} = fixture();let appended,removed=false,focused=false,selected;
  const active={selectionStart:2,selectionEnd:4,selectionDirection:'forward',focus(){focused=true;},setSelectionRange(...args){selected=args;}};
  const dialog={append(input){appended=input;}};
  c.document = {activeElement:active,querySelector:()=>dialog,body:{append(){assert.fail('dialog copy must stay in its focus scope');}},
    createElement:()=>({style:{},setAttribute(){},select(){},remove(){removed=true;}}),execCommand:()=>false};
  vm.runInContext(extract('copyTextWithFallback'),c);
  assert.equal(c.copyTextWithFallback('ABC123'),false);assert.equal(appended.value,'ABC123');
  assert.equal(removed,true);assert.equal(focused,true);assert.deepEqual(selected,[2,4,'forward']);
});

test('serial tools are installed for all serial-bearing editors and dynamic order items', () => {
  for(const id of ['serialNumber','demoSerialNumber','repairSerialNumber','repairSerialNumber2','loanRightSerialInput',
    'loanLeftSerialInput','loanChargerSerialInput','complaintSerialInput','complaintSerialInput2','complaintSerialInput3','receiptSerialP','receiptSerialL']) {
    assert.ok(source.includes(`"${id}"`),id);
  }
  assert.match(extract('renderRepairOrderItems'), /setupSerialInputTools\(serial, \{ multiple: true \}\)/);
  assert.match(extract('setupSerialInputTools'), /serialToolsBound/);
  assert.match(extract('setupSerialInputTools'), /input\.readOnly/);
});

test('accessory serials use specific names from stock or history without guessing between conflicting matches', () => {
  const record = (source, deviceName, id) => ({source, deviceName, id});
  const c = vm.createContext({
    serialIndex: new Map([
      ['CH111', [record('devices', 'SmartCharger MiniRITE')]],
      ['CR111', [record('demo', 'Nadajnik CROS II')]],
      ['CH222', [record('devices', 'Ładowarka')]],
      ['CH333', [record('devices', 'Charger Plus'), record('demo', 'Charger Go')]],
      ['CH444', [record('devices', 'Audéo I70')]],
      ['CH555', [record('repairs', 'Zamówienie', 'order')]],
      ['CH666', [record('repairs', 'Charger RIC / aparat', 'group')]]
    ]),
    pricingLoanHistory: [
      {chargerSerial:'CH222',charger:'Charger Go',customer:'Nie przenoś',phone:'123456789'},
      {chargerSerial:'CH444',charger:'Charger Go'},
      {leftDevice:{serial:'CR222',model:'Nadajnik Envision'}},
      {chargerSerial:'CH777',charger:'Charger Case'},
      {chargerSerial:'CH777',charger:'Charger Go'}
    ],
    pricingComplaintHistory: [{items:[{serial:'CH888',productName:'Ładowarka Premium',productType:'ŁADOWARKA'}]}],
    repairRecords: [
      {id:'order',orderItems:[{type:'ŁADOWARKA',description:'MiniRITE Plus',serialNumbers:['CH555']}]},
      {id:'group',serialNumber:'CH666',serialNumber2:'CR666',deviceName:'Charger RIC / Nadajnik CROS'}
    ]
  });
  for (const name of ['normalize','normalizeSerialNumber','serialDuplicateKey','repairSerialNumbers','normalizeDeviceName',
    'repairDeviceNameNeedsBackfill','isDeviceCharger','serialAccessoryKind','findSerialAccessoryModel']) vm.runInContext(extract(name), c);
  assert.equal(c.findSerialAccessoryModel(' ch-111 ').model,'SmartCharger MiniRITE');
  assert.equal(c.findSerialAccessoryModel('cr111').kind,'cros');
  assert.deepEqual({...c.findSerialAccessoryModel('CH222')},{model:'Charger Go',kind:'charger',source:'historii umów'});
  assert.equal(c.findSerialAccessoryModel('CR222').model,'Nadajnik Envision');
  assert.equal(c.findSerialAccessoryModel('CH555').model,'MiniRITE Plus');
  assert.equal(c.findSerialAccessoryModel('CH888').model,'Ładowarka Premium');
  assert.equal(c.findSerialAccessoryModel('CH555',{excludeRepairId:'order'}),null);
  for (const serial of ['CH333','CH444','CH666','CH777','unknown','brak numeru']) assert.equal(c.findSerialAccessoryModel(serial),null,serial);
});
