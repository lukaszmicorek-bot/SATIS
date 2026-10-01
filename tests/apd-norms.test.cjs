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
  assert.match(html, /id="capdExaminerInput"[^>]*list="capdExaminerSuggestions"/);
  assert.match(html, /id="capdExaminerSuggestions"/);
  assert.ok(html.indexOf('id="capdPractitionerProfileSelect"') < html.indexOf('class="capd-performed-exams private-form-wide"'));
  assert.match(html, /<fieldset class="capd-performed-exams private-form-wide">[\s\S]*?<\/fieldset>\s*<section class="capd-rich-text-field private-form-wide"/);
  assert.match(html, /id="capdExaminerBadgeName">Nie wybrano/);
  assert.match(app, /capdExaminerBadgeName\.textContent = titleCaseName\(capdExaminerInput\?\.value \|\| ""\)/);
  assert.doesNotMatch(html, /id="capdReportLocation"|id="capdReportExaminer"/);
  assert.match(html, /id="capdReportPractitionerName"/);
  assert.match(html, /id="capdReportPractitionerAddress"/);
  assert.match(app, /location: documentLocationKey\(capdLocationInput\?\.value\)/);
  assert.match(app, /examiner: titleCaseName\(capdExaminerInput\?\.value \|\| ""\)/);
  assert.match(app, /location: documentLocationKey\(entry\.location\)/);
  assert.match(app, /examiner: titleCaseName\(entry\.examiner \|\| ""\)/);
  assert.match(app, /capdLocationInput\.value = historyEntry\.location \|\| ""/);
  assert.match(app, /if \(!snapshot\.location\)/);
  assert.match(app, /if \(!snapshot\.examiner\)/);
});

test('APD records only confirmed preliminary examinations', () => {
  for (const code of ['OTOSKOPIA', 'AUDIOMETRIA_TONALNA', 'TYMPANOMETRIA', 'UCL']) {
    assert.match(html, new RegExp(`data-capd-performed-exam="${code}"`));
    assert.match(html, new RegExp(`data-capd-performed-exam-note="${code}"`));
  }
  assert.match(html, /id="capdReportPerformedExams"[^>]*hidden/);
  const labels = app.slice(app.indexOf('const CAPD_PERFORMED_EXAM_LABELS ='), app.indexOf('const SUPABASE_APP_ACCESS_TABLE'));
  const practitioner = app.slice(app.indexOf('function normalizeCapdPractitioner('), app.indexOf('function currentCapdPractitioner('));
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
  vm.runInContext(`${labels}\n${practitioner}\n${normalizer}\nglobalThis.normalizeEntry = normalizeCapdHistoryEntry;`, history);
  const base = { patient: 'Test', pesel: '12345678901', testDate: '2026-10-01' };
  assert.deepEqual(Array.from(history.normalizeEntry(base).performedExams), []);
  assert.deepEqual(Object.keys(history.normalizeEntry(base).performedExamNotes), []);
  assert.deepEqual(
    Array.from(history.normalizeEntry({ ...base, performedExams: ['OTOSKOPIA', 'UCL', 'UCL', 'NIEZNANE', 'TYMPANOMETRIA'] }).performedExams),
    ['OTOSKOPIA', 'UCL', 'TYMPANOMETRIA']
  );
  const saved = history.normalizeEntry({
    ...base,
    performedExams: ['AUDIOMETRIA_TONALNA'],
    performedExamNotes: { AUDIOMETRIA_TONALNA: '  Wynik po weryfikacji  ', TYMPANOMETRIA: 'Niepotwierdzone' }
  });
  assert.equal(saved.performedExamNotes.AUDIOMETRIA_TONALNA, 'Wynik po weryfikacji');
  assert.equal(saved.performedExamNotes.TYMPANOMETRIA, undefined);
  assert.deepEqual(Object.keys(history.normalizeEntry({ ...base, performedExams: ['AUDIOMETRIA_TONALNA'] }).performedExamNotes), []);
  assert.match(app, /Wstaw opis wyniku w normie|Próg słyszenia w normie/);
});

