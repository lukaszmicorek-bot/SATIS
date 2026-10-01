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
const evaluation = app.slice(app.indexOf('function capdNumberValues('), app.indexOf('function ensureCapdNormEditors('));
const context = vm.createContext({ normalize: value => String(value || '').toLowerCase() });
vm.runInContext(`${values}\n${lookup}\n${evaluation}\nglobalThis.normFor = capdNormDefinition; globalThis.evaluate = capdResultEvaluation; globalThis.conclusion = capdAbnormalConclusionText;`, context);

test('APD uses only published Neuroflow norms for new results', () => {
  assert.equal(context.normFor('TRW', 6).value, '≤ 585,20');
  assert.equal(context.normFor('ASPN-S', 4).value, '≤ 4,66');
  assert.equal(context.normFor('GDT', 8).value, '≤ 10,00');
  assert.equal(context.normFor('ASPN-Z', 6), null);
  assert.equal(context.normFor('TRW', 13), null);
  assert.doesNotMatch(app, /CAPD_LEGACY_NORMATIVE_VALUES|capdNormVersionSelect|Stare normy/);
  assert.doesNotMatch(html, /capdNormVersionSelect|Stara – orientacyjna/);
});

test('APD proposes text only for results outside an entered norm', () => {
  const results = [
    { code: 'TRW', value: '730', norm: '≤ 721,85', unit: 'ms' },
    { code: 'TRS', value: '450', norm: '≤ 550', unit: 'ms' },
    { code: 'ASPN-S', value: '4', norm: '', unit: 'dB SNR' }
  ];
  const text = context.conclusion(5, '', results);
  assert.match(text, /TRW \(wynik 730 ms; norma ≤ 721,85 ms\)/);
  assert.doesNotMatch(text, /TRS \(wynik/);
  assert.doesNotMatch(text, /ASPN-S \(wynik/);
  assert.doesNotMatch(text, /cechy centralnych|ryzyko centralnych/);
  assert.equal(context.conclusion(5, '', results.slice(1)), '');
});

test('APD diagnostic wording remains an age-limited manual choice', () => {
  const results = [{ code: 'FPT', value: '20', norm: '≥ 40', unit: '%' }];
  assert.match(context.conclusion(5, 'risk', results), /ryzyko centralnych/);
  assert.doesNotMatch(context.conclusion(5, 'features', results), /cechy centralnych/);
  assert.match(context.conclusion(8, 'features', results), /cechy centralnych/);
  assert.doesNotMatch(context.conclusion(8, 'risk', results), /ryzyko centralnych/);
  assert.match(html, /id="capdConclusionType"/);
  assert.match(html, /id="capdInsertConclusionBtn"/);
});

test('DDT names only the ear with an abnormal entered result', () => {
  const result = { code: 'DDT', value: 'L: 20', norm: 'P ≥ 60; L ≥ 35', unit: '%' };
  assert.equal(context.evaluate('DDT', result.value, result.norm), 'bad');
  const text = context.conclusion(8, '', [result]);
  assert.match(text, /ucha lewego/);
  assert.doesNotMatch(text, /obu uszu|ucha prawego/);
});

test('APD keeps examination location and examiner in the form, history, and report', () => {
  assert.match(html, /<select id="capdLocationInput" required>/);
  for (const code of ['T12', 'P50', 'P63']) {
    assert.match(html, new RegExp(`<option value="${code}"`));
  }
  assert.match(html, /id="capdExaminerInput"[^>]*required/);
  assert.match(html, /id="capdReportLocation"/);
  assert.match(html, /id="capdReportExaminer"/);
  assert.match(app, /location: documentLocationKey\(capdLocationInput\?\.value\)/);
  assert.match(app, /examiner: titleCaseName\(capdExaminerInput\?\.value \|\| ""\)/);
  assert.match(app, /location: documentLocationKey\(entry\.location\)/);
  assert.match(app, /examiner: titleCaseName\(entry\.examiner \|\| ""\)/);
  assert.match(app, /capdLocationInput\.value = historyEntry\.location \|\| ""/);
  assert.match(app, /if \(!snapshot\.location\)/);
  assert.match(app, /if \(!snapshot\.examiner\)/);
});

test('APD records only confirmed preliminary examinations', () => {
  for (const code of ['AUDIOMETRIA_TONALNA', 'TYMPANOMETRIA', 'UCL']) {
    assert.match(html, new RegExp(`data-capd-performed-exam="${code}"`));
  }
  assert.match(html, /id="capdReportPerformedExams"[^>]*hidden/);
  const labels = app.slice(app.indexOf('const CAPD_PERFORMED_EXAM_LABELS ='), app.indexOf('function capdSelectedPerformedExams('));
  const normalizer = app.slice(app.indexOf('function normalizeCapdHistoryEntry('), app.indexOf('function normalizeCapdHistory('));
  const history = vm.createContext({
    normalizeLoanHistoryText: value => String(value || ''),
    titleCaseName: value => String(value || ''),
    isoDateForSave: value => String(value || ''),
    documentLocationKey: value => String(value || ''),
    capdRichTextPlainText: value => String(value || ''),
    capdPlainTextToHtml: value => String(value || ''),
    sanitizeCapdRichText: value => String(value || ''),
    CAPD_HISTORY_STATUS_LABELS: {},
    makeId: () => 'test-id'
  });
  vm.runInContext(`${labels}\n${normalizer}\nglobalThis.normalizeEntry = normalizeCapdHistoryEntry;`, history);
  const base = { patient: 'Test', pesel: '12345678901', testDate: '2026-10-01' };
  assert.deepEqual(Array.from(history.normalizeEntry(base).performedExams), []);
  assert.deepEqual(
    Array.from(history.normalizeEntry({ ...base, performedExams: ['UCL', 'UCL', 'NIEZNANE', 'TYMPANOMETRIA'] }).performedExams),
    ['UCL', 'TYMPANOMETRIA']
  );
});
