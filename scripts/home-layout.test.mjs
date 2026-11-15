import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const overview = read("components/fortmind/overview/overview.tsx");
const attention = read("components/fortmind/overview/attention.tsx");
const running = read("components/fortmind/overview/investigations.tsx");
const impact = read("components/fortmind/overview/impact.tsx");
const globals = read("app/globals.css");

test("Home prioritizes the analyst inbox over a large OSCAR inspector", () => {
  assert.match(overview, /data-ui="work-grid".*flex-col/);
  assert.match(attention, /attentionCases\.map/);
  assert.match(attention, /<CaseQuickPreview item=\{item\}>/);
  assert.match(attention, /href=\{caseHref\(item\.id\)\}/);
  assert.doesNotMatch(attention, /showHandoffs|<Table>|Escalations & recovery/);
  assert.match(running, /monitoredInvestigations\.slice\(0, 3\)/);
  assert.doesNotMatch(running, /run-inspector|OscarCaseLifecyclePreview|aria-expanded/);
});

test("mix bars use illustration fill without recoloring verdict semantics", () => {
  assert.match(impact, /function MixBarRow/);
  assert.match(impact, /bg-illustration/);
  assert.match(impact, /data-ui="mix-bar-fill"/);
  assert.match(impact, /backgroundColor: "var\(--illustration, #3B3E41\)"/);
  assert.match(impact, /<PriorityBadge value=\{item\.name\} \/>/);
  assert.match(impact, /<VerdictBadge value=\{item\.name\} \/>/);
  assert.match(impact, /aria-valuenow=\{rounded\}/);
  assert.match(globals, /--color-illustration: var\(--illustration\)/);
  assert.match(globals, /--illustration: oklch\(0\.362106 0\.006573 248\.01\)/);
});
