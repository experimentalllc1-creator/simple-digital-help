import assert from 'node:assert/strict';
import { miloAssignments } from '../src/lib/milo-assignments.ts';
import { MILO_GENERAL_CONTRACTORS_PACKAGE_FILES } from '../src/lib/milo-assets.server.ts';
const origin = process.argv[2];
const target = new URL(origin);
const local = target.protocol === 'http:' && target.hostname === '127.0.0.1';
assert.ok(target.protocol === 'https:' || local);
const get = path => fetch(origin + path, {redirect:'manual', signal:AbortSignal.timeout(20000)});
assert.equal(miloAssignments.length,45);
for (const assignment of miloAssignments) {
  const response = await get('/products/'+assignment.slug);
  assert.equal(response.status,200,assignment.slug);
  const html = await response.text();
  assert.ok(html.includes('$99'));
  assert.ok(html.includes('Monday-Friday, in the morning, customer local time.'));
  if (assignment.agentId === 'general-contractors') {
    assert.ok(html.includes('Milo General Contractors') && html.includes('General Contractors'));
    for (const term of ['whole-project', 'Specialty-only subcontractors', 'Builders / Homebuilders', 'institutional']) assert.ok(html.includes(term),term);
    assert.ok(!html.includes('<video'));
    for (const file of MILO_GENERAL_CONTRACTORS_PACKAGE_FILES[assignment.productCode]) {
      for (const prefix of ['/','/docs/Products/MILO/','/MILO/']) assert.equal((await get(prefix+file.filename)).status,404,file.filename);
    }
  }
}
const response = await get('/categories/sales');
assert.equal(response.status,200);
assert.ok((await response.text()).includes('Milo General Contractors'));
const checkoutStatus = (await fetch(origin+'/api/checkout/milo',{method:'POST',headers:{origin:'https://invalid.example'}})).status;
const webhookStatus = (await fetch(origin+'/api/webhooks/stripe',{method:'POST',body:'{}'})).status;
if (local) {
  // Existing local purchase/delivery switches remain disabled.
  assert.ok([403,503].includes(checkoutStatus));
  assert.ok([400,503].includes(webhookStatus));
} else {
  assert.equal(checkoutStatus,403);
  assert.equal(webhookStatus,400);
}
console.log('Smoke passed: all 45 product routes, General Contractors qualification and scheduling, 54 private asset 404s, Sales catalog, checkout/webhook protections.');
