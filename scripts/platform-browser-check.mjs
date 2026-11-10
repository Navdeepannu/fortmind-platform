import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadProjectModule } from "./load-project-module.mjs";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const { platformCases } = loadProjectModule("lib/platform-cases.ts");
const { caseOverview } = loadProjectModule("lib/case-overview-data.ts");
const { previewIntegrations } = loadProjectModule("lib/preview-integrations.ts");
const origin = process.env.PLATFORM_ORIGIN || "http://localhost:3000";
const output = resolve(process.env.PLATFORM_OUTPUT || "/tmp/fortmind-platform-validation");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {}) });
const report = { routes: [], checks: [], errors: [], warnings: [] };
let page;
async function visit(path, heading, section) {
  const response = await page.goto(origin + path, { waitUntil: "load" });
  assert.equal(response.status(), 200, path);
  await page.getByRole("heading", { level: 1, name: heading, exact: true }).waitFor();
  assert.equal(await page.locator('[data-ui~=sidebar] [aria-current="page"]').getAttribute("aria-label"), section);
  assert.equal(await page.locator('[data-slot="sidebar-wrapper"]').count(), 1, "one workspace shell");
  assert.equal(await page.locator('a[href^="/design-preview"], a[href^="/design-system"]').count(), 0);
  report.routes.push(path);
}
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
  page = await context.newPage();
  page.on("pageerror", error => report.errors.push(error.message));
  page.on("console", msg => { if (msg.type() === "error") report.errors.push(msg.text()); if (msg.type() === "warning") report.warnings.push(msg.text()); });

  // Every implemented fixture loads by URL, and keeps its identity after refresh.
  for (const theme of ["light", "dark"]) {
    await context.addInitScript(theme => localStorage.setItem("theme", theme), theme);
    for (const [path, heading, section] of [
      ["/platform/overview", "Security overview", "Overview"],
      ["/platform/cases", "Cases", "Cases"],
      ["/platform/knowledge", "OSCAR Context", "OSCAR Context"],
      ["/platform/reports", "Reports", "Reports"],
      ["/platform/integrations", "Integrations", "Integrations"],
      ...platformCases.map(item => [`/platform/cases/${item.id}`, item.title, "Cases"]),
      ["/platform/cases/case-detail", caseOverview.title, "Cases"],
      [`/platform/cases/${caseOverview.id}`, caseOverview.title, "Cases"],
      ...previewIntegrations.map(item => [`/platform/integrations/${item.slug}`, item.name, "Integrations"]),
    ]) {
      await visit(path, heading, section);
      await page.reload({ waitUntil: "load" });
      await page.getByRole("heading", { level: 1, name: heading, exact: true }).waitFor();
      assert.equal(await page.locator("html").evaluate(el => el.classList.contains("dark")), theme === "dark");
    }
  }
  report.checks.push("Every fixture route loads directly and after refresh in both themes");

  const redirects = [
    ["/platform", "/platform/overview"],
    ["/design-preview", "/platform/overview"],
    ["/design-preview/cases?queue=Running", "/platform/cases?queue=Running"],
    ["/design-preview/cases/FM-1048", "/platform/cases/FM-1048"],
    ["/design-preview/cases/lsass-memory-access", `/platform/cases/${caseOverview.id}`],
    ["/design-preview/integrations", "/platform/integrations"],
    ["/design-preview/integrations/microsoft-365", "/platform/integrations/microsoft-365"],
    ["/platform/context", "/platform/knowledge"],
    ["/platform/settings", "/settings/fortcases/investigations"],
  ];
  for (const [from, to] of redirects) {
    const response = await context.request.get(origin + from, { maxRedirects: 0 });
    assert.equal(response.status(), 307, from);
    assert.equal(new URL(response.headers().location, origin).pathname + new URL(response.headers().location, origin).search, to);
  }
  for (const path of ["/design", "/design-system/colors", "/design-system/semantics"]) {
    assert.equal((await context.request.get(origin + path)).status(), 404, path);
  }
  // App Router can stream a not-found boundary after the initial 200 headers.
  const missingIntegration = await context.request.get(origin + "/platform/integrations/unknown");
  assert.ok([200, 404].includes(missingIntegration.status()));
  assert.match(await missingIntegration.text(), /Integration not found/);
  report.checks.push("Legacy redirects preserve IDs and query parameters; retired design experiments return 404");

  await visit("/platform/overview", "Security overview", "Overview");
  await page.getByRole("button", { name: "Toggle sidebar", exact: true }).click();
  await page.waitForFunction(() => document.querySelector('[data-slot="sidebar"][data-state]').dataset.state === "collapsed");
  for (const [label, path] of [["Cases", "/platform/cases"], ["Integrations", "/platform/integrations"], ["Overview", "/platform/overview"]]) {
    await page.locator("[data-ui~=sidebar]").getByRole("link", { name: label, exact: true }).click();
    await page.waitForURL(origin + path);
    assert.equal(await page.locator('[data-slot="sidebar"][data-state]').getAttribute("data-state"), "collapsed");
    assert.equal(await page.locator('[data-ui~=sidebar] [aria-current="page"]').getAttribute("aria-label"), label);
  }
  await page.getByRole("button", { name: "Toggle sidebar", exact: true }).click();
  await page.waitForFunction(() => document.querySelector('[data-slot="sidebar"][data-state]').dataset.state === "expanded");
  for (const [label, path, heading] of [["OSCAR Context", "/platform/knowledge", "OSCAR Context"], ["Reports", "/platform/reports", "Reports"]]) {
    await page.locator("[data-ui~=sidebar]").getByRole("link", { name: label, exact: true }).click();
    await page.waitForURL(origin + path);
    await page.getByRole("heading", { level: 1, name: heading, exact: true }).waitFor();
    assert.equal(await page.locator('[data-ui~=sidebar] [aria-current="page"]').getAttribute("aria-label"), label);
    if (label === "Reports") {
      const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Export CSV", exact: true }).click()]);
      assert.match(download.suggestedFilename(), /^fortmind-demo-report-/);
    }
  }
  await page.locator("[data-ui~=sidebar]").getByRole("link", { name: "Settings", exact: true }).click();
  await page.waitForURL(origin + "/settings/fortcases/investigations");
  await page.locator('[data-slot="sidebar-wrapper"]').waitFor({ state: "hidden" });
  assert.equal(await page.locator('[data-slot="sidebar-wrapper"]').isVisible(), false);
  await page.getByRole("link", { name: "Back to FortMind" }).click();
  await page.waitForURL(origin + "/platform/overview");
  report.checks.push("Expanded/collapsed navigation retains state; Knowledge and Reports are pages, Settings has its own shell");

  await page.locator('[data-ui="global-search"]').click();
  await page.getByRole("textbox", { name: "Search workspace cases" }).fill(caseOverview.id);
  await page.getByRole("dialog").getByRole("link", { name: new RegExp(caseOverview.title) }).click();
  await page.waitForURL(origin + `/platform/cases/${caseOverview.id}`);
  const caseCrumbs = page.locator('[data-ui="topbar-breadcrumbs"]');
  assert.equal(await caseCrumbs.getByRole("link", { name: "Cases", exact: true }).count(), 1);
  assert.equal(await page.locator('[data-ui="breadcrumb"]').count(), 0, "no duplicate in-page breadcrumb");
  await caseCrumbs.getByRole("link", { name: "Cases", exact: true }).click();
  await page.waitForURL(origin + "/platform/cases");
  await page.locator('[data-ui~=case-title][href="/platform/cases/FM-1048"]').click();
  await page.getByRole("heading", { name: "LSASS process accessed by mimikatz.exe", exact: true }).waitFor();
  assert.match(await page.locator("[data-ui~=investigation-id]").innerText(), /FM-1048/);
  await page.goBack({ waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Cases", exact: true }).waitFor();
  await page.getByRole("button", { name: "More actions for FM-1048", exact: true }).click();
  await page.getByRole("menuitem", { name: "Copy case ID", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "FM-1048 copied" }).waitFor({ state: "attached" });
  assert.equal(await page.getByRole("dialog").count(), 0, "copy action must not open a preview");
  report.checks.push("Search reaches the UUID investigation; queue links and browser back retain the right case");

  await page.getByRole("button", { name: "Create new case", exact: true }).click();
  await page.getByLabel("Case title", { exact: true }).fill("Routing validation draft");
  await page.getByLabel("Alert context", { exact: true }).fill("Local prototype validation context");
  await page.getByRole("button", { name: "Create preview case", exact: true }).click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await visit("/platform/cases?queue=All", "Cases", "Cases");
  await page.getByRole("link", { name: "Routing validation draft", exact: true }).click();
  await page.getByRole("heading", { name: "Routing validation draft", exact: true }).waitFor();
  const localUrl = page.url();
  assert.match(localUrl, /\/platform\/cases\/FM-LOCAL-001$/);
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Routing validation draft", exact: true }).waitFor();
  assert.equal(page.url(), localUrl);
  report.checks.push("New draft cases keep the same ID and content after refresh in the same browser tab");

  await visit("/platform/integrations", "Integrations", "Integrations");
  await page.getByRole("textbox", { name: "Search integrations and tools" }).fill("message_trace");
  assert.equal(await page.locator("[data-ui~=card-link]").count(), 1);
  await page.locator("[data-ui~=card-link]").click();
  await page.waitForURL(origin + "/platform/integrations/microsoft-365");
  await page.getByRole("button", { name: "Run sample test", exact: true }).click();
  await page.locator("[data-ui~=sample-result]").filter({ hasText: "Sample check needs attention" }).waitFor();
  await page.getByRole("link", { name: "All integrations", exact: true }).click();
  await page.getByRole("heading", { name: "Integrations", exact: true }).waitFor();
  report.checks.push("Integration search, card detail links, sample connection test, and back link work");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Toggle sidebar", exact: true }).click();
  await page.getByRole("dialog").getByRole("link", { name: "Cases", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await page.waitForURL(origin + "/platform/cases");
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: resolve(output, "mobile-cases.png") });
  report.checks.push("Mobile sidebar navigates and closes without horizontal page overflow");
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.warnings, []);
  await writeFile(resolve(output, "validation.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ routeVisits: report.routes.length, checks: report.checks, errors: report.errors, warnings: report.warnings }, null, 2));
} catch (error) {
  await writeFile(resolve(output, "failure.json"), JSON.stringify({ ...report, failure: String(error) }, null, 2));
  if (page) await page.screenshot({ path: resolve(output, "failure.png") });
  throw error;
} finally { await browser.close(); }
