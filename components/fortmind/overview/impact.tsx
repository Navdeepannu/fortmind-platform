"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleX,
  Clock3,
  Sparkles,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import { useBrowserRecord } from "@/hooks/use-browser-record";
import { settingsDefaults, settingsValidators } from "@/lib/settings-data";
import { impactReportHref } from "@/lib/platform-routes";
import {
  impactReports,
  impactSummary,
  openPriorities,
  type ImpactPeriod,
  type OutcomeDay,
} from "@/lib/overview-data";
import { priorityStates, verdictStates } from "@/lib/semantic-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SemanticBadge } from "../semantic";

// The chart and KPI group deliberately use independent reporting periods.
// Changing one must not silently change the other.
type ChartMode = "closed" | "oscar" | "analyst" | "failed";

type OutcomeBucket = {
  label: string;
  axisLabel: string;
  oscar: number;
  analyst: number;
  failed: number;
  closed: number;
};

function outcomeBuckets(daily: OutcomeDay[]): OutcomeBucket[] {
  // 30/90-day fixtures group into consecutive 7-day intervals, not calendar weeks.
  const groupSize = daily.length <= 7 ? 1 : 7;
  return Array.from(
    { length: Math.ceil(daily.length / groupSize) },
    (_, index) => {
      const days = daily.slice(index * groupSize, (index + 1) * groupSize);
      const oscar = days.reduce((total, day) => total + day.oscar, 0);
      const analyst = days.reduce((total, day) => total + day.analyst, 0);
      return {
        label:
          days.length === 1
            ? days[0].day
            : `${days[0].day} – ${days[days.length - 1].day}`,
        axisLabel: days[0].day,
        oscar,
        analyst,
        failed: days.reduce((total, day) => total + day.failed, 0),
        closed: oscar + analyst,
      };
    },
  );
}

const chartModes: { value: ChartMode; label: string }[] = [
  { value: "closed", label: "Total closed" },
  { value: "oscar", label: "OSCAR" },
  { value: "analyst", label: "Analysts" },
  { value: "failed", label: "Failed runs" },
];

