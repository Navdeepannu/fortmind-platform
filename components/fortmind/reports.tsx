"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Download, FileText, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { caseHref, integrationHref, platformRoutes } from "@/lib/platform-routes";
import { assumedMinutesPerAutonomousClosure } from "@/lib/overview-data";
import { integrationStates, priorityStates, verdictStates } from "@/lib/semantic-states";
import { reportingCsv, reportingRange, reportingReferenceDate, reportPresets, summarizeReporting, validDateRange, type DateRange, type ReportingSummary } from "@/lib/reporting-data";
import { PriorityBadge, SemanticBadge, VerdictBadge } from "./semantic";
import { CopyTechnicalValue } from "./case-table";
import { useBrowserRecord } from "@/hooks/use-browser-record";
import { settingsDefaults, settingsValidators } from "@/lib/settings-data";

const day = (value: string) => new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value + "T12:00:00Z"));
const time = (value: string) => new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value)) + " UTC";
const rangeLabel = (range: DateRange) => `${day(range.from)} – ${day(range.to)}`;

function CustomRange({ initial, apply }: { initial: DateRange; apply: (range: DateRange) => void }) {
  const [from, setFrom] = useState(initial.from); const [to, setTo] = useState(initial.to); const [error, setError] = useState("");
  return <form onSubmit={event => { event.preventDefault(); const range = { from, to }; if (!validDateRange(range)) { setError("Choose dates in order, covering at most 366 days."); return; } setError(""); apply(range); }} className="flex w-full min-w-0 max-w-full flex-col gap-2 lg:w-[440px] lg:shrink-0">
    <FieldGroup className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[155px_155px_auto]"><Field><FieldLabel htmlFor="report-from">From (UTC)</FieldLabel><Input id="report-from" type="date" required value={from} onChange={event => setFrom(event.target.value)} aria-invalid={Boolean(error)} /></Field><Field><FieldLabel htmlFor="report-to">To (UTC)</FieldLabel><Input id="report-to" type="date" required value={to} onChange={event => setTo(event.target.value)} aria-invalid={Boolean(error)} /></Field><Button variant="outline" type="submit" className="col-span-2 sm:col-span-1">Apply dates</Button></FieldGroup>
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
  </form>;
}
const metrics: { key: keyof ReportingSummary["metrics"]; title: string; description: string; format?: "percent" | "minutes" | "hours" }[] = [
  { key: "opened", title: "Cases Opened", description: "Cases opened during the selected period." },
  { key: "decided", title: "Decided", description: "Investigations that reached a verdict in the period, regardless of when opened." },
  { key: "autonomous", title: "Closed by OSCAR", description: "Decided cases explicitly attributed to autonomous closure." },
  { key: "autoCloseRate", title: "Auto-Close Rate", description: "Share of decided cases closed without an analyst.", format: "percent" },
  { key: "neededPerson", title: "Needed a Person", description: "Investigations routed for human review or analyst decision." },
  { key: "medianMinutes", title: "Median Time to Verdict", description: "Median elapsed time from opening to a verdict among decided cases.", format: "minutes" },
  { key: "hoursSaved", title: "Hours Saved", description: `Estimate at ${assumedMinutesPerAutonomousClosure} analyst minutes per autonomous closure. Not a measured time study.`, format: "hours" },
  { key: "overrideRate", title: "Override Rate", description: "Share of decisions corrected by an analyst within 30 days in the demo events.", format: "percent" },
];
function metricValue(value: number | null, format?: string) {
  if (value === null) return "—";
  if (format === "percent") return `${Math.round(value)}%`;
  if (format === "minutes") return value >= 60 ? `${(value / 60).toFixed(1)} h` : `${Math.round(value)} min`;
  if (format === "hours") return `${value.toFixed(1)} h`;
  return value.toLocaleString("en");
}
function comparison(value: number | null, previous: number | null, format?: string) {
  if (value === null || previous === null) return "Previous comparison unavailable";
  if (value === previous) return "Unchanged from comparison period";
  if (format === "percent") return `${value > previous ? "+" : ""}${(value - previous).toFixed(1)} pts vs comparison period`;
  if (previous === 0) return "No previous volume";
  const delta = (value - previous) / previous * 100;
  return `${delta > 0 ? "+" : ""}${new Intl.NumberFormat("en", { maximumFractionDigits: 1 }).format(delta)}% vs comparison period`;
}
function Distribution({ title, description, rows, kind, total }: { title: string; description: string; rows: { name: string; count: number }[]; kind: "verdict" | "priority"; total: number }) {
  return <Card size="sm"><CardHeader><CardTitle><h2 className="text-section-title">{title}</h2></CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent><div className="flex flex-col divide-y">{rows.map(row => {
    const definition = kind === "verdict" ? verdictStates[row.name as keyof typeof verdictStates] : priorityStates[row.name as keyof typeof priorityStates];
    const percent = total ? row.count / total * 100 : 0;
    return <div key={row.name} className="grid grid-cols-[minmax(105px,1fr)_minmax(30px,1fr)_30px_40px] items-center gap-3 py-3"><SemanticBadge definition={definition} treatment="inline" /><div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true"><div className="h-full rounded-full" style={{ width: `${percent}%`, background: definition.color }} /></div><span className="text-right text-sm tabular-nums">{row.count}</span><span className="text-right text-xs tabular-nums text-muted-foreground">{Math.round(percent)}%</span></div>;
  })}</div>{total === 0 && <p className="mt-2 text-xs text-muted-foreground">No decided cases in this period.</p>}</CardContent></Card>;
}
function InsightEmpty({ children }: { children: string }) { return <Empty className="py-8"><EmptyHeader><EmptyTitle>No activity in this range</EmptyTitle><EmptyDescription>{children}</EmptyDescription></EmptyHeader></Empty>; }

