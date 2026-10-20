import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { accountIdentity } from "./customer-auth.server";
import { accountsEnabled, CustomerAccounts } from "./customer-accounts.server";
import { pricedRecommendations } from "./customer-prices.server";

export async function requireAccount(){
 if(!accountsEnabled())redirect("/account/login");
 const customer=await accountIdentity(await headers());if(!customer)redirect("/account/login");return customer;
}
export async function dashboardData(){
 const customer=await requireAccount(),purchases=await new CustomerAccounts().purchases(customer.id,process.env.STRIPE_MODE==="live");
 const owned=[...new Set(purchases.flatMap(p=>p.items.map(i=>i.slug)))];
 const recommendations=await pricedRecommendations(owned);
 return {customer,purchases,recommendations};
}
