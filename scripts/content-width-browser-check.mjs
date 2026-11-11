import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadProjectModule } from "./load-project-module.mjs";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = process.env.PREVIEW_ORIGIN || "http://localhost:3000";
const output = resolve(process.env.WIDTH_OUTPUT || "/tmp/fortmind-content-width/after");
const { caseSectionGroups } = loadProjectModule("lib/case-sections.ts");
const { caseOverview } = loadProjectModule("lib/case-overview-data.ts");
const widths = [1280, 1440, 1920, 2560];
const routes = [
  "/platform/overview", "/platform/cases?view=all", "/platform/cases/FM-1048",
  "/platform/integrations", "/platform/integrations/microsoft-365",
  "/platform/knowledge", "/platform/reports",
  "/platform/cases/case-detail", `/platform/cases/${caseOverview.id}`,
];
const settings = [
  "/settings/fortcases/investigations", "/settings/fortcases/alerts",
  "/settings/fortcases/escalation", "/settings/fortcases/responses",
  "/settings/fortcases/spend-impact", "/settings/notifications", "/settings/trust-data",
];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {}) });
const report = { pages: [], caseViews: [], checks: [], errors: [] };
let page;
const near = (actual, expected, message) => assert.ok(Math.abs(actual - expected) <= 1, `${message}: ${actual} vs ${expected}`);

