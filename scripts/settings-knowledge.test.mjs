import assert from "node:assert/strict";
import { test } from "node:test";
import { loadProjectModule } from "./load-project-module.mjs";
const { settingsDefaults, settingsValidators, validEmail } = loadProjectModule("lib/settings-data.ts");
const { demoFacts, validFacts } = loadProjectModule("lib/knowledge-data.ts");

test("settings schemas accept defaults and reject unsupported automation and invalid limits", () => {
  for (const [section, validate] of Object.entries(settingsValidators)) assert.equal(validate(settingsDefaults[section]), true, section);
  assert.equal(settingsValidators.investigations({ ...settingsDefaults.investigations, mode: "report" }), false);
  assert.equal(settingsValidators.investigations({ ...settingsDefaults.investigations, analyze: NaN }), false);
  assert.equal(settingsValidators.alerts({ ...settingsDefaults.alerts, window: 0 }), false);
  assert.equal(settingsValidators.spend({ ...settingsDefaults.spend, dailyBudget: -1 }), false);
  assert.equal(settingsValidators.responses({ mode: "execute" }), false);
});
test("recipients require valid unique addresses and a bounded list", () => {
  assert.equal(validEmail("analyst@example.test"), true);
  assert.equal(validEmail("not-an-email"), false);
  assert.equal(settingsValidators.escalation({ enabled: true, recipients: ["a@example.test", "a@example.test"] }), false);
  assert.equal(settingsValidators.escalation({ enabled: true, recipients: ["a@example.test"] }), true);
});
test("weekly report remains email-only and malformed fact storage is rejected", () => {
  const notifications = structuredClone(settingsDefaults.notifications);
  notifications.preferences.weekly.inApp = true;
  assert.equal(settingsValidators.notifications(notifications), false);
  assert.equal(validFacts(demoFacts), true);
  assert.equal(validFacts([...demoFacts, ...demoFacts]), false);
  assert.equal(validFacts([{ ...demoFacts[0], category: "unknown" }]), false);
  assert.equal(validFacts([{ ...demoFacts[0], updatedAt: "invalid" }]), false);
});
