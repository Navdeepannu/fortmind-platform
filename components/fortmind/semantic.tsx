import { cn } from "@/lib/utils";
import { semanticStyles } from "@/lib/semantic-styles";
import { Badge } from "@/components/ui/badge";
import type {
  CaseStatus,
  ConfidenceLevel,
  Priority,
  Verdict,
} from "@/lib/preview-data";
import {
  phaseStates,
  confidenceStates,
  priorityStates,
  severityStates,
  verdictStates,
  workflowStates,
  type SemanticState,
} from "@/lib/semantic-states";

export function SemanticIcon({
  definition,
  label,
}: {
  definition: SemanticState;
  label?: string;
}) {
  const Icon = definition.icon;
  return (
    <Icon
      className={cn(
        "size-4 shrink-0 stroke-2",
        semanticStyles[definition.tone].foreground,
      )}
      data-ui="semantic-icon"
      data-tone={definition.tone}
      data-semantic-icon={definition.iconName}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    />
  );
}

export function SemanticBadge({
  definition,
  treatment = "badge",
  label = definition.label,
  render,
  compact = false,
  queue = false,
}: {
  definition: SemanticState;
  treatment?: "badge" | "priority" | "status" | "inline" | "solid";
  label?: React.ReactNode;
  render?: React.ReactElement;
  compact?: boolean;
  queue?: boolean;
}) {
  const Icon = definition.icon;
  return (
    <Badge
      data-ui="badge"
      variant="outline"
      iconSize="compact"
      className={cn(
        "h-6 gap-1.25 rounded-sm px-1.75 py-0.5 text-xs leading-4.5 font-medium [&>svg]:shrink-0 motion-reduce:transition-none",
        semanticStyles[definition.tone].badge,
        semanticStyles[definition.tone].interactive,
        (treatment === "priority" ||
          treatment === "status" ||
          treatment === "inline") && [
          "gap-1.5 border-transparent bg-transparent px-0 text-neutral-foreground",
          semanticStyles[definition.tone].icon,
        ],
        treatment === "solid" && semanticStyles[definition.tone].solid,
        queue &&
          treatment === "priority" && [
            "rounded-none border-0",
            semanticStyles[definition.tone].solidIcon,
            definition.label === "Urgent" &&
              "[&>svg]:text-danger-foreground dark:[&>svg]:text-danger",
          ],
        compact &&
          "h-auto min-h-5.5 max-w-full gap-1 border-transparent px-1.25 py-px text-[11px] whitespace-normal",
      )}
      data-tone={definition.tone}
      data-treatment={treatment}
      data-state={definition.label}
      title={definition.meaning}
      render={render}
    >
      <Icon
        aria-hidden="true"
        data-icon="inline-start"
        data-semantic-icon={definition.iconName}
      />
      {label}
    </Badge>
  );
}

export function VerdictBadge({ value }: { value: Verdict }) {
  return <SemanticBadge definition={verdictStates[value]} />;
}

export function PriorityBadge({
  value,
  queue = false,
}: {
  value: Priority;
  queue?: boolean;
}) {
  return (
    <SemanticBadge
      definition={priorityStates[value]}
      treatment="priority"
      queue={queue}
    />
  );
}

export function CaseStatusBadge({
  value,
  closedByOscar,
}: {
  value: CaseStatus;
  closedByOscar?: boolean;
}) {
  const label = value === "Closed" && closedByOscar ? "Closed by OSCAR" : value;
  return (
    <SemanticBadge definition={workflowStates[label]} treatment="status" />
  );
}
export function SeverityBadge({
  value,
}: {
  value: keyof typeof severityStates;
}) {
  return <SemanticBadge definition={severityStates[value]} />;
}

export function ConfidenceIcon({
  level,
  label,
}: {
  level: ConfidenceLevel;
  label?: string;
}) {
  const definition = confidenceStates[level];
  return (
    <svg
      className="size-4 shrink-0 text-neutral-foreground [&_[data-active=true]]:fill-current [&_[data-active=false]]:fill-none [&_[data-active=false]]:stroke-current [&_[data-active=false]]:stroke-1"
      viewBox="0 0 16 16"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      {[5, 9, 13].map((height, index) => (
        <rect
          key={height}
          x={1.5 + index * 5}
          y={14.5 - height}
          width="3"
          height={height}
          rx="0.5"
          data-active={index < definition.activeBars}
        />
      ))}
    </svg>
  );
}
export function ConfidenceIndicator({
  value,
  level,
}: {
  value?: number;
  level: ConfidenceLevel;
}) {
  return (
    <span
      data-ui="confidence"
      className="inline-flex items-center gap-1.25 text-xs leading-4.5 whitespace-nowrap text-neutral-foreground"
      role="img"
      aria-label={`${level} investigation confidence${value === undefined ? "" : `, ${value}%`}`}
      title={confidenceStates[level].meaning}
    >
      <ConfidenceIcon level={level} />
      {value !== undefined && <span className="tabular-nums">{value}%</span>}
      <span>{level}</span>
    </span>
  );
}
export function PhaseIndicator({
  name,
  state,
}: {
  name: string;
  state: keyof typeof phaseStates;
}) {
  return (
    <span title={`${name}: ${phaseStates[state].meaning}`}>
      <SemanticBadge
        definition={phaseStates[state]}
        label={
          <>
            {name}
            <span className="sr-only">: {state}</span>
          </>
        }
      />
    </span>
  );
}
