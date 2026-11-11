"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Circle,
  CircleDashed,
  CircleX,
  Minus,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyTechnicalValue } from "@/components/fortmind/copy-technical-value";
import { investigationProgress, type InvestigationStepState } from "@/lib/investigation-progress";
import { caseHref } from "@/lib/platform-routes";
import { formatAge, type SecurityCase } from "@/lib/preview-data";
import { cn } from "@/lib/utils";

const phaseStates: Record<
  InvestigationStepState,
  { label: string; icon: typeof Circle; className: string }
> = {
  completed: { label: "Done", icon: Check, className: "text-success-foreground" },
  active: { label: "In progress", icon: CircleDashed, className: "text-oscar-foreground" },
  pending: { label: "Pending", icon: Circle, className: "text-muted-foreground" },
  failed: { label: "Failed", icon: CircleX, className: "text-danger-foreground" },
  unknown: { label: "Not recorded", icon: Minus, className: "text-muted-foreground" },
};

function PhaseStatus({ state }: { state: InvestigationStepState }) {
  const { label, icon: Icon, className } = phaseStates[state];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-caption", className)}>
      <Icon aria-hidden="true" className="size-3.5" />
      {label}
    </span>
  );
}

function resolutionLabel(item: SecurityCase) {
  switch (item.status) {
    case "Needs you":
      return "Waiting for analyst review";
    case "Escalated":
      return "Escalated for review";
    case "Running":
      return "OSCAR investigating";
    case "Failed":
      return "Investigation failed";
    case "Closed":
      return "Case closed";
    default:
      return "Waiting for investigation";
  }
}

/**
 * Snapshot-only case lifecycle, modelled on the live product's contextual preview.
 *
 * The fixture records phase states, not phase completion timestamps. Never infer
 * completed earlier phases from the current phase, and never show case age as
 * time spent waiting for an analyst.
 */
export function OscarCaseLifecyclePreview({
  item,
  stage,
  elapsed,
  mode = "full",
}: {
  item: SecurityCase;
  stage: string;
  elapsed?: string;
  mode?: "full" | "timeline";
}) {
  const progress = investigationProgress(item);
  const awaitingVerdict =
    item.status === "Running" || item.status === "Queued" || item.status === "Failed";
  const receivedAsAlert = item.source === "SIEM webhook";
  const hasPhaseEvidence = progress.steps.some(({ state }) => state !== "unknown");

  return (
    <div
      data-ui="oscar-case-lifecycle-preview"
      role="group"
      className="flex min-w-0 flex-col gap-5"
      aria-label={`Case lifecycle for ${item.id}`}
    >
      {mode === "full" && <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CopyTechnicalValue label="case ID" value={item.id} />
          <span className="text-caption text-muted-foreground">
            Demonstration case
          </span>
        </div>
        <div className="min-w-0">
          <h3 className="text-panel-title wrap-anywhere">{item.title}</h3>
          <p className="mt-1 text-caption text-muted-foreground">
            {item.entities.hostname} · {elapsed
              ? `Sample elapsed ${elapsed}`
              : `Case age ${formatAge(item.ageMinutes)}`}
          </p>
        </div>
      </header>}

      <section aria-labelledby={`lifecycle-heading-${item.id}`}>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h4 id={`lifecycle-heading-${item.id}`} className="text-label font-semibold">
            Investigation timeline
          </h4>
          <span className="text-caption text-muted-foreground">
            Recorded phases only
          </span>
        </div>
        <ol className="relative ml-1.5 flex flex-col gap-2 border-l border-border pl-5">
          <li className="relative pb-1">
            <span
              aria-hidden="true"
              className="absolute -left-[1.61rem] top-1.5 flex size-3 items-center justify-center rounded-full border border-border bg-card"
            >
              <Radio className="size-2 text-muted-foreground" />
            </span>
            <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="text-label font-medium">
                {receivedAsAlert ? "Alert received" : "Case created"}
              </span>
              <span className="text-caption text-muted-foreground">Time not recorded</span>
            </div>
            <p className="mt-1 text-caption text-muted-foreground wrap-anywhere">
              {item.source}
            </p>
          </li>
          {hasPhaseEvidence ? progress.steps.map(({ phase, state }) => (
            <li key={phase} data-step-state={state} className="relative">
              <span
                aria-hidden="true"
                className={cn(
                  "absolute -left-[1.61rem] top-4 size-3 rounded-full border border-border bg-card",
                  state === "active" && "border-oscar bg-oscar",
                  state === "failed" && "border-danger bg-danger",
                  state === "completed" && "border-success bg-success",
                )}
              />
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md border border-border bg-card px-3 py-2.5">
                <span className="text-label font-medium">{phase}</span>
                <PhaseStatus state={state} />
              </div>
            </li>
          )) : (
            <li className="relative rounded-md border border-border bg-card px-3 py-3 text-caption text-muted-foreground">
              Phase history has not been recorded for this case.
            </li>
          )}
          <li className="relative pt-1">
            <span
              aria-hidden="true"
              className="absolute -left-[1.61rem] top-2.5 size-3 rounded-full border border-border bg-card"
            />
            <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="text-label font-medium">{resolutionLabel(item)}</span>
              <span className="text-caption text-muted-foreground">
                {item.status === "Running" ? "Current state" : item.status}
              </span>
            </div>
          </li>
        </ol>
        {!progress.fullyRecorded && (
          <p className="mt-3 text-caption text-muted-foreground">
            Unrecorded phases are unknown, not assumed complete.
          </p>
        )}
      </section>

      {mode === "full" && <>
      <section aria-label="Current investigation context" className="overflow-hidden rounded-md border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-3">
          <h4 className="text-label font-semibold">Case details</h4>
          <span className="text-caption text-oscar-foreground">{stage}</span>
        </div>
        <dl className="divide-y divide-border px-3">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 py-3 text-caption">
            <dt className="text-muted-foreground">Host</dt>
            <dd className="min-w-0 break-all font-mono text-foreground">{item.entities.hostname}</dd>
          </div>
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 py-3 text-caption">
            <dt className="text-muted-foreground">Priority</dt>
            <dd className="text-foreground">{item.priority}</dd>
          </div>
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 py-3 text-caption">
            <dt className="text-muted-foreground">OSCAR verdict</dt>
            <dd className="text-foreground">
              {awaitingVerdict ? "Not finalized" : item.verdict}
            </dd>
          </div>
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 py-3 text-caption">
            <dt className="text-muted-foreground">Owner</dt>
            <dd className="text-foreground">{item.owner ?? "Unassigned"}</dd>
          </div>
        </dl>
      </section>

      <section aria-label="OSCAR summary" className="min-w-0">
        <h4 className="text-label font-semibold">What OSCAR has reported</h4>
        <p className="mt-2 text-prose text-muted-foreground wrap-anywhere">
          {item.summary}
        </p>
        <p className="mt-2 text-caption text-muted-foreground">
          Phase timestamps and individual step durations are not present in this sample.
        </p>
      </section>
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        role="link"
        render={<Link href={caseHref(item.id)} />}
        className="self-start"
      >
        Open investigation <ArrowUpRight data-icon="inline-end" />
      </Button>
      </>}
    </div>
  );
}
