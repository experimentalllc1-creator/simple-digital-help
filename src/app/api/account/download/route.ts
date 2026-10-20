import { accountIdentity } from "@/lib/customer-auth.server";
import { CustomerAccounts, accountsEnabled } from "@/lib/customer-accounts.server";
export const runtime="nodejs";
export async function GET(request:Request){
 const denied=()=>new Response("File unavailable.",{status:404,headers:{"Cache-Control":"private, no-store"}});
 if(!accountsEnabled())return denied();
 try{const customer=await accountIdentity(request.headers);if(!customer)return denied();
  const url=new URL(request.url),kind=url.searchParams.get("kind");if(kind!=="txt"&&kind!=="pdf")return denied();
  const file=await new CustomerAccounts().attachment(customer.id,process.env.STRIPE_MODE==="live",url.searchParams.get("order")??"",url.searchParams.get("product")??"",kind);
  if(!file||!/^[-A-Za-z0-9_. ]+$/.test(file.filename))return denied();
  return new Response(Buffer.from(file.content,"base64"),{headers:{"Content-Type":kind==="pdf"?"application/pdf":"text/plain; charset=utf-8","Content-Disposition":`attachment; filename="${file.filename}"`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"}});
 }catch{return denied();}
}