export function Reports() {
  const router = useRouter(); const search = useSearchParams();
  const selection = reportingRange({ range: search.get("range"), from: search.get("from"), to: search.get("to"), period: search.get("period") });
  const [indicatorKind, setIndicatorKind] = useState("All"); const [showAllIndicators, setShowAllIndicators] = useState(false); const [exportMessage, setExportMessage] = useState("");
  const assumptions = useBrowserRecord("fortmind.prototype.settings.spend.v1", settingsDefaults.spend, settingsValidators.spend);
  const analystMinutes = assumptions.value.analystMinutes;
  const range = selection.range;
  const current = range ? summarizeReporting(range, undefined, undefined, analystMinutes) : null;
  const previous = selection.previous ? summarizeReporting(selection.previous, undefined, undefined, analystMinutes) : null;
  const indicators = current?.indicators.filter(item => indicatorKind === "All" || item.kind === indicatorKind) ?? [];
  function exportCsv() {
    if (!current || !range) return;
    try {
      const url = URL.createObjectURL(new Blob(["\ufeff" + reportingCsv(range, current)], { type: "text/csv;charset=utf-8" }));
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = `fortmind-demo-report-${range.from}-${range.to}.csv`; anchor.click(); URL.revokeObjectURL(url); setExportMessage("CSV exported for the selected range.");
    } catch { setExportMessage("CSV export failed. Try again or check browser download permissions."); }
  }
  return <main data-ui="main" id="preview-main" className="mx-auto w-full min-w-0 p-5 md:p-8 flex flex-col gap-8">
    <header data-ui="page-heading" className="flex flex-wrap justify-between items-center gap-6 max-[1101px]:items-start max-md:items-start max-md:gap-3 !mb-0"><div><h1 className="text-page-title">Reports</h1><p className="mt-1 text-body text-muted-foreground">{range ? `${rangeLabel(range)} · UTC` : "Choose a valid reporting range."}</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" disabled={!current} onClick={exportCsv}><Download data-icon="inline-start" />Export CSV</Button><Button variant="outline" disabled aria-describedby="pdf-status"><FileText data-icon="inline-start" />Export PDF</Button></div></header>
    <div className="flex flex-wrap items-center justify-between gap-2"><Badge variant="outline">Demo reporting events · reference date {reportingReferenceDate}</Badge><p id="pdf-status" className="text-xs text-muted-foreground">PDF export is not connected.</p></div>
    <section aria-label="Report date range" className="flex flex-wrap items-end justify-between gap-4 border-b pb-5"><div className="flex flex-col gap-3"><ToggleGroup aria-label="Reporting date presets" value={selection.preset === "custom" ? [] : [selection.preset]} onValueChange={values => { if (values[0]) { setExportMessage(""); router.push(`${platformRoutes.reports}?range=${values[0]}`, { scroll: false }); } }} variant="outline" spacing={1} className="flex-wrap justify-start">{reportPresets.map(preset => <ToggleGroupItem key={preset.id} value={preset.id}>{preset.label}</ToggleGroupItem>)}</ToggleGroup>{selection.previous && <p className="text-xs text-muted-foreground">Compared with {rangeLabel(selection.previous)}.</p>}</div><CustomRange key={`${range?.from}-${range?.to}`} initial={range ?? { from: reportingReferenceDate, to: reportingReferenceDate }} apply={next => { setExportMessage(""); router.push(`${platformRoutes.reports}?range=custom&from=${next.from}&to=${next.to}`, { scroll: false }); }} /></section>
    <p className="text-xs leading-5 text-muted-foreground">Illustrative event timestamps and outcomes reuse existing case IDs. They are not live case history or billing data. {analystMinutes} minutes per autonomous closure is the {assumptions.persisted ? "browser-saved" : "default"} reporting assumption.</p>
    {exportMessage && <p role="status" className="text-xs text-muted-foreground">{exportMessage}</p>}
    {selection.error && <Alert variant="destructive"><AlertTitle>Invalid date range</AlertTitle><AlertDescription>{selection.error}</AlertDescription></Alert>}
    {current && <>
      <section aria-labelledby="performance-heading"><h2 id="performance-heading" className="mb-3 text-section-title">Performance metrics</h2><div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{metrics.map(metric => <Card size="sm" key={metric.key} data-metric={metric.key}><CardHeader><CardTitle><h3 className="text-muted-foreground text-panel-title">{metric.title}</h3></CardTitle></CardHeader><CardContent className="flex flex-col gap-2"><p className="text-metric tabular-nums">{metricValue(current.metrics[metric.key], metric.format)}</p><p className="text-xs text-muted-foreground">{previous ? comparison(current.metrics[metric.key], previous.metrics[metric.key], metric.format) : "Comparison unavailable"}</p><p className="text-xs leading-5 text-muted-foreground">{metric.key === "hoursSaved" ? `Estimate at ${analystMinutes} analyst minutes per autonomous closure. Not a measured time study.` : metric.description}</p></CardContent></Card>)}</div></section>
      <section aria-label="Case distribution" className="grid min-w-0 gap-6 lg:grid-cols-2"><Distribution title="Verdict Mix" description="Verdicts on investigations decided in this period." rows={current.verdicts} kind="verdict" total={current.metrics.decided} /><Distribution title="Priority Mix" description="Priorities of the same decided cases." rows={current.priorities} kind="priority" total={current.metrics.decided} /></section>
      <section aria-label="Investigation insights" className="grid min-w-0 items-start gap-6 xl:grid-cols-2">
        <section aria-labelledby="indicators-heading" className="min-w-0 overflow-hidden rounded-lg border bg-card"><header className="flex flex-wrap items-start justify-between gap-3 border-b p-6"><div><h2 id="indicators-heading" className="text-section-title">Most-Seen Indicators and Assets</h2><p className="mt-1 text-xs text-muted-foreground">Cases opened in range. Counted once per case.</p></div><NativeSelect aria-label="Indicator type" size="sm" value={indicatorKind} onChange={event => { setIndicatorKind(event.target.value); setShowAllIndicators(false); }}>{["All", "Host", "User account", "IP address", "Email address", "File hash"].map(kind => <NativeSelectOption key={kind} value={kind}>{kind === "All" ? "All indicator types" : kind}</NativeSelectOption>)}</NativeSelect></header>
          {indicators.length ? <Table><TableHeader><TableRow><TableHead className="pl-4">Value</TableHead><TableHead>Type</TableHead><TableHead className="pr-4 text-right">Cases</TableHead></TableRow></TableHeader><TableBody>{(showAllIndicators ? indicators : indicators.slice(0, 10)).map(item => <TableRow key={`${item.kind}:${item.value}`}><TableCell className="max-w-52 py-3 pl-4 [&_code]:max-w-44 [&_code]:truncate"><CopyTechnicalValue label={item.kind.toLowerCase()} value={item.value} /></TableCell><TableCell className="text-xs text-muted-foreground">{item.kind}</TableCell><TableCell className="pr-4 text-right tabular-nums">{item.count}</TableCell></TableRow>)}</TableBody></Table> : <InsightEmpty>No indicators of this type were recorded in the selected demo events.</InsightEmpty>}{indicators.length > 10 && <footer className="flex items-center justify-between gap-3 border-t px-4 py-2"><span className="text-xs text-muted-foreground">{showAllIndicators ? indicators.length : 10} of {indicators.length} indicators</span><Button variant="ghost" size="sm" onClick={() => setShowAllIndicators(!showAllIndicators)}>{showAllIndicators ? "Show fewer" : "Show all indicators"}</Button></footer>}
        </section>
        <section aria-labelledby="people-heading" className="min-w-0 overflow-hidden rounded-lg border bg-card"><header className="border-b p-6"><h2 id="people-heading" className="text-section-title">Cases That Needed a Person</h2><p className="mt-1 text-xs text-muted-foreground">Decided in range and routed for review, newest first.</p></header>{current.people.length ? <ul className="divide-y">{current.people.map(item => <li key={item.id}><Link href={caseHref(item.id)} className="flex gap-3 px-4 py-3 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"><div className="flex min-w-0 flex-1 flex-col gap-2"><span className="text-sm font-medium leading-5">{item.title}</span><div className="flex flex-wrap items-center gap-2"><PriorityBadge value={item.priority} /><VerdictBadge value={item.verdict} /><time dateTime={item.decidedAt!} className="text-xs text-muted-foreground">{time(item.decidedAt!)}</time></div></div><ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" /></Link></li>)}</ul> : <InsightEmpty>No decided cases needed a person in this range.</InsightEmpty>}<footer className="border-t px-4 py-3"><Link href={`${platformRoutes.cases}?queue=Needs%20you`} className="text-xs underline underline-offset-4">Open the current review queue</Link></footer></section>
      </section>
      <section aria-labelledby="health-heading" className="min-w-0 overflow-hidden rounded-lg border bg-card"><header className="flex items-start gap-3 border-b p-6"><TriangleAlert className="mt-0.5 size-4 text-warning-foreground" aria-hidden="true" /><div><h2 id="health-heading" className="text-section-title">Tools That Stopped Responding</h2><p className="mt-1 text-xs text-muted-foreground">Demo interruptions during the range, including earlier outages that were still active.</p></div></header>{current.health.length ? <Table><TableHeader><TableRow><TableHead className="pl-4">Tool</TableHead><TableHead>Stopped responding</TableHead><TableHead>Status at range end</TableHead><TableHead className="pr-4 text-right">Action</TableHead></TableRow></TableHeader><TableBody>{current.health.map(item => <TableRow key={item.integrationId}><TableCell className="pl-4 font-medium">{item.name}</TableCell><TableCell><time dateTime={item.stoppedAt} className="text-xs text-muted-foreground">{time(item.stoppedAt)}</time></TableCell><TableCell><SemanticBadge definition={item.recovered ? integrationStates.Connected : integrationStates.Error} label={item.recovered ? "Recovered" : "Not responding"} /></TableCell><TableCell className="pr-4 text-right"><Link href={integrationHref(item.integrationId)} className="text-xs underline underline-offset-4">View integration</Link></TableCell></TableRow>)}</TableBody></Table> : <InsightEmpty>No tool interruptions overlap this selected demo period.</InsightEmpty>}</section>
    </>}
  </main>;
}
