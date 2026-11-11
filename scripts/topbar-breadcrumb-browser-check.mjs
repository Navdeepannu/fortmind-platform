import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.PREVIEW_ORIGIN || "http://localhost:3000";
const output = resolve(process.env.TOPBAR_OUTPUT || "/tmp/fortmind-topbar/screens");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE }
    : {}),
});
const report = { views: [], checks: [], errors: [] };
let page;

async function visit(route) {
  const response = await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
  assert.equal(response.status(), 200, route);
  await page.locator('[data-ui="topbar-breadcrumbs"]').waitFor();
  await page.waitForFunction(() => document.fonts.status === "loaded");
}

async function checkTopbar(expected) {
  const crumbs = page.locator('[data-ui="topbar-breadcrumbs"]');
  assert.deepEqual(
    await crumbs.locator("li").allTextContents(),
    expected,
    "top bar reflects the exact route hierarchy",
  );
  assert.equal(await crumbs.locator('[aria-current="page"]').count(), 1);
  const dimensions = await page.evaluate(() => {
    const bar = document.querySelector('[data-ui="utility-bar"]')?.getBoundingClientRect();
    const crumbs = document.querySelector('[data-ui="topbar-breadcrumbs"]')?.getBoundingClientRect();
    return {
      offset: Math.abs((bar.left + bar.width / 2) - (crumbs.left + crumbs.width / 2)),
      hasOverflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
  assert.ok(dimensions.offset <= 3, `breadcrumb is centered to topbar: ${dimensions.offset}px`);
  assert.equal(dimensions.hasOverflow, false, "no horizontal page overflow");
}

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
      await visit("/platform/cases");
      await checkTopbar(["Workspace", "Cases"]);
      await page.screenshot({
        path: resolve(output, `${theme}-${width}-cases.png`),
        fullPage: false,
      });

      await visit("/platform/cases/FM-1048");
      await checkTopbar(["Workspace", "Cases", "FM-1048"]);
      assert.equal(await page.locator('[data-ui="back-link"]').count(), 0);
      await page.locator('[data-ui="topbar-breadcrumbs"]').getByRole("link", { name: "Cases" }).click();
      await page.waitForURL(`${origin}/platform/cases`);

      await visit("/platform/integrations/microsoft-365");
      await checkTopbar(["Workspace", "Integrations", "Microsoft 365"]);
      assert.equal(await page.locator('[data-ui="back"]').count(), 0);
      await page.locator('[data-ui="topbar-breadcrumbs"]').getByRole("link", { name: "Integrations" }).click();
      await page.waitForURL(`${origin}/platform/integrations`);

      await visit("/settings/fortcases/investigations");
      await checkTopbar(["Settings", "FortCases", "Investigations"]);
      await visit("/settings/trust-data");
      await checkTopbar(["Settings", "Trust & Data"]);
      report.views.push({ theme, width });
    }

    await visit("/platform/cases/case-detail");
    await checkTopbar(["Workspace", "Cases", "Case 13845102"]);
    assert.equal(await page.locator('[data-ui="breadcrumb-row"]').count(), 0);
    assert.equal(await page.locator('[data-ui="header-id"]').count(), 1);
    report.checks.push(`${theme}: centered breadcrumbs, ancestor links, no inline duplicates, mobile overflow`);
    await context.close();
  }
  assert.deepEqual(report.errors, []);
  await writeFile(resolve(output, "validation.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  await writeFile(resolve(output, "failure.json"), JSON.stringify({
    ...report, failure: String(error),
  }, null, 2));
  await page?.screenshot({ path: resolve(output, "failure.png") });
  throw error;
} finally {
  await browser.close();
}
