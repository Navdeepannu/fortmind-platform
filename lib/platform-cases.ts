import { cases, type SecurityCase } from "./preview-data";
import { runningCases, runningCaseDetails } from "./overview-data";

/** All existing fixtures reachable from the queue, Overview, or workspace search. */
export const platformCases: readonly SecurityCase[] = [
  ...cases,
  ...runningCases.map(runningCaseDetails).filter(item => !cases.some(entry => entry.id === item.id)),
];

export function findPlatformCase(caseId: string) {
  return platformCases.find(item => item.id === caseId);
}
