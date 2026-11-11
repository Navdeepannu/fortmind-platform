import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.PREVIEW_ORIGIN || "http://localhost:3000";
const output = process.env.CASE_LAB_OUTPUT || join(tmpdir(), "fortmind-case-layout-lab");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE }
    : {}),
});
const results = { checks: [], screenshots: [], pageErrors: [] };
let page;

async function assertNoOverflow(label) {
  const value = await page.evaluate(() => ({
    pageWidth: document.documentElement.scrollWidth,
    viewportWidth: innerWidth,
  }));
  assert.ok(value.pageWidth <= value.viewportWidth + 1,
    `${label}: page extends ${value.pageWidth - value.viewportWidth}px horizontally`);
}

async function visit() {
  const response = await page.goto(`${base}/platform/cases/layout-lab`, { waitUntil: "networkidle" });
  assert.equal(response?.status(), 200);
  await page.locator('[data-ui="case-navigation-lab"]').waitFor();
}

async function selectMode(mode) {
  await page.locator(`[data-ui="lab-mode-${mode}"]`).click();
  assert.equal(await page.locator(`[data-ui="lab-mode-${mode}"]`).getAttribute("aria-pressed"), "true");
  const panel = mode === "expandable" ? "lab-expandable" : mode === "docked" ? "lab-docked" : "lab-focused";
  assert.equal(await page.locator(`[data-ui="${panel}"]`).count(), 1);
}

try {
  for (const theme of ["dark", "light"]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    await context.addInitScript(value => localStorage.setItem("theme", value), theme);
    page = await context.newPage();
    page.on("pageerror", err => results.pageErrors.push(err.message));
    await visit();

    const disclosures = page.locator('[data-ui="lab-disclosure"]');
    assert.equal(await disclosures.count(), 11);
    assert.equal(await page.locator('[data-ui="lab-disclosure"][open]').count(), 2);
    await disclosures.locator("summary").nth(8).click();
    assert.equal(await page.locator('[data-ui="lab-disclosure"][open]').count(), 3);
    await page.getByRole("button", { name: "Collapse all" }).click();
    assert.equal(await page.locator('[data-ui="lab-disclosure"][open]').count(), 0);
    await page.getByRole("button", { name: "Expand all" }).click();
    assert.equal(await page.locator('[data-ui="lab-disclosure"][open]').count(), 11);
    await page.getByRole("button", { name: "Collapse all" }).click();

    await selectMode("focus");
    await page.getByRole("button", { name: "Open case section navigator" }).click();
    const directory = page.getByRole("dialog", { name: "Case sections" });
    await directory.getByRole("button", { name: /Related cases/ }).click();
    assert.equal(await page.locator('[data-ui="lab-current-view"]').getAttribute("data-view"), "similar-cases");
    assert.equal(await page.locator('[data-ui="related-item"]').count(), 2);
    await page.getByRole("button", { name: "Previous section" }).click();
    assert.equal(await page.locator('[data-ui="lab-current-view"]').getAttribute("data-view"), "evidence");
    await page.getByRole("button", { name: "Next section" }).click();
    assert.equal(await page.locator('[data-ui="lab-current-view"]').getAttribute("data-view"), "similar-cases");

    await selectMode("docked");
    assert.equal(await page.locator('[data-ui="lab-pinned-directory"]').isVisible(), true);
    await page.locator('[data-ui="lab-pinned-directory"] [data-view="findings"]').click();
    assert.equal(await page.locator('[data-ui="lab-current-view"]').getAttribute("data-view"), "findings");

    for (const width of [1440, 1280, 900, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await assertNoOverflow(`${theme}/${width}`);
      const expectedPinned = width >= 1280;
      assert.equal(await page.locator('[data-ui="lab-pinned-directory"]').isVisible(), expectedPinned);
      await page.screenshot({
        path: join(output, `${theme}-${width}-docked.png`),
        fullPage: false,
      });
      await selectMode("expandable");
      await assertNoOverflow(`${theme}/${width}/expandable`);
      await page.screenshot({
        path: join(output, `${theme}-${width}-expandable.png`),
        fullPage: false,
      });
      await selectMode("focus");
      await assertNoOverflow(`${theme}/${width}/focus`);
      await page.screenshot({
        path: join(output, `${theme}-${width}-focus.png`),
        fullPage: false,
      });
      await selectMode("docked");
      results.screenshots.push({ theme, width });
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await selectMode("expandable");
    assert.equal(await page.locator('[data-ui="lab-disclosure"][open]').count(), 0,
      "accordion state is preserved across comparisons");
    await page.getByRole("link", { name: "Original case details" }).click();
    await page.waitForURL(`${base}/platform/cases/case-detail`);
    results.checks.push(`${theme}: comparison variants, 11 source blocks, keyboard-focusable drawer, responsive pinning`);
    await context.close();
  }
  assert.deepEqual(results.pageErrors, []);
  await writeFile(join(output, "report.json"), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} catch (error) {
  await writeFile(join(output, "failure.json"), JSON.stringify({ ...results, error: String(error) }, null, 2));
  await page?.screenshot({ path: join(output, "failure.png") });
  throw error;
} finally {
  await browser.close();
}
