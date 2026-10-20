import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {CustomerAccounts,unsubscribeToken,unsubscribeIdentity} from '../src/lib/customer-accounts.server.ts';
import {recommendAssignments} from '../src/lib/customer-recommendations.ts';
import {createCustomerAuth} from '../src/lib/customer-auth.server.ts';
import {miloAssignments} from '../src/lib/milo-assignments.ts';
import {accountSameOrigin} from '../src/lib/customer-request.server.ts';
import {pricedRecommendations} from '../src/lib/customer-prices.server.ts';
Object.assign(process.env,{NODE_ENV:'test',STRIPE_MODE:'test',APP_URL:'http://127.0.0.1:3100',BETTER_AUTH_SECRET:'isolated-customer-accounts-test-secret-2026',CUSTOMER_ACCOUNTS_ENABLED:'true'});
globalThis.fetch=async()=>{throw Error('Network forbidden in isolated account tests')};
async function setup(){const db=new PGlite();for(const file of ['001_milo_deliveries.sql','002_milo_identity.sql','003_milo_product_codes.sql','004_sales_audit.sql','005_milo_storefront_pricing.sql','006_customer_accounts.sql'])await db.exec(await readFile('db/migrations/'+file,'utf8'));return db;}
const a=miloAssignments.find(a=>a.productCode==='PD-ROOF-FL');
function fixture(email='buyer@example.test',id='fixture'){
 const order={sessionId:'cs_'+id,paymentIntentId:'pi_'+id,email,livemode:false,productCode:a.productCode,productCodes:[a.productCode],releaseVersion:'2.4'};
 const session={id:order.sessionId,payment_status:'paid',status:'complete',livemode:false,amount_total:9900,amount_subtotal:9900,currency:'usd',created:Math.floor(Date.now()/1000),customer:null,metadata:{}};
 return {order,session};
}
test('purchase identity, refunds, original materials, consent and recommendation security',async t=>{
 const db=await setup(),store=new CustomerAccounts(db);
 try{
 const {order,session}=fixture();await store.recordPurchase(session,order);await store.recordPurchase(session,order);
 const customer=(await db.query('SELECT * FROM milo_customer_profiles')).rows[0];
 await t.test('guest purchases are permanent and deduplicated without assumed verification or consent',async()=>{assert.equal((await store.purchases(customer.id,false)).length,1);assert.equal(customer.email_verified,false);assert.equal(customer.marketing_consent,false);assert.equal(customer.registered_at,null);assert.equal((await store.purchases(customer.id,true)).length,0);});
 await t.test('pending payment cannot create purchase',async()=>{await assert.rejects(()=>store.recordPurchase({...session,payment_status:'unpaid'},order));assert.equal((await store.purchases(customer.id,false)).length,1);});
 const attachment={filename:'Milo_original_v2.4.txt',content:Buffer.from('private original product').toString('base64')};
 await db.query(`INSERT INTO milo_deliveries(session_id,payment_intent_id,livemode,recipient,message,product_code,product_codes,release_version) VALUES($1,$2,false,$3,$4,$5,$6,'2.4')`,[order.sessionId,order.paymentIntentId,order.email,JSON.stringify({attachments:[attachment]}),a.productCode,[a.productCode]]);
 await t.test('only the owning customer and exact variant receive original snapshot bytes',async()=>{assert.deepEqual(await store.attachment(customer.id,false,order.sessionId,a.productCode,'txt'),attachment);assert.equal(await store.attachment(randomUUID(),false,order.sessionId,a.productCode,'txt'),null);assert.equal(await store.attachment(customer.id,true,order.sessionId,a.productCode,'txt'),null);assert.equal(await store.attachment(customer.id,false,order.sessionId,'PD-ROOF-TX','txt'),null);});
 await t.test('returning purchaser uses permanent identity',async()=>{const next=fixture('buyer@example.test','repeat');await store.recordPurchase(next.session,next.order);assert.equal((await store.purchases(customer.id,false)).length,2);assert.equal((await db.query('SELECT count(*)::int n FROM milo_customer_profiles')).rows[0].n,1);});
 await t.test('refunds arriving before payment prevent access and out-of-order retries never restore it',async()=>{const f=fixture('refund@example.test','refund');await store.refund({payment_intent:f.order.paymentIntentId,amount_refunded:9900,refunded:true});await store.recordPurchase(f.session,f.order);await store.refund({payment_intent:f.order.paymentIntentId,amount_refunded:2000,refunded:false});const p=(await db.query('SELECT * FROM milo_purchases WHERE session_id=$1',[f.session.id])).rows[0];assert.equal(p.status,'refunded');assert.equal(p.refunded_amount,9900);await store.refund({payment_intent:order.paymentIntentId,amount_refunded:1000,refunded:false});assert.equal(await store.attachment(customer.id,false,order.sessionId,a.productCode,'txt'),null);});
 await t.test('explicit opt-in and withdrawal preserve audit evidence; forged unsubscribe is rejected',async()=>{await store.consent(customer.id,true,'account-preferences');await store.consent(customer.id,false,'email-unsubscribe');assert.equal((await db.query('SELECT marketing_consent FROM milo_customer_profiles WHERE id=$1',[customer.id])).rows[0].marketing_consent,false);const events=(await db.query('SELECT * FROM milo_consent_events WHERE customer_id=$1',[customer.id])).rows;assert.equal(events.length,2);assert.ok(events.every(e=>e.wording_version&&e.wording&&e.recorded_at));const token=unsubscribeToken(customer.id);assert.equal(unsubscribeIdentity(token),customer.id);assert.equal(unsubscribeIdentity(token.slice(0,-1)+(token.endsWith('a')?'b':'a')),null);});
 await t.test('one permission invitation only after verified registration, even if email fails',async()=>{let count=0;const send=async()=>{count++;throw Error('mail unavailable')};await store.register(customer.id,send);assert.equal(count,0);await db.query('UPDATE milo_customer_profiles SET email_verified=true WHERE id=$1',[customer.id]);await store.register(customer.id,send);await store.register(customer.id,send);assert.equal(count,1);assert.ok((await db.query('SELECT registered_at FROM milo_customer_profiles WHERE id=$1',[customer.id])).rows[0].registered_at);});
 await t.test('recommendations are deterministic, relevant, available and exclude owned assignments',()=>{const r=recommendAssignments([a.slug]);assert.deepEqual(r,recommendAssignments([a.slug]));assert.ok(r.length);assert.ok(r.every(r=>r.available&&r.slug!==a.slug&&r.reason));assert.equal(r[0].agentId,'architects');assert.equal(r[0].regionId,'florida');assert.deepEqual(recommendAssignments([]),[]);});
 }finally{await db.close();}
});

