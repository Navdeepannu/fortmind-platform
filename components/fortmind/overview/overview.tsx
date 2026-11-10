"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { operations, impactReports } from "@/lib/overview-data";
import { PlatformImpact } from "./impact";
import { NeedsAttention } from "./attention";
import { ActiveInvestigations } from "./investigations";

const metrics = [
  {
    label: "Needs you",
    value: operations.needsYou,
    note: `${operations.urgent} urgent`,
    href: "/platform/cases?queue=Needs%20you",
  },
  {
    label: "Running",
    value: operations.running,
    note: "OSCAR",
    href: "/platform/cases?queue=Running",
  },
  {
    label: "OSCAR closed",
    value: impactReports["7d"].oscar,
    note: "Last 7 days",
    href: "#oscar-impact",
  },
  {
    label: "Failed",
    value: operations.failed,
    note: "Recovery",
    href: "/platform/cases?queue=Failed",
  },
] as const;

export function Overview() {
  return (
    <div data-ui="main" id="preview-main" className="min-w-0 py-5 md:py-8">
      <div className="min-[1720px]:grid min-[1720px]:grid-cols-[minmax(0,1fr)_10.5rem] min-[1720px]:gap-7">
        <div className="min-w-0">
          <header data-ui="page-heading" className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-page-title">Overview</h1>
              <p className="mt-1 text-caption text-muted-foreground">
                Autonomous operations · human decisions
              </p>
            </div>
            <span className="rounded-full border border-border px-2.5 py-1 text-caption text-muted-foreground">
              Demo snapshot
            </span>
          </header>

          <section
            data-ui="metrics"
            aria-label="Current case status"
            className="my-5 grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-card md:my-6 md:grid-cols-4"
          >
            <h2 className="sr-only">Operational snapshot</h2>
            {metrics.map((metric, index) => (
              <Link
                data-ui="metric"
                key={metric.label}
                href={metric.href}
                className={`group/metric relative flex min-w-0 flex-col gap-1.5 px-4 py-3.5 outline-none transition-colors hover:bg-surface-hover focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-5 ${index % 2 === 0 ? "max-md:border-r max-md:border-border" : ""} ${index < 2 ? "max-md:border-b max-md:border-border" : ""} ${index > 0 ? "md:border-l md:border-border" : ""}`}
              >
                <div data-ui="metric-label" className="flex items-center justify-between gap-2 text-caption text-muted-foreground">
                  <span>{metric.label}</span>
                  <ArrowUpRight aria-hidden="true" className="size-3.5 opacity-0 transition-opacity group-hover/metric:opacity-100 group-focus-visible/metric:opacity-100" />
                </div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <strong data-ui="metric-body" className="text-2xl font-semibold tabular-nums sm:text-3xl">
                    {metric.value}
                  </strong>
                  <span className="text-caption text-muted-foreground">{metric.note}</span>
                </div>
              </Link>
            ))}
          </section>

          <section id="overview-operations" aria-labelledby="operations-heading" className="scroll-mt-20">
            <h2 id="operations-heading" className="sr-only">Current operations</h2>
            <div
              data-ui="work-grid"
              className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] xl:gap-5 2xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
            >
              <ActiveInvestigations />
              <NeedsAttention />
            </div>
          </section>
          <PlatformImpact />
        </div>

        <aside className="hidden min-[1720px]:block">
          <nav aria-label="On this page" className="sticky top-20 flex flex-col gap-2 border-l border-border pl-4">
            <p className="mb-1 text-caption font-semibold text-muted-foreground">On this page</p>
            {[
              { href: "#running", label: "OSCAR activity" },
              { href: "#attention", label: "Needs you" },
              { href: "#oscar-impact", label: "Impact" },
              { href: "#case-mix", label: "Case mix" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="rounded-sm py-1 text-caption text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}
