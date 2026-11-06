"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Link2, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  attentionCases,
  operations,
  runningCases,
  runningCaseDetails,
} from "@/lib/overview-data";
import { formatAge } from "@/lib/preview-data";
import { PriorityBadge, VerdictBadge } from "../semantic";
import { CaseQuickPreview } from "../case-table";
import { NewCase } from "../new-case";
import { PlatformImpact } from "./impact";
import { useWorkspace } from "../workspace-shell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function OverviewContent() {
  const { openPanel } = useWorkspace();
  const metrics = [
    {
      label: "Needs you",
      value: operations.needsYou,
      detail: "Awaiting your decision",
      queue: "Needs you",
    },
    {
      label: "Running",
      value: operations.running,
      detail: "OSCAR is investigating",
      queue: "Running",
    },
    {
      label: "Closed",
      value: operations.closed,
      detail: "All closed cases",
      queue: "Closed",
    },
    {
      label: "Failed",
      value: operations.failed,
      detail: "Investigation needs a retry",
      queue: "Failed",
    },
  ];
  return (
    <div
      data-ui="main"
      id="preview-main"
      className="mx-auto w-full min-w-0 p-5 md:p-8"
    >
      <div
        data-ui="page-heading"
        className="flex flex-wrap justify-between items-center gap-6 max-[1101px]:items-start max-md:items-start max-md:gap-3"
      >
        <div>
          <h1 className="text-page-title">Overview</h1>
          <p className="mt-1 text-body text-muted-foreground">
            What needs you, and what OSCAR has handled.
          </p>
        </div>
        <div
          data-ui="page-actions"
          className="flex items-center gap-2.5 shrink-0 max-[1360px]:gap-1.75 max-[1101px]:[&>_button:first-child]:hidden"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={() => openPanel("integrations")}
            className="pt-0 pr-3 pb-0 pl-3 max-[1360px]:text-xs max-md:h-8 max-md:pt-0 max-md:pr-2.25 max-md:pb-0 max-md:pl-2.25 max-md:text-xs"
          >
            <Link2 data-icon="inline-start" />
            Connect tools
          </Button>
          <NewCase />
        </div>
      </div>
      {/* metrics key 4 metrics */}
      <section
        data-ui="metrics"
        className="grid grid-cols-2 gap-4 my-8 md:grid-cols-4 lg:gap-6"
        aria-label="Current case status"
      >
        <h2 className="sr-only text-section-title">Current operations</h2>
        {metrics.map((metric) => (
          <Link
            data-ui="metric"
            className="group/metric bg-card border border-border p-5 md:p-6 rounded-lg hover:bg-surface-hover  transition-colors duration-150"
            key={metric.label}
            href={`/platform/cases?queue=${encodeURIComponent(metric.queue)}`}
          >
            <div
              data-ui="metric-label"
              className="flex items-center gap-2 text-label font-medium leading-5 max-md:text-xs text-muted-foreground"
            >
              <span>{metric.label}</span>
              <ArrowUpRight
                data-ui="metric-arrow"
                className="ml-auto opacity-0 max-md:hidden group-hover/metric:tranalte-x-0 group-hover/metric:translate-y-0 group-hover/metric:opacity-100 translate-x-1 translate-y-1  w-4.25 h-4.25 text-muted-foreground max-md:w-4 max-md:h-4 transition-all duration-200"
                aria-hidden="true"
              />
            </div>
            <div data-ui="metric-body" className="flex flex-col mt-4 gap-3">
              <strong className="text-metric tabular-nums">
                {metric.value}
              </strong>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {metric.label === "Needs you" && (
                  <span
                    data-ui="urgent-count"
                    className="shrink-0 whitespace-nowrap text-danger-foreground text-label font-medium"
                  >
                    {operations.urgent} urgent
                  </span>
                )}
                <p className="text-caption text-muted-foreground">
                  {metric.detail}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* section 2 needs your attenstion and OSCAR investigation */}
      <div
        data-ui="work-grid"
        className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]"
      >
        <Card
          data-ui="card attention"
          role="region"
          aria-labelledby="cases-heading"
          className="h-full gap-0 overflow-hidden rounded-lg border border-border bg-card py-0 shadow-none"
        >
          <CardHeader className="flex flex-row items-center justify-between gap-3 border-b px-6 py-5">
            <div className="min-w-0 space-y-1">
              <CardTitle>
                <h2 id="cases-heading" className="text-section-title">
                  Needs your attention
                </h2>
              </CardTitle>
              <CardDescription className="text-caption">
                Urgent first, then longest waiting
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/platform/cases?queue=Needs%20you" />}
              className="shrink-0 gap-1.5 text-xs"
            >
              View all {operations.needsYou}
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 p-0">
            <Table className="w-full table-fixed">
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-11 px-5 text-left text-xs font-medium text-muted-foreground xl:px-6">
                    Investigation
                  </TableHead>
                  <TableHead className="hidden h-11 w-28 px-3 text-center text-xs font-medium text-muted-foreground sm:table-cell">
                    Priority
                  </TableHead>
                  <TableHead className="hidden h-11 w-32 px-3 text-center text-xs font-medium text-muted-foreground sm:table-cell">
                    Verdict
                  </TableHead>
                  <TableHead className="h-11 w-20 px-3 text-center text-xs font-medium text-muted-foreground">
                    Waiting
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attentionCases.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="min-w-0 whitespace-normal px-6 py-5 align-middle">
                      <CaseQuickPreview item={item}>
                        <button
                          type="button"
                          className="line-clamp-2 max-w-full cursor-pointer text-left text-body font-medium hover:underline hover:underline-offset-2 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                          aria-label={`Preview ${item.id}: ${item.title}`}
                        >
                          {item.title}
                        </button>
                      </CaseQuickPreview>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground 2xl:text-label">
                        <code className="font-mono">{item.id}</code>
                        <span aria-hidden="true">·</span>
                        <span className="min-w-0 truncate">
                          {item.entities.hostname}
                        </span>
                      </div>
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
                      className="px-3 py-5 text-center align-middle text-xs tabular-nums whitespace-nowrap text-muted-foreground"
                      title={`Waiting ${item.ageMinutes} minutes`}
                    >
                      {formatAge(item.ageMinutes)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="mt-auto border-t px-6 py-4 text-xs text-muted-foreground">
            {attentionCases.length} highlighted cases
          </CardFooter>
        </Card>

        <Card
          data-ui="card running"
          role="region"
          aria-labelledby="running-heading"
          className="h-full gap-0 overflow-hidden rounded-lg border border-border bg-card py-0 shadow-none"
        >
          <CardHeader className="flex flex-row items-center justify-between gap-3 border-b px-6 py-5">
            <div className="min-w-0 space-y-1">
              <CardTitle>
                <h2
                  id="running-heading"
                  className="flex items-center gap-2 text-section-title"
                >
                  <Sparkles
                    aria-hidden="true"
                    className="size-4 shrink-0 text-oscar-foreground"
                  />
                  OSCAR is investigating
                </h2>
              </CardTitle>
              <CardDescription className="text-caption">
                From alert to evidence, automatically
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="h-6 shrink-0 rounded-sm border-info-border px-2 text-xs text-info-foreground"
            >
              {operations.running} running
            </Badge>
          </CardHeader>

          <CardContent className="flex-1 p-0">
            <Table className="w-full table-fixed">
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-11 px-5 text-left text-xs font-medium text-muted-foreground xl:px-6">
                    Investigation / current stage
                  </TableHead>
                  <TableHead className="h-11 w-20 px-3 text-right text-xs font-medium text-muted-foreground">
                    Elapsed
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runningCases.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="min-w-0 whitespace-normal px-6 py-5 align-middle">
                      <CaseQuickPreview item={runningCaseDetails(item)}>
                        <button
                          type="button"
                          className="line-clamp-2 w-full cursor-pointer text-left text-body font-medium hover:underline hover:underline-offset-2 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                          aria-label={`Preview ${item.id}: ${item.title}`}
                        >
                          {item.title}
                        </button>
                      </CaseQuickPreview>
                      <p className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground 2xl:text-sm">
                        <span
                          aria-hidden="true"
                          className="size-1.5 shrink-0 rounded-full bg-info"
                        />
                        <span className="min-w-0 truncate">{item.stage}</span>
                      </p>
                    </TableCell>
                    <TableCell className="px-3 py-5 text-center align-middle text-xs tabular-nums whitespace-nowrap text-muted-foreground">
                      <span aria-label={`Elapsed ${item.elapsed}`}>
                        {item.elapsed}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="mt-auto border-t px-6 py-4">
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href="/platform/cases?queue=Running" />}
              className="h-auto w-full justify-between px-0 text-xs"
            >
              View {operations.running} running cases
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <PlatformImpact />
    </div>
  );
}
export function Overview() {
  return <OverviewContent />;
}