async function measure(label) {
  const result = await page.evaluate(() => {
    const box = element => {
      const rect = element.getBoundingClientRect(), css = getComputedStyle(element);
      return { x: rect.x, width: rect.width, right: rect.right, paddingLeft: parseFloat(css.paddingLeft), paddingRight: parseFloat(css.paddingRight), maxWidth: css.maxWidth };
    };
    const container = document.querySelector('[data-ui="page-container"]');
    const workspace = document.querySelector('[data-slot="sidebar-inset"], [data-ui="settings-workspace"]');
    const shellHeader = workspace.querySelector(':scope > header');
    const main = document.querySelector('#preview-main') ?? container.firstElementChild;
    return {
      viewport: innerWidth, theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
      size: container.dataset.layoutSize, instances: document.querySelectorAll('[data-ui="page-container"]').length,
      container: box(container), workspace: box(workspace), gutters: box(container.parentElement), navbar: box(shellHeader), main: box(main),
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
  const max = result.size === "compact" ? 914 : 1620;
  const gutter = result.viewport >= 1536 ? 32 : result.viewport >= 768 ? 24 : 16;
  assert.equal(result.instances, 1, `${label}: exactly one shared container`);
  near(result.container.width, Math.min(max, result.workspace.width - gutter * 2), `${label}: effective width`);
  assert.ok(result.container.width <= max, `${label}: max width`);
  near(result.container.x - result.workspace.x, result.workspace.right - result.container.right, `${label}: centered within workspace`);
  near(result.gutters.width, result.workspace.width, `${label}: gutters inside workspace`);
  near(result.gutters.paddingLeft, gutter, `${label}: left gutter`);
  near(result.gutters.paddingRight, gutter, `${label}: right gutter`);
  near(result.navbar.width, result.workspace.width, `${label}: navbar remains full workspace width`);
  near(result.navbar.x, result.workspace.x, `${label}: navbar origin`);
  near(result.main.x, result.container.x, `${label}: page root alignment`);
  near(result.main.width, result.container.width, `${label}: page root width`);
  near(result.main.paddingLeft, 0, `${label}: no duplicate page gutter`);
  near(result.main.paddingRight, 0, `${label}: no duplicate page gutter`);
  assert.equal(result.overflow, false, `${label}: no page overflow`);
  return result;
}

async function visit(route) {
  const response = await page.goto(origin + route, { waitUntil: "networkidle" });
  assert.equal(response.status(), 200, route);
  await page.locator("h1").waitFor();
  await page.evaluate(() => document.fonts.ready);
}

async function sidebar(state) {
  const target = state === "expanded" ? 256 : 64;
  const current = await page.locator('[data-slot="sidebar-gap"]').evaluate(el => el.getBoundingClientRect().width);
  if (Math.abs(current - target) > 1) await page.getByRole("button", { name: state === "expanded" ? "Expand sidebar" : "Collapse sidebar", exact: true }).click();
  await page.waitForFunction(width => Math.abs(document.querySelector('[data-slot="sidebar-gap"]').getBoundingClientRect().width - width) < 1, target);
}

async function caseViews(route, state) {
  for (const group of caseSectionGroups) {
    await page.getByRole("tablist", { name: "Case categories", exact: true })
      .getByRole("tab", { name: group.label, exact: true }).click();
    await page.waitForFunction(tab =>
      document.querySelector(`[data-case-category="${tab}"]`)?.getClientRects().length > 0, group.id);

    for (const section of group.sections) {
      if (group.sections.length > 1) {
        await page.getByRole("tablist", { name: `${group.label} views`, exact: true })
          .locator(`[data-section-id="${section.id}"]`).click();
      }
      await page.waitForFunction(({ tab, view }) => {
        const params = new URL(location.href).searchParams;
        const sections = [...document.querySelectorAll('section[data-ui="section"]')]
          .filter(node => node.getClientRects().length);
        return params.get("tab") === tab && params.get("view") === view &&
          sections.length === 1 && sections[0].id === view;
      }, { tab: group.id, view: section.id });

      const dimensions = await measure(`${route} ${group.label}/${section.label} ${state}`);
      const alignment = await page.evaluate(() => {
        const names = ["header", "header-meta", "page-nav", "preview-footnote"];
        const full = names.map(name => document.querySelector(`[data-ui="${name}"]`)).filter(Boolean);
        const rect = element => element.getBoundingClientRect();
        const active = [...document.querySelectorAll('[data-case-category]')]
          .find(node => node.getClientRects().length);
        const content = active?.querySelector('[data-ui="case-section-workspace"]');
        const headerBody = document.querySelector('[data-ui="header-body"]');
        const primary = document.querySelector('[data-ui="primary-nav-inner"]');
        const section = [...(active?.querySelectorAll('section[data-ui="section"]') ?? [])]
          .find(node => node.getClientRects().length);
        return {
          full: full.map(node => ({ name: node.dataset.ui, x: rect(node).x, width: rect(node).width })),
          content: { x: rect(content).x, right: rect(content).right, width: rect(content).width },
          header: { x: rect(headerBody).x, width: rect(headerBody).width },
          primary: { x: rect(primary).x, width: rect(primary).width },
          section: { x: rect(section).x, right: rect(section).right },
          extraSidebar: !!active?.querySelector('[data-ui="secondary-nav"], [data-ui="mobile-section-nav"]'),
        };
      });
      for (const item of alignment.full) {
        near(item.x, dimensions.container.x, `${item.name}: origin`);
        near(item.width, dimensions.container.width, `${item.name}: full-width band`);
      }
      assert.equal(alignment.extraSidebar, false);
      assert.ok(alignment.content.width > 0 && alignment.content.width <= 1121);
      near(alignment.header.x, alignment.content.x, "header aligned to workspace content");
      near(alignment.primary.x, alignment.content.x, "primary tabs aligned to workspace content");
      near(alignment.header.width, alignment.content.width, "header and panel share measure");
      near(alignment.primary.width, alignment.content.width, "tabs and panel share measure");
      assert.ok(alignment.section.x >= alignment.content.x - 1);
      assert.ok(alignment.section.right <= alignment.content.right + 1);
      report.caseViews.push({ route, state, tab: group.id, view: section.id, viewport: dimensions.viewport, theme: dimensions.theme });
    }
  }
}

try {
  for (const theme of ["dark", "light"]) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, reducedMotion: "reduce" });
    await context.addInitScript(value => localStorage.setItem("theme", value), theme);
    page = await context.newPage();
    page.on("pageerror", error => report.errors.push(error.message));
    for (const width of widths) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of routes) {
        await visit(route);
        for (const state of ["expanded", "collapsed"]) {
          await sidebar(state);
          const dimensions = await measure(`${route} ${state}`);
          report.pages.push({ route, state, ...dimensions });
          if (route === "/platform/cases/case-detail" || route.endsWith(caseOverview.id)) {
            await caseViews(route, state);
            if (theme === "dark" && route.endsWith("case-detail")) {
              await page.getByRole("tablist", { name: "Case categories", exact: true }).getByRole("tab", { name: "Decision", exact: true }).click();
              await page.evaluate(() => scrollTo(0, 0));
              await page.screenshot({ path: resolve(output, `case-${width}-${state}.png`) });
            }
          }
        }
      }
      for (const route of settings) {
        await visit(route);
        const dimensions = await measure(route);
        assert.equal(dimensions.size, route.endsWith("trust-data") ? "standard" : "compact");
        report.pages.push({ route, state: "fixed settings sidebar", ...dimensions });
      }
    }
    // Mobile keeps the same primitive and switches only its gutter.
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of ["/platform/overview", "/platform/cases/case-detail", "/platform/cases?view=all", "/settings/fortcases/investigations"]) {
      await visit(route);
      report.pages.push({ route, state: "mobile", ...await measure(route) });
      if (route.endsWith("case-detail")) await caseViews(route, "mobile");
    }
    await context.close();
  }

  // A wider data table must scroll locally without changing page geometry.
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, reducedMotion: "reduce" });
  page = await context.newPage();
  await visit("/platform/cases?view=all");
  await page.locator('[data-ui="case-table"]').evaluate(table => {
    // Explicit QA override exercises overflow independently of the table's
    // own fixed-layout/min-width rules; no product source styles are changed.
    table.style.setProperty("min-width", "1900px", "important");
    table.style.setProperty("width", "1900px", "important");
  });
  await page.waitForFunction(() => document.querySelector('[data-ui="case-table"]').getBoundingClientRect().width === 1900);
  await measure("oversized case table");
  const scroll = await page.locator('[data-ui="case-table-scroll"]').evaluate(el => {
    el.scrollLeft = 100;
    return { width: el.clientWidth, scrollWidth: el.scrollWidth, scrollLeft: el.scrollLeft, overflowX: getComputedStyle(el).overflowX };
  });
  assert.ok(scroll.scrollWidth > scroll.width);
  assert.ok(scroll.scrollLeft > 0);
  assert.equal(scroll.overflowX, "auto");
  report.checks.push("A 1900px table scrolls inside its existing table scroller; the 976px page container does not expand.");
  await context.close();
  assert.deepEqual(report.errors, []);
  await writeFile(resolve(output, "measurements.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ pages: report.pages.length, caseViews: report.caseViews.length, checks: report.checks, errors: report.errors, caseWidths: report.pages.filter(row => row.theme === "dark" && row.route === "/platform/cases/case-detail" && row.state !== "mobile").map(row => ({ viewport: row.viewport, sidebar: row.state, workspace: row.workspace.width, content: row.container.width, x: row.container.x, gutter: row.gutters.paddingLeft })) }, null, 2));
} catch (error) {
  await writeFile(resolve(output, "failure.json"), JSON.stringify({ ...report, failure: String(error) }, null, 2));
  await page?.screenshot({ path: resolve(output, "failure.png") });
  throw error;
} finally {
  await browser.close();
}
