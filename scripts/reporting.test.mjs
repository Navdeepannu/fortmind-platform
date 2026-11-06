import assert from "node:assert/strict";
import { test } from "node:test";
import { loadProjectModule } from "./load-project-module.mjs";
const { reportingRange, validDateRange, summarizeReporting, reportingCsv, reportingCases } = loadProjectModule("lib/reporting-data.ts");
const { platformCases } = loadProjectModule("lib/platform-cases.ts");
const { caseOverview } = loadProjectModule("lib/case-overview-data.ts");
const record = { id: "case-a", title: "Example case", priority: "Urgent", verdict: "Malicious", openedAt: "2026-10-31T12:00:00Z", decidedAt: "2026-11-02T12:00:00Z", closedByOscar: false, neededPerson: true, overridden: false, indicators: [{ kind: "Host", value: "host-a" }, { kind: "Host", value: "host-a" }] };

test("periods use UTC dates, matching weekdays and month-to-date comparisons", () => {
  assert.deepEqual(reportingRange({}).range, { from: "2026-11-02", to: "2026-11-05" });
  assert.deepEqual(reportingRange({}).previous, { from: "2026-10-26", to: "2026-10-29" });
  assert.deepEqual(reportingRange({ range: "month" }).previous, { from: "2026-10-01", to: "2026-10-05" });
  assert.deepEqual(reportingRange({ range: "last-month" }).range, { from: "2026-10-01", to: "2026-10-31" });
  assert.deepEqual(reportingRange({ range: "last-month" }).previous, { from: "2026-09-01", to: "2026-09-30" });
  assert.deepEqual(reportingRange({ period: "7d" }).range, { from: "2026-10-28", to: "2026-11-03" });
});

test("invalid calendar dates, reversed ranges and excessive ranges cannot query reports", () => {
  for (const range of [{ from: "2026-02-30", to: "2026-03-01" }, { from: "2026-11-05", to: "2026-11-01" }, { from: "2020-01-01", to: "2026-01-01" }, { from: "bad", to: "bad" }]) {
    assert.equal(validDateRange(range), false);
    assert.equal(reportingRange({ range: "custom", ...range }).range, null);
  }
  assert.equal(validDateRange({ from: "2024-02-29", to: "2024-02-29" }), true);
});

test("opened and decided use independent event timestamps, while distributions reconcile to decided", () => {
  const records = [record, { ...record, id: "case-b", openedAt: "2026-11-03T12:00:00Z", decidedAt: "2026-11-04T12:00:00Z", closedByOscar: true, neededPerson: false, verdict: "Benign", indicators: [{ kind: "Host", value: "host-b" }] }, { ...record, id: "case-c", openedAt: "2026-11-05T23:59:59Z", decidedAt: null }];
  const range = { from: "2026-11-02", to: "2026-11-05" };
  const summary = summarizeReporting(range, records, []);
  assert.equal(summary.metrics.opened, 2);
  assert.equal(summary.metrics.decided, 2);
  assert.equal(summary.metrics.autoCloseRate, 50);
  assert.equal(summary.metrics.neededPerson, 1);
  assert.equal(summary.metrics.medianMinutes, 2160);
  assert.equal(summary.verdicts.reduce((sum, item) => sum + item.count, 0), 2);
  assert.equal(summary.priorities.reduce((sum, item) => sum + item.count, 0), 2);
  assert.equal(summary.indicators.find(item => item.value === "host-a").count, 1);
  assert.equal(summary.people[0].id, "case-a");
  assert.equal(summarizeReporting(range, records, [], 60).metrics.hoursSaved, 1);
});

test("outages overlapping a range remain visible even if they started earlier", () => {
  const outages = [{ integrationId: "old", name: "Earlier", stoppedAt: "2026-10-01T00:00:00Z", recoveredAt: null }, { integrationId: "recovered", name: "Recovered", stoppedAt: "2026-10-31T00:00:00Z", recoveredAt: "2026-11-02T00:00:00Z" }, { integrationId: "later", name: "Future", stoppedAt: "2026-11-06T00:00:00Z", recoveredAt: null }];
  const summary = summarizeReporting({ from: "2026-11-02", to: "2026-11-05" }, [], outages);
  assert.deepEqual(summary.health.map(item => [item.integrationId, item.recovered]), [["old", false], ["recovered", true]]);
  assert.equal(summary.metrics.autoCloseRate, null);
  assert.equal(summary.metrics.medianMinutes, null);
});

test("all report case links resolve to existing stable fixture IDs", () => {
  const ids = new Set([...platformCases.map(item => item.id), caseOverview.id]);
  assert.equal(new Set(reportingCases.map(item => item.id)).size, reportingCases.length);
  assert.ok(reportingCases.every(item => ids.has(item.id)));
});

test("CSV includes every report section, quotes values and neutralizes spreadsheet formulas", () => {
  const range = { from: "2026-11-01", to: "2026-11-05" };
  const summary = summarizeReporting(range);
  summary.people = [{ ...record, title: '=SUM(1,2) "quoted"' }];
  const csv = reportingCsv(range, summary);
  for (const section of ["Metrics", "Verdict", "Priority", "Indicator", "Needed a person", "Tool health"]) assert.ok(csv.includes(`"${section}"`));
  assert.ok(csv.includes('"\'=SUM(1,2) ""quoted"""'));
  assert.ok(csv.includes(range.from) && csv.includes(range.to));
});
