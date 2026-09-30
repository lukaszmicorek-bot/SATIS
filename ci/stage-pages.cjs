const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = process.env.SATIS_PAGES_OUTPUT ? path.resolve(process.env.SATIS_PAGES_OUTPUT) : path.join(root, '_site');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'security-manifest.json'), 'utf8'));

assert.equal(fs.existsSync(output), false, 'Refusing to overwrite an existing Pages artifact');
for (const name of [...Object.keys(manifest.files), 'security-manifest.json', 'CNAME']) {
  const target = path.join(output, name);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(root, name), target);
}
fs.writeFileSync(path.join(output, '.nojekyll'), '');
console.log(`Staged SATIS ${manifest.app_version} for GitHub Pages`);
