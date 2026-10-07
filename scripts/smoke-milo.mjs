import assert from "node:assert/strict";
const origin = process.argv[2];
if (!origin) throw new Error("Pass an origin; this script does not start a server.");
const local = ["localhost", "127.0.0.1", "[::1]"].includes(new URL(origin).hostname);
if (new URL(origin).protocol !== "https:" && !(local && new URL(origin).protocol === "http:")) throw new Error("Use HTTPS or an HTTP localhost QA server.");
const get = (path, options = {}) => fetch(origin + path, { ...options, redirect: "manual", signal: AbortSignal.timeout(20000) });
const html = await (await get("/products/milo-florida-roofing-contractors")).text();
assert.match(html, /\$99/);
assert.ok(html.includes("Up to 5 new qualified prospects"));
assert.ok(html.includes("Milo does not research email addresses or phone numbers"));
assert.ok(!html.includes("/support/milo-installation-v2-2"));
assert.ok(!html.includes("installation video link"));
const originStatus = (await get("/api/checkout/milo", { method: "POST", headers: { origin: "https://invalid.example" } })).status;
const signatureStatus = (await get("/api/webhooks/stripe", { method: "POST", body: "{}" })).status;
assert.ok((local ? [403, 503] : [403]).includes(originStatus));
assert.ok((local ? [400, 503] : [400]).includes(signatureStatus));
const success = await (await get("/checkout/success")).text();
assert.ok(success.includes("Milo v2.4")); assert.ok(!success.includes("v1.2"));
assert.ok(!/video/i.test(success));
const videoPage = await get("/support/milo-installation-v2-2"); assert.equal(videoPage.status, 200);
const videoHtml = await videoPage.text();
assert.ok(videoHtml.includes("noindex, nofollow")); assert.ok(videoHtml.includes("<video"));
assert.ok(videoHtml.includes("/videos/milo-installation-v2-2.mp4"));
const video = await get("/videos/milo-installation-v2-2.mp4", { headers: { Range: "bytes=0-1023" } });
assert.equal(video.status, 206); assert.match(video.headers.get("content-type"), /video\/mp4/);
assert.equal((await video.arrayBuffer()).byteLength, 1024);
for (const route of ["/", "/categories/sales", "/categories/sales/find-new-customers", "/sitemap.xml"]) {
  const response = await get(route); if (response.status === 200) assert.ok(!(await response.text()).includes("/support/milo-installation-v2-2"));
}
for (const file of ["Milo_FL_Roofing_Installation_Prompt_v2.4.txt", "Milo_Illustrated_Installation_Guide_v2.4.pdf", "Milo_FL_Roofing_Product_Spec_v2.4.md", "Archive/Milo_FL_Roofing_Installation_Prompt_v1.2.txt"]) {
  for (const prefix of ["/docs/Products/MILO/", "/MILO/", "/"]) assert.equal((await get(prefix + file)).status, 404);
}
console.log("Storefront smoke passed: product/success copy, rejected API requests, hidden noindex video with range playback, navigation exclusion, private asset 404s.");
