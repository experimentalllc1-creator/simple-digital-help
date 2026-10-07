import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { FirstContactStore } from '../src/lib/first-contact/store.server.ts';
import { runFirstContact, handleUnsubscribe, unsubscribeToken } from '../src/lib/first-contact/worker.server.ts';
import { FixtureSheets, FixturePublicResearch, MockMailforgeMailbox, fixtureProspect, fixturePages } from '../src/lib/first-contact/fixtures.server.ts';
import { MailforgeFixtureAdapter, mimeMessage } from '../src/lib/first-contact/mailforge.server.ts';

// No dotenv, real database, Google, Mailforge, SMTP, or IMAP connection.
globalThis.fetch = async () => { throw new Error('Network forbidden'); };
const migration = await readFile(new URL('../db/first-contact/001_v1.sql',import.meta.url),'utf8');
const now = new Date('2026-10-05T14:00:00Z');
const secret = 'fixture-only-unsubscribe-secret-32-characters';
const approved = {subject:'Business introduction',body:'Advertisement: Our business can help your roofing business.',
  signature:'Fixture Customer Business\n123 Fixture Street, Miami, FL 33101',optOut:'Unsubscribe: {{unsubscribe_url}} or reply STOP.'};
async function setup(t,rows=[fixtureProspect()]) {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(migration);
  const store = new FirstContactStore(db);
  await store.activate({id:'customer',timezone:'America/New_York',mailbox:'owner@customer.example.test',sheetId:'fixture-sheet',message:approved,now,setupVerified:true});
  const sheets = new FixtureSheets(rows), mailbox = new MockMailforgeMailbox();
  const alerts=[];
  const deps={store,sheets,mailbox,research:new FixturePublicResearch(fixturePages(rows)),unsubscribeSecret:secret,
    unsubscribeOrigin:'https://fixture.example.test',alert:reason=>alerts.push(reason)};
  return {db,store,sheets,mailbox,deps,alerts,run:date=>runFirstContact('customer',deps,date ?? now)};
}
async function statuses(db) { return (await db.query('SELECT status FROM fc_sends ORDER BY reserved_at,id')).rows.map(r=>r.status); }

