import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const lifecycle = readFileSync(
  new URL("../components/fortmind/overview/oscar-case-lifecycle-preview.tsx", import.meta.url),
  "utf8",
);
const overviewRuns = readFileSync(
  new URL("../components/fortmind/overview/investigations.tsx", import.meta.url),
  "utf8",
);

test("OSCAR Home summary is compact and keeps detailed lifecycle off the dashboard", () => {
  assert.match(overviewRuns, /monitoredInvestigations\.slice\(0, 3\)/);
  assert.match(overviewRuns, /data-ui="oscar-activity-summary"/);
  assert.match(overviewRuns, /href=\{caseHref\(item\.id\)\}/);
  assert.doesNotMatch(overviewRuns, /OscarCaseLifecyclePreview|data-ui="run-inspector"/);
});

test("lifecycle states come from recorded investigation phases, not guessed progress", () => {
  assert.match(lifecycle, /const progress = investigationProgress\(item\)/);
  assert.match(lifecycle, /progress\.steps\.map\(\(\{ phase, state \}\)/);
  for (const state of ["completed", "active", "pending", "failed", "unknown"]) {
    assert.match(lifecycle, new RegExp("^\\s*" + state + ": \\{", "m"));
  }
  assert.match(lifecycle, /Unrecorded phases are unknown, not assumed complete/);
  assert.doesNotMatch(lifecycle, /Date\.now\(|setInterval\(|new Date\(/);
});

test("preview distinguishes synthetic timing and provisional verdicts from final outcomes", () => {
  assert.match(lifecycle, /Sample elapsed/);
  assert.match(lifecycle, /Time not recorded/);
  assert.match(lifecycle, /item\.status === "Running" \|\| item\.status === "Queued"/);
  assert.match(lifecycle, /awaitingVerdict \? "Not finalized" : item\.verdict/);
  assert.match(lifecycle, /href=\{caseHref\(item\.id\)\}/);
  assert.match(lifecycle, /Demonstration case/);
});
