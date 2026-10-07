import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';
import { runControlledTest, validateControlledConfig, REPLY_TEST } from './lib/first-contact-controlled-test.mjs';
import { suppressionDecision } from './lib/first-contact-controlled-suppression.mjs';

// Separate fixed test key/ledger. No IMAP, reply processing, Sheets or Stripe.
const envPath = fileURLToPath(new URL('../.env.first-contact.staging.local', import.meta.url));
const ledgerPath = fileURLToPath(new URL('../.qa/first-contact-reply-test/send-ledger.jsonl', import.meta.url));
const priorSuppressionPath = fileURLToPath(new URL('../.qa/first-contact-controlled/suppressions.json', import.meta.url));
try {
  if (process.argv.length !== 2 || process.env.NODE_ENV === 'production' || process.env.VERCEL ||
      process.env.VERCEL_ENV === 'production' || process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') throw new Error('Local staging required');
  const env = parseEnv(readFileSync(envPath, 'utf8'));
  validateControlledConfig(env, 'reply');
  const prior = suppressionDecision(priorSuppressionPath, REPLY_TEST.recipient, 'henrypaz.com', REPLY_TEST.key);
  if (prior.recipientBlocked || prior.businessBlocked || prior.prospectBlocked) throw new Error('Existing suppression blocks this test');
  const outcome = await runControlledTest({ ledgerPath, env, variant: 'reply', send: async message => {
    const transport = nodemailer.createTransport({ host: env.FIRST_CONTACT_SMTP_HOST,
      port: Number(env.FIRST_CONTACT_SMTP_PORT), secure: true,
      auth: { user: env.FIRST_CONTACT_SMTP_USER, pass: env.FIRST_CONTACT_SMTP_PASSWORD },
      tls: { servername: env.FIRST_CONTACT_SMTP_HOST, rejectUnauthorized: true, minVersion: 'TLSv1.2' },
      pool: false, logger: false, debug: false, connectionTimeout: 15000, greetingTimeout: 15000,
      socketTimeout: 15000, dnsTimeout: 15000, disableFileAccess: true, disableUrlAccess: true });
    try { return await transport.sendMail(message); }
    finally { transport.close(); }
  } });
  console.log(JSON.stringify(outcome, null, 2));
  if (!['accepted', 'duplicate-blocked', 'suppression-blocked'].includes(outcome.result)) process.exitCode = 1;
} catch {
  console.log(JSON.stringify({ result: 'failed-or-uncertain', reason: 'Test stopped; inspect ledger before any further action' }));
  process.exitCode = 1;
}
