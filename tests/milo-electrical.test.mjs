import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import Stripe from 'stripe';
import { PGlite } from '@electric-sql/pglite';
import { miloAssignments } from '../src/lib/milo-assignments.ts';
import { MILO_PACKAGE_FILES, miloAttachments } from '../src/lib/milo-assets.server.ts';
import { salesCheckoutState } from '../src/lib/sales-order.ts';
import { handleCheckout, handleWebhook } from '../src/lib/milo-http.server.ts';
import { DeliveryStore } from '../src/lib/milo-store.server.ts';

globalThis.fetch = async () => { throw Error('Unmocked network forbidden'); };
Object.assign(process.env, { STRIPE_MODE:'test', STRIPE_SECRET_KEY:'sk_test_local_only',
  STRIPE_WEBHOOK_SECRET:'whsec_local_only', RESEND_API_KEY:'test-only',
  APP_URL:'http://127.0.0.1:3000', MILO_CHECKOUT_ENABLED:'true', MILO_DELIVERY_ENABLED:'true' });
const electrical = miloAssignments.filter(a => a.agentId === 'electrical');
const prices = {};
for (const a of miloAssignments) {
  const id = a.productCode.replaceAll('-','');
  process.env[a.productEnv] = `prod_${id}`; process.env[a.priceEnv] = `price_${id}`;
  prices[`price_${id}`] = {id:`price_${id}`, active:true, type:'one_time', unit_amount:9900,
    currency:'usd',livemode:false,product:{id:`prod_${id}`,active:true,livemode:false}};
}
const boundaries = {
 'florida':['FL'], 'texas':['TX'], 'california':['CA'],
 'northeast':['ME','NH','VT','MA','RI','CT','NY','NJ','PA'],
 'southeast':['DE','MD','VA','WV','KY','TN','NC','SC','GA','AL','MS','AR','LA'],
 'midwest':['OH','MI','IN','IL','WI','MN','IA','MO','ND','SD','NE','KS'],
 'southwest':['AZ','NM','NV','OK'], 'mountain-west':['CO','UT','WY','MT'],
 'pacific-northwest':['WA','OR','ID'],
};
test('nine Electrical packages have exact boundaries, Electrical qualification and preserved scheduling/workspace rules', async () => {
  assert.equal(electrical.length,9);
  assert.deepEqual(electrical.map(a=>a.productCode), ['PD-ELEC-FL','PD-ELEC-TX','PD-ELEC-CA','PD-ELEC-NORTHEAST','PD-ELEC-SOUTHEAST','PD-ELEC-MIDWEST','PD-ELEC-SOUTHWEST','PD-ELEC-MOUNTAIN-WEST','PD-ELEC-PACIFIC-NORTHWEST']);
  for (const a of electrical) {
    const state = salesCheckoutState([`electrical:${a.regionId}`],[],true);
    assert.equal(state.canCheckout,true); assert.equal(state.order.totalCents,9900);
    assert.deepEqual(state.order.discoveryAssignments[0].states,boundaries[a.regionId]);
    const prompt = await readFile(`docs/Products/MILO/${MILO_PACKAGE_FILES[a.productCode][0].filename}`,'utf8');
    const roofing = miloAssignments.find(r => r.agentId === 'roofing' && r.regionId === a.regionId);
    const original = await readFile(`docs/Products/MILO/${MILO_PACKAGE_FILES[roofing.productCode][0].filename}`,'utf8');
    // Multi-state source boundary paragraphs are copied exactly, not inferred from display names.
    if (boundaries[a.regionId].length > 1) {
      const boundary = original.split('\n').find(line => line.includes('territory is limited'));
      assert.ok(boundary); assert.ok(prompt.includes(boundary));
      assert.deepEqual([...boundary.matchAll(/\(([A-Z]{2})\)/g)].map(m=>m[1]),boundaries[a.regionId]);
    }
    for (const text of [`Product Code: ${a.productCode}`,`Milo - Electrical Contractors - ${a.region}`,
      `Region = ${a.region}`, 'Customer Type = Electrical Contractors','Contacted? = No',
      'Monday-Friday, in the morning, customer local time.', 'native flexible/daypart "morning"',
      'service end date is exactly 52 weeks after successful activation',
      'Leave existing Roofing, HVAC, and Plumbing scheduled tasks untouched', 'Do not send outreach',
      'Electrical installation, repair, service, wiring, panel/service upgrades, lighting, generators, controls, low-voltage, or closely related electrical contracting work', 'HVAC, plumbing, mechanical, solar, or other trades',
      'Do not add the same business twice under Customer Type = Electrical Contractors',
      'Region alone does not make an existing Electrical business a new record',
      'Simple Digital Help - Sales Prospects', 'Do not automatically resize columns']) assert.ok(prompt.includes(text),`${a.productCode}: ${text}`);
    assert.doesNotMatch(prompt,/9:00|automatically resize columns so|even if it later appears under another region or customer type/);
    assert.match(prompt,/Date Added\nBusiness Name\nCity\nRegion\nCustomer Type\nWebsite\nContacted\?/);
    assert.equal((await miloAttachments(a.productCode)).length,2);
    await assert.rejects(miloAttachments(a.productCode,'2.2'));
  }
});

