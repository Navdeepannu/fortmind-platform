import assert from "node:assert/strict";
import { test } from "node:test";
import { loadProjectModule } from "./load-project-module.mjs";

const { resolveCaseView, caseViewForTarget } = loadProjectModule("lib/case-sections.ts");
const { caseHref, caseViewHref } = loadProjectModule("lib/platform-routes.ts");
const select = query => resolveCaseView(new URLSearchParams(query));

test("case URLs resolve defaults, category defaults, and compatible secondary views", () => {
  for (const [query, tab, view] of [
    ["", "decision", "conclusion"],
    ["tab=decision&view=how-oscar-decided", "decision", "how-oscar-decided"],
    ["tab=investigation", "investigation", "findings"],
    ["tab=investigation&view=hypotheses", "investigation", "hypotheses"],
    ["tab=evidence&view=similar-cases", "evidence", "similar-cases"],
    ["tab=response&view=analyst-notes", "response", "analyst-notes"],
    ["tab=timeline", "timeline", "timeline"],
    ["view=attack-path", "investigation", "attack-path"],
  ]) assert.deepEqual(select(query), { tab, view }, query);
});

test("unknown and mismatched parameters cannot expose a view under the wrong category", () => {
  for (const [query, expected] of [
    ["tab=unknown&view=hypotheses", { tab: "decision", view: "conclusion" }],
    ["tab=evidence&view=hypotheses", { tab: "evidence", view: "entities" }],
    ["tab=response&view=unknown", { tab: "response", view: "actions" }],
    ["view=unknown", { tab: "decision", view: "conclusion" }],
    ["tab=__proto__&view=constructor", { tab: "decision", view: "conclusion" }],
  ]) assert.deepEqual(select(query), expected, query);
});

test("existing finding, entity, review, section, and category permalinks resolve their workspace", () => {
  for (const [target, tab, view] of [
    ["finding-memory-access", "investigation", "findings"],
    ["entity-host-fmlab-ws1", "evidence", "entities"],
    ["decision-heading", "decision", "conclusion"],
    ["how-oscar-decided", "decision", "how-oscar-decided"],
    ["hypotheses-heading", "investigation", "hypotheses"],
    ["case-category-response", "response", "actions"],
    ["timeline", "timeline", "timeline"],
  ]) assert.deepEqual(caseViewForTarget(target), { tab, view }, target);
  assert.equal(caseViewForTarget("unrelated-heading"), undefined);
});

test("view URLs preserve stable case identity, unrelated query state, and explicit technical targets", () => {
  const route = caseHref("case / 42");
  const href = caseViewHref(`${route}?source=search&tab=decision&view=conclusion#decision-heading`, { tab: "investigation", view: "findings" }, "finding-host-alerts");
  const url = new URL(href, "https://fortmind.example");
  assert.equal(url.pathname, route);
  assert.deepEqual([...url.searchParams], [["source", "search"], ["tab", "investigation"], ["view", "findings"]]);
  assert.equal(url.hash, "#finding-host-alerts");
  const next = new URL(caseViewHref(href, { tab: "response", view: "actions" }), url.origin);
  assert.equal(next.hash, "");
  assert.equal(next.searchParams.get("source"), "search");
  assert.equal(next.searchParams.getAll("tab").length, 1);
  assert.equal(next.searchParams.getAll("view").length, 1);
});
