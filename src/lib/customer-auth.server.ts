import "server-only";
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins/magic-link";
import { createHash } from "node:crypto";
import { auditPool } from "./sales-audit-store.server";
import { appOrigin, required } from "./milo-config.server";
import { sendEmail } from "./email.server";
import { accountsEnabled, CustomerAccounts } from "./customer-accounts.server";

let instance: ReturnType<typeof createCustomerAuth> | undefined;
export function createCustomerAuth(database = auditPool(), send = sendEmail) {
 const secret = required("BETTER_AUTH_SECRET"); if(secret.length < 32) throw new Error("Authentication secret must have 32 characters");
 return betterAuth({
  appName: "Simple Digital Help", baseURL: appOrigin(), secret, database,
  trustedOrigins: [appOrigin()],
  user: { modelName: "milo_customer_profiles", fields: { emailVerified: "email_verified", createdAt: "created_at", updatedAt: "updated_at" },
   additionalFields: { livemode: {type:"boolean",defaultValue:process.env.STRIPE_MODE==="live",input:false} }, changeEmail: { enabled: false } },
  session: { modelName: "milo_auth_sessions", expiresIn: 60*60*24*30, updateAge: 60*60*24, cookieCache: {enabled:false} },
  account: { modelName: "milo_auth_accounts", accountLinking:{enabled:false} },
  verification: { modelName: "milo_auth_verifications" },
  rateLimit: { enabled:true, storage:"database", modelName:"milo_auth_rate_limits", window:60, max:20,
   customRules: {"/sign-in/magic-link":{window:60,max:3},"/magic-link/verify":{window:60,max:10}} },
  emailAndPassword: {enabled:false},
  advanced: { cookiePrefix:"sdh_account", useSecureCookies:appOrigin().startsWith("https:") },
  logger:{disabled:true},
  databaseHooks: { session: { create: { after: async session => { await new CustomerAccounts(database).register(session.userId,send).catch(()=>{}); } } } },
  plugins: [magicLink({ expiresIn: 60*10, storeToken:"hashed", sendMagicLink: async ({email,url,token}) => {
   await send({to:email,subject:"Your Simple Digital Help sign-in link",text:`Sign in or create your free account:\n${url}\n\nThis private link expires in 10 minutes and can be used once. If you did not request it, ignore this email. Your purchased products are delivered independently of account registration.`,idempotencyKey:`account-login/${createHash("sha256").update(token).digest("hex")}`});
  } })],
 });
}
export function customerAuth() { if(!accountsEnabled())throw new Error("Accounts are not enabled"); return instance ??= createCustomerAuth(); }
export async function accountIdentity(headers: Headers) {
 const session = await customerAuth().api.getSession({headers});
 if(!session?.user.emailVerified)return null;
 const row=(await auditPool().query("SELECT id,email,name,marketing_consent FROM milo_customer_profiles WHERE id=$1 AND email_verified=true AND livemode=$2",[session.user.id,process.env.STRIPE_MODE==="live"])).rows[0];
 return row as {id:string;email:string;name:string;marketing_consent:boolean}|undefined;
}
