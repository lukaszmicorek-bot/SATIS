const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf8');

function functionSource(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `Missing function ${name}`);
  const tail = source.slice(start + 1);
  const next = tail.search(/\n(?:async )?function /);
  return source.slice(start, next < 0 ? source.length : start + 1 + next);
}

test('loan equipment table keeps the agreement year only for selected devices', () => {
  assert.match(html, /<th>Rok<\/th>/);
  const render = functionSource('renderPricingLoan');
  assert.match(render, /devices\.filter\(hasLoanDeviceData\)/);
  assert.match(render, /equipmentCount > 1/);
  assert.match(render, /Aparaty słuchowe/);
  assert.match(functionSource('loanDeviceData'), /year: hasLoanDeviceData\(device\)/);
  assert.match(functionSource('renderPricingLoanEquipment'), /device\.year/);
  assert.match(css, /loan-equipment-table td:nth-child\(6\)[^{]*\{[^}]*text-align: right/s);
});

test('charger state is retained only for historical contracts, with new issues described in notes', () => {
  assert.match(html, /id="loanChargerStateInput" type="hidden"/);
  assert.doesNotMatch(html, /id="loanChargerStateInput"[^>]*value="sprawna"/);
  assert.match(html, /<p data-loan-charger-state hidden>/);
  assert.match(html, /id="loanIssueNotesInput"[^>]*placeholder="[^"]*Ładowarka:/);
  assert.match(functionSource('normalizeLoanChargerState'), /"wydano" \? "sprawna"/);
  assert.match(functionSource('currentPricingLoanSnapshot'), /loanChargerInput[\s\S]*loanChargerSerialInput[\s\S]*normalizeLoanChargerState/);
  assert.doesNotMatch(functionSource('ensurePricingLoanDefaults'), /setLoanInputValue\(loanChargerStateInput/);
  assert.match(functionSource('startNewPricingLoan'), /loanChargerStateInput\.value = ""/);
  assert.match(functionSource('renderPricingLoan'), /row\.hidden = !chargerState/);
});

test('loan address is normalized and validated before save or print', () => {
  assert.match(html, /data-address-input="loanAddressInput"/);
  assert.match(html, /id="loanAddressStreetInput"[^>]*placeholder="ul\. Nazwa"/);
  assert.match(html, /id="loanAddressHouseInput"[^>]*data-address-part="houseNumber"/);
  assert.match(html, /id="loanAddressFlatInput"[^>]*data-address-part="flatNumber"/);
  assert.match(functionSource('formatLoanAddress'), /formatLoanStreet/);
  assert.match(functionSource('updateLoanAddressValidity'), /Podaj kod pocztowy/);
  assert.match(functionSource('validatePricingLoanForAction'), /updateLoanAddressValidity/);
});

test('loan conditions use black text in preview and print', () => {
  assert.match(css, /\.loan-terms p\s*\{[^}]*color:\s*#111/s);
});
