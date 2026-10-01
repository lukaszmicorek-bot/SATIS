const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name));
const manifest = JSON.parse(read('security-manifest.json'));
const version = manifest.app_version;

assert.match(version, /^\d{8}-\d+$/);
assert.match(read('offline-sw.js').toString(), new RegExp(`^const VERSION = "${version}";`, 'm'));

for (const [name, expected] of Object.entries(manifest.files)) {
  const bytes = read(name);
  assert.equal(bytes.length, expected.bytes, `${name}: length differs from release manifest`);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), expected.sha256,
    `${name}: hash differs from release manifest`);
}

const html = read('index.html').toString();
const versionedAssets = [...html.matchAll(/(?:src|href)="([^"?]+\.(?:js|css))\?v=([^"&]+)"/g)];
assert.ok(versionedAssets.length >= 6, 'Expected versioned application scripts and stylesheet');
for (const [, name, assetVersion] of versionedAssets) {
  assert.equal(assetVersion, version, `${name}: cache version differs from release`);
  assert.ok(manifest.files[name], `${name}: asset missing from release manifest`);
}

console.log(`SATIS ${version}: ${Object.keys(manifest.files).length} published assets verified`);