function OutcomeTooltip({
  active,
  payload,
  mode,
}: {
  active?: boolean;
  payload?: readonly { payload?: OutcomeBucket }[];
  mode: ChartMode;
}) {
  const bucket = payload?.[0]?.payload;
  if (!active || !bucket) return null;

  const entries =
    mode === "closed"
      ? [
          { label: "Closed by OSCAR", value: bucket.oscar },
          { label: "Closed by analysts", value: bucket.analyst },
          { label: "Total closed", value: bucket.closed },
        ]
      : [
          {
            label:
              chartModes.find((item) => item.value === mode)?.label ?? mode,
            value: bucket[mode],
          },
        ];

  return (
    <div className="min-w-44 rounded-lg  border-foreground/10 border bg-popover p-3 text-xs text-popover-foreground shadow-sm">
      <p className="mb-2 font-semibold">{bucket.label}</p>
      <dl className="space-y-1.5">
        {entries.map((entry) => (
          <div className="flex justify-between gap-6" key={entry.label}>
            <dt>{entry.label}</dt>
            <dd className="font-semibold tabular-nums">{entry.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function PeriodSelector({
  period,
  onChange,
  label,
}: {
  period: ImpactPeriod;
  onChange: (next: ImpactPeriod) => void;
  label: string;
}) {
  return (
    <Tabs
      value={period}
      onValueChange={(next) => onChange(next as ImpactPeriod)}
    >
      <TabsList aria-label={label}>
        {(["7d", "30d", "90d"] as const).map((key) => (
          <TabsTrigger key={key} value={key} className="px-2.5 text-xs sm:px-3">
            {impactReports[key].label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

// CHUNK 1 — A chart-focused card, with its own local metric and period controls.
function ResolutionChart() {
  const [period, setPeriod] = useState<ImpactPeriod>("7d");
  const [mode, setMode] = useState<ChartMode>("closed");
  const report = impactReports[period];
  const buckets = outcomeBuckets(report.daily);
  const selectedTotal = mode === "closed" ? report.closed : report[mode];
  const grouping = report.daily.length > 7 ? "7-day interval" : "day";

  return (
    <Card className="min-w-0 gap-0 overflow-hidden rounded-xl ring-1 ring-foreground/10 bg-card py-0 shadow-none">
      <CardHeader className="flex flex-col gap-3 border-b border-foreground/10 px-5 py-4 xl:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3 w-full">
          <div>
            <h3 className="text-base font-semibold">Investigation outcomes</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {report.dates} · grouped by {grouping}
            </p>
          </div>
          <PeriodSelector
            period={period}
            onChange={setPeriod}
            label="Chart reporting period"
          />
        </div>
      </CardHeader>
      <CardContent className="min-w-0 space-y-5 px-5 py-5 xl:px-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <Tabs
            value={mode}
            onValueChange={(next) => setMode(next as ChartMode)}
          >
            <TabsList
              aria-label="Outcome shown in chart"
              className="h-auto flex-wrap justify-start"
            >
              {chartModes.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="text-xs sm:text-sm"
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex items-baseline gap-2">
            <strong className="text-2xl font-semibold tabular-nums">
              {selectedTotal}
            </strong>
            <span className="text-xs text-muted-foreground">
              {mode === "failed" ? "failed runs" : "cases"}
            </span>
          </div>
        </div>

        {buckets.length > 0 ? (
          <ChartContainer
            className="h-64 w-full aspect-auto lg:h-72 2xl:h-80"
            config={{
              oscar: { label: "Closed by OSCAR", color: "var(--oscar)" },
              analyst: { label: "Closed by analysts", color: "var(--neutral)" },
              failed: { label: "Failed runs", color: "var(--danger)" },
            }}
            aria-label={`${selectedTotal} ${mode === "failed" ? "failed investigation runs" : "cases closed"} during ${report.dates}`}
          >
            <BarChart
              accessibilityLayer
              data={buckets}
              margin={{ top: 20, right: 6, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeDasharray="3 4"
              />
              <XAxis
                dataKey="axisLabel"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                width={32}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <ChartTooltip
                cursor={{ fill: "var(--muted)" }}
                content={<OutcomeTooltip mode={mode} />}
              />
              {mode === "closed" ? (
                <>
                  <Bar
                    dataKey="oscar"
                    stackId="closed"
                    fill="var(--oscar)"
                    maxBarSize={46}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="analyst"
                    stackId="closed"
                    fill="var(--neutral)"
                    maxBarSize={46}
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  >
                    {period === "7d" && (
                      <LabelList
                        dataKey="closed"
                        position="top"
                        offset={5}
                        fontSize={11}
                        fill="var(--muted-foreground)"
                      />
                    )}
                  </Bar>
                </>
              ) : (
                <Bar
                  dataKey={mode}
                  fill={
                    mode === "oscar"
                      ? "var(--oscar)"
                      : mode === "analyst"
                        ? "var(--neutral)"
                        : "var(--danger)"
                  }
                  maxBarSize={46}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
              )}
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="rounded-lg border border-dashed border-foreground/10 p-8 text-sm text-muted-foreground">
            No investigation outcomes for this period.
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-foreground/10 pt-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground sm:text-sm">
            {mode === "closed" ? (
              <>
                <span className="inline-flex items-center gap-2">
                  <span className="size-2.5 rounded-sm bg-oscar" />
                  OSCAR{" "}
                  <strong className="font-medium text-foreground">
                    {report.oscar}
                  </strong>
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="size-2.5 rounded-sm bg-neutral" />
                  Analysts{" "}
                  <strong className="font-medium text-foreground">
                    {report.analyst}
                  </strong>
                </span>
              </>
            ) : (
              <span>
                {chartModes.find((item) => item.value === mode)?.label}:{" "}
                {selectedTotal}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href={impactReportHref(period)} />}
          >
            View report <ArrowRight aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact Vercel-style progress rows: neutral backgrounds communicate magnitude.
// Security meaning stays in the existing semantic icon, not in a second colored bar.
function DataBarRow({
  label,
  count,
  percentage,
  description,
}: {
  label: ReactNode;
  count: string | number;
  percentage?: number;
  description?: string;
}) {
  const bounded =
    percentage === undefined ? null : Math.min(100, Math.max(0, percentage));

  return (
    <div className="space-y-1">
      <div className="relative isolate flex min-h-11 items-center overflow-hidden rounded-md bg-muted/60 px-3 py-2">
        {bounded !== null && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 -z-10 bg-foreground/[0.08] dark:bg-foreground/[0.12]"
            style={{ width: `${bounded}%` }}
          />
        )}
        <div className="relative flex w-full min-w-0 items-center justify-between gap-3">
          <div className="min-w-0 text-sm leading-5">{label}</div>
          <div className="flex shrink-0 items-baseline gap-2 tabular-nums">
            <span className="text-sm font-semibold text-foreground">
              {count}
            </span>
            {bounded !== null && (
              <span className="w-9 text-right text-xs text-muted-foreground">
                {Math.round(bounded)}%
              </span>
            )}
          </div>
        </div>
      </div>
      {description && (
        <p className="px-1 text-xs leading-4 text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

// CHUNK 2 — Performance in one compact card instead of four oversized KPI tiles.
function ImpactMetrics() {
  const [period, setPeriod] = useState<ImpactPeriod>("7d");
  const report = impactReports[period];
  const assumptions = useBrowserRecord(
    "fortmind.prototype.settings.spend.v1",
    settingsDefaults.spend,
    settingsValidators.spend,
  );
  const analystMinutes = assumptions.value.analystMinutes;
  const summary = impactSummary(report, analystMinutes);
  const oscarPct = report.closed ? (report.oscar / report.closed) * 100 : 0;
  const analystPct = report.closed ? (report.analyst / report.closed) * 100 : 0;
  const finishedRuns = report.closed + report.failed;
  const failurePct = finishedRuns ? (report.failed / finishedRuns) * 100 : 0;

  return (
    <Card className="min-w-0 gap-0 overflow-hidden rounded-xl ring-1 ring-foreground/10 bg-card py-0 shadow-none">
      <CardHeader className="flex flex-col gap-3 border-b border-foreground/10 px-4 py-4">
        <div className="flex items-start justify-between w-full">
          <div className="min-w-0">
            <h3 className="text-base font-semibold">Performance</h3>
            <p className="mt-1 text-xs text-muted-foreground">{report.dates}</p>
          </div>

          <PeriodSelector
            period={period}
            onChange={setPeriod}
            label="Performance reporting period"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-2.5 px-3 py-3.5 sm:px-4">
        <DataBarRow
          label={
            <span className="inline-flex items-center gap-2">
              <Sparkles
                aria-hidden="true"
                className="size-4 shrink-0 text-oscar-foreground"
              />
              Closed by OSCAR
            </span>
          }
          count={report.oscar}
          percentage={oscarPct}
        />
        <DataBarRow
          label={
            <span className="inline-flex items-center gap-2">
              <CheckCircle2
                aria-hidden="true"
                className="size-4 shrink-0 text-success-foreground"
              />
              Closed by analysts
            </span>
          }
          count={report.analyst}
          percentage={analystPct}
        />
        <DataBarRow
          label={
            <span className="inline-flex items-center gap-2">
              <Clock3
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground"
              />
              Estimated time saved
            </span>
          }
          count={`${summary.estimatedHoursSaved}h`}
        />
        <DataBarRow
          label={
            <span className="inline-flex items-center gap-2">
              <CircleX
                aria-hidden="true"
                className="size-4 shrink-0 text-danger-foreground"
              />
              Failed runs
            </span>
          }
          count={report.failed}
          percentage={failurePct}
        />
        {/* <p className="border-t border-foreground/10 pt-3 text-xs leading-5 text-muted-foreground">
          Closures: {report.closed}. Failed runs: {report.failed} of{" "}
          {finishedRuns} finished runs. Time saved assumes {analystMinutes}{" "}
          analyst minutes per OSCAR closure, not measured time.
        </p> */}
      </CardContent>
    </Card>
  );
}

// CHUNK 3 — Distribution cards use the same compact row treatment.
// Colors are reserved for meaningful icons; the proportional bars stay neutral.
function CaseDistribution() {
  const openTotal = openPriorities.reduce((sum, item) => sum + item.value, 0);
  const verdicts = impactReports["7d"].verdicts ?? [];
  const verdictTotal = verdicts.reduce((sum, item) => sum + item.value, 0);

  return (
    <>
      <Card className="min-w-0 gap-0 overflow-hidden rounded-xl ring-1 ring-foreground/10 bg-card py-0 shadow-none">
        <CardHeader className="border-b border-foreground/10 px-4 py-4">
          <h3 className="text-base font-semibold">Priority mix</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {openTotal} open cases · current snapshot
          </p>
        </CardHeader>
        <CardContent className="flex-1 space-y-2.5 px-3 py-3.5 sm:px-4">
          {openPriorities.map((item) => {
            const share = openTotal ? (item.value / openTotal) * 100 : 0;
            return (
              <DataBarRow
                key={item.name}
                label={
                  <SemanticBadge
                    definition={priorityStates[item.name]}
                    treatment="inline"
                  />
                }
                count={item.value}
                percentage={share}
              />
            );
          })}
          {/* <p className="border-t border-foreground/10 pt-3 text-xs leading-5 text-muted-foreground">
            Current open-case snapshot. Not affected by the chart or performance
            period.
          </p> */}
        </CardContent>
      </Card>

      <Card className="min-w-0 gap-0 overflow-hidden rounded-xl ring-1 ring-foreground/10 bg-card py-0 shadow-none">
        <CardHeader className="border-b border-foreground/10 px-4 py-4">
          <h3 className="text-base font-semibold">Verdict mix</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {verdictTotal} closed cases · 7-day sample
          </p>
        </CardHeader>
        <CardContent className="flex-1 space-y-2.5 px-3 py-3.5 sm:px-4">
          {verdicts.map((item) => {
            const share = verdictTotal ? (item.value / verdictTotal) * 100 : 0;
            return (
              <DataBarRow
                key={item.name}
                label={
                  <SemanticBadge
                    definition={verdictStates[item.name]}
                    treatment="inline"
                  />
                }
                count={item.value}
                percentage={share}
              />
            );
          })}
          {/* <p className="border-t border-foreground/10 pt-3 text-xs leading-5 text-muted-foreground">
            Verdict data is available only for Oct 28 - Nov 3 in the current
            fixtures.
          </p> */}
        </CardContent>
      </Card>
    </>
  );
}

// CHUNK 4 — Full-width chart, with three compact analytics cards underneath.
export function PlatformImpact() {
  return (
    <section
      id="platform-impact"
      aria-labelledby="impact-heading"
      className="mt-12 space-y-4 lg:space-y-5 "
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2
          id="impact-heading"
          className="text-lg font-semibold tracking-tight"
        >
          Platform impact
        </h2>
        <Badge
          variant="outline"
          className="text-xs font-normal text-muted-foreground"
        >
          Illustrative data
        </Badge>
      </div>

      <ResolutionChart />

      {/* Three cards side-by-side at laptop widths, even with an expanded sidebar. */}
      <div className="grid min-w-0 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ImpactMetrics />
        <CaseDistribution />
      </div>

      {/* <p className="text-xs leading-5 text-muted-foreground">
        Demo metrics are generated from local fixtures. Chart and performance
        periods are independent. Estimated time saved is not measured; priority
        and verdict distributions have the scopes shown on their cards.
      </p> */}
    </section>
  );
}
