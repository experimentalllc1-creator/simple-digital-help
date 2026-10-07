import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
// Explicit Milo-only selection: discontinued-agent tests are never invoked.
const files = (await readdir('tests')).filter(f => /^milo.*\.test\.mjs$/.test(f)).map(f => `tests/${f}`);
const run = spawnSync(process.execPath, ['--conditions=react-server', '--import', 'tsx', '--test', '--test-concurrency=4', ...files], { stdio: 'inherit' });
process.exitCode = run.status ?? 1;
