"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { attentionCases, operations } from "@/lib/overview-data";
import { caseHref } from "@/lib/platform-routes";
import { formatAge } from "@/lib/preview-data";
import { caseNextAction } from "@/lib/case-context";
import { CaseQuickPreview } from "../case-table";
import { PriorityBadge, VerdictBadge } from "../semantic";

/**
 * Decision-first Home preview. The queue is authoritative for workflow actions;
 * this panel only surfaces the three highest-priority sample cases.
 */
export function NeedsAttention() {
  return (
    <Card
      data-ui="card attention"
      role="region"
      aria-labelledby="cases-heading"
      className="min-w-0 gap-0 overflow-hidden rounded-lg border border-border bg-card py-0 shadow-none"
    >
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 id="cases-heading" className="text-panel-title font-semibold">
            Needs your attention
          </h2>
          <p className="mt-1 text-caption text-muted-foreground">
            Top {attentionCases.length} cases · urgent first, then oldest · sample snapshot
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          role="link"
          render={<Link href="/platform/cases?queue=Needs%20you" />}
        >
          View queue <ArrowRight data-icon="inline-end" />
        </Button>
      </CardHeader>

      <CardContent className="min-w-0 p-0">
        <ul data-ui="attention-preview-list" className="divide-y divide-border">
          {attentionCases.map((item) => (
            <li
              key={item.id}
              data-case-id={item.id}
              className="flex min-w-0 flex-wrap items-center justify-between gap-x-5 gap-y-3 px-5 py-3.5 sm:px-6"
            >
              <div className="min-w-0 flex-1 basis-64">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                  <code className="font-mono text-caption text-muted-foreground">
                    {item.id}
                  </code>
                  <span className="text-caption text-muted-foreground" aria-hidden="true">·</span>
                  <span className="max-w-48 truncate text-caption text-muted-foreground" title={item.entities.hostname}>
                    {item.entities.hostname}
                  </span>
                  <PriorityBadge value={item.priority} />
                  <VerdictBadge value={item.verdict} />
                </div>

                <CaseQuickPreview item={item}>
                  <button
                    type="button"
                    aria-label={`Preview ${item.id}: ${item.title}`}
                    className="mt-1.5 block max-w-full cursor-pointer text-left text-body font-medium text-foreground hover:underline hover:underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {item.title}
                  </button>
                </CaseQuickPreview>
                <p
                  data-ui="attention-action"
                  className="mt-1 line-clamp-1 text-caption text-muted-foreground"
                  title={caseNextAction(item)}
                >
                  {caseNextAction(item)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span
                  className="min-w-9 text-right text-caption tabular-nums text-muted-foreground"
                  title={`Case age ${item.ageMinutes} minutes; waiting duration unavailable`}
                >
                  {formatAge(item.ageMinutes)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  role="link"
                  render={<Link href={caseHref(item.id)} />}
                  aria-label={`Open investigation ${item.id}`}
                >
                  Open <ArrowUpRight data-icon="inline-end" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border px-5 py-3 sm:px-6">
        <p className="text-caption text-muted-foreground">
          {operations.needsYou} awaiting analyst decisions in this snapshot · preview is not the full queue
        </p>
        <Link
          href="/platform/cases?queue=Needs%20you"
          className="inline-flex items-center gap-1.5 text-caption font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Open all cases <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
