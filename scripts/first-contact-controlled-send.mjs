import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';
import { ImapFlow } from 'imapflow';
import { runControlledTest, validateControlledConfig } from './lib/first-contact-controlled-test.mjs';

// Standalone local staging only. No worker/Sheets/database/Stripe imports.
// File parsing avoids inherited shell overrides and never logs credentials.
const envPath = fileURLToPath(new URL('../.env.first-contact.staging.local', import.meta.url));
const ledgerPath = fileURLToPath(new URL('../.qa/first-contact-controlled/send-ledger.jsonl', import.meta.url));
const env = parseEnv(readFileSync(envPath, 'utf8'));
if (process.argv.length !== 2 || process.env.NODE_ENV === 'production' || process.env.VERCEL ||
    process.env.VERCEL_ENV === 'production' || process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
  throw new Error('Controlled send is restricted to standalone local staging');
}
validateControlledConfig(env);
const tls = host => ({ servername: host, rejectUnauthorized: true, minVersion: 'TLSv1.2' });

async function send(message) {
  const transport = nodemailer.createTransport({ host: env.FIRST_CONTACT_SMTP_HOST,
    port: Number(env.FIRST_CONTACT_SMTP_PORT), secure: true,
    auth: { user: env.FIRST_CONTACT_SMTP_USER, pass: env.FIRST_CONTACT_SMTP_PASSWORD },
    tls: tls(env.FIRST_CONTACT_SMTP_HOST), pool: false, logger: false, debug: false,
    connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 15000, dnsTimeout: 15000,
    disableFileAccess: true, disableUrlAccess: true });
  try { return await transport.sendMail(message); } // Single submission; no retry loop.
  finally { transport.close(); }
}

async function reconcile(messageId) {
  const client = new ImapFlow({ host: env.FIRST_CONTACT_IMAP_HOST,
    port: Number(env.FIRST_CONTACT_IMAP_PORT), secure: true,
    auth: { user: env.FIRST_CONTACT_IMAP_USER, pass: env.FIRST_CONTACT_IMAP_PASSWORD },
    tls: tls(env.FIRST_CONTACT_IMAP_HOST), logger: false, emitLogs: false, logRaw: false,
    disableAutoIdle: true, connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 15000 });
  client.on('error', () => {});
  try {
    await client.connect();
    const folders = await client.list();
    const sent = folders.find(folder => folder.specialUse === '\\Sent') ?? folders.find(folder => folder.path === 'INBOX.Sent');
    const result = { sent: { result: sent ? 'not-found' : 'unavailable' }, inbox: { result: 'not-found' } };
    // Search only the recorded Message-ID, using read-only mailbox selection.
    // Do not APPEND a Sent copy or fetch unrelated message contents.
    for (const [kind, folder] of [['sent', sent?.path], ['inbox', 'INBOX']]) {
      if (!folder) continue;
      await client.mailboxOpen(folder, { readOnly: true });
      const matches = await client.search({ header: { 'Message-ID': messageId } }, { uid: true });
      result[kind] = { result: Array.isArray(matches) && matches.length ? 'found' : 'not-found',
        folder, uids: Array.isArray(matches) ? matches : [] };
    }
    return result;
  } finally {
    try { if (client.authenticated) await client.logout(); } catch {}
    client.close();
  }
}

try {
  const outcome = await runControlledTest({ ledgerPath, env, send, reconcile });
  const duplicate = await runControlledTest({ ledgerPath, env,
    send: async () => { throw new Error('Duplicate gate failed'); },
    reconcile: async () => { throw new Error('Duplicate gate failed'); } });
  console.log(JSON.stringify({ ...outcome, duplicateProtection: duplicate.result }, null, 2));
  if (outcome.result !== 'accepted' && outcome.result !== 'duplicate-blocked') process.exitCode = 1;
} catch {
  console.log(JSON.stringify({ result: 'failed-or-uncertain', reason: 'Controlled test stopped; inspect durable ledger before any further action' }));
  process.exitCode = 1;
}