test('Electrical-only and mixed orders use one payment and isolated replay-safe fulfillment', async t => {
  const sdk = new Stripe('sk_test_local_only');
  const selections = [ ['electrical:florida'], ['electrical:florida','electrical:texas'],
    ['plumbing:florida','electrical:florida'], ['roofing:florida','hvac:florida','plumbing:florida','electrical:florida'],
    electrical.map(a=>`electrical:${a.regionId}`) ];
  for (const keys of selections) await t.test(`${keys.join(' + ')} = $${keys.length*99}`, async () => {
    const state = salesCheckoutState(keys,[],true);
    assert.equal(state.canCheckout,true); assert.equal(state.order.totalCents,keys.length*9900);
    const selected = state.productSlugs.map(slug => miloAssignments.find(a=>a.slug===slug));
    const db = new PGlite();
    try {
      for (const migration of ['001_milo_deliveries.sql','002_milo_identity.sql','003_milo_product_codes.sql']) await db.exec(await readFile(`db/migrations/${migration}`,'utf8'));
      const store = new DeliveryStore(db); let params, creates=0, session; const sent=[];
      const deps = {store:()=>store, stripe:()=>({webhooks:sdk.webhooks,prices:{retrieve:async id=>prices[id]},checkout:{sessions:{
        create:async value=>{params=value;creates++;return {url:'https://checkout.stripe.com/c/pay/test'};}, retrieve:async()=>session,
      }}}), send:async message=>{sent.push(structuredClone(message));return {id:'12345678-1234-1234-1234-123456789abc'};} };
      const form = new URLSearchParams(); state.productSlugs.forEach(slug=>form.append('product',slug));
      const request = new Request(process.env.APP_URL+'/api/checkout/milo',{method:'POST',headers:{origin:process.env.APP_URL},body:form});
      assert.equal((await handleCheckout(request,deps)).status,303); assert.equal(creates,1);
      assert.deepEqual(params.line_items,selected.map(a=>({price:process.env[a.priceEnv],quantity:1})));
      assert.equal(params.success_url,process.env.APP_URL+'/checkout/success/regions');
      const codes=selected.map(a=>a.productCode);
      assert.deepEqual(selected.length===1?[params.metadata.product_code]:JSON.parse(params.metadata.product_codes),codes);
      session={id:'cs_electrical_'+keys.join('_').replaceAll(':',''),mode:'payment',status:'complete',payment_status:'paid',livemode:false,
        currency:'usd',amount_total:keys.length*9900,amount_subtotal:keys.length*9900,metadata:params.metadata,
        customer_details:{email:'buyer@example.test'},payment_intent:{id:'pi_electrical',status:'succeeded',currency:'usd',livemode:false,amount_received:keys.length*9900},
        line_items:{has_more:false,data:selected.map(a=>({quantity:1,amount_total:9900,amount_subtotal:9900,price:prices[process.env[a.priceEnv]]}))}};
      const webhook = type => {const payload=JSON.stringify({id:'evt_electrical',type,livemode:false,data:{object:session}});return new Request(process.env.APP_URL+'/api/webhooks/stripe',{method:'POST',body:payload,headers:{'stripe-signature':sdk.webhooks.generateTestHeaderString({payload,secret:process.env.STRIPE_WEBHOOK_SECRET})}});};
      assert.equal((await handleWebhook(webhook('checkout.session.completed'),deps)).status,200);
      assert.equal(sent.length,selected.length);
      for (const [index,a] of selected.entries()) {
        assert.deepEqual(sent[index].attachments,await miloAttachments(a.productCode));
        assert.equal(sent[index].attachments.length,2);
        assert.equal(sent[index].subject,a.agentId==='electrical'?`Your Milo Electrical - ${a.region}`:a.agentId==='plumbing'?`Your Milo Plumbing - ${a.region}`:a.agentId==='hvac'?`Your Milo HVAC - ${a.region}`:`Your Milo - ${a.region} Roofing Prospect Discovery`);
      }
      assert.equal(new Set(sent.map(m=>m.idempotencyKey)).size,selected.length);
      assert.deepEqual((await db.query('SELECT product_codes FROM milo_deliveries WHERE session_id = $1',[session.id])).rows[0].product_codes,codes);
      assert.equal((await handleWebhook(webhook('checkout.session.completed'),deps)).status,200);
      assert.equal((await handleWebhook(webhook('checkout.session.async_payment_succeeded'),deps)).status,200);
      assert.equal(sent.length,selected.length);
    } finally { await db.close(); }
  });
});

test('all existing Roofing, HVAC and Plumbing assets remain byte-for-byte unchanged', async()=>{
  const before=JSON.parse(await readFile('tests/fixtures/milo-existing-electrical-baseline.json','utf8'));
  for (const [file,sha] of Object.entries(before)) assert.equal(createHash('sha256').update(await readFile(`docs/Products/MILO/${file}`)).digest('hex'),sha,file);
});
