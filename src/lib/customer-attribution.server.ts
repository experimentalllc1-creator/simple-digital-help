import "server-only";
import { accountsEnabled } from "./customer-accounts.server";
import { accountIdentity } from "./customer-auth.server";
import { auditPool } from "./sales-audit-store.server";
export async function recommendationAttribution(request:Request,slugs:string[]){
 if(!accountsEnabled())return null;
 try{const id=request.headers.get("cookie")?.split(";").map(v=>v.trim()).find(v=>v.startsWith("sdh_recommendation="))?.slice("sdh_recommendation=".length);if(!id||!/^[0-9a-f-]{36}$/.test(id))return null;const c=await accountIdentity(request.headers);if(!c)return null;const result=await auditPool().query("SELECT id,slug FROM milo_recommendation_clicks WHERE id=$1 AND customer_id=$2 AND created_at>now()-interval '30 days'",[id,c.id]);return result.rows[0]&&slugs.includes(result.rows[0].slug)?id:null;}catch{return null;}
}
