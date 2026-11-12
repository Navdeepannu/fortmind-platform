"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CircleX,
  Clock3,
  ScanLine,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriorityBadge, VerdictBadge } from "../semantic";

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
    <div className="min-w-44 rounded-lg border-border border bg-popover p-3 text-caption text-popover-foreground shadow-none">
      <p className="mb-2 font-semibold">{bucket.label}</p>
      <dl className="flex flex-col gap-1.5">
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
          <TabsTrigger key={key} value={key} className="px-2.5 text-caption sm:px-3">
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
  const summary = impactSummary(report);
  const grouping = report.daily.length > 7 ? "7-day interval" : "day";

  return (
    <Card className="min-w-0 gap-0 overflow-hidden rounded-lg border border-border bg-card py-0 shadow-none">
      <CardHeader className="flex flex-col gap-3 border-b border-border px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3 w-full">
          <div>
            <h3 className="text-panel-title">Investigation outcomes</h3>
            <p className="mt-1 text-prose text-muted-foreground">
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
      <CardContent className="min-w-0 flex flex-col gap-6 px-6 py-6">
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
                  className="text-caption"
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
            <span className="text-caption text-muted-foreground">
              {mode === "failed" ? "failed runs" : "closed cases"}
            </span>
          </div>
        </div>

        <p className="text-caption text-muted-foreground">
          {report.oscar} closed by OSCAR + {report.analyst} by analysts = {report.closed} closures.
          {summary.share !== null && ` OSCAR closed ${summary.share}% of these cases.`} Failed runs are counted separately.
        </p>

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
                        fontSize={12}
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
          <p className="rounded-lg border border-dashed border-border p-8 text-prose text-muted-foreground">
            No investigation outcomes for this period.
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-caption text-muted-foreground">
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
            role="link"
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
    <div className="flex flex-col gap-1">
      <div className="relative isolate flex min-h-13 items-center overflow-hidden rounded-md bg-muted/60 px-3 py-2">
        {bounded !== null && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 -z-10 bg-foreground/10"
            style={{ width: `${bounded}%` }}
          />
        )}
        <div className="relative flex w-full min-w-0 items-center justify-between gap-3">
          <div className="min-w-0 text-body">{label}</div>
          <div className="flex shrink-0 items-baseline gap-2 tabular-nums">
            <span className="text-body font-semibold text-foreground">
              {count}
            </span>
            {bounded !== null && (
              <span className="w-9 text-right text-caption text-muted-foreground">
                {Math.round(bounded)}%
              </span>
            )}
          </div>
        </div>
      </div>
      {description && (
        <p className="px-1 text-caption text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

/**
 * Simple comparison bars keep security semantics in the label, not the fill.
 * Bar fills intentionally use the illustration token for visual separation.
 */
function MixBarRow({
  name,
  label,
  count,
  percentage,
}: {
  name: string;
  label: ReactNode;
  count: number;
  percentage: number;
}) {
  const bounded = Math.max(0, Math.min(100, percentage));
  const rounded = Math.round(bounded);

  return (
    <div className="min-w-0">
      <div className="flex min-w-0 items-center justify-between gap-4">
        <div className="min-w-0">{label}</div>
        <div className="flex shrink-0 items-baseline gap-3 tabular-nums">
          <span className="text-body font-semibold text-foreground">{count}</span>
          <span className="w-8 text-right text-caption text-muted-foreground">{rounded}%</span>
        </div>
      </div>
      <div
        role="meter"
        aria-label={`${name} share`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rounded}
        aria-valuetext={`${count} cases, ${rounded}%`}
        className="mt-2.5 h-2.5 w-full overflow-hidden rounded-xs bg-muted"
      >
        <div
          aria-hidden="true"
          data-ui="mix-bar-fill"
          className="h-full rounded-xs bg-illustration"
          style={{
            width: `${bounded}%`,
            // Force a computed fill even when a Tailwind token build is stale.
            // Source remains the shared semantic illustration variable.
            backgroundColor: "var(--illustration, #3B3E41)",
          }}
        />
      </div>
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

  return (
    <Card className="min-w-0 gap-0 overflow-hidden rounded-lg border border-border bg-card py-0 shadow-none">
      <CardHeader className="flex flex-col gap-3 border-b border-border px-5 py-5">
        <div className="flex w-full flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-panel-title">Performance</h3>
            <p className="mt-1 text-caption text-muted-foreground">{report.dates}</p>
          </div>

          <PeriodSelector
            period={period}
            onChange={setPeriod}
            label="Performance reporting period"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 px-5 py-5">
        <DataBarRow
          label={
            <span className="inline-flex items-center gap-2">
              <ScanLine
                aria-hidden="true"
                className="size-4 shrink-0 text-oscar-foreground"
              />
              Autonomous closures
            </span>
          }
          count={report.oscar}
          percentage={oscarPct}
          description={`Share of ${report.closed} closed cases`}
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
          description="Recorded failures; retry history unavailable"
        />
        <p className="mt-auto border-t pt-3 text-caption text-muted-foreground">
          Time saved is an estimate: {report.oscar} OSCAR closures × {analystMinutes} analyst minutes per case. This assumption is configurable in Settings; it is not measured time.
        </p>
      </CardContent>
    </Card>
  );
}

// CHUNK 3 — Distribution cards use the same compact row treatment.
// Colors are reserved for meaningful icons; the proportional bars stay neutral.
export function CaseDistribution() {
  const openTotal = openPriorities.reduce((sum, item) => sum + item.value, 0);
  const verdicts = impactReports["7d"].verdicts ?? [];
  const verdictTotal = verdicts.reduce((sum, item) => sum + item.value, 0);

  return (
    <>
      <Card className="min-w-0 gap-0 overflow-hidden rounded-lg border border-border bg-card py-0 shadow-none">
        <CardHeader className="border-b border-border px-5 py-5">
          <h3 className="text-panel-title">Priority mix</h3>
          <p className="mt-1 text-caption text-muted-foreground">
            {openTotal} awaiting decisions or running · current snapshot
          </p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-5 px-5 py-5">
          {openPriorities.map((item) => {
            const share = openTotal ? (item.value / openTotal) * 100 : 0;
            return (
              <MixBarRow
                key={item.name}
                name={item.name}
                label={<PriorityBadge value={item.name} />}
                count={item.value}
                percentage={share}
              />
            );
          })}
          <p className="mt-auto border-t pt-3 text-caption text-muted-foreground">
            Needs you + Running. Failed and queued cases are excluded.
          </p>
        </CardContent>
      </Card>

      <Card className="min-w-0 gap-0 overflow-hidden rounded-lg border border-border bg-card py-0 shadow-none">
        <CardHeader className="border-b border-border px-5 py-5">
          <h3 className="text-panel-title">Verdict mix</h3>
          <p className="mt-1 text-caption text-muted-foreground">
            {verdictTotal} closed cases · {impactReports["7d"].dates}
          </p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-5 px-5 py-5">
          {verdicts.map((item) => {
            const share = verdictTotal ? (item.value / verdictTotal) * 100 : 0;
            return (
              <MixBarRow
                key={item.name}
                name={item.name}
                label={<VerdictBadge value={item.name} />}
                count={item.value}
                percentage={share}
              />
            );
          })}
          <p className="mt-auto border-t pt-3 text-caption text-muted-foreground">
            Fixed 7-day sample; verdicts for other periods are unavailable.
          </p>
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
      className="mt-10 flex flex-col gap-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2
          id="impact-heading"
          className="text-section-title"
        >
          Platform impact
        </h2>
        <Badge
          variant="outline"
          className="text-caption font-normal text-muted-foreground"
        >
          Illustrative data
        </Badge>
      </div>

      <ResolutionChart />

      {/* Three cards side-by-side at laptop widths, even with an expanded sidebar. */}
      <div className="grid min-w-0 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ImpactMetrics />
        <CaseDistribution />
      </div>

      <p className="text-caption text-muted-foreground">
        Chart and Performance periods are independent. Operations and Priority mix remain current snapshots.
      </p>
    </section>
  );
}
