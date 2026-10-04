import assert from "node:assert/strict";
import { readFile, readdir, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { miloAttachments, MILO_FILES } from "../src/lib/milo-assets.server.ts";

// Local/build-time only: no environment loading, HTTP requests, email or deployment.
const root = process.cwd();
const attachments = await miloAttachments();
assert.equal(attachments.length, 2);
console.log("Both private Milo v2.2 attachments match the approved release.");

const videoSource = path.join(root, "docs/Products/MILO/Milo_Installation_Video_v2.2.mp4");
const videoBytes = await readFile(videoSource);
assert.equal(createHash("sha256").update(videoBytes).digest("hex"), "834a9baed7bb1a2388e839741ad3652372c19b4a5a872f3e68398bc12b27c58a");
const videoOutput = path.join(root, "public/videos/milo-installation-v2-2.mp4");
if (process.argv.includes("--assets-only")) {
  await mkdir(path.dirname(videoOutput), { recursive: true });
  await copyFile(videoSource, videoOutput);
} else {
  assert.deepEqual(await readFile(videoOutput), videoBytes);
  for (const route of ["checkout/milo", "webhooks/stripe"]) {
    const tracePath = path.join(root, ".next", "server", "app", "api", route, "route.js.nft.json");
    const trace = JSON.parse(await readFile(tracePath, "utf8"));
    const traced = new Set(trace.files.map(file => path.resolve(path.dirname(tracePath), file)));
    assert.ok(![...traced].some(file => file.includes("Archive") || file.endsWith("Milo_FL_Roofing_Product_Spec_v2.2.md")), "Non-delivery assets in server trace");
    for (const { filename } of MILO_FILES) {
      assert.ok(traced.has(path.join(root, "docs", "Products", "MILO", filename)), `Missing server asset in ${route}: ${filename}`);
    }
    console.log(`${route}: both approved attachments included in the server trace.`);
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
  const hiddenHtml = await readFile(path.join(root, ".next/server/app/support/milo-installation-v2-2.html"), "utf8");
  assert.ok(hiddenHtml.includes('name="robots" content="noindex, nofollow"'));
  assert.ok(hiddenHtml.includes("<video") && hiddenHtml.includes("/videos/milo-installation-v2-2.mp4"));
  assert.ok(hiddenHtml.includes("Follow this video together with your Milo v2.2 Illustrated Installation Guide."));
  assert.ok(!hiddenHtml.includes('href="/videos/milo-installation-v2-2.mp4"'));
  const successHtml = await readFile(path.join(root, ".next/server/app/checkout/success.html"), "utf8");
  assert.ok(successHtml.includes("Milo v2.2") && !successHtml.includes("v1.2"));
  for (const file of ["src/components/storefront.tsx", "src/components/mobile-nav.tsx", "src/lib/sales-catalog.ts"]) {
    assert.ok(!(await readFile(path.join(root, file), "utf8")).includes("/support/milo-installation-v2-2"));
  }
  console.log("Hidden video page and success HTML verified.");
  console.log("Private attachment contents are absent from public files and browser bundles.");
}
