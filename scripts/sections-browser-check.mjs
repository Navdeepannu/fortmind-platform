import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.PLATFORM_ORIGIN || "http://localhost:3000";
const output = resolve(process.env.PLATFORM_OUTPUT || "/tmp/fortmind-sections-validation");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {}) });
const report = { routes: [], checks: [], errors: [], warnings: [] };
const settings = [
  ["/settings/fortcases/investigations", "Investigations"],
  ["/settings/fortcases/alerts", "Alerts"],
  ["/settings/fortcases/escalation", "Escalation"],
  ["/settings/fortcases/responses", "Responses"],
  ["/settings/fortcases/spend-impact", "Spend & Impact"],
  ["/settings/trust-data", "Trust & Data"],
  ["/settings/notifications", "Notifications"],
];
const platform = [["/platform/knowledge", "OSCAR Context"], ["/platform/reports", "Reports"]];
const visit = async (page, path, heading) => {
  const response = await page.goto(origin + path, { waitUntil: "networkidle" });
  assert.equal(response.status(), 200, path);
  await page.getByRole("heading", { level: 1, name: heading, exact: true }).waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${path} overflows`);
};

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, permissions: ["clipboard-read", "clipboard-write"] });
  const page = await context.newPage();
  page.on("pageerror", error => report.errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") report.errors.push(message.text()); if (message.type() === "warning") report.warnings.push(message.text()); });
  if (!process.env.SECTIONS_QUICK) for (const theme of ["light", "dark"]) {
    await context.addInitScript(selected => localStorage.setItem("theme", selected), theme);
    for (const [path, heading] of [...settings, ...platform]) {
      await visit(page, path, heading);
      assert.equal(await page.locator("html").evaluate(node => node.classList.contains("dark")), theme === "dark", `${path} ${theme}`);
      if (path.startsWith("/settings")) {
        assert.equal(await page.locator('[data-slot="sidebar-wrapper"]').count(), 0, "Settings must have a separate shell");
        assert.equal(await page.getByRole("navigation", { name: "Settings navigation" }).getByRole("link", { name: heading, exact: true }).getAttribute("aria-current"), "page");
      } else {
        assert.equal(await page.locator('[data-slot="sidebar-wrapper"]').count(), 1);
        assert.equal(await page.locator('[data-ui="sidebar"] [aria-current="page"]').getAttribute("aria-label"), heading);
      }
      await page.reload({ waitUntil: "networkidle" });
      await page.getByRole("heading", { level: 1, name: heading, exact: true }).waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${path} overflows after refresh`);
      report.routes.push(`${theme} ${path}`);
    }
  }
  if (!process.env.SECTIONS_QUICK) report.checks.push("Nine direct routes and refreshes load in both themes with the correct shell and active navigation");

  for (const [from, to] of [["/settings", "/settings/fortcases/investigations"], ["/platform/context", "/platform/knowledge"], ["/platform/settings", "/settings/fortcases/investigations"]]) {
    const response = await context.request.get(origin + from, { maxRedirects: 0 });
    assert.equal(response.status(), 307, from);
    assert.equal(new URL(response.headers().location, origin).pathname, to);
  }
  report.checks.push("Settings entry and former context/settings URLs redirect to implemented pages");

  await visit(page, "/platform/knowledge", "OSCAR Context");
  assert.match(await page.getByText("No rules yet", { exact: true }).innerText(), /No rules/);
  await page.getByRole("button", { name: "Teach a fact", exact: true }).click();
  await page.getByLabel("Fact", { exact: true }).fill("Example domain uses a dedicated security gateway.");
  await page.getByLabel("Category", { exact: true }).selectOption("Approved software");
  await page.getByRole("dialog").getByRole("button", { name: "Teach fact" }).click();
  await page.getByText("Example domain uses a dedicated security gateway.").waitFor();
  await page.reload({ waitUntil: "networkidle" });
  await page.getByText("Example domain uses a dedicated security gateway.").waitFor();
  await page.getByRole("button", { name: "Edit fact: Example domain uses a dedicated security gateway." }).click();
  await page.getByLabel("Fact", { exact: true }).fill("Example domain uses an approved dedicated security gateway.");
  await page.getByRole("dialog").getByRole("button", { name: "Save fact" }).click();
  await page.getByRole("button", { name: "Retire fact: Example domain uses an approved dedicated security gateway." }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Retire fact" }).click();
  assert.equal(await page.getByText("Example domain uses an approved dedicated security gateway.").count(), 0);
  await page.getByLabel("Fact status").selectOption("retired");
  await page.getByText("Example domain uses an approved dedicated security gateway.").waitFor();
  report.checks.push("Facts teach, persist, edit, retire and filter without altering admin rules");

  await visit(page, "/settings/fortcases/investigations", "Investigations");
  assert.equal(await page.getByRole("radio", { name: /Act and Report/ }).isDisabled(), true);
  await page.getByRole("radio", { name: /Observe/ }).click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByRole("status").filter({ hasText: "Saved in this browser" }).waitFor();
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.getByRole("radio", { name: /Observe/ }).isChecked(), true);
  await page.getByLabel("Investigation timeout").fill("25");
  await page.getByRole("button", { name: "Discard" }).click();
  assert.equal(await page.getByLabel("Investigation timeout").inputValue(), "15");
  report.checks.push("Organization form save, reload, discard and disabled autonomy mode work");

  await visit(page, "/settings/fortcases/escalation", "Escalation");
  await page.getByLabel("Add recipient").fill("invalid");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("alert").filter({ hasText: "valid email" }).waitFor();
  await page.getByLabel("Add recipient").fill("analyst@example.test");
  await page.getByLabel("Add recipient").press("Enter");
  await page.getByText("analyst@example.test").waitFor();
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.reload({ waitUntil: "networkidle" });
  await page.getByText("analyst@example.test").waitFor();
  report.checks.push("Escalation recipient validation, keyboard entry and saved list work");

  await visit(page, "/settings/notifications", "Notifications");
  assert.equal(await page.getByRole("switch", { name: "Needs Review push unavailable" }).isDisabled(), true);
  await page.getByRole("switch", { name: "Needs Review in-app notifications" }).click();
  await page.getByRole("combobox", { name: "Needs Review email delivery" }).click();
  await page.getByRole("option", { name: "Right Away" }).click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.getByRole("switch", { name: "Needs Review in-app notifications" }).isChecked(), false);
  assert.match(await page.getByRole("combobox", { name: "Needs Review email delivery" }).innerText(), /Right Away/);
  await page.getByRole("combobox", { name: "Weekly Report email delivery" }).click();
  assert.equal(await page.getByRole("option", { name: "Daily Summary" }).count(), 0);
  await page.keyboard.press("Escape");
  report.checks.push("Personal delivery choices persist; push is disabled and weekly report stays email-only");

  await visit(page, "/settings/fortcases/spend-impact", "Spend & Impact");
  await page.getByLabel("Analyst minutes per case").fill("45");
  await page.getByRole("button", { name: "Save changes" }).click();
  await visit(page, "/platform/reports", "Reports");
  assert.match(await page.locator('[data-metric="hoursSaved"]').innerText(), /45 analyst minutes/);
  assert.equal(await page.getByRole("button", { name: "Export PDF" }).isDisabled(), true);
  await page.getByRole("button", { name: "Last Month" }).click();
  await page.waitForURL(/range=last-month/);
  assert.match(await page.getByRole("heading", { name: "Most-Seen Indicators and Assets" }).innerText(), /Indicators/);
  await page.getByLabel("From (UTC)").fill("2026-11-02");
  await page.getByLabel("To (UTC)").fill("2026-11-05");
  await page.getByRole("button", { name: "Apply dates" }).click();
  await page.waitForURL(/range=custom&from=2026-11-02&to=2026-11-05/);
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Export CSV" }).click()]);
  assert.match(download.suggestedFilename(), /fortmind-demo-report-2026-11-02-2026-11-05\.csv/);
  await download.saveAs(resolve(output, "report.csv"));
  const caseLink = page.getByRole("link", { name: /LSASS process accessed by mimikatz.exe/ });
  await caseLink.click();
  await page.waitForURL(/\/platform\/cases\/FM-1048/);
  await page.goBack({ waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Reports" }).waitFor();
  report.checks.push("Spend assumptions flow to Reports; presets, custom range, CSV, case links and browser back work");

  const blocked = await browser.newContext({ viewport: { width: 900, height: 700 } });
  await blocked.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("fortmind.prototype.settings.")) throw new DOMException("Storage blocked", "QuotaExceededError");
      return original.call(this, key, value);
    };
  });
  const blockedPage = await blocked.newPage();
  await visit(blockedPage, "/settings/fortcases/investigations", "Investigations");
  await blockedPage.getByRole("radio", { name: /Observe/ }).click();
  await blockedPage.getByRole("button", { name: "Save changes" }).click();
  await blockedPage.getByRole("alert").filter({ hasText: "Changes not saved" }).waitFor();
  assert.equal(await blockedPage.getByRole("radio", { name: /Observe/ }).isChecked(), true);
  await blocked.close();
  report.checks.push("Failed browser persistence keeps edits and reports an error instead of success");

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 1 });
  const mobilePage = await mobile.newPage();
  for (const [path, heading] of [...settings, ...platform]) {
    await visit(mobilePage, path, heading);
    report.routes.push(`mobile ${path}`);
  }
  await visit(mobilePage, "/settings/fortcases/investigations", "Investigations");
  await mobilePage.getByRole("button", { name: "Open settings navigation" }).click();
  await mobilePage.getByRole("dialog", { name: "Settings navigation" }).getByRole("link", { name: "Notifications" }).click();
  await mobilePage.waitForURL(origin + "/settings/notifications");
  await mobilePage.getByRole("dialog", { name: "Settings navigation" }).waitFor({ state: "hidden" });
  report.checks.push("All new sections fit 390px and the separate mobile Settings navigation closes after navigation");
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.warnings, []);
  await mobile.close();
  await context.close();
} finally {
  await writeFile(resolve(output, "validation.json"), JSON.stringify(report, null, 2));
  await browser.close();
}
console.log(JSON.stringify(report, null, 2));
