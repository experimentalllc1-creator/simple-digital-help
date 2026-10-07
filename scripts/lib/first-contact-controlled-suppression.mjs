import { openSync, writeSync, fsyncSync, closeSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export function isReplyOptOut(text) {
  // Classify only current reply text, excluding quoted originals and signatures.
  const current = String(text).split(/^\s*(?:On .+wrote:|From:|>|--\s*$|-{2,}\s*Original Message)/im)[0];
  return /\b(stop|unsubscribe|opt[ -]?out|remove me|do not (?:email|contact|send)|don't (?:email|contact|send)|not interested|no thanks)\b/i.test(current.trim());
}

export function correlateReply(parsed, original) {
  const references = Array.isArray(parsed.references) ? parsed.references : [parsed.references];
  const ids = [parsed.inReplyTo, ...references].flatMap(value => String(value ?? '').match(/<[^<>\s]+>/g) ?? []);
  const from = parsed.from?.value ?? [];
  const to = parsed.to?.value ?? [];
  const auto = String(parsed.headers?.get('auto-submitted') ?? 'no').toLowerCase();
  return ids.includes(original.messageId) && parsed.messageId !== original.messageId &&
    from.length === 1 && from[0].address?.toLowerCase() === original.recipient.toLowerCase() &&
    to.some(value => value.address?.toLowerCase() === original.from.toLowerCase()) && auto === 'no';
}

export function readSuppression(path) {
  let record;
  try { record = JSON.parse(readFileSync(path, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return undefined; throw new Error('Suppression store is unreadable; sending must remain blocked'); }
  if (record.version !== 1 || record.reason !== 'reply-opt-out' || !record.originalMessageId ||
      !record.recipient || !record.businessKey || !record.prospectKey || !record.eventId) {
    throw new Error('Invalid suppression record; sending must remain blocked');
  }
  return record;
}

export function suppressionDecision(path, recipient, businessKey, prospectKey) {
  const record = readSuppression(path);
  return { recipientBlocked: Boolean(record && record.recipient === recipient.toLowerCase()),
    businessBlocked: Boolean(record && record.businessKey === businessKey.toLowerCase()),
    prospectBlocked: Boolean(record && record.prospectKey === prospectKey) };
}

export function persistReplySuppression(path, original, evidence) {
  const record = { version: 1, reason: 'reply-opt-out', recipient: original.recipient.toLowerCase(),
    businessKey: original.recipient.split('@')[1].toLowerCase(), prospectKey: original.testKey,
    originalMessageId: original.messageId, eventId: evidence.eventId, replyMessageId: evidence.replyMessageId,
    replyTextSha256: createHash('sha256').update(evidence.text).digest('hex'), createdAt: new Date().toISOString() };
  let fd;
  try { fd = openSync(path, 'wx', 0o600); }
  catch (error) { if (error.code !== 'EEXIST') throw new Error('Could not reserve suppression store'); }
  if (fd !== undefined) {
    try {
      const buffer = Buffer.from(JSON.stringify(record) + '\n');
      let offset = 0;
      while (offset < buffer.length) offset += writeSync(fd, buffer, offset, buffer.length - offset);
      fsyncSync(fd);
    } finally { closeSync(fd); }
  }
  const persisted = readSuppression(path);
  if (persisted.originalMessageId !== original.messageId || persisted.recipient !== record.recipient ||
      persisted.businessKey !== record.businessKey || persisted.prospectKey !== record.prospectKey) {
    throw new Error('Suppression read-back verification failed');
  }
  return persisted;
}
