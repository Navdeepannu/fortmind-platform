"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { monitoredInvestigations, operations } from "@/lib/overview-data";
import { caseHref } from "@/lib/platform-routes";
import { formatAge, investigationPhases } from "@/lib/preview-data";
import { investigationProgress } from "@/lib/investigation-progress";
import type { SecurityCase } from "@/lib/preview-data";
import { cn } from "@/lib/utils";
import { OscarMark } from "../oscar-mark";
import { InvestigationProgress } from "../investigation-progress";

function PhaseSignal({ item }: { item: SecurityCase }) {
  const { steps } = investigationProgress(item);
  return (
    <div className="flex items-center gap-1.5" aria-label={`Recorded phases for ${item.id}`}>
      {steps.map(({ phase, state }) => (
        <span
          key={phase}
          data-phase={phase}
          data-state={state}
          title={`${phase}: ${state === "unknown" ? "Not recorded" : state}`}
          className={cn(
            "h-2 min-w-0 flex-1 rounded-[2px] bg-border",
            state === "completed" && "bg-success",
            state === "active" && "bg-oscar",
            state === "failed" && "bg-danger",
            state === "pending" && "bg-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

export function ActiveInvestigations() {
  const [selectedId, setSelectedId] = useState<string>(
    monitoredInvestigations.find(({ elapsed }) => Boolean(elapsed))?.item.id ??
      monitoredInvestigations[0]?.item.id ?? "",
  );
  const selected = monitoredInvestigations.find(({ item }) => item.id === selectedId);
  return (
    <Card
      id="running"
      data-ui="card running"
      role="region"
      aria-labelledby="running-heading"
      className="@container min-w-0 gap-0 overflow-hidden rounded-lg border border-border bg-card py-0 shadow-none"
    >
      <div className="relative overflow-hidden bg-[#101719] px-5 py-5 text-white sm:px-6">
        <div className="flex items-start justify-between gap-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-white/15 bg-white/10 text-[#8DDFC1]">
              <OscarMark className="size-5" />
            </span>
            <div>
              <p className="text-caption uppercase tracking-[0.08em] text-white/60">OSCAR · agent workspace</p>
              <h2 id="running-heading" className="mt-0.5 text-panel-title font-semibold text-white">
                OSCAR is investigating
              </h2>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end">
            <span className="text-3xl font-semibold tabular-nums leading-none text-white">
              {operations.running}
            </span>
            <span className="mt-1 text-caption text-white/60">running</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/15 pt-3 text-caption text-white/60">
          <span>Investigation phase map</span>
          <span>{monitoredInvestigations.length} sample runs · not live</span>
        </div>
      </div>

      <div className="px-4 pt-4 pb-1 sm:px-5">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(106px,38%)] items-center gap-3 px-2 pb-2 text-caption text-muted-foreground">
          <span>Investigation</span>
          <div className="grid grid-cols-5 gap-1 text-center" aria-hidden="true">
            {investigationPhases.map((phase) => (
              <span key={phase} title={phase} className="truncate text-[10px]">
                {phase === "Analyze" ? "Analyze" : phase}
              </span>
            ))}
          </div>
        </div>
        <ul className="divide-y divide-border">
          {monitoredInvestigations.map(({ item, stage, elapsed }) => {
            const active = selectedId === item.id;
            return (
              <li key={item.id} data-ui="active-investigation" data-case-id={item.id}>
                <button
                  type="button"
                  id={`run-trigger-${item.id}`}
                  aria-label={`Activity for ${item.id}: ${item.title}`}
                  aria-expanded={active}
                  aria-controls={`activity-${item.id}`}
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    "grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_minmax(106px,38%)] items-center gap-3 rounded-sm px-2 py-3 text-left outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring",
                    active && "bg-surface-hover",
                  )}
                >
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="line-clamp-1 text-label font-medium">{item.title}</span>
                    <span className="flex items-center gap-1.5 truncate text-caption text-muted-foreground">
                      <span className="shrink-0 font-mono">{item.id}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{elapsed ? stage : item.entities.hostname}</span>
                    </span>
                  </span>
                  <PhaseSignal item={item} />
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-2 flex items-center justify-between gap-3 border-t border-border px-2 py-3">
          <span className="text-caption text-muted-foreground">
            Filled = recorded · muted = unknown or pending
          </span>
          <Link
            href="/platform/cases?queue=Running"
            className="inline-flex shrink-0 items-center gap-1.5 text-label font-medium hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            View all <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </div>

      <div
        data-ui="run-inspector"
        className="min-w-0 border-t border-border bg-muted/25 px-5 py-4 sm:px-6"
      >
        {selected && monitoredInvestigations.map(({ item, stage, elapsed }) => {
          if (item.id !== selectedId) return null;
          return (
            <section
              key={item.id}
              id={`activity-${item.id}`}
              role="region"
              aria-labelledby={`run-trigger-${item.id}`}
              className="grid min-w-0 gap-4 @min-[620px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
            >
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2 text-caption">
                  <span className="font-mono text-muted-foreground">{item.id}</span>
                  <span className="rounded-sm bg-oscar/10 px-2 py-0.5 font-medium text-oscar-foreground">
                    {stage}
                  </span>
                </div>
                <p className="line-clamp-2 text-body font-medium">{item.title}</p>
                <p className="mt-1 text-caption text-muted-foreground">
                  {item.entities.hostname} · {elapsed ? `Elapsed ${elapsed}` : `Case age ${formatAge(item.ageMinutes)}`}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  role="link"
                  render={<Link href={caseHref(item.id)} />}
                  className="mt-3"
                >
                  Open investigation <ArrowUpRight data-icon="inline-end" />
                </Button>
              </div>
              <div className="min-w-0 border-t border-border pt-3 @min-[620px]:border-t-0 @min-[620px]:border-l @min-[620px]:pl-4 @min-[620px]:pt-0">
                <InvestigationProgress item={item} />
                <div className="mt-3">
                  <h3 className="text-caption font-semibold">What OSCAR has reported</h3>
                  <p className="mt-1 line-clamp-2 text-caption text-muted-foreground" title={item.summary}>
                    {item.summary}
                  </p>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </Card>
  );
}
