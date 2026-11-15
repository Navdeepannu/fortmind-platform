import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.PREVIEW_ORIGIN || "http://localhost:3000";
const output = resolve(process.env.BOXED_OUTPUT || "/tmp/fortmind-boxed-case");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = { screenshots: [], checks: [], errors: [] };
let page;

try {
  for (const theme of ["dark", "light"]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    await context.addInitScript(value => localStorage.setItem("theme", value), theme);
    page = await context.newPage();
    page.on("pageerror", error => report.errors.push(error.message));
    const response = await page.goto(`${origin}/platform/cases/boxed-layout`, { waitUntil: "networkidle" });
    assert.equal(response.status(), 200);
    assert.equal(await page.locator('[data-ui="boxed-case-summary"]').count(), 1);
    assert.equal(await page.locator('[data-ui="boxed-case-workspace"]').count(), 1);
    assert.equal(await page.locator('h1').count(), 1, "Single case title");
    assert.equal(await page.locator('[data-ui="topbar-breadcrumbs"]').getByRole("button", { name: "Copy case ID" }).count(), 1);
    const tabs = page.getByRole("tablist", { name: "Case detail categories" });
    assert.deepEqual(await tabs.getByRole("tab").allTextContents(), [
      "Decision", "Investigation", "Evidence", "Response", "Timeline",
    ]);

    await tabs.getByRole("tab", { name: "Investigation" }).click();
    const panel = page.locator('[data-ui="boxed-case-panel"]:visible');
    const disclosures = panel.locator('[data-ui="case-accordion"]');
    assert.equal(await disclosures.count(), 3);
    assert.equal(await disclosures.filter({ has: page.locator("summary") }).count(), 3);
    assert.equal(await disclosures.locator("summary").first().isVisible(), true);
    assert.equal(await disclosures.filter({ has: page.locator("summary") }).count(), 3);
    assert.equal(await panel.locator('[data-ui="case-accordion"][open]').count(), 1);
    await disclosures.nth(1).locator("summary").click();
    assert.equal(await panel.locator('[data-ui="case-accordion"][open]').count(), 2,
      "Multiple sections may remain expanded");
    await disclosures.first().locator("summary").click();
    assert.equal(await panel.locator('[data-ui="case-accordion"][open]').count(), 1);

    await tabs.getByRole("tab", { name: "Evidence" }).click();
    assert.equal(await page.locator('[data-ui="boxed-case-panel"]:visible [data-ui="case-accordion"]').count(), 3);
    await tabs.getByRole("tab", { name: "Investigation" }).click();
    assert.equal(await page.locator('[data-ui="boxed-case-panel"]:visible [data-ui="case-accordion"][open]').count(), 1,
      "Accordion state survives tab changes");

    for (const width of [1440, 1024, 390]) {
      await page.setViewportSize({ width, height: 900 });
      const geometry = await page.evaluate(() => {
        const summary = document.querySelector('[data-ui="boxed-case-summary"]').getBoundingClientRect();
        const workspace = document.querySelector('[data-ui="boxed-case-workspace"]').getBoundingClientRect();
        return { overflow: document.documentElement.scrollWidth > innerWidth,
          aligned: Math.abs(summary.left - workspace.left) <= 1 && Math.abs(summary.width - workspace.width) <= 1 };
      });
      assert.equal(geometry.overflow, false, `${theme} ${width}: no horizontal document overflow`);
      assert.equal(geometry.aligned, true, "Header and tabs share their alignment axis");
      await page.screenshot({ path: resolve(output, `${theme}-${width}.png`) });
      report.screenshots.push({ theme, width });
    }
    report.checks.push(`${theme}: boxed header, five tabs, independent accordion state, copyable case crumb, responsive widths`);
    await context.close();
  }
  assert.deepEqual(report.errors, []);
  await writeFile(resolve(output, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  await writeFile(resolve(output, "failure.json"), JSON.stringify({ ...report, failure: String(error) }, null, 2));
  await page?.screenshot({ path: resolve(output, "failure.png") });
  throw error;
} finally {
  await browser.close();
}
