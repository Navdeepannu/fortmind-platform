"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronRight, Clock3, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { monitoredInvestigations, operations } from "@/lib/overview-data";
import { formatAge } from "@/lib/preview-data";
import { investigationProgress } from "@/lib/investigation-progress";
import type { SecurityCase } from "@/lib/preview-data";
import { cn } from "@/lib/utils";
import { OscarMark } from "../oscar-mark";
import { InvestigationProgress } from "../investigation-progress";

/** Display only recorded phase states. Unknown does not imply pending or complete. */
function PhaseRail({ item }: { item: SecurityCase }) {
  const progress = investigationProgress(item);
  return (
    <span className="mt-1 flex gap-1" aria-hidden="true">
      {progress.steps.map(({ phase, state }) => (
        <span
          key={phase}
          className={cn(
            "h-1 flex-1 rounded-full bg-border",
            state === "active" && "bg-oscar",
            state === "completed" && "bg-success",
            state === "failed" && "bg-danger",
          )}
        />
      ))}
    </span>
  );
}

/**
 * A master-detail agent run workspace, rather than a passive list of statuses.
 * Selecting a run reveals only supplied activity and phase evidence.
 */
export function ActiveInvestigations() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  return (
    <Card
      data-ui="card running"
      role="region"
      aria-labelledby="running-heading"
      className="@container h-full min-w-0 gap-0 overflow-hidden rounded-lg border border-border bg-card py-0 shadow-none"
    >
      <div className="border-b border-border bg-card px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-caption font-medium text-muted-foreground">
            <span className="flex size-7 items-center justify-center rounded-sm border border-border bg-surface text-oscar-foreground">
              <OscarMark className="size-4" />
            </span>
            OSCAR · Agent activity
          </span>
          <span className="flex items-center gap-2 rounded-sm border border-border bg-background px-2.5 py-1 text-caption text-muted-foreground">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-oscar" />
            Snapshot, not live telemetry
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-lg">
            <h2 id="running-heading" className="text-section-title font-semibold text-foreground">
              OSCAR is investigating
            </h2>
            <p className="mt-1.5 text-prose text-muted-foreground">
              Follow an investigation from signal to evidence. Select a run to
              inspect the recorded phase, activity and next destination.
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <strong className="text-metric font-semibold tabular-nums text-foreground">
              {operations.running}
            </strong>
            <span className="pb-1 text-caption text-muted-foreground">running</span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-3 text-caption text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <ScanLine aria-hidden="true" className="size-3.5" />
            {monitoredInvestigations.length} sample investigations
          </span>
          <span>Intake → Plan → Collect → Analyze → Report</span>
        </div>
      </div>

      <div className="grid min-w-0 flex-1 grid-cols-1 @min-[740px]:grid-cols-[minmax(0,1fr)_minmax(0,0.93fr)]">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3 sm:px-6">
            <h3 className="text-label font-semibold">Investigation runs</h3>
            <span className="text-caption text-muted-foreground">Select for details <span className="@min-[740px]:hidden">below</span></span>
          </div>
          <ul className="divide-y divide-border">
            {monitoredInvestigations.map(({ item, stage, elapsed, activity }) => {
              const expanded = expandedId === item.id;
              const panelId = `activity-${item.id}`;
              const triggerId = `activity-trigger-${item.id}`;
              return (
                <li
                  key={item.id}
                  data-ui="active-investigation"
                  data-case-id={item.id}
                >
                  <button
                    id={triggerId}
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    aria-label={`Activity for ${item.id}: ${item.title}`}
                    onClick={() => setExpandedId(expanded ? null : item.id)}
                    className={cn(
                      "group flex w-full cursor-pointer flex-col gap-2 px-5 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-6",
                      expanded ? "bg-surface-hover" : "hover:bg-surface-hover",
                    )}
                  >
                    <span className="flex w-full items-start justify-between gap-3">
                      <span className="line-clamp-2 text-body font-medium">
                        {item.title}
                      </span>
                      <ChevronRight
                        aria-hidden="true"
                        className={cn(
                          "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform",
                          expanded && "rotate-90 text-foreground",
                        )}
                      />
                    </span>
                    <span className="flex w-full flex-wrap items-center gap-x-2 gap-y-1 text-caption text-muted-foreground">
                      <code className="font-mono">{item.id}</code>
                      <span aria-hidden="true">·</span>
                      <span className="max-w-full truncate">{item.entities.hostname}</span>
                    </span>
                    <span className="flex w-full flex-wrap items-center justify-between gap-2 text-caption">
                      <span className="font-medium text-oscar-foreground">{stage}</span>
                      <span className="inline-flex items-center gap-1 text-muted-foreground tabular-nums">
                        <Clock3 aria-hidden="true" className="size-3" />
                        {elapsed
                          ? `Elapsed ${elapsed}`
                          : `Case age ${formatAge(item.ageMinutes)}`}
                      </span>
                    </span>
                    <PhaseRail item={item} />
                    {activity && (
                      <span className="line-clamp-1 text-caption text-muted-foreground">
                        {activity}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div
          data-ui="run-inspector"
          className="min-w-0 border-t border-border bg-surface @min-[740px]:border-t-0 @min-[740px]:border-l"
        >
          {expandedId === null && (
            <div className="flex h-full min-h-64 flex-col items-start justify-center gap-3 p-6">
              <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-background">
                <ScanLine aria-hidden="true" className="size-5 text-oscar-foreground" />
              </div>
              <h3 className="text-panel-title">Inspect a run</h3>
              <p className="max-w-72 text-prose text-muted-foreground">
                Choose an investigation to see the recorded phase and available
                context. Missing telemetry is shown as unknown, not completed.
              </p>
            </div>
          )}
          {monitoredInvestigations.map(({ item, stage, elapsed }) => {
            const expanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                id={`activity-${item.id}`}
                role="region"
                aria-labelledby={`activity-trigger-${item.id}`}
                hidden={!expanded}
                className="h-full p-5 sm:p-6"
              >
                {expanded && (
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-caption font-medium uppercase tracking-wide text-muted-foreground">
                        Selected run · {item.id}
                      </span>
                      <span className="text-caption font-medium text-oscar-foreground">
                        {stage}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-panel-title">{item.title}</h3>
                      <p className="mt-1 text-caption text-muted-foreground">
                        {item.entities.hostname} · {elapsed
                          ? `Elapsed ${elapsed}`
                          : `Case age ${formatAge(item.ageMinutes)}`}
                      </p>
                    </div>
                    <div className="border-y border-border py-4">
                      <InvestigationProgress item={item} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h4 className="text-label font-semibold">What OSCAR has reported</h4>
                      <p className="text-prose text-muted-foreground">{item.summary}</p>
                      <p className="text-caption text-muted-foreground">
                        Event history and step durations are not recorded in this sample.
                        {!elapsed && " Investigation elapsed time is unavailable."}
                      </p>
                    </div>
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <CardFooter className="border-t border-border px-5 py-3 sm:px-6">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          role="link"
          render={<Link href="/platform/cases?queue=Running" />}
          className="h-auto w-full justify-between px-0"
        >
          {monitoredInvestigations.length} shown · view running cases{" "}
          <ArrowRight data-icon="inline-end" />
        </Button>
      </CardFooter>
    </Card>
  );
}
