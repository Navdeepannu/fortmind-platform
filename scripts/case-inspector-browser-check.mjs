import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadProjectModule } from "./load-project-module.mjs";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.PREVIEW_ORIGIN || "http://localhost:3000";
const output = resolve(process.env.INSPECTOR_OUTPUT || "/tmp/fortmind-inspector/screens");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE }
    : {}),
});
const { platformCases: cases } = loadProjectModule("lib/platform-cases.ts");
const alphabetical = [...cases].sort((a, b) => a.title.localeCompare(b.title));
const report = { checks: [], geometry: [], errors: [] };
let page;
const inspector = () => page.locator('[data-ui="case-investigation-preview"]');
const search = () => page.locator('[data-ui="search"] input');
const title = id => page.locator(`[data-case-id="${id}"] [data-ui="case-title"]`);
const caseId = () => inspector().locator("header code").innerText();
async function tableState() {
  return page.evaluate(() => {
    const box = el => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    const table = document.querySelector('[data-ui="case-table"]');
    const scroll = document.querySelector('[data-ui="case-table-scroll"]');
    return {
      table: box(table),
      columns: [...table.querySelectorAll("thead th")].map(el => ({
        ...box(el), display: getComputedStyle(el).display, text: el.textContent,
      })),
      rows: [...table.querySelectorAll("tbody tr")].map(el => ({ id: el.dataset.caseId, ...box(el) })),
      scroll: [scroll.scrollTop, scroll.scrollLeft, window.scrollX, window.scrollY],
      pagination: document.querySelector('[data-ui="table-footer"]').textContent,
    };
  });
}
async function geometry(width, theme) {
  const result = await inspector().evaluate(el => {
    const box = node => {
      const r = node.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom };
    };
    return {
      inspector: box(el),
      header: box(el.querySelector("header")),
      footer: box(el.querySelector("footer")),
      topbar: box(document.querySelector('[data-ui="utility-bar"]')),
      sidebar: box(document.querySelector('[data-slot="sidebar-container"]')),
      position: getComputedStyle(el).position,
      inTable: Boolean(el.closest('[data-ui="investigation-workspace"], [data-ui="table-panel"]')),
      modal: el.getAttribute("aria-modal"),
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
  assert.equal(result.inspector.width, Math.min(440, width));
  assert.equal(result.inspector.x + result.inspector.width, width);
  assert.equal(result.inspector.y, result.topbar.bottom);
  assert.equal(result.inspector.bottom, 900);
  assert.equal(result.position, "fixed");
  assert.equal(result.inTable, false);
  assert.equal(result.modal, null);
  assert.equal(result.overflow, false);
  if (width >= 768) assert.ok(result.inspector.x >= result.sidebar.x + result.sidebar.width);
  assert.equal(await page.getByRole("dialog").count(), 0);
  assert.equal(await page.locator("[inert]").count(), 0);
  report.geometry.push({ width, theme, ...result });
  return result;
}
try {
  for (const theme of ["dark", "light"]) {
    for (const width of [1280, 1440, 1920]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 }, reducedMotion: "reduce",
      });
      await context.addInitScript(value => localStorage.setItem("theme", value), theme);
      page = await context.newPage();
      page.on("pageerror", error => report.errors.push(error.message));
      const response = await page.goto(`${origin}/platform/cases?view=all`, { waitUntil: "networkidle" });
      assert.equal(response.status(), 200);
      await title("FM-1048").waitFor();
      await page.evaluate(() => window.scrollTo(0, 90));
      const before = await tableState();
      await title("FM-1048").click();
      await inspector().waitFor();
      assert.deepEqual(await tableState(), before, "Opening must preserve all table geometry and scrolling");
      const layout = await geometry(width, theme);
      assert.equal(await caseId(), "FM-1048");
      assert.equal(await page.getByRole("button", { name: "Previous case", exact: true }).isEnabled(), false);
      assert.equal(await inspector().getByRole("link", { name: "Open investigation", exact: true }).getAttribute("href"), "/platform/cases/FM-1048");
      await page.screenshot({ path: resolve(output, `inspector-${width}-${theme}.png`) });

      await inspector().locator('[data-ui="investigation-preview-scroll"]').evaluate(el => { el.scrollTop = el.scrollHeight; });
      const scrolled = await geometry(width, theme);
      assert.deepEqual(scrolled.header, layout.header);
      assert.deepEqual(scrolled.footer, layout.footer);
      assert.deepEqual(await tableState(), before, "Inspector body scrolling leaves the table untouched");
      await title("FM-1046").click();
      assert.equal(await caseId(), "FM-1046", "Background case clicks update the inspector");
      assert.equal(await inspector().locator('[data-ui="investigation-preview-scroll"]').evaluate(el => el.scrollTop), 0);
      await page.getByRole("button", { name: "Close investigation preview", exact: true }).click();
      assert.deepEqual(await tableState(), before, "Closing must preserve geometry, pagination and scroll");
      assert.equal(await title("FM-1046").evaluate(el => el === document.activeElement), true);
      report.checks.push(`${width} ${theme}: expanded sidebar, unchanged columns and rows, full-height inspector, sticky chrome, independent scrolling, visible-row selection and close focus`);

      if (width === 1440) {
        await title("FM-1048").focus();
        await page.keyboard.press("Enter");
        assert.equal(await inspector().evaluate(el => el === document.activeElement), true);
        // The background remains operable: search can retain focus and exclude the inspected case.
        await search().fill("PowerShell");
        await inspector().getByText("Outside current results", { exact: true }).waitFor();
        assert.equal(await page.getByRole("button", { name: "Previous case", exact: true }).isEnabled(), false);
        assert.equal(await page.getByRole("button", { name: "Next case", exact: true }).isEnabled(), false);
        await page.keyboard.press("Escape");
        await inspector().waitFor({ state: "detached" });
        assert.equal(await search().evaluate(el => el === document.activeElement), true);
        assert.equal(await search().inputValue(), "PowerShell");
        await title("FM-1047").click();
        assert.equal(await inspector().locator("h2").innerText(), cases.find(item => item.id === "FM-1047").title);
        assert.equal(await inspector().locator('[data-ui="inspector-position"]').innerText(), "1 of 1");
        await page.keyboard.press("Escape");
        await inspector().waitFor({ state: "detached" });
        await search().fill("");

        await page.getByRole("button", { name: "Next page", exact: true }).click();
        const secondPage = await tableState();
        const secondPageId = secondPage.rows[0].id;
        await title(secondPageId).click();
        await page.getByRole("button", { name: "Previous case", exact: true }).click();
        assert.deepEqual(await tableState(), secondPage, "Inspector navigation does not change the current table page");
        await page.keyboard.press("Escape");
        await inspector().waitFor({ state: "detached" });
        assert.deepEqual(await tableState(), secondPage);
        await page.getByRole("button", { name: "Previous page", exact: true }).click();

        // Sorting remains usable while the inspector is open; navigation crosses page boundaries.
        await title("FM-1048").click();
        await page.locator('thead [data-ui="col-case"]').getByRole("button", { name: "Case", exact: true }).click();
        await title(alphabetical[0].id).click();
        const sorted = await tableState();
        for (const [index, item] of alphabetical.entries()) {
          assert.equal(await caseId(), item.id);
          assert.equal(await inspector().locator('[data-ui="inspector-position"]').innerText(), `${index + 1} of ${alphabetical.length}`);
          if (index < alphabetical.length - 1) await page.getByRole("button", { name: "Next case", exact: true }).click();
        }
        assert.equal(await page.getByRole("button", { name: "Next case", exact: true }).isEnabled(), false);
        assert.deepEqual(await tableState(), sorted);
        await page.getByRole("button", { name: "Previous case", exact: true }).click();
        assert.equal(await caseId(), alphabetical.at(-2).id);
        await page.keyboard.press("Escape");
        await inspector().waitFor({ state: "detached" });
        assert.deepEqual(await tableState(), sorted);

        await title(alphabetical[0].id).click();
        await page.getByRole("button", { name: "Collapse sidebar", exact: true }).click();
        await page.locator('[data-state="collapsed"][data-slot="sidebar"]').waitFor();
        await geometry(width, theme);
        await page.screenshot({ path: resolve(output, `inspector-collapsed-${theme}.png`) });
        await page.getByRole("button", { name: "Expand sidebar", exact: true }).click();
        await page.keyboard.press("Escape");
        await inspector().waitFor({ state: "detached" });
        report.checks.push(`${theme}: keyboard open, Escape, missing-opener focus fallback, search, single-result boundaries, pagination retention, sorted navigation across all ${cases.length} results, collapsed sidebar`);
      }
      await context.close();
    }
  }
  assert.deepEqual(report.errors, []);
  await writeFile(resolve(output, "validation.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.checks, null, 2));
} catch (error) {
  await writeFile(resolve(output, "failure.json"), JSON.stringify({ ...report, error: String(error) }, null, 2));
  await page?.screenshot({ path: resolve(output, "failure.png") });
  throw error;
} finally {
  await browser.close();
}
