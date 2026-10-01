const { test } = require('node:test');
const assert = require('node:assert/strict');
const { webcrypto } = require('node:crypto');
const { create } = require('../offline-vault.js');
const encoder = new TextEncoder();
function fixture() {
  let stored;
  const disk = { async get() { return structuredClone(stored); }, async put(value) { stored = structuredClone(value); } };
  return { disk, vault: create({ disk, crypto: webcrypto }) };
}
async function legacyRecord(data, password) {
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const material = await webcrypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await webcrypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 600000, hash: 'SHA-256' }, material,
    { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  const ciphertext = await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv,
    additionalData: encoder.encode('SATIS offline drafts v1') }, key, encoder.encode(JSON.stringify(data)));
  return { version: 1, iterations: 600000, salt, iv, ciphertext };
}
test('new drafts use a non-extractable device key and reopen without a password', async () => {
  const { disk, vault } = fixture();
  await vault.unlock(undefined, { owner: 'private-user', pricing: [] });
  await vault.change(data => ({ ...data, drafts: [{ id: '1', customer: 'Synthetic Person', document: 'ABC123456' }] }));
  const stored = await disk.get();
  assert.equal(stored.version, 2);
  assert.equal(stored.key.extractable, false);
  assert.equal(JSON.stringify(stored).includes('Synthetic'), false);
  assert.equal(Buffer.from(stored.ciphertext).includes(Buffer.from('ABC123456')), false);
  vault.lock(); assert.throws(() => vault.read());
  const reopened = create({ disk, crypto: webcrypto });
  const value = await reopened.unlock();
  assert.equal(value.drafts[0].customer, 'Synthetic Person');
});
test('new vault requires an online owner', async () => {
  const { vault } = fixture();
  await assert.rejects(vault.unlock());
  await assert.rejects(vault.unlock(undefined, {}));
});
test('legacy drafts migrate once without deleting data after a wrong password', async () => {
  const { disk, vault } = fixture();
  await disk.put(await legacyRecord({ owner: 'private-user', drafts: [{ id: 'old', customer: 'Older Person' }], pricing: [] }, 'synthetic-long-password'));
  assert.equal(await vault.needsMigration(), true);
  await assert.rejects(vault.unlock('wrong-password', { owner: 'private-user' }), /Nieprawidłowe/);
  assert.equal((await disk.get()).version, 1);
  await assert.rejects(vault.unlock('synthetic-long-password', { owner: 'other-user' }), /innego konta/);
  const data = await vault.unlock('synthetic-long-password', { owner: 'private-user' });
  assert.equal(data.drafts[0].customer, 'Older Person');
  assert.equal((await disk.get()).version, 2);
  vault.lock();
  assert.equal(await vault.needsMigration(), false);
  assert.equal((await vault.unlock()).drafts[0].id, 'old');
});
test('queued writes preserve drafts, use unique IVs and reject tampering', async () => {
  const { disk, vault } = fixture();
  await vault.unlock(undefined, { owner: 'private-user' });
  const before = await disk.get();
  await Promise.all([1, 2, 3].map(id => vault.change(data => ({ ...data, drafts: [...data.drafts, { id }] }))));
  assert.equal(vault.read().drafts.length, 3);
  const after = await disk.get();
  assert.notDeepEqual(after.iv, before.iv);
  const bytes = new Uint8Array(after.ciphertext); bytes[0] ^= 1;
  await disk.put({ ...after, ciphertext: bytes.buffer }); vault.lock();
  await assert.rejects(vault.unlock());
});
test('lock invalidates pending work without exposing plaintext', async () => {
  const { vault } = fixture();
  await vault.unlock(undefined, { owner: 'private-user' });
  const work = vault.change(data => ({ ...data, drafts: [{ id: 'late' }] }));
  vault.lock();
  await assert.rejects(work, /zablokowane/);
  assert.equal(vault.unlocked(), false);
});
