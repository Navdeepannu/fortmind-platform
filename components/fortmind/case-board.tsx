"use client";

import Link from "next/link";
import { ArrowUpRight, Eye } from "lucide-react";
import type { SecurityCase } from "@/lib/preview-data";
import { casesByLane } from "@/lib/case-board";
import { caseHref } from "@/lib/platform-routes";
import { formatAge } from "@/lib/preview-data";
import { Button } from "@/components/ui/button";
import { CaseStatusBadge, PriorityBadge, VerdictBadge } from "./semantic";

interface CaseBoardProps {
  cases: readonly SecurityCase[];
  onPreview: (item: SecurityCase, trigger: HTMLElement, keyboard: boolean) => void;
}

/**
 * Read-only Kanban view over the identical filtered case data used by the table.
 * Workflow transitions remain on the investigation detail page.
 */
export function CaseBoard({ cases, onPreview }: CaseBoardProps) {
  const lanes = casesByLane(cases);
  return (
    <div
      data-ui="case-board"
      role="region"
      aria-label="Cases grouped by workflow"
      className="min-w-0"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3 text-caption text-muted-foreground">
        <span>
          {cases.length} matching {cases.length === 1 ? "case" : "cases"} · grouped by workflow
        </span>
        <span>Read-only board · open an investigation to take action</span>
      </div>
      <div
        data-ui="board-scroll"
        className="min-w-0 overflow-x-auto overscroll-x-contain px-3 py-4 sm:px-4"
        tabIndex={0}
        aria-label="Scroll horizontally to view all workflow columns"
      >
        <div className="grid min-w-[1080px] grid-cols-4 items-start gap-3">
          {lanes.map((lane) => (
            <section
              key={lane.id}
              data-ui="board-lane"
              data-lane={lane.id}
              aria-label={lane.label}
              className="min-w-0 overflow-hidden rounded-md border border-border bg-muted/35"
            >
              <header className="flex flex-col gap-1 border-b border-border px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-label font-semibold text-foreground">{lane.label}</h2>
                  <span
                    data-ui="lane-count"
                    className="rounded-sm border border-border bg-background px-1.5 py-0.5 text-caption tabular-nums text-muted-foreground"
                  >
                    {lane.cases.length}
                  </span>
                </div>
                <p className="text-caption text-muted-foreground">{lane.description}</p>
              </header>
              <ul className="flex min-h-48 flex-col gap-2 p-2.5">
                {lane.cases.map((item) => (
                  <li key={item.id} data-case-id={item.id}>
                    <article className="group flex min-w-0 flex-col gap-3 rounded-md border border-border bg-card p-3 transition-colors hover:border-border-strong">
                      <div className="flex min-w-0 items-center justify-between gap-2 text-caption text-muted-foreground">
                        <code className="font-mono">{item.id}</code>
                        <span className="shrink-0 tabular-nums" title="Case age, not time waiting">
                          {formatAge(item.ageMinutes)} ago
                        </span>
                      </div>

                      <Link
                        href={caseHref(item.id)}
                        className="line-clamp-3 text-body font-medium text-foreground underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        {item.title}
                      </Link>
                      <p
                        className="truncate font-mono text-caption text-muted-foreground"
                        title={item.entities.hostname}
                      >
                        {item.entities.hostname}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <PriorityBadge value={item.priority} />
                        <VerdictBadge value={item.verdict} compact />
                      </div>
                      {(item.status === "Queued" ||
                        item.status === "Escalated" ||
                        (item.status === "Closed" && item.closedByOscar)) && (
                        <div className="border-t border-border pt-2">
                          <CaseStatusBadge
                            value={item.status}
                            closedByOscar={item.closedByOscar}
                          />
                        </div>
                      )}
                      {(lane.id === "attention" || lane.id === "failed") &&
                        item.recommendedNextAction?.trim() && (
                          <div className="border-l-2 border-border pl-2.5">
                            <span className="text-caption font-medium text-foreground">
                              Next step
                            </span>
                            <p className="mt-1 line-clamp-2 text-caption text-muted-foreground">
                              {item.recommendedNextAction.trim()}
                            </p>
                          </div>
                        )}
                      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-2">
                        <span
                          className="min-w-0 truncate text-caption text-muted-foreground"
                          title={item.owner ?? "Unassigned"}
                        >
                          {item.owner ?? "Unassigned"}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Quick preview ${item.id}`}
                          title={`Quick preview ${item.id}`}
                          onClick={(event) => onPreview(item, event.currentTarget, event.detail === 0)}
                        >
                          <Eye aria-hidden="true" />
                        </Button>
                        <Link
                          href={caseHref(item.id)}
                          className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-surface-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                          aria-label={`Open investigation ${item.id}`}
                          title={`Open investigation ${item.id}`}
                        >
                          <ArrowUpRight aria-hidden="true" className="size-4" />
                        </Link>
                      </div>
                    </article>
                  </li>
                ))}
                {lane.cases.length === 0 && (
                  <li className="rounded-md border border-dashed border-border px-3 py-6 text-center text-caption text-muted-foreground">
                    No matching cases
                  </li>
                )}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
