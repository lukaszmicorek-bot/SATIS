const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('app.js', 'utf8');
function extract(name) {
  const rest = source.slice(source.indexOf(`function ${name}(`));
  return rest.slice(0, rest.slice(1).search(/\n(?:async )?function /) + 1);
}
const make = () => Object.fromEntries(['device', 'serial', 'manufacturer', 'value', 'purpose'].map(key => [key, { value: '', dataset: {} }]));
const fields = { right: make(), left: make() };
let dirty = 0;
const button = { setAttribute() {} };
const context = vm.createContext({
  loanDeviceInputs: side => fields[side], loanTransferSidesBtn: button,
  markAgreementDraftDirty: () => dirty++, renderPricingLoan() {}
});
for (const name of ['loanSideHasInput', 'updateLoanTransferButton', 'transferLoanSides']) vm.runInContext(extract(name), context);
context.updateLoanTransferButton();
assert.equal(button.disabled, true);
context.transferLoanSides();
assert.equal(dirty, 0);
fields.right.device.value = 'Model P'; fields.right.serial.value = 'P123';
fields.right.purpose.value = 'DO TESTOWANIA'; fields.right.value.value = '1 500';
fields.right.serial.dataset.loanMatchedSerial = 'P123';
context.updateLoanTransferButton(); assert.match(button.title, /z P do L/);
context.transferLoanSides();
assert.equal(fields.right.device.value, ''); assert.equal(fields.left.serial.value, 'P123');
assert.equal(fields.left.purpose.value, 'DO TESTOWANIA'); assert.equal(fields.left.value.value, '1 500');
assert.equal(fields.left.serial.dataset.loanMatchedSerial, 'P123');
context.updateLoanTransferButton(); assert.match(button.title, /z L do P/);
context.transferLoanSides(); assert.equal(fields.right.serial.value, 'P123'); assert.equal(fields.left.serial.value, '');
fields.left.device.value = 'Model L'; fields.left.serial.value = 'L123';
context.updateLoanTransferButton(); assert.match(button.title, /Zamień/);
context.transferLoanSides(); assert.equal(fields.right.serial.value, 'L123'); assert.equal(fields.left.serial.value, 'P123');
const html = fs.readFileSync('index.html', 'utf8');
assert.doesNotMatch(html, /Nr seryjny\s*\/\s*UDI/);
for (const side of ['right', 'left']) {
  assert.match(html, new RegExp(`data-loan-serial-field="${side}">\\s*<span>Nr seryjny</span>`));
}
assert.match(html, /<table class="loan-equipment-table">[\s\S]*?<th>Nr seryjny<\/th>/);
assert.ok(html.indexOf('id="loanTransferSidesBtn"') > html.indexOf('id="loanRightDeviceInput"'));
assert.ok(html.indexOf('id="loanTransferSidesBtn"') < html.indexOf('id="loanLeftDeviceInput"'));
for (const id of ['loanMoveRightToLeftBtn', 'loanMoveLeftToRightBtn', 'loanDuplicateRightBtn']) assert.ok(!html.includes(`id="${id}"`));
console.log('OK: single loan-side control moves either direction, swaps both sides and preserves serial/value/purpose metadata.');
let group = 'adult';
const offerRight = { value: 'Model P' };
const offerLeft = { value: '' };
Object.assign(context, {
  pricingOfferPatientGroup: () => group, offerDeviceInput1: offerRight,
  offerDeviceInput2: offerLeft, renderPricingOffer() {}
});
vm.runInContext(extract('transferOfferSides'), context);
context.transferOfferSides(); assert.equal(offerRight.value, ''); assert.equal(offerLeft.value, 'Model P');
context.transferOfferSides(); assert.equal(offerRight.value, 'Model P'); assert.equal(offerLeft.value, '');
offerLeft.value = 'Model L';
context.transferOfferSides(); assert.equal(offerRight.value, 'Model L'); assert.equal(offerLeft.value, 'Model P');
group = '';
context.transferOfferSides(); assert.equal(offerRight.value, 'Model L', 'patient group required');
for (const id of ['offerMoveRightToLeftBtn', 'offerMoveLeftToRightBtn', 'offerDuplicateFirstBtn']) assert.ok(!html.includes(`id="${id}"`));
assert.ok(html.indexOf('id="offerTransferSidesBtn"') > html.indexOf('id="offerDeviceInput1"'));
assert.ok(html.indexOf('id="offerTransferSidesBtn"') < html.indexOf('id="offerDeviceInput2"'));
console.log('OK: offer uses same three-way transfer with patient-group guard and no old buttons.');
