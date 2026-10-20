import {readFile,writeFile} from 'node:fs/promises';
import pg from 'pg';
if(process.env.STRIPE_MODE!=='test'||new URL(process.env.DATABASE_URL).pathname!=='/sdh_accounts_staging_20261020')throw Error('Isolated staging configuration required');
const db=new pg.Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:10000});
try{
 await db.connect();const result={
  profiles:(await db.query('SELECT count(*)::int AS customers,count(*) FILTER (WHERE email_verified)::int AS verified,count(*) FILTER (WHERE registered_at IS NOT NULL)::int AS registered,count(*) FILTER (WHERE marketing_consent)::int AS marketing_enabled FROM milo_customer_profiles')).rows[0],
  purchases:(await db.query('SELECT livemode,count(*)::int AS purchases FROM milo_purchases GROUP BY livemode')).rows,
  consentEvents:(await db.query('SELECT granted,source,wording_version FROM milo_consent_events ORDER BY recorded_at')).rows,
  emailedInvitations:(await db.query('SELECT count(*) FILTER(WHERE permission_invited_at IS NOT NULL)::int AS invitation_claims FROM milo_customer_profiles')).rows[0],
 };
 const email=JSON.parse(await readFile('.qa/owner-email-check.json','utf8'));
 const response=await fetch('https://api.resend.com/emails/'+email.messageId,{headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY},signal:AbortSignal.timeout(10000)});
 result.ownerEmail={accepted:email.accepted,toVerifiedOwner:email.toVerifiedOwner,deliveryEvent:response.ok?(await response.json()).last_event:'unavailable'};
 await writeFile('.qa/customer-staging-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await db.end();}
