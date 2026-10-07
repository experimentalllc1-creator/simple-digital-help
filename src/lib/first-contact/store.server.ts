import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import type { ApprovedMessage, Customer, Database, MailEvent, Outbound, Prospect } from './types';

export function approvalHash(message: ApprovedMessage) {
  return createHash('sha256').update(JSON.stringify([message.subject,message.body,message.signature,message.optOut])).digest('hex');
}
export function businessKey(p: Prospect) {
  const url = new URL(p.website);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Invalid business website');
  return url.hostname.toLowerCase().replace(/^www\./, '');
}
export function emailKey(email: string) {
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email)) throw new Error('Invalid business email');
  return email.toLowerCase();
}
export class FirstContactStore {
  constructor(readonly db: Database) {}
  async customer(id: string): Promise<Customer> {
    const { rows } = await this.db.query('SELECT * FROM fc_customers WHERE id=$1 AND execution_mode=\'fixture\'', [id]);
    if (!rows[0]) throw new Error('Fixture customer not configured');
    return rows[0] as unknown as Customer;
  }
  async activate(input: { id: string; timezone: string; mailbox: string; sheetId: string; message: ApprovedMessage;
    now: Date; dailyCap?: number; capApproved?: boolean; setupVerified: boolean }) {
    if (!input.setupVerified) throw new Error('Activation requires verified assisted setup');
    new Intl.DateTimeFormat('en-US', { timeZone: input.timezone }).format(input.now);
    emailKey(input.mailbox);
    if (!input.message.subject.trim() || /[\r\n]/.test(input.message.subject) || !input.message.body.trim() ||
        !input.message.signature.trim() || !input.message.optOut.includes('{{unsubscribe_url}}')) throw new Error('Message approval incomplete');
    const cap = input.dailyCap ?? 5;
    if (!Number.isInteger(cap) || cap < 1 || (cap > 5 && !input.capApproved)) throw new Error('Capacity increase requires assisted approval');
    await this.db.query(`INSERT INTO fc_customers(id,timezone,mailbox,sheet_id,message,approval_hash,approved_at,activated_at,expires_at,daily_cap,cap_approved_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$7,$8,$9,$10) ON CONFLICT(id) DO NOTHING`,
    [input.id,input.timezone,input.mailbox,input.sheetId,JSON.stringify(input.message),approvalHash(input.message),input.now.toISOString(),
      new Date(input.now.getTime()+364*86400000).toISOString(),cap,input.capApproved ? input.now.toISOString() : null]);
  }
  async pause(customer: string, reason: string) {
    await this.db.query('UPDATE fc_customers SET paused=true,pause_reason=$2 WHERE id=$1', [customer,reason]);
  }
  async known(customer: string, key: string) {
    const { rows } = await this.db.query(`SELECT 1 FROM fc_sends WHERE customer_id=$1 AND business_key=$2
      UNION ALL SELECT 1 FROM fc_suppressions WHERE customer_id=$1 AND kind='business' AND value=$2
      UNION ALL SELECT 1 FROM fc_exceptions WHERE customer_id=$1 AND business_key=$2 AND NOT resolved`, [customer,key]);
    return rows.length > 0;
  }
  async flag(customer: string, p: Prospect, issue: string, now: Date) {
    // Invalid websites still need a stable exception reference, never a send identity.
    let key: string;
    try { key = businessKey(p); } catch { key = createHash('sha256').update(JSON.stringify(p)).digest('hex'); }
    await this.db.query(`INSERT INTO fc_exceptions(customer_id,business_key,issue,prospect,flagged_at)
      VALUES($1,$2,$3,$4,$5) ON CONFLICT(customer_id,business_key,issue) DO UPDATE SET sheet_synced=false`,
    [customer,key,issue,JSON.stringify(p),now.toISOString()]);
  }
  async resolve(customer: string, p: Prospect, issue: string) {
    await this.db.query(`UPDATE fc_exceptions SET resolved=true,sheet_synced=false
      WHERE customer_id=$1 AND business_key=$2 AND issue=$3 AND NOT resolved`,[customer,businessKey(p),issue]);
  }
  async reserve(c: Customer, p: Prospect, email: string, source: string, message: Outbound, now: Date, id: string) {
    const { rows } = await this.db.query('SELECT fc_reserve($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) AS ok',
      [c.id,id,businessKey(p),emailKey(email),JSON.stringify(p),source,JSON.stringify(message),c.approval_hash,message.messageId,now.toISOString()]);
    return rows[0]?.ok === true;
  }
  async remaining(c: Customer, now: Date) {
    const {rows}=await this.db.query(`SELECT reserved_count FROM fc_daily_usage
      WHERE customer_id=$1 AND local_day=($2::timestamptz AT TIME ZONE $3)::date`,[c.id,now.toISOString(),c.timezone]);
    return Math.max(0,c.daily_cap-Number(rows[0]?.reserved_count ?? 0));
  }
  async begin(id: string, now: Date) {
    const { rows } = await this.db.query(`UPDATE fc_sends s SET status='sending' FROM fc_customers c
      WHERE s.id=$1 AND s.customer_id=c.id AND s.status='reserved' AND NOT c.paused
      AND c.approval_hash=s.approval_hash AND $2::timestamptz < c.expires_at
      AND NOT EXISTS(SELECT 1 FROM fc_suppressions x WHERE x.customer_id=c.id AND
        ((x.kind='business' AND x.value=s.business_key) OR (x.kind='recipient' AND x.value=s.recipient))) RETURNING s.id`, [id,now.toISOString()]);
    return rows.length === 1;
  }
  async outcome(id: string, status: 'accepted' | 'unknown' | 'rejected', now: Date, reference?: string) {
    const { rows } = await this.db.query(`UPDATE fc_sends SET status=$2,accepted_at=$3,smtp_reference=$4
      WHERE id=$1 AND status='sending' RETURNING id`, [id,status,status==='accepted' ? now.toISOString() : null,reference ?? null]);
    if (rows.length !== 1) throw new Error('Send outcome could not be persisted');
  }
  async recover(customer: string, now: Date) {
    const { rows } = await this.db.query(`UPDATE fc_sends SET status='unknown' WHERE customer_id=$1
      AND status IN ('reserved','sending') AND blocked_until <= $2 RETURNING prospect`, [customer,now.toISOString()]);
    for (const row of rows) await this.flag(customer,row.prospect as Prospect,'uncertain-send',now);
  }
  async suppress(customer: string, kind: 'business' | 'recipient', value: string, reason: string, now: Date) {
    await this.db.query(`INSERT INTO fc_suppressions VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`, [customer,kind,value,reason,now.toISOString()]);
  }
  async suppressSend(customer: string, id: string, reason: string, now: Date) {
    const { rows } = await this.db.query('SELECT * FROM fc_sends WHERE id=$1 AND customer_id=$2', [id,customer]);
    const s = rows[0];
    if (!s) throw new Error('Unknown send');
    await this.suppress(customer,'recipient',String(s.recipient),reason,now);
    await this.suppress(customer,'business',String(s.business_key),reason,now);
    await this.flag(customer,s.prospect as Prospect,reason,now);
  }
  async ingest(customer: string, event: MailEvent) {
    await this.db.query(`INSERT INTO fc_mail_events(customer_id,event_id,event) VALUES($1,$2,$3) ON CONFLICT DO NOTHING`, [customer,event.id,JSON.stringify(event)]);
  }
  async pendingEvents(customer: string) {
    return (await this.db.query('SELECT event_id,event FROM fc_mail_events WHERE customer_id=$1 AND processed_at IS NULL', [customer])).rows;
  }
  async matchingSend(customer: string, event: MailEvent) {
    if (!event.messageId && !event.recipient) return undefined;
    return (await this.db.query(`SELECT * FROM fc_sends WHERE customer_id=$1 AND
      (($2::text IS NOT NULL AND message_id=$2) OR ($2::text IS NULL AND recipient=$3))`, [customer,event.messageId ?? null,event.recipient ? emailKey(event.recipient) : null])).rows[0];
  }
  async processed(customer: string, event: string, now: Date) {
    await this.db.query('UPDATE fc_mail_events SET processed_at=$3 WHERE customer_id=$1 AND event_id=$2',[customer,event,now.toISOString()]);
  }
  async unsynced(customer: string) {
    return (await this.db.query('SELECT * FROM fc_sends WHERE customer_id=$1 AND status=\'accepted\' AND NOT sheet_synced',[customer])).rows;
  }
  async synced(id: string) { await this.db.query('UPDATE fc_sends SET sheet_synced=true WHERE id=$1 AND status=\'accepted\'',[id]); }
  async exceptions(customer: string) {
    return (await this.db.query('SELECT * FROM fc_exceptions WHERE customer_id=$1 AND NOT sheet_synced',[customer])).rows;
  }
  async exceptionSynced(customer: string, key: string, issue: string) {
    await this.db.query('UPDATE fc_exceptions SET sheet_synced=true WHERE customer_id=$1 AND business_key=$2 AND issue=$3',[customer,key,issue]);
  }
  newId() { return randomUUID(); }
}