test('first contact: confirmed success preserves exact approval and marks sheet', async t=>{
  const f=await setup(t);
  assert.equal((await f.run()).sent,1);
  assert.deepEqual(await statuses(f.db),['accepted']);
  assert.equal(f.sheets.rows[0].contacted,'Yes');
  assert.equal(f.mailbox.messages[0].subject,approved.subject);
  assert.ok(f.mailbox.messages[0].text.startsWith(`${approved.body}\n\n${approved.signature}`));
  assert.equal((await f.run()).sent,0);
  assert.equal(f.mailbox.messages.length,1);
});
test('missing public email writes one Needs Attention exception without sending',async t=>{
  const f=await setup(t); f.deps.research=new FixturePublicResearch([]);
  await f.run(); await f.run();
  assert.equal(f.mailbox.messages.length,0); assert.equal(f.sheets.rows[0].contacted,'No');
  assert.equal(f.sheets.needsAttention.size,1);
  assert.equal((await f.db.query('SELECT * FROM fc_exceptions')).rows[0].issue,'no-public-business-email');
});
test('cross-region duplicate and manual No reset never send twice',async t=>{
  const p=fixtureProspect(); const f=await setup(t,[p,{...p,region:'Texas',website:p.website.replace('https://','https://www.')}]);
  await f.run(); for(const row of f.sheets.rows) row.contacted='No';
  await f.run(); assert.equal(f.mailbox.messages.length,1);
});
test('same recipient at different businesses is reserved once',async t=>{
  const rows=[fixtureProspect(1),fixtureProspect(2)]; const f=await setup(t,rows);
  f.deps.research=new FixturePublicResearch(rows.map(p=>({url:p.website,public:true,html:'<a href="mailto:info@shared.example.test">Contact</a>'})));
  await f.run(); assert.equal(f.mailbox.messages.length,1);
});
test('confirmed send with sheet failure retries only the sheet update',async t=>{
  const f=await setup(t);f.sheets.failUpdate=true;
  assert.equal((await f.run()).status,'sheet-pending');
  assert.deepEqual(await statuses(f.db),['accepted']);assert.equal(f.sheets.rows[0].contacted,'No');
  assert.equal(f.sheets.needsAttention.size,1);
  f.sheets.failUpdate=false; await f.run();
  assert.equal(f.mailbox.messages.length,1);assert.equal(f.sheets.rows[0].contacted,'Yes');
});
test('ambiguous SMTP outcome remains blocked across subsequent runs',async t=>{
  const f=await setup(t);f.mailbox.outcome={kind:'unknown'};
  await f.run();await f.run();assert.deepEqual(await statuses(f.db),['unknown']);
  assert.equal(f.sheets.rows[0].contacted,'No');assert.equal(f.mailbox.messages.length,1);
  assert.ok([...f.sheets.needsAttention.values()].some(r=>r[6]==='uncertain-send'));
});
test('explicit SMTP rejection does not mark Contacted and does not auto retry',async t=>{
  const f=await setup(t);f.mailbox.outcome={kind:'rejected',code:550};
  await f.run();await f.run();assert.deepEqual(await statuses(f.db),['rejected']);
  assert.equal(f.sheets.rows[0].contacted,'No');assert.equal(f.mailbox.messages.length,1);
});
test('hard bounce retains Yes and suppresses business and recipient',async t=>{
  const f=await setup(t);await f.run();
  f.mailbox.events=[{id:'bounce',type:'hard-bounce',messageId:f.mailbox.messages[0].messageId}];
  await f.run();await f.run();assert.equal(f.sheets.rows[0].contacted,'Yes');
  assert.equal((await f.db.query('SELECT * FROM fc_suppressions')).rows.length,2);
  assert.equal((await f.db.query('SELECT * FROM fc_mail_events')).rows.length,1);
  assert.equal(f.mailbox.messages.length,1);
});
test('reply opt-out suppresses future contact without sending a reply',async t=>{
  const f=await setup(t);await f.run();
  f.mailbox.events=[{id:'reply',type:'reply',recipient:f.mailbox.messages[0].to,text:'Please stop.'}];
  await f.run();assert.equal((await f.db.query('SELECT * FROM fc_suppressions')).rows.length,2);
  assert.equal(f.mailbox.messages.length,1);
});
test('unsubscribe POST validates signed link; GET and forged token do not suppress',async t=>{
  const f=await setup(t);await f.run();
  const send=(await f.db.query('SELECT id FROM fc_sends')).rows[0];
  const url=`https://fixture.example.test/first-contact/unsubscribe?token=${unsubscribeToken('customer',send.id,secret)}`;
  assert.equal((await handleUnsubscribe(new Request(url),f.store,secret,now)).status,200);
  assert.equal((await f.db.query('SELECT * FROM fc_suppressions')).rows.length,0);
  assert.equal((await handleUnsubscribe(new Request(`${url}bad`,{method:'POST'}),f.store,secret,now)).status,503);
  assert.equal((await handleUnsubscribe(new Request(url,{method:'POST'}),f.store,secret,now)).status,200);
  assert.equal((await handleUnsubscribe(new Request(url,{method:'POST'}),f.store,secret,now)).status,200);
  await f.run();assert.equal(f.mailbox.messages.length,1);
});
test('five-send cap is durable across concurrent runs and permits next weekday',async t=>{
  const f=await setup(t,Array.from({length:8},(_,i)=>fixtureProspect(i+1)));
  await Promise.all([f.run(),f.run()]);await f.run();
  assert.equal(f.mailbox.messages.length,5);
  assert.equal((await f.db.query('SELECT reserved_count FROM fc_daily_usage')).rows[0].reserved_count,5);
  await f.run(new Date('2026-10-06T14:00:00Z'));assert.equal(f.mailbox.messages.length,8);
});
test('service expiry prevents sending and never resets activation',async t=>{
  const f=await setup(t);
  const c=await f.store.customer('customer');
  assert.equal(new Date(c.expires_at)-new Date(c.activated_at),364*86400000);
  assert.equal((await f.run(new Date(c.expires_at))).status,'inactive');assert.equal(f.mailbox.messages.length,0);
});
test('mailbox monitoring failure persists pause and attention',async t=>{
  const f=await setup(t);f.mailbox.failMonitor=true;
  assert.equal((await f.run()).status,'paused');assert.equal(f.mailbox.messages.length,0);
  assert.equal((await f.store.customer('customer')).paused,true);assert.equal(f.sheets.needsAttention.size,1);
  f.mailbox.failMonitor=false;await f.run();assert.equal(f.mailbox.messages.length,0);
});
test('database failure fails closed and alerts without credentials',async t=>{
  const f=await setup(t);f.deps.store=new FirstContactStore({query:async()=>{throw new Error('secret database credentials');}});
  assert.equal((await f.run()).status,'paused');assert.equal(f.mailbox.messages.length,0);
  assert.ok(f.alerts.length);assert.ok(!f.alerts.join().includes('secret'));
});
test('crash after SMTP acceptance but before ledger persistence never retries send',async t=>{
  const f=await setup(t);const original=f.store.outcome.bind(f.store);
  f.store.outcome=async()=>{throw new Error('Database failure after sending');};
  await f.run();assert.deepEqual(await statuses(f.db),['sending']);assert.equal(f.sheets.rows[0].contacted,'No');
  f.store.outcome=original;
  await f.db.query('UPDATE fc_customers SET paused=false');
  await f.run(new Date(now.getTime()+6*60000));assert.deepEqual(await statuses(f.db),['unknown']);
  assert.equal(f.mailbox.messages.length,1);
});
test('weekends, edited approval, and nonfixture adapters cannot send',async t=>{
  const f=await setup(t);
  assert.equal((await f.run(new Date('2026-10-10T14:00:00Z'))).status,'weekend');
  await f.db.query(`UPDATE fc_customers SET message=jsonb_set(message,'{subject}','"Changed"')`);
  assert.equal((await f.run()).status,'paused');assert.equal(f.mailbox.messages.length,0);
  f.deps.mailbox={...f.mailbox,mode:'live'};
  await assert.rejects(f.run(),/Only fixture/);
});
test('private pages and personal accounts are not contact sources',async t=>{
  const f=await setup(t);
  f.deps.research=new FixturePublicResearch([
    {url:f.sheets.rows[0].website,html:'<a href="mailto:info@private.example.test">Contact</a>',public:false},
    {url:f.sheets.rows[0].website,html:'<a href="mailto:henry@gmail.com">Personal</a>',public:true}]);
  await f.run();assert.equal(f.mailbox.messages.length,0);assert.equal(f.sheets.needsAttention.size,1);
});
test('ledger survives database close/reopen',async t=>{
  const dir=await mkdtemp(path.join(tmpdir(),'fc-ledger-'));
  t.after(()=>rm(dir,{recursive:true,force:true}));
  let db=new PGlite(dir);await db.exec(migration);
  let store=new FirstContactStore(db);
  await store.activate({id:'persisted',timezone:'America/New_York',mailbox:'owner@customer.example.test',sheetId:'fixture',message:approved,now,setupVerified:true});
  const p=fixtureProspect();const sheets=new FixtureSheets([p]);const mailbox=new MockMailforgeMailbox();
  const deps={store,sheets,mailbox,research:new FixturePublicResearch(fixturePages([p])),unsubscribeSecret:secret,unsubscribeOrigin:'https://fixture.example.test',alert:()=>{}};
  await runFirstContact('persisted',deps,now);await db.close();
  db=new PGlite(dir);t.after(()=>db.close());store=new FirstContactStore(db);
  sheets.rows[0].contacted='No';await runFirstContact('persisted',{...deps,store},now);
  assert.equal(mailbox.messages.length,1);assert.deepEqual(await statuses(db),['accepted']);
});
test('SMTP adapter requires final DATA acceptance and never retries timeouts',async()=>{
  const message={from:'owner@customer.example.test',to:'info@roof.example.test',subject:'Approved subject',messageId:'<fixture@customer.example.test>',text:'Approved body\nUnsubscribe: https://fixture.example.test/first-contact/unsubscribe?token=abc.def'};
  let calls=0,receipt={finalDataResponse:false,code:250,response:'Intermediate response'};
  const driver={mode:'fixture',submit:async input=>{calls++;assert.ok(input.mime.includes('List-Unsubscribe-Post:'));return receipt;},poll:async()=>[]};
  const adapter=new MailforgeFixtureAdapter(driver);
  assert.equal((await adapter.send(message)).kind,'unknown');
  receipt={finalDataResponse:true,code:250,response:'250 queued fixture-123'};
  assert.equal((await adapter.send(message)).kind,'accepted');
  receipt={finalDataResponse:true,code:550,response:'550 rejected'};
  assert.equal((await adapter.send(message)).kind,'rejected');
  driver.submit=async()=>{calls++;throw new Error('timeout after DATA');};
  assert.equal((await adapter.send(message)).kind,'unknown');assert.equal(calls,4);
  assert.throws(()=>mimeMessage({...message,subject:'Injected\r\nBcc: somebody'}),/Unsafe/);
});
test('IMAP adapter correlates DSNs and ignores automatic replies',async()=>{
  const adapter=new MailforgeFixtureAdapter({mode:'fixture',submit:async()=>({code:250,response:'ok',finalDataResponse:true}),poll:async()=>[
    {uid:1,uidValidity:'validity',from:'mailer-daemon@example.test',text:'',deliveryStatus:{action:'failed',originalMessageId:'<send@customer.example.test>',recipient:'info@roof.example.test'}},
    {uid:2,uidValidity:'validity',from:'info@roof.example.test',text:'STOP',inReplyTo:'<send@customer.example.test>'},
    {uid:3,uidValidity:'validity',from:'info@roof.example.test',text:'Out of office',autoSubmitted:true}]});
  const events=await adapter.monitor();assert.equal(events.length,2);assert.equal(events[0].type,'hard-bounce');
  assert.equal(events[0].id,'validity:1');assert.equal(events[1].type,'reply');
});
test('historical Yes is imported durably and malformed headers pause sending',async t=>{
  const f=await setup(t,[{...fixtureProspect(),contacted:'Yes'}]);await f.run();
  f.sheets.rows[0].contacted='No';await f.run();assert.equal(f.mailbox.messages.length,0);
  f.sheets.prospectHeaders.reverse();assert.equal((await f.run()).status,'paused');assert.equal(f.mailbox.messages.length,0);
});
test('same business with a different domain cannot receive a second first contact',async t=>{
  const p=fixtureProspect();const f=await setup(t,[p,{...p,website:'https://newdomain.example.test',region:'Texas'}]);
  await f.run();assert.equal(f.mailbox.messages.length,1);
});
test('soft bounce flags without creating another submission',async t=>{
  const f=await setup(t);await f.run();
  f.mailbox.events=[{id:'soft',type:'soft-bounce',messageId:f.mailbox.messages[0].messageId}];
  await f.run();assert.equal(f.mailbox.messages.length,1);assert.equal(f.sheets.rows[0].contacted,'Yes');
  assert.ok([...f.sheets.needsAttention.values()].some(row=>row[6]==='soft-bounce'));
});
test('at-cap runs skip research and future activation does not send',async t=>{
  const f=await setup(t,Array.from({length:6},(_,i)=>fixtureProspect(i+1)));
  await f.run();let researchCalls=0;
  f.deps.research={mode:'fixture',find:async()=>{researchCalls++;throw new Error('Should not research');}};
  assert.equal((await f.run()).status,'daily-cap');assert.equal(researchCalls,0);
  assert.equal((await f.run(new Date('2026-10-05T13:59:00Z'))).status,'inactive');
  assert.equal(f.mailbox.messages.length,5);
});
test('protocol-level SMTP/IMAP adapter works through the complete worker',async t=>{
  const f=await setup(t);let submissions=0;
  const driver={mode:'fixture',submit:async({mime})=>{submissions++;assert.ok(mime.includes('Message-ID:'));return {finalDataResponse:true,code:250,response:'250 queued fixture-e2e'};},poll:async()=>[]};
  f.deps.mailbox=new MailforgeFixtureAdapter(driver);
  assert.equal((await f.run()).sent,1);assert.equal(f.sheets.rows[0].contacted,'Yes');
  const messageId=(await f.db.query('SELECT message_id FROM fc_sends')).rows[0].message_id;
  driver.poll=async()=>[{uid:1,uidValidity:'fixture',from:'info@roofer1.example.test',text:'Please stop.',inReplyTo:messageId}];
  await f.run();assert.equal((await f.db.query('SELECT * FROM fc_suppressions')).rows.length,2);
  assert.equal(submissions,1);
});
