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

const permissions=vm.createContext({hasSupabaseConfig:true,PRIVATE_PAYMENT_EMAIL:'satis@pracowniasluchu.pl',currentSupabaseUser:null});
vm.runInContext(extract('canManagePricingPcprList'),permissions);
for(const [email,allowed]of [['satis@pracowniasluchu.pl',true],['gabinet@pracowniasluchu.pl',true],[' GABINET@pracowniasluchu.pl ',true],['inny@example.test',false],['',false]]){
  permissions.currentSupabaseUser=email?{email}:null;assert.equal(permissions.canManagePricingPcprList(),allowed);
}
assert.match(render,/if \(canManagePricingPcprList\(\)\) \{[\s\S]*removeButton\.textContent = "Usuń"/);
assert.match(extract('deletePricingPcprItem'),/if \(!confirm\(/);
assert.match(extract('deletePricingPcprItem'),/await deleteSupabaseRecord\(SUPABASE_PCPR_LIST_TABLE, id\)/);
const policy=fs.readFileSync(path.join(__dirname,'../supabase-pcpr-gabinet-delete.sql'),'utf8');
assert.match(policy,/on public\.pcpr_list for delete/);assert.match(policy,/public\.is_satis_app_user\(\) is true/);
assert.match(policy,/lower\(auth\.jwt\(\) ->> 'email'\) = 'gabinet@pracowniasluchu.pl'/);
assert.doesNotMatch(policy,/delete from|drop table|disable row level security/i);
console.log('OK: PCPR deletion available only to SATIS/gabinet, confirmed by user and restricted to authorized accounts by SQL.');
