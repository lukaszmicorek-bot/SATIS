const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const values = app.slice(app.indexOf('const CAPD_NORMATIVE_VALUES ='), app.indexOf('const CAPD_NORM_CODES ='));
const lookup = app.slice(app.indexOf('function capdNormSourceAge('), app.indexOf('function capdNumberValues('));
const context = vm.createContext({});
vm.runInContext(`${values}\n${lookup}\nglobalThis.normFor = capdNormDefinition;`, context);

test('APD uses only published Neuroflow norms for new results', () => {
  assert.equal(context.normFor('TRW', 6).value, '≤ 585,20');
  assert.equal(context.normFor('ASPN-S', 4).value, '≤ 4,66');
  assert.equal(context.normFor('GDT', 8).value, '≤ 10,00');
  assert.equal(context.normFor('ASPN-Z', 6), null);
  assert.equal(context.normFor('TRW', 13), null);
  assert.doesNotMatch(app, /CAPD_LEGACY_NORMATIVE_VALUES|capdNormVersionSelect|Stare normy/);
  assert.doesNotMatch(html, /capdNormVersionSelect|Stara – orientacyjna/);
});
