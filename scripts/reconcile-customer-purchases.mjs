import pg from 'pg';
import {stripeClient} from '../src/lib/stripe.server.ts';
import {CustomerAccounts} from '../src/lib/customer-accounts.server.ts';
import {reconcileHistoricalPurchase,reconcileHistoricalCart} from '../src/lib/customer-reconciliation.server.ts';
// Dry-run is the default. Never sends email or calls fulfillment, and never changes Stripe.
const apply=process.argv.includes('--apply');
const db=new pg.Pool({connectionString:process.env.DATABASE_URL,max:2,connectionTimeoutMillis:10000});
let verified=0,recorded=0,unresolved=0;
try{
 const rows=(await db.query("SELECT session_id,payment_intent_id,recipient,livemode,product_code,product_codes,release_version FROM milo_deliveries WHERE livemode=$1 AND (session_id LIKE 'cs_%' OR session_id LIKE 'audit-order/%') ORDER BY created_at",[process.env.STRIPE_MODE==='live'])).rows;
 const stripe=stripeClient(),store=new CustomerAccounts(db);
 for(const delivery of rows){
  try{
   const cart=delivery.session_id.startsWith('audit-order/')?(await db.query('SELECT * FROM sales_audit_orders WHERE id=$1',[delivery.session_id.slice('audit-order/'.length)])).rows[0]:null;
   const session=await stripe.checkout.sessions.retrieve(cart?.checkout_id??delivery.session_id,{expand:['line_items.data.price.product','payment_intent.latest_charge']});
   if(session.line_items?.has_more)session.line_items=await stripe.checkout.sessions.listLineItems(session.id,{limit:100,expand:['data.price.product']});
   const order=cart?reconcileHistoricalCart(delivery,session,cart):reconcileHistoricalPurchase(delivery,session);verified++;
   if(apply){const adjustments=cart?{subtotal:cart.quote.subtotalCents+cart.quote.savingsCents,discount:cart.quote.savingsCents+cart.quote.creditCents,discounts:[{source:'existing-approved-quote',creditCents:cart.quote.creditCents,savingsCents:cart.quote.savingsCents}]}:undefined;await store.recordPurchase(session,order,delivery.session_id,adjustments);const charge=typeof session.payment_intent==='object'&&session.payment_intent?.latest_charge;if(charge&&typeof charge==='object'&&charge.amount_refunded>0)await store.refund(charge);if(cart?.status==='cancelled')await db.query("UPDATE milo_purchases SET status='cancelled' WHERE session_id=$1",[session.id]);recorded++;}
  }catch{unresolved++;}
 }
 console.log(JSON.stringify({mode:apply?'apply':'dry-run',verified,recorded,unresolved,emailsSent:0,stripeWrites:0}));
 if(unresolved)process.exitCode=1;
}catch{console.error('Purchase reconciliation unavailable. No secrets or customer details logged.');process.exitCode=1;}finally{await db.end();}
