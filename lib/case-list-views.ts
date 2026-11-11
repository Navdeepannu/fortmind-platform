import type { CaseStatus, Queue, SecurityCase } from "./preview-data";

// The primary lifecycle tabs match the operational product. Secondary work views
// remain available for analysts who need ownership or escalation-based triage.
export const caseListViews = [
  { value: "needs", label: "Needs you", description: "Cases awaiting an analyst, including escalations." },
  { value: "running", label: "Running", description: "Investigations OSCAR is actively processing." },
  { value: "closed", label: "Closed", description: "Completed investigations." },
  { value: "failed", label: "Failed", description: "Investigations needing recovery." },
  { value: "all", label: "All", description: "Every case, including unassigned and queued work." },
  { value: "attention", label: "Needs attention", description: "Decisions, escalations and failed investigations needing recovery." },
  { value: "mine", label: "Assigned to me", description: "Open cases assigned to the current analyst." },
  { value: "unassigned", label: "Unassigned", description: "Open cases without an owner." },
] as const;
export type CaseListView = (typeof caseListViews)[number]["value"];

export function isCaseListView(value: string | null): value is CaseListView {
  return caseListViews.some((view) => view.value === value);
}

export function matchesCaseListView(item: SecurityCase, view: CaseListView, analyst: string) {
  if (view === "needs") return item.status === "Needs you" || item.status === "Escalated";
  if (view === "running") return item.status === "Running";
  if (view === "closed") return item.status === "Closed";
  if (view === "failed") return item.status === "Failed";
  if (view === "attention") return ["Needs you", "Escalated", "Failed"].includes(item.status);
  if (view === "mine") return item.status !== "Closed" && item.owner === analyst;
  if (view === "unassigned") return item.status !== "Closed" && !item.owner;
  return true;
}

export function caseListEntry(queue: Queue): { view: CaseListView; status: CaseStatus | "" } {
  if (queue === "Needs you") return { view: "needs", status: "" };
  if (queue === "Running") return { view: "running", status: "" };
  if (queue === "Closed") return { view: "closed", status: "" };
  if (queue === "Failed") return { view: "failed", status: "" };
  return { view: "all", status: "" };
}
