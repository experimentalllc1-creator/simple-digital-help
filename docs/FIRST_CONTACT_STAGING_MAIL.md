# First Contact staging mail

The isolated staging tools use Nodemailer for SMTP and ImapFlow for IMAP. They
retain TLS verification, bounded timeouts, redacted diagnostics and production
runtime guards. They are separate from the production website's Resend sending.

The committed staging environment example contains placeholders only. Keep actual
account identifiers, hosts, passwords and test recipients in the Git-ignored
`.env.first-contact.staging.local` file. Never copy it into Git, public artifacts
or production configuration.

Historical account-specific notes and diagnostic transcripts are omitted from
this public document. The private working-folder backup preserves the originals.
Staging connections and messages require their own explicit authorization; the
GitHub recovery does not run them.
