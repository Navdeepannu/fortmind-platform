"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { operations } from "@/lib/overview-data";
import { PlatformImpact } from "./impact";
import { NeedsAttention } from "./attention";
import { ActiveInvestigations } from "./investigations";

const snapshotMetrics = [
  {
    label: "Needs you",
    value: operations.needsYou,
    detail: "Awaiting analyst decision",
    queue: "Needs you",
  },
  {
    label: "Running",
    value: operations.running,
    detail: "OSCAR investigating",
    queue: "Running",
  },
  {
    label: "Closed",
    value: operations.closed,
    detail: "Completed cases",
    queue: "Closed",
  },
  {
    label: "Failed",
    value: operations.failed,
    detail: "Recovery required",
    queue: "Failed",
  },
] as const;

function OverviewContent() {
  return (
    <div data-ui="main" id="preview-main" className="min-w-0 py-5 md:py-8">
      <div
        data-ui="page-heading"
        className="flex flex-wrap items-start justify-between gap-4 md:gap-6"
      >
        <div className="min-w-0 max-w-2xl">
          <p className="mb-2 text-caption font-medium uppercase tracking-[0.09em] text-oscar-foreground">
            SOC command center
          </p>
          <h1 className="text-page-title">Overview</h1>
          <p className="mt-1 text-prose text-muted-foreground">
            See what OSCAR is investigating, where human judgment is needed,
            and what has been resolved.
          </p>
          <p className="mt-2 text-caption text-muted-foreground">
            Demonstration data · current snapshot totals with sample case lists
          </p>
        </div>
        <div data-ui="page-actions" className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            role="link"
            render={<Link href="/platform/cases" />}
          >
            All cases <ArrowRight data-icon="inline-end" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            role="link"
            render={<Link href="/platform/integrations" />}
          >
            <Link2 data-icon="inline-start" />
            Connect tools
          </Button>
        </div>
      </div>

      {/* A compact operational strip keeps the primary workspace above the fold. */}
      <section
        data-ui="metrics"
        aria-label="Current case status"
        className="my-5 grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-card md:my-6 md:grid-cols-4"
      >
        <h2 className="sr-only text-section-title">Current operations</h2>
        {snapshotMetrics.map((metric, index) => (
          <Link
            data-ui="metric"
            key={metric.label}
            href={`/platform/cases?queue=${encodeURIComponent(metric.queue)}`}
            className={`group/metric relative flex min-w-0 flex-col gap-2 px-4 py-4 outline-none transition-colors hover:bg-surface-hover focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-5 md:py-5 ${index % 2 === 0 ? "max-md:border-r max-md:border-border" : ""} ${index < 2 ? "max-md:border-b max-md:border-border" : ""} ${index > 0 ? "md:border-l md:border-border" : ""}`}
          >
            <div data-ui="metric-label" className="flex items-center justify-between gap-2 text-caption font-medium text-muted-foreground">
              <span>{metric.label}</span>
              <ArrowUpRight
                aria-hidden="true"
                className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover/metric:opacity-100 group-focus-visible/metric:opacity-100"
              />
            </div>
            <div data-ui="metric-body" className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <strong className="text-metric font-semibold tabular-nums">
                {metric.value}
              </strong>
              {metric.label === "Needs you" && (
                <span
                  data-ui="urgent-count"
                  className="text-caption font-medium text-danger-foreground"
                >
                  {operations.urgent} urgent
                </span>
              )}
            </div>
            <p className="text-caption text-muted-foreground">{metric.detail}</p>
          </Link>
        ))}
      </section>

      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-section-title">Operations</h2>
          <p className="mt-1 text-caption text-muted-foreground">
            Agent activity alongside the decisions that need a person.
          </p>
        </div>
        <span className="text-caption text-muted-foreground">
          Read-only demonstration
        </span>
      </div>

      <div
        data-ui="work-grid"
        className="grid min-w-0 grid-cols-1 items-stretch gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] xl:gap-5 2xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]"
      >
        <ActiveInvestigations />
        <NeedsAttention />
      </div>

      <PlatformImpact />
    </div>
  );
}

export function Overview() {
  return <OverviewContent />;
}
