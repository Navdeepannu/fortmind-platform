import type { CaseStatus, SecurityCase } from "./preview-data";

/**
 * Operational lanes are a presentation grouping, NOT a workflow mutation.
 * Queued and Escalated retain their exact status in each rendered case card.
 */
export const caseBoardLanes = [
  {
    id: "attention",
    label: "Needs attention",
    description: "Decisions and escalations",
    statuses: ["Needs you", "Escalated"],
  },
  {
    id: "progress",
    label: "In progress",
    description: "Running and queued",
    statuses: ["Running", "Queued"],
  },
  {
    id: "closed",
    label: "Closed",
    description: "Completed investigations",
    statuses: ["Closed"],
  },
  {
    id: "failed",
    label: "Failed",
    description: "Recovery required",
    statuses: ["Failed"],
  },
] as const satisfies readonly {
  id: string;
  label: string;
  description: string;
  statuses: readonly CaseStatus[];
}[];

export type CaseBoardLaneId = (typeof caseBoardLanes)[number]["id"];

const priorityRank = {
  Urgent: 0,
  Notable: 1,
  Informational: 2,
} as const;

/** Stable, exhaustive grouping of matching cases with attention-first ordering. */
export function casesByLane(items: readonly SecurityCase[]) {
  return caseBoardLanes.map((lane) => ({
    ...lane,
    cases: items
      .filter((item) => (lane.statuses as readonly CaseStatus[]).includes(item.status))
      .sort(
        (a, b) =>
          priorityRank[a.priority] - priorityRank[b.priority] ||
          b.ageMinutes - a.ageMinutes ||
          a.id.localeCompare(b.id),
      ),
  }));
}
