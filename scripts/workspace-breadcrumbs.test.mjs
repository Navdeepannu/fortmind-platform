import assert from "node:assert/strict";
import { test } from "node:test";
import { loadProjectModule } from "./load-project-module.mjs";

const {
  platformBreadcrumbs,
  settingsBreadcrumbs,
} = loadProjectModule("lib/workspace-breadcrumbs.ts");

const labels = (crumbs) => crumbs.map(({ label }) => label);

test("each top-level platform route has one predictable context", () => {
  assert.deepEqual(labels(platformBreadcrumbs("/platform/overview")), ["Workspace", "Overview"]);
  assert.deepEqual(labels(platformBreadcrumbs("/platform/cases")), ["Cases"]);
  assert.deepEqual(labels(platformBreadcrumbs("/platform/knowledge")), ["Workspace", "OSCAR Context"]);
  assert.deepEqual(labels(platformBreadcrumbs("/platform/reports")), ["Workspace", "Reports"]);
  assert.deepEqual(labels(platformBreadcrumbs("/platform/integrations")), ["Workspace", "Integrations"]);
});

test("detail pages expose real ancestor links and compact identity", () => {
  const caseCrumbs = platformBreadcrumbs("/platform/cases/FM-1048");
  assert.deepEqual(labels(caseCrumbs), ["Cases", "FM-1048"]);
  assert.equal(caseCrumbs[0].href, "/platform/cases");
  assert.equal(caseCrumbs[1].copyValue, "FM-1048");
  assert.equal(caseCrumbs[1].href, undefined);
  assert.deepEqual(labels(platformBreadcrumbs("/platform/cases/case-detail")), [
    "Cases", "13845102",
  ]);
  assert.equal(platformBreadcrumbs("/platform/cases/boxed-layout")[1].copyValue,
    "13845102-e81a-479e-87db-2cdb8ff21c1c");
  assert.deepEqual(labels(platformBreadcrumbs("/platform/cases/layout-lab")), ["Cases", "Layout lab"]);
  const integration = platformBreadcrumbs("/platform/integrations/microsoft-365");
  assert.deepEqual(labels(integration), ["Workspace", "Integrations", "Microsoft 365"]);
  assert.equal(integration[1].href, "/platform/integrations");
  assert.equal(integration[2].href, undefined);
  assert.deepEqual(labels(platformBreadcrumbs("/platform/integrations/unrecognized")), [
    "Workspace", "Integrations", "Integration",
  ]);
});

test("settings top bar maps actual nested routes without invented navigation", () => {
  assert.deepEqual(labels(settingsBreadcrumbs("/settings/fortcases/investigations")), [
    "Settings", "FortCases", "Investigations",
  ]);
  assert.deepEqual(labels(settingsBreadcrumbs("/settings/fortcases/spend-impact")), [
    "Settings", "FortCases", "Spend & Impact",
  ]);
  assert.equal(settingsBreadcrumbs("/settings/fortcases/alerts")[0].href, "/settings");
  assert.deepEqual(labels(settingsBreadcrumbs("/settings/trust-data")), [
    "Settings", "Trust & Data",
  ]);
  assert.deepEqual(labels(settingsBreadcrumbs("/settings/notifications")), [
    "Settings", "Notifications",
  ]);
});
