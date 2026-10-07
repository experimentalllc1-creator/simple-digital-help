import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { fileURLToPath } from 'node:url';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { readLedger, validateControlledConfig, runControlledTest, TEST_KEY, REPLY_TEST } from './lib/first-contact-controlled-test.mjs';
import { correlateReply, isReplyOptOut, persistReplySuppression, suppressionDecision } from './lib/first-contact-controlled-suppression.mjs';

// No SMTP transport import or send operation. All mailbox access is read-only.
const envPath = fileURLToPath(new URL('../.env.first-contact.staging.local', import.meta.url));
const variant = process.argv[2] === '--reply-test' ? 'reply' : 'original';
const testDirectory = variant === 'reply' ? 'first-contact-reply-test' : 'first-contact-controlled';
const ledgerPath = fileURLToPath(new URL(`../.qa/${testDirectory}/send-ledger.jsonl`, import.meta.url));
const suppressionPath = fileURLToPath(new URL(`../.qa/${testDirectory}/suppressions.json`, import.meta.url));
const report = { replyFound: false, correlationPassed: false, optOutRecognized: false,
  suppressionCreated: false, recipientSuppressionCreated: false, businessProspectSuppressionCreated: false,
  futureSendBlockPassed: false, errors: [] };
let client;
let stage = 'configuration';
try {
  if ((process.argv.length !== 2 && !(process.argv.length === 3 && variant === 'reply')) || process.env.NODE_ENV === 'production' || process.env.VERCEL ||
      process.env.VERCEL_ENV === 'production' || process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') throw new Error('Runtime guard failed');
  const env = parseEnv(readFileSync(envPath, 'utf8'));
  validateControlledConfig(env, variant);
  const ledger = readLedger(ledgerPath);
  const original = ledger.reservation;
  if (original.testKey !== (variant === 'reply' ? REPLY_TEST.key : TEST_KEY) || !ledger.accepted || ledger.accepted.messageId !== original.messageId || ledger.accepted.smtpCode !== 250 ||
      original.recipient !== env.FIRST_CONTACT_TEST_RECIPIENT) throw new Error('Accepted send ledger is invalid');
  client = new ImapFlow({ host: env.FIRST_CONTACT_IMAP_HOST, port: Number(env.FIRST_CONTACT_IMAP_PORT), secure: true,
    auth: { user: env.FIRST_CONTACT_IMAP_USER, pass: env.FIRST_CONTACT_IMAP_PASSWORD },
    tls: { servername: env.FIRST_CONTACT_IMAP_HOST, rejectUnauthorized: true, minVersion: 'TLSv1.2' },
    logger: false, emitLogs: false, logRaw: false, disableAutoIdle: true,
    connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 15000 });
  client.on('error', () => {});
  stage = 'IMAP connection/authentication';
  await client.connect();
  stage = 'read-only reply discovery';
  const folders = (await client.list()).filter(folder => folder.path === 'INBOX' ||
    ['\\Archive', '\\Junk'].includes(folder.specialUse) || ['INBOX.Archive', 'INBOX.Junk', 'INBOX.spam'].includes(folder.path));
  for (const folder of folders) {
    const mailbox = await client.mailboxOpen(folder.path, { readOnly: true });
    const matches = await client.search({ or: [
      { header: { 'In-Reply-To': original.messageId } }, { header: { References: original.messageId } },
    ] }, { uid: true });
    if (!Array.isArray(matches)) continue;
    if (matches.length > 100) throw new Error('Candidate count exceeds controlled bound');
    for (const uid of matches) {
      const metadata = await client.fetchOne(uid, { size: true }, { uid: true });
      if (!metadata || metadata.size > 262144) throw new Error('Reply exceeds processing size bound');
      const fetched = await client.fetchOne(uid, { source: { maxLength: 262145 } }, { uid: true });
      if (!fetched?.source || fetched.source.length > 262144) throw new Error('Reply source exceeds bound');
      const parsed = await simpleParser(fetched.source, { skipHtmlToText: false, skipTextToHtml: true, skipImageLinks: true });
      if ((parsed.from?.value ?? []).some(value => value.address?.toLowerCase() === original.recipient.toLowerCase())) report.replyFound = true;
      if (!correlateReply(parsed, original)) continue;
      report.correlationPassed = true;
      if (!isReplyOptOut(parsed.text ?? '')) continue;
      report.optOutRecognized = true;
      stage = 'durable suppression';
      persistReplySuppression(suppressionPath, original, {
        eventId: `${folder.path}:${mailbox.uidValidity}:${uid}`, replyMessageId: parsed.messageId,
        text: parsed.text ?? '',
      });
      const blocked = suppressionDecision(suppressionPath, original.recipient,
        original.recipient.split('@')[1], original.testKey);
      report.suppressionCreated = blocked.recipientBlocked && blocked.businessBlocked && blocked.prospectBlocked;
      report.recipientSuppressionCreated = blocked.recipientBlocked;
      report.businessProspectSuppressionCreated = blocked.businessBlocked && blocked.prospectBlocked;
      // Exercise the actual submission gate with a callback that cannot send.
      stage = 'future-send gate verification';
      let submissionInvoked = false;
      const result = await runControlledTest({ ledgerPath, env, variant,
        send: async () => { submissionInvoked = true; throw new Error('Sending forbidden'); },
        reconcile: async () => { throw new Error('Unexpected reconciliation'); } });
      report.futureSendBlockPassed = result.result === 'suppression-blocked' && !submissionInvoked;
      break;
    }
    if (report.suppressionCreated) break;
  }
  if (!report.replyFound) report.errors.push('No reply referencing the controlled Message-ID found');
  else if (!report.correlationPassed) report.errors.push('Reply identity/correlation checks failed');
  else if (!report.optOutRecognized) report.errors.push('No opt-out recognized in current correlated reply text');
} catch {
  report.errors.push(`Processing failed during ${stage}; no email sent`);
} finally {
  try { if (client?.authenticated) await client.logout(); } catch {}
  client?.close();
}
console.log(JSON.stringify(report, null, 2));
if (report.errors.length) process.exitCode = 1;
