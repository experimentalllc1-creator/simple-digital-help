export type Prospect = {
  dateAdded: string; businessName: string; city: string; region: string;
  customerType: string; website: string; contacted: 'No' | 'Yes';
};
export type ApprovedMessage = { subject: string; body: string; signature: string; optOut: string };
export type Customer = {
  id: string; timezone: string; mailbox: string; sheet_id: string;
  message: ApprovedMessage; approval_hash: string; activated_at: string;
  expires_at: string; paused: boolean; daily_cap: number;
};
export type Outbound = { from: string; to: string; subject: string; text: string; messageId: string };
export type MailEvent = {
  id: string; messageId?: string; recipient?: string;
  type: 'hard-bounce' | 'soft-bounce' | 'reply' | 'failure'; text?: string;
};
export type SmtpOutcome =
  | { kind: 'accepted'; code: 250; reference: string }
  | { kind: 'rejected'; code: number }
  | { kind: 'unknown' };
export interface Mailbox {
  readonly mode: 'fixture';
  monitor(): Promise<MailEvent[]>;
  send(message: Outbound): Promise<SmtpOutcome>;
}
export interface Sheets {
  readonly mode: 'fixture';
  read(): Promise<Prospect[]>;
  markContacted(prospect: Prospect): Promise<void>;
  verifyContacted(prospect: Prospect): Promise<boolean>;
  attention(key: string, prospect: Prospect, issue: string, flaggedAt: string, resolved: boolean): Promise<void>;
}
export interface PublicResearch {
  readonly mode: 'fixture';
  find(prospect: Prospect): Promise<{ email: string; sourceUrl: string } | null>;
}
export interface Database {
  query<T extends Record<string, unknown> = Record<string, unknown>>(sql: string, values?: unknown[]): Promise<{ rows: T[] }>;
}
