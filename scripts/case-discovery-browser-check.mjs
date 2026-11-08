import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadProjectModule } from "./load-project-module.mjs";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.PREVIEW_ORIGIN || "http://localhost:3000";
const output = resolve(process.env.DISCOVERY_OUTPUT || "/tmp/fortmind-discovery/screens");
await mkdir(output, { recursive: true });
const { cases } = loadProjectModule("lib/preview-data.ts");
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {}) });
const report = { checks: [], errors: [] };
let page;
const inspector = () => page.locator('[data-ui="case-investigation-preview"]');
const row = id => page.locator(`[data-case-id="${id}"]`);
const title = id => row(id).locator('[data-ui="case-title"]');
const metadata = id => page.getByRole("button", { name: `View context for ${id}`, exact: true });
async function clearHints() {
  await page.mouse.move(270, 70);
  await page.locator('[data-ui="search"] input').focus();
  await page.locator('[data-slot="tooltip-content"], [data-slot="hover-card-content"]').waitFor({ state: "detached" });
}
async function bounds(locator) {
  const r = await locator.boundingBox();
  assert.ok(r && r.x >= 0 && r.y >= 0 && r.x + r.width <= page.viewportSize().width + 1 && r.y + r.height <= page.viewportSize().height + 1, "Popup stays within the viewport");
}
try {
  for (const theme of ["dark", "light"]) for (const width of [1280, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce", permissions: ["clipboard-read", "clipboard-write"] });
    await context.addInitScript(t => localStorage.setItem("theme", t), theme);
    page = await context.newPage();
    page.setDefaultTimeout(8000);
    page.on("pageerror", error => report.errors.push(error.message));
    await page.goto(`${origin}/platform/cases?view=all`, { waitUntil: "networkidle" });
    const startHeight = await row("FM-1048").evaluate(el => el.getBoundingClientRect().height);
    assert.ok(startHeight >= 64);
    assert.equal(await page.locator("button button, button a, a button, a a").count(), 0, "No nested controls");

    const longTitle = title("FM-1045");
    assert.ok(await longTitle.evaluate(el => el.scrollWidth > el.clientWidth));
    await longTitle.hover();
    await page.waitForTimeout(150);
    assert.equal(await page.locator('[data-ui="case-title-tooltip"]').count(), 0, "No instant hover opening");
    await page.locator('[data-ui="case-title-tooltip"]').waitFor();
    assert.equal(await page.locator('[data-ui="case-title-tooltip"]').innerText(), cases.find(item => item.id === "FM-1045").title);
    await bounds(page.locator('[data-ui="case-title-tooltip"]'));
    await clearHints();
    await title("FM-1046").hover();
    await page.waitForTimeout(650);
    assert.equal(await page.locator('[data-ui="case-title-tooltip"]').count(), 0, "A fully visible title has no tooltip");
    await longTitle.focus();
    await page.locator('[data-ui="case-title-tooltip"]').waitFor();
    await clearHints();

    await metadata("FM-1048").hover();
    await page.waitForTimeout(150);
    assert.equal(await page.locator('[data-ui="case-metadata-hover"]').count(), 0);
    const hover = page.locator('[data-ui="case-metadata-hover"]');
    await hover.waitFor();
    assert.deepEqual(await hover.locator("dt").allTextContents(), ["Case ID", "Source", "Host", "User", "Process", "IP address"]);
    assert.equal(await hover.getByRole("button").count(), 0);
    await bounds(hover);
    assert.equal(await row("FM-1048").evaluate(el => el.getBoundingClientRect().height), startHeight);
    await page.screenshot({ path: resolve(output, `metadata-${width}-${theme}.png`) });
    await metadata("FM-1048").click();
    const popover = page.locator('[data-ui="case-metadata-popover"]');
    await popover.waitFor();
    assert.equal(await inspector().count(), 0, "Metadata clicks do not select a row");
    assert.ok(await popover.getByRole("button", { name: "Copy file hash", exact: true }).isVisible());
    await popover.getByRole("button", { name: "Copy process", exact: true }).click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), "mimikatz.exe");
    await page.keyboard.press("Escape");
    await popover.waitFor({ state: "detached" });
    assert.equal(await metadata("FM-1048").evaluate(el => el === document.activeElement), true);
    await clearHints();
    await metadata("FM-1048").focus();
    await hover.waitFor();
    await page.keyboard.press("Enter");
    await popover.waitFor();
    await page.keyboard.press("Escape");
    await popover.waitFor({ state: "detached" });
    await clearHints();

    for (const [selector, tooltip, meaning] of [
      ['[data-ui="verdict-hint"]', 'verdict-tooltip', /Evidence supports malicious activity/],
      ['[data-ui="priority-hint"]', 'priority-tooltip', /Requires the most immediate review/],
      ['[data-ui="workflow-hint"]', 'workflow-tooltip', /An analyst decision or intervention is required/],
    ]) {
      await row("FM-1048").locator(selector).filter({ visible: true }).hover();
      const tip = page.locator(`[data-ui="${tooltip}"]`);
      await tip.waitFor();
      assert.match(await tip.innerText(), meaning);
      assert.doesNotMatch(await tip.innerText(), /\d+%|probability|SLA/);
      assert.equal(await tip.getByRole("button").count(), 0);
      await bounds(tip); await clearHints();
    }
    if (width === 1440) {
      await row("FM-1048").locator('[data-ui="timestamp-hint"]').hover();
      const tip = page.locator('[data-ui="timestamp-tooltip"]');
      await tip.waitFor(); assert.match(await tip.innerText(), /4 minutes ago/);
      assert.equal(await tip.locator("time").count(), 0, "Relative-only fixtures never acquire fabricated timestamps");
      await clearHints();
    }
    await page.getByRole("button", { name: "Quick preview FM-1048", exact: true }).hover();
    await page.locator('[data-slot="tooltip-content"]').waitFor();
    assert.equal(await page.locator('[data-slot="tooltip-content"]').innerText(), "Quick preview");
    await clearHints();

    let hoverRequests = 0;
    page.on("request", () => hoverRequests++);
    await metadata("FM-1048").hover(); await hover.waitFor(); await clearHints();
    await longTitle.hover(); await page.locator('[data-ui="case-title-tooltip"]').waitFor(); await clearHints();
    assert.equal(hoverRequests, 0, "Hover previews do not fetch or prefetch");

    await title("FM-1048").click();
    await inspector().waitFor();
    await inspector().getByRole("button", { name: "Read full summary", exact: true }).click();
    assert.equal(await inspector().locator('[data-ui="preview-summary"]').innerText(), cases[0].summary);
    await inspector().getByRole("button", { name: "Show 2 more context values", exact: true }).click();
    await inspector().getByRole("button", { name: "Copy file hash", exact: true }).click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), cases[0].entities.hash);
    await metadata("FM-1046").click(); await popover.waitFor();
    await page.keyboard.press("Escape"); await popover.waitFor({ state: "detached" });
    assert.equal(await inspector().count(), 1, "Escape dismisses context before the inspector");
    await clearHints();
    await title("FM-1047").click();
    assert.match(await inspector().locator("h2").innerText(), /PowerShell/);
    const moreSummary = inspector().getByRole("button", { name: "Read full summary", exact: true });
    if (await moreSummary.count()) assert.equal(await moreSummary.getAttribute("aria-expanded"), "false");
    await page.screenshot({ path: resolve(output, `inspector-${width}-${theme}.png`) });
    await page.keyboard.press("Escape"); await inspector().waitFor({ state: "detached" });

    await page.getByRole("button", { name: "Display preferences", exact: true }).click();
    await page.getByRole("menuitem", { name: /Row density/ }).hover();
    await page.getByRole("menuitemradio", { name: "Compact", exact: true }).click();
    await page.locator('[data-ui="case-table"][data-density="compact"]').waitFor();
    await page.waitForFunction(() => {
      const first = document.querySelector('[data-ui="case-table"] tbody tr');
      return first && first.getBoundingClientRect().height < 70;
    });
    const compactHeight = await row("FM-1048").evaluate(el => el.getBoundingClientRect().height);
    assert.ok(compactHeight >= 60 && compactHeight <= startHeight + 1);
    await metadata("FM-1048").hover(); await hover.waitFor();
    assert.equal(await row("FM-1048").evaluate(el => el.getBoundingClientRect().height), compactHeight);
    await clearHints();
    report.checks.push(`${width} ${theme}: conditional title hints, delayed keyboard/hover metadata, copy popover, semantic hints, unchanged dense rows, overlay context, full verbatim summary, no hover requests or invalid nested controls`);
    await context.close();
  }

  // Explicit browser-local QA input exercises optional-field absence and 160-character titles.
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: "reduce" });
  const long = "Long investigation title ".repeat(7).slice(0, 160);
  await context.addInitScript(title => {
    localStorage.setItem("theme", "dark");
    sessionStorage.setItem("fortmind.prototype-cases.v1", JSON.stringify([{ id: "FM-LOCAL-001", title, context: "Supplied test context without additional entity fields." }]));
  }, long);
  page = await context.newPage();
  await page.goto(`${origin}/platform/cases?view=all`, { waitUntil: "networkidle" });
  await metadata("FM-LOCAL-001").tap();
  const popover = page.locator('[data-ui="case-metadata-popover"]');
  await popover.waitFor();
  assert.deepEqual(await popover.locator("dt").allTextContents(), ["Case ID", "Source"]);
  assert.doesNotMatch(await popover.innerText(), /Not supplied|Unknown|n\/a/i);
  await popover.getByRole("button", { name: "Close case context", exact: true }).tap();
  await popover.waitFor({ state: "detached" });
  await title("FM-LOCAL-001").tap();
  await page.locator('[data-presentation="fullscreen"]').waitFor();
  const size = await inspector().boundingBox();
  assert.deepEqual(size, { x: 0, y: 0, width: 390, height: 844 });
  assert.equal(await inspector().getByRole("heading", { name: long, exact: true }).count(), 1);
  assert.doesNotMatch(await inspector().innerText(), /Not supplied|Unknown|n\/a/i);
  assert.equal(await page.locator("button button, a button, a a").count(), 0);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: resolve(output, "inspector-touch.png") });
  await page.keyboard.press("Escape"); await inspector().waitFor({ state: "detached" });
  assert.equal(await title("FM-LOCAL-001").evaluate(el => el === document.activeElement), true);
  await context.close();
  report.checks.push("390px touch: tap-accessible metadata, absent entity placeholders omitted, full-screen inspection, long title, Escape and focus restoration");
  assert.deepEqual(report.errors, []);
  await writeFile(resolve(output, "validation.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  await page?.screenshot({ path: resolve(output, "failure.png") });
  await writeFile(resolve(output, "failure.json"), JSON.stringify({ ...report, error: String(error) }, null, 2));
  throw error;
} finally { await browser.close(); }
