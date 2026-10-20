import { accountsEnabled } from "@/lib/customer-accounts.server";
import { stripeClient } from "@/lib/stripe.server";
import { sessionAssignments, verifiedOrder } from "@/lib/milo-fulfillment.server";
import { paymentConfig } from "@/lib/milo-config.server";
export const runtime="nodejs";
export async function GET(request:Request){
 const no=()=>Response.json({},{status:404,headers:{"Cache-Control":"no-store","Referrer-Policy":"no-referrer"}});
 if(!accountsEnabled())return no();const id=new URL(request.url).searchParams.get("session_id")??"";if(!/^cs_(test_|live_)?[A-Za-z0-9]{16,200}$/.test(id))return no();
 try{const stripe=stripeClient(),session=await stripe.checkout.sessions.retrieve(id,{expand:["line_items.data.price.product","payment_intent"]});if(session.line_items?.has_more)session.line_items=await stripe.checkout.sessions.listLineItems(id,{limit:100,expand:["data.price.product"]});const order=verifiedOrder(session,sessionAssignments(session.metadata).map(a=>paymentConfig(a.slug)));if(!order)return no();return Response.json({email:order.email},{headers:{"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer"}});}catch{return no();}
}
