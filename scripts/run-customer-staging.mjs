import {loadEnvFile} from 'node:process';
import {spawn} from 'node:child_process';
loadEnvFile('.qa/customer-staging.env');
if(process.env.STRIPE_MODE!=='test'||new URL(process.env.DATABASE_URL).pathname!=='/sdh_accounts_staging_20261020')throw Error('Isolated staging environment required');
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3210'],{stdio:'inherit',env:process.env,windowsHide:true});
child.on('exit',code=>{process.exitCode=code??1});
