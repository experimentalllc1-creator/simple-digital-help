import "server-only";
import { createHash, createHmac } from "node:crypto";
import type { Pool } from "pg";
import { auditPool } from "./sales-audit-store.server";
import { appOrigin, required } from "./milo-config.server";
import { sendEmail, SUPPORT_EMAIL } from "./email.server";

type Dependencies = { database?: Pick<Pool,"connect"|"query">; send?: typeof sendEmail };
const json=(status:number,message:string)=>Response.json({message},{status,headers:{"Cache-Control":"no-store",...(status===429?{"Retry-After":"3600"}:{})}});
const validEmail=(value:string)=>value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function handlePublicSupport(request:Request,deps:Dependencies={}) {
 if(request.headers.get("origin")!==appOrigin()||request.headers.get("sec-fetch-site")==="cross-site")return json(403,"Please send your message from our Contact & Support page.");
 if(request.headers.get("content-type")?.split(";")[0]!=="application/json")return json(415,"Please use the contact form to send your message.");
 let data:Record<string,unknown>;
 try{
  const reader=request.body?.getReader();if(!reader)return json(400,"Please complete all three fields.");
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>18000){await reader.cancel();return json(413,"Your message is too long. Please use at most 4,000 characters.");}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  const parsed=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes));if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))return json(400,"Please complete all three fields.");data=parsed;
 }catch{return json(400,"Please check your message and try again.");}
 const name=typeof data.name==="string"?data.name.trim():"",email=typeof data.email==="string"?data.email.trim().toLowerCase():"",message=typeof data.message==="string"?data.message.trim():"",id=typeof data.requestId==="string"?data.requestId:"";
 if(!name||name.length>80||/[\r\n\x00-\x1f]/.test(name)||!validEmail(email)||!message||message.length>4000||message.includes("\0")||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))return json(400,"Enter your name, a valid email address, and a message of up to 4,000 characters.");
 const fingerprint=createHash("sha256").update(JSON.stringify([name,email,message])).digest("hex");
 let db:Pick<Pool,"connect"|"query">;
 try{
  db=deps.database??auditPool();
  // Vercel supplies the forwarded client address. Only its keyed hash is persisted.
  const address=request.headers.get("x-forwarded-for")?.split(",")[0].trim()||"unknown";
  const clientHash=createHmac("sha256",required("BETTER_AUTH_SECRET")).update("public-support/"+address).digest("hex");
  const client=await db.connect();let reserved=false;
  try{
   await client.query("BEGIN");
   // A short global reservation lock makes limits and fingerprint deduplication atomic across instances.
   await client.query("SELECT pg_advisory_xact_lock(836421019)");
   const row=(await client.query("SELECT *,created_at>now()-interval '23 hours' AS retryable,updated_at>now()-interval '45 seconds' AS busy FROM milo_public_support_requests WHERE id=$1 FOR UPDATE",[id])).rows[0];
   if(row){
    if(row.fingerprint!==fingerprint)return json(409,"This submission has changed. Refresh the page before sending a new message.");
    if(row.status==="sent")return json(200,"Your message has been sent. We'll get back to you by email.");
    if(!row.retryable||row.attempts>=3)return json(409,"We could not confirm delivery. Please email support@simpledigitalhelp.com directly and mention your earlier submission.");
    if(row.status==="pending"&&row.busy)return json(409,"Your message is still being processed. Please wait a moment before trying again.");
    await client.query("UPDATE milo_public_support_requests SET status='pending',attempts=attempts+1,updated_at=now() WHERE id=$1",[id]);
   }else{
    const duplicate=(await client.query("SELECT status FROM milo_public_support_requests WHERE fingerprint=$1 AND created_at>now()-interval '24 hours' ORDER BY created_at DESC LIMIT 1",[fingerprint])).rows[0];
    if(duplicate)return duplicate.status==="sent"?json(200,"Your message has been sent. We'll get back to you by email."):json(409,"This message was already submitted. Please retry from the original form, or email support@simpledigitalhelp.com if you need help.");
    const count=(await client.query("SELECT count(*)::int AS total,count(*) FILTER(WHERE client_hash=$1)::int AS client FROM milo_public_support_requests WHERE created_at>now()-interval '1 hour'",[clientHash])).rows[0];
    if(count.client>=3||count.total>=30)return json(429,"Please wait before sending another message, or email support@simpledigitalhelp.com directly.");
    await client.query("INSERT INTO milo_public_support_requests(id,fingerprint,client_hash,status) VALUES($1,$2,$3,'pending')",[id,fingerprint,clientHash]);
   }
   await client.query("COMMIT");reserved=true;
  }finally{if(!reserved)await client.query("ROLLBACK").catch(()=>{});client.release();}
  try{
   const result=await (deps.send??sendEmail)({to:SUPPORT_EMAIL,replyTo:email,subject:"Contact & Support — Simple Digital Help",text:`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,idempotencyKey:`public-support/${id}`});
   await db.query("UPDATE milo_public_support_requests SET status='sent',provider_id=$2,updated_at=now() WHERE id=$1",[id,result.id]);
   return json(200,"Your message has been sent. We'll get back to you by email.");
  }catch{
   await db.query("UPDATE milo_public_support_requests SET status='uncertain',updated_at=now() WHERE id=$1 AND status<>'sent'",[id]).catch(()=>{});
   return json(503,"We couldn't confirm delivery. Your message is still here. Try Send Message again to safely retry, or email support@simpledigitalhelp.com.");
  }
 }catch{return json(503,"We couldn't send your message. Your message is still here; please try again or email support@simpledigitalhelp.com.");}
}
