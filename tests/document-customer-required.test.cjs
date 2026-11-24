const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf8');

function extract(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, name);
  const rest = source.slice(start);
  return rest.slice(0, rest.slice(1).search(/\n(?:async )?function /) + 1);
}

test('document customer requires at least a first name and surname', () => {
  const context = vm.createContext({});
  vm.runInContext(extract('titleCaseName'), context);
  vm.runInContext(extract('isFullPersonName'), context);
  assert.equal(context.isFullPersonName('Jan Kowalski'), true);
  assert.equal(context.isFullPersonName('anna maria nowak-kowalska'), true);
  assert.equal(context.isFullPersonName('Jan'), false);
  assert.equal(context.isFullPersonName('Jan 123'), false);
  assert.equal(context.isFullPersonName(''), false);
});

test('all four document forms mark full customer name as required', () => {
  for (const id of ['offerCustomerInput', 'loanCustomerInput', 'orderCustomerInput', 'complaintCustomerInput']) {
    assert.match(html, new RegExp(`id="${id}"[^>]*required[^>]*aria-required="true"`));
  }
  assert.match(css, /\.person-name-field\.document-customer-invalid/);
  assert.match(css, /input\.document-customer-invalid/);
});

test('save and print paths cannot bypass customer validation', () => {
  assert.match(extract('validatePricingOfferForAction'), /requireDocumentCustomerName\(offerCustomerInput\)/);
  assert.match(extract('saveCurrentPricingOfferToHistory'), /validatePricingOfferForAction\(\)/);
  assert.match(extract('printPricingOffer'), /if \(!savedEntry\) return/);
  assert.match(extract('validatePricingLoanForAction'), /requireDocumentCustomerName\(loanCustomerInput\)/);
  assert.match(extract('saveCurrentPricingOrderToHistory'), /requireDocumentCustomerName\(orderCustomerInput\)/);
  assert.match(extract('printPricingOrder'), /requireDocumentCustomerName\(orderCustomerInput\)/);
  assert.match(extract('saveCurrentPricingComplaintToHistory'), /requireDocumentCustomerName\(complaintCustomerInput\)/);
});
