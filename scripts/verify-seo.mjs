import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const base = process.env.SEO_BASE_URL || "http://localhost:3100";
const site = "https://www.mzfortech.com";
const report = [];
const logo = await readFile(new URL("../public/model-zero-logo.png", import.meta.url));
assert.equal(logo.readUInt32BE(16), 512);
assert.equal(logo.readUInt32BE(20), 512);
const strip = (value) => value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const decode = (value) => value.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#x27;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
const request = (path, agent = "GPTBot", options = {}) => fetch(base + path, { headers: { "User-Agent": agent }, signal: AbortSignal.timeout(30000), ...options });
const redirect = await request("/home?source=seo-check", "GPTBot", { redirect: "manual" });
assert.equal(redirect.status, 301);
assert.equal(new URL(redirect.headers.get("location"), base).pathname, "/");
const sitemapResponse = await request("/sitemap.xml");
assert.equal(sitemapResponse.status, 200);
const sitemap = await sitemapResponse.text();
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.equal(new Set(locations).size, locations.length, "duplicate sitemap locations");
assert(!sitemap.includes(`${site}/home`));
assert(!locations.some((url) => /\.(txt|md)$/.test(url)));
assert.equal((sitemap.match(/<lastmod>/g) || []).length, locations.length);
const titles = new Set();
const descriptions = new Set();
for (const url of locations) {
  const path = new URL(url).pathname;
  const response = await request(path);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert(!/TODO_OWNER|El Mahalla|ownership percentages/i.test(html), `${path}: private or unfinished structured data`);
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "");
  assert(title.length && title.length <= 60, `${path}: title length ${title.length}`);
  assert(path === "/" || title.endsWith("| Model Zero"), `${path}: title suffix`);
  assert(!titles.has(title), `${path}: duplicate title ${title}`); titles.add(title);
  const description = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] || "");
  assert(description.length >= 140 && description.length <= 155, `${path}: description length ${description.length}`);
  assert(!descriptions.has(description), `${path}: duplicate description`); descriptions.add(description);
  assert(!html.includes('name="keywords"'), `${path}: keywords meta`);
  const canonical = decode(html.match(/rel="canonical" href="([^"]+)"/)?.[1] || "");
  assert.equal(new URL(canonical).href, new URL(site + path).href, `${path}: canonical`);
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${path}: H1 count`);
  if (path === "/") {
    const heading = strip(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] || "");
    assert.equal(heading, "RESEARCH. SOFTWARE. KNOWLEDGE.", "homepage heading must have one readable copy of each word");
  }
  const scripts = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
  assert(scripts.length, `${path}: missing JSON-LD`);
  const nodes = scripts.flatMap((data) => data["@graph"] || [data]);
  const organization = nodes.find((node) => node["@id"] === `${site}/#organization`);
  assert(organization?.sameAs.includes("https://www.linkedin.com/company/mzfortech"), `${path}: LinkedIn`);
  const publicText = decode(strip(html));
  assert(!/TODO_OWNER|lorem ipsum|example\.com|El Mahalla|ownership percentages/i.test(publicText), `${path}: public placeholder/private fact`);
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || html;
  const wordCount = strip(main).split(/\s+/).length;
  if (path === "/services") assert(wordCount >= 800, `services words: ${wordCount}`);
  if (/^\/services\//.test(path)) assert(wordCount >= 600, `${path} words: ${wordCount}`);
  if (path === "/about") {
    assert(wordCount >= 500, `about words: ${wordCount}`);
    const firstParagraph = decode(strip(main.match(/<p\b[^>]*>([\s\S]*?)<\/p>/)?.[1] || ""));
    assert(firstParagraph.startsWith("Model Zero (MZ) is a software and artificial-intelligence company based in Cairo, Egypt."), "about first paragraph");
  }
  for (const faq of nodes.filter((node) => node["@type"] === "FAQPage")) for (const question of faq.mainEntity) {
    assert(publicText.includes(question.name), `${path}: visible FAQ question`);
    assert(publicText.includes(question.acceptedAnswer.text), `${path}: visible FAQ answer`);
  }
  const isArabic = path === "/ar" || path.startsWith("/ar/") || path === "/research/ar" || path.startsWith("/research/ar/");
  assert(new RegExp(`<html[^>]+lang="${isArabic ? "ar" : "en"}"`).test(html), `${path}: document language`);
  if (isArabic) assert(/<html[^>]+dir="rtl"/.test(html), `${path}: document direction`);
  report.push({ path, status: response.status, title, descriptionLength: description.length, wordCount, structuredDataNodes: nodes.length });
}
for (const agent of ["GPTBot", "ClaudeBot"]) for (const path of ["/", "/services", "/about"]) {
  const response = await request(path, agent); const html = await response.text();
  assert.equal(response.status, 200); assert(html.includes("application/ld+json")); assert(html.includes("Model Zero"));
  report.push({ agent, path, status: response.status, jsonLd: true, excerpt: strip(html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/)?.[1] || "").slice(0, 350) });
}
for (const path of ["/llms.txt", "/llms-full.txt", "/content.md"]) {
  const response = await request(path); assert.equal(response.status, 200);
  const text = await response.text(); assert(text.includes("Model Zero (MZ) is a software and artificial-intelligence company based in Cairo, Egypt."));
  for (const url of locations) assert(text.includes(url), `${path}: missing ${url}`);
  assert(!/TODO_OWNER|lorem ipsum|example\.com|El Mahalla/i.test(text));
}
assert.equal((await request("/services/unknown-service")).status, 404);
assert.equal((await request("/ar/unknown-page")).status, 404);
const markdownResponse = await request("/services", "GPTBot", { headers: { "User-Agent": "GPTBot", Accept: "text/markdown" }, redirect: "manual" });
assert.equal(markdownResponse.status, 307);
assert.equal(new URL(markdownResponse.headers.get("location"), base).pathname, "/content.md");
const robots = await (await request("/robots.txt")).text();
for (const agent of ["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "Bingbot"]) assert(robots.includes(`User-agent: ${agent}`));
await mkdir("docs/seo-reports", { recursive: true });
await writeFile("docs/seo-reports/html-verification.json", JSON.stringify(report, null, 2) + "\n");
console.log(`Verified ${locations.length} canonical pages, both bot user agents, discovery exports, redirects and 404s.`);
