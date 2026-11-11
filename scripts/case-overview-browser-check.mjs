import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const output = process.env.CASE_SCREENSHOT_DIR || join(tmpdir(), "fortmind-contextual-navigation");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {}) });
const errors = [];
const mutations = [];
const categories = {
  Decision: [["conclusion", "Conclusion"], ["how-oscar-decided", "How OSCAR decided"]],
  Investigation: [["findings", "Findings (5)"], ["hypotheses", "Hypotheses (2)"], ["attack-path", "Attack path"]],
  Evidence: [["entities", "Entities (4)"], ["evidence", "Evidence (5)"], ["similar-cases", "Similar past cases (2)"]],
  Response: [["actions", "Actions (4)"], ["analyst-notes", "Analyst notes"]],
  Timeline: [["timeline", "Timeline"]],
};
const base = process.env.CASE_PREVIEW_URL || "http://localhost:3000/platform/cases/case-detail";
const urlFor = (category, view, hash = "") => `${base}?tab=${category.toLowerCase()}&view=${view}${hash ? `#${hash}` : ""}`;
let page;
const primary = () => page.getByRole("tablist", { name: "Case categories", exact: true });
async function expectView(category, view) {
  await page.waitForFunction(({ category, view }) => {
    const visible = [...document.querySelectorAll("[data-case-view]")].filter(node => node.getClientRects().length);
    const params = new URL(location.href).searchParams;
    return visible.length === 1 && visible[0].dataset.caseView === view && params.get("tab") === category.toLowerCase() && params.get("view") === view;
  }, { category, view });
}
async function selectPrimary(category) {
  await primary().getByRole("tab", { name: category, exact: true }).click();
  await expectView(category, categories[category][0][0]);
}
async function selectView(category, view) {
  if (await primary().getByRole("tab", { selected: true }).innerText() !== category) await selectPrimary(category);
  if (categories[category].length > 1) {
    const panel = page.locator(`[data-case-category="${category.toLowerCase()}"]`);
    const rail = panel.locator('[data-ui="secondary-nav"]');
    if (await rail.isVisible()) {
      await rail.locator(`[data-section-id="${view}"]`).click();
    } else {
      const picker = panel.locator('[data-ui="mobile-section-nav"]');
      await picker.getByRole("combobox").click();
      const label = categories[category].find(([id]) => id === view)[1].split(" (")[0];
      await page.getByRole("option", { name: new RegExp("^" + label) }).click();
    }
  }
  await expectView(category, view);
}
function observe(target) {
  target.on("pageerror", error => errors.push(error.message));
  target.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  target.on("request", request => { if (!["GET", "HEAD"].includes(request.method())) mutations.push(`${request.method()} ${request.url()}`); });
}
try {
  page = await browser.newPage({ viewport: { width: 1440, height: 900 }, permissions: ["clipboard-read", "clipboard-write"], reducedMotion: "reduce" });
  observe(page);
  await page.goto(base, { waitUntil: "networkidle" });
  await expectView("Decision", "conclusion");
  assert.deepEqual(await primary().getByRole("tab").allTextContents(), Object.keys(categories));
  assert.equal(await page.locator("section[data-ui='section']").count(), 11, "All existing content stays mounted");
  assert.equal(await page.locator('[data-slot="sidebar-wrapper"]').count(), 1);
  const header = await page.locator('[data-ui="header"]').innerText();
  for (const [category, views] of Object.entries(categories)) {
    await selectPrimary(category);
    if (views.length > 1) {
      const rail = page.locator(`[data-case-category="${category.toLowerCase()}"] [data-ui="secondary-nav"]`);
      assert.equal(await rail.getAttribute("aria-label"), `${category} sections`);
      assert.deepEqual(
        await rail.locator('[data-section-id]').evaluateAll(nodes => nodes.map(node => node.dataset.sectionId)),
        views.map(([id]) => id),
      );
      assert.equal(await rail.getByRole("tablist").getAttribute("aria-orientation"), "vertical");
    } else assert.equal(await page.getByRole("tablist").count(), 1, "Timeline has no redundant second navigation level");
    for (const [view] of views) {
      await selectView(category, view);
      assert.equal(await page.locator("section[data-ui='section']:visible").count(), 1);
      assert.equal(await page.getByRole("tabpanel").count(), views.length > 1 ? 2 : 1);
      assert.equal(await page.locator('[data-ui="header"]').innerText(), header, "The shared case header is consistent");
      await page.reload({ waitUntil: "networkidle" });
      await expectView(category, view);
    }
  }
  assert.equal(await page.locator('#findings [data-ui="finding"]').count(), 5);
  assert.equal(await page.locator("#hypotheses article").count(), 2);
  assert.equal(await page.locator("#entities [data-ui='entity-row']").count(), 4);
  assert.equal(await page.locator("#evidence [data-ui='evidence-result']").count(), 5);
  assert.equal(await page.locator("#timeline li").count(), 12);
  // Decision briefing differentiates unverified reports from actual tool results.
  await selectView("Decision", "conclusion");
  assert.equal(await page.locator('[data-ui="finding-provenance"]').count(), 1);
  assert.deepEqual(
    (await page.locator('[data-ui="finding-provenance"] dd').allTextContents()).map(Number),
    [1, 2, 2],
  );
  assert.equal(await page.locator('[data-ui="question"]').count(), 2);
  assert.equal(await page.locator('[data-ui="review-explanation"]').getAttribute("open"), null);
  assert.equal(await page.locator('[data-ui="decision"] [data-ui="decision-actions"]').count(), 1);
  await page.locator('[data-ui="question"] summary').first().click();
  assert.ok(await page.locator('[data-ui="question"]').first().evaluate(node => node.open));

  // Scan five observations while inspecting only the selected item's source.
  await selectView("Investigation", "findings");
  const explorer = page.locator('[data-ui="finding-explorer"]');
  assert.equal(await explorer.locator('[data-ui="finding"]').count(), 5);
  assert.equal(await explorer.locator('[data-ui="finding-inspector"]').count(), 1);
  assert.match(await page.locator('#findings [data-ui="section-location"]').innerText(), /Investigation.*01 \/ 03/i);
  assert.match(await explorer.locator('[data-ui="selected-finding-title"]').innerText(), /LSASS memory access reported/);
  await explorer.getByRole("button", { name: /Not corroborated 2/ }).click();
  assert.equal(await explorer.locator('[data-ui="finding"]:visible').count(), 2);
  assert.match(await explorer.locator('[data-ui="selected-finding-title"]').innerText(), /Wazuh/);
  await explorer.getByRole("button", { name: /Unresolved 1/ }).click();
  assert.equal(await explorer.locator('[data-ui="finding"]:visible').count(), 1);
  await explorer.getByRole("button", { name: /All 5/ }).click();
  assert.equal(await explorer.locator('[data-ui="finding"]:visible').count(), 5);
  await explorer.locator('#finding-host-alerts [data-ui="finding-select"]').click();
  assert.match(await explorer.locator('[data-ui="selected-finding-title"]').innerText(), /Six active security alerts/);
  assert.match(await explorer.locator('[data-ui="finding-inspector"]').innerText(), /Elasticsearch/);

  // All confidence bars are phase scores, not verdict confidence.
  await selectView("Decision", "how-oscar-decided");
  assert.equal(await page.locator('[data-ui="completed-phases"] li').count(), 5);
  assert.equal(await page.locator('[data-ui="stage-confidence"] [role="meter"]').count(), 3);

  await selectView("Evidence", "entities");
  assert.equal(await page.locator('[data-ui="entity-list"] [data-ui="entity-row"]').count(), 4);
  await selectView("Evidence", "evidence");
  assert.equal(await page.locator('[data-ui="evidence-source"]').count(), 3);

  // The newest five events are initially visible; the remaining seven are discoverable.
  await selectView("Timeline", "timeline");
  const history = page.locator('[data-ui="timeline-history"]');
  assert.equal(await history.getAttribute("open"), null);
  await history.locator("summary").click();
  assert.equal(await history.getAttribute("open"), "");
  assert.equal(await page.locator("#timeline li:visible").count(), 12);


  // Each tablist owns its own keyboard focus and panel selection.
  await selectPrimary("Decision");
  await primary().getByRole("tab", { name: "Decision", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expectView("Investigation", "findings");
  await page.locator('[data-case-category="investigation"] [data-section-id="findings"]').focus();
  await page.keyboard.press("ArrowDown");
  await expectView("Investigation", "hypotheses");
  await page.keyboard.press("End");
  await expectView("Investigation", "attack-path");
  await page.keyboard.press("Home");
  await expectView("Investigation", "findings");
  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.activeElement?.closest("[data-case-view]")?.dataset.caseView), "findings");
  await primary().getByRole("tab", { name: "Investigation", exact: true }).focus();
  await page.keyboard.press("End");
  await expectView("Timeline", "timeline");
  await page.keyboard.press("Home");
  await expectView("Decision", "conclusion");

  await selectView("Investigation", "findings");
  await selectView("Investigation", "hypotheses");
  await selectView("Evidence", "entities");
  await page.goBack(); await expectView("Investigation", "hypotheses");
  await page.goBack(); await expectView("Investigation", "findings");
  await page.goForward(); await expectView("Investigation", "hypotheses");

  await page.goto(`${base}?tab=evidence&view=hypotheses&source=search`, { waitUntil: "networkidle" });
  await expectView("Evidence", "entities");
  await selectView("Evidence", "evidence");
  assert.equal(new URL(page.url()).searchParams.get("source"), "search");
  await page.goto(`${base}?tab=unknown&view=hypotheses`, { waitUntil: "networkidle" });
  await expectView("Decision", "conclusion");

  // Old anchors select their containing workspace, rather than scrolling a report.
  for (const [category, views] of Object.entries(categories)) {
    for (const [view] of views) {
      await page.goto(`${base}#${view}`, { waitUntil: "networkidle" });
      await expectView(category, view);
    }
  }
  await page.goto(`${base}#entity-host-fmlab-ws1`, { waitUntil: "networkidle" });
  await expectView("Evidence", "entities");
  await page.goto(`${base}#finding-host-alerts`, { waitUntil: "networkidle" });
  await expectView("Investigation", "findings");
  await page.waitForFunction(() => document.querySelector('#finding-host-alerts [data-ui="finding-select"]')?.getAttribute("aria-pressed") === "true");
  await selectView("Investigation", "hypotheses");
  await selectView("Investigation", "findings");
  assert.equal(await page.locator('#finding-host-alerts [data-ui="finding-select"]').getAttribute("aria-pressed"), "true", "Selected finding survives view changes");
  await selectPrimary("Decision");
  await page.getByRole("link", { name: "View finding", exact: true }).first().click();
  await expectView("Investigation", "findings");
  await page.waitForFunction(() => document.activeElement === document.querySelector("#finding-memory-access"));
  assert.equal(await page.locator('#finding-memory-access [data-ui="finding-select"]').getAttribute("aria-pressed"), "true");
  await page.getByRole("button", { name: "Review verdict", exact: true }).click();
  await expectView("Decision", "conclusion");
  await page.waitForFunction(() => document.activeElement === document.getElementById("decision-heading"));
  assert.equal(await page.locator("#decision-heading").evaluate(node => node.getBoundingClientRect().top >= document.querySelector('[data-ui="page-nav"]').getBoundingClientRect().bottom), true);

  await page.getByRole("button", { name: "Copy case ID", exact: true }).click();
  await page.waitForFunction(() => /copied/i.test(document.querySelector('[data-ui="header-id"] [role="status"]')?.textContent || ""));
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), "13845102-e81a-479e-87db-2cdb8ff21c1c");
  await page.getByRole("button", { name: "More actions", exact: true }).click();
  for (const label of ["Escalate case", "Teach OSCAR", "Rerun investigation"]) assert.equal(await page.getByRole("menuitem", { name: label }).getAttribute("data-disabled"), "");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Confirm verdict", exact: true }).click();
  await page.getByRole("dialog", { name: "Confirm OSCAR’s verdict" }).getByRole("button", { name: "Confirm in preview" }).click();
  assert.match(await page.locator('[data-ui="review-result"]').innerText(), /Suspicious/);
  await page.getByRole("button", { name: "Override verdict", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Override OSCAR’s verdict" });
  await dialog.getByRole("button", { name: "Apply correction in preview" }).click();
  assert.match(await dialog.innerText(), /Choose a different verdict/);
  await dialog.getByLabel("Your verdict").selectOption("Malicious");
  await dialog.getByRole("button", { name: "Apply correction in preview" }).click();
  assert.match(await dialog.innerText(), /Add a rationale/);
  await dialog.locator("#review-rationale").fill("Unsaved analyst rationale.");
  await page.evaluate(() => history.pushState(null, "", "?tab=investigation&view=hypotheses"));
  await expectView("Investigation", "hypotheses");
  assert.equal(await dialog.locator("#review-rationale").inputValue(), "Unsaved analyst rationale.");
  await page.goBack(); await expectView("Decision", "conclusion");
  assert.equal(await dialog.getByLabel("Your verdict").inputValue(), "Malicious");
  assert.equal(await dialog.locator("#review-rationale").inputValue(), "Unsaved analyst rationale.");
  await dialog.getByRole("button", { name: "Apply correction in preview" }).click();
  await selectView("Decision", "how-oscar-decided");
  await selectView("Decision", "conclusion");
  assert.match(await page.locator('[data-ui="review-result"]').innerText(), /Malicious/);
  assert.match(await page.locator('[data-ui="proposed-verdict"]').innerText(), /Suspicious/);
  await selectView("Investigation", "attack-path");
  await page.getByRole("button", { name: "Copy attack path process procdump.exe", exact: true }).click();
  await page.waitForFunction(() => /copied/i.test(document.querySelector('[data-ui="attack-path"]')?.textContent || ""));
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), "procdump.exe");

  const layouts = [];
  await page.close();
  for (const theme of ["light", "dark"]) {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    await context.addInitScript(theme => localStorage.setItem("theme", theme), theme);
    page = await context.newPage(); observe(page);
    for (const [name, width, collapsed] of [["desktop", 1440, false], ["laptop", 1280, false], ["tablet", 900, false], ["mobile", 390, false], ["narrow", 320, false], ["wide-collapsed", 1920, true]]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(urlFor("Investigation", "findings"), { waitUntil: "networkidle" });
      await expectView("Investigation", "findings");
      if (width >= 768) {
        const button = page.getByRole("button", { name: collapsed ? "Collapse sidebar" : "Expand sidebar", exact: true });
        if (await button.isVisible()) await button.click();
      }
      for (const [category, views] of Object.entries(categories)) {
        for (const [view] of views) {
          await selectView(category, view);
          await page.waitForFunction(() => [...document.querySelectorAll("[data-case-tab-scroll]")].filter(track => track.getClientRects().length).every(track => {
            const tab = track.querySelector('[role="tab"][aria-selected="true"]');
            if (!tab) return false;
            const selected = tab.getBoundingClientRect();
            const viewport = track.getBoundingClientRect();
            return selected.left >= viewport.left - 1 && selected.right <= viewport.right + 1;
          }));
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${name} ${theme} ${view} page overflow`);
          assert.equal(await page.locator("section[data-ui='section']:visible").count(), 1);
        }
      }
      await selectView("Investigation", "findings");
      await page.locator('#finding-entra-signins [data-ui="finding-select"]').click();
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
      const nav = await page.locator('[data-ui="page-nav"]').evaluate(node => node.getBoundingClientRect().top);
      const rail = page.locator('[data-case-category="investigation"] [data-ui="secondary-nav"]');
      const picker = page.locator('[data-case-category="investigation"] [data-ui="mobile-section-nav"]');
      const railVisible = await rail.isVisible();
      assert.ok(Math.abs(nav - 48) < 2, `${name} ${theme} primary nav ${nav}`);
      if (railVisible) {
        assert.equal(await rail.evaluate(node => getComputedStyle(node).position), "sticky");
        assert.equal(await picker.isVisible(), false);
      } else {
        assert.equal(await picker.isVisible(), true);
      }
      await selectView("Investigation", "hypotheses");
      await page.waitForFunction(() => document.getElementById("hypotheses").getBoundingClientRect().top >= 98 || scrollY === 0);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({ path: join(output, `${name}-${theme}-hypotheses.png`) });
      await selectView("Decision", "conclusion");
      await page.screenshot({ path: join(output, `${name}-${theme}-conclusion.png`) });
      await selectView("Investigation", "findings");
      await page.screenshot({ path: join(output, `${name}-${theme}-findings.png`) });
      layouts.push({ name, theme, width, nav, navigation: railVisible ? "side rail" : "section picker" });
    }
    await context.close();
  }
  page = await browser.newPage(); observe(page);
  const origin = new URL(base).origin;
  await page.goto(`${origin}/platform/cases/13845102-e81a-479e-87db-2cdb8ff21c1c?tab=decision&view=how-oscar-decided`, { waitUntil: "networkidle" });
  await expectView("Decision", "how-oscar-decided");
  await page.locator('[data-ui="topbar-breadcrumbs"]').getByRole("link", { name: "Cases", exact: true }).click();
  await page.waitForURL(`${origin}/platform/cases`);
  await page.goto(`${origin}/platform/cases/FM-1048`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { level: 1, name: "LSASS process accessed by mimikatz.exe" }).waitFor();
  assert.deepEqual(errors, []);
  assert.deepEqual(mutations, []);
  const report = { layouts, errors, mutations, output };
  await writeFile(join(output, "browser-report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  console.error(JSON.stringify({ url: page?.url(), errors, mutations }));
  throw error;
} finally { await browser.close(); }
