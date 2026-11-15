import { cn } from "@/lib/utils";
import { ChevronsUp, ChevronUp, ChevronDown } from "lucide-react";
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
        "size-3.5 shrink-0 stroke-[1.75]",
        definition.iconClassName ?? semanticStyles[definition.tone].foreground,
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
  showIcon = true,
}: {
  definition: SemanticState;
  treatment?: "badge" | "muted" | "priority" | "status" | "inline" | "solid";
  label?: React.ReactNode;
  render?: React.ReactElement;
  compact?: boolean;
  queue?: boolean;
  showIcon?: boolean;
}) {
  const Icon = definition.icon;
  return (
    <Badge
      data-ui="badge"
      variant="outline"
      iconSize="compact"
      className={cn(
        "h-6 gap-1.25 rounded-sm px-1.75 py-0.5 text-caption font-medium transition-none [&>svg]:shrink-0 [&>svg]:stroke-[1.75]",
        semanticStyles[definition.tone].badge,
        treatment === "muted" && semanticStyles[definition.tone].muted,
        (treatment === "priority" || treatment === "inline") && [
          "gap-1.5 border-transparent bg-transparent px-0",
          semanticStyles[definition.tone].foreground,
          semanticStyles[definition.tone].icon,
        ],
        treatment === "status" && [
          "gap-1.5 border-transparent bg-transparent px-0 text-foreground",
          !definition.iconClassName && semanticStyles[definition.tone].icon,
        ],
        treatment === "solid" && semanticStyles[definition.tone].solid,
        queue &&
          treatment === "priority" &&
          "rounded-none border-0 has-data-[icon=inline-start]:pl-0",
        compact &&
          "h-auto min-h-5.5 max-w-full gap-1 px-1.25 py-px text-caption whitespace-nowrap has-data-[icon=inline-start]:pl-1.25",
        compact &&
          treatment === "status" &&
          "border-0 px-0 has-data-[icon=inline-start]:pl-0",
      )}
      data-tone={definition.tone}
      data-treatment={treatment}
      data-state={definition.label}
      aria-description={definition.meaning}
      render={render}
    >
      {showIcon && (
        <Icon
          aria-hidden="true"
          className={definition.iconClassName}
          data-icon="inline-start"
          data-semantic-icon={definition.iconName}
        />
      )}
      {label}
    </Badge>
  );
}

const verdictMarkerClass: Record<Verdict, string> = {
  Malicious: "bg-verdict-malicious",
  Suspicious: "bg-verdict-suspicious",
  Benign: "bg-verdict-benign",
  Inconclusive: "bg-verdict-inconclusive",
};

export function VerdictMarker({ value }: { value: Verdict }) {
  return (
    <span
      data-ui="verdict-marker"
      data-verdict={value}
      aria-hidden="true"
      className={cn(
        "inline-block size-2 shrink-0 self-center rounded-[2px]",
        verdictMarkerClass[value],
      )}
    />
  );
}

// Keep the existing component API while rendering the verdict as a plain inline value.
export function VerdictBadge({
  value,
  score,
  compact = false,
}: {
  value: Verdict;
  score?: number;
  compact?: boolean;
}) {
  const hasScore =
    typeof score === "number" &&
    Number.isFinite(score) &&
    score >= 0 &&
    score <= 100;
  return (
    <span
      data-ui="verdict"
      data-verdict={value}
      aria-description={verdictStates[value].meaning}
      className={cn(
        "inline-flex min-h-6 max-w-full items-center gap-2 whitespace-nowrap text-body font-medium text-foreground",
        compact && "min-h-5.5 text-body",
      )}
    >
      <VerdictMarker value={value} />
      <span data-ui="verdict-label">{value}</span>
      {hasScore && (
        <span
          data-ui="verdict-score"
          className="text-caption tabular-nums text-muted-foreground"
          aria-label={`Verdict confidence ${score} out of 100`}
        >
          {score}/100
        </span>
      )}
    </span>
  );
}

export function PriorityBars({ value }: { value: Priority }) {
  const activeBars = { Urgent: 3, Notable: 2, Informational: 1 }[value];
  return (
    <svg
      data-ui="priority-bars"
      data-priority={value}
      viewBox="0 0 16 16"
      stroke="none"
      aria-hidden="true"
      className="size-4 shrink-0"
    >
      {[5, 9, 13].map((height, index) => (
        <rect
          key={height}
          x={1.5 + index * 5}
          y={14.5 - height}
          width="3"
          height={height}
          rx="0.5"
          data-active={index < activeBars}
          className={cn({
            "fill-priority-urgent": index < activeBars && value === "Urgent",
            "fill-priority-active": index < activeBars && value !== "Urgent",
            "fill-priority-inactive": index >= activeBars,
          })}
        />
      ))}
    </svg>
  );
}

/** Linear-style direction glyphs for the queue; color is secondary to shape and text. */
export function QueuePriorityIcon({ value }: { value: Priority }) {
  const Icon = value === "Urgent" ? ChevronsUp : value === "Notable" ? ChevronUp : ChevronDown;
  return (
    <Icon
      data-ui="queue-priority-icon"
      data-priority={value}
      aria-hidden="true"
      className={cn(
        "size-4 shrink-0 stroke-[2.1]",
        value === "Urgent" ? "text-foreground" : "text-muted-foreground",
      )}
    />
  );
}

export function PriorityBadge({ value, queue = false }: { value: Priority; queue?: boolean }) {
  return (
    <span
      data-ui="priority"
      data-priority={value}
      aria-description={priorityStates[value].meaning}
      className="inline-flex min-h-6 items-center gap-2 whitespace-nowrap text-body font-normal text-foreground"
    >
      {queue ? <QueuePriorityIcon value={value} /> : <PriorityBars value={value} />}
      <span data-ui="priority-label">{value}</span>
    </span>
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
      className="inline-flex items-center gap-1.25 text-caption whitespace-nowrap text-neutral-foreground"
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
