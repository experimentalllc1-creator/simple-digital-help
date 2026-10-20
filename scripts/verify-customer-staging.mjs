// Explicit owner-only staging harness. Never included in deployment routes.
import {readFile,writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {randomUUID} from 'node:crypto';
import pg from 'pg';
import {createCustomerAuth} from '../src/lib/customer-auth.server.ts';
import {CustomerAccounts} from '../src/lib/customer-accounts.server.ts';
import {sendEmail} from '../src/lib/email.server.ts';
import {miloAttachments} from '../src/lib/milo-assets.server.ts';
const expected='sdh_accounts_staging_20261020';
if(process.env.STRIPE_MODE!=='test'||new URL(process.env.DATABASE_URL).pathname!=='/'+expected||process.env.APP_URL!=='http://127.0.0.1:3210')throw Error('Isolated staging configuration required');
const owner=JSON.parse(await readFile('.qa/verified-owner.json','utf8'));
if(owner.source!=='Stripe account'||!owner.email)throw Error('Verified owner address required');
const db=new pg.Pool({connectionString:process.env.DATABASE_URL,max:3,connectionTimeoutMillis:10000});
const store=new CustomerAccounts(db);
const email=owner.email.trim().toLowerCase();
for(const [name,code,version] of [['roofing-fl','PD-ROOF-FL','2.2'],['roofing-tx','PD-ROOF-TX','2.4']]){
 const id=`cs_test_accounts_fixture_${name}`;
 const order={sessionId:id,paymentIntentId:`pi_test_accounts_fixture_${name}`,email,livemode:false,productCode:code,productCodes:[code],releaseVersion:version};
 await store.recordPurchase({id,payment_status:'paid',status:'complete',livemode:false,amount_total:9900,amount_subtotal:9900,currency:'usd',created:Math.floor(Date.now()/1000),customer:null,metadata:{}},order);
 await db.query(`INSERT INTO milo_deliveries(session_id,payment_intent_id,livemode,recipient,message,product_code,product_codes,release_version) VALUES($1,$2,false,$3,$4,$5,$6,$7) ON CONFLICT(session_id) DO NOTHING`,[id,order.paymentIntentId,email,JSON.stringify({to:email,subject:'Synthetic staging fixture',text:'Synthetic staging fixture, not a real payment',idempotencyKey:`staging/${name}`,attachments:await miloAttachments(code,version)}),code,[code],version]);
}
let privateUrl;
const auth=createCustomerAuth(db,async message=>{
 const result=await sendEmail(message);
 if(message.subject==='Your Simple Digital Help sign-in link')privateUrl=message.text.match(/http:\/\/[^\s]+/)[0];
 await writeFile('.qa/owner-email-check.json',JSON.stringify({messageId:result.id,accepted:true,toVerifiedOwner:true,at:new Date().toISOString()}));
 return result;
});
const response=await auth.handler(new Request(process.env.APP_URL+'/api/auth/sign-in/magic-link',{method:'POST',headers:{origin:process.env.APP_URL,'content-type':'application/json'},body:JSON.stringify({email,callbackURL:'/account',errorCallbackURL:'/account/login?error=link'})}));
if(response.status!==200||!privateUrl)throw Error('Staging sign-in email failed');
console.log('Owner-only sign-in email accepted by Resend. Two synthetic staging purchases seeded; no live payments or customer records used.');
const server=createServer((request,response)=>{if(request.url==='/owner-sign-in'&&privateUrl){const destination=privateUrl;privateUrl=undefined;response.writeHead(302,{Location:destination,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'});response.end();}else{response.writeHead(404);response.end();}});
server.listen(3211,'127.0.0.1',()=>console.log('Private one-use staging sign-in handoff listening on localhost:3211. No token is printed or stored.'));
setTimeout(()=>server.close(()=>db.end()),10*60*1000).unref();
