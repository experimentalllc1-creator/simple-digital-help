import assert from 'node:assert/strict';
import { miloAssignments } from '../src/lib/milo-assignments.ts';
import { MILO_ELECTRICAL_PACKAGE_FILES } from '../src/lib/milo-assets.server.ts';
const origin = process.argv[2];
const target = new URL(origin);
assert.ok(target.protocol === 'https:' || (target.protocol === 'http:' && target.hostname === '127.0.0.1'));
const get = path => fetch(origin + path, {redirect:'manual', signal:AbortSignal.timeout(20000)});
for (const assignment of miloAssignments) {
  const response = await get('/products/'+assignment.slug);
  assert.equal(response.status,200,assignment.slug);
  const html = await response.text();
  assert.ok(html.includes('$99'));
  assert.ok(html.includes('Monday-Friday, in the morning, customer local time.'));
  if (assignment.agentId === 'electrical') {
    assert.ok(html.includes('Milo Electrical') && html.includes('Electrical Contractors'));
    assert.ok(html.includes('industrial') && html.includes('low-voltage'));
    assert.ok(!html.includes('<video'));
    for (const file of MILO_ELECTRICAL_PACKAGE_FILES[assignment.productCode]) {
      for (const prefix of ['/','/docs/Products/MILO/','/MILO/']) {
        assert.equal((await get(prefix+file.filename)).status,404,file.filename);
      }
    }
  }
}
const response = await get('/categories/sales');
assert.equal(response.status,200);
assert.ok((await response.text()).includes('Milo Electrical'));
const checkoutStatus = (await fetch(origin+'/api/checkout/milo',{method:'POST',headers:{origin:'https://invalid.example'}})).status;
const webhookStatus = (await fetch(origin+'/api/webhooks/stripe',{method:'POST',body:'{}'})).status;
if (target.hostname === '127.0.0.1') {
  // Local purchase/delivery switches intentionally remain disabled.
  assert.ok([403,503].includes(checkoutStatus));
  assert.ok([400,503].includes(webhookStatus));
} else {
  assert.equal(checkoutStatus,403);
  assert.equal(webhookStatus,400);
}
console.log('Smoke passed: all 36 product routes, Electrical qualification and scheduling, 54 private asset 404s, Sales catalog, origin/signature protection.');
