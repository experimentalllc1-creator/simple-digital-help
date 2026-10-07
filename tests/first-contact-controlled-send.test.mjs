import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve, isAbsolute } from 'node:path';
import { FROM, SUBJECT, BODY, REPLY_TEST, runControlledTest, readLedger } from '../scripts/lib/first-contact-controlled-test.mjs';
import { persistReplySuppression } from '../scripts/lib/first-contact-controlled-suppression.mjs';

const env = { FIRST_CONTACT_TEST_RECIPIENT: FROM, FIRST_CONTACT_SMTP_USER: FROM,
  FIRST_CONTACT_IMAP_USER: FROM, FIRST_CONTACT_SMTP_HOST: 'gtxm1357.siteground.biz',
  FIRST_CONTACT_IMAP_HOST: 'gtxm1357.siteground.biz', FIRST_CONTACT_SMTP_PORT: '465',
  FIRST_CONTACT_IMAP_PORT: '993', FIRST_CONTACT_SMTP_PASSWORD: 'fixture-only', FIRST_CONTACT_IMAP_PASSWORD: 'fixture-only' };
async function fixture(fn) {
  const directory = mkdtempSync(join(tmpdir(), 'fc-controlled-'));
  try { await fn(join(directory, 'ledger.jsonl')); } finally {
    const target = resolve(directory);
    const withinTemp = relative(resolve(tmpdir()), target);
    if (!withinTemp || withinTemp.startsWith('..') || isAbsolute(withinTemp)) throw new Error('Unsafe fixture cleanup path');
    rmSync(target, { recursive: true, force: true });
  }
}
test('durable reservation precedes one fixed-envelope submission; rerun blocks before network', () => fixture(async ledgerPath => {
  let calls = 0;
  const send = async message => {
    calls++;
    assert.equal(readLedger(ledgerPath).reservation.messageId, message.messageId);
    assert.deepEqual(message.envelope, { from: FROM, to: [FROM] });
    assert.equal(message.subject, SUBJECT); assert.equal(message.text, BODY);
    return { messageId: message.messageId, response: '250 queued', accepted: [FROM], rejected: [] };
  };
  const options = { ledgerPath, env, send, reconcile: async () => ({ sent: { result: 'not-found' } }) };
  const first = await runControlledTest(options);
  assert.equal(first.result, 'accepted'); assert.equal(first.ledgerVerified, true);
  assert.equal((await runControlledTest(options)).result, 'duplicate-blocked'); assert.equal(calls, 1);
}));
test('ambiguous submission and crash-damaged reservation both permanently block resubmission', () => fixture(async ledgerPath => {
  let calls = 0;
  const options = { ledgerPath, env, send: async () => { calls++; throw new Error('Disconnect after DATA'); }, reconcile: async () => assert.fail() };
  assert.equal((await runControlledTest(options)).result, 'unknown');
  assert.equal((await runControlledTest(options)).result, 'duplicate-blocked'); assert.equal(calls, 1);
  writeFileSync(ledgerPath, '{partial');
  assert.equal((await runControlledTest(options)).result, 'duplicate-blocked'); assert.equal(calls, 1);
}));
test('recipient changes fail validation before submission', () => fixture(async ledgerPath => {
  await assert.rejects(runControlledTest({ ledgerPath, env: { ...env, FIRST_CONTACT_TEST_RECIPIENT: 'external@example.com' },
    send: async () => assert.fail(), reconcile: async () => assert.fail() }));
}));

test('reply variant pins the exact message and recipient, skips reconciliation, and blocks repeat submission', () => fixture(async ledgerPath => {
  let calls = 0;
  const options = { ledgerPath, variant: 'reply', env: { ...env, FIRST_CONTACT_TEST_RECIPIENT: REPLY_TEST.recipient },
    send: async message => {
      calls++;
      assert.equal(message.from, FROM);
      assert.deepEqual(message.envelope.to, ['henry@henrypaz.com']);
      assert.equal(message.subject, 'Simple Digital Help Reply Test');
      assert.equal(message.text, 'This is a controlled First Contact reply and opt-out test. Please reply with: Please remove me from your list.');
      assert.equal(readLedger(ledgerPath).reservation.testKey, REPLY_TEST.key);
      return { response: '250 accepted', messageId: message.messageId, accepted: [REPLY_TEST.recipient], rejected: [] };
    } };
  assert.equal((await runControlledTest(options)).result, 'accepted');
  assert.equal(readLedger(ledgerPath).records.some(record => record.state === 'reconciled'), false);
  assert.equal((await runControlledTest(options)).result, 'duplicate-blocked');
  assert.equal(calls, 1);
}));

test('Henry reply suppression blocks a fresh ledger before any submission, independently of duplicate protection', () => fixture(async ledgerPath => {
  const suppressionPath = join(resolve(ledgerPath, '..'), 'suppressions.json');
  persistReplySuppression(suppressionPath, { recipient: REPLY_TEST.recipient, messageId: '<original@example.com>', testKey: REPLY_TEST.key },
    { eventId: 'INBOX:123:3', replyMessageId: '<reply@example.com>', text: 'Please remove me from your list.' });
  let calls = 0;
  const result = await runControlledTest({ ledgerPath, variant: 'reply',
    env: { ...env, FIRST_CONTACT_TEST_RECIPIENT: REPLY_TEST.recipient },
    send: async () => { calls++; assert.fail('Suppressed recipient reached transport'); } });
  assert.equal(result.result, 'suppression-blocked'); assert.equal(calls, 0);
}));
