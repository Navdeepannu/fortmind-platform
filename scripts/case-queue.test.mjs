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

test("a supplied verdict score stays secondary beside a square marker and never uses investigation confidence", () => {
  const html = markup(QueueVerdictBadge, { item: { ...base, verdictConfidence: 90 } });
  assert.match(html, /data-ui="verdict-label">Malicious</);
  assert.match(html, /data-ui="verdict-score"[^>]*>90\/100</);
  assert.match(html, /data-ui="verdict-marker"/);
  assert.doesNotMatch(html, /<svg|data-slot="badge"/);
  assert.doesNotMatch(html, /98\/100/);
});

test("OSCAR closure requires both a closed lifecycle and explicit attribution", () => {
  assert.equal(queueStatus({ status: "Closed" }).label, "Closed");
  assert.equal(queueStatus({ status: "Closed", closedByOscar: false, owner: null }).label, "Closed");
  const autonomous = queueStatus({ status: "Closed", closedByOscar: true });
  assert.equal(autonomous.label, "Closed by OSCAR");
  assert.equal(autonomous.definition.iconName, "check-circle-2");
  assert.equal(autonomous.definition.tone, "positive");
  assert.equal(autonomous.treatment, "status");
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

test("queue and case details share the finalized priority and workflow semantics", () => {
  assert.deepEqual(Object.values(priorityStates).map(state => state.iconName), ["alert-triangle", "bell", "info"]);
  assert.equal(queueStatusStates["Needs you"].iconName, "user-round-pen");
  assert.equal(queueStatusStates.Escalated.iconName, "arrow-up-from-line");
  assert.equal(queueStatusStates.Closed.iconName, "circle-check");
  assert.equal(queueStatusStates.Closed.tone, "positive");
  assert.equal(workflowStates.Closed.tone, "positive");
  assert.equal(workflowStates["Closed by OSCAR"].tone, "positive");
  for (const status of ["Needs you", "Running", "Closed", "Failed", "Queued", "Escalated"]) {
    const html = markup(QueueStatusIndicator, { item: { ...base, status } });
    assert.match(html, /data-treatment="status"/);
    assert.match(html, /<svg/);
    assert.match(html, new RegExp(`data-semantic-icon="${queueStatusStates[status].iconName}"`));
  }
});

test("autonomous filter excludes a running record even if a stale attribution flag is supplied", () => {
  const filters = { queue: "All", search: "", priority: "", verdict: "", assignment: "", source: "", autonomous: true };
  const records = [{ ...base, id: "closed", status: "Closed", closedByOscar: true }, { ...base, id: "running", status: "Running", closedByOscar: true }, { ...base, id: "manual", status: "Closed", closedByOscar: false }];
  assert.deepEqual(filterCases(records, filters).map(item => item.id), ["closed"]);
});

// Type scale extensions must coexist with the status palette when classes merge.
test("verdict labels and secondary scores retain shared typography", () => {
  const html = markup(QueueVerdictBadge, { item: { ...base, verdict: "Malicious" } });
  assert.match(html, /text-foreground/);
  assert.match(html, /bg-verdict-malicious/);
  assert.match(html, /text-muted-foreground/);
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
test("lifecycle entry links select the corresponding first-class queue tabs", () => {
  for (const [queue, view] of [
    ["Needs you", "needs"],
    ["Running", "running"],
    ["Closed", "closed"],
    ["Failed", "failed"],
    ["All", "all"],
  ]) assert.deepEqual(caseListEntry(queue), {view, status: ""});
  assert.equal(isCaseListView("unassigned"), true);
  assert.equal(isCaseListView("closed"), true);
  assert.equal(isCaseListView("Closed"), false);
  assert.equal(isCaseListView(null), false);
});

test("primary lifecycle tabs remain disjoint while attention work view includes recovery", () => {
  const samples = ["Needs you", "Escalated", "Running", "Closed", "Failed", "Queued"]
    .map(status => ({ ...base, status }));
  assert.deepEqual(samples.filter(item => matchesCaseListView(item, "needs", "Analyst")).map(item => item.status), ["Needs you", "Escalated"]);
  assert.deepEqual(samples.filter(item => matchesCaseListView(item, "running", "Analyst")).map(item => item.status), ["Running"]);
  assert.deepEqual(samples.filter(item => matchesCaseListView(item, "closed", "Analyst")).map(item => item.status), ["Closed"]);
  assert.deepEqual(samples.filter(item => matchesCaseListView(item, "failed", "Analyst")).map(item => item.status), ["Failed"]);
  assert.deepEqual(samples.filter(item => matchesCaseListView(item, "attention", "Analyst")).map(item => item.status), ["Needs you", "Escalated", "Failed"]);
});
