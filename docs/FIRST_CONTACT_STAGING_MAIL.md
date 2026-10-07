# First Contact SMTP/IMAP staging preflight

This is an isolated connection-only integration. The provider-neutral drivers use
Nodemailer for SMTP and ImapFlow for IMAP, with implicit TLS, hostname/certificate
verification, minimum TLS 1.2, bounded connection timeouts and disabled logging.
Their public interface exposes only preflight. No SMTP send/submit method exists.
The fixture worker remains fixture-only. No production Sheets, database, Milo
module, application route, cron or deployment is involved.

## Local credentials

The populated, Git-ignored file is `.env.first-contact.staging.local` at the
repository root. It is explicitly loaded by the standalone command below;
Next.js does not automatically load this custom file. It is also excluded by the
existing Vercel upload allowlist. Do not copy it into production configuration.

Enter the mailbox password locally in BOTH blank assignments:

```dotenv
FIRST_CONTACT_SMTP_PASSWORD='your actual mailbox password'
FIRST_CONTACT_IMAP_PASSWORD='your actual mailbox password'
```

Those example words describe what to enter; they are not credentials. Use quotes
appropriate for the password so `#`, spaces and similar characters remain literal.
Do not paste the password into chat or a command line. The file stores a local
plaintext secret; Git exclusion is not encryption. Protect it as a credential file.
All other values are populated. The future test recipient defaults to
`outreach@experimental-llc.com` (self-delivery to the controlled mailbox).

Run from the repository root:

```powershell
node --env-file=.env.first-contact.staging.local --conditions=react-server --import tsx scripts/first-contact-preflight.mjs
```

The script imports only the protocol drivers. It first performs credential-free
TLS checks, then SMTP verify (greeting/EHLO/AUTH/QUIT) and IMAP authentication/LIST.
It does not fetch message bodies, mark messages read, change folders or submit
email. Fixed error summaries avoid raw library errors and server responses.
An incomplete or failed preflight exits with status 1. A passed preflight exits 0.
Production and Vercel runtimes are rejected, as is disabled global TLS validation.

## Recorded result: October 5, 2026

- SMTP implicit TLS on port 465: passed, certificate verified.
- IMAP implicit TLS on port 993: passed, certificate verified.
- SMTP authentication: blocked; password placeholder is empty.
- IMAP authentication: blocked; password placeholder is empty.
- Mailbox folder discovery: blocked pending authentication.
- TypeScript check: passed.
- Messages sent: zero.

### Subsequent credential diagnosis, October 5, 2026

Both password assignments had opening quotes without closing quotes. Node parsed
the SMTP password as a 170-character multiline value containing IMAP assignments;
the IMAP password and IMAP settings were not loaded. SMTP returned Error/EAUTH/535
during authentication, and the IMAP failure was our own IMAP_ENV_VALIDATION check,
not a runtime guard or IMAP library failure.

Only the missing closing quote on each password line was added. Password content
was preserved. All six host/port/user values now match the supplied settings.
Both password variables are present, each parses as 11 characters, neither is
truncated, and both require quoting because of special characters.

The corrected connection-only preflight still reports SMTP Error/EAUTH/535 during
authentication and IMAP Error/AUTHENTICATIONFAILED during authentication. Both
certificate-verified TLS checks pass; folder discovery is blocked. This is server
authentication rejection, not proof of a specific password or account problem.
No SiteGround settings or credentials were changed, and no messages were sent.

Next: privately confirm that the local quoted values contain the complete existing
mailbox password and that an interactive SiteGround webmail login accepts that
same mailbox/password, without changing account settings or sending a message.
If that succeeds, investigate provider authentication restrictions before any
controlled-send implementation. Do not rotate the password based on this result.

For a repeatable credential-safe environment audit:

```powershell
node --env-file=.env.first-contact.staging.local scripts/first-contact-env-diagnosis.mjs
```

The audit prints only approved matching settings, credential presence/length and
parsing flags, plus guard booleans. Preflight diagnostics allow only error names,
codes, numeric SMTP response codes and IMAP authentication flags; they do not print
raw messages, server responses, stack traces or credentials.

The initial sandbox run could not initialize tsx due to a Windows user-info
lookup restriction. The same connection-only command ran successfully outside
the sandbox and produced the results above. No authentication claim is made
until the credential-backed preflight passes.

## Next controlled test

1. Fill both local password fields and rerun preflight until both authentication
   checks and folder discovery pass. This command still sends nothing.
2. Confirm the controlled recipient (currently self-delivery), approve the exact
   subject/body and explicitly authorize ONE staging email.
3. In the next authorized phase, implement a separate single-use controlled-send
   composition root: exactly one allowlisted envelope recipient, no worker or
   Sheets imports, no SMTP automatic retries, a unique Message-ID, final DATA
   acceptance evidence, and read-only IMAP receipt verification. Record an uncertain
   submission as unknown and do not retry it automatically.

There is deliberately no send command to run in this phase. A successful
authentication preflight does not activate any sending.
