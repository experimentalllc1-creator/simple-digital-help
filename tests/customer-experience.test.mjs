import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {recommendAssignments} from '../src/lib/customer-recommendations.ts';
import {miloAssignments} from '../src/lib/milo-assignments.ts';
import {CustomerAccounts} from '../src/lib/customer-accounts.server.ts';
Object.assign(process.env,{NODE_ENV:'test',APP_URL:'http://127.0.0.1:3100',BETTER_AUTH_SECRET:'isolated-customer-experience-secret-2026'});
test('Florida roofing and distributors owners receive only complementary Florida or nationwide assignments',()=>{
 const owned=['milo-florida-roofing-contractors','milo-florida-distributors'];
 const r=recommendAssignments(owned);
 assert.ok(r.length>=4);assert.ok(r.every(a=>!owned.includes(a.slug)&&['florida','united-states'].includes(a.regionId)));
 for(const agent of ['architects','general-contractors','building-materials-manufacturers','builders'])assert.ok(r.some(a=>a.agentId===agent),agent);
 assert.ok(r.slice(0,2).every(a=>a.regionId==='florida'));
 for(const source of miloAssignments){const rec=recommendAssignments([source.slug],999);assert.ok(rec.every(a=>a.slug!==source.slug&&[source.regionId,'united-states'].includes(a.regionId)),source.slug);}
 const multi=recommendAssignments(['milo-florida-roofing-contractors','milo-texas-roofing-contractors'],999);assert.ok(multi.some(a=>a.regionId==='texas'));assert.ok(multi.every(a=>['florida','texas','united-states'].includes(a.regionId)));
});
test('single opt-in sends one confirmation on transition and retains audited consent if email fails',async()=>{
 const db=new PGlite();try{
 for(const file of ['001_milo_deliveries.sql','002_milo_identity.sql','003_milo_product_codes.sql','004_sales_audit.sql','005_milo_storefront_pricing.sql','006_customer_accounts.sql'])await db.exec(await readFile('db/migrations/'+file,'utf8'));
 const id=randomUUID();await db.query('INSERT INTO milo_customer_profiles(id,email,livemode) VALUES($1,$2,false)',[id,'consent@example.test']);
 const store=new CustomerAccounts(db),sent=[];const send=async m=>{sent.push(m);return {id:randomUUID()}};
 assert.equal(await store.consent(id,true,'account-preferences',send),'confirmed');
 assert.equal(await store.consent(id,true,'account-preferences',send),'saved');assert.equal(sent.length,1);
 assert.ok(sent[0].text.includes('/account/unsubscribe?token='));
 assert.equal(await store.consent(id,false,'email-unsubscribe',send),'saved');assert.equal(sent.length,1);
 assert.equal(await store.consent(id,true,'account-preferences',async()=>{throw Error('mock mail failure')}),'email-unconfirmed');
 assert.equal((await db.query('SELECT marketing_consent FROM milo_customer_profiles WHERE id=$1',[id])).rows[0].marketing_consent,true);
 const events=(await db.query('SELECT * FROM milo_consent_events WHERE customer_id=$1',[id])).rows;assert.equal(events.length,3);assert.ok(events.every(e=>e.recorded_at&&e.wording_version&&e.source&&e.wording));
 }finally{await db.close();}
});
