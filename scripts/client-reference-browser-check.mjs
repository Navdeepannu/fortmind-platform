// Reference-layout smoke checks. Requires an externally installed Playwright module.
// Example: PLATFORM_ORIGIN=http://localhost:3000 PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node scripts/client-reference-browser-check.mjs
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const modulePath = process.env.PLAYWRIGHT_MODULE;
if (!modulePath) {
  console.error("Set PLAYWRIGHT_MODULE to the installed Playwright index.mjs file.");
  process.exit(2);
}

const { chromium } = await import(modulePath);
const origin = process.env.PLATFORM_ORIGIN ?? "http://localhost:3000";
const output = resolve(process.env.REFERENCE_OUTPUT ?? "/tmp/fortmind-reference-qa");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {}),
});

async function capture(page, name, width, theme) {
  const htmlWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  assert.ok(htmlWidth <= width + 2, `${name} at ${width}px: page width ${htmlWidth}px overflows viewport`);
  await page.screenshot({ path: resolve(output, `${name}-${width}-${theme}.png`), fullPage: true, animations: "disabled" });
}

try {
  for (const theme of ["dark", "light"]) {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme });
      const page = await context.newPage();
      await page.addInitScript((nextTheme) => {
        try { window.localStorage.setItem("theme", nextTheme); } catch { /* Ignore blocked storage. */ }
      }, theme);

      await page.goto(`${origin}/platform/overview`, { waitUntil: "domcontentloaded" });
      await page.getByRole("heading", { level: 1, name: "Home" }).waitFor();
      await page.getByRole("tab", { name: "Operations" }).waitFor();
      await capture(page, "home-operations", width, theme);
      await page.getByRole("tab", { name: "Impact" }).click();
      await page.getByRole("heading", { name: "Investigation outcomes" }).waitFor();
      await capture(page, "home-impact", width, theme);

      await page.goto(`${origin}/platform/cases`, { waitUntil: "domcontentloaded" });
      await page.getByRole("heading", { level: 1, name: "Cases" }).waitFor();
      await page.getByRole("tab", { name: /^Needs you/ }).waitFor();
      await page.getByRole("combobox", { name: "Filter by owner" }).waitFor();
      await capture(page, "cases", width, theme);

      await page.goto(`${origin}/platform/cases/case-detail`, { waitUntil: "domcontentloaded" });
      await page.getByRole("tablist", { name: "Case sections" }).getByRole("tab", { name: "Overview" }).waitFor();
      await capture(page, "case-detail", width, theme);
      await page.getByRole("tablist", { name: "Case sections" }).getByRole("tab", { name: /^Evidence/ }).click();
      await page.getByRole("heading", { name: "Evidence", exact: true }).waitFor();

      await page.goto(`${origin}/platform/integrations`, { waitUntil: "domcontentloaded" });
      await page.getByRole("heading", { level: 1, name: "Connect your tools" }).waitFor();
      await page.getByRole("button", { name: /^Connected/ }).waitFor();
      await capture(page, "integrations-connected", width, theme);
      await page.getByRole("button", { name: /^Browse/ }).click();
      await page.locator('[data-ui="card-grid"]').waitFor();
      await capture(page, "integrations-browse", width, theme);

      await page.goto(`${origin}/platform/reports`, { waitUntil: "domcontentloaded" });
      await page.getByRole("heading", { level: 1, name: "Reports" }).waitFor();
      await capture(page, "reports", width, theme);

      await page.goto(`${origin}/settings/fortcases/investigations`, { waitUntil: "domcontentloaded" });
      await page.getByRole("heading", { level: 1, name: "Investigations" }).waitFor();
      await page.getByRole("navigation", { name: "Settings categories" }).waitFor();
      await capture(page, "settings", width, theme);

      await context.close();
    }
  }
  console.log(`Client-reference smoke checks completed. Screenshots: ${output}`);
} finally {
  await browser.close();
}
