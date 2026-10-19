import assert from "node:assert/strict";
import { readFile, readdir, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { MILO_PACKAGE_FILES, miloAttachments, MILO_GENERAL_CONTRACTORS_PACKAGE_FILES, MILO_ELECTRICAL_PACKAGE_FILES, MILO_PLUMBING_PACKAGE_FILES, MILO_HVAC_PACKAGE_FILES, MILO_FILES, MILO_TX_FILES, MILO_CA_FILES, MILO_NORTHEAST_FILES, MILO_SOUTHEAST_FILES, MILO_MIDWEST_FILES, MILO_SOUTHWEST_FILES, MILO_MOUNTAIN_WEST_FILES, MILO_PACIFIC_NORTHWEST_FILES, MILO_V22_PACKAGE_FILES, MILO_V23_PACKAGE_FILES } from "../src/lib/milo-assets.server.ts";

// Local/build-time only: no environment loading, HTTP requests, email or deployment.
const root = process.cwd();
const projectCodes = Object.keys(MILO_PACKAGE_FILES).filter(code => code.startsWith("PD-PROJ-"));
assert.equal(projectCodes.length, 3);
const projectAttachments = (await Promise.all(projectCodes.map(code => miloAttachments(code)))).flat();
assert.equal(projectAttachments.length, 6);
const attachments = await miloAttachments();
assert.equal(attachments.length, 2);
const texasAttachments = await miloAttachments("PD-ROOF-TX");
assert.equal(texasAttachments.length, 2);
const californiaAttachments = await miloAttachments("PD-ROOF-CA");
assert.equal(californiaAttachments.length, 2);
const northeastAttachments = await miloAttachments("PD-ROOF-NORTHEAST");
assert.equal(northeastAttachments.length, 2);
const southeastAttachments = await miloAttachments("PD-ROOF-SOUTHEAST");
assert.equal(southeastAttachments.length, 2);
console.log("Both private Southeast Milo v2.4 attachments match the release.");
const midwestAttachments = await miloAttachments("PD-ROOF-MIDWEST");
assert.equal(midwestAttachments.length, 2);
console.log("Both private Midwest Milo v2.4 attachments match the release.");
const southwestAttachments = await miloAttachments("PD-ROOF-SOUTHWEST");
assert.equal(southwestAttachments.length, 2);
console.log("Both private Southwest Milo v2.4 attachments match the release.");
const mountainWestAttachments = await miloAttachments("PD-ROOF-MOUNTAIN-WEST");
assert.equal(mountainWestAttachments.length, 2);
console.log("Both private Mountain West Milo v2.4 attachments match the release.");
const pacificNorthwestAttachments = await miloAttachments("PD-ROOF-PACIFIC-NORTHWEST");
assert.equal(pacificNorthwestAttachments.length, 2);
console.log("Both private Pacific Northwest Milo v2.4 attachments match the release.");
const hvacAttachments = (await Promise.all(Object.keys(MILO_HVAC_PACKAGE_FILES).map(code => miloAttachments(code)))).flat();
assert.equal(hvacAttachments.length, 18);
const plumbingAttachments = (await Promise.all(Object.keys(MILO_PLUMBING_PACKAGE_FILES).map(code => miloAttachments(code)))).flat();
assert.equal(plumbingAttachments.length, 18);
const electricalAttachments = (await Promise.all(Object.keys(MILO_ELECTRICAL_PACKAGE_FILES).map(code => miloAttachments(code)))).flat();
assert.equal(electricalAttachments.length, 18);
const generalContractorsAttachments = (await Promise.all(Object.keys(MILO_GENERAL_CONTRACTORS_PACKAGE_FILES).map(code => miloAttachments(code)))).flat();
assert.equal(generalContractorsAttachments.length, 18);
const manufacturerAttachments = await miloAttachments("PD-BMM-US");
assert.equal(manufacturerAttachments.length,2);
console.log("Private nationwide manufacturer v2.4 attachments match the release.");
const builderAttachments = await miloAttachments("PD-BUILD-US");
assert.equal(builderAttachments.length, 2);
const architectFiles = Object.entries(MILO_PACKAGE_FILES).filter(([code]) => code.startsWith("PD-ARCH-")).flatMap(([,files]) => files);
assert.equal(architectFiles.length, 18);
for (const code of Object.keys(MILO_PACKAGE_FILES).filter(code => code.startsWith("PD-ARCH-"))) assert.equal((await miloAttachments(code)).length, 2);
const landscapingCodes = Object.keys(MILO_PACKAGE_FILES).filter(code => code.startsWith("PD-LAND-"));
assert.equal(landscapingCodes.length, 9);
for (const code of landscapingCodes) assert.equal((await miloAttachments(code)).length, 2);
const landscapingFiles = landscapingCodes.flatMap(code => MILO_PACKAGE_FILES[code]);
const landscapingAttachments = (await Promise.all(landscapingCodes.map(code => miloAttachments(code)))).flat();
assert.equal(landscapingAttachments.length, 18);
const propertyCodes = Object.keys(MILO_PACKAGE_FILES).filter(code => code.startsWith("PD-PM-"));
assert.equal(propertyCodes.length,9);
const propertyAttachments = (await Promise.all(propertyCodes.map(code => miloAttachments(code)))).flat();
assert.equal(propertyAttachments.length,18);
const hoaCodes = Object.keys(MILO_PACKAGE_FILES).filter(code => code.startsWith("PD-HOA-"));
assert.equal(hoaCodes.length,9);
const hoaAttachments = (await Promise.all(hoaCodes.map(code => miloAttachments(code)))).flat();
assert.equal(hoaAttachments.length,18);
const distributorCodes = Object.keys(MILO_PACKAGE_FILES).filter(code => code.startsWith("PD-DIST-"));
assert.equal(distributorCodes.length,9);
const distributorAttachments = (await Promise.all(distributorCodes.map(code => miloAttachments(code)))).flat();
assert.equal(distributorAttachments.length,18);
const hotelCodes = Object.keys(MILO_PACKAGE_FILES).filter(code => code.startsWith("PD-HOTEL-"));
assert.equal(hotelCodes.length,9);
const hotelAttachments = (await Promise.all(hotelCodes.map(code => miloAttachments(code)))).flat();
assert.equal(hotelAttachments.length,18);
const restaurantCodes = Object.keys(MILO_PACKAGE_FILES).filter(code => code.startsWith("PD-REST-"));
assert.equal(restaurantCodes.length,9);
const restaurantAttachments = (await Promise.all(restaurantCodes.map(code => miloAttachments(code)))).flat();
assert.equal(restaurantAttachments.length,18);
const healthcareCodes = Object.keys(MILO_PACKAGE_FILES).filter(code => code.startsWith("PD-HEALTH-"));
assert.equal(healthcareCodes.length,9);
const healthcareAttachments = (await Promise.all(healthcareCodes.map(code => miloAttachments(code)))).flat();
assert.equal(healthcareAttachments.length,18);
const allFiles = [...healthcareCodes.flatMap(code => MILO_PACKAGE_FILES[code]),...restaurantCodes.flatMap(code => MILO_PACKAGE_FILES[code]),...hotelCodes.flatMap(code => MILO_PACKAGE_FILES[code]),...distributorCodes.flatMap(code => MILO_PACKAGE_FILES[code]),...hoaCodes.flatMap(code => MILO_PACKAGE_FILES[code]),...propertyCodes.flatMap(code => MILO_PACKAGE_FILES[code]),...landscapingFiles,...architectFiles,...MILO_PACKAGE_FILES["PD-BUILD-US"],...MILO_PACKAGE_FILES["PD-BMM-US"],...Object.values(MILO_GENERAL_CONTRACTORS_PACKAGE_FILES).flat(), ...Object.values(MILO_ELECTRICAL_PACKAGE_FILES).flat(), ...Object.values(MILO_PLUMBING_PACKAGE_FILES).flat(), ...Object.values(MILO_HVAC_PACKAGE_FILES).flat(), ...MILO_FILES, ...MILO_TX_FILES, ...MILO_CA_FILES, ...MILO_NORTHEAST_FILES, ...MILO_SOUTHEAST_FILES, ...MILO_MIDWEST_FILES, ...MILO_SOUTHWEST_FILES, ...MILO_MOUNTAIN_WEST_FILES, ...MILO_PACIFIC_NORTHWEST_FILES, ...Object.values(MILO_V22_PACKAGE_FILES).flat(), ...Object.values(MILO_V23_PACKAGE_FILES).flat()];
console.log("Both private Northeast Milo v2.4 attachments match the release.");
console.log("Both private California Milo v2.4 attachments match the release.");
console.log("Both private Texas Milo v2.4 attachments match the release.");
console.log("Both private Milo v2.4 attachments match the approved release.");

allFiles.push(...projectCodes.flatMap(code => MILO_PACKAGE_FILES[code]));
const projectPrivateBytes = projectAttachments.flatMap(file => [Buffer.from(file.content, "base64"), Buffer.from(file.content)]);
const videoSource = path.join(root, "docs/Products/MILO/Milo_Installation_Video_v2.2.mp4");
const videoBytes = await readFile(videoSource);
assert.equal(createHash("sha256").update(videoBytes).digest("hex"), "834a9baed7bb1a2388e839741ad3652372c19b4a5a872f3e68398bc12b27c58a");
const videoOutput = path.join(root, "public/videos/milo-installation-v2-2.mp4");
if (process.argv.includes("--assets-only")) {
  await mkdir(path.dirname(videoOutput), { recursive: true });
  await copyFile(videoSource, videoOutput);
} else {
  assert.deepEqual(await readFile(videoOutput), videoBytes);
  for (const route of ["checkout/milo", "webhooks/stripe", "sales-audit", "webhooks/sales-audit", "checkout/milo-cart"]) {
    const tracePath = path.join(root, ".next", "server", "app", "api", route, "route.js.nft.json");
    const trace = JSON.parse(await readFile(tracePath, "utf8"));
    const traced = new Set(trace.files.map(file => path.resolve(path.dirname(tracePath), file)));
    assert.ok(![...traced].some(file => file.includes("Archive") || /Product_Spec|Template/.test(file)), "Non-delivery assets in server trace");
    for (const { filename } of allFiles) {
      assert.ok(traced.has(path.join(root, "docs", "Products", "MILO", filename)), `Missing server asset in ${route}: ${filename}`);
    }
    console.log(`${route}: all regional attachments included in the server trace.`);
  }
  const legacyAttachments = (await Promise.all(Object.keys(MILO_V22_PACKAGE_FILES).map(code => miloAttachments(code, "2.2")))).flat();
  const v23Attachments = (await Promise.all(Object.keys(MILO_V23_PACKAGE_FILES).map(code => miloAttachments(code, "2.3")))).flat();
  const privateBytes = [...healthcareAttachments,...restaurantAttachments,...hotelAttachments,...distributorAttachments,...hoaAttachments,...propertyAttachments,...landscapingAttachments,...generalContractorsAttachments, ...electricalAttachments, ...plumbingAttachments, ...hvacAttachments, ...attachments, ...texasAttachments, ...californiaAttachments, ...northeastAttachments, ...southeastAttachments, ...midwestAttachments, ...southwestAttachments, ...mountainWestAttachments, ...pacificNorthwestAttachments, ...legacyAttachments, ...v23Attachments].flatMap(file => [Buffer.from(file.content, "base64"), Buffer.from(file.content)]);
  async function verifyPublicDirectory(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) { await verifyPublicDirectory(file); continue; }
      if (!entry.isFile()) continue;
      const content = await readFile(file);
      assert.ok(!allFiles.some(asset => asset.filename === entry.name), "Private asset filename in public output");
      assert.ok(![...privateBytes, ...projectPrivateBytes].some(bytes => content.includes(bytes)), "Private asset content in public output");
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
  assert.ok(successHtml.includes("Milo v2.4") && !successHtml.includes("v1.2"));
  assert.ok(!/video/i.test(successHtml), "Success page must not promise video delivery");
  const texasSuccessHtml = await readFile(path.join(root, ".next/server/app/checkout/success/texas.html"), "utf8");
  assert.ok(texasSuccessHtml.includes("/products/milo-texas-roofing-contractors"));
  assert.ok(!/video/i.test(texasSuccessHtml));
  const californiaSuccessHtml = await readFile(path.join(root, ".next/server/app/checkout/success/california.html"), "utf8");
  assert.ok(californiaSuccessHtml.includes("/products/milo-california-roofing-contractors"));
  assert.ok(!/video/i.test(californiaSuccessHtml));
  const northeastSuccessHtml = await readFile(path.join(root, ".next/server/app/checkout/success/northeast.html"), "utf8");
  assert.ok(northeastSuccessHtml.includes("/products/milo-northeast-roofing-contractors"));
  assert.ok(!/video/i.test(northeastSuccessHtml));
  const southeastSuccessHtml = await readFile(path.join(root, ".next/server/app/checkout/success/southeast.html"), "utf8");
  assert.ok(southeastSuccessHtml.includes("/products/milo-southeast-roofing-contractors"));
  assert.ok(!/video/i.test(southeastSuccessHtml));
  const midwestSuccessHtml = await readFile(path.join(root, ".next/server/app/checkout/success/midwest.html"), "utf8");
  assert.ok(midwestSuccessHtml.includes("/products/milo-midwest-roofing-contractors"));
  assert.ok(!/video/i.test(midwestSuccessHtml));
  const southwestSuccessHtml = await readFile(path.join(root, ".next/server/app/checkout/success/southwest.html"), "utf8");
  assert.ok(southwestSuccessHtml.includes("/products/milo-southwest-roofing-contractors"));
  assert.ok(!/video/i.test(southwestSuccessHtml));
  const mountainWestSuccessHtml = await readFile(path.join(root, ".next/server/app/checkout/success/mountain-west.html"), "utf8");
  assert.ok(mountainWestSuccessHtml.includes("/products/milo-mountain-west-roofing-contractors"));
  assert.ok(!/video/i.test(mountainWestSuccessHtml));
  const pacificNorthwestSuccessHtml = await readFile(path.join(root, ".next/server/app/checkout/success/pacific-northwest.html"), "utf8");
  assert.ok(pacificNorthwestSuccessHtml.includes("/products/milo-pacific-northwest-roofing-contractors"));
  assert.ok(!/video/i.test(pacificNorthwestSuccessHtml));
  const regionsSuccessHtml = await readFile(path.join(root, ".next/server/app/checkout/success/regions.html"), "utf8");
  assert.ok(regionsSuccessHtml.includes("every purchased assignment") && regionsSuccessHtml.includes("52 weeks"));
  assert.ok(!/video/i.test(regionsSuccessHtml));
  const manufacturerSuccessHtml = await readFile(path.join(root, ".next/server/app/checkout/success/manufacturers.html"), "utf8");
  assert.ok(manufacturerSuccessHtml.includes("/products/milo-us-building-materials-manufacturers") && manufacturerSuccessHtml.includes("per run on Monday") && manufacturerSuccessHtml.includes("Every week, in the morning, in your local time zone.") && manufacturerSuccessHtml.includes("Milo v2.4"));
  assert.doesNotMatch(manufacturerSuccessHtml, /9(?::00)?\s*AM/i);
  assert.ok(!/video/i.test(manufacturerSuccessHtml));
  const builderSuccessHtml = await readFile(path.join(root, ".next/server/app/checkout/success/builders.html"), "utf8");
  assert.ok(builderSuccessHtml.includes("/products/milo-us-production-homebuilders-developers") && builderSuccessHtml.includes("Monday-Friday") && builderSuccessHtml.includes("260") && builderSuccessHtml.includes("Milo v2.4"));
  for (const file of ["src/components/storefront.tsx", "src/components/mobile-nav.tsx", "src/lib/sales-catalog.ts"]) {
    assert.ok(!(await readFile(path.join(root, file), "utf8")).includes("/support/milo-installation-v2-2"));
  }
  console.log("Hidden video page and success HTML verified.");
  console.log("Private attachment contents are absent from public files and browser bundles.");
}
