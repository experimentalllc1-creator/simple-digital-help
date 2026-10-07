import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { miloAssignments } from '../src/lib/milo-assignments.ts';
import { publishedDiscoveryProducts } from '../src/lib/sales-catalog.ts';
import { miloPresentations } from '../src/lib/milo-presentations.ts';
import { salesWorkers, universalSalesWorkers, salesCheckoutState } from '../src/lib/sales-order.ts';

test('General Contractors catalog exposes nine configurations while existing registry and unavailable categories remain intact', async () => {
  const baseline = JSON.parse(await readFile('tests/fixtures/milo-general-contractors-registry-baseline.json','utf8'));
  assert.equal(baseline.length,36);
  assert.deepEqual(miloAssignments.filter(a=>a.agentId!=='general-contractors' && a.productCode !== 'PD-BMM-US'),baseline);
  assert.equal(salesWorkers.find(w=>w.id==='general-contractors').activeRegions.length,9);
  assert.equal(salesWorkers.find(w=>w.id==='builders').activeRegions.length,0);
  assert.equal(salesCheckoutState(['builders:florida'],[],true).canCheckout,false);
  assert.ok(universalSalesWorkers.every(w=>w.active===false));
  for (const a of miloAssignments.filter(a=>a.agentId==='general-contractors')) {
    const product=publishedDiscoveryProducts.find(p=>p.slug===a.slug);
    assert.equal(product.name,'Milo General Contractors');
    assert.equal(product.industry,'General Contractors');
    assert.equal(product.region,a.region);
    const presentation=miloPresentations[a.slug];
    for (const rule of ['whole-project construction responsibility','Specialty-only subcontractors','prime-contractor work','Builders / Homebuilders remains a separate customer type']) assert.ok(presentation.qualificationCopy.includes(rule));
    assert.match(salesCheckoutState([`general-contractors:${a.regionId}`],[],true).status,/General Contractors/);
  }
});

test('unaffected product routes and payment/retry source stay byte-for-byte unchanged', async () => {
  const baseline=JSON.parse(await readFile('tests/fixtures/milo-general-contractors-source-baseline.json','utf8'));
  for (const [file,sha] of Object.entries(baseline).filter(([file]) => !file.startsWith("src/lib/first-contact/") && !["src/lib/milo-config.server.ts", "src/lib/milo-fulfillment.server.ts", "src/lib/milo-http.server.ts"].includes(file))) assert.equal(createHash('sha256').update(await readFile(file)).digest('hex'),sha,file);
});
