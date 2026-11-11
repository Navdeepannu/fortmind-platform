"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { operations } from "@/lib/overview-data";
import { CaseDistribution, PlatformImpact } from "./impact";
import { NeedsAttention } from "./attention";
import { ActiveInvestigations } from "./investigations";

const snapshotMetrics = [
  { label: "Needs you", value: operations.needsYou, detail: "Awaiting analyst decision", queue: "Needs you" },
  { label: "Running", value: operations.running, detail: "OSCAR investigating", queue: "Running" },
  { label: "Closed", value: operations.closed, detail: "Completed cases", queue: "Closed" },
  { label: "Failed", value: operations.failed, detail: "Recovery required", queue: "Failed" },
] as const;

export function Overview() {
  const [section, setSection] = useState<"operations" | "impact">("operations");
  return (
    <main data-ui="main" id="preview-main" className="min-w-0 py-5 md:py-8">
      <header data-ui="page-heading" className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-page-title">Home</h1>
          <p className="mt-1 text-caption text-muted-foreground">OSCAR operations and analyst handoffs · Demonstration data</p>
        </div>
        <Button variant="outline" size="sm" nativeButton={false} role="link" render={<Link href="/platform/integrations" />}>
          <Link2 data-icon="inline-start" />
          Connect tools
        </Button>
      </header>

      <Tabs data-ui="home-tabs" value={section} onValueChange={(value) => setSection(value as "operations" | "impact")} className="mt-5 min-w-0 gap-0">
        <div className="flex min-w-0 items-center justify-between gap-3 border-b border-border">
          <TabsList variant="line" aria-label="Home sections" className="h-11 gap-4 border-0 p-0">
            <TabsTrigger value="operations" className="h-11 rounded-none px-2 group-data-horizontal/tabs:after:bottom-0">Operations</TabsTrigger>
            <TabsTrigger value="impact" className="h-11 rounded-none px-2 group-data-horizontal/tabs:after:bottom-0">Impact</TabsTrigger>
          </TabsList>
          <span className="text-caption text-muted-foreground">Current snapshot · sample activity</span>
        </div>

        <TabsContent value="operations" keepMounted hidden={section !== "operations"} className="min-w-0 pt-5">
          <section data-ui="metrics" aria-label="Current operations" className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-card md:grid-cols-4">
            {snapshotMetrics.map((metric, index) => (
              <Link
                key={metric.label}
                data-ui="metric"
                href={`/platform/cases?queue=${encodeURIComponent(metric.queue)}`}
                className={`group/metric min-w-0 px-4 py-4 outline-none transition-colors hover:bg-surface-hover focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-5 ${index % 2 === 0 ? "max-md:border-r max-md:border-border" : ""} ${index < 2 ? "max-md:border-b max-md:border-border" : ""} ${index > 0 ? "md:border-l md:border-border" : ""}`}
              >
                <div className="flex items-center justify-between gap-2 text-caption text-muted-foreground">
                  <span>{metric.label}</span>
                  <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover/metric:opacity-100 group-focus-visible/metric:opacity-100" aria-hidden="true" />
                </div>
                <div className="mt-2 flex flex-wrap items-baseline gap-2">
                  <strong className="text-metric font-semibold tabular-nums">{metric.value}</strong>
                  {metric.label === "Needs you" && <span className="text-caption text-warning-foreground">{operations.urgent} urgent</span>}
                </div>
                <p className="mt-1 text-caption text-muted-foreground">{metric.detail}</p>
              </Link>
            ))}
          </section>

          <div data-ui="work-grid" className="mt-4 grid min-w-0 grid-cols-1 items-stretch gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <NeedsAttention />
            <ActiveInvestigations />
          </div>
          <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-2">
            <CaseDistribution />
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" size="sm" nativeButton={false} role="link" render={<Link href="/platform/cases" />}>
              All cases <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="impact" keepMounted hidden={section !== "impact"} className="min-w-0">
          <PlatformImpact />
        </TabsContent>
      </Tabs>
    </main>
  );
}
