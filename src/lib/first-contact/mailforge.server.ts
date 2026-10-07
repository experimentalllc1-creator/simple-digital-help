import 'server-only';
import { emailKey } from './store.server';
import type { Mailbox, MailEvent, Outbound, SmtpOutcome } from './types';

export type SmtpReceipt = { finalDataResponse: boolean; code: number; response: string };
export type ImapRecord = {
  uid: number; uidValidity: string; from: string; text: string;
  inReplyTo?: string; autoSubmitted?: boolean;
  deliveryStatus?: { action: 'failed' | 'delayed'; originalMessageId?: string; recipient?: string };
};
export interface FixtureProtocolDriver {
  readonly mode: 'fixture';
  // Future live driver must authenticate over TLS, finish DATA, and report the
  // final reply without automatically retrying SMTP. No live driver is included.
  submit(message: { envelope: { from: string; to: string }; mime: string }): Promise<SmtpReceipt>;
  poll(): Promise<ImapRecord[]>;
}
export function mimeMessage(message: Outbound) {
  const from=emailKey(message.from),to=emailKey(message.to);
  if (/[\r\n]/.test(message.subject+message.messageId) || !/^<[^<>\s]+>$/.test(message.messageId)) throw new Error('Unsafe mail headers');
  const link = message.text.match(/https:\/\/[^\s]+\/first-contact\/unsubscribe\?token=[A-Za-z0-9_.-]+/)?.[0];
  if (!link) throw new Error('Approved unsubscribe link missing');
  return [`From: ${from}`,`To: ${to}`,`Subject: =?UTF-8?B?${Buffer.from(message.subject).toString('base64')}?=`,
    `Message-ID: ${message.messageId}`,'MIME-Version: 1.0','Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',`List-Unsubscribe: <${link}>`,'List-Unsubscribe-Post: List-Unsubscribe=One-Click','',
    Buffer.from(message.text).toString('base64').match(/.{1,76}/g)?.join('\r\n') ?? ''].join('\r\n');
}
export class MailforgeFixtureAdapter implements Mailbox {
  readonly mode='fixture';
  constructor(readonly driver: FixtureProtocolDriver) {
    if(driver.mode !== 'fixture') throw new Error('Live protocol driver forbidden');
  }
  async send(message: Outbound): Promise<SmtpOutcome> {
    const mime=mimeMessage(message);
    try {
      const receipt=await this.driver.submit({envelope:{from:message.from,to:message.to},mime});
      if(receipt.finalDataResponse && receipt.code===250 && receipt.response.trim()) return {kind:'accepted',code:250,reference:receipt.response};
      if(receipt.code>=400 && receipt.code<=599) return {kind:'rejected',code:receipt.code};
      return {kind:'unknown'};
    } catch { return {kind:'unknown'}; }
  }
  async monitor(): Promise<MailEvent[]> {
    const messages=await this.driver.poll();
    return messages.filter(m=>m.deliveryStatus || !m.autoSubmitted).map(m=>{
      const id=`${m.uidValidity}:${m.uid}`;
      if(m.deliveryStatus) return {id,type:m.deliveryStatus.action==='failed' ? 'hard-bounce' : 'soft-bounce',
        messageId:m.deliveryStatus.originalMessageId,recipient:m.deliveryStatus.recipient};
      return {id,type:'reply',messageId:m.inReplyTo,recipient:m.from,text:m.text};
    });
  }
}
