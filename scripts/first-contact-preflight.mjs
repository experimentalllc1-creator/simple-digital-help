// This composition root has no worker, database, Sheets or sending imports.
import { TlsSmtpDriver, TlsImapDriver, safeMailError } from '../src/lib/first-contact/tls-mail.server.ts';

const report = { mode: 'connection-preflight-only', messagesSent: 0 };
for (const [name, Driver] of [['smtp', TlsSmtpDriver], ['imap', TlsImapDriver]]) {
  try { report[name] = await new Driver().preflight(); }
  catch (error) { report[name] = { status: 'failed', diagnostic: safeMailError(error) }; }
}
console.log(JSON.stringify(report, null, 2));
if (report.smtp?.authentication?.status !== 'passed' || report.imap?.folders?.status !== 'passed') process.exitCode = 1;
