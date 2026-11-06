import assert from "node:assert/strict";
import { test } from "node:test";
import { loadProjectModule } from "./load-project-module.mjs";

const { platformCases, findPlatformCase } = loadProjectModule("lib/platform-cases.ts");
const { cases } = loadProjectModule("lib/preview-data.ts");
const { runningCases } = loadProjectModule("lib/overview-data.ts");
const { caseOverview } = loadProjectModule("lib/case-overview-data.ts");
const { caseHref, integrationHref } = loadProjectModule("lib/platform-routes.ts");

test("all queue fixtures resolve unchanged, and every Overview running case has a matching detail", () => {
  assert.equal(new Set(platformCases.map(item => item.id)).size, platformCases.length);
  for (const item of cases) assert.equal(findPlatformCase(item.id), item);
  for (const item of runningCases) {
    const detail = findPlatformCase(item.id);
    assert.equal(detail.title, item.title);
    assert.equal(detail.status, "Running");
    assert.equal(detail.entities.hostname, item.host);
  }
  assert.equal(findPlatformCase("missing"), undefined);
});

test("the screenshot-derived LSASS investigation keeps its UUID and never replaces another case", () => {
  assert.equal(caseOverview.id, "13845102-e81a-479e-87db-2cdb8ff21c1c");
  assert.notEqual(caseOverview.title, findPlatformCase("FM-1048").title);
  assert.equal(caseHref(caseOverview.id), `/platform/cases/${caseOverview.id}`);
  assert.equal(caseHref("FM-1048"), "/platform/cases/FM-1048");
  assert.equal(integrationHref("microsoft-365"), "/platform/integrations/microsoft-365");
});

test("detail links encode identifiers as a single route segment", () => {
  assert.equal(caseHref("a/b?#"), "/platform/cases/a%2Fb%3F%23");
  assert.equal(integrationHref("a/b?#"), "/platform/integrations/a%2Fb%3F%23");
});
