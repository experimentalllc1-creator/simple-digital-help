import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { miloAssignments } from '../src/lib/milo-assignments.ts';
import { MILO_VERSION } from '../src/lib/milo-config.server.ts';
import { MILO_PACKAGE_FILES, MILO_V23_PACKAGE_FILES, miloAttachments } from '../src/lib/milo-assets.server.ts';
import { miloPresentations } from '../src/lib/milo-presentations.ts';
import { headers, headerUpgrade, newProspectWrite } from '../scripts/lib/milo-workspace-contract.mjs';

test('45 v2.4 packages preserve assignment rules and enforce customer ownership in shipped instructions', async () => {
  assert.equal(MILO_VERSION, '2.4');
  const regional = miloAssignments.filter(a => MILO_V23_PACKAGE_FILES[a.productCode]);
  assert.equal(regional.length, 45);
  assert.equal(Object.keys(MILO_PACKAGE_FILES).length, 46);
  for (const assignment of regional) {
    const files = MILO_PACKAGE_FILES[assignment.productCode];
    const text = await readFile(`docs/Products/MILO/${files[0].filename}`, 'utf8');
    const old = await readFile(`docs/Products/MILO/${MILO_V23_PACKAGE_FILES[assignment.productCode][0].filename}`, 'utf8');
    assert.ok(files.every(f => f.filename.includes('v2.4')));
    assert.ok(text.includes(headers.join('\n')));
    for (const rule of ['A-F (Date Added', 'customer-owned thereafter', 'never populate, clear, overwrite, or otherwise modify',
      'write only A:G', 'Never send an A:J row payload', 'Never backfill No into existing rows',
      'including Yes, No, blanks, custom customer values, and formulas', 'read back and check identity before retrying',
      'next unused row after all existing data', 'If the tool cannot limit a write to A:G, stop',
      'add only Email, Phone, Notes to H1:J1', 'stop and report the exact conflict', 'Never restart the 52-week term']) {
      assert.ok(text.includes(rule), `${assignment.productCode}: ${rule}`);
    }
    assert.doesNotMatch(text, /First Contact|only routine customer edit|exactly SEVEN|seven-column shared layout|final Contacted/);
    const qualification = prompt => prompt.split('QUALIFICATION\n')[1].split('SHARED SALES WORKSPACE')[0]
      .replace(/No email or phone research or fields are part of this product\./, '')
      .replace(/Email, Phone, and Notes are customer-owned fields\. Milo does not research contact data or modify these fields\./, '').trim();
    assert.equal(qualification(text), qualification(old));
    for (const line of old.split('\n').filter(line => /territory is limited|Do not add the same business twice|A business already appearing|Monday-Friday, in the morning/.test(line))) {
      assert.ok(text.includes(line), `${assignment.productCode}: assignment rule changed`);
    }
    const attachments = await miloAttachments(assignment.productCode, '2.4');
    assert.equal(attachments.length, 2);
    for (const [i, file] of attachments.entries()) assert.equal(createHash('sha256').update(Buffer.from(file.content, 'base64')).digest('hex'), files[i].sha256);
    assert.equal(miloPresentations[assignment.slug].fields.length, 10);
    assert.doesNotMatch(JSON.stringify(miloPresentations[assignment.slug]), /First Contact|v2\.3/);
  }
  const master = await readFile('docs/Products/MILO/Milo_FL_Roofing_Installation_Prompt_v2.4.txt', 'utf8');
  const template = await readFile('docs/Products/MILO/Milo_Roofing_Installation_Prompt_Template_v2.4.txt', 'utf8');
  assert.equal(template, master.replaceAll('Florida', '{{REGION}}').replaceAll('PD-ROOF-FL', '{{PRODUCT_CODE}}'));
  const spec = await readFile('docs/Products/MILO/Milo_FL_Roofing_Product_Spec_v2.4.md', 'utf8');
  assert.doesNotMatch(spec, /First Contact|only routine manual change|seven Prospect columns/);
  assert.match(spec, /customer-owned thereafter/);
});

test('all historical v2.2/v2.3 assets remain byte-for-byte unchanged', async () => {
  const baseline = JSON.parse(await readFile('tests/fixtures/milo-v2-4-historical-baseline.json', 'utf8'));
  assert.ok(Object.keys(baseline).length > 98);
  for (const [file, hash] of Object.entries(baseline)) assert.equal(createHash('sha256').update(await readFile(file)).digest('hex'), hash, file);
});

function apply(sheet, writes) {
  for (const {range, values} of writes) {
    const m = /^(A|H)(\d+):(G|J)\d+$/.exec(range); assert.ok(m);
    const index = Number(m[2]) - 1, start = m[1] === 'A' ? 0 : 7;
    sheet[index] ??= Array(10).fill('');
    values[0].forEach((value, i) => { sheet[index][start+i] = value; });
  }
}
const prospect = ['2026-10-07', 'New Verified Business', 'Tampa', 'Florida', 'Roofing Contractors', 'https://new.example.test'];

test('QA reference: header-only upgrades, new rows and retries preserve customer cells', () => {
  const oldRows = ['Yes', 'No', '', 'Customer status', '=IF(A2,"Yes","No")'].map((status, i) =>
    ['2026-10-01', `Existing ${i}`, 'City', 'Florida', 'Roofing Contractors', `https://existing${i}.example.test`, status]);
  const sheet = [headers.slice(0,7), ...structuredClone(oldRows)];
  assert.deepEqual(headerUpgrade(sheet), [{range:'H1:J1', values:[['Email','Phone','Notes']]}]);
  apply(sheet, headerUpgrade(sheet));
  assert.deepEqual(sheet.slice(1), oldRows);
  assert.deepEqual(headerUpgrade(sheet), []);
  sheet[1].push('customer@example.test', '+1 555 123', '=A2');
  sheet.push(['','','','','','','','reserved@example.test','','Customer-only row']);
  const before = structuredClone(sheet);
  const writes = newProspectWrite(sheet, prospect, false); apply(sheet, writes);
  assert.deepEqual(sheet.slice(0, before.length), before);
  assert.deepEqual(sheet.at(-1), [...prospect, 'No', '', '', '']);
  sheet.at(-1)[6] = 'Yes'; sheet.at(-1)[7] = 'new-customer@example.test'; sheet.at(-1)[9] = 'Do not change';
  const after = structuredClone(sheet);
  assert.deepEqual(newProspectWrite(sheet, prospect, false), []);
  assert.deepEqual(headerUpgrade(sheet), []);
  assert.deepEqual(sheet, after);
  // An additional customer-type assignment preserves the other row and writes its own new A:G.
  const plumbing = [...prospect]; plumbing[4] = 'Plumbing Contractors';
  apply(sheet, newProspectWrite(sheet, plumbing, true));
  assert.deepEqual(sheet.slice(0, after.length), after);
});

test('QA reference refuses conflicting or incomplete layouts without any mutations', () => {
  for(const sheet of [[['Wrong', ...headers.slice(1)]], [headers.slice(0,7), ['','','','','','','','customer data']], [['Date Added']]]) {
    const before = structuredClone(sheet);
    assert.throws(()=>headerUpgrade(sheet), /preservation plan/);
    assert.throws(()=>newProspectWrite(sheet, prospect, false), /ten headers/);
    assert.deepEqual(sheet, before);
  }
});
