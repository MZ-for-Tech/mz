import { readFile } from "node:fs/promises";

// Run after a successful deployment. Protocol: https://www.indexnow.org/documentation
const site = "https://www.mzfortech.com";
const key = (await readFile(new URL("../public/indexnow-key.txt", import.meta.url), "utf8")).trim();
if (!/^[a-zA-Z0-9-]{8,128}$/.test(key)) throw new Error("Invalid IndexNow key");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const supplied = args.filter((argument) => argument !== "--dry-run");
let urls = supplied.map((value) => new URL(value, site).href);
if (!urls.length) {
  const response = await fetch(`${site}/sitemap.xml`, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Sitemap returned ${response.status}`);
  const xml = await response.text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].replaceAll("&amp;", "&"));
}
urls = [...new Set(urls)];
if (!urls.length || urls.length > 10000) throw new Error("Submit between 1 and 10,000 URLs");
for (const url of urls) {
  const parsed = new URL(url);
  if (parsed.origin !== site || parsed.username || parsed.password || parsed.hash) throw new Error(`Invalid site URL: ${url}`);
}
const body = { host: new URL(site).host, key, keyLocation: `${site}/indexnow-key.txt`, urlList: urls };
if (dryRun) {
  console.log(JSON.stringify(body, null, 2));
} else {
  const verification = await fetch(body.keyLocation, { signal: AbortSignal.timeout(20000) });
  if (!verification.ok || (await verification.text()).trim() !== key) throw new Error("Deploy the matching IndexNow key file before submitting");
  const response = await fetch("https://api.indexnow.org/indexnow", { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(body), signal: AbortSignal.timeout(20000) });
  if (![200, 202].includes(response.status)) throw new Error(`IndexNow returned ${response.status}: ${await response.text()}`);
  console.log(`IndexNow accepted ${urls.length} URLs (${response.status}).`);
}
