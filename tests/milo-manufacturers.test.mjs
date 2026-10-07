import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import Stripe from 'stripe';
import {PGlite} from '@electric-sql/pglite';
import {miloAssignments} from '../src/lib/milo-assignments.ts';
import {MILO_PACKAGE_FILES,miloAttachments,miloEmail} from '../src/lib/milo-assets.server.ts';
import {salesWorkers,salesCheckoutState} from '../src/lib/sales-order.ts';
import {publishedDiscoveryProducts,findDiscoveryProducts} from '../src/lib/sales-catalog.ts';
import {miloPresentations} from '../src/lib/milo-presentations.ts';
import {paymentConfig} from '../src/lib/milo-config.server.ts';
import {handleCheckout,handleWebhook} from '../src/lib/milo-http.server.ts';
import {verifiedOrder} from '../src/lib/milo-fulfillment.server.ts';
import {DeliveryStore} from '../src/lib/milo-store.server.ts';

globalThis.fetch=async()=>{throw Error('Unmocked network forbidden');};
Object.assign(process.env,{STRIPE_MODE:'test',STRIPE_SECRET_KEY:'sk_test_local_only',STRIPE_WEBHOOK_SECRET:'whsec_local_only',RESEND_API_KEY:'local',APP_URL:'http://127.0.0.1:3000',MILO_CHECKOUT_ENABLED:'true',MILO_DELIVERY_ENABLED:'true'});
const manufacturer=miloAssignments.find(a=>a.productCode==='PD-BMM-US');
const prices={};
for(const a of miloAssignments){const id=a.productCode.replaceAll('-','');process.env[a.productEnv]=`prod_${id}`;process.env[a.priceEnv]=`price_${id}`;prices[`price_${id}`]={id:`price_${id}`,active:true,type:'one_time',unit_amount:9900,currency:'usd',livemode:false,product:{id:`prod_${id}`,active:true,livemode:false}};}
const sdk=new Stripe('sk_test_local_only');

test('one nationwide manufacturer product occupies the catalog position after Projects & Developments',()=>{
 assert.equal(miloAssignments.filter(a=>a.agentId===manufacturer.agentId).length,1);
 assert.equal(manufacturer.regionId,'united-states');
 const index=salesWorkers.findIndex(w=>w.id==='projects-developments');
 assert.equal(salesWorkers[index+1].id,manufacturer.agentId);assert.equal(salesWorkers[index+1].regionBased,false);
 assert.equal(publishedDiscoveryProducts[0].slug,'milo-florida-roofing-contractors');
 assert.equal(findDiscoveryProducts('Building Materials Manufacturer','Florida')[0].slug,manufacturer.slug);
 const state=salesCheckoutState([`${manufacturer.agentId}:united-states`],[],true);
 assert.equal(state.canCheckout,true);assert.equal(state.order.totalCents,9900);assert.deepEqual(state.productSlugs,[manufacturer.slug]);
 assert.equal(salesCheckoutState([`${manufacturer.agentId}:texas`],[],true).canCheckout,false);
 const mixed=salesCheckoutState(['roofing:texas',`${manufacturer.agentId}:united-states`],[],true);assert.equal(mixed.canCheckout,true);assert.equal(mixed.order.totalCents,19800);
});

test('shipped assignment enforces own manufacturing, nationwide duplicates, weekly local time and customer ownership',async()=>{
 const files=MILO_PACKAGE_FILES[manufacturer.productCode];const text=await readFile(`docs/Products/MILO/${files[0].filename}`,'utf8');
 for(const rule of ['entire United States','Monday at 9:00 AM customer local time','up to 2 NEW','residential, commercial, institutional, industrial, or infrastructure','company itself manufactures','pure distributors, wholesalers, dealers, retailers, importers, sales agencies, contractors, installers, consultants, and service businesses','Do not artificially fill','Do not favor any particular material','across the entire shared Prospects sheet, regardless of Region or Customer Type','known aliases','state where the manufacturer is headquartered or principally located','Customer Type = Building Materials Manufacturer','customer-owned thereafter','write only A:G','Never send an A:J row payload','never populate, clear, overwrite, or otherwise modify','Never backfill No','daylight-saving changes','end exactly 52 weeks after successful activation','Do not alter an already-installed customer automation']) assert.ok(text.includes(rule),rule);
 assert.doesNotMatch(text,/roofing|Monday-Friday|up to 5|reach five|First Contact/i);
 assert.ok(text.includes('Date Added\nBusiness Name\nCity\nRegion\nCustomer Type\nWebsite\nContacted?\nEmail\nPhone\nNotes'));
 const p=miloPresentations[manufacturer.slug];assert.equal(p.fields.length,10);assert.match(p.headline,/2.*weekly/);assert.match(p.description,/Monday at 9:00 AM/);
});

test('private delivery is exactly the manufacturer TXT/PDF; historical versions cannot substitute a package',async()=>{
 const attachments=await miloAttachments('PD-BMM-US');assert.equal(attachments.length,2);
 for(const [i,file] of attachments.entries()){assert.equal(file.filename,MILO_PACKAGE_FILES['PD-BMM-US'][i].filename);assert.equal(createHash('sha256').update(Buffer.from(file.content,'base64')).digest('hex'),MILO_PACKAGE_FILES['PD-BMM-US'][i].sha256);}
 const email=await miloEmail('buyer@example.test','cs_manufacturer','PD-BMM-US');assert.match(email.subject,/U.S. Building Materials Manufacturers/);assert.doesNotMatch(email.text,/Roofing|Monday-Friday|First Contact/);assert.match(email.text,/Monday at 9:00 AM/);
 for(const version of ['2.2','2.3'])await assert.rejects(()=>miloAttachments('PD-BMM-US',version),/Unavailable/);
});

