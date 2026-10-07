import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

// Never serialize environment contents or password values.
const source = readFileSync('.env.first-contact.staging.local', 'utf8');
const parsed = parseEnv(source);
const expected = {
  FIRST_CONTACT_SMTP_HOST: 'gtxm1357.siteground.biz', FIRST_CONTACT_SMTP_PORT: '465',
  FIRST_CONTACT_SMTP_USER: 'outreach@experimental-llc.com',
  FIRST_CONTACT_IMAP_HOST: 'gtxm1357.siteground.biz', FIRST_CONTACT_IMAP_PORT: '993',
  FIRST_CONTACT_IMAP_USER: 'outreach@experimental-llc.com',
};
const settings = Object.fromEntries(Object.entries(expected).map(([key, value]) => [key, {
  loaded: process.env[key] === value ? value : 'MISMATCH (value withheld)',
  matchesExpected: process.env[key] === value,
  fileMatchesExpected: parsed[key] === value,
}]));
const passwords = {};
for (const key of ['FIRST_CONTACT_SMTP_PASSWORD', 'FIRST_CONTACT_IMAP_PASSWORD']) {
  const value = process.env[key];
  const assignment = source.split(/\r?\n/).find(line => new RegExp(`^\\s*(?:export\\s+)?${key}\\s*=`).test(line));
  const raw = assignment?.slice(assignment.indexOf('=') + 1).trim() ?? '';
  const quoted = /^["'`]/.test(raw);
  passwords[key] = {
    variablePresent: value !== undefined,
    parsedCharacterLength: value === undefined ? 0 : [...value].length,
    appearsTruncatedByEnvParsing: !quoted && raw.includes('#'),
    malformedQuoting: quoted && (raw.length < 2 || raw.at(-1) !== raw[0]),
    parsedIncludesOtherAssignments: Boolean(parsed[key]?.includes('FIRST_CONTACT_')),
    quotingRequired: /[#\r\n]|^\s|\s$/.test(value ?? '') || (!quoted && raw.includes('#')),
    fileAndLoadedValueMatch: parsed[key] === value,
  };
}
console.log(JSON.stringify({ settings, passwords, runtime: {
  productionNodeEnv: process.env.NODE_ENV === 'production',
  productionVercelEnv: process.env.VERCEL_ENV === 'production',
  vercelPresent: Boolean(process.env.VERCEL),
  tlsValidationDisabled: process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0',
} }, null, 2));
