import 'server-only';
import { businessKey } from './store.server';
import type { MailEvent, Mailbox, Outbound, Prospect, PublicResearch, Sheets, SmtpOutcome } from './types';

export const PROSPECT_HEADERS = ['Date Added','Business Name','City','Region','Customer Type','Website','Contacted?'];
export const ATTENTION_HEADERS = ['Date Flagged','Business Name','Region','Customer Type','Website','Agent','Issue','Resolved?'];
export function fixtureProspect(index=1, region='Florida'): Prospect {
  return {dateAdded:'2026-10-05',businessName:`Fixture Roofing ${index}`,city:'Fixture City',region,
    customerType:'Roofing Contractors',website:`https://roofer${index}.example.test`,contacted:'No'};
}
export class FixtureSheets implements Sheets {
  readonly mode = 'fixture';
  rows: Prospect[];
  needsAttention = new Map<string,string[]>();
  failUpdate = false;
  failAttention = false;
  failRead = false;
  prospectHeaders = [...PROSPECT_HEADERS];
  attentionHeaders = [...ATTENTION_HEADERS];
  constructor(rows: Prospect[]) { this.rows = structuredClone(rows); }
  async read() {
    if (this.failRead || JSON.stringify(this.prospectHeaders)!==JSON.stringify(PROSPECT_HEADERS) ||
      JSON.stringify(this.attentionHeaders)!==JSON.stringify(ATTENTION_HEADERS) ||
      this.rows.some(p=>p.contacted!=='No' && p.contacted!=='Yes')) throw new Error('Fixture sheet unavailable or invalid');
    return structuredClone(this.rows);
  }
  async markContacted(p: Prospect) {
    if (this.failUpdate) throw new Error('Fixture sheet update failed');
    const matches = this.rows.filter(row => businessKey(row) === businessKey(p));
    if (!matches.length) throw new Error('Prospect disappeared');
    for (const row of matches) row.contacted='Yes';
  }
  async verifyContacted(p: Prospect) {
    const matches = this.rows.filter(row => businessKey(row) === businessKey(p));
    return matches.length > 0 && matches.every(row => row.contacted === 'Yes');
  }
  async attention(key: string,p: Prospect,issue: string,at: string,resolved: boolean) {
    if (this.failAttention) throw new Error('Fixture attention update failed');
    this.needsAttention.set(key,[at,p.businessName,p.region,p.customerType,p.website,'Universal First Contact Agent',issue,resolved?'Yes':'No']);
  }
}
export type PublicPage = { url: string; html: string; public: boolean };
export class FixturePublicResearch implements PublicResearch {
  readonly mode = 'fixture';
  constructor(readonly pages: PublicPage[]) {}
  async find(p: Prospect) {
    for (const page of this.pages) {
      if (!page.public || businessKey({...p,website:page.url}) !== businessKey(p)) continue;
      // Conservative v1: explicit mailto role contacts only, no inferred addresses
      // or named personal accounts. No network, directory scraping, or enrichment.
      for (const match of page.html.matchAll(/href=["']mailto:([^"'?\s]+)(?:\?[^"']*)?["']/gi)) {
        const email = match[1].toLowerCase();
        if (/^(info|contact|sales|office|hello|support|quotes|estimates|service|enquiries)@/i.test(email)) return {email,sourceUrl:page.url};
      }
    }
    return null;
  }
}
// Mailforge-compatible protocol boundary. A production SMTP/IMAP client must be
// supplied separately; v1 only exports the fixture transport, with no sockets.
export class MockMailforgeMailbox implements Mailbox {
  readonly mode = 'fixture';
  messages: Outbound[]=[];
  events: MailEvent[]=[];
  failMonitor=false;
  outcome: SmtpOutcome={kind:'accepted',code:250,reference:'fixture-queue-accepted'};
  async monitor() { if(this.failMonitor) throw new Error('Fixture IMAP unavailable'); return structuredClone(this.events); }
  async send(message: Outbound) {
    this.messages.push(structuredClone(message));
    return structuredClone(this.outcome);
  }
}
export function fixturePages(rows: Prospect[]): PublicPage[] {
  return rows.map(p => ({url:`${p.website}/contact`,public:true,html:`<a href="mailto:info@${new URL(p.website).hostname}">Business enquiries</a>`}));
}
