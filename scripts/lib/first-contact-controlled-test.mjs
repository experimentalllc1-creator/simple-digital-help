import { randomUUID, createHash } from 'node:crypto';
import { openSync, writeSync, fsyncSync, closeSync, readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { suppressionDecision } from './first-contact-controlled-suppression.mjs';

export const FROM = 'outreach@experimental-llc.com';
export const SUBJECT = 'Simple Digital Help First Contact Test';
export const BODY = 'This is a controlled test of the Universal First Contact Agent. No action is required.';
export const TEST_KEY = 'first-contact-one-email-controlled-test-v1';
export const REPLY_TEST = Object.freeze({ key: 'first-contact-one-email-reply-test-v1',
  recipient: 'henry@henrypaz.com', subject: 'Simple Digital Help Reply Test',
  body: 'This is a controlled First Contact reply and opt-out test. Please reply with: Please remove me from your list.' });

function testSpec(variant) {
  if (variant === 'reply') return REPLY_TEST;
  if (variant === 'original') return { key: TEST_KEY, recipient: FROM, subject: SUBJECT, body: BODY };
  throw new Error('Unknown controlled test');
}

function append(fd, record) {
  const buffer = Buffer.from(JSON.stringify({ ...record, at: new Date().toISOString() }) + '\n');
  let offset = 0;
  while (offset < buffer.length) offset += writeSync(fd, buffer, offset, buffer.length - offset);
  fsyncSync(fd);
}

export function readLedger(path) {
  const records = readFileSync(path, 'utf8').trim().split('\n').map(line => JSON.parse(line));
  const reservation = records[0];
  if (reservation?.state !== 'reserved' || ![TEST_KEY, REPLY_TEST.key].includes(reservation.testKey) || !reservation.messageId) {
    throw new Error('Ledger verification failed');
  }
  return { records, reservation, accepted: records.find(record => record.state === 'accepted') };
}

export function validateControlledConfig(env, variant = 'original') {
  const spec = testSpec(variant);
  if (env.FIRST_CONTACT_TEST_RECIPIENT !== spec.recipient || env.FIRST_CONTACT_SMTP_USER !== FROM || env.FIRST_CONTACT_IMAP_USER !== FROM) {
    throw new Error('Controlled test requires the explicitly owned mailbox as sender and sole recipient');
  }
  for (const protocol of ['SMTP', 'IMAP']) {
    const prefix = `FIRST_CONTACT_${protocol}_`;
    if (env[`${prefix}HOST`] !== 'gtxm1357.siteground.biz' || env[`${prefix}PORT`] !== (protocol === 'SMTP' ? '465' : '993') || !env[`${prefix}PASSWORD`]) {
      throw new Error('Controlled test configuration failed validation');
    }
  }
}

// The fixed key/path has no reset option. Existing, partial or unknown ledgers
// fail closed. The network callback is invoked exactly once, only after fsync.
export async function runControlledTest({ ledgerPath, env, send, reconcile, variant = 'original' }) {
  const spec = testSpec(variant);
  validateControlledConfig(env, variant);
  const blocked = suppressionDecision(join(dirname(ledgerPath), 'suppressions.json'),
    env.FIRST_CONTACT_TEST_RECIPIENT, env.FIRST_CONTACT_TEST_RECIPIENT.split('@')[1], spec.key);
  if (blocked.recipientBlocked || blocked.businessBlocked || blocked.prospectBlocked) {
    return { result: 'suppression-blocked', emailsSubmitted: 0 };
  }
  mkdirSync(dirname(ledgerPath), { recursive: true });
  let fd;
  try { fd = openSync(ledgerPath, 'wx', 0o600); }
  catch (error) {
    if (error.code === 'EEXIST') return { result: 'duplicate-blocked', emailsSubmitted: 0 };
    throw new Error('Could not reserve controlled test ledger');
  }
  const messageId = `<first-contact-controlled-${randomUUID()}@experimental-llc.com>`;
  const message = { from: FROM, to: env.FIRST_CONTACT_TEST_RECIPIENT,
    envelope: { from: FROM, to: [env.FIRST_CONTACT_TEST_RECIPIENT] },
    subject: spec.subject, text: spec.body, messageId };
  let outcome;
  try {
    append(fd, { state: 'reserved', testKey: spec.key, messageId, from: FROM, recipient: message.to,
      subject: spec.subject, bodySha256: createHash('sha256').update(spec.body).digest('hex') });
    const persisted = readLedger(ledgerPath);
    if (persisted.reservation.messageId !== messageId || persisted.reservation.recipient !== message.to) throw new Error('Reservation read-back failed');
    append(fd, { state: 'submitting', messageId });
    try {
      const receipt = await send(message);
      const code = /^250(?:\s|$)/.test(receipt.response ?? '') ? 250 : undefined;
      const recipients = receipt.accepted ?? [];
      if (code !== 250 || receipt.messageId !== messageId || recipients.length !== 1 || recipients[0] !== message.to || receipt.rejected?.length) {
        append(fd, { state: 'unknown', messageId, reason: 'SMTP acceptance evidence did not match controlled envelope' });
        outcome = { result: 'unknown', messageId, emailsSubmitted: 1 };
      } else {
        // Only structured acceptance evidence; never persist raw server text.
        append(fd, { state: 'accepted', messageId, smtpCode: code, recipient: message.to });
        const verified = readLedger(ledgerPath);
        if (verified.accepted?.messageId !== messageId || verified.accepted?.smtpCode !== 250) throw new Error('Acceptance read-back failed');
        outcome = { result: 'accepted', messageId, smtpCode: 250, ledgerVerified: true, emailsSubmitted: 1 };
      }
    } catch {
      // SMTP might have accepted before a disconnect or a persistence failure.
      // Never retry or remove the durable reservation.
      append(fd, { state: 'unknown', messageId, reason: 'Submission or acceptance persistence uncertain' });
      outcome = { result: 'unknown', messageId, emailsSubmitted: 1 };
    }
    if (outcome.result === 'accepted' && reconcile) {
      try { outcome.reconciliation = await reconcile(messageId); }
      catch { outcome.reconciliation = { result: 'failed', reason: 'Read-only IMAP reconciliation failed' }; }
      append(fd, { state: 'reconciled', messageId, reconciliation: outcome.reconciliation });
      outcome.ledgerVerified = readLedger(ledgerPath).accepted?.messageId === messageId;
    }
    return outcome;
  } finally { closeSync(fd); }
}
