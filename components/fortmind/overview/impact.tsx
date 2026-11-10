"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Clock3, ScanLine } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriorityBadge, VerdictBadge } from "../semantic";

type TrendBucket = ReturnType<typeof impactTrend>[number];

function TrendTooltip({
  active,
  payload,
  kind,
}: {
  active?: boolean;
  payload?: readonly { payload?: TrendBucket }[];
  kind: "closures" | "hours";
}) {
  const bucket = payload?.[0]?.payload;
  if (!active || !bucket) return null;
  return (
    <div className="min-w-48 rounded-md border border-border bg-popover p-3 text-caption text-popover-foreground">
      <p className="mb-2 font-semibold">{bucket.label}</p>
      <dl className="space-y-1.5">
        {(kind === "closures"
          ? [
              ["OSCAR closed", bucket.oscar],
              ["Analysts closed", bucket.analyst],
              ["Total resolved", bucket.closed],
              ["Failed runs (separate)", bucket.failed],
            ]
          : [
              ["Estimated hours added", `${bucket.hoursAdded.toFixed(2)}h`],
              ["Estimated hours cumulative", `${bucket.cumulativeHours.toFixed(2)}h`],
              ["OSCAR closures in interval", bucket.oscar],
            ]
        ).map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-5">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function PeriodSelector({
  period,
  onChange,
}: {
  period: ImpactPeriod;
  onChange: (next: ImpactPeriod) => void;
}) {
  return (
    <Tabs value={period} onValueChange={(next) => onChange(next as ImpactPeriod)}>
      <TabsList aria-label="Impact reporting period">
        {(["7d", "30d", "90d"] as const).map((key) => (
          <TabsTrigger key={key} value={key} className="px-2.5 text-caption sm:px-3">
            {impactReports[key].label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

function Metric({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 px-4 py-4 sm:px-5">
      <dt className="flex items-center gap-2 text-caption text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="text-2xl font-semibold tracking-tight tabular-nums">{value}</dd>
      <p className="text-caption text-muted-foreground">{detail}</p>
    </div>
  );
}

function ImpactTrends() {
  const [period, setPeriod] = useState<ImpactPeriod>("7d");
  const report = impactReports[period];
  const assumptions = useBrowserRecord(
    "fortmind.prototype.settings.spend.v1",
    settingsDefaults.spend,
    settingsValidators.spend,
  );
  const analystMinutes = assumptions.value.analystMinutes;
  const summary = impactSummary(report, analystMinutes);
  const buckets = impactTrend(report, analystMinutes);
  const exampleSeries = period !== "7d";

  return (
    <Card
      data-ui="impact-trends"
      className="min-w-0 gap-0 overflow-hidden rounded-lg border border-border bg-card py-0 shadow-none"
    >
      <CardHeader className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-5 sm:px-6">
        <div>
          <h3 className="text-panel-title">Autonomous investigation impact</h3>
          <p className="mt-1 text-caption text-muted-foreground">
            {report.dates} · {exampleSeries ? "Generated demonstration series" : "Seven-day demonstration sample"}
          </p>
        </div>
        <PeriodSelector period={period} onChange={setPeriod} />
      </CardHeader>

      <dl data-ui="impact-metrics" className="grid grid-cols-2 divide-x-0 divide-y-0 border-b border-border sm:grid-cols-3 sm:divide-x sm:divide-border">
        <div className="border-b border-border sm:border-b-0">
          <Metric
            label="OSCAR closures"
            value={report.oscar}
            detail={`of ${report.closed} resolved cases`}
            icon={<ScanLine aria-hidden="true" className="size-3.5 text-oscar-foreground" />}
          />
        </div>
        <div className="border-b border-l border-border sm:border-b-0">
          <Metric
            label="Estimated analyst time saved"
            value={`${summary.estimatedHoursSaved}h`}
            detail={`${analystMinutes} minutes assumed per closure`}
            icon={<Clock3 aria-hidden="true" className="size-3.5 text-oscar-foreground" />}
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Metric
            label="Autonomous share"
            value={summary.share === null ? "—" : `${summary.share}%`}
            detail="of all resolved cases"
          />
        </div>
      </dl>

      <CardContent className="min-w-0 p-0">
        <div className="grid min-w-0 grid-cols-1 lg:grid-cols-2">
          <section aria-labelledby="closures-chart-heading" className="min-w-0 px-4 py-5 sm:px-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h4 id="closures-chart-heading" className="text-label font-semibold">
                  Closed autonomously over time
                </h4>
                <p className="mt-1 text-caption text-muted-foreground">
                  OSCAR closures per {period === "7d" ? "day" : "up-to-7-day interval"}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-caption text-muted-foreground">
                <span aria-hidden="true" className="size-2 rounded-sm bg-oscar" />
                OSCAR
              </span>
            </div>
            <ChartContainer
              className="h-58 w-full aspect-auto sm:h-64"
              config={{ oscar: { label: "OSCAR closures", color: "var(--oscar)" } }}
              aria-label={`OSCAR closed ${report.oscar} cases during ${report.dates}; daily or grouped counts shown`}
            >
              <BarChart
                accessibilityLayer
                data={buckets}
                margin={{ top: 8, right: 4, bottom: 0, left: -8 }}
              >
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
                <XAxis
                  dataKey="axisLabel"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={9}
                  minTickGap={14}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  width={32}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={{ fill: "var(--muted)" }}
                  content={<TrendTooltip kind="closures" />}
                />
                <Bar
                  dataKey="oscar"
                  fill="var(--oscar)"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={32}
                  isAnimationActive={false}
                />
              </BarChart>
            </ChartContainer>
          </section>

          <section
            aria-labelledby="savings-chart-heading"
            className="min-w-0 border-t border-border px-4 py-5 sm:px-6 lg:border-t-0 lg:border-l"
          >
            <div className="mb-4">
              <h4 id="savings-chart-heading" className="text-label font-semibold">
                Estimated analyst time returned
              </h4>
              <p className="mt-1 text-caption text-muted-foreground">
                Cumulative hours attributed to OSCAR closures
              </p>
            </div>
            <ChartContainer
              className="h-58 w-full aspect-auto sm:h-64"
              config={{ cumulativeHours: { label: "Estimated hours", color: "var(--oscar)" } }}
              aria-label={`Estimated ${summary.estimatedHoursSaved} cumulative analyst hours saved during ${report.dates}`}
            >
              <AreaChart
                accessibilityLayer
                data={buckets}
                margin={{ top: 8, right: 6, bottom: 0, left: -8 }}
              >
                <defs>
                  <linearGradient id="overview-impact-hours-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--oscar)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--oscar)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
                <XAxis
                  dataKey="axisLabel"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={9}
                  minTickGap={14}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  width={32}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) => `${value}h`}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={{ stroke: "var(--border-strong)" }}
                  content={<TrendTooltip kind="hours" />}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeHours"
                  stroke="var(--oscar)"
                  strokeWidth={2}
                  fill="url(#overview-impact-hours-fill)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ChartContainer>
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-t border-border px-5 py-4 sm:px-6">
          <p className="max-w-3xl text-caption text-muted-foreground">
            {report.oscar} OSCAR + {report.analyst} analyst closures = {report.closed} resolved.
            {" "}{report.failed} failed runs are separate; retries are not recorded.
            {" "}Time savings are estimates, not measured effort.
            {exampleSeries && " The 30/90-day trends are generated examples, not observed history."}
          </p>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            role="link"
            render={<Link href={impactReportHref(period)} />}
            className="shrink-0 px-0"
          >
            View report <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DistributionRow({
  label,
  value,
  total,
}: {
  label: ReactNode;
  value: number;
  total: number;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <span className="min-w-0 text-label">{label}</span>
        <span className="shrink-0 text-caption tabular-nums">
          <strong className="font-semibold text-foreground">{value}</strong>
          <span className="ml-2 text-muted-foreground">{percentage}%</span>
        </span>
      </div>
      <div
        role="meter"
        aria-label={`${value} of ${total} cases (${percentage}%)`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={value}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          aria-hidden="true"
          className="h-full rounded-full bg-foreground/45"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function CaseMix() {
  const openTotal = openPriorities.reduce((sum, item) => sum + item.value, 0);
  const verdicts = impactReports["7d"].verdicts ?? [];
  const verdictTotal = verdicts.reduce((sum, item) => sum + item.value, 0);
  return (
    <section id="case-mix" aria-labelledby="case-mix-heading" className="scroll-mt-20">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 id="case-mix-heading" className="text-panel-title">
            Case mix
          </h3>
          <p className="mt-1 text-caption text-muted-foreground">
            Two distinct populations: open workload and closed outcomes
          </p>
        </div>
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="gap-0 overflow-hidden rounded-lg border border-border bg-card py-0 shadow-none">
          <CardHeader className="border-b border-border px-5 py-5">
            <h4 className="text-panel-title">Priority distribution</h4>
            <p className="mt-1 text-caption text-muted-foreground">
              {openTotal} cases · Needs you + Running snapshot
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 px-5 py-5">
            {openPriorities.map((item) => (
              <DistributionRow
                key={item.name}
                label={<PriorityBadge value={item.name} />}
                value={item.value}
                total={openTotal}
              />
            ))}
            <p className="mt-auto border-t border-border pt-3 text-caption text-muted-foreground">
              Failed and queued cases are excluded.
            </p>
          </CardContent>
        </Card>
        <Card className="gap-0 overflow-hidden rounded-lg border border-border bg-card py-0 shadow-none">
          <CardHeader className="border-b border-border px-5 py-5">
            <h4 className="text-panel-title">Verdict distribution</h4>
            <p className="mt-1 text-caption text-muted-foreground">
              {verdictTotal} closed cases · {impactReports["7d"].dates}
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 px-5 py-5">
            {verdicts.map((item) => (
              <DistributionRow
                key={item.name}
                label={<VerdictBadge value={item.name} />}
                value={item.value}
                total={verdictTotal}
              />
            ))}
            <p className="mt-auto border-t border-border pt-3 text-caption text-muted-foreground">
              Only the seven-day sample has known verdict counts.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export function PlatformImpact() {
  return (
    <section
      id="oscar-impact"
      aria-labelledby="impact-heading"
      className="mt-9 flex scroll-mt-20 flex-col gap-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="impact-heading" className="text-section-title">OSCAR impact</h2>
          <p className="mt-1 text-caption text-muted-foreground">
            Resolutions delivered, estimated effort returned, and workload composition
          </p>
        </div>
        <Badge variant="outline" className="text-caption font-normal text-muted-foreground">
          Illustrative data
        </Badge>
      </div>
      <ImpactTrends />
      <CaseMix />
    </section>
  );
}
