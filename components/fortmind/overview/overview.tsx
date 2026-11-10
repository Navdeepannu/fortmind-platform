"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { operations, impactReports } from "@/lib/overview-data";
import { PlatformImpact } from "./impact";
import { NeedsAttention } from "./attention";
import { ActiveInvestigations } from "./investigations";

const snapshotMetrics = [
  {
    label: "Needs you",
    value: operations.needsYou,
    detail: `${operations.urgent} urgent · current snapshot`,
    href: "/platform/cases?queue=Needs%20you",
  },
  {
    label: "Running",
    value: operations.running,
    detail: "OSCAR investigating · snapshot",
    href: "/platform/cases?queue=Running",
  },
  {
    label: "OSCAR closed",
    value: impactReports["7d"].oscar,
    detail: "Last 7-day sample",
    href: "#oscar-impact",
  },
  {
    label: "Failed",
    value: operations.failed,
    detail: "Recovery needed · snapshot",
    href: "/platform/cases?queue=Failed",
  },
] as const;

function OverviewContent() {
  return (
    <div
      data-ui="main"
      id="preview-main"
      className="min-w-0 py-5 md:py-8"
    >
      <div className="min-[1720px]:grid min-[1720px]:grid-cols-[minmax(0,1fr)_10.5rem] min-[1720px]:gap-7">
        <div className="min-w-0">
          <header data-ui="page-heading" className="min-w-0">
            <p className="mb-2 text-caption font-medium uppercase tracking-[0.09em] text-oscar-foreground">
              Security operations
            </p>
            <h1 className="text-page-title">Overview</h1>
            <p className="mt-1 max-w-2xl text-prose text-muted-foreground">
              What OSCAR handled, what it is investigating, and what requires your decision.
            </p>
            <p className="mt-2 text-caption text-muted-foreground">
              Demonstration snapshot · linked cases are representative samples
            </p>
          </header>

          <section
            data-ui="metrics"
            aria-label="Current case status"
            className="my-5 grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-card md:my-6 md:grid-cols-4"
          >
            <h2 className="sr-only text-section-title">Operations at a glance</h2>
            {snapshotMetrics.map((metric, index) => (
              <Link
                data-ui="metric"
                key={metric.label}
                href={metric.href}
                className={`group/metric relative flex min-w-0 flex-col gap-2 px-4 py-4 outline-none transition-colors hover:bg-surface-hover focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-5 ${index % 2 === 0 ? "max-md:border-r max-md:border-border" : ""} ${index < 2 ? "max-md:border-b max-md:border-border" : ""} ${index > 0 ? "md:border-l md:border-border" : ""}`}
              >
                <div data-ui="metric-label" className="flex items-center justify-between gap-2 text-caption font-medium text-muted-foreground">
                  <span>{metric.label}</span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover/metric:opacity-100 group-focus-visible/metric:opacity-100"
                  />
                </div>
                <strong data-ui="metric-body" className="text-metric font-semibold tabular-nums">
                  {metric.value}
                </strong>
                <span className="text-caption text-muted-foreground">{metric.detail}</span>
              </Link>
            ))}
          </section>

          <section id="overview-operations" aria-labelledby="operations-heading" className="scroll-mt-20">
            <div className="mb-3">
              <h2 id="operations-heading" className="text-section-title">Current operations</h2>
              <p className="mt-1 text-caption text-muted-foreground">
                Follow autonomous work and open the cases that need an analyst.
              </p>
            </div>
            <div
              data-ui="work-grid"
              className="grid min-w-0 grid-cols-1 items-stretch gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] xl:gap-5 2xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
            >
              <ActiveInvestigations />
              <NeedsAttention />
            </div>
          </section>

          <PlatformImpact />
        </div>

        <aside className="hidden min-[1720px]:block">
          <nav
            aria-label="On this page"
            className="sticky top-20 flex flex-col gap-2 border-l border-border pl-4"
          >
            <p className="mb-1 text-caption font-semibold text-muted-foreground">
              On this page
            </p>
            {[
              { href: "#running", label: "OSCAR running" },
              { href: "#attention", label: "Needs your review" },
              { href: "#oscar-impact", label: "OSCAR impact" },
              { href: "#case-mix", label: "Priority & verdict" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-sm py-1 text-caption text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}

export function Overview() {
  return <OverviewContent />;
}
