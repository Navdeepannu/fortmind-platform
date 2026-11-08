import { Check, Circle, CircleDashed, CircleX, Minus } from "lucide-react";
import {
  investigationProgress,
  type InvestigationStepState,
} from "@/lib/investigation-progress";
import type { SecurityCase } from "@/lib/preview-data";
import { cn } from "@/lib/utils";

const stepPresentation: Record<
  InvestigationStepState,
  { label: string; icon: typeof Circle }
> = {
  completed: { label: "Completed", icon: Check },
  active: { label: "In progress", icon: CircleDashed },
  pending: { label: "Pending", icon: Circle },
  failed: { label: "Failed", icon: CircleX },
  unknown: { label: "Not recorded", icon: Minus },
};

export function InvestigationProgress({ item }: { item: SecurityCase }) {
  const progress = investigationProgress(item);
  return (
    <div data-ui="investigation-progress" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-caption">
        <h3 className="font-medium">Investigation phases</h3>
        <span className="text-muted-foreground">
          {progress.completed === null
            ? "Completion not recorded"
            : `${progress.completed} of ${progress.total} completed`}
        </span>
      </div>
      <ol
        aria-label={`Investigation phases for ${item.id}`}
        className="grid grid-cols-5 gap-1"
      >
        {progress.steps.map(({ phase, state }) => {
          const { icon: Icon, label } = stepPresentation[state];
          return (
            <li
              key={phase}
              data-step-state={state}
              aria-current={state === "active" ? "step" : undefined}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1.5 border-t-2 border-border pt-2 text-caption text-muted-foreground",
                state === "active" && "border-oscar text-oscar-foreground",
                state === "failed" && "border-danger text-danger-foreground",
              )}
            >
              <Icon aria-hidden="true" className="size-3.5" />
              <span>{phase}</span>
              <span className="sr-only">{label}</span>
            </li>
          );
        })}
      </ol>
      {!progress.fullyRecorded && (
        <p className="text-caption text-muted-foreground">
          Unmarked phases have no recorded state.
        </p>
      )}
    </div>
  );
}
