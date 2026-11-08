import { investigationPhases, type SecurityCase } from "./preview-data";

export type InvestigationStepState =
  "completed" | "active" | "pending" | "failed" | "unknown";

// A later active phase does not prove that earlier phases completed.
export function investigationProgress(
  item: Pick<SecurityCase, "investigationPhases">,
) {
  const steps = investigationPhases.map((phase) => ({
    phase,
    state:
      item.investigationPhases?.[phase] ??
      ("unknown" as InvestigationStepState),
  }));
  const fullyRecorded = steps.every((step) => step.state !== "unknown");
  return {
    steps,
    completed: fullyRecorded
      ? steps.filter((step) => step.state === "completed").length
      : null,
    total: steps.length,
    fullyRecorded,
    current: steps.find(
      (step) => step.state === "active" || step.state === "failed",
    )?.phase,
  };
}
