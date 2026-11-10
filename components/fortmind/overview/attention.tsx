"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { attentionCases, handoffCases, operations } from "@/lib/overview-data";
import { caseHref } from "@/lib/platform-routes";
import { formatAge } from "@/lib/preview-data";
import { caseNextAction } from "@/lib/case-context";
import { cn } from "@/lib/utils";
import { CaseQuickPreview } from "../case-table";
import { CaseStatusBadge, PriorityBadge, VerdictBadge } from "../semantic";

export function NeedsAttention() {
  const [showHandoffs, setShowHandoffs] = useState(false);
  return (
    <Card
      data-ui="card attention"
      role="region"
      aria-labelledby="cases-heading"
      className="h-full min-w-0 gap-0 overflow-hidden rounded-lg border border-border bg-card py-0 shadow-none"
    >
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b px-5 py-5 sm:px-6">
        <div className="flex min-w-0 flex-col gap-1">
          <CardTitle>
            <h2 id="cases-heading" className="text-panel-title">
              Needs your attention
            </h2>
          </CardTitle>
          <CardDescription className="text-caption">
            Decision inbox · urgent first, then oldest case
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          role="link"
          render={<Link href="/platform/cases?queue=Needs%20you" />}
          className="shrink-0"
        >
          View cases <ArrowRight data-icon="inline-end" />
        </Button>
      </CardHeader>

      <div className="flex items-start gap-3 border-b border-border bg-muted/40 px-5 py-3 sm:px-6">
        <span
          aria-hidden="true"
          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning"
        />
        <p className="text-caption text-muted-foreground">
          <strong className="font-semibold text-foreground">{operations.urgent} urgent</strong> in the
          current snapshot. Preview the available case context before deciding.
        </p>
      </div>

      <CardContent className="min-w-0 flex-1 p-0">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="h-10 px-5 sm:px-6">
                Investigation / decision context
              </TableHead>
              <TableHead className="h-10 w-20 px-3 text-right sm:w-24 sm:pr-6">
                Case age
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attentionCases.map((item) => (
              <TableRow key={item.id} data-case-id={item.id}>
                <TableCell className="min-w-0 whitespace-normal px-5 py-4 align-top sm:px-6">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    <code className="font-mono text-caption text-muted-foreground">
                      {item.id}
                    </code>
                    <span className="text-muted-foreground" aria-hidden="true">·</span>
                    <span className="min-w-0 truncate text-caption text-muted-foreground">
                      {item.entities.hostname}
                    </span>
                  </div>

                  <div className="mt-2">
                    <CaseQuickPreview item={item}>
                      <button
                        type="button"
                        className="line-clamp-2 max-w-full cursor-pointer text-left text-body font-semibold hover:underline hover:underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        aria-label={`Preview ${item.id}: ${item.title}`}
                      >
                        {item.title}
                      </button>
                    </CaseQuickPreview>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <PriorityBadge value={item.priority} />
                    <VerdictBadge value={item.verdict} />
                  </div>

                  <div className="mt-3 border-l-2 border-border pl-3">
                    <span className="text-caption font-medium text-foreground">
                      Next action
                    </span>
                    <p
                      data-ui="attention-action"
                      className="mt-1 line-clamp-3 text-caption text-muted-foreground"
                    >
                      {caseNextAction(item)}
                    </p>
                  </div>

                  <Link
                    href={caseHref(item.id)}
                    className="mt-3 inline-flex min-h-7 items-center gap-1.5 text-label font-medium text-foreground underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    Review investigation
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  </Link>
                </TableCell>
                <TableCell
                  className="px-3 py-4 text-right align-top text-caption tabular-nums whitespace-nowrap text-muted-foreground sm:pr-6"
                  title={`Case age ${item.ageMinutes} minutes; waiting duration unavailable`}
                >
                  {formatAge(item.ageMinutes)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="mt-auto flex flex-col items-stretch gap-3 border-t px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-caption text-muted-foreground">
            {attentionCases.length} highlighted · {operations.needsYou} awaiting decisions
          </p>
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={showHandoffs}
            aria-controls="overview-handoffs"
            onClick={() => setShowHandoffs((value) => !value)}
            className="px-0"
          >
            Escalations & recovery
            <ChevronDown
              data-icon="inline-end"
              className={cn(showHandoffs && "rotate-180")}
            />
          </Button>
        </div>
        <div id="overview-handoffs" hidden={!showHandoffs}>
          {showHandoffs && (
            <ul className="flex flex-col gap-4 border-t pt-4">
              {handoffCases.map((item) => (
                <li key={item.id} className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <code className="text-caption text-muted-foreground">
                      {item.id}
                    </code>
                    <CaseStatusBadge value={item.status} />
                  </div>
                  <CaseQuickPreview item={item}>
                    <button
                      type="button"
                      className="self-start cursor-pointer text-left text-body font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      aria-label={`Preview ${item.id}: ${item.title}`}
                    >
                      {item.title}
                    </button>
                  </CaseQuickPreview>
                  <p className="text-caption text-muted-foreground">
                    {item.summary}
                  </p>
                  <p className="text-caption">Next: {caseNextAction(item)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
