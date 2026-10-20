import "server-only";
import type Stripe from "stripe";
import { verifiedOrder, sessionAssignments } from "./milo-fulfillment.server";
import { paymentConfig } from "./milo-config.server";
import type { PaidOrder } from "./milo-store.server";
import { miloAssignments } from "./milo-assignments";

export type HistoricalDelivery={session_id:string;payment_intent_id:string;recipient:string;livemode:boolean;product_code:string;product_codes:string[]|null;release_version:string};
// A delivery email alone is not proof of payment. Re-check the original Stripe order and exact identity.
export function reconcileHistoricalPurchase(delivery:HistoricalDelivery,session:Stripe.Checkout.Session):PaidOrder{
 const order=verifiedOrder(session,sessionAssignments(session.metadata).map(a=>paymentConfig(a.slug)));
 if(!order||order.sessionId!==delivery.session_id||order.paymentIntentId!==delivery.payment_intent_id||order.livemode!==delivery.livemode||order.email.trim().toLowerCase()!==delivery.recipient.trim().toLowerCase()||order.releaseVersion!==delivery.release_version||JSON.stringify(order.productCodes??[order.productCode])!==JSON.stringify(delivery.product_codes??[delivery.product_code]))throw new Error("Historical payment and delivery require manual reconciliation");
 return order;
}
export function reconcileHistoricalCart(delivery:HistoricalDelivery,session:Stripe.Checkout.Session,cart:{id:string;checkout_id:string;payment_intent_id:string;email:string;livemode:boolean;products:string[];quote:{totalCents:number;subtotalCents:number;savingsCents:number;creditCents:number;lines:{amountCents:number}[]}}):PaidOrder{
 const intent=session.payment_intent,zero=cart.quote.totalCents===0;
 const assignments=cart.products.map(slug=>{const a=miloAssignments.find(a=>a.slug===slug);if(!a)throw new Error("Unknown historical assignment");return a;});
 const codes=assignments.map(a=>a.productCode),email=session.customer_details?.email?.trim().toLowerCase();
 if(delivery.session_id!==`audit-order/${cart.id}`||cart.checkout_id!==session.id||session.metadata?.order_id!==cart.id||session.mode!=="payment"||session.status!=="complete"||session.livemode!==cart.livemode||cart.livemode!==delivery.livemode||session.currency!=="usd"||session.amount_total!==cart.quote.totalCents||session.amount_subtotal!==cart.quote.totalCents||email!==cart.email||email!==delivery.recipient.trim().toLowerCase()||session.metadata?.release_version!==delivery.release_version||JSON.stringify(codes)!==JSON.stringify(delivery.product_codes??[delivery.product_code]))throw new Error("Historical cart identity mismatch");
 if(zero ? !["paid","no_payment_required"].includes(session.payment_status) : session.payment_status!=="paid"||!intent||typeof intent==="string"||intent.status!=="succeeded"||intent.id!==delivery.payment_intent_id||intent.id!==cart.payment_intent_id||intent.amount_received!==cart.quote.totalCents||intent.currency!=="usd"||intent.livemode!==cart.livemode)throw new Error("Historical cart payment mismatch");
 const lines=session.line_items;if(!lines||lines.has_more||lines.data.length!==assignments.length)throw new Error("Incomplete historical cart lines");
 const expected=assignments.map((a,i)=>({id:paymentConfig(a.slug).productId,amount:cart.quote.lines[i].amountCents})),seen=new Set<string>();
 for(const line of lines.data){const price=line.price,id=typeof price?.product==="string"?price.product:price?.product.id,match=expected.find(e=>e.id===id);if(!price||!id||seen.has(id)||!match||line.quantity!==1||line.amount_total!==match.amount||line.amount_subtotal!==match.amount||price.unit_amount!==match.amount||price.currency!=="usd"||price.livemode!==cart.livemode||price.type!=="one_time")throw new Error("Historical cart product mismatch");seen.add(id);}
 return {sessionId:session.id,paymentIntentId:zero?`zero/${session.id}`:cart.payment_intent_id,email:cart.email,livemode:cart.livemode,productCode:codes[0],productCodes:codes,releaseVersion:delivery.release_version};
}
