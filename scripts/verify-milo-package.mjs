import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { miloAttachments, MILO_FILES } from "../src/lib/milo-assets.server.ts";

// Local/build-time only: no environment loading, HTTP requests, email or deployment.
const root = process.cwd();
const attachments = await miloAttachments();
assert.equal(attachments.length, 3);
console.log("All three private Milo v1.2 assets match the approved release.");

if (!process.argv.includes("--assets-only")) {
  for (const route of ["checkout/milo", "webhooks/stripe"]) {
    const tracePath = path.join(root, ".next", "server", "app", "api", route, "route.js.nft.json");
    const trace = JSON.parse(await readFile(tracePath, "utf8"));
    const traced = new Set(trace.files.map(file => path.resolve(path.dirname(tracePath), file)));
    for (const { filename } of MILO_FILES) {
      assert.ok(traced.has(path.join(root, "docs", "Products", "MILO", filename)), `Missing server asset in ${route}: ${filename}`);
    }
    console.log(`${route}: all approved files included in the server trace.`);
  }
  const privateBytes = attachments.flatMap(file => [Buffer.from(file.content, "base64"), Buffer.from(file.content)]);
  async function verifyPublicDirectory(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) { await verifyPublicDirectory(file); continue; }
      if (!entry.isFile()) continue;
      const content = await readFile(file);
      assert.ok(!MILO_FILES.some(asset => asset.filename === entry.name), "Private asset filename in public output");
      assert.ok(!privateBytes.some(bytes => content.includes(bytes)), "Private asset content in public output");
    }
  }
  await verifyPublicDirectory(path.join(root, "public"));
  await verifyPublicDirectory(path.join(root, ".next", "static"));
  console.log("Private attachment contents are absent from public files and browser bundles.");
}
