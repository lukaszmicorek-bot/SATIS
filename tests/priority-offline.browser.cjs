const { createServer } = require('node:http');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const { installSyntheticSupabase } = require('./synthetic-supabase.cjs');

const root = path.resolve(__dirname, '..');
const files = new Set(Object.keys(require('../security-manifest.json').files));
const types = { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.woff2': 'font/woff2' };
let origin, browser;
const server = createServer((req, res) => {
  const name = new URL(req.url, origin).pathname.slice(1) || 'index.html';
  let data;
  if (name === 'qa-sdk.js') data = `(${installSyntheticSupabase})(); window.supabase={createClient:()=>window.__qaClient};
    if (navigator.onLine && !sessionStorage.qaReleased) {
      const wait = new Promise(resolve => { window.qaReleasePricing = () => { sessionStorage.qaReleased = '1'; resolve(); }; });
      window.__qa.waitForTable = table => table === 'pricing_records' ? wait : undefined;
    }`;
  else if (name === 'supabase-config.js') data = 'window.SUPABASE_CONFIG={url:"https://mock-project.invalid",publishableKey:"sb_publishable_SYNTHETIC"};';
  else if (files.has(name)) {
    data = readFileSync(path.join(root, name));
    if (name === 'index.html') data = data.toString().replace(/<script[^>]*src="https:\/\/cdn\.jsdelivr\.net[^>]*>/, '<script src="qa-sdk.js">');
    if (name === 'offline-sw.js') data = data.toString().replace(/const SDK = [^;]+;/, `const SDK = "${origin}/qa-sdk.js";`).replace(/const SDK_INTEGRITY = [^;]+;/, 'const SDK_INTEGRITY = "";');
  } else { res.writeHead(404).end(); return; }
  res.setHeader('Content-Type', types[path.extname(name)] || 'application/octet-stream');
  res.end(data);
});

async function runInSyntheticApp(verify) {
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    origin = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE });
    const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('dialog', dialog => dialog.accept());
    page.setDefaultTimeout(12000);
    await page.goto(origin);
    await page.waitForFunction(() => supabasePrimaryDataReady && records.length === 10000 && repairRecords.length === 160);
    assert.equal(await page.locator('#authDialog').evaluate(dialog => dialog.open), false);
    assert.equal(await page.evaluate(() => supabaseInitialDataReady), false);
    assert.equal(await page.locator('.devices-table thead th').first().evaluate(el => getComputedStyle(el).position), 'sticky');
    await page.evaluate(() => qaReleasePricing());
    await page.waitForFunction(() => supabaseInitialDataReady);
    assert.equal(await page.locator('.offer-items-table thead th').first().evaluate(el => getComputedStyle(el).position), 'static');
    console.log('Aparaty i Serwis widoczne przed cennikiem; zapis po potwierdzonym odczycie.');
    await verify({ page, context, pageErrors });
  } finally { await browser?.close(); server.close(); }
}

async function verifyOffline({ page, context, pageErrors }) {
  await page.locator('#loanTab').click();
  await page.locator('#loanCustomerInput').fill('Lokalny Szkic');
  const checkRemote = async (customer, revision) => {
    await page.evaluate(async ({customer, revision}) => {
      const today = todayInputValue();
      __qa.changeDocument('loan_contracts', 'qa-remote-loan', customer ? {
        customer, date: today, periodFrom: today, periodTo: addDaysToIsoDate(today, 14),
        number: '99/11/2026', city: 'Bielsko-Biała, ul. Partyzantów 63',
        rightDevice: { model: 'Model testowy', serial: 'QA-REMOTE-LOAN' }
      } : null);
      if (sharedDocumentCheckPending) await sharedDocumentCheckPending;
      sharedDocumentCheckedAt = 0;
      await checkSharedDocuments();
    }, {customer, revision});
    await page.waitForFunction(({customer, revision}) => {
      const found = pricingLoanHistory.find(entry => entry.id === 'qa-remote-loan');
      return customer ? found?.customer === customer && satisDataStore.revision('loan_contracts','qa-remote-loan') === revision : !found;
    }, {customer, revision});
    assert.equal(await page.locator('#loanCustomerInput').inputValue(), 'Lokalny Szkic');
  };
  await checkRemote('Zdalna Umowa', 1);
  await checkRemote('Zdalna Korekta', 2);
  await checkRemote('', null);
  await page.evaluate(() => startNewPricingLoan());
  console.log('Historia umów odzyskuje pominięte zmiany bez nadpisania wypełnianego formularza.');

  await page.locator('#offlineFormsLauncher').click();
  await page.locator('#offlineWorkspace').waitFor({ state: 'visible', timeout: 25000 });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.locator('#offerCustomerInput').fill('Osoba Testowa');
  await page.locator('#offerDeviceInput1').fill('Fikcyjny model');
  await page.locator('[data-offline=save]').click();
  await page.locator('.offline-draft').getByRole('button', { name: /Osoba Testowa/ }).waitFor();
  await page.locator('[data-offline=print]').click();
  assert.equal(await page.locator('#offlinePrint').count(), 0, 'a missing price must block printing');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#offlineWorkspace').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#offlineUnlockDialog').evaluate(dialog => dialog.open), false);
  assert.equal(await page.locator('#offerDeviceInput1').inputValue(), 'Fikcyjny model');
  await page.evaluate(() => { window.print = () => { window.qaPrint = true; }; });
  await page.locator('#offerPriceInput1').fill('650,00');
  await page.locator('[data-offline=print]').click();
  await page.waitForFunction(() => window.qaPrint === true);
  assert.match(await page.locator('#offlinePrint').textContent(), /WERSJA ROBOCZA OFFLINE/);
  assert.match(await page.locator('#offlinePrint').textContent(), /Fikcyjny model/);
  assert.equal(await page.evaluate(() => __qa.calls.filter(call => call.name === 'satis_write_records').length), 0);
  assert.deepEqual(pageErrors, []);
  console.log('Bez internetu: otwarcie bez hasła, zachowany szkic, walidacja i wydruk roboczy.');
}

if (require.main === module) runInSyntheticApp(verifyOffline).catch(error => {
  console.error(error); process.exitCode = 1;
});
module.exports = { runInSyntheticApp };
