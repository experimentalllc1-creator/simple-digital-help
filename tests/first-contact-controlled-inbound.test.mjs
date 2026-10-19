import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { correlateReply, isReplyOptOut, persistReplySuppression, suppressionDecision } from '../scripts/lib/first-contact-controlled-suppression.mjs';

test('correlation requires original Message-ID and controlled sender; quoted opt-outs are ignored', () => {
  const original = { recipient: 'staging-user@example.com', from: 'staging-user@example.com', messageId: '<original@example.com>' };
  const parsed = { from: { value: [{ address: original.recipient }] }, to: { value: [{ address: original.from }] },
    inReplyTo: original.messageId, messageId: '<reply@example.com>', headers: new Map() };
  assert.equal(correlateReply(parsed, original), true);
  assert.equal(correlateReply({ ...parsed, inReplyTo: '<other@example.com>' }, original), false);
  assert.equal(correlateReply({ ...parsed, from: { value: [{ address: 'other@example.com' }] } }, original), false);
  assert.equal(isReplyOptOut('Thanks for the information.\nOn Monday someone wrote:\nPlease unsubscribe'), false);
  assert.equal(isReplyOptOut('Please stop contacting me.'), true);
  assert.equal(isReplyOptOut('Please remove me from your list.\nOn Monday someone wrote:\nOriginal message'), true);
  assert.equal(isReplyOptOut('Thanks.\nOn Monday someone wrote:\nPlease reply with: Please remove me from your list.'), false);
  const henryOriginal = { ...original, recipient: 'reply-recipient@example.net' };
  assert.equal(correlateReply({ ...parsed, from: { value: [{ address: 'reply-recipient@example.net' }] } }, henryOriginal), true);
});
test('suppression persists both identities atomically, is idempotent, and blocks recipient and business independently', () => {
  const directory = mkdtempSync(join(tmpdir(), 'fc-inbound-'));
  const path = join(directory, 'suppressions.json');
  try {
    const original = { recipient: 'staging-user@example.com', messageId: '<original@example.com>', testKey: 'controlled-prospect' };
    const evidence = { eventId: 'INBOX:123:2', replyMessageId: '<reply@example.com>', text: 'unsubscribe' };
    persistReplySuppression(path, original, evidence);
    persistReplySuppression(path, original, evidence);
    assert.equal(suppressionDecision(path, original.recipient, 'other.example.com', 'other').recipientBlocked, true);
    assert.equal(suppressionDecision(path, 'other@example.com', 'example.com', 'other').businessBlocked, true);
    assert.equal(suppressionDecision(path, 'other@example.com', 'other.example.com', original.testKey).prospectBlocked, true);
    writeFileSync(path, '{partial');
    assert.throws(() => suppressionDecision(path, original.recipient, 'example.com', original.testKey));
  } finally {
    const target = resolve(directory), inside = relative(resolve(tmpdir()), target);
    if (!inside || inside.startsWith('..') || isAbsolute(inside)) throw new Error('Unsafe cleanup path');
    rmSync(target, { recursive: true, force: true });
  }
});
