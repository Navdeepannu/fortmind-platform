import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadProjectModule } from "./load-project-module.mjs";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.PREVIEW_ORIGIN || "http://localhost:3000";
const output = resolve(process.env.BOARD_OUTPUT || "/tmp/fortmind-case-board/screens");
const { platformCases } = loadProjectModule("lib/platform-cases.ts");
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
  for (const theme of ["light", "dark"]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    await context.addInitScript(value => localStorage.setItem("theme", value), theme);
    page = await context.newPage();
    page.on("pageerror", error => report.errors.push(error.message));

    for (const width of [1440, 1280, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(`${origin}/platform/cases?queue=All`, { waitUntil: "networkidle" });
      assert.equal(response.status(), 200);
      await page.getByRole("heading", { name: "Fortcases" }).waitFor();

      const table = page.locator('[data-ui="case-table"]');
      const list = page.getByRole("button", { name: "List view" });
      const board = page.getByRole("button", { name: "Board view" });
      assert.equal(await list.getAttribute("aria-pressed"), "true");
      assert.ok(await table.isVisible());
      const columns = await table.locator("thead th").allTextContents();

      await board.click();
      assert.equal(await board.getAttribute("aria-pressed"), "true");
      const lanes = page.locator('[data-ui="board-lane"]');
      assert.equal(await lanes.count(), 4);
      assert.deepEqual(await lanes.evaluateAll(nodes => nodes.map(n => n.dataset.lane)), [
        "attention", "progress", "closed", "failed",
      ]);
      const cards = page.locator('[data-ui="case-board"] [data-case-id]');
      assert.equal(await cards.count(), platformCases.length);
      assert.ok(await page.locator('[data-ui="board-scroll"]').evaluate(el => el.scrollWidth >= el.clientWidth));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

      const previewButton = page.getByRole("button", { name: "Quick preview FM-1048" });
      await previewButton.click();
      await page.locator('[data-ui="case-investigation-preview"], [data-ui="case-preview"], [data-ui="case-inspector"]').first().waitFor({ state: "visible" });
      await page.keyboard.press("Escape");

      const input = page.getByRole("textbox", { name: "Search titles, case IDs, IPs, hosts, or users" });
      await input.fill("FM-1048");
      assert.equal(await cards.count(), 1);
      await input.fill("");

      await list.click();
      assert.equal(await list.getAttribute("aria-pressed"), "true");
      assert.ok(await table.isVisible());
      assert.deepEqual(await table.locator("thead th").allTextContents(), columns, "table columns unchanged");
      await page.screenshot({ path: resolve(output, `${theme}-${width}-list.png`), fullPage: true });
      await board.click();
      await page.screenshot({ path: resolve(output, `${theme}-${width}-board.png`), fullPage: true });
      report.views.push({ theme, width });
    }

    // A deep link to a workflow status must be restored after board browsing.
    await page.goto(`${origin}/platform/cases?queue=Running`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Board view" }).click();
    assert.ok(await page.locator('[data-ui="board-lane"][data-lane="progress"] [data-case-id]').count() > 0);
    await page.getByRole("button", { name: "List view" }).click();
    assert.ok(await page.locator('[data-ui="case-table"] tbody tr[data-case-id]').count() > 0);
    const statuses = await page.locator('[data-ui="case-table"] tbody tr[data-case-id] [data-ui="queue-status"]').evaluateAll(nodes => nodes.map(node => node.dataset.queueStatus));
    assert.ok(statuses.every(status => status === "Running"));
    report.checks.push(`${theme}: status-board coverage, filtering, preview, switch-back list geometry, deep-link status restoration`);
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
