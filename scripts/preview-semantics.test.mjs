import assert from "node:assert/strict";
import { test } from "node:test";
import * as lucide from "lucide-react";
import { loadProjectModule } from "./load-project-module.mjs";

const registry = loadProjectModule("lib/semantic-states.ts");
// Product contract from the refinement brief, independent of the rendering implementation.
const expected = {
  Verdicts: {
    Malicious: ["danger", "shield-alert"],
    Suspicious: ["warning", "circle-help"],
    Benign: ["positive", "circle-check"],
    Inconclusive: ["neutral", "circle-dashed"],
  },
  Priorities: {
    Urgent: ["danger", "alert-triangle"],
    Notable: ["warning", "bell"],
    Informational: ["information", "info"],
  },
  Workflow: {
    "Needs you": ["warning", "user-round-pen"],
    Running: ["information", "circle-dashed"],
    Closed: ["positive", "circle-check"],
    Failed: ["failure", "circle-x"],
    Queued: ["neutral", "clock-3"],
  },
  Outcomes: {
    "Closed by OSCAR": ["positive", "check-circle-2"],
    Escalated: ["escalation", "arrow-up-from-line"],
    "Investigation complete": ["positive", "check"],
    "Human review required": ["warning", "user-round-check"],
    Unresolved: ["neutral", "circle-help"],
  },
  Evidence: {
    OK: ["positive", "check"],
    Error: ["failure", "circle-x"],
    "Timed out": ["warning", "clock-alert"],
    Skipped: ["neutral", "skip-forward"],
  },
  Actions: {
    Proposed: ["neutral", "file-clock"],
    Approved: ["positive", "check"],
    Rejected: ["neutral", "x"],
    Done: ["positive", "check-check"],
    Pending: ["neutral", "clock-3"],
  },
  Integrations: {
    Connected: ["positive", "plug-zap"],
    "Not connected": ["neutral", "plug"],
    Testing: ["information", "loader-circle"],
    Error: ["failure", "circle-alert"],
    "Key expired": ["warning", "key-round"],
    "Key accepted": ["positive", "key-round"],
  },
  Hypotheses: {
    Confirmed: ["positive", "check"],
    Refuted: ["neutral", "x"],
    Inconclusive: ["neutral", "circle-help"],
    Primary: ["agent", "target"],
  },
};
for (const [category, states] of Object.entries(expected)) {
  test(`${category} retain the exact product tone and icon contract`, () => {
    assert.deepEqual(
      Object.keys(registry.semanticCatalog[category]),
      Object.keys(states),
    );
    for (const [label, [tone, iconName]] of Object.entries(states)) {
      const state = registry.semanticCatalog[category][label];
      assert.equal(state.label, label);
      assert.equal(state.tone, tone);
      assert.equal(state.iconName, iconName);
    }
  });
}
test("all catalog entries have a supported Lucide component, meaning, and semantic color token", () => {
  for (const states of Object.values(registry.semanticCatalog)) {
    for (const [label, state] of Object.entries(states)) {
      const exportName = state.iconName
        .split("-")
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join("");
      assert.ok(
        lucide[exportName],
        `${state.iconName} exists in installed Lucide`,
      );
      assert.equal(state.icon, lucide[exportName]);
      assert.equal(state.label.toLowerCase(), label.toLowerCase());
      assert.ok(state.meaning.length > 15);
      assert.equal(state.color, `var(--semantic-${state.tone})`);
    }
  }
});
test("neutral states retain distinct meanings and precise icons without severity", () => {
  const states = [
    registry.assignmentStates.Unassigned,
    registry.actionStates.Proposed,
    registry.actionStates.Pending,
    registry.hypothesisStates.Refuted,
    registry.verdictStates.Inconclusive,
    registry.integrationStates["Not connected"],
  ];
  assert.ok(states.every((state) => state.tone === "neutral"));
  assert.equal(
    new Set(states.map((state) => state.iconName)).size,
    states.length,
  );
  assert.equal(
    new Set(states.map((state) => state.meaning)).size,
    states.length,
  );
});


test("confidence levels share neutral meaning with ordered fill levels and no inferred thresholds", () => {
  const levels = Object.values(registry.confidenceStates);
  assert.deepEqual(levels.map(state => state.label), ["Low", "Medium", "High"]);
  assert.deepEqual(levels.map(state => state.activeBars), [1, 2, 3]);
  assert.ok(levels.every(state => state.tone === "neutral"));
  assert.ok(levels.every(state => !Object.hasOwn(state, "threshold")));
});
test("outcomes remain distinct from lifecycle while legacy case statuses are supported", () => {
  assert.ok(!Object.hasOwn(registry.lifecycleStates, "Escalated"));
  assert.ok(!Object.hasOwn(registry.lifecycleStates, "Closed by OSCAR"));
  assert.equal(registry.workflowStates.Escalated, registry.outcomeStates.Escalated);
  assert.equal(registry.workflowStates["Closed by OSCAR"], registry.outcomeStates["Closed by OSCAR"]);
  assert.equal(registry.lifecycleStates.Closed.tone, "positive");
  assert.equal(registry.outcomeStates["Investigation complete"].tone, "positive");
});