function paid(selected,metadata,id){const total=selected.length*9900;return {id,mode:'payment',status:'complete',payment_status:'paid',livemode:false,currency:'usd',amount_total:total,amount_subtotal:total,metadata,customer_details:{email:'buyer@example.test'},payment_intent:{id:`pi_${id}`,status:'succeeded',currency:'usd',livemode:false,amount_received:total},line_items:{has_more:false,data:selected.map(a=>({quantity:1,amount_total:9900,amount_subtotal:9900,price:prices[process.env[a.priceEnv]]}))}};}
for(const selected of [[manufacturer],[miloAssignments.find(a=>a.productCode==='PD-ROOF-TX'),manufacturer]]){
 test(`manufacturer checkout/fulfillment for ${selected.length} assignments preserves attachment isolation and suppresses replays`,async()=>{
  const db=new PGlite();try{
   for(const file of ['001_milo_deliveries.sql','002_milo_identity.sql','003_milo_product_codes.sql'])await db.exec(await readFile('db/migrations/'+file,'utf8'));
   const store=new DeliveryStore(db);let params,session;const sends=[];
   const deps={store:()=>store,stripe:()=>({webhooks:sdk.webhooks,prices:{retrieve:async id=>prices[id]},checkout:{sessions:{create:async p=>{params=p;return {url:'https://checkout.stripe.com/c/pay/test'};},retrieve:async()=>session}}}),send:async msg=>{sends.push(structuredClone(msg));return {id:'12345678-1234-1234-1234-123456789abc'};}};
   const form=new URLSearchParams();selected.forEach(a=>form.append('product',a.slug));
   const response=await handleCheckout(new Request(process.env.APP_URL+'/api/checkout/milo',{method:'POST',headers:{origin:process.env.APP_URL},body:form}),deps);assert.equal(response.status,303);
   assert.deepEqual(params.line_items,selected.map(a=>({price:process.env[a.priceEnv],quantity:1})));assert.equal(params.metadata.version,'2.4');assert.equal(params.success_url,process.env.APP_URL+'/checkout/success/'+(selected.length===1?'manufacturers':'regions'));
   session=paid(selected,params.metadata,`cs_bmm_${selected.length}`);
   const webhook=()=>{const payload=JSON.stringify({id:'evt_bmm',type:'checkout.session.completed',livemode:false,data:{object:session}});return new Request(process.env.APP_URL+'/api/webhooks/stripe',{method:'POST',body:payload,headers:{'stripe-signature':sdk.webhooks.generateTestHeaderString({payload,secret:process.env.STRIPE_WEBHOOK_SECRET})}});};
   assert.equal((await handleWebhook(webhook(),deps)).status,200);assert.equal(sends.length,selected.length);
   for(const [i,a] of selected.entries())assert.deepEqual(sends[i].attachments,await miloAttachments(a.productCode));
   assert.equal((await handleWebhook(webhook(),deps)).status,200);assert.equal(sends.length,selected.length);assert.equal((await store.find(session.id)).status,'sent');
   const wrong=structuredClone(session);wrong.metadata.version='2.3';wrong.metadata.release_version='2.3';assert.throws(()=>verifiedOrder(wrong,selected.map(a=>paymentConfig(a.slug))),/requires v2.4/);
   const wrongAmount=structuredClone(session);wrongAmount.amount_total++;assert.throws(()=>verifiedOrder(wrongAmount,selected.map(a=>paymentConfig(a.slug))),/Payment/);
  }finally{await db.close();}
 });
}

test('manufacturer fulfillment retries reuse its saved message and idempotency key without resending accepted basket items',async()=>{
 const db=new PGlite();try{
  for(const file of ['001_milo_deliveries.sql','002_milo_identity.sql','003_milo_product_codes.sql'])await db.exec(await readFile('db/migrations/'+file,'utf8'));
  const store=new DeliveryStore(db);const {fulfillOrder}=await import('../src/lib/milo-fulfillment.server.ts');
  const selected=[miloAssignments.find(a=>a.productCode==='PD-ROOF-TX'),manufacturer];
  const metadata={product:'milo-discovery-regions',products:JSON.stringify(selected.map(a=>a.slug)),product_codes:JSON.stringify(selected.map(a=>a.productCode)),version:'2.4',release_version:'2.4'};
  const order=verifiedOrder(paid(selected,metadata,'cs_bmm_retry'),selected.map(a=>paymentConfig(a.slug)));const accepted=[];let fail=true;
  const send=async msg=>{if(msg.subject.includes('Manufacturers')&&fail)throw Error('Temporary delivery failure');accepted.push(msg);return {id:'12345678-1234-1234-1234-123456789abc'};};
  await assert.rejects(()=>fulfillOrder(order,store,miloEmail,send),/fulfillment incomplete/);assert.equal(accepted.length,1);fail=false;
  await fulfillOrder(order,store,()=>{throw Error('Saved snapshot must be reused');},send);assert.equal(accepted.length,2);assert.match(accepted[1].subject,/Manufacturers/);assert.equal(accepted[1].idempotencyKey,'milo-v2.4/cs_bmm_retry/PD-BMM-US');
 }finally{await db.close();}
});
