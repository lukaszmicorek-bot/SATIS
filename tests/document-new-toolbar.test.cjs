const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('app.js', 'utf8');
const start = source.indexOf('function setupFormUndo()');
const end = source.indexOf('\nfunction updateSavedUndoButton()', start);
function element(id = '') {
  return {
    id, children: [], classList: { add() {} },
    addEventListener() {}, closest() { return null; },
    append(node) {
      if (node.parent) node.parent.children = node.parent.children.filter(child => child !== node);
      node.parent = this; this.children.push(node);
    },
    prepend(node) { node.parent = this; this.children.unshift(node); }
  };
}
const ids = ['newPricingOfferBtn', 'newPricingLoanBtn', 'newPricingOrderBtn', 'newPricingComplaintBtn', 'resetRodoBtn'];
const scopes = ids.map(id => {
  const scope = element();
  const bottom = element();
  const button = element(id);
  bottom.append(button); scope.append(bottom);
  const copyOffer = id === 'newPricingLoanBtn' ? element('loanCopyOfferBtn')
    : id === 'newPricingOrderBtn' ? element('orderCopyOfferBtn') : null;
  if (copyOffer) bottom.append(copyOffer);
  scope.querySelector = selector => selector.includes(`#${id}`) ? button
    : copyOffer && selector.includes(`#${copyOffer.id}`) ? copyOffer : null;
  return { scope, bottom, button, copyOffer };
});
const context = vm.createContext({
  document: { querySelectorAll: () => scopes.map(item => item.scope), createElement: () => element() },
  updateSavedUndoButton() {}, clearFormUndo() {}
});
vm.runInContext(source.slice(start, end), context);
context.setupFormUndo();
for (const { scope, bottom, button, copyOffer } of scopes) {
  assert.equal(scope.children[0].className, 'form-undo-tools');
  assert.equal(scope.children[0].children[0], button, 'existing button moved before undo');
  if (copyOffer) assert.equal(scope.children[0].children[1], copyOffer, 'copy from offer sits immediately after New');
  assert.equal(scope.children[0].children[copyOffer ? 2 : 1].textContent, 'Cofnij wpisywanie');
  assert.equal(bottom.children.length, 0, 'no duplicate button at bottom');
}
assert.equal(scopes.at(-1).button.textContent, 'Nowy');
console.log('OK: new-document buttons moved above forms before undo, existing controls reused without duplicates.');
