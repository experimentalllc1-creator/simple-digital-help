import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { approvalHash, businessKey, emailKey, FirstContactStore } from './store.server';
import type { Customer, Mailbox, Outbound, Prospect, PublicResearch, Sheets } from './types';

const US_REGIONS = new Set(['Florida','Texas','California','Northeast','Southeast','Midwest','Southwest','Mountain West','Pacific Northwest']);
export type Dependencies = { store: FirstContactStore; sheets: Sheets; mailbox: Mailbox; research: PublicResearch;
  unsubscribeSecret: string; unsubscribeOrigin: string; alert: (reason: string) => void };
function secretCheck(secret: string) { if (secret.length < 32) throw new Error('Unsubscribe secret too short'); }
export function unsubscribeToken(customer: string, send: string, secret: string) {
  secretCheck(secret);
  const payload = Buffer.from(JSON.stringify([customer,send])).toString('base64url');
  return `${payload}.${createHmac('sha256',secret).update(payload).digest('base64url')}`;
}
export async function handleUnsubscribe(request: Request, store: FirstContactStore, secret: string, now: Date) {
  // GET is a confirmation step, so link scanners do not create accidental opt-outs.
  if (request.method === 'GET') return new Response('Confirm unsubscribe by submitting this link with POST.', { status: 200 });
  if (request.method !== 'POST') return new Response(null, { status: 405 });
  const token = new URL(request.url).searchParams.get('token') ?? '';
  if (token.length > 1024) return new Response(null,{status:400});
  try {
    secretCheck(secret);
    const [payload,sig,...extra] = token.split('.');
    if (extra.length || !payload || !sig) throw new Error('Bad token');
    const expected = createHmac('sha256',secret).update(payload).digest();
    const actual = Buffer.from(sig,'base64url');
    if (actual.length !== expected.length || !timingSafeEqual(actual,expected)) throw new Error('Bad token');
    const parsed: unknown = JSON.parse(Buffer.from(payload,'base64url').toString());
    if (!Array.isArray(parsed) || parsed.length !== 2 || parsed.some(x => typeof x !== 'string')) throw new Error('Bad token');
    const [customer,id] = parsed as [string,string];
    await store.suppressSend(customer,id,'unsubscribe',now);
    return new Response('Unsubscribed.',{status:200});
  } catch { return new Response('Unable to process request.',{status:503}); }
}

async function syncSheets(c: Customer, deps: Dependencies, now: Date) {
  let healthy = true;
  for (const row of await deps.store.unsynced(c.id)) {
    const p = row.prospect as Prospect;
    try {
      await deps.sheets.markContacted(p);
      if (!await deps.sheets.verifyContacted(p)) throw new Error('Read-back failed');
      await deps.store.synced(String(row.id));
      await deps.store.resolve(c.id,p,'confirmed-send-sheet-update-failed');
    } catch {
      healthy = false;
      await deps.store.flag(c.id,p,'confirmed-send-sheet-update-failed',now);
    }
  }
  for (const row of await deps.store.exceptions(c.id)) {
    try {
      await deps.sheets.attention(`${c.id}:${row.business_key}:${row.issue}`,row.prospect as Prospect,String(row.issue),String(row.flagged_at),Boolean(row.resolved));
      await deps.store.exceptionSynced(c.id,String(row.business_key),String(row.issue));
    } catch { healthy = false; deps.alert('Needs Attention update pending'); }
  }
  return healthy;
}

