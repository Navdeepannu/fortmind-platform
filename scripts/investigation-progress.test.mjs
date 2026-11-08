import assert from "node:assert/strict";
import { test } from "node:test";
import { loadProjectModule } from "./load-project-module.mjs";

const { investigationProgress } = loadProjectModule(
  "lib/investigation-progress.ts",
);
const {
  monitoredInvestigations,
  runningCases,
  runningCaseDetails,
  handoffCases,
} = loadProjectModule("lib/overview-data.ts");
const { findPlatformCase } = loadProjectModule("lib/platform-cases.ts");

test("partial phase telemetry never implies prior completion, pending steps, or a progress count", () => {
  const partial = investigationProgress({
    investigationPhases: { Analyze: "active" },
  });
  assert.equal(partial.current, "Analyze");
  assert.equal(partial.completed, null);
  assert.equal(partial.fullyRecorded, false);
  assert.deepEqual(
    partial.steps.map((step) => step.state),
    ["unknown", "unknown", "unknown", "active", "unknown"],
  );
  const missing = investigationProgress({});
  assert.equal(missing.current, undefined);
  assert.equal(missing.completed, null);
  assert.ok(missing.steps.every((step) => step.state === "unknown"));
});

test("complete supplied telemetry supports a step count and preserves a failed phase", () => {
  const result = investigationProgress({
    investigationPhases: {
      Intake: "completed",
      Plan: "completed",
      Collect: "failed",
      Analyze: "pending",
      Report: "pending",
    },
  });
  assert.equal(result.completed, 2);
  assert.equal(result.total, 5);
  assert.equal(result.current, "Collect");
  assert.equal(result.steps[2].state, "failed");
});

test("monitoring retains supplied timing and leaves the undefined correlation mapping absent", () => {
  for (const { item, elapsed } of monitoredInvestigations) {
    assert.equal(item.status, "Running");
    assert.equal(findPlatformCase(item.id)?.id, item.id);
    const fixture = runningCases.find((entry) => entry.id === item.id);
    assert.equal(elapsed, fixture?.elapsed);
    assert.equal(investigationProgress(item).completed, null);
  }
  const correlation = runningCaseDetails(
    runningCases.find((entry) => entry.id === "FM-1050"),
  );
  assert.equal(correlation.investigationPhases, undefined);
  assert.ok(
    handoffCases.some(
      (item) => item.status === "Failed" && item.recommendedNextAction,
    ),
  );
  assert.ok(handoffCases.some((item) => item.status === "Escalated"));
});
