import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {hasLegalAcceptance,acceptanceMetadata} from '../src/lib/legal-acceptance.server.ts';
import {TERMS_VERSION,TERMS_SHA256} from '../src/lib/legal-version.ts';
import {handleCheckout} from '../src/lib/milo-http.server.ts';
import {checkoutMiloBasket} from '../src/lib/milo-basket-checkout.server.ts';
import {handleAudit} from '../src/lib/sales-audit-http.server.ts';
Object.assign(process.env,{APP_URL:'http://127.0.0.1:3000',STRIPE_MODE:'test',MILO_CHECKOUT_ENABLED:'true',MILO_DELIVERY_ENABLED:'true'});
test('current explicit acceptance only and exact published Terms fingerprint',async()=>{
 for(const legalAccepted of [false,undefined,null,'false','yes',1])assert.equal(hasLegalAcceptance({legalAccepted,termsVersion:TERMS_VERSION}),false);
 assert.equal(hasLegalAcceptance({legalAccepted:true,termsVersion:'old'}),false);
 assert.equal(hasLegalAcceptance({legalAccepted:true,termsVersion:TERMS_VERSION}),true);
 assert.equal(TERMS_SHA256,createHash('sha256').update(await readFile('src/app/legal/content/terms.md')).digest('hex'));
 const m=acceptanceMetadata();assert.equal(m.terms_version,TERMS_VERSION);assert.ok(Date.parse(m.legal_accepted_at));
});
test('direct API bodyless, JSON bypass and unchecked/stale forms fail before payment infrastructure',async()=>{
 const forbidden=()=>{throw Error('Payment infrastructure must not run')};
 for(const body of [undefined,JSON.stringify({legalAccepted:true,termsVersion:TERMS_VERSION}),new URLSearchParams(),new URLSearchParams({legalAccepted:'false',termsVersion:TERMS_VERSION}),new URLSearchParams({legalAccepted:'true',termsVersion:'old'})]){
  const r=await handleCheckout(new Request(process.env.APP_URL+'/api/checkout/milo',{method:'POST',headers:{origin:process.env.APP_URL},body}),{stripe:forbidden,store:forbidden});assert.equal(r.status,400);
 }
});
test('resumed cart persists acceptance to the same Stripe session before returning its URL',async()=>{
 const session={id:'cs_test_legal',url:'https://checkout.stripe.com/c/pay/test',status:'open'};const updates=[];
 const stripe={checkout:{sessions:{retrieve:async()=>session,update:async(id,p)=>{updates.push({id,p});Object.assign(session,p);return session}}}};
 const order={checkout_id:session.id};
 await assert.rejects(()=>checkoutMiloBasket(order,stripe,async()=>[],{}));assert.equal(updates.length,0);
 assert.equal(await checkoutMiloBasket(order,stripe,async()=>[],{legalAccepted:true,termsVersion:TERMS_VERSION}),session.url);
 assert.equal(updates[0].id,session.id);assert.equal(session.metadata.terms_version,TERMS_VERSION);assert.equal(session.metadata.terms_sha256,TERMS_SHA256);
 stripe.checkout.sessions.update=async()=>{throw Error('Stripe write failed')};await assert.rejects(()=>checkoutMiloBasket(order,stripe,async()=>[],{legalAccepted:true,termsVersion:TERMS_VERSION}));
});
test('audit cart API rejects absent, unchecked and stale acceptance before authorization or Stripe',async()=>{
 for(const fields of [{},{legalAccepted:false,termsVersion:TERMS_VERSION},{legalAccepted:true,termsVersion:'old'}]){
  const r=await handleAudit(new Request(process.env.APP_URL+'/api/sales-audit',{method:'POST',headers:{origin:process.env.APP_URL,'content-type':'application/json'},body:JSON.stringify({action:'checkout',slugs:['milo-florida-roofing-contractors'],...fields})}));
  assert.equal(r.status,400);assert.match((await r.json()).error,/accept the current Terms/);
 }
});
