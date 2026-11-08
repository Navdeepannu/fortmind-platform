import type { SecurityCase } from "./preview-data";
import { queueStatusStates, verdictStates } from "./semantic-states";

export function queueVerdict(item: Pick<SecurityCase, "verdict" | "verdictConfidence">) {
  const definition = verdictStates[item.verdict];
  const score = item.verdictConfidence;
  const hasScore = typeof score === "number" && Number.isFinite(score) && score >= 0 && score <= 100;
  return {
    definition,
    label: hasScore ? `${definition.label} · ${score}/100` : definition.label,
    score: hasScore ? score : undefined,
  };
}

export function queueStatus(
  item: Pick<SecurityCase, "status" | "closedByOscar" | "investigationPhase" | "outcomeDescription">,
) {
  const autonomousClosure = item.status === "Closed" && item.closedByOscar === true;
  const definition = queueStatusStates[autonomousClosure ? "Closed by OSCAR" : item.status];
  const phase = item.status === "Running" || item.status === "Failed"
    ? item.investigationPhase?.trim()
    : undefined;
  return {
    definition,
    label: phase ? `${definition.label} · ${phase}` : definition.label,
    description: item.outcomeDescription?.trim() || undefined,
    treatment: "status" as const,
  };
}