test('APD keeps practitioner details in history and at the end of the report', () => {
  for (const id of ['capdPractitionerProfileSelect', 'capdPractitionerLicenseInput',
    'capdPractitionerFacilityInput', 'capdPractitionerCitySelect', 'capdReportPractitioner']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  const report = html.slice(html.indexOf('id="capdReport"'), html.indexOf('id="capdHistoryList"'));
  assert.ok(report.indexOf('id="capdReportPractitioner"') > report.indexOf('id="capdReportDescription"'));
  assert.match(app, /practitioner: currentCapdPractitioner\(\)/);
  assert.match(app, /practitioner: normalizeCapdPractitioner\(entry\.practitioner, entry\.examiner\)/);
  assert.match(app, /async function saveCurrentCapdToHistory\(\) \{\s*linkCapdExaminerToProfile\(\)/);
  const practitioner = app.slice(app.indexOf('function normalizeCapdPractitioner('), app.indexOf('function currentCapdPractitioner('));
  const normalized = vm.createContext({
    titleCaseName: value => String(value || ''),
    normalizeLoanHistoryText: value => String(value || '').trim()
  });
  vm.runInContext(`${practitioner}\nglobalThis.normalizePractitioner = normalizeCapdPractitioner;`, normalized);
  const legacy = normalized.normalizePractitioner(undefined, 'Anna Testowa');
  assert.equal(legacy.name, 'Anna Testowa');
  assert.equal(legacy.licenseCode, '');
  const saved = normalized.normalizePractitioner({ name: 'Anna Testowa', licenseCode: ' ab12 ', facility: ' SATIS ', address: ' ul. Testowa 1 ' });
  assert.equal(saved.licenseCode, 'AB12');
  assert.equal(saved.facility, 'SATIS');
  assert.equal(saved.address, 'ul. Testowa 1');
  assert.deepEqual(Array.from(saved.addresses), ['ul. Testowa 1']);
  const several = normalized.normalizePractitioner({
    name: 'Anna Testowa', addresses: ['ul. Pierwsza 1', 'ul. Druga 2', 'ul. Pierwsza 1'], address: 'ul. Druga 2'
  });
  assert.deepEqual(Array.from(several.addresses), ['ul. Pierwsza 1', 'ul. Druga 2']);
  assert.equal(several.address, 'ul. Druga 2');
  normalized.normalize = value => String(value || '').toLowerCase();
  normalized.capdHistory = [
    { savedAt: '2026-09-01', examiner: 'Anna Testowa', practitioner: { name: 'Anna Testowa', licenseCode: 'AB12', facility: 'Stara placówka' } },
    { savedAt: '2026-10-01', examiner: 'Anna Testowa', practitioner: { name: 'Anna Testowa', licenseCode: 'AB12', facility: 'SATIS' } },
    { savedAt: '2026-10-01', examiner: 'Ewa Testowa', practitioner: { name: 'Ewa Testowa', licenseCode: 'CD34', facility: 'Gabinet' } },
    { savedAt: '2026-10-01', examiner: 'Iwona Testowa' }
  ];
  normalized.capdSavedPractitionerProfiles = [];
  const profiles = app.slice(app.indexOf('function capdPractitionerProfileKey('), app.indexOf('let capdPractitionerOptionsSignature ='));
  vm.runInContext(`${profiles}\nglobalThis.profiles = capdPractitionerProfiles;`, normalized);
  const available = normalized.profiles();
  assert.equal(available.length, 3);
  assert.equal(available.find(([, profile]) => profile.name === 'Anna Testowa')[1].facility, 'SATIS');
  assert.ok(available.some(([, profile]) => profile.name === 'Iwona Testowa'));
});

test('APD saves practitioner profiles separately from examination history', () => {
  assert.match(html, /id="saveCapdPractitionerProfileBtn"[^>]*>Zapisz profil/);
  assert.match(html, /id="capdPractitionerProfileStatus"[^>]*role="status"/);
  assert.match(html, /id="capdPractitionerCitySelect"/);
  assert.doesNotMatch(html, /id="addCapdPractitionerAddressBtn"|id="removeCapdPractitionerAddressBtn"/);
  assert.match(app, /await upsertSupabaseRecord\(SUPABASE_CAPD_HISTORY_TABLE, entry\)/);
  assert.match(app, /entries\.filter\(\(entry\) => !entry\.id\.startsWith\(CAPD_PROFILE_ID_PREFIX\)\)/);

  const normalizeProfile = app.slice(app.indexOf('function normalizeCapdPractitioner('), app.indexOf('function currentCapdPractitioner('));
  const savedProfiles = app.slice(app.indexOf('function normalizeCapdSavedPractitionerProfiles('), app.indexOf('function capdPractitionerProfiles('));
  const scope = vm.createContext({
    titleCaseName: value => String(value || '').trim(),
    normalizeLoanHistoryText: value => String(value || '').trim(),
    CAPD_PROFILE_ID_PREFIX: 'apd-profile-'
  });
  vm.runInContext(`${normalizeProfile}\n${savedProfiles}\nglobalThis.normalizeProfiles = normalizeCapdSavedPractitionerProfiles;`, scope);
  const result = scope.normalizeProfiles([
    { id: 'apd-profile-1', recordType: 'practitioner_profile', profile: { name: 'Anna Testowa', licenseCode: ' ab12 ', facility: 'SATIS' } },
    { id: 'study-1', patient: 'Pacjent', pesel: '12345678901' }
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].profile.licenseCode, 'AB12');
});

test('APD profile save creates one shared record and updates that record on edit', async () => {
  const saved = [];
  const status = { textContent: '' };
  const button = { disabled: false };
  const selection = { value: '' };
  const scope = vm.createContext({
    currentCapdPractitioner: () => ({ name: 'Anna Testowa', licenseCode: 'AB12', facility: 'SATIS', addresses: ['ul. Testowa 1', 'ul. Druga 2'], address: 'ul. Druga 2' }),
    capdPractitionerProfileKey: profile => `${profile.name}|${profile.licenseCode}`,
    capdSavedPractitionerProfiles: [],
    activeCapdPractitionerProfileId: '',
    hasSupabaseConfig: true,
    currentSupabaseUser: { id: 'user-1' },
    capdPractitionerProfileStatus: status,
    saveCapdPractitionerProfileBtn: button,
    capdPractitionerProfileSelect: selection,
    capdPractitionerOptionsSignature: '',
    CAPD_PROFILE_ID_PREFIX: 'apd-profile-',
    makeId: () => 'new-id',
    upsertSupabaseRecord: async (table, entry) => saved.push({ table, entry }),
    SUPABASE_CAPD_HISTORY_TABLE: 'capd_history',
    normalizeCapdSavedPractitionerProfiles: entries => entries,
    renderCapdPractitionerProfiles() {}
  });
  const save = app.slice(app.indexOf('async function saveCapdPractitionerProfile('), app.indexOf('function linkCapdExaminerToProfile('));
  vm.runInContext(`${save}\nglobalThis.saveProfile = saveCapdPractitionerProfile;`, scope);
  await scope.saveProfile();
  await scope.saveProfile();
  assert.equal(saved.length, 2);
  assert.equal(saved[0].table, 'capd_history');
  assert.equal(saved[0].entry.id, 'apd-profile-new-id');
  assert.equal(saved[0].entry.profile.address, 'ul. Druga 2');
  assert.equal(saved[1].entry.id, saved[0].entry.id);
  assert.equal(scope.capdSavedPractitionerProfiles.length, 1);
  assert.equal(status.textContent, 'Profil zapisany dla wszystkich stanowisk.');
  assert.equal(button.disabled, false);
});

test('APD city choice uses the existing clinic location and recognizes older addresses', () => {
  const source = app.slice(app.indexOf('function capdCityForLocation('), app.indexOf('function setCapdPractitionerCity('));
  const scope = vm.createContext({
    normalize: value => String(value || '').toLocaleLowerCase('pl-PL'),
    DOCUMENT_LOCATIONS: [
      { key: 'T12', value: 'Bielsko-Biała, ul. Traugutta 12' },
      { key: 'P63', value: 'Bielsko-Biała, ul. Partyzantów 63' },
      { key: 'P50', value: 'Żywiec, al. Piłsudskiego 50' }
    ]
  });
  vm.runInContext(`${source}\nglobalThis.city = capdCityForAddress; globalThis.address = capdAddressForCity;`, scope);
  assert.equal(scope.city('Żywiec, al. Piłsudskiego 50'), 'Żywiec');
  assert.equal(scope.city('Bielsko-Biała, ul. Partyzantów 63'), 'Bielsko-Biała');
  assert.equal(scope.address('Żywiec', 'P63'), 'Żywiec, al. Piłsudskiego 50');
  assert.equal(scope.address('Bielsko-Biała', 'T12'), 'Bielsko-Biała, ul. Traugutta 12');
  assert.equal(scope.address('Bielsko-Biała', 'P50'), 'Bielsko-Biała, ul. Partyzantów 63');
});
