import 'server-only';
import { connect } from 'node:tls';
import nodemailer from 'nodemailer';
import { ImapFlow } from 'imapflow';

type Protocol = 'SMTP' | 'IMAP';
type Config = { host: string; port: number; user: string; password?: string };
export type Check = { status: 'passed' | 'blocked' | 'failed'; reason?: string; diagnostic?: ReturnType<typeof safeMailError> };
export type Preflight = { tls: Check; authentication: Check; folders?: Check; folderNames?: string[] };

// Deliberately exclude message, response, stack, auth and connection options.
export function safeMailError(error: unknown) {
  const e = error as { name?: unknown; code?: unknown; responseCode?: unknown; command?: unknown;
    authenticationFailed?: unknown; serverResponseCode?: unknown } | null;
  const token = (value: unknown) => typeof value === 'string' && /^[A-Za-z][A-Za-z0-9_]{0,48}$/.test(value)
    && !['FIRST_CONTACT_SMTP_PASSWORD', 'FIRST_CONTACT_IMAP_PASSWORD'].some(key => process.env[key] && value.includes(process.env[key]!))
    ? value : undefined;
  const command = typeof e?.command === 'string' ? e.command : '';
  return { name: token(e?.name) ?? 'Error', code: token(e?.code),
    authenticationFailed: e?.authenticationFailed === true ? true : undefined,
    serverResponseCode: token(e?.serverResponseCode),
    responseCode: typeof e?.responseCode === 'number' && e.responseCode >= 100 && e.responseCode <= 599 ? e.responseCode : undefined,
    stage: /^AUTH\b/i.test(command) || e?.code === 'EAUTH' || e?.authenticationFailed === true ? 'authentication'
      : /^(?:CONN|STARTTLS)$/i.test(command) ? 'connection-or-TLS'
      : /^(?:EHLO|HELO)$/i.test(command) ? 'before-authentication' : 'unknown',
  };
}

class PreflightConfigurationError extends Error {
  constructor(readonly code: string) { super(code); this.name = 'PreflightConfigurationError'; }
}

function stagingOnly() {
  // No deployment/runtime flag can enable production sending through this module.
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production' || process.env.VERCEL) {
    throw new PreflightConfigurationError('RUNTIME_GUARD');
  }
  if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') throw new PreflightConfigurationError('TLS_GUARD');
}

function config(protocol: Protocol): Config {
  stagingOnly();
  const prefix = `FIRST_CONTACT_${protocol}_`;
  const host = process.env[`${prefix}HOST`] ?? '';
  const portText = process.env[`${prefix}PORT`] ?? '';
  const user = process.env[`${prefix}USER`] ?? '';
  const password = process.env[`${prefix}PASSWORD`];
  if (!/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/i.test(host) || !/^\d+$/.test(portText) ||
      Number(portText) < 1 || Number(portText) > 65535 || !user || /[\r\n\0]/.test(user)) {
    throw new PreflightConfigurationError(`${protocol}_ENV_VALIDATION`);
  }
  return { host, port: Number(portText), user, password };
}

async function tlsCheck(settings: Config): Promise<Check> {
  // This socket carries no credentials and never issues a mail command.
  return new Promise(resolve => {
    const socket = connect({ host: settings.host, port: settings.port, servername: settings.host,
      rejectUnauthorized: true, minVersion: 'TLSv1.2' });
    const timer = setTimeout(() => finish({ status: 'failed', reason: 'TLS connection timed out' }), 15000);
    let finished = false;
    function finish(result: Check) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      socket.destroy();
      resolve(result);
    }
    socket.once('secureConnect', () => finish(socket.authorized
      ? { status: 'passed' } : { status: 'failed', reason: 'TLS certificate validation failed' }));
    socket.once('error', () => finish({ status: 'failed', reason: 'TLS connection or certificate validation failed' }));
  });
}

function hasPassword(settings: Config) {
  return Boolean(settings.password && settings.password !== 'ENTER_MAILBOX_PASSWORD_HERE');
}

// Intentionally expose no send/submit operation. These are real protocol drivers
// restricted to the currently authorized connection-preflight stage.
export class TlsSmtpDriver {
  async preflight(): Promise<Preflight> {
    const settings = config('SMTP');
    const tls = await tlsCheck(settings);
    if (tls.status !== 'passed') return { tls, authentication: { status: 'blocked', reason: 'TLS did not pass' } };
    if (!hasPassword(settings)) return { tls, authentication: { status: 'blocked', reason: 'Set FIRST_CONTACT_SMTP_PASSWORD in the local staging environment' } };
    const transport = nodemailer.createTransport({
      host: settings.host, port: settings.port, secure: true,
      auth: { user: settings.user, pass: settings.password! },
      tls: { servername: settings.host, rejectUnauthorized: true, minVersion: 'TLSv1.2' },
      pool: false, logger: false, debug: false,
      connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 15000, dnsTimeout: 15000,
      disableFileAccess: true, disableUrlAccess: true,
    });
    try {
      // verify performs greeting/EHLO/AUTH/QUIT, never MAIL/RCPT/DATA.
      await transport.verify();
      return { tls, authentication: { status: 'passed' } };
    } catch (error) {
      // Never expose raw library errors, server responses or credential objects.
      return { tls, authentication: { status: 'failed', reason: 'SMTP authentication/connection failed', diagnostic: safeMailError(error) } };
    } finally { transport.close(); }
  }
}

export class TlsImapDriver {
  async preflight(): Promise<Preflight> {
    const settings = config('IMAP');
    const tls = await tlsCheck(settings);
    const blocked = (reason: string): Preflight => ({ tls, authentication: { status: 'blocked', reason },
      folders: { status: 'blocked', reason: 'Authentication has not passed' } });
    if (tls.status !== 'passed') return blocked('TLS did not pass');
    if (!hasPassword(settings)) return blocked('Set FIRST_CONTACT_IMAP_PASSWORD in the local staging environment');
    const client = new ImapFlow({ host: settings.host, port: settings.port, secure: true,
      auth: { user: settings.user, pass: settings.password! },
      tls: { servername: settings.host, rejectUnauthorized: true, minVersion: 'TLSv1.2' },
      logger: false, emitLogs: false, logRaw: false, disableAutoIdle: true,
      connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 15000 });
    client.on('error', () => { /* Suppress raw errors; surfaced as fixed preflight outcomes. */ });
    let authenticated = false;
    try {
      await client.connect();
      if (!client.secureConnection || !client.authenticated) throw new Error('IMAP authentication failed');
      authenticated = true;
      // LIST only: no SELECT, FETCH, STORE, APPEND, DELETE or EXPUNGE.
      const folders = await client.list();
      return { tls, authentication: { status: 'passed' }, folders: { status: 'passed' },
        folderNames: folders.map(folder => folder.path) };
    } catch (error) {
      return { tls, authentication: { status: authenticated ? 'passed' : 'failed', diagnostic: safeMailError(error) },
        folders: { status: authenticated ? 'failed' : 'blocked' },
      };
    } finally {
      try { if (authenticated) await client.logout(); } catch { /* No raw logging. */ }
      client.close();
    }
  }
}
