import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadProjectModule } from "./load-project-module.mjs";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.PREVIEW_ORIGIN || "http://localhost:3000";
const output = resolve(process.env.OVERVIEW_OUTPUT || "/tmp/fortmind-overview-mission/screens");
const { impactReports, monitoredInvestigations } = loadProjectModule("lib/overview-data.ts");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {}) });
const report = { views: [], checks: [], errors: [] };
let page;
const running = () => page.getByRole("region", { name: "OSCAR is investigating", exact: true });
const attention = () => page.getByRole("region", { name: "Needs your attention", exact: true });
const chart = () => page.locator('[data-slot="card"]').filter({ has: page.getByRole("heading", { name: "Investigation outcomes", exact: true }) });
const performance = () => page.locator('[data-slot="card"]').filter({ has: page.getByRole("heading", { name: "Performance", exact: true }) });
const periodTab = (name, days) => page.getByRole("tablist", { name, exact: true }).getByRole("tab", { name: days, exact: true });
const noOverflow = async () => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "No horizontal page overflow");

try {
  for (const theme of ["dark", "light"]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    await context.addInitScript(value => localStorage.setItem("theme", value), theme);
    page = await context.newPage();
    page.on("pageerror", error => report.errors.push(error.message));
    for (const width of [1440, 1280, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      const response = await page.goto(`${origin}/platform/overview`, { waitUntil: "networkidle" });
      assert.equal(response.status(), 200);
      await page.getByRole("heading", { name: "Overview", exact: true }).waitFor();
      await noOverflow();
      assert.equal(await page.getByRole("button", { name: /New case|Create new case/i }).count(), 0);
      assert.equal(await running().locator('[data-ui="active-investigation"]').count(), monitoredInvestigations.length);
      assert.equal(await running().locator('[data-ui="run-inspector"]').getByText("Inspect a run", { exact: true }).count(), 1);
      assert.equal(await attention().getByRole("link", { name: "Review investigation", exact: true }).count(), 3);
      assert.deepEqual(await attention().locator("tbody tr").evaluateAll(rows => rows.map(row => row.dataset.caseId)), ["FM-1047", "FM-1048", "FM-1039"]);
      assert.equal(await attention().getByRole("columnheader", { name: "Waiting", exact: true }).count(), 0);
      if (width < 1280) assert.ok((await running().boundingBox()).y < (await attention().boundingBox()).y);
      await page.screenshot({ path: resolve(output, `${theme}-${width}.png`), fullPage: true });

      if (width === 1440) {
        await chart().locator(".recharts-bar-rectangle path").first().hover();
        await chart().getByText("Closed by OSCAR", { exact: true }).waitFor();
        const tooltip = await chart().locator(".recharts-tooltip-wrapper").innerText();
        assert.match(tooltip, /Closed by OSCAR\s+2/);
        assert.match(tooltip, /Closed by analysts\s+4/);
        assert.match(tooltip, /Total closed\s+6/);
      }

      const first = running().getByRole("button", { name: /^Activity for FM-1042:/ });
      await first.focus();
      await page.keyboard.press("Enter");
      assert.equal(await first.getAttribute("aria-expanded"), "true");
      await running().locator('[data-ui="run-inspector"]').getByText("What OSCAR has reported", { exact: true }).waitFor();
      const progress = running().locator('[data-ui="investigation-progress"]');
      assert.equal(await progress.getByRole("listitem").count(), 5);
      assert.equal(await progress.locator('[data-step-state="completed"]').count(), 0);
      assert.equal(await progress.locator('[aria-current="step"]').count(), 1);
      assert.match(await running().innerText(), /Completion not recorded/);
      assert.equal(await running().getByRole("link", { name: "Open investigation", exact: true }).getAttribute("href"), "/platform/cases/FM-1042");
      const second = running().getByRole("button", { name: /^Activity for FM-1050:/ });
      await second.click();
      assert.equal(await first.getAttribute("aria-expanded"), "false");
      assert.equal(await progress.locator('[aria-current="step"]').count(), 0, "Correlation does not invent a lifecycle mapping");
      assert.equal(await progress.locator('[data-step-state="unknown"]').count(), 5);
      await page.screenshot({ path: resolve(output, `expanded-${theme}-${width}.png`) });
      await second.click();

      await attention().getByRole("button", { name: "Escalations & recovery", exact: true }).click();
      const handoffs = page.locator("#overview-handoffs");
      assert.match(await handoffs.innerText(), /connector timed out/);
      assert.match(await handoffs.innerText(), /Restore the connection and retry evidence collection/);
      assert.match(await handoffs.innerText(), /Escalated/);
      await noOverflow();
      await attention().getByRole("button", { name: /^Preview FM-1041:/ }).click();
      const preview = page.locator('[data-ui="case-preview"]');
      await preview.waitFor();
      assert.equal(await preview.getByRole("link", { name: "Open investigation", exact: true }).getAttribute("href"), "/platform/cases/FM-1041");
      await page.keyboard.press("Escape");
      await preview.waitFor({ state: "hidden" });

      await periodTab("Chart reporting period", "30 days").click();
      assert.match(await chart().innerText(), new RegExp(`${impactReports["30d"].closed}\\s+closed cases`));
      assert.equal(await periodTab("Performance reporting period", "7 days").getAttribute("aria-selected"), "true");
      await page.getByRole("tablist", { name: "Outcome shown in chart", exact: true }).getByRole("tab", { name: "Failed runs", exact: true }).click();
      assert.match(await chart().innerText(), new RegExp(`${impactReports["30d"].failed}\\s+failed runs`));
      await periodTab("Performance reporting period", "90 days").click();
      assert.match(await performance().innerText(), /OSCAR closures × 20 analyst minutes/);
      assert.match(await performance().innerText(), new RegExp(`${impactReports["90d"].oscar} OSCAR closures`));
      assert.equal(await periodTab("Chart reporting period", "30 days").getAttribute("aria-selected"), "true");
      await noOverflow();
      report.views.push({ theme, width });
    }

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${origin}/platform/overview`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Collapse sidebar", exact: true }).click();
    await page.getByRole("button", { name: "Expand sidebar", exact: true }).waitFor();
    await noOverflow();
    await page.screenshot({ path: resolve(output, `collapsed-${theme}-1280.png`), fullPage: true });
    await page.getByRole("link", { name: "Connect tools", exact: true }).click();
    await page.waitForURL(`${origin}/platform/integrations`);
    for (const status of ["Needs you", "Running", "Closed", "Failed"]) {
      await page.goto(`${origin}/platform/overview`, { waitUntil: "networkidle" });
      const link = page.locator('[data-ui="metric"]').filter({ hasText: status });
      assert.equal(await link.getAttribute("href"), `/platform/cases?queue=${encodeURIComponent(status)}`);
      await link.click();
      await page.waitForURL(`${origin}/platform/cases?queue=${encodeURIComponent(status)}`);
      await page.getByRole("heading", { name: "Fortcases", exact: true }).waitFor();
      assert.equal(await page.getByRole("button", { name: /New case|Create new case/i }).count(), 0);
      if (status !== "Needs you") {
        const rows = page.locator('[data-ui="case-table"] tbody tr[data-case-id]');
        const statuses = await rows.locator('[data-ui="queue-status"]').evaluateAll(nodes => nodes.map(node => node.dataset.queueStatus));
        assert.ok(statuses.length > 0);
        assert.ok(statuses.every(value => value === status));
        if (status === "Running") assert.deepEqual((await rows.evaluateAll(nodes => nodes.map(node => node.dataset.caseId))).sort(), monitoredInvestigations.map(({ item }) => item.id).sort());
      }
    }
    for (const { item } of monitoredInvestigations) {
      const response = await page.goto(`${origin}/platform/cases/${item.id}`, { waitUntil: "networkidle" });
      assert.equal(response.status(), 200);
      await page.getByRole("heading", { name: item.title, exact: true }).waitFor();
    }
    report.checks.push(`${theme}: responsive layout, keyboard expansion, partial telemetry, recovery preview, reconciled chart tooltip, period controls, collapsed sidebar, integration link, KPI filters and investigation routes`);
    await context.close();
  }
  assert.deepEqual(report.errors, []);
  await writeFile(resolve(output, "validation.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  await writeFile(resolve(output, "failure.json"), JSON.stringify({ ...report, failure: String(error) }, null, 2));
  await page?.screenshot({ path: resolve(output, "failure.png") });
  throw error;
} finally {
  await browser.close();
}
