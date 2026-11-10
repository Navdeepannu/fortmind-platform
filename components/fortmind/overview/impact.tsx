"use client";

import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useBrowserRecord } from "@/hooks/use-browser-record";
import { settingsDefaults, settingsValidators } from "@/lib/settings-data";
import { impactReportHref } from "@/lib/platform-routes";
import {
  impactReports,
  impactSummary,
  impactTrend,
  openPriorities,
  type ImpactPeriod,
} from "@/lib/overview-data";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriorityBadge, VerdictBadge } from "../semantic";

type TrendBucket = ReturnType<typeof impactTrend>[number];
type ChartMode = "closures" | "saved";

function TrendTooltip({
  active,
  payload,
  mode,
}: {
  active?: boolean;
  payload?: readonly { payload?: TrendBucket }[];
  mode: ChartMode;
}) {
  const bucket = payload?.[0]?.payload;
  if (!active || !bucket) return null;
  const details: [string, string | number][] = mode === "closures"
    ? [
        ["Closed by OSCAR", bucket.oscar],
        ["Closed by analysts", bucket.analyst],
        ["Total closed", bucket.closed],
        ["Failed (separate)", bucket.failed],
      ]
    : [
        ["Added this interval", `${bucket.hoursAdded.toFixed(2)} h`],
        ["Estimated hours accumulated", `${bucket.cumulativeHours.toFixed(2)} h`],
        ["OSCAR closures", bucket.oscar],
      ];
  return (
    <div className="min-w-44 rounded-md border border-border bg-popover p-3 text-caption text-popover-foreground shadow-sm">
      <p className="mb-2 font-semibold">{bucket.label}</p>
      <dl className="space-y-1.5">
        {details.map(([label, value]) => (
          <div className="flex items-center justify-between gap-5" key={label}>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function DataBar({
  label,
  value,
  total,
}: {
  label: ReactNode;
  value: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round(value / total * 100) : 0;
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0 text-label">{label}</div>
        <div className="shrink-0 text-caption tabular-nums">
          <strong className="font-semibold text-foreground">{value}</strong>
          <span className="ml-2 text-muted-foreground">{pct}%</span>
        </div>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div className="h-full rounded-full bg-foreground/40" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CaseMix() {
  const openTotal = openPriorities.reduce((sum, x) => sum + x.value, 0);
  const verdicts = impactReports["7d"].verdicts ?? [];
  const verdictTotal = verdicts.reduce((sum, x) => sum + x.value, 0);
  return (
    <div id="case-mix" className="grid min-w-0 scroll-mt-20 grid-cols-1 gap-4 md:grid-cols-2">
      <section aria-label="Priority distribution" className="min-w-0 rounded-lg border border-border bg-card p-5">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-panel-title">Priority mix</h3>
          <span className="text-caption text-muted-foreground">Open · {openTotal}</span>
        </div>
        <div className="space-y-4">
          {openPriorities.map((item) => (
            <DataBar
              key={item.name}
              label={<PriorityBadge value={item.name} />}
              value={item.value}
              total={openTotal}
            />
          ))}
        </div>
        <p className="mt-5 text-caption text-muted-foreground">
          Needs you + Running · current snapshot
        </p>
      </section>

      <section aria-label="Verdict distribution" className="min-w-0 rounded-lg border border-border bg-card p-5">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-panel-title">Verdict mix</h3>
          <span className="text-caption text-muted-foreground">Closed · {verdictTotal}</span>
        </div>
        <div className="space-y-4">
          {verdicts.map((item) => (
            <DataBar
              key={item.name}
              label={<VerdictBadge value={item.name} />}
              value={item.value}
              total={verdictTotal}
            />
          ))}
        </div>
        <p className="mt-5 text-caption text-muted-foreground">
          Fixed seven-day sample · Oct 28–Nov 3
        </p>
      </section>
    </div>
  );
}

export function PlatformImpact() {
  const [period, setPeriod] = useState<ImpactPeriod>("7d");
  const [mode, setMode] = useState<ChartMode>("closures");
  const gradientId = useId().replace(/:/g, "");
  const settings = useBrowserRecord(
    "fortmind.prototype.settings.spend.v1",
    settingsDefaults.spend,
    settingsValidators.spend,
  );
  const analystMinutes = settings.value.analystMinutes;
  const report = impactReports[period];
  const summary = impactSummary(report, analystMinutes);
  const buckets = impactTrend(report, analystMinutes);
  return (
    <section id="oscar-impact" aria-labelledby="impact-heading" className="mt-9 flex scroll-mt-20 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="impact-heading" className="text-section-title">OSCAR impact</h2>
          <p className="mt-1 text-caption text-muted-foreground">
            Autonomous output and estimated analyst capacity
          </p>
        </div>
        <Badge variant="outline" className="text-caption font-normal text-muted-foreground">
          Demo data
        </Badge>
      </div>

      <Card data-ui="impact-trends" className="min-w-0 gap-0 overflow-hidden rounded-lg border border-border bg-card py-0 shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
          <p className="text-label font-medium text-muted-foreground">
            {report.dates}
          </p>
          <Tabs value={period} onValueChange={(value) => setPeriod(value as ImpactPeriod)}>
            <TabsList aria-label="Impact reporting period">
              {(["7d", "30d", "90d"] as const).map((key) => (
                <TabsTrigger key={key} value={key} className="px-2.5 text-caption sm:px-3">
                  {impactReports[key].label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <dl data-ui="impact-metrics" className="grid grid-cols-3 divide-x divide-border border-b border-border">
          {[
            { label: "Closed by OSCAR", value: String(report.oscar), description: "investigations" },
            { label: "Time returned", value: `${summary.estimatedHoursSaved}h`, description: "estimated" },
            { label: "Autonomous share", value: summary.share === null ? "—" : `${summary.share}%`, description: "of closures" },
          ].map((metric) => (
            <div key={metric.label} className="min-w-0 px-3 py-4 sm:px-6 sm:py-5">
              <dt className="text-caption text-muted-foreground">{metric.label}</dt>
              <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
                {metric.value}
              </dd>
              <p className="mt-0.5 text-caption text-muted-foreground">{metric.description}</p>
            </div>
          ))}
        </dl>

        <div className="min-w-0 px-4 py-5 sm:px-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-panel-title">
                {mode === "closures" ? "Investigation throughput" : "Capacity returned"}
              </h3>
              <p className="mt-1 text-caption text-muted-foreground">
                {mode === "closures" ? "Daily closure volume" : "Cumulative estimated analyst hours"}
              </p>
            </div>
            <Tabs value={mode} onValueChange={(value) => setMode(value as ChartMode)}>
              <TabsList aria-label="Impact visualization">
                <TabsTrigger value="closures" className="text-caption">Closures</TabsTrigger>
                <TabsTrigger value="saved" className="text-caption">Time saved</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {mode === "closures" ? (
            <ChartContainer
              className="h-60 w-full aspect-auto md:h-72"
              config={{
                oscar: { label: "OSCAR", color: "var(--oscar)" },
                analyst: { label: "Analysts", color: "var(--neutral)" },
              }}
              aria-label={`${report.oscar} cases closed by OSCAR and ${report.analyst} by analysts during ${report.dates}`}
            >
              <BarChart accessibilityLayer data={buckets} margin={{ top: 10, right: 5, bottom: 0, left: -8 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
                <XAxis
                  dataKey="axisLabel" axisLine={false} tickLine={false} tickMargin={9}
                  minTickGap={18} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false} width={35} axisLine={false} tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={{ fill: "var(--muted)" }}
                  content={<TrendTooltip mode="closures" />}
                />
                <Bar dataKey="oscar" stackId="closed" fill="var(--oscar)" maxBarSize={48} isAnimationActive={false} />
                <Bar dataKey="analyst" stackId="closed" fill="var(--neutral)" maxBarSize={48} radius={[3,3,0,0]} isAnimationActive={false} />
              </BarChart>
            </ChartContainer>
          ) : (
            <ChartContainer
              className="h-60 w-full aspect-auto md:h-72"
              config={{ cumulativeHours: { label: "Estimated hours", color: "var(--oscar)" } }}
              aria-label={`Cumulative estimated analyst hours returned: ${summary.estimatedHoursSaved} during ${report.dates}`}
            >
              <AreaChart accessibilityLayer data={buckets} margin={{ top: 10, right: 5, bottom: 0, left: -8 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--oscar)" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="var(--oscar)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
                <XAxis
                  dataKey="axisLabel" axisLine={false} tickLine={false} tickMargin={9}
                  minTickGap={18} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  width={35} axisLine={false} tickLine={false} tickFormatter={(value: number) => `${value}h`}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={{ stroke: "var(--border-strong)" }}
                  content={<TrendTooltip mode="saved" />}
                />
                <Area
                  type="monotone" dataKey="cumulativeHours" stroke="var(--oscar)"
                  strokeWidth={2} fill={`url(#${gradientId})`} isAnimationActive={false}
                />
              </AreaChart>
            </ChartContainer>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-caption text-muted-foreground">
            {mode === "closures" ? (
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="size-2 rounded-sm bg-oscar" /> OSCAR {report.oscar}
                </span>
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="size-2 rounded-sm bg-neutral" /> Analysts {report.analyst}
                </span>
              </div>
            ) : (
              <span>{report.oscar} OSCAR closures × {analystMinutes} assumed minutes</span>
            )}
            <Link
              href={impactReportHref(period)}
              className="inline-flex items-center gap-1 text-label font-medium text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Full report <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
          <p className="mt-2 text-caption text-muted-foreground">
            {period !== "7d" && "30/90-day history is generated demonstration data. "}
            Time saved is modeled, not measured. Failed runs ({report.failed}) are excluded from closures.
          </p>
        </div>
      </Card>

      <CaseMix />
    </section>
  );
}
