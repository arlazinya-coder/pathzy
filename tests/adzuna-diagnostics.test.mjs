import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const output = ts.transpileModule(readFileSync("lib/opportunities/providers/adzuna-provider.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText;
const logs = [];
const module = { exports: {} };
new Function("module", "exports", "console", output)(module, module.exports, {
  info: (...args) => logs.push(args)
});
const { AdzunaJobProvider } = module.exports;
const input = { query: "IT Support", country: "South Africa", location: "South Africa" };
const job = { id: "1", title: "IT Support", redirect_url: "https://example.com/job" };
const cases = [
  ["MISSING_CONFIG", "", async () => { throw new Error("must not fetch"); }, 0, 0],
  ["FETCH_EXCEPTION", "secret-id", async () => { throw new Error("secret-key private URL cookie"); }, 0, 0],
  ["HTTP_ERROR", "secret-id", async () => new Response("secret-key", { status: 429 }), 0, 0],
  ["INVALID_JSON", "secret-id", async () => new Response("secret-key"), 0, 0],
  ["INVALID_RESPONSE", "secret-id", async () => Response.json({ error: "secret-key" }), 0, 0],
  ["EMPTY_PROVIDER_RESULTS", "secret-id", async () => Response.json({ results: [] }), 0, 0],
  ["SUCCESS", "secret-id", async () => Response.json({ results: [job, job, { title: "missing ID" }] }), 3, 2]
];
for (const [category, id, fetcher, raw, normalized] of cases) {
  logs.length = 0;
  const result = await new AdzunaJobProvider(id, "secret-key", fetcher).search(input);
  assert.equal(logs.length, 1);
  const diagnostic = JSON.parse(logs[0][1]);
  assert.equal(diagnostic.failureCategory, category);
  assert.equal(diagnostic.rawCount, raw);
  assert.equal(diagnostic.normalizedCount, normalized);
  assert.equal(diagnostic.rejectedCount, raw - normalized);
  assert.equal(diagnostic.duplicateCount, category === "SUCCESS" ? 1 : 0);
  assert.equal(diagnostic.outboundFetchAttempted, category !== "MISSING_CONFIG");
  assert.equal(diagnostic.country, "za");
  assert.equal(result.opportunities.length, normalized);
  assert.doesNotMatch(JSON.stringify(logs), /secret-id|secret-key|private URL|cookie|app_key|app_id/);
}
