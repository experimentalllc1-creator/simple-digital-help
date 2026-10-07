// Isolated only: no dotenv, DATABASE_URL, credentials, production migrations or sockets.
import { PGlite } from '@electric-sql/pglite';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { FirstContactStore } from '../src/lib/first-contact/store.server.ts';
import { runFirstContact, handleUnsubscribe, unsubscribeToken } from '../src/lib/first-contact/worker.server.ts';
import { FixtureSheets, FixturePublicResearch, MockMailforgeMailbox, fixtureProspect, fixturePages } from '../src/lib/first-contact/fixtures.server.ts';
globalThis.fetch=async()=>{throw new Error('Network disabled in fixture runner');};
if(process.argv.length>2) throw new Error('This runner accepts no credentials or production parameters');
const directory=await mkdtemp(path.join(tmpdir(),'first-contact-fixture-'));
const db=new PGlite(directory);
try {
  await db.exec(await readFile(new URL('../db/first-contact/001_v1.sql',import.meta.url),'utf8'));
  const store=new FirstContactStore(db);
  const now=new Date('2026-10-05T14:00:00Z');
  await store.activate({id:'fixture-customer',timezone:'America/New_York',mailbox:'owner@customer.example.test',sheetId:'fixture-sales-prospects',now,setupVerified:true,
    message:{subject:'Business introduction',body:'Advertisement: Fixture business introduction.',signature:'Fixture Business\n123 Fixture Street, Miami, FL 33101',optOut:'Unsubscribe: {{unsubscribe_url}} or reply STOP.'}});
  const rows=[fixtureProspect(1),fixtureProspect(2)];
  const sheets=new FixtureSheets(rows),mailbox=new MockMailforgeMailbox();
  const secret='fixture-unsubscribe-secret-at-least-32-characters';
  const deps={store,sheets,mailbox,research:new FixturePublicResearch(fixturePages([rows[0]])),unsubscribeSecret:secret,unsubscribeOrigin:'https://fixture.example.test',alert:reason=>console.log(`Fixture alert: ${reason}`)};
  sheets.failUpdate=true;
  const first=await runFirstContact('fixture-customer',deps,now);
  sheets.failUpdate=false;
  const repaired=await runFirstContact('fixture-customer',deps,now);
  const send=(await db.query('SELECT id FROM fc_sends')).rows[0];
  const token=unsubscribeToken('fixture-customer',send.id,secret);
  await handleUnsubscribe(new Request(`https://fixture.example.test/first-contact/unsubscribe?token=${token}`,{method:'POST'}),store,secret,now);
  await runFirstContact('fixture-customer',deps,now);
  assert.equal(mailbox.messages.length,1);assert.equal(sheets.rows[0].contacted,'Yes');assert.equal(sheets.rows[1].contacted,'No');
  console.log(JSON.stringify({mode:'fixture-only',first,repaired,smtpSubmissions:mailbox.messages.length,
    ledger:(await db.query('SELECT status,sheet_synced FROM fc_sends')).rows,
    contacted:sheets.rows.map(p=>p.contacted),needsAttention:sheets.needsAttention.size,
    suppressions:(await db.query('SELECT count(*)::int AS n FROM fc_suppressions')).rows[0].n},null,2));
} finally {await db.close();await rm(directory,{recursive:true,force:true});}
