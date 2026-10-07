import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { fileURLToPath } from 'node:url';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { readLedger, validateControlledConfig, SUBJECT } from './lib/first-contact-controlled-test.mjs';

// Bounded header-only diagnostic. Never prints message text or raw headers.
const env = parseEnv(readFileSync(fileURLToPath(new URL('../.env.first-contact.staging.local', import.meta.url)), 'utf8'));
validateControlledConfig(env);
if (process.env.VERCEL || process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production' || process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') throw new Error('Local staging required');
const original = readLedger(fileURLToPath(new URL('../.qa/first-contact-controlled/send-ledger.jsonl', import.meta.url))).reservation;
const client = new ImapFlow({ host: env.FIRST_CONTACT_IMAP_HOST, port: 993, secure: true,
  auth: { user: env.FIRST_CONTACT_IMAP_USER, pass: env.FIRST_CONTACT_IMAP_PASSWORD },
  tls: { servername: env.FIRST_CONTACT_IMAP_HOST, rejectUnauthorized: true, minVersion: 'TLSv1.2' },
  logger: false, emitLogs: false, logRaw: false, disableAutoIdle: true,
  connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 15000 });
client.on('error', () => {});
const audit = [];
try {
  await client.connect();
  for (const folder of await client.list()) {
    if (folder.flags.has('\\Noselect')) continue;
    const mailbox = await client.mailboxOpen(folder.path, { readOnly: true });
    const row = { folder: folder.path, messageCount: mailbox.exists, recentTestHeaders: [] };
    if (mailbox.exists) {
      for await (const message of client.fetch(`${Math.max(1, mailbox.exists - 19)}:*`,
        { headers: ['Message-ID', 'In-Reply-To', 'References', 'Subject', 'From', 'To'], uid: true })) {
        const parsed = await simpleParser(message.headers ?? Buffer.alloc(0), { skipTextToHtml: true });
        const references = [parsed.inReplyTo, ...(Array.isArray(parsed.references) ? parsed.references : [parsed.references])];
        if (parsed.subject?.includes(SUBJECT) || references.some(value => value?.includes(original.messageId))) {
          row.recentTestHeaders.push({ uid: message.uid, originalMessage: parsed.messageId === original.messageId,
            subjectLooksLikeReply: /^re:/i.test(parsed.subject ?? ''),
            hasInReplyTo: Boolean(parsed.inReplyTo), hasReferences: Boolean(parsed.references),
            referencesOriginal: references.some(value => value?.includes(original.messageId)) });
        }
      }
    }
    audit.push(row);
  }
  console.log(JSON.stringify(audit, null, 2));
} catch { console.log('Header-only mailbox audit failed'); process.exitCode = 1; }
finally { try { if (client.authenticated) await client.logout(); } catch {} client.close(); }
