import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const ts = require("typescript");
function load(file, imports = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  new Function("require", "module", "exports", code)((name) => {
    if (name in imports) return imports[name];
    throw new Error(`Unexpected import: ${name}`);
  }, module, module.exports);
  return module.exports;
}
const matching = load("lib/opportunities/matching.ts", { "@/lib/canonical-profile": {} });
const { profileRoleQueries, fetchProfileRoleOpportunities, MAX_AUTOMATIC_ROLE_SEARCHES } = load(
  "lib/opportunities/profile-search.ts", { "./matching": matching }
);
assert.equal(MAX_AUTOMATIC_ROLE_SEARCHES, 2);
assert.deepEqual(profileRoleQueries(["Data Analyst, IT Support, Junior Database Analyst"], "entry level"), ["Data Analyst", "IT Support"]);
assert.deepEqual(profileRoleQueries([" IT Support ", "it support", "Data Analyst"], "entry level"), ["IT Support", "Data Analyst"]);
assert.deepEqual(profileRoleQueries([], "entry level"), ["entry level"]);
const input = { query: "combined fallback", location: "Johannesburg", country: "South Africa", resultsPerPage: 20 };
const job = (id) => ({ id, externalId: id, source: "adzuna", employer: "Employer", title: "Support", location: "Johannesburg", applicationUrl: "https://example.com/job" });
const result = (jobs) => ({ opportunities: jobs, status: { provider: "adzuna", status: jobs.length ? "available" : "no_jobs_found" }, diagnostics: { country: "za", query: "", location: input.location, requestUrl: "", rawCount: jobs.length, normalizedCount: jobs.length } });
const calls = [];
const merged = await fetchProfileRoleOpportunities(input, ["Data Analyst, IT Support, Other"], async (search) => {
  calls.push(search);
  return result(search.query === "Data Analyst" ? [job("1"), job("2")] : [job("2"), job("3")]);
});
assert.deepEqual(calls.map((call) => call.query), ["Data Analyst", "IT Support"]);
assert.equal(calls.length, 2);
for (const call of calls) {
  assert.equal(call.country, input.country);
  assert.equal(call.location, input.location);
  assert.equal(call.resultsPerPage, 20);
}
assert.deepEqual(merged.opportunities.map((item) => item.id), ["1", "2", "3"]);
assert.equal(merged.diagnostics.rawCount, 4);
assert.equal(merged.diagnostics.normalizedCount, 4);
for (const successfulRole of ["Data Analyst", "IT Support"]) {
  const mixed = await fetchProfileRoleOpportunities(input, ["Data Analyst", "IT Support"], async ({ query }) => result(query === successfulRole ? [job("1")] : []));
  assert.equal(mixed.opportunities.length, 1);
  assert.equal(mixed.status.status, "available");
}
// Execute the page's real branch selection to protect explicit searches, including commas.
const page = readFileSync("app/opportunities/page.tsx", "utf8");
const branch = page.slice(page.indexOf("const fetchOpportunities ="), page.indexOf("const [{ data: actions }"));
const explicitCalls = [];
const explicit = { query: "IT Support, Data Analyst", country: "South Africa", location: "South Africa" };
const execute = new Function("params", "paramText", "providerSearch", "fetchProductionOpportunities", "fetchProfileRoleOpportunities", `${branch}; return fetchOpportunities();`);
await execute(explicit, (value) => value?.trim() ?? "", explicit, async (search) => { explicitCalls.push(search); return result([job("1")]); }, () => { throw new Error("Explicit search must bypass automatic role searches"); });
assert.deepEqual(explicitCalls, [{ ...explicit, resultsPerPage: 20 }]);
