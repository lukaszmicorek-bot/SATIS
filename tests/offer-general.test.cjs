const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');

const source = fs.readFileSync(require.resolve('../app.js'), 'utf8');
const html = fs.readFileSync(require.resolve('../index.html'), 'utf8');
function extract(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, name);
  return source.slice(start, source.indexOf('\n}', start) + 2);
}

function setup() {
  const notesText = {};
  const notes = { querySelector: () => notesText, hidden: true };
  const content = { querySelector: () => notes };
  const controls = () => ({ disabled: true });
  const c = vm.createContext({
    collator: new Intl.Collator('pl'),
    Date: class extends Date { constructor() { super('2026-11-24T23:15:00Z'); } },
    normalize: value => String(value || '').trim().toLowerCase(),
    normalizeLoanHistoryText: value => String(value ?? '').trim(), titleCaseName: value => value,
    normalizeDocumentLocationValue: value => value, isoDateForSave: value => value || '',
    pricingOfferHistoryPatientGroup: () => '', customerNameLookupKey: value => String(value || '').toLowerCase(),
    currentSupabaseUser: null, currentWorkstationName: () => 'P63', makeId: () => 'synthetic-id',
    ensurePricingOfferDate: () => '2026-11-25', ensurePricingOfferLocation: () => 'P63',
    addDaysToIsoDate: () => '2026-12-25', PRICING_OFFER_VALID_DAYS: 30,
    offerTitle: {}, offerMeta: {}, offerNotesInput: { value: ' Przymiarka w gabinecie\nDodatkowy termin ' },
    offerAgeWarning: {}, offerEmptyState: {}, offerContent: {},
    offerGeneralInput: { checked: true }, offerCustomerInput: { value: 'Osoba Testowa' },
    savePricingOfferBtn: controls(), printPricingOfferBtn: controls(), offerTransferSidesBtn: controls(),
    offerDeviceInput1: controls(), offerDeviceInput2: controls(), offerChargerInput: controls(),
    offerChargerPriceInput: controls(), offerEarmoldInput: controls(), offerItemsBody: null, offerPaymentsBody: null,
    pricingGeneralOfferSavedRanges: null, pricingGeneralOfferSavedPeriod: '',
    requireDocumentCustomerName: input => input.value.trim().split(/\s+/u).length >= 2,
    selectedPricingOfferAllItems: () => assert.fail('general offer does not need products')
  });
  for (const name of ['setPricingGeneralOfferNotes', 'renderPricingGeneralOffer', 'validatePricingOfferForAction',
    'normalizePricingPrice', 'pricingGeneralOfferBrand', 'normalizePricingGeneralRanges', 'pricingOfferHistoryEntryHasContent', 'normalizePricingOfferHistoryItem',
    'normalizePricingOfferHistoryEntry', 'currentPricingOfferSnapshot', 'pricingOfferSnapshotKey']) vm.runInContext(extract(name), c);
  return { c, notes, notesText, content };
}

test('general offer keeps the information and notes before the notice and shared cooperation section', () => {
  const block = html.slice(html.indexOf('<section id="offerGeneralContent"'), html.indexOf('<div id="offerContent"'));
  assert.deepEqual([...block.matchAll(/<h3>([^<]+)<\/h3>/g)].map(match => match[1]), [
    'Jakie modele możesz u nas wypróbować?', 'Ile kosztuje aparat słuchowy?'
  ]);
  assert.deepEqual([...block.matchAll(/<h4>([^<]+)<\/h4>/g)].map(match => match[1]), ['Ładowalne', 'Na baterie', 'Dyskretne']);
  assert.ok(block.indexOf('id="offerGeneralNotesPrint"') > block.indexOf('Ile kosztuje'));
  assert.doesNotMatch(block, /offer-general-table|Jak wygląda współpraca/);
  assert.ok(block.indexOf('offer-general-device-notice') > block.indexOf('id="offerGeneralNotesPrint"'));
  assert.match(html, /class="medical-device-notice">[^<]+<\/p>\s*<\/div>\s*<section class="document-description offer-description"[^>]+>\s*<h3>Jak wygląda współpraca z nami\?<\/h3>/);
});

test('general offer shows the print date immediately after the place, without an offer date or catalogue', () => {
  const { c, notes, notesText, content } = setup();
  c.renderPricingGeneralOffer(content, 'Osoba Testowa', 'Bielsko-Biała, ul. Partyzantów 63');
  assert.equal(c.offerMeta.textContent, 'Miejsce: Bielsko-Biała, ul. Partyzantów 63 | Data wydruku: 25.11.2026');
  assert.equal(c.offerContent.hidden, true);
  assert.equal(c.offerEmptyState.hidden, true);
  assert.equal(c.savePricingOfferBtn.disabled, false);
  assert.equal(c.printPricingOfferBtn.disabled, false);
  assert.equal(notesText.textContent, 'Przymiarka w gabinecie\nDodatkowy termin');
  assert.equal(notes.hidden, false);
  c.offerNotesInput.value = '   ';
  c.renderPricingGeneralOffer(content, 'Osoba Testowa', 'P63');
  assert.equal(notes.hidden, true);
  assert.equal(c.validatePricingOfferForAction(), true);
  c.offerCustomerInput.value = '';
  assert.equal(c.validatePricingOfferForAction(), false);
});

test('general snapshots keep internal dates and notes, and do not rewrite legacy quotes', () => {
  const { c } = setup();
  const draft = c.currentPricingOfferSnapshot();
  assert.equal(draft.generalInformation, true);
  assert.equal(draft.offerDate, '2026-11-25');
  assert.equal(draft.items.length, 0);
  assert.equal(draft.priceRanges.length, 0);
  assert.equal(draft.total, '');
  const legacy = c.normalizePricingOfferHistoryEntry({
    ...draft, priceRanges: [{manufacturer:'Phonak',min:2000,max:4000}], pricingPeriod:'2026-10'
  });
  c.pricingGeneralOfferSavedRanges = legacy.priceRanges;
  c.pricingGeneralOfferSavedPeriod = legacy.pricingPeriod;
  assert.equal(c.currentPricingOfferSnapshot().priceRanges[0].max, 4000);
  assert.equal(c.currentPricingOfferSnapshot().pricingPeriod, '2026-10');
  assert.equal(c.pricingOfferSnapshotKey(draft), c.pricingOfferSnapshotKey(legacy));
  assert.notEqual(c.pricingOfferSnapshotKey(draft), c.pricingOfferSnapshotKey({...draft,notes:'Inne ustalenia'}));
});
