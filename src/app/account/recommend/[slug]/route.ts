import { randomUUID } from "node:crypto";
import { accountIdentity } from "@/lib/customer-auth.server";
import { CustomerAccounts } from "@/lib/customer-accounts.server";
import { recommendAssignments, RECOMMENDATION_VERSION } from "@/lib/customer-recommendations";
import { auditPool } from "@/lib/sales-audit-store.server";
import { appOrigin } from "@/lib/milo-config.server";
export async function GET(request:Request,{params}:{params:Promise<{slug:string}>}){
 try{const c=await accountIdentity(request.headers);if(!c)return Response.redirect(`${appOrigin()}/account/login`,303);const {slug}=await params,purchases=await new CustomerAccounts().purchases(c.id,process.env.STRIPE_MODE==="live"),owned=purchases.flatMap(p=>p.items.map(i=>i.slug));if(!recommendAssignments(owned).some(r=>r.slug===slug))return new Response("Recommendation unavailable",{status:404});const id=randomUUID();await auditPool().query("INSERT INTO milo_recommendation_clicks(id,customer_id,slug,rule_version) VALUES($1,$2,$3,$4)",[id,c.id,slug,RECOMMENDATION_VERSION]);return new Response(null,{status:303,headers:{Location:`${appOrigin()}/products/${slug}`,"Set-Cookie":`sdh_recommendation=${id}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${appOrigin().startsWith("https:")?"; Secure":""}`,"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer"}});}catch{return new Response("Unable to open recommendation. Explore the Sales catalog.",{status:503});}
}
