import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {handlePublicSupport} from '../src/lib/public-support.server.ts';
import {sendEmail,SUPPORT_EMAIL} from '../src/lib/email.server.ts';
Object.assign(process.env,{NODE_ENV:'test',APP_URL:'http://127.0.0.1:3290',BETTER_AUTH_SECRET:'isolated-public-support-verification-secret',RESEND_API_KEY:'mock-only'});
globalThis.fetch=async()=>{throw Error('Unmocked network forbidden')};
const payload=(overrides={})=>({requestId:randomUUID(),name:'Test Customer',email:'customer@example.test',message:'Please help me find the right installation guide.',...overrides});
const request=(body,headers={})=>new Request(process.env.APP_URL+'/api/support',{method:'POST',headers:{origin:process.env.APP_URL,'content-type':'application/json','x-forwarded-for':'192.0.2.10',...headers},body:typeof body==='string'?body:JSON.stringify(body)});
async function setup(){const db=new PGlite();await db.exec(await readFile('db/migrations/007_public_support.sql','utf8'));const query=async(sql,values)=>sql.startsWith('SELECT pg_advisory_xact_lock')?{rows:[]}:db.query(sql,values);return {db,pool:{query,connect:async()=>({query,release(){}})}};}
test('public form rejects invalid input, cross-origin submissions and oversized requests before accessing storage',async t=>{
 const database={connect:async()=>{throw Error('Must not use storage')},query:async()=>{throw Error('Must not use storage')}};
 for(const [name,body,headers,status] of [
 ['cross origin',payload(),{origin:'https://attacker.example'},403],['missing origin',payload(),{origin:''},403],['fetch metadata',payload(),{'sec-fetch-site':'cross-site'},403],['wrong media type',payload(),{'content-type':'text/plain'},415],['empty name',payload({name:' '}),{},400],['invalid email',payload({email:'not-an-email'}),{},400],['email header injection',payload({email:'customer@example.test\r\nBcc: attacker@example.test'}),{},400],['blank message',payload({message:'  '}),{},400],['long message',payload({message:'a'.repeat(4001)}),{},400],['name injection',payload({name:'Test\r\nInjected'}),{},400],['long name',payload({name:'a'.repeat(81)}),{},400],['invalid id',payload({requestId:'unsafe'}),{},400],['invalid json','{',{},400],['array json','[]',{},400],['oversized body',JSON.stringify(payload({message:'a'.repeat(20000)})),{},413]]){
 await t.test(name,async()=>assert.equal((await handlePublicSupport(request(body,headers),{database})).status,status));
 }
});
test('public support accepts anonymous customers, preserves envelope and deduplicates retries and repeated content',async()=>{
 const {db,pool}=await setup(),sent=[];try{const send=async m=>{sent.push(m);return {id:randomUUID()}},body=payload({email:' Customer@Example.Test '});
 assert.equal((await handlePublicSupport(request(body),{database:pool,send})).status,200);assert.equal(sent.length,1);assert.equal(sent[0].to,SUPPORT_EMAIL);assert.equal(sent[0].replyTo,'customer@example.test');assert.ok(sent[0].text.includes('Test Customer'));assert.ok(sent[0].text.includes(body.message));
 assert.equal((await handlePublicSupport(request(body),{database:pool,send})).status,200);assert.equal((await handlePublicSupport(request({...body,requestId:randomUUID()}),{database:pool,send})).status,200);assert.equal(sent.length,1);
 assert.equal((await handlePublicSupport(request({...body,message:'Different message'}),{database:pool,send})).status,409);
 const row=(await db.query('SELECT * FROM milo_public_support_requests')).rows[0];assert.equal(row.status,'sent');assert.ok(!JSON.stringify(row).includes('customer@example.test'));assert.notEqual(row.client_hash,'192.0.2.10');
 }finally{await db.close();}
});
test('ambiguous provider errors remain failures and safe retry reuses the same provider idempotency key',async()=>{
 const {db,pool}=await setup(),keys=[];try{const body=payload();let failed=true;const send=async m=>{keys.push(m.idempotencyKey);if(failed)throw Error('Provider acceptance unknown');return {id:randomUUID()}};
 const first=await handlePublicSupport(request(body),{database:pool,send});assert.equal(first.status,503);assert.ok((await first.json()).message.includes('still here'));failed=false;
 assert.equal((await handlePublicSupport(request(body),{database:pool,send})).status,200);assert.equal(keys[0],keys[1]);assert.equal((await db.query('SELECT status FROM milo_public_support_requests')).rows[0].status,'sent');
 }finally{await db.close();}
});
test('concurrent duplicate while sending is refused without a second email attempt',async()=>{
 const {db,pool}=await setup();try{const body=payload();let finish,started;const ready=new Promise(r=>started=r),pending=new Promise(r=>finish=r);let count=0;
 const send=async()=>{count++;started();await pending;return {id:randomUUID()}};
 const first=handlePublicSupport(request(body),{database:pool,send});await ready;assert.equal((await handlePublicSupport(request(body),{database:pool,send})).status,409);finish();assert.equal((await first).status,200);assert.equal(count,1);
 }finally{await db.close();}
});
test('durable hourly per-client and global caps stop mail before the provider',async()=>{
 const {db,pool}=await setup();let count=0;try{const send=async()=>{count++;return {id:randomUUID()}};
 for(let i=0;i<3;i++)assert.equal((await handlePublicSupport(request(payload({message:'Question '+i})),{database:pool,send})).status,200);
 assert.equal((await handlePublicSupport(request(payload({message:'Fourth question'})),{database:pool,send})).status,429);assert.equal(count,3);
 for(let i=0;i<27;i++)await db.query("INSERT INTO milo_public_support_requests(id,fingerprint,client_hash,status) VALUES($1,$2,'different','sent')",[randomUUID(),'fixture'+i]);
 assert.equal((await handlePublicSupport(request(payload(),{'x-forwarded-for':'198.51.100.1'}),{database:pool,send})).status,429);assert.equal(count,3);
 }finally{await db.close();}
});
test('old ambiguous submissions never retry beyond provider idempotency retention',async()=>{
 const {db,pool}=await setup();try{const body=payload();assert.equal((await handlePublicSupport(request(body),{database:pool,send:async()=>{throw Error('unknown')}})).status,503);
 await db.query("UPDATE milo_public_support_requests SET created_at=now()-interval '24 hours'");
 assert.equal((await handlePublicSupport(request(body),{database:pool,send:async()=>{throw Error('Must not send')}})).status,409);
 }finally{await db.close();}
});
test('shared Resend sender forwards validated Reply-To without changing From',async()=>{
 const previous=globalThis.fetch;try{globalThis.fetch=async(url,options)=>{const body=JSON.parse(options.body);assert.equal(body.from,SUPPORT_EMAIL);assert.equal(body.reply_to,'customer@example.test');return Response.json({id:randomUUID()})};
 await sendEmail({to:SUPPORT_EMAIL,replyTo:'customer@example.test',subject:'Fixture',text:'Fixture',idempotencyKey:'public-support/fixture'});
 await assert.rejects(sendEmail({to:SUPPORT_EMAIL,replyTo:'customer@example.test\r\nBcc:bad@example.test',subject:'Fixture',text:'Fixture',idempotencyKey:'public-support/fixture'}));
 }finally{globalThis.fetch=previous;}
});
