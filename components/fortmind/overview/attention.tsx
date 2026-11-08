"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
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
      className="h-full gap-0 overflow-hidden rounded-lg border border-border bg-card py-0 shadow-none"
    >
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b px-6 py-5">
        <div className="flex min-w-0 flex-col gap-1">
          <CardTitle>
            <h2 id="cases-heading" className="text-panel-title">
              Needs your attention
            </h2>
          </CardTitle>
          <CardDescription className="text-caption">
            Human decisions · urgent first, then oldest case
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
      <CardContent className="flex-1 p-0">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="h-11 px-6">
                Investigation / next action
              </TableHead>
              <TableHead className="hidden h-11 w-25 px-3 text-center sm:table-cell">
                Priority
              </TableHead>
              <TableHead className="hidden h-11 w-29 px-3 text-center sm:table-cell">
                Verdict
              </TableHead>
              <TableHead className="h-11 w-19 px-3 text-center">
                Case age
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attentionCases.map((item) => (
              <TableRow key={item.id} data-case-id={item.id}>
                <TableCell className="min-w-0 whitespace-normal px-6 py-5 align-middle">
                  <CaseQuickPreview item={item}>
                    <button
                      type="button"
                      className="line-clamp-2 max-w-full cursor-pointer text-left text-body font-medium hover:underline hover:underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      aria-label={`Preview ${item.id}: ${item.title}`}
                    >
                      {item.title}
                    </button>
                  </CaseQuickPreview>
                  <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-caption text-muted-foreground">
                    <code className="font-mono">{item.id}</code>
                    <span aria-hidden="true">·</span>
                    <span className="min-w-0 truncate">
                      {item.entities.hostname}
                    </span>
                  </div>
                  <p
                    data-ui="attention-action"
                    className="mt-2 line-clamp-2 text-caption text-muted-foreground"
                  >
                    {caseNextAction(item)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 sm:hidden">
                    <PriorityBadge value={item.priority} />
                    <VerdictBadge value={item.verdict} />
                  </div>
                </TableCell>
                <TableCell className="hidden px-3 py-5 text-center align-middle sm:table-cell">
                  <div className="flex justify-center">
                    <PriorityBadge value={item.priority} />
                  </div>
                </TableCell>
                <TableCell className="hidden px-3 py-5 text-center align-middle sm:table-cell">
                  <div className="flex justify-center">
                    <VerdictBadge value={item.verdict} />
                  </div>
                </TableCell>
                <TableCell
                  className="px-3 py-5 text-center align-middle text-caption tabular-nums whitespace-nowrap text-muted-foreground"
                  title={`Case age ${item.ageMinutes} minutes; waiting duration unavailable`}
                >
                  {formatAge(item.ageMinutes)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="mt-auto flex flex-col items-stretch gap-3 border-t px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-caption text-muted-foreground">
            {attentionCases.length} highlighted · {operations.needsYou} awaiting
            decisions
          </p>
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={showHandoffs}
            aria-controls="overview-handoffs"
            onClick={() => setShowHandoffs((value) => !value)}
            className="px-0"
          >
            Escalations & recovery{" "}
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
                      className="self-start cursor-pointer text-left text-body font-medium hover:underline"
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
