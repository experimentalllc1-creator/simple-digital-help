import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('docs/recovery/production-source-manifest.json', root), 'utf8'));
assert.equal(manifest.sourceFiles, 621);
assert.equal(manifest.files.length, 277);
assert.equal(manifest.excludedPrivateFulfillmentFiles, 343);
for (const file of manifest.files) {
  assert.ok(!file.path.startsWith('docs/Products/'));
  assert.ok(!file.path.startsWith('.env') && !file.path.startsWith('.vercel/'));
  const bytes = await readFile(new URL(file.path, root));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, file.path);
}
const vercel = JSON.parse(await readFile(new URL('vercel.json', root), 'utf8'));
assert.equal(vercel.git.deploymentEnabled, false);
console.log(`Verified ${manifest.files.length} public production files against ${manifest.deployment}; automatic Git deployments remain disabled.`);