function optOut(text: string) {
  // Ignore quoted outbound text, which itself contains an unsubscribe invitation.
  const current = text.split(/\n(?:On .+wrote:|From:|>)/i)[0];
  return /\b(stop|unsubscribe|opt[ -]?out|remove me|do not (?:email|contact|send)|don't (?:email|contact|send)|not interested|no thanks)\b/i.test(current.trim());
}
async function monitor(c: Customer, deps: Dependencies, now: Date) {
  for (const event of await deps.mailbox.monitor()) await deps.store.ingest(c.id,event);
  for (const row of await deps.store.pendingEvents(c.id)) {
    const event = row.event as Parameters<FirstContactStore['ingest']>[1];
    const send = await deps.store.matchingSend(c.id,event);
    const requiresAction = event.type !== 'reply' || optOut(event.text ?? '');
    if (!send && requiresAction) throw new Error('Uncorrelated mailbox event requires review');
    if (send) {
      if (event.type === 'hard-bounce' || event.type === 'failure' || (event.type === 'reply' && requiresAction)) {
        await deps.store.suppressSend(c.id,String(send.id),event.type === 'reply' ? 'reply-opt-out' : event.type,now);
      } else if (event.type === 'soft-bounce') {
        await deps.store.flag(c.id,send.prospect as Prospect,'soft-bounce',now);
      }
    }
    await deps.store.processed(c.id,String(row.event_id),now);
  }
}

export async function runFirstContact(customerId: string, deps: Dependencies, now = new Date()) {
  let sent = 0, attempted = 0;
  // This implementation cannot be switched to live mode with an environment flag.
  if ([deps.sheets.mode,deps.mailbox.mode,deps.research.mode].some(mode => mode !== 'fixture')) throw new Error('Only fixture adapters are enabled');
  try {
    secretCheck(deps.unsubscribeSecret);
    const origin = new URL(deps.unsubscribeOrigin);
    if (origin.protocol !== 'https:' && origin.hostname !== '127.0.0.1') throw new Error('Invalid unsubscribe origin');
    const c = await deps.store.customer(customerId);
    if (approvalHash(c.message) !== c.approval_hash) throw new Error('Approved message changed');
    try { await monitor(c,deps,now); } catch {
      await deps.store.pause(c.id,'mailbox-monitoring-failed');
      await deps.store.flag(c.id,{dateAdded:'',businessName:'Sending mailbox',city:'',region:'US',customerType:'Mailbox',website:'',contacted:'No'},'mailbox-monitoring-failed',now);
      await syncSheets(c,deps,now);
      deps.alert('Mailbox monitoring failed; sending paused');
      return { status: 'paused', sent, attempted };
    }
    await deps.store.recover(c.id,now);
    if (!await syncSheets(c,deps,now)) return {status:'sheet-pending',sent,attempted};
    if (c.paused) return {status:'paused',sent,attempted};
    if (now < new Date(c.activated_at) || now >= new Date(c.expires_at)) return {status:'inactive',sent,attempted};
    const weekday = new Intl.DateTimeFormat('en-US',{timeZone:c.timezone,weekday:'short'}).format(now);
    if (weekday === 'Sat' || weekday === 'Sun') return {status:'weekend',sent,attempted};
    const hour=Number(new Intl.DateTimeFormat('en-US',{timeZone:c.timezone,hour:'numeric',hourCycle:'h23'}).format(now));
    if(hour<9 || hour>=17) return {status:'outside-business-hours',sent,attempted};
    const rows = await deps.sheets.read();
    // Import known historical contacts into durable suppression before processing.
    // A subsequent manual reset to No never re-enables first contact.
    for (const p of rows.filter(p=>p.contacted==='Yes')) {
      await deps.store.suppress(c.id,'business',businessKey(p),'previously-contacted',now);
    }
    const remaining=await deps.store.remaining(c,now);
    if(!remaining) return {status:'daily-cap',sent,attempted};
    rows.sort((a,b) => a.dateAdded.localeCompare(b.dateAdded));
    let researched = 0;
    for (const p of rows) {
      if(attempted>=remaining) break;
      if (p.contacted !== 'No') continue;
      try {
        if(!p.businessName.trim() || !p.city.trim() || !p.customerType.trim()) {await deps.store.flag(c.id,p,'incomplete-business-identity',now);continue;}
        if (!US_REGIONS.has(p.region)) { await deps.store.flag(c.id,p,'US-region-not-verified',now); continue; }
        let key: string;
        try { key=businessKey(p); } catch { await deps.store.flag(c.id,p,'invalid-business-website',now); continue; }
        if (await deps.store.known(c.id,key)) continue;
        if (researched++ >= Math.max(10,c.daily_cap*2)) break;
        let contact;
        try { contact = await deps.research.find(p); } catch { await deps.store.flag(c.id,p,'public-research-failed',now); continue; }
        if (!contact) { await deps.store.flag(c.id,p,'no-public-business-email',now); continue; }
        if (businessKey({...p,website:contact.sourceUrl}) !== key) { await deps.store.flag(c.id,p,'unattributed-contact-source',now); continue; }
        const email = emailKey(contact.email);
        // Re-read eligibility immediately before reserving; stale row numbers are never used.
        const fresh = (await deps.sheets.read()).filter(x => {try{return businessKey(x)===key;}catch{return false;}});
        if (!fresh.length || fresh.some(x => x.contacted === 'Yes')) continue;
        const id = deps.store.newId();
        const link = new URL('/first-contact/unsubscribe',origin);
        link.searchParams.set('token',unsubscribeToken(c.id,id,deps.unsubscribeSecret));
        const message: Outbound = { from:c.mailbox,to:email,subject:c.message.subject,
          text:[c.message.body,c.message.signature,c.message.optOut.replaceAll('{{unsubscribe_url}}',link.toString())].join('\n\n'),
          messageId:`<${id}@${c.mailbox.split('@')[1]}>` };
        if (!await deps.store.reserve(c,p,email,contact.sourceUrl,message,now,id)) continue;
        if (!await deps.store.begin(id,now)) continue;
        attempted++;
        let outcome;
        try { outcome = await deps.mailbox.send(message); } catch { outcome = {kind:'unknown'} as const; }
        if (outcome.kind === 'accepted') {
          await deps.store.outcome(id,'accepted',now,outcome.reference);
          sent++;
          if (!await syncSheets(c,deps,now)) return {status:'sheet-pending',sent,attempted};
        } else {
          await deps.store.outcome(id,outcome.kind === 'rejected' ? 'rejected' : 'unknown',now);
          await deps.store.flag(c.id,p,outcome.kind === 'rejected' ? 'SMTP-rejected' : 'uncertain-send',now);
        }
      } catch {
        // A failure could follow submission. Preserve its reservation and stop.
        throw new Error('Worker operation failed; review durable ledger');
      }
    }
    await syncSheets(c,deps,now);
    return {status:'complete',sent,attempted};
  } catch {
    try {
      await deps.store.pause(customerId,'worker-or-database-failed');
      await deps.store.flag(customerId,{dateAdded:'',businessName:'Worker health',city:'',region:'US',customerType:'Worker',website:'',contacted:'No'},'worker-or-database-failed',now);
      await syncSheets(await deps.store.customer(customerId),deps,now);
    } catch { /* Database outage: alert remains available. */ }
    deps.alert('Worker or database failure; no further sends attempted');
    return {status:'paused',sent,attempted};
  }
}
