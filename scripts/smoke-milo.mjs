import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import path from "node:path";

const reservation = createServer();
await new Promise(resolve => reservation.listen(0, "127.0.0.1", resolve));
const port = reservation.address().port;
await new Promise(resolve => reservation.close(resolve));
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, [path.resolve("node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  windowsHide: true,
  env: { ...process.env, MILO_CHECKOUT_ENABLED: "false", MILO_DELIVERY_ENABLED: "false", NEXT_TELEMETRY_DISABLED: "1" },
  stdio: "ignore",
});
let spawnError;
server.on("error", error => { spawnError = error; });
try {
  let page;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (spawnError || server.exitCode !== null) throw new Error("Local production server could not start");
    try {
      page = await fetch(`${origin}/products/milo-florida-roofing-contractors`, { signal: AbortSignal.timeout(1000) });
      if (page.ok) break;
    } catch { /* Wait for startup, with no external requests. */ }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  assert.ok(page?.ok, "Milo product page loads");
  const html = await page.text();
  assert.match(html, /\$99/);
  assert.match(html, /<button[^>]*disabled[^>]*>Buy Now<\/button>/);
  assert.equal((await fetch(`${origin}/api/checkout/milo`, { method: "POST", headers: { origin } })).status, 503);
  assert.equal((await fetch(`${origin}/api/checkout/milo`)).status, 405);
  assert.equal((await fetch(`${origin}/api/webhooks/stripe`, { method: "POST", body: "{}" })).status, 400);
  assert.equal((await fetch(`${origin}/checkout/success`)).status, 200);
  for (const file of ["Milo_FL_Roofing_Installation_Prompt_v1.2.txt", "Milo_Illustrated_Installation_Guide_v1.2.pdf", "Milo_Video_Disclaimer_v1.2.txt"]) {
    for (const prefix of ["/docs/Products/MILO/", "/MILO/", "/"]) {
      assert.equal((await fetch(`${origin}${prefix}${file}`)).status, 404, "Paid file is not publicly served");
    }
  }
  console.log("Local production smoke checks passed: $99 page, disabled Buy Now/checkout, signature requirement, success page, and private-file 404s.");
} finally {
  if (server.exitCode === null && !spawnError) {
    const exited = once(server, "exit");
    server.kill();
    await exited;
  }
}
