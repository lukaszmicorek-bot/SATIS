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
const titleContext = vm.createContext({});
vm.runInContext(app.slice(app.indexOf('function capdPractitionerTitle('), app.indexOf('function renderCapdReport(')), titleContext);
test('APD footer assigns the combined profession only to Justyna', () => {
  assert.equal(titleContext.capdPractitionerTitle('Justyna Waliczek'), 'Protetyk słuchu/logopeda:');
  assert.equal(titleContext.capdPractitionerTitle(' JUSTYNA Waliczek '), 'Protetyk słuchu/logopeda:');
  assert.equal(titleContext.capdPractitionerTitle('Dorota Mikosz-Micorek'), 'Protetyk słuchu:');
  assert.equal(titleContext.capdPractitionerTitle(''), 'Protetyk słuchu:');
});
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

test('new APD descriptions select impaired functions and recommendations from the supplied document', () => {
  const results = [{code: 'ASPN-S', value: '8', norm: '≤ 4', unit: 'dB SNR'}];
  const text = context.capdSuggestedConclusionText(8, '', results);
  assert.match(text, /rozumienia słów w hałasie/);
  assert.match(text, /Zalecenia/);
  assert.match(text, /502 605 663/);
  assert.doesNotMatch(text, /tu można wymienić|Muzyczny Trening Ruchowy/);
  assert.match(context.capdSuggestedConclusionText(8, '', results, true), /Muzyczny Trening Ruchowy/);
});

test('normal APD wording requires all supplied results to be evaluated and within norms', () => {
  const good = [{code: 'TRS', value: '450', norm: '≤ 550', unit: 'ms'}];
  assert.match(context.capdSuggestedConclusionText(8, '', good), /Uzyskane wyniki mieszczą się w normach wiekowych/);
  assert.match(context.capdSuggestedConclusionText(8, '', good, true), /Muzyczny Trening Ruchowy/);
  assert.equal(context.capdSuggestedConclusionText(null, '', good), '');
  assert.equal(context.capdNormalConclusionText([]), '');
  assert.equal(context.capdNormalConclusionText([...good, {code: 'FPT', value: '', norm: '≥ 50'}]), '');
  assert.equal(context.capdNormalConclusionText([...good, {code: 'FPT', value: '60', norm: ''}]), '');
  assert.equal(context.capdNormalConclusionText([{code: 'DDT', value: 'P: 80', norm: 'P ≥ 60; L ≥ 35'}]), '');
  assert.match(html, /capd-report-interpretation/);
  assert.ok(html.indexOf('capd-report-interpretation') < html.indexOf('<h3>Opis badania i wnioski</h3>'));
});

test('DDT names only the ear with an abnormal entered result', () => {
  const result = { code: 'DDT', value: 'L: 20', norm: 'P ≥ 60; L ≥ 35', unit: '%' };
  assert.equal(context.evaluate('DDT', result.value, result.norm), 'bad');
  const text = context.conclusion(8, '', [result]);
  assert.match(text, /ucha lewego/);
  assert.doesNotMatch(text, /obu uszu|ucha prawego/);
});

