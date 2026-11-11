import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const output = process.env.CASE_SCREENSHOT_DIR || join(tmpdir(), "fortmind-single-workspace");
const base = process.env.CASE_PREVIEW_URL || "http://localhost:3000/platform/cases/case-detail";
const categories = {
  Decision: ["conclusion", "how-oscar-decided"],
  Investigation: ["findings", "hypotheses", "attack-path"],
  Evidence: ["entities", "evidence", "similar-cases"],
  Response: ["actions", "analyst-notes"],
  Timeline: ["timeline"],
};
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE }
    : {}),
});
const report = { themes: [], layouts: [], errors: [], notes: [] };
let page;

function observe(target) {
  target.on("pageerror", error => report.errors.push(error.message));
  target.on("console", message => {
    if (message.type() === "error") report.errors.push(message.text());
  });
}

async function visit(url) {
  const response = await page.goto(url, { waitUntil: "networkidle" });
  assert.equal(response.status(), 200);
  await page.locator('[data-ui="case-category-tabs"]').waitFor();
}

async function selectCategory(label) {
  const tabs = page.getByRole("tablist", { name: "Case categories", exact: true });
  await tabs.getByRole("tab", { name: label, exact: true }).click();
  await page.waitForFunction(id =>
    !!document.querySelector(`[data-case-category="${id}"]`)?.getClientRects().length,
    label.toLowerCase());
  const panel = page.locator(`[data-case-category="${label.toLowerCase()}"]`);
  assert.deepEqual(
    await panel.locator('section[data-ui="section"]:visible').evaluateAll(nodes => nodes.map(node => node.id)),
    categories[label],
  );
  assert.equal(await panel.locator('[data-ui="case-section-stack"]').count(), 1);
  assert.equal(await page.locator('[data-ui="secondary-nav"]:visible').count(), 0);
  assert.equal(await page.locator('[data-ui="mobile-section-nav"]:visible').count(), 0);
  assert.equal(await panel.locator('[data-ui="section-location"]').count(), 0);
}

try {
  for (const theme of ["dark", "light"]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
      permissions: ["clipboard-read", "clipboard-write"],
    });
    await context.addInitScript(value => localStorage.setItem("theme", value), theme);
    page = await context.newPage();
    observe(page);
    await visit(base);

    assert.equal(await page.getByRole("tablist").count(), 1, "one navigation tier");
    assert.equal(await page.locator('section[data-ui="section"]').count(), 11);
    for (const category of Object.keys(categories)) {
      await selectCategory(category);
      for (const id of categories[category]) {
        assert.equal(await page.locator(`#${id}`).count(), 1);
      }
    }

    await selectCategory("Evidence");
    const related = page.locator('[data-ui="related-list"]');
    assert.equal(await related.locator('[data-ui="related-item"]').count(), 2);
    assert.equal(await related.getByText("Case ID unavailable").count(), 0);
    assert.equal(await related.getByRole("heading", { level: 3 }).count(), 2);
    assert.equal(await page.locator('[data-ui="secondary-nav"]').count(), 0);
    assert.equal(await page.locator('[data-ui="mobile-section-nav"]').count(), 0);

    // Old section and record links continue to resolve to their owner workspace.
    await visit(`${base}?tab=evidence&view=similar-cases`);
    assert.equal(new URL(page.url()).searchParams.get("view"), "similar-cases");
    assert.ok(await page.locator("#similar-cases").isVisible());
    await visit(`${base}#finding-host-alerts`);
    assert.equal(new URL(page.url()).searchParams.get("tab"), "investigation");
    await page.waitForFunction(() =>
      document.querySelector('#finding-host-alerts [data-ui="finding-select"]')?.getAttribute("aria-pressed") === "true");

    // A previously narrowed list must not hide a requested deep-linked finding.
    const explorer = page.locator('[data-ui="finding-explorer"]');
    await explorer.getByRole("button", { name: /Not corroborated 2/ }).click();
    assert.equal(await explorer.locator('[data-ui="finding"]:visible').count(), 2);
    await selectCategory("Decision");
    await page.getByRole("link", { name: "View finding", exact: true }).first().click();
    await page.waitForURL(/#finding-memory-access$/);
    assert.equal(await explorer.locator('[data-ui="finding"]:visible').count(), 5);
    assert.equal(await page.locator('#finding-memory-access [data-ui="finding-select"]').getAttribute("aria-pressed"), "true");

    // A single primary tab list still supports keyboard navigation.
    await page.getByRole("tab", { name: "Investigation", exact: true }).focus();
    await page.keyboard.press("ArrowRight");
    await selectCategory("Evidence");

    // Local review is still a preview and must not mutate backend state.
    await selectCategory("Decision");
    await page.getByRole("button", { name: "Confirm verdict", exact: true }).click();
    await page.getByRole("dialog", { name: "Confirm OSCAR’s verdict" })
      .getByRole("button", { name: "Confirm in preview" }).click();
    assert.match(await page.locator('[data-ui="review-result"]').innerText(), /Suspicious/);

    for (const width of [1440, 1280, 900, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await selectCategory("Evidence");
      await page.evaluate(() => scrollTo(0, 0));
      const geometry = await page.evaluate(() => {
        const root = document.querySelector('[data-ui="case-section-stack"]:not([hidden])');
        const active = [...document.querySelectorAll('[data-case-category]')]
          .find(node => node.getClientRects().length);
        const stack = active?.querySelector('[data-ui="case-section-stack"]')?.getBoundingClientRect();
        const related = active?.querySelector('[data-ui="related-list"]')?.getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          stackWidth: stack?.width,
          relatedRight: related?.right,
          stackRight: stack?.right,
        };
      });
      assert.equal(geometry.overflow, false, `${theme} ${width}: no page overflow`);
      assert.ok(geometry.relatedRight <= geometry.stackRight + 1, "related records stay in their column");
      await page.screenshot({ path: join(output, `${theme}-${width}-evidence.png`) });
      report.layouts.push({ theme, width, ...geometry });
    }
    report.themes.push(theme);
    await context.close();
  }
  assert.deepEqual(report.errors, []);
  await writeFile(join(output, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  await writeFile(join(output, "failure.json"), JSON.stringify({ ...report, error: String(error) }, null, 2));
  await page?.screenshot({ path: join(output, "failure.png") });
  throw error;
} finally {
  await browser.close();
}
