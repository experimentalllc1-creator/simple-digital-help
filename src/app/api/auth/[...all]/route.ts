import { customerAuth } from "@/lib/customer-auth.server";
import { accountsEnabled } from "@/lib/customer-accounts.server";
export const runtime="nodejs";
async function handle(request: Request) {
 if(!accountsEnabled())return Response.json({error:"Accounts are not available yet."},{status:503});
 try {const result=await customerAuth().handler(request);result.headers.set("Cache-Control","no-store");result.headers.set("Referrer-Policy","no-referrer");return result;}
 catch{return Response.json({error:"Sign-in is temporarily unavailable. Please request a new link shortly."},{status:503,headers:{"Cache-Control":"no-store"}});}
}
export {handle as GET,handle as POST};