test('APD keeps examination location and examiner in the form, history, and report', () => {
  assert.match(html, /<input id="capdLocationInput" type="hidden" value="P63">/);
  assert.doesNotMatch(html, /class="capd-location-field|<span>Miejsce<\/span>\s*<select id="capdLocationInput"/);
  assert.match(html, /<input id="capdExaminerInput" type="hidden">/);
  assert.doesNotMatch(html, /id="capdExaminerSelect"|Osoba wykonująca badanie \*/);
  assert.doesNotMatch(html, /id="capdPractitionerProfileSelect"|Wybierz z zapisanych profili/);
  assert.ok(html.indexOf('class="capd-practitioner-shortcuts"') > html.indexOf('aria-label="Opis badania i wnioski"'));
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
  assert.match(app, /capdLocationInput\.value = historyEntry\.location \|\| "P63"/);
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

test('APD phone notification applies only to the current ready-for-pickup stage', async () => {
  const source = app.slice(app.indexOf('function capdPhoneNotifiedForPickup('), app.indexOf('function maskSensitiveIdentifier('));
  const saved = [];
  const scope = vm.createContext({
    capdHistory: [{ id: 'study-1', status: 'DO_ODBIORU', statusUpdatedAt: '2026-10-01T10:00:00.000Z' }],
    currentSupabaseUser: { email: 'satis@pracowniasluchu.pl' },
    currentWorkstationName: () => 'P63',
    normalizeCapdHistoryEntry: entry => entry,
    persistCapdHistoryEntry: async entry => { saved.push(entry); },
    normalizeCapdHistory: entries => entries,
    saveLocalCapdHistory() {}, renderCapdHistory() {}, alert() {}
  });
  vm.runInContext(`${source}\nglobalThis.notified = capdPhoneNotifiedForPickup; globalThis.changeNotification = changeCapdPhoneNotified;`, scope);
  assert.equal(scope.notified(scope.capdHistory[0]), false);
  await scope.changeNotification('study-1', true, { disabled: false, checked: true });
  assert.equal(saved.length, 1);
  assert.equal(saved[0].phoneNotifiedBy, 'satis@pracowniasluchu.pl');
  assert.equal(scope.notified(saved[0]), true);
  assert.equal(scope.notified({ ...saved[0], status: 'ODEBRANO' }), false);
  assert.equal(scope.notified({ ...saved[0], statusUpdatedAt: '2099-01-01T00:00:00.000Z' }), false);
  assert.match(app, /phoneNotifiedAt: existing\?\.phoneNotifiedAt \|\| ""/);
  assert.match(app, /if \(entry\.status === "DO_ODBIORU"\) \{\s*const notifiedControl/);
  assert.match(app, /if \(notifiedInput\.checked\) \{\s*const notifiedDate = document\.createElement\("time"\)/);
  assert.match(app, /notifiedDate\.textContent = formatAuditDateTime\(entry\.phoneNotifiedAt\)/);
  assert.match(app, /actions\.append\(notifiedControl\)/);
  assert.doesNotMatch(app, /main\.append\(notifiedLabel\)/);
});

test('APD keeps practitioner details in history and at the end of the report', () => {
  for (const id of ['capdPractitionerLicenseInput',
    'capdPractitionerFacilityInput', 'capdPractitionerAddressInput', 'capdReportPractitioner']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  const report = html.slice(html.indexOf('id="capdReport"'), html.indexOf('id="capdHistoryList"'));
  assert.ok(report.indexOf('id="capdReportPractitioner"') > report.indexOf('id="capdReportDescription"'));
  for (const id of ['capdReportPractitionerName', 'capdReportPractitionerLicense',
    'capdReportPractitionerFacility', 'capdReportPractitionerAddress']) {
    assert.match(report, new RegExp(`id="${id}"`));
  }
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
  const profiles = app.slice(app.indexOf('function capdPractitionerProfileKey('), app.indexOf('function renderCapdPractitionerProfiles('));
  vm.runInContext(`${profiles}\nglobalThis.profiles = capdPractitionerProfiles;`, normalized);
  const available = normalized.profiles();
  assert.equal(available.length, 3);
  assert.equal(available.find(([, profile]) => profile.name === 'Anna Testowa')[1].facility, 'SATIS');
  assert.ok(available.some(([, profile]) => profile.name === 'Iwona Testowa'));
});

test('APD selects a named practitioner without a separate profile-save control', () => {
  assert.doesNotMatch(html, /id="saveCapdPractitionerProfileBtn"|Zapisz profil|id="capdPractitionerProfileStatus"/);
  assert.match(html, /id="capdPractitionerAddressInput"/);
  assert.match(html, /data-capd-practitioner-shortcut="dorota" data-capd-practitioner-location="P63"[^>]*><strong>Dorota Mikosz-Micorek<\/strong>/);
  assert.match(html, /data-capd-practitioner-shortcut="dorota" data-capd-practitioner-location="P50"[^>]*><strong>Dorota Mikosz-Micorek<\/strong>/);
  assert.match(html, /data-capd-practitioner-shortcut="justyna" data-capd-practitioner-location="P63"[^>]*><strong>Justyna Waliczek<\/strong>/);
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

test('APD no longer runs a separate profile save', () => {
  assert.doesNotMatch(app, /async function saveCapdPractitionerProfile\(|saveCapdPractitionerProfileBtn|capdPractitionerProfileStatus/);
});

test('APD clinic shortcut preserves a matching saved full address', () => {
  const source = app.slice(app.indexOf('const CAPD_CLINIC_ADDRESSES ='), app.indexOf('function currentCapdPractitioner('));
  const scope = vm.createContext({
    normalize: value => String(value || '').toLocaleLowerCase('pl-PL')
  });
  vm.runInContext(`${source}\nglobalThis.address = capdAddressForLocation;`, scope);
  assert.equal(scope.address('P50', { addresses: ['ul. Partyzantów 63, Bielsko-Biała', 'al. Piłsudskiego 50, 34-300 Żywiec'] }),
    'al. Piłsudskiego 50, 34-300 Żywiec');
  assert.equal(scope.address('P63'), 'ul. Partyzantów 63, 43-300 Bielsko-Biała');
  assert.equal(scope.address('T12'), 'ul. Traugutta 12, 43-300 Bielsko-Biała');
});

test('APD practitioner shortcut fills the saved person and selected clinic address', () => {
  const source = app.slice(app.indexOf('function capdProfileForShortcut('), app.indexOf('function linkCapdExaminerToProfile('));
  const examiner = { value: '' };
  const license = { value: '' };
  const facility = { value: '' };
  const address = { value: '' };
  const location = { value: 'P63' };
  const profile = { name: 'Dorota Testowa', licenseCode: 'AB12', facility: 'SATIS', address: 'ul. Partyzantów 63, 43-300 Bielsko-Biała', addresses: ['ul. Partyzantów 63, 43-300 Bielsko-Biała', 'al. Piłsudskiego 50, 34-300 Żywiec'] };
  const scope = vm.createContext({
    normalize: value => String(value || '').toLocaleLowerCase('pl-PL'),
    capdSavedPractitionerProfiles: [{ id: 'apd-profile-dorota', savedAt: '2026-10-01', profile }],
    capdPractitionerProfiles: () => [],
    capdPractitionerProfileKey: value => `${value.name}|${value.licenseCode}`,
    activeCapdPractitionerProfileId: '',
    capdExaminerInput: examiner,
    capdPractitionerLicenseInput: license,
    capdPractitionerFacilityInput: facility,
    capdPractitionerAddressInput: address,
    capdLocationInput: location,
    CAPD_CLINIC_ADDRESSES: {
      P63: { marker: 'partyzantów 63' },
      P50: { marker: 'piłsudskiego 50' }
    },
    capdAddressForLocation: () => 'al. Piłsudskiego 50, 34-300 Żywiec',
    documentLocationKey: value => value,
    updateCapdPractitionerShortcuts: () => {},
    updateDocumentLocationAccent: () => {},
    renderCapdReport: () => {}
  });
  vm.runInContext(`${source}\nglobalThis.findShortcut = capdProfileForShortcut; globalThis.applyShortcut = applyCapdPractitionerProfile;`, scope);
  scope.applyShortcut(scope.findShortcut('dorota'), 'P50');
  assert.equal(examiner.value, 'Dorota Testowa');
  assert.equal(license.value, 'AB12');
  assert.equal(facility.value, 'SATIS');
  assert.equal(location.value, 'P50');
  assert.equal(address.value, 'al. Piłsudskiego 50, 34-300 Żywiec');
  assert.equal(scope.activeCapdPractitionerProfileId, 'apd-profile-dorota');
  location.value = 'P63';
  scope.applyShortcut(profile);
  assert.equal(location.value, 'P63');
  scope.capdSavedPractitionerProfiles = [];
  assert.equal(scope.findShortcut('dorota').name, 'Dorota Mikosz-Micorek');
  assert.equal(scope.findShortcut('justyna').name, 'Justyna Waliczek');
});
