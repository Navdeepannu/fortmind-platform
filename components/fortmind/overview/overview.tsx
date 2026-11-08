"use client";

import Link from "next/link";
import { ArrowUpRight, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { operations } from "@/lib/overview-data";
import { PlatformImpact } from "./impact";
import { NeedsAttention } from "./attention";
import { ActiveInvestigations } from "./investigations";

function OverviewContent() {
  const metrics = [
    {
      label: "Needs you",
      value: operations.needsYou,
      detail: "Awaiting human decisions",
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
      detail: "Completed investigations",
      queue: "Closed",
    },
    {
      label: "Failed",
      value: operations.failed,
      detail: "Need recovery or retry",
      queue: "Failed",
    },
  ];
  return (
    <div
      data-ui="main"
      id="preview-main"
      className="min-w-0 py-5 md:py-8"
    >
      <div
        data-ui="page-heading"
        className="flex flex-wrap justify-between items-center gap-6 max-[1101px]:items-start max-md:items-start max-md:gap-3"
      >
        <div>
          <h1 className="text-page-title">Overview</h1>
          <p className="mt-1 text-prose text-muted-foreground">
            OSCAR’s investigations, human decisions, and operational impact.
          </p>
          <p className="mt-2 text-caption text-muted-foreground">
            Demonstration data · current snapshot totals with sample case lists
          </p>
        </div>
        <div
          data-ui="page-actions"
          className="flex shrink-0 items-center gap-2"
        >
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            role="link"
            render={<Link href="/platform/integrations" />}
            className="pt-0 pr-3 pb-0 pl-3 max-md:h-8 max-md:pt-0 max-md:pr-2.25 max-md:pb-0 max-md:pl-2.25"
          >
            <Link2 data-icon="inline-start" />
            Connect tools
          </Button>
        </div>
      </div>
      {/* Snapshot counts retain their existing sources and queue destinations. */}
      <section
        data-ui="metrics"
        className="grid grid-cols-2 gap-4 my-6 md:grid-cols-4 lg:gap-6"
        aria-label="Current case status"
      >
        <h2 className="sr-only text-section-title">Current operations</h2>
        {metrics.map((metric) => (
          <Link
            data-ui="metric"
            className="group/metric bg-card border border-border p-5 md:p-6 rounded-lg hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:transition-colors motion-safe:duration-150"
            key={metric.label}
            href={`/platform/cases?queue=${encodeURIComponent(metric.queue)}`}
          >
            <div
              data-ui="metric-label"
              className="flex items-center gap-2 text-label font-medium text-muted-foreground"
            >
              <span>{metric.label}</span>
              <ArrowUpRight
                data-ui="metric-arrow"
                className="ml-auto opacity-0 max-md:hidden group-hover/metric:translate-x-0 group-hover/metric:translate-y-0 group-hover/metric:opacity-100 translate-x-1 translate-y-1 size-4 text-muted-foreground  motion-safe:transition-all motion-safe:duration-200 group-focus-visible/metric:opacity-100"
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

      {/* Keep the existing two-panel operational workspace. */}
      <div
        data-ui="work-grid"
        className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]"
      >
        <NeedsAttention />
        <ActiveInvestigations />
      </div>

      <PlatformImpact />
    </div>
  );
}
export function Overview() {
  return <OverviewContent />;
}
