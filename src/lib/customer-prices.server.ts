import "server-only";
import type Stripe from "stripe";
import { recommendAssignments } from "./customer-recommendations";
import { stripeClient } from "./stripe.server";
import { paymentConfig, MILO_AMOUNT, MILO_CURRENCY } from "./milo-config.server";
export async function pricedRecommendations(owned:string[],client?:Pick<Stripe,"prices">){
 return (await Promise.all(recommendAssignments(owned).map(async r=>{
  try{const config=paymentConfig(r.slug),price=await (client??stripeClient()).prices.retrieve(config.priceId,{expand:["product"]});const product=price.product;
   if(!price.active||price.type!=="one_time"||price.livemode!==config.livemode||price.unit_amount!==MILO_AMOUNT||price.currency!==MILO_CURRENCY||typeof product==="string"||product.deleted||!product.active||product.id!==config.productId||product.livemode!==config.livemode)return null;
   return {...r,amount:price.unit_amount,currency:price.currency};
  }catch{return null;}
 }))).filter(r=>r!==null);
}
