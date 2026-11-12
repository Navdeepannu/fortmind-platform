import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.PREVIEW_ORIGIN || "http://localhost:3000";
const output = resolve(process.env.OVERVIEW_OUTPUT || "/tmp/fortmind-home/screens");
await mkdir(output, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE }
    : {}),
});
const report = { views: [], checks: [], errors: [] };
let page;
try {
  for (const theme of ["dark", "light"]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    await context.addInitScript(value => localStorage.setItem("theme", value), theme);
    page = await context.newPage();
    page.on("pageerror", error => report.errors.push(error.message));

    for (const width of [1440, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      const response = await page.goto(`${origin}/platform/overview`, { waitUntil: "networkidle" });
      assert.equal(response.status(), 200);
      await page.getByRole("heading", { level: 1, name: "Home" }).waitFor();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

      const attention = page.getByRole("region", { name: "Needs your attention", exact: true });
      const running = page.getByRole("region", { name: "OSCAR working", exact: true });
      assert.equal(await page.locator('[data-ui="metric"]').count(), 4);
      assert.deepEqual(
        await attention.locator('[data-ui="attention-preview-list"] li').evaluateAll(nodes => nodes.map(n => n.dataset.caseId)),
        ["FM-1047", "FM-1048", "FM-1039"],
      );
      assert.equal(await running.locator('[data-ui="oscar-activity-summary"] li').count(), 3);
      assert.equal(await page.locator('[data-ui="run-inspector"]').count(), 0);
      assert.equal(await page.getByRole("meter").count(), 7);
      assert.equal(await page.locator('[role="meter"] .bg-illustration').count(), 7);

      await attention.getByRole("button", { name: /^Preview FM-1047:/ }).click();
      const preview = page.locator('[data-ui="case-preview"]');
      await preview.waitFor({ state: "visible" });
      assert.equal(await preview.getByRole("link", { name: "Open investigation", exact: true }).getAttribute("href"), "/platform/cases/FM-1047");
      await page.keyboard.press("Escape");
      await preview.waitFor({ state: "hidden" });

      await page.screenshot({ path: resolve(output, `${theme}-${width}.png`), fullPage: true });
      report.views.push({ theme, width });
    }

    await page.getByRole("tab", { name: "Impact", exact: true }).click();
    await page.getByRole("heading", { name: "Investigation outcomes", exact: true }).waitFor();
    await page.getByRole("tablist", { name: "Chart reporting period", exact: true }).getByRole("tab", { name: "30 days" }).click();
    await page.getByRole("heading", { name: "Performance", exact: true }).waitFor();
    report.checks.push(`${theme}: Home queue preview, OSCAR compact summary, illustration fills, Impact navigation, mobile overflow`);
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
