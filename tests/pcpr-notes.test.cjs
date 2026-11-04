const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
function extract(name) {
  const rest = source.slice(source.indexOf(`function ${name}(`));
  return rest.slice(0, rest.slice(1).search(/\n(?:async )?function /) + 1);
}
const text = value => String(value || '').trim();
const context = vm.createContext({
  normalizeLoanHistoryText: text, findPricingOfferRecord: () => null,
  parsePcprAddress: () => ({}), formatPcprPostalCode: text,
  normalizePcprCity: text, normalizePcprStreet: text,
  pcprCityForPostalCode: () => '', normalizeBooleanFlag: Boolean,
  normalizePricingPcprOffice: text, normalizePcprPlace: text,
  pcprPlaceForOffice: () => '', titleCaseName: text, formatPcprPhone: text,
  normalizePricingPcprEar: text, pcprAddressLabel: () => '', makeId: () => 'test-id'
});
vm.runInContext(extract('pcprStreetAddressParts'), context);
vm.runInContext(extract('normalizePricingPcprItem'), context);
const input = { customer: 'Jan Testowy', notes: '  Pierwsza linia\nDruga linia <script>  ' };
const record = context.normalizePricingPcprItem(input);
assert.equal(record.notes, 'Pierwsza linia\nDruga linia <script>');
assert.equal(context.normalizePricingPcprItem(JSON.parse(JSON.stringify(record))).notes, record.notes);
assert.equal(context.normalizePricingPcprItem({ customer: 'Jan Testowy' }).notes, '');
assert.equal(context.normalizePricingPcprItem({ ...record, notes: '' }).notes, '');
assert.match(extract('currentPricingPcprItemSnapshot'), /notes: pcprNotesInput\?\.value/);
assert.match(extract('editPricingPcprItem'), /pcprNotesInput\.value = entry\.notes \|\| ""/);
assert.match(extract('resetPricingPcprForm'), /pcprNotesInput\]\.forEach/);
const render = extract('createPricingPcprItem');
assert.match(render, /if \(entry\.notes\)/);
assert.match(render, /notes\.textContent = entry\.notes/);
assert.ok(render.indexOf('content.append(model)') < render.indexOf('content.append(notes)'));
assert.match(html, /<textarea id="pcprNotesInput" rows="2"><\/textarea>/);
console.log('OK: optional PCPR notes survive normalization and JSON storage, support edit/reset, and render as safe multiline text');
