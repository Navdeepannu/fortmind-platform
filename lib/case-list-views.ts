import type { CaseStatus, Queue, SecurityCase } from "./preview-data";

// Work views deliberately overlap: they answer different analyst questions.
export const caseListViews = [
  {
    value: "attention",
    label: "Needs attention",
    description:
      "Decisions, escalations, and failed investigations that need recovery.",
  },
  {
    value: "mine",
    label: "Assigned to me",
    description: "Open cases assigned to the current analyst.",
  },
  {
    value: "unassigned",
    label: "Unassigned",
    description: "Open cases without an owner.",
  },
  {
    value: "all",
    label: "All cases",
    description: "Every case, including closed investigations.",
  },
] as const;
export type CaseListView = (typeof caseListViews)[number]["value"];

export function isCaseListView(value: string | null): value is CaseListView {
  return caseListViews.some((view) => view.value === value);
}

export function matchesCaseListView(
  item: SecurityCase,
  view: CaseListView,
  analyst: string,
) {
  if (view === "attention")
    return ["Needs you", "Escalated", "Failed"].includes(item.status);
  if (view === "mine")
    return item.status !== "Closed" && item.owner === analyst;
  if (view === "unassigned") return item.status !== "Closed" && !item.owner;
  return true;
}

// Keep dashboard and bookmarked lifecycle links useful after introducing work views.
export function caseListEntry(queue: Queue): {
  view: CaseListView;
  status: CaseStatus | "";
} {
  if (queue === "Needs you") return { view: "attention", status: "" };
  return { view: "all", status: queue === "All" ? "" : queue };
}
