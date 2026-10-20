import { accountIdentity } from "@/lib/customer-auth.server";
import { CustomerAccounts, accountsEnabled } from "@/lib/customer-accounts.server";
import { stripeClient } from "@/lib/stripe.server";
export const runtime="nodejs";
export async function GET(request:Request){
 const denied=()=>new Response("Receipt unavailable.",{status:404,headers:{"Cache-Control":"private, no-store"}});
 if(!accountsEnabled())return denied();
 try{const customer=await accountIdentity(request.headers);if(!customer)return denied();const p=await new CustomerAccounts().purchase(customer.id,process.env.STRIPE_MODE==="live",new URL(request.url).searchParams.get("order")??"");if(!p)return denied();
  const intent=await stripeClient().paymentIntents.retrieve(p.payment_intent_id,{expand:["latest_charge"]});const charge=intent.latest_charge;
  if(intent.livemode!==(process.env.STRIPE_MODE==="live")||!charge||typeof charge==="string"||!charge.receipt_url)return denied();
  const url=new URL(charge.receipt_url);if(url.protocol!=="https:"||url.hostname!=="pay.stripe.com")return denied();
  return new Response(null,{status:303,headers:{Location:url.href,"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer"}});
 }catch{return denied();}
}
