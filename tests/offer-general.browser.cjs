const assert = require('node:assert/strict');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { runInSyntheticApp } = require('./priority-offline.browser.cjs');

const notes = 'Przymiarka w gabinecie. Dodatkowy termin testowania.';
const headings = ['Jakie modele możesz u nas wypróbować?', 'Ile kosztuje aparat słuchowy?'];

async function verifyGeneralOffer({ page, context, pageErrors }) {
  await page.locator('#offerTab').click();
  assert.match(await page.locator('#offerMeta').textContent(), /Data oferty:.*Ważna do:/);
  await page.evaluate(() => { pricingRecords = []; });
  await page.locator('#offerCustomerInput').fill('Osoba Testowa');
  await page.locator('#offerGeneralInput').check();
  const content = page.locator('#offerGeneralContent');
  await content.waitFor({ state: 'visible' });
  assert.deepEqual(await content.locator('h3').allTextContents(), headings);
  assert.deepEqual(await content.locator('h4').allTextContents(), ['Ładowalne', 'Na baterie', 'Dyskretne']);
  assert.equal(await page.locator('#offerNotesInput').isVisible(), true);
  assert.equal(await page.locator('#offerDateInput').isVisible(), false);
  assert.equal(await page.locator('#offerGeneralNotesPrint').isVisible(), false);
  assert.equal(await page.locator('#offerContent').isVisible(), false);
  assert.equal(await page.locator('#printPricingOfferBtn').isEnabled(), true);
  assert.equal(await page.evaluate(() => validatePricingOfferForAction()), true);
  assert.doesNotMatch(await page.locator('#offerMeta').textContent(), /Data oferty|Ważna do/);
  await page.locator('#offerNotesInput').fill(notes);
  assert.equal(await page.locator('#offerGeneralNotesPrint span').textContent(), notes);
  const geometry = () => content.evaluate(node => ({
    width: node.clientWidth, used: node.scrollWidth, right: node.getBoundingClientRect().right,
    viewport: innerWidth
  }));
  await page.setViewportSize({ width: 390, height: 844 });
  const mobile = await geometry();
  assert.ok(mobile.used <= mobile.width + 1 && mobile.right <= mobile.viewport + 1, JSON.stringify(mobile));
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.locator('#offerGeneralInput').uncheck();
  assert.match(await page.locator('#offerMeta').textContent(), /Data oferty:.*Ważna do:/);
  assert.equal(await page.locator('#offerDateInput').isVisible(), true);
  await page.locator('#offerGeneralInput').check();

  await page.locator('#offlineFormsLauncher').click();
  await page.locator('#offlineWorkspace').waitFor({ state: 'visible', timeout: 25000 });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.evaluate(() => { window.print = () => { window.qaGeneralPrint = true; }; });
  await page.locator('[data-offline=print]').click();
  await page.waitForFunction(() => window.qaGeneralPrint === true);
  await page.emulateMedia({ media: 'print' });
  const output = page.locator('#offlinePrint');
  const text = await output.innerText();
  assert.ok(headings.every(heading => text.includes(heading)));
  assert.ok(text.includes(notes));
  assert.doesNotMatch(text, /Data oferty|Ważna do|Jak wygląda współpraca|Przedział cenowy/);
  assert.equal(await output.locator('.offer-description').isVisible(), false);
  if (process.env.SATIS_QA_DIR) {
    const pdf = path.join(process.env.SATIS_QA_DIR, 'satis-informacja-ogolna.pdf');
    await page.pdf({ path: pdf, format: 'A4', printBackground: true, preferCSSPageSize: true });
    assert.match(execFileSync('pdfinfo', [pdf], { encoding: 'utf8' }), /Pages:\s+1\b/);
    const printed = execFileSync('pdftotext', [pdf, '-'], { encoding: 'utf8' });
    assert.ok(printed.includes('Uwagi:') && printed.includes(notes));
    assert.doesNotMatch(printed, /Data oferty|Ważna do|Jak wygląda współpraca/);
  }
  assert.deepEqual(pageErrors, []);
  console.log('Informacja ogólna: typy aparatów, koszty, uwagi i brak dat; sprawdzono podgląd oraz wydruk offline.');
}

runInSyntheticApp(verifyGeneralOffer).catch(error => { console.error(error); process.exitCode = 1; });
