const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const logos = {
  Bernafon: 'manufacturer-logos/bernafon-offer.svg',
  ReSound: 'manufacturer-logos/resound-offer.png',
  Sonic: 'manufacturer-logos/sonic-offer.png',
  Starkey: 'manufacturer-logos/starkey-offer.svg'
};

test('offer embeds the four supplied manufacturer logos for reliable deployment', () => {
  for (const [brand, relativePath] of Object.entries(logos)) {
    const asset = fs.readFileSync(path.join(root, relativePath));
    assert.ok(asset.length > 500, `${brand} logo should not be empty`);
    if (relativePath.endsWith('.svg')) assert.match(asset.toString('utf8'), /<svg\b/);
    else assert.deepEqual([...asset.subarray(1, 4)], [0x50, 0x4e, 0x47]);
    const mime = relativePath.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
    assert.match(html, new RegExp(`src="data:${mime.replace('+', '\\+')};base64,[^"]+" alt="${brand}"`));
    assert.doesNotMatch(html, new RegExp(`src="${relativePath.replaceAll('.', '\\.')}"`));
  }
});

test('Audibel uses the supplied JPEG, embedded for offline printing', () => {
  const asset = fs.readFileSync(path.join(root, 'manufacturer-logos/audibel-offer.jpeg'));
  assert.deepEqual([...asset.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  assert.ok(html.includes('data:image/jpeg;base64,' + asset.toString('base64')));
  assert.match(html, /manufacturer-logo-frame/);
});

test('each wordmark has its own optical width, shared by screen and print', () => {
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  for (const brand of ['audio-service','beltone','bernafon','oticon','philips','phonak','resound','signia','sonic','starkey']) {
    assert.match(css,new RegExp(`\\.manufacturer-logo-image\\.logo-${brand} \\{ --logo-width: \\d+(?:\\.\\d+)?; \\}`));
  }
  assert.match(css,/width: min\(100%, calc\(var\(--logo-width, 96\) \* var\(--logo-unit\)\)\)/);
  assert.match(css,/--logo-unit: 0\.16mm;/);
  assert.doesNotMatch(css,/body\.pricing-offer-print \.manufacturer-logo-image\.logo-(signia|starkey)\s*\{/);
  assert.match(css,/object-fit: contain;/);
});

test('eleven logos have matching cells, the five-logo second row is centered and print stays compact',()=>{
  const start=html.indexOf('<div class="manufacturer-brand-logos"');
  const block=html.slice(start,html.indexOf('</div>',start));
  assert.equal((block.match(/<span class="manufacturer-logo-frame\b/g)||[]).length,11);
  assert.equal((block.match(/<\/span>/g)||[]).length,11);
  assert.equal((block.match(/<img class="manufacturer-logo-image\b/g)||[]).length,11);
  const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
  assert.match(css,/grid-template-columns: repeat\(12, minmax\(0, 1fr\)\);/);
  assert.match(css,/\.manufacturer-logo-frame:nth-child\(7\) \{ grid-column: 2 \/ span 2; \}/);
  assert.match(css,/grid-template-rows: 7mm 12\.5mm;/);
  assert.match(css,/@media screen and \(max-width: 600px\)/);
  assert.match(css,/\.manufacturer-logo-frame\.logo-audibel-frame\s*\{[^}]*aspect-ratio: 1130 \/ 425;/);
});
