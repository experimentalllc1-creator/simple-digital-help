import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {MILO_PACKAGE_FILES,miloEmail} from '../src/lib/milo-assets.server.ts';

const approval=JSON.parse(await readFile('tests/fixtures/milo-approved-morning-baseline.json','utf8'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const approvedCodes=['PD-BMM-US','PD-BUILD-US',
  'PD-PM-FL','PD-PM-TX','PD-PM-CA','PD-PM-NORTHEAST','PD-PM-SOUTHEAST',
  'PD-PM-MIDWEST','PD-PM-SOUTHWEST','PD-PM-MOUNTAIN-WEST','PD-PM-PACIFIC-NORTHWEST'];

test('approved morning transition pins precisely eleven variants and preserves their current twenty-two delivery files',async()=>{
  assert.equal(Object.keys(approval.packages).length,22);
  assert.deepEqual([...new Set(Object.values(approval.packages).map(entry=>entry.productCode))].sort(),[...approvedCodes].sort());
  for(const code of approvedCodes){
    assert.equal(MILO_PACKAGE_FILES[code].length,2);
    for(const file of MILO_PACKAGE_FILES[code]){
      const entry=approval.packages[file.filename];
      assert.equal(entry.productCode,code);
      assert.match(entry.previous,/^[a-f0-9]{64}$/);
      assert.notEqual(entry.previous,entry.approved);
      assert.equal(file.sha256,entry.approved);
      assert.equal(sha(await readFile('docs/Products/MILO/'+file.filename)),entry.approved);
    }
  }
});

test('approved prompts require flexible local mornings, original weekdays, expiration and preservation of installed automations',async()=>{
  for(const code of approvedCodes){
    const file=MILO_PACKAGE_FILES[code].find(file=>file.filename.endsWith('.txt'));
    const prompt=await readFile('docs/Products/MILO/'+file.filename,'utf8');
    assert.match(prompt,/morning/i,code);
    assert.match(prompt,/flexible morning daypart|Do not substitute a fixed-hour trigger/,code);
    assert.match(prompt,/52 weeks/,code);
    assert.match(prompt,/daylight-saving/,code);
    assert.match(prompt,/timezone/,code);
    assert.match(prompt,/Do not alter an already-installed customer automation/,code);
    assert.doesNotMatch(prompt,/9(?::00)?\s*AM/i,code);
    if(code==='PD-BMM-US'){
      assert.match(prompt,/Weekly recurrence remains Monday/);
      assert.match(prompt,/up to 2 NEW/);
    }else if(code==='PD-BUILD-US'){
      assert.match(prompt,/Monday-Friday only/);
      assert.match(prompt,/maximum 260/i);
    }else{
      assert.match(prompt,/Every weekday morning, in your local time zone\./);
      assert.match(prompt,/maximum 1,300/i);
    }
  }
});

test('approved schedule emails match explicit revised snapshots and contain no corrupted dash characters',async()=>{
  assert.deepEqual(Object.keys(approval.emailSnapshots).sort(),[...approvedCodes].sort());
  for(const code of approvedCodes){
    const mail=await miloEmail('preservation@example.test','cs_preservation',code);
    assert.equal(sha(JSON.stringify(mail)),approval.emailSnapshots[code].approved,code);
    assert.doesNotMatch(mail.subject+mail.text,/\u00e2\u20ac/,code);
    assert.doesNotMatch(mail.text,/9(?::00)?\s*AM/i,code);
  }
});
