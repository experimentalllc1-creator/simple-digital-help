import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
const origin = new URL(process.argv[2] ?? 'http://127.0.0.1:3104');
assert.ok(['localhost','127.0.0.1','[::1]'].includes(origin.hostname), 'Repository QA is localhost-only');
const manifest = JSON.parse(await readFile('src/lib/milo-v24-packages.server.json','utf8'));
const familySlugs = {ROOF:'roofing-contractors',HVAC:'hvac-contractors',PLUMB:'plumbing-contractors',ELEC:'electrical-contractors',GC:'general-contractors',BMM:'building-materials-manufacturers'};
const get = path => fetch(new URL(path, origin));
for(const code of Object.keys(manifest)) {
  const [,family,...tokens] = code.split('-');
  const region = ({FL:'florida',TX:'texas',CA:'california'})[tokens.join('-')] ?? tokens.join('-').toLowerCase();
  const slug = `milo-${region}-${familySlugs[family]}`;
  const response = await get(`/products/${slug}`); assert.equal(response.status,200,slug);
  const html = await response.text();
  for(const field of ['Date added','Business name','City','Region','Customer type','Verified business website','Contacted? (customer-owned)','Email (customer-owned)','Phone (customer-owned)','Notes (customer-owned)']) assert.ok(html.includes(field),`${slug}: ${field}`);
  assert.ok(html.includes('starts as No for new prospects and belongs to you afterward'),slug);
  assert.ok(html.includes('Milo never changes those cells'),slug);
  assert.ok(html.includes('52 weeks') && html.includes('$99'),slug);
  assert.ok(!html.includes('First Contact'),slug);
  for(const file of manifest[code]) assert.equal((await get('/docs/Products/MILO/'+file.filename)).status,404,file.filename);
}
for(const file of ['Milo_FL_Roofing_Product_Spec_v2.4.md','Milo_Roofing_Installation_Prompt_Template_v2.4.txt']) assert.equal((await get('/docs/Products/MILO/'+file)).status,404,file);
const movie = await fetch(new URL('/milo-spreadsheet-v2-4.mp4',origin),{headers:{Range:'bytes=0-1023'}});
assert.equal(movie.status,206); assert.equal((await movie.arrayBuffer()).byteLength,1024);
assert.equal((await get('/milo-spreadsheet-v2-4.png')).status,200);
const success = await (await get('/checkout/success')).text(); assert.ok(success.includes('Milo v2.4'));
assert.equal((await fetch(new URL('/api/checkout/milo',origin),{method:'POST',headers:{origin:'https://invalid.example'}})).status,503);
assert.equal((await fetch(new URL('/api/webhooks/stripe',origin),{method:'POST',body:'{}'})).status,400);
// Same-origin calls also fail closed because the local QA server disables checkout/delivery.
assert.equal((await fetch(new URL('/api/checkout/milo',origin),{method:'POST',headers:{origin:origin.origin},body:new URLSearchParams({product:'milo-florida-roofing-contractors'})})).status,503);
const result = {productPages:Object.keys(manifest).length,privateDeliveryFilesBlocked:Object.values(manifest).flat().length,mastersBlocked:true,mediaPlayback:true,version:'2.4',checkoutDisabled:true,disabledAPIsFailClosed:true};
await writeFile('.qa/v2.4/storefront-verification.json',JSON.stringify(result,null,2)+'\n');
console.log('PASS: '+JSON.stringify(result));
