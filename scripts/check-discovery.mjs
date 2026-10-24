import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const origin = "https://www.mzfortech.com";
const publicFile = (url) => {
  const target = new URL(url, origin);
  assert.equal(target.origin, origin, "Discovery links must use the canonical origin");
  return new URL(`../public${target.pathname}`, import.meta.url);
};
const readJson = async (path) => JSON.parse(await readFile(publicFile(path), "utf8"));

const index = await readJson("/.well-known/agent-skills/index.json");
assert.equal(index.$schema, "https://schemas.agentskills.io/discovery/0.2.0/schema.json");
assert.ok(index.skills.length > 0);
for (const skill of index.skills) {
  const bytes = await readFile(publicFile(skill.url));
  assert.equal(skill.digest, `sha256:${createHash("sha256").update(bytes).digest("hex")}`, "Skill digest is stale");
  assert.match(bytes.toString(), new RegExp(`^---\\nname: ${skill.name}\\n`));
}

const catalog = await readJson("/.well-known/ai-catalog.json");
assert.equal(catalog.specVersion, "1.0");
assert.ok(catalog.host.identifier && catalog.host.displayName);
assert.ok(catalog.entries.length > 0);
assert.equal(new Set(catalog.entries.map((entry) => entry.identifier)).size, catalog.entries.length);
for (const entry of catalog.entries) {
  assert.match(entry.identifier, /^urn:air:www\.mzfortech\.com:[a-z0-9-]+:[a-z0-9-]+$/);
  assert.ok(entry.displayName && entry.type.includes("/"));
  assert.notEqual("url" in entry, "data" in entry, "Each entry needs exactly one of url or data");
  assert.ok(entry.representativeQueries.length >= 2 && entry.representativeQueries.length <= 5);
  if (entry.url) await readFile(publicFile(entry.url));
}

const apiCatalog = await readJson("/.well-known/api-catalog");
const spec = await readJson("/openapi.json");
assert.ok(apiCatalog.linkset.length > 0);
for (const entry of apiCatalog.linkset.filter((entry) => entry["service-desc"])) {
  assert.ok(new URL(entry.anchor).pathname in spec.paths, "Catalog API must exist in OpenAPI");
  for (const relation of ["service-desc", "service-doc"]) {
    assert.ok(entry[relation].length > 0);
    for (const link of entry[relation]) await readFile(publicFile(link.href));
  }
}
assert.match(await readFile(publicFile("/robots.txt"), "utf8"), /User-agent: \*\nContent-Signal: ai-train=no, search=yes, ai-input=no\n/);
console.log("Discovery links, catalogs, content signals, and skill digests passed.");
