import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadProjectModule } from "./load-project-module.mjs";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.PREVIEW_ORIGIN || "http://localhost:3000";
const output = resolve(process.env.OVERVIEW_OUTPUT || "/tmp/fortmind-overview-impact/screens");
const { impactReports, monitoredInvestigations } = loadProjectModule("lib/overview-data.ts");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {}),
});
const report = { views: [], checks: [], errors: [] };
let page;
const running = () => page.getByRole("region", { name: "OSCAR is investigating", exact: true });
const attention = () => page.getByRole("region", { name: "Needs your attention", exact: true });
const impact = () => page.locator('[data-ui="impact-trends"]');
const periodTab = (days) => page.getByRole("tablist", { name: "Impact reporting period", exact: true }).getByRole("tab", { name: days, exact: true });
const noOverflow = async () =>
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "No horizontal page overflow");

try {
  for (const theme of ["dark", "light"]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
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
      assert.deepEqual(
        await attention().locator('[data-ui="attention-item"]').evaluateAll(rows => rows.map(row => row.dataset.caseId)),
        ["FM-1047", "FM-1048", "FM-1039"],
      );
      assert.equal(await attention().getByRole("link", { name: /^Review investigation FM-/ }).count(), 3);
      assert.equal(await attention().getByRole("table").count(), 0, "Action queue is not a mini-table");

      // No empty placeholder: the latest supplied elapsed run is selected.
      const selected = running().getByRole("button", { name: /^Activity for FM-1051:/ });
      assert.equal(await selected.getAttribute("aria-expanded"), "true");
      assert.equal(await running().getByText("Inspect a run", { exact: true }).count(), 0);
      await running().getByText("What OSCAR has reported", { exact: true }).waitFor();
      assert.equal(await impact().locator('[data-ui="impact-metrics"]').count(), 1);
      assert.equal(await page.getByRole("heading", { name: "Investigation throughput" }).count(), 1);
      assert.equal(await page.getByRole("heading", { name: "Priority mix" }).count(), 1);
      assert.equal(await page.getByRole("heading", { name: "Verdict mix" }).count(), 1);
      assert.equal(await impact().getByRole("tablist", { name: "Impact visualization" }).count(), 1);

      await page.screenshot({ path: resolve(output, `${theme}-${width}.png`), fullPage: true });

      if (width === 1440) {
        await impact().locator(".recharts-bar-rectangle path").first().hover();
        const tooltip = await impact().locator(".recharts-tooltip-wrapper").first().innerText();
        assert.match(tooltip, /Closed by OSCAR\s+2/);
        assert.match(tooltip, /Closed by analysts\s+4/);
        assert.match(tooltip, /Total closed\s+6/);
      }

      const first = running().getByRole("button", { name: /^Activity for FM-1042:/ });
      await first.focus();
      await page.keyboard.press("Enter");
      assert.equal(await first.getAttribute("aria-expanded"), "true");
      const progress = running().locator('[data-ui="investigation-progress"]');
      assert.equal(await progress.getByRole("listitem").count(), 5);
      assert.equal(await progress.locator('[data-step-state="completed"]').count(), 0);
      assert.equal(await progress.locator('[aria-current="step"]').count(), 1);
      assert.match(await running().innerText(), /Completion not recorded/);
      assert.equal(
        await running().getByRole("link", { name: "Open investigation", exact: true }).getAttribute("href"),
        "/platform/cases/FM-1042",
      );
      const second = running().getByRole("button", { name: /^Activity for FM-1050:/ });
      await second.click();
      assert.equal(await first.getAttribute("aria-expanded"), "false");
      assert.equal(await second.getAttribute("aria-expanded"), "true");
      assert.equal(await progress.locator('[aria-current="step"]').count(), 0);
      assert.equal(await progress.locator('[data-step-state="unknown"]').count(), 5);
      await second.click();
      assert.equal(await second.getAttribute("aria-expanded"), "true", "Selection remains visible, no empty state");

      await attention().getByRole("button", { name: "Escalations & recovery", exact: true }).click();
      assert.match(await page.locator("#overview-handoffs").innerText(), /Escalated|Failed/);
      await attention().getByRole("button", { name: /^Preview FM-1041:/ }).click();
      const preview = page.locator('[data-ui="case-preview"]');
      await preview.waitFor();
      await page.keyboard.press("Escape");
      await preview.waitFor({ state: "hidden" });

      // One chart at a time: throughput or estimated capacity.
      await impact().getByRole("tab", { name: "Time saved" }).click();
      await impact().getByRole("heading", { name: "Capacity returned" }).waitFor();
      assert.ok(await impact().locator(".recharts-area").count() > 0);
      await periodTab("30 days").click();
      assert.match(await impact().innerText(), /generated demonstration data/);
      assert.match(await impact().locator('[data-ui="impact-metrics"]').innerText(), new RegExp(String(impactReports["30d"].oscar)));
      await periodTab("90 days").click();
      assert.match(await impact().locator('[data-ui="impact-metrics"]').innerText(), new RegExp(String(impactReports["90d"].oscar)));
      await periodTab("7 days").click();
      assert.match(await impact().locator('[data-ui="impact-metrics"]').innerText(), /6h/);
      await impact().getByRole("tab", { name: "Closures" }).click();
      await impact().getByRole("heading", { name: "Investigation throughput" }).waitFor();
      await noOverflow();
      report.views.push({ theme, width });
    }

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${origin}/platform/overview`, { waitUntil: "networkidle" });
    const sidebarSearch = page.locator('[data-ui="sidebar"]').getByRole("button", { name: "Search cases" });
    assert.equal(await sidebarSearch.count(), 1);
    await sidebarSearch.click();
    await page.getByRole("textbox", { name: "Search workspace cases" }).waitFor();
    await page.keyboard.press("Escape");
    const topSearch = page.locator('[data-ui="global-search"]');
    await topSearch.click();
    await page.getByRole("textbox", { name: "Search workspace cases" }).waitFor();
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "Collapse sidebar", exact: true }).click();
    await page.getByRole("button", { name: "Expand sidebar", exact: true }).waitFor();
    await noOverflow();

    for (const [label, queue] of [["Needs you", "Needs you"], ["Running", "Running"], ["Failed", "Failed"]]) {
      const link = page.locator('[data-ui="metric"]').filter({ hasText: label });
      assert.equal(await link.getAttribute("href"), `/platform/cases?queue=${encodeURIComponent(queue)}`);
    }
    assert.equal(
      await page.locator('[data-ui="metric"]').filter({ hasText: "OSCAR closed" }).getAttribute("href"),
      "#oscar-impact",
    );

    for (const { item } of monitoredInvestigations) {
      const response = await page.goto(`${origin}/platform/cases/${item.id}`, { waitUntil: "networkidle" });
      assert.equal(response.status(), 200);
      await page.getByRole("heading", { name: item.title, exact: true }).waitFor();
    }
    report.checks.push(`${theme}: responsive Overview, decision previews, run-selection integrity, trend periods, sidebar search, collapsed navigation and case routes`);
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