test('recommendation cards only offer validated current approved Stripe prices',async()=>{
 process.env.STRIPE_SECRET_KEY='sk_test_fixture';
 for(const[i,a]of miloAssignments.entries()){process.env[a.productEnv]='prod_'+i;process.env[a.priceEnv]='price_'+i;}
 const mock={prices:{retrieve:async id=>{const item=miloAssignments.find(a=>process.env[a.priceEnv]===id);return {id,active:true,type:'one_time',unit_amount:9900,currency:'usd',livemode:false,product:{id:process.env[item.productEnv],active:true,livemode:false}};}}};
 const current=await pricedRecommendations([a.slug],mock);assert.ok(current.length);assert.ok(current.every(r=>r.amount===9900&&r.currency==='usd'));
 for(const patch of [{active:false},{unit_amount:19900},{currency:'eur'},{livemode:true},{product:{id:'wrong',active:true,livemode:false}}])assert.deepEqual(await pricedRecommendations([a.slug],{prices:{retrieve:async id=>({...await mock.prices.retrieve(id),...patch})}}),[]);
 assert.deepEqual(await pricedRecommendations([a.slug],{prices:{retrieve:async()=>{throw Error('Unavailable catalog')}}}),[]);
});

test('Better Auth passwordless links and sessions against isolated PostgreSQL',async t=>{
 const db=await setup(),sent=[];
 const query=async (sql,params)=>{const result=await db.query(typeof sql==='string'?sql:sql.text,params??sql.values);return {...result,rowCount:result.affectedRows??result.rows.length};};
 const pool={query,connect:async()=>({query,release(){}}),end:async()=>{},on(){},listenerCount(){return 1}};
 const auth=createCustomerAuth(pool,async message=>{sent.push(message);return {id:randomUUID()}});
 const request=(path,body,cookie)=>new Request(process.env.APP_URL+'/api/auth'+path,{method:body?'POST':'GET',headers:{origin:process.env.APP_URL,...(body?{'content-type':'application/json'}:{}),...(cookie?{cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});
 try{
 const response=await auth.handler(request('/sign-in/magic-link',{email:'auth@example.test',callbackURL:'/account',errorCallbackURL:'/account/login?error=link'}));assert.equal(response.status,200,await response.clone().text());assert.equal(sent.length,1);
 const url=sent[0].text.match(/http:\/\/[^\s]+/)[0];const token=new URL(url).searchParams.get('token');const rows=(await db.query('SELECT * FROM milo_auth_verifications')).rows;assert.ok(rows.length);assert.ok(rows.every(row=>!row.identifier.includes(token)&&!row.value.includes(token)));
 const verify=await auth.handler(new Request(url));assert.equal(verify.status,302,await verify.clone().text());const cookies=verify.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');assert.ok(cookies.includes('sdh_account'));
 const session=await auth.api.getSession({headers:new Headers({cookie:cookies})});assert.ok(session?.user.emailVerified);assert.equal(session.user.email,'auth@example.test');assert.equal(sent.filter(m=>m.subject==='Would you like to hear from us occasionally?').length,1);
 await t.test('reused and forged links cannot establish sessions',async()=>{for(const link of [url,url.replace(token,'forged')]){const r=await auth.handler(new Request(link));assert.ok(r.headers.get('location')?.includes('error='));assert.ok(!r.headers.getSetCookie().some(v=>v.startsWith('sdh_account.session_token=')));}});
 await t.test('cross-origin sign-in and signout are rejected',async()=>{const r=await auth.handler(new Request(process.env.APP_URL+'/api/auth/sign-out',{method:'POST',headers:{origin:'https://attacker.example','content-type':'application/json',cookie:cookies},body:'{}'}));assert.equal(r.status,403);});
 await t.test('expired magic links cannot create sessions',async()=>{await auth.handler(request('/sign-in/magic-link',{email:'expired@example.test',callbackURL:'/account',errorCallbackURL:'/account/login?error=link'}));const expired=sent.at(-1).text.match(/http:\/\/[^\s]+/)[0];await db.query('UPDATE milo_auth_verifications SET "expiresAt"=now()-interval \'1 minute\'');const r=await auth.handler(new Request(expired));assert.ok(r.headers.get('location')?.includes('error='));});
 await t.test('session expiry is enforced by the server',async()=>{await auth.handler(request('/sign-in/magic-link',{email:'auth@example.test',callbackURL:'/account'}));const link=sent.at(-1).text.match(/http:\/\/[^\s]+/)[0],r=await auth.handler(new Request(link)),expiredCookies=r.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');await db.query('UPDATE milo_auth_sessions SET "expiresAt"=now()-interval \'1 minute\' WHERE id<>$1',[session.session.id]);assert.equal(await auth.api.getSession({headers:new Headers({cookie:expiredCookies})}),null);assert.ok(await auth.api.getSession({headers:new Headers({cookie:cookies})}));});
 await t.test('logout revokes server session',async()=>{const r=await auth.handler(request('/sign-out',{},cookies));assert.equal(r.status,200);assert.equal(await auth.api.getSession({headers:new Headers({cookie:cookies})}),null);});
 }finally{await db.close();}
});

test('native forms allow exact same-origin no-referrer submissions and reject cross-site requests',()=>{
 const url=process.env.APP_URL+'/api/account/preferences',host=new URL(url).host;
 for(const headers of [{origin:process.env.APP_URL},{origin:'null','sec-fetch-site':'same-origin',host}])assert.equal(accountSameOrigin(new Request(url,{method:'POST',headers})),true);
 for(const headers of [{origin:'https://attacker.example'},{origin:'null','sec-fetch-site':'cross-site',host},{origin:'null','sec-fetch-site':'same-origin',host:'attacker.example'},{host}])assert.equal(accountSameOrigin(new Request(url,{method:'POST',headers})),false);
});
