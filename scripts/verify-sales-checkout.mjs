import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.argv[3] || 'playwright');
const origin=process.argv[2];
if(!origin || new URL(origin).protocol!=='https:')throw new Error('Pass the deployed HTTPS origin');
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const response=await page.goto(origin+'/categories/sales');assert.equal(response.status(),200);
 const hire=page.getByRole('button',{name:'Hire these agents',exact:true});
 await hire.waitFor();assert.equal(await hire.isDisabled(),true);
 const milo=page.locator('article').filter({has:page.getByRole('heading',{name:'Milo · Roofing Contractors',exact:true})});
 const florida=milo.getByRole('checkbox',{name:'Florida',exact:true});
 await florida.check();await page.waitForFunction(()=>!document.querySelector('button[aria-describedby="sales-checkout-status"]').disabled);
 const summary=page.getByRole('complementary',{name:'Your Sales team'});
 assert.match(await summary.innerText(),/Total\s*\$99/);
 assert.equal(await hire.isEnabled(),true);
 assert.equal(await hire.evaluate(button=>button.form.getAttribute('action')),'/api/checkout/milo');
 assert.equal(await hire.evaluate(button=>button.form.method),'post');
 assert.equal(await page.locator('input[type="checkbox"]:not(:disabled)').count(),1);
 await florida.uncheck();assert.equal(await hire.isDisabled(),true);
 await florida.check();
 // Also preserve the separate product-page form, without creating a second session.
 const product=await browser.newPage();await product.goto(origin+'/products/milo-florida-roofing-contractors');
 const buy=product.getByRole('button',{name:'Buy Now',exact:true});assert.equal(await buy.isEnabled(),true);
 assert.equal(await buy.evaluate(button=>button.form.getAttribute('action')),'/api/checkout/milo');await product.close();
 if(process.argv.includes('--start-checkout')) {
  const requestPromise=page.waitForRequest(request=>new URL(request.url()).pathname==='/api/checkout/milo'&&request.method()==='POST');
  const responsePromise=page.waitForResponse(response=>new URL(response.url()).pathname==='/api/checkout/milo');
  await hire.click();await requestPromise;const checkout=await responsePromise;
  assert.equal(checkout.status(),303);
  await page.waitForURL('https://checkout.stripe.com/**',{timeout:60000});
  console.log('Sales Hire these agents POST reached the existing hosted Stripe checkout; no payment submitted.');
 }
 assert.equal(errors.length,0);
 console.log('Live Sales verified: Florida enables Hire, total $99, unavailable options disabled, removing Florida disables Hire, and product checkout form preserved.');
}finally{await browser.close();}
