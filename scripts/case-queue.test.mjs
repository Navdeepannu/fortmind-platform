import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadProjectModule } from "./load-project-module.mjs";

const { queueVerdict, queueStatus } = loadProjectModule("lib/case-queue-presentation.ts");
const { queueStatusStates, workflowStates, priorityStates } = loadProjectModule("lib/semantic-states.ts");
const { cases, filterCases } = loadProjectModule("lib/preview-data.ts");
const { QueueVerdictBadge, QueueStatusIndicator } = loadProjectModule("components/fortmind/case-queue-semantic.tsx");
const base = cases[0];
const markup = (Component, props) => renderToStaticMarkup(React.createElement(Component, props));

test("verdict confidence is independent of investigation confidence; absence and invalid scores stay absent", () => {
  assert.equal(queueVerdict({ ...base, verdictConfidence: undefined }).label, "Malicious");
  for (const score of [null, undefined, NaN, Infinity, -1, 101, "98"]) {
    assert.equal(queueVerdict({ ...base, verdictConfidence: score }).label, "Malicious");
  }
  assert.equal(queueVerdict({ ...base, verdictConfidence: 0 }).label, "Malicious · 0/100");
  assert.equal(queueVerdict({ ...base, verdictConfidence: 98.5 }).label, "Malicious · 98.5/100");
  assert.equal(queueVerdict({ ...base, verdict: "Inconclusive", verdictConfidence: undefined }).label, "Inconclusive");
});

test("a supplied verdict score renders with its icon and never uses investigation confidence", () => {
  const html = markup(QueueVerdictBadge, { item: { ...base, verdictConfidence: 90 } });
  assert.match(html.replace(/<[^>]*>/g, ""), /Malicious · 90\/100/);
  assert.match(html, /data-semantic-icon="octagon-x"/);
  assert.doesNotMatch(html, /98\/100/);
});

test("OSCAR closure requires both a closed lifecycle and explicit attribution", () => {
  assert.equal(queueStatus({ status: "Closed" }).label, "Closed");
  assert.equal(queueStatus({ status: "Closed", closedByOscar: false, owner: null }).label, "Closed");
  const autonomous = queueStatus({ status: "Closed", closedByOscar: true });
  assert.equal(autonomous.label, "Closed by OSCAR");
  assert.equal(autonomous.definition.iconName, "sparkles");
  assert.equal(autonomous.definition.tone, "positive");
  assert.equal(autonomous.treatment, "badge");
  assert.equal(queueStatus({ status: "Running", closedByOscar: true }).label, "Running");
});

test("phase metadata augments Running/Failed without changing lifecycle or filling gaps", () => {
  assert.equal(queueStatus({ status: "Running", investigationPhase: "Collect" }).label, "Running · Collect");
  assert.equal(queueStatus({ status: "Failed", investigationPhase: "Report" }).label, "Failed · Report");
  assert.equal(queueStatus({ status: "Needs you", investigationPhase: "Complete" }).label, "Needs You");
  assert.equal(queueStatus({ status: "Closed", investigationPhase: "Report" }).label, "Closed");
  assert.equal(queueStatus({ status: "Failed" }).label, "Failed");
  assert.equal(queueStatus({ status: "Escalated" }).label, "Escalated");
});

test("closure reasons and errors are preserved as secondary text, escaped safely", () => {
  for (const [status, description] of [["Closed", "Closed as noise"], ["Failed", "Internal error"]]) {
    const html = markup(QueueStatusIndicator, { item: { ...base, status, outcomeDescription: description } });
    assert.match(html, new RegExp(`data-ui="queue-outcome"[^>]*>${description}`));
  }
  const html = markup(QueueStatusIndicator, { item: { ...base, outcomeDescription: "<script>alert(1)</script>" } });
  assert.doesNotMatch(html, /<script>/);
});

test("queue mappings retain urgency icons and scope green closure to the queue", () => {
  assert.deepEqual(Object.values(priorityStates).map(state => state.iconName), ["chevrons-up", "chevron-up", "minus"]);
  assert.equal(queueStatusStates["Needs you"].iconName, "hand-alert");
  assert.equal(queueStatusStates.Escalated.iconName, "arrow-up-from-line");
  assert.equal(queueStatusStates.Closed.iconName, "check-circle-2");
  assert.equal(queueStatusStates.Closed.tone, "positive");
  assert.equal(workflowStates.Closed.tone, "neutral");
  assert.equal(workflowStates["Closed by OSCAR"].tone, "agent");
  for (const status of ["Needs you", "Running", "Closed", "Failed", "Queued", "Escalated"]) {
    const html = markup(QueueStatusIndicator, { item: { ...base, status } });
    assert.match(html, /data-treatment="badge"/);
    assert.doesNotMatch(html, /data-treatment="status"/);
    assert.doesNotMatch(html, /<svg/);
  }
});

test("autonomous filter excludes a running record even if a stale attribution flag is supplied", () => {
  const filters = { queue: "All", search: "", priority: "", verdict: "", assignment: "", source: "", autonomous: true };
  const records = [{ ...base, id: "closed", status: "Closed", closedByOscar: true }, { ...base, id: "running", status: "Running", closedByOscar: true }, { ...base, id: "manual", status: "Closed", closedByOscar: false }];
  assert.deepEqual(filterCases(records, filters).map(item => item.id), ["closed"]);
});

// Type scale extensions must coexist with the status palette when classes merge.
test("readable compact badges retain semantic ink through shared typography", () => {
  const html = markup(QueueVerdictBadge, { item: { ...base, verdict: "Malicious" } });
  assert.match(html, /text-danger-foreground/);
  assert.match(html, /text-caption/);
  const { cn } = loadProjectModule("lib/utils.ts");
  assert.equal(cn("text-sm text-muted-foreground", "text-caption"), "text-muted-foreground text-caption");
});

const { matchesCaseListView, caseListEntry, isCaseListView } = loadProjectModule("lib/case-list-views.ts");
test("work views include intervention and responsibility without changing lifecycle or assignments", () => {
  const example = { ...base, status: "Failed", owner: null };
  assert.equal(matchesCaseListView(example, "attention", "Analyst"), true);
  assert.equal(matchesCaseListView(example, "unassigned", "Analyst"), true);
  assert.equal(matchesCaseListView({ ...example, status: "Running" }, "attention", "Analyst"), false);
  assert.equal(matchesCaseListView({ ...example, owner: "Analyst" }, "mine", "Analyst"), true);
  assert.equal(matchesCaseListView({ ...example, owner: "Other" }, "mine", "Analyst"), false);
  for (const view of ["mine", "unassigned", "attention"]) {
    assert.equal(matchesCaseListView({ ...example, status: "Closed", owner: view === "mine" ? "Analyst" : null }, view, "Analyst"), false);
  }
  assert.equal(matchesCaseListView({ ...example, status: "Closed" }, "all", "Analyst"), true);
  assert.equal(example.owner, null);
  assert.equal(example.status, "Failed");
});
test("lifecycle entry links retain exact running, failed and closed filters", () => {
  for (const status of ["Running", "Failed", "Closed"]) assert.deepEqual(caseListEntry(status), {view: "all", status});
  assert.deepEqual(caseListEntry("Needs you"), {view: "attention", status: ""});
  assert.equal(isCaseListView("unassigned"), true);
  assert.equal(isCaseListView("Closed"), false);
  assert.equal(isCaseListView(null), false);
});
