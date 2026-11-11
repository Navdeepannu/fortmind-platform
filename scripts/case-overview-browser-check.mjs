import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.CASE_PREVIEW_URL || "http://localhost:3000/platform/cases/case-detail";
const output = process.env.CASE_SCREENSHOT_DIR || join(tmpdir(), "fortmind-compact-subviews");
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
const report = { screenshots: [], errors: [], checks: [] };
let page;

function observe(target) {
  target.on("pageerror", error => report.errors.push(error.message));
  target.on("console", message => {
    if (message.type() === "error") report.errors.push(message.text());
  });
}
async function visit(url) {
  const response = await page.goto(url, { waitUntil: "networkidle" });
  assert.equal(response.status(), 200, url);
  await page.locator('[data-ui="case-category-tabs"]').waitFor();
}
const primaryTabs = () => page.getByRole("tablist", { name: "Case categories", exact: true });

async function expectView(category, view) {
  await page.waitForFunction(({ category, view }) => {
    const params = new URL(location.href).searchParams;
    const panels = [...document.querySelectorAll('section[data-ui="section"]')]
      .filter(node => node.getClientRects().length);
    return params.get("tab") === category.toLowerCase() &&
      params.get("view") === view && panels.length === 1 && panels[0].id === view;
  }, { category, view });
}

async function selectCategory(label) {
  await primaryTabs().getByRole("tab", { name: label, exact: true }).click();
  await expectView(label, categories[label][0]);
}
async function selectView(category, view) {
  if (!(await primaryTabs().getByRole("tab", { name: category, exact: true }).getAttribute("aria-selected") === "true")) {
    await selectCategory(category);
  }
  if (categories[category].length > 1) {
    const tabs = page.getByRole("tablist", { name: `${category} views`, exact: true });
    await tabs.locator(`[data-section-id="${view}"]`).click();
  }
  await expectView(category, view);
}

try {
  for (const theme of ["dark", "light"]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      permissions: ["clipboard-read", "clipboard-write"],
      reducedMotion: "reduce",
    });
    await context.addInitScript(value => localStorage.setItem("theme", value), theme);
    page = await context.newPage();
    observe(page);
    await visit(base);
    assert.equal(await page.locator('section[data-ui="section"]').count(), 11, "All original section panels remain mounted");
    assert.deepEqual(await primaryTabs().getByRole("tab").allTextContents(), Object.keys(categories));
    assert.equal(await page.locator('[data-ui="secondary-nav"]').count(), 0);
    assert.equal(await page.locator('[data-ui="mobile-section-nav"]').count(), 0);
    assert.equal(await page.locator('[data-ui="case-section-stack"]').count(), 0);
    assert.equal(await page.locator('[data-ui="section-location"]').count(), 0);

    for (const [category, views] of Object.entries(categories)) {
      await selectCategory(category);
      assert.equal(await page.locator('section[data-ui="section"]:visible').count(), 1);
      const selector = page.getByRole("tablist", { name: `${category} views`, exact: true });
      if (views.length > 1) {
        assert.equal(await selector.count(), 1);
        assert.deepEqual(
          await selector.locator("[data-section-id]").evaluateAll(nodes => nodes.map(node => node.dataset.sectionId)),
          views,
        );
      } else {
        assert.equal(await selector.count(), 0);
      }
      for (const view of views) await selectView(category, view);
    }

    // A compact segmented tablist is still keyboard accessible.
    await selectView("Evidence", "entities");
    await page.getByRole("tablist", { name: "Evidence views" })
      .locator('[data-section-id="entities"]').focus();
    await page.keyboard.press("ArrowRight");
    await expectView("Evidence", "evidence");
    await page.keyboard.press("End");
    await expectView("Evidence", "similar-cases");
    await page.keyboard.press("Home");
    await expectView("Evidence", "entities");

    // Subview history remains navigable and reloadable.
    await selectView("Evidence", "similar-cases");
    await page.goBack(); await expectView("Evidence", "entities");
    await page.goForward(); await expectView("Evidence", "similar-cases");
    await page.reload({ waitUntil: "networkidle" });
    await expectView("Evidence", "similar-cases");

    // Technical source and long related-case records are visible one at a time.
    assert.equal(await page.locator('#similar-cases [data-ui="related-item"]:visible').count(), 2);
    assert.equal(await page.locator('#similar-cases').isVisible(), true);
    assert.equal(await page.locator('#entities').isVisible(), false);

    // Pre-existing deep links select the owning category and subview.
    await visit(`${base}?tab=evidence&view=similar-cases&source=search`);
    await expectView("Evidence", "similar-cases");
    assert.equal(new URL(page.url()).searchParams.get("source"), "search");
    await visit(`${base}#entity-host-fmlab-ws1`);
    await expectView("Evidence", "entities");
    await visit(`${base}#finding-host-alerts`);
    await expectView("Investigation", "findings");
    await page.waitForFunction(() =>
      document.querySelector('#finding-host-alerts [data-ui="finding-select"]')?.getAttribute("aria-pressed") === "true");
    await page.locator('[data-ui="finding-filters"]').getByRole("button", { name: /Not corroborated/ }).click();
    await selectCategory("Decision");
    await page.getByRole("link", { name: "View finding", exact: true }).first().click();
    await expectView("Investigation", "findings");
    assert.equal(await page.locator('#finding-memory-access [data-ui="finding-select"]').getAttribute("aria-pressed"), "true");
    assert.equal(await page.locator('[data-ui="finding"]:visible').count(), 5);

    await selectCategory("Decision");
    await page.getByRole("button", { name: "Confirm verdict", exact: true }).click();
    await page.getByRole("dialog", { name: "Confirm OSCAR’s verdict" })
      .getByRole("button", { name: "Confirm in preview" }).click();
    assert.match(await page.locator('[data-ui="review-result"]').innerText(), /Suspicious/);

    for (const width of [1440, 1280, 900, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await selectView("Evidence", "similar-cases");
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      const geometry = await page.evaluate(() => {
        const active = [...document.querySelectorAll('[data-case-category]')]
          .find(node => node.getClientRects().length);
        const content = active?.querySelector('[data-ui="case-section-workspace"]')?.getBoundingClientRect();
        const related = active?.querySelector('[data-ui="related-list"]')?.getBoundingClientRect();
        const switcher = active?.querySelector('[data-ui="contextual-view-toolbar"]')?.getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          contentWidth: content?.width,
          relatedRight: related?.right,
          contentRight: content?.right,
          switcherWidth: switcher?.width,
        };
      });
      assert.equal(geometry.overflow, false, `${theme} ${width} page overflow`);
      assert.ok(geometry.contentWidth > 0 && geometry.contentWidth <= 1121);
      assert.ok(geometry.relatedRight <= geometry.contentRight + 1);
      assert.equal(await page.locator('section[data-ui="section"]:visible').count(), 1);
      await page.screenshot({ path: join(output, `${theme}-${width}-related.png`) });
      report.screenshots.push({ theme, width, ...geometry });
    }
    report.checks.push(`${theme}: 5 primary + 11 subviews, keyboard, history, deep links, local review and overflow`);
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
