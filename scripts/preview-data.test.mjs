import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { test } from "node:test";
import ts from "typescript";

const source = await readFile(
  new URL("../lib/preview-data.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
});
const {
  cases,
  filterCases,
  matchesQueue,
  dailyCases,
  priorityMix,
  verdictMix,
  formatAge,
  reports,
} = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
const defaults = {
  queue: "All",
  search: "",
  priority: "",
  verdict: "",
  assignment: "",
  source: "",
  autonomous: false,
};

test("queue filtering keeps lifecycle independent of verdict", () => {
  assert.equal(cases.filter((item) => matchesQueue(item, "Closed")).length, 4);
  assert.equal(
    cases.filter((item) => matchesQueue(item, "Needs you")).length,
    5,
  );
  assert.ok(cases.filter((item) => matchesQueue(item, "Needs you")).some((item) => item.status === "Escalated"));
  assert.equal(cases.filter((item) => matchesQueue(item, "Running")).length, 1);
  assert.equal(cases.filter((item) => matchesQueue(item, "Failed")).length, 1);
  assert.equal(filterCases(cases, defaults).length, 12);
  assert.ok(
    filterCases(cases, { ...defaults, queue: "Closed" }).some(
      (item) => item.verdict === "Malicious",
    ),
  );
});
test("combined verdict, priority, source and ownership filters intersect", () => {
  const results = filterCases(cases, {
    ...defaults,
    queue: "Needs you",
    priority: "Urgent",
    verdict: "Malicious",
    assignment: "Alex Morgan",
    source: "SIEM webhook",
  });
  assert.deepEqual(
    results.map((item) => item.id),
    ["FM-1047"],
  );
  assert.equal(
    filterCases(cases, { ...defaults, priority: "Urgent", verdict: "Benign" })
      .length,
    0,
  );
});
test("search includes full technical data absent from the compact row", () => {
  assert.deepEqual(
    filterCases(cases, { ...defaults, search: "  192.0.2.42  " }).map(
      (item) => item.id,
    ),
    ["FM-1048"],
  );
  assert.deepEqual(
    filterCases(cases, { ...defaults, search: "FINANCE-BACKUP-2026.ZIP" }).map(
      (item) => item.id,
    ),
    ["FM-1039"],
  );
  assert.deepEqual(
    filterCases(cases, { ...defaults, search: "d41d8cd98f00b204" }).map(
      (item) => item.id,
    ),
    ["FM-1048"],
  );
});
test("unassigned ownership and autonomous attribution remain distinct", () => {
  const unassigned = filterCases(cases, {
    ...defaults,
    assignment: "unassigned",
  });
  assert.equal(unassigned.length, 5);
  assert.ok(unassigned.every((item) => item.owner === null));
  const autonomous = filterCases(cases, { ...defaults, autonomous: true });
  assert.deepEqual(
    autonomous.map((item) => item.id),
    ["FM-1044", "FM-1040"],
  );
  assert.ok(autonomous.every((item) => item.status === "Closed"));
  assert.equal(
    filterCases(cases, { ...defaults, autonomous: true, queue: "Needs you" })
      .length,
    0,
  );
});
test("daily volume and semantic distributions describe the same reporting total", () => {
  assert.equal(
    dailyCases.reduce((sum, item) => sum + item.cases, 0),
    232,
  );
  for (const mix of [priorityMix, verdictMix])
    assert.equal(
      mix.reduce((sum, item) => sum + item.value, 0),
      232,
    );
});

test("both reporting windows keep daily volume and distributions consistent", () => {
  for (const report of Object.values(reports)) {
    const total = report.daily.reduce((sum, item) => sum + item.cases, 0);
    assert.equal(report.daily.length, report.days);
    assert.equal(
      report.priorities.reduce((sum, item) => sum + item.value, 0),
      total,
    );
    assert.equal(
      report.verdicts.reduce((sum, item) => sum + item.value, 0),
      total,
    );
  }
});
test("case identifiers are unique and age formatting crosses minute/hour/day boundaries", () => {
  assert.equal(new Set(cases.map((item) => item.id)).size, cases.length);
  assert.equal(formatAge(59), "59m");
  assert.equal(formatAge(60), "1h");
  assert.equal(formatAge(1440), "1d");
});
