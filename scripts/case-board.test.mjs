import assert from "node:assert/strict";
import { test } from "node:test";
import { loadProjectModule } from "./load-project-module.mjs";

const { caseBoardLanes, casesByLane } = loadProjectModule("lib/case-board.ts");
const { cases, statuses } = loadProjectModule("lib/preview-data.ts");

test("every workflow status belongs to exactly one board lane", () => {
  const all = caseBoardLanes.flatMap(lane => [...lane.statuses]);
  assert.deepEqual([...new Set(all)].sort(), [...statuses].sort());
  assert.equal(all.length, statuses.length, "no case can appear twice");
  assert.deepEqual(caseBoardLanes.map(lane => lane.label), [
    "Needs attention", "In progress", "Closed", "Failed",
  ]);
});

test("board grouping preserves every matching case exactly once", () => {
  const input = cases.map(item => ({ ...item }));
  const lanes = casesByLane(input);
  const displayed = lanes.flatMap(lane => lane.cases);
  assert.equal(displayed.length, input.length);
  assert.deepEqual(
    displayed.map(item => item.id).sort(),
    input.map(item => item.id).sort(),
  );
  assert.deepEqual(input, cases, "sorting must not mutate case data");
});

test("escalated and queued keep their raw status while grouped", () => {
  const sample = cases[0];
  const records = [
    { ...sample, id: "escalated", status: "Escalated" },
    { ...sample, id: "queued", status: "Queued" },
    { ...sample, id: "running", status: "Running" },
    { ...sample, id: "failed", status: "Failed" },
  ];
  const lanes = casesByLane(records);
  assert.deepEqual(lanes[0].cases.map(item => item.id), ["escalated"]);
  assert.deepEqual(lanes[1].cases.map(item => item.id).sort(), ["queued", "running"]);
  assert.deepEqual(lanes[3].cases.map(item => item.id), ["failed"]);
  assert.equal(lanes[0].cases[0].status, "Escalated");
  assert.equal(lanes[1].cases[0].status === "Queued" || lanes[1].cases[0].status === "Running", true);
});

test("within each lane urgent and oldest cases appear first", () => {
  const sample = cases[0];
  const input = [
    { ...sample, id: "notable", priority: "Notable", ageMinutes: 100, status: "Needs you" },
    { ...sample, id: "urgent-new", priority: "Urgent", ageMinutes: 5, status: "Needs you" },
    { ...sample, id: "urgent-old", priority: "Urgent", ageMinutes: 20, status: "Escalated" },
  ];
  assert.deepEqual(casesByLane(input)[0].cases.map(item => item.id), [
    "urgent-old", "urgent-new", "notable",
  ]);
});
