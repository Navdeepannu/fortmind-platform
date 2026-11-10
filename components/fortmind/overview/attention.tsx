"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { attentionCases, handoffCases, operations } from "@/lib/overview-data";
import { caseHref } from "@/lib/platform-routes";
import { formatAge } from "@/lib/preview-data";
import { caseNextAction } from "@/lib/case-context";
import { cn } from "@/lib/utils";
import { CaseQuickPreview } from "../case-table";
import { CaseStatusBadge, PriorityBadge } from "../semantic";

export function NeedsAttention() {
  const [showHandoffs, setShowHandoffs] = useState(false);
  return (
    <Card
      id="attention"
      data-ui="card attention"
      role="region"
      aria-labelledby="cases-heading"
      className="min-w-0 gap-0 overflow-hidden rounded-lg border border-border bg-card py-0 shadow-none"
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-5 sm:px-6">
        <div>
          <p className="text-caption text-muted-foreground">Analyst decisions</p>
          <h2 id="cases-heading" className="mt-1 text-panel-title font-semibold">
            Needs your attention
          </h2>
        </div>
        <span className="rounded-md border border-border px-2 py-1 text-caption font-semibold text-danger-foreground tabular-nums">
          {operations.urgent} urgent
        </span>
      </header>

      <ul className="divide-y divide-border">
        {attentionCases.map((item) => (
          <li key={item.id} data-ui="attention-item" data-case-id={item.id} className="px-5 py-4 sm:px-6">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-caption text-muted-foreground">{item.id}</span>
                  <PriorityBadge value={item.priority} />
                </div>
                <h3 className="mt-1.5 line-clamp-2 text-body font-semibold">
                  {item.title}
                </h3>
              </div>
              <span className="shrink-0 text-caption tabular-nums text-muted-foreground" title="Case age, not time waiting">
                {formatAge(item.ageMinutes)}
              </span>
            </div>
            <p className="mt-2 line-clamp-1 text-caption text-muted-foreground" title={caseNextAction(item)}>
              <span className="font-medium text-foreground">Next:</span> {caseNextAction(item)}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <CaseQuickPreview item={item}>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-0 text-muted-foreground" aria-label={`Preview ${item.id}: ${item.title}`}>
                  <Eye data-icon="inline-start" />
                  Preview
                </Button>
              </CaseQuickPreview>
              <Link
                href={caseHref(item.id)}
                className="inline-flex min-h-8 items-center gap-1.5 text-label font-medium underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                aria-label={`Review investigation ${item.id}`}
              >
                Review investigation
                <ArrowUpRight aria-hidden="true" className="size-3.5" />
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <footer className="mt-auto border-t border-border px-5 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/platform/cases?queue=Needs%20you"
            className="inline-flex items-center gap-1.5 text-label font-medium hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            All {operations.needsYou} needing review <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={showHandoffs}
            aria-controls="overview-handoffs"
            onClick={() => setShowHandoffs((value) => !value)}
            className="px-0 text-muted-foreground"
          >
            Escalations & recovery
            <ChevronDown data-icon="inline-end" className={cn(showHandoffs && "rotate-180")} />
          </Button>
        </div>
        <div id="overview-handoffs" hidden={!showHandoffs}>
          {showHandoffs && (
            <ul className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
              {handoffCases.map((item) => (
                <li key={item.id} className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-caption text-muted-foreground">{item.id}</span>
                    <CaseStatusBadge value={item.status} />
                  </div>
                  <CaseQuickPreview item={item}>
                    <button
                      type="button"
                      className="cursor-pointer text-left text-label font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      aria-label={`Preview ${item.id}: ${item.title}`}
                    >
                      {item.title}
                    </button>
                  </CaseQuickPreview>
                  <p className="line-clamp-2 text-caption text-muted-foreground">
                    {caseNextAction(item)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </footer>
    </Card>
  );
}
