import {readFile} from 'node:fs/promises';
import pg from 'pg';
if(!process.env.DATABASE_URL)throw Error('DATABASE_URL required');
const db=new pg.Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:10000});
try{
 await db.connect();
 // Prior migrations are idempotent and remain part of the same existing database.
 for(const file of ['001_milo_deliveries.sql','002_milo_identity.sql','003_milo_product_codes.sql','004_sales_audit.sql','005_milo_storefront_pricing.sql','006_customer_accounts.sql'])await db.query(await readFile(new URL('../db/migrations/'+file,import.meta.url),'utf8'));
 console.log('Customer account schema is ready. No paid orders or deliveries were changed.');
}catch{console.error('Customer account migration failed. No secrets logged. Check database permissions and conflicting customer email identities.');process.exitCode=1;}finally{await db.end();}
