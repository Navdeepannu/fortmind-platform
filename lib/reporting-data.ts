import { platformCases } from "./platform-cases";
import { caseOverview } from "./case-overview-data";
import { assumedMinutesPerAutonomousClosure } from "./overview-data";
import { priorities, verdicts, type Priority, type SecurityCase, type Verdict } from "./preview-data";

export const reportingReferenceDate = "2026-11-05";
const dayMs = 86_400_000;
const isoDay = (date: Date) => date.toISOString().slice(0, 10);
export const shiftDay = (day: string, offset: number) => isoDay(new Date(Date.parse(day + "T00:00:00Z") + offset * dayMs));
export interface DateRange { from: string; to: string }
export const reportPresets = [{ id: "week", label: "This Week" }, { id: "last-week", label: "Last Week" }, { id: "month", label: "This Month" }, { id: "last-month", label: "Last Month" }] as const;
export function validDateRange(range: DateRange) {
  const validDay = (day: string) => /^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(Date.parse(day)) && new Date(day).toISOString().slice(0, 10) === day;
  return validDay(range.from) && validDay(range.to) && range.from <= range.to && (Date.parse(range.to) - Date.parse(range.from)) / dayMs < 366;
}
export function reportingRange(query: { range?: string | null; from?: string | null; to?: string | null; period?: string | null }, anchor = reportingReferenceDate) {
  const today = new Date(anchor + "T00:00:00Z");
  const weekStart = shiftDay(anchor, -((today.getUTCDay() + 6) % 7));
  const monthStart = isoDay(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)));
  const lastMonthStart = isoDay(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1)));
  let preset = query.range ?? "week";
  let range: DateRange;
  if (["7d", "30d", "90d"].includes(query.period ?? "")) {
    // Preserve the exact period of the existing Overview snapshot, ending Nov 3.
    range = { from: shiftDay("2026-11-03", 1 - Number(query.period!.slice(0, -1))), to: "2026-11-03" }; preset = "custom";
  } else if (preset === "custom") {
    range = { from: query.from ?? "", to: query.to ?? "" };
    if (!validDateRange(range) || range.to > anchor) return { preset, range: null, previous: null, error: `Choose valid dates in order, covering at most 366 days and ending no later than ${anchor}.` };
  } else if (preset === "last-week") range = { from: shiftDay(weekStart, -7), to: shiftDay(weekStart, -1) };
  else if (preset === "month") range = { from: monthStart, to: anchor };
  else if (preset === "last-month") range = { from: lastMonthStart, to: shiftDay(monthStart, -1) };
  else { preset = "week"; range = { from: weekStart, to: anchor }; }
  const days = Math.round((Date.parse(range.to) - Date.parse(range.from)) / dayMs) + 1;
  let previous = { from: shiftDay(range.from, -days), to: shiftDay(range.from, -1) };
  if (preset === "week") previous = { from: shiftDay(range.from, -7), to: shiftDay(range.to, -7) };
  if (preset === "month") previous = { from: lastMonthStart, to: [shiftDay(lastMonthStart, days - 1), shiftDay(monthStart, -1)].sort()[0] };
  if (preset === "last-month") previous = { from: isoDay(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 2, 1))), to: shiftDay(lastMonthStart, -1) };
  return { preset, range, previous, error: null };
}
export type IndicatorKind = "Host" | "User account" | "IP address" | "Email address" | "File hash";
export interface ReportingCase extends Pick<SecurityCase, "id" | "title" | "priority" | "verdict"> {
  openedAt: string; decidedAt: string | null; closedByOscar: boolean; neededPerson: boolean; overridden: boolean;
  indicators: { kind: IndicatorKind; value: string }[];
}
// Synthetic reporting timestamps and outcomes attached to existing case IDs.
// They are illustrative reporting events, not updates to the queue or live history.
const offsets = [0, 1, 2, 3, 0, 1, 2, 3, 8, 12, 18, 25, 1, 4, 9];
export const reportingCases: ReportingCase[] = platformCases.map((item, index) => {
  const decided = !["Running", "Queued", "Failed"].includes(item.status);
  const eventDay = shiftDay(reportingReferenceDate, -(offsets[index] ?? index));
  const openedAt = `${decided && index % 4 === 0 ? shiftDay(eventDay, -1) : eventDay}T10:${String(index).padStart(2, "0")}:00Z`;
  const decidedAt = decided ? `${eventDay}T10:${String(index + 4).padStart(2, "0")}:00Z` : null;
  const indicators: ReportingCase["indicators"] = [
    { kind: "Host" as const, value: item.entities.hostname }, { kind: "User account" as const, value: item.entities.user }, { kind: "IP address" as const, value: item.entities.ip },
    ...(item.entities.hash ? [{ kind: "File hash" as const, value: item.entities.hash }] : []),
    ...(index < 2 ? [{ kind: "Email address" as const, value: "analyst@example.test" }] : []),
  ].filter(indicator => !/^(?:Not available|Not supplied)$/i.test(indicator.value));
  return { id: item.id, title: item.title, priority: item.priority, verdict: item.verdict, openedAt, decidedAt, closedByOscar: decided && item.closedByOscar === true, neededPerson: decided && item.closedByOscar !== true, overridden: decided && item.status === "Closed" && !item.closedByOscar && index % 2 === 1, indicators };
});
reportingCases.push({ id: caseOverview.id, title: caseOverview.title, priority: caseOverview.priority, verdict: caseOverview.proposedVerdict, openedAt: "2026-11-03T10:57:00Z", decidedAt: "2026-11-03T10:58:00Z", closedByOscar: false, neededPerson: true, overridden: false, indicators: [{ kind: "Host", value: "fmlab-ws1" }, { kind: "User account", value: "lab.bob" }] });
export interface ToolOutage { integrationId: string; name: string; stoppedAt: string; recoveredAt: string | null }
export const demoToolOutages: ToolOutage[] = [
  { integrationId: "microsoft-365", name: "Microsoft 365", stoppedAt: "2026-11-05T14:18:00Z", recoveredAt: null },
  { integrationId: "wazuh", name: "Wazuh", stoppedAt: "2026-11-03T02:00:00Z", recoveredAt: null },
  { integrationId: "abuse-ch", name: "abuse.ch (unified)", stoppedAt: "2026-10-27T12:00:00Z", recoveredAt: "2026-10-28T09:00:00Z" },
];
const inRange = (timestamp: string | null, range: DateRange) => timestamp !== null && timestamp.slice(0, 10) >= range.from && timestamp.slice(0, 10) <= range.to;
const median = (values: number[]) => { const sorted = [...values].sort((a, b) => a - b); return sorted.length ? (sorted[Math.floor((sorted.length - 1) / 2)] + sorted[Math.floor(sorted.length / 2)]) / 2 : null; };
export function summarizeReporting(range: DateRange, records = reportingCases, outages = demoToolOutages, analystMinutes = assumedMinutesPerAutonomousClosure) {
  const opened = records.filter(item => inRange(item.openedAt, range));
  const decided = records.filter(item => inRange(item.decidedAt, range));
  const autonomous = decided.filter(item => item.closedByOscar);
  const people = decided.filter(item => item.neededPerson).sort((a, b) => b.decidedAt!.localeCompare(a.decidedAt!));
  const mix = <T extends Priority | Verdict>(labels: readonly T[], field: "verdict" | "priority") => labels.map(name => ({ name, count: decided.filter(item => item[field] === name).length }));
  const indicators = new Map<string, { kind: IndicatorKind; value: string; count: number }>();
  for (const item of opened) {
    for (const indicator of new Map(item.indicators.map(indicator => [`${indicator.kind}:${indicator.value}`, indicator])).values()) {
      const key = `${indicator.kind}:${indicator.value}`;
      indicators.set(key, { ...indicator, count: (indicators.get(key)?.count ?? 0) + 1 });
    }
  }
  const health = outages.filter(item => item.stoppedAt.slice(0, 10) <= range.to && (!item.recoveredAt || item.recoveredAt.slice(0, 10) >= range.from)).map(item => ({ ...item, recovered: item.recoveredAt !== null && item.recoveredAt.slice(0, 10) <= range.to }));
  return {
    assumedAnalystMinutes: analystMinutes,
    metrics: { opened: opened.length, decided: decided.length, autonomous: autonomous.length, autoCloseRate: decided.length ? autonomous.length / decided.length * 100 : null, neededPerson: people.length, medianMinutes: median(decided.map(item => (Date.parse(item.decidedAt!) - Date.parse(item.openedAt)) / 60000)), hoursSaved: autonomous.length * analystMinutes / 60, overrideRate: decided.length ? decided.filter(item => item.overridden).length / decided.length * 100 : null },
    verdicts: mix(verdicts, "verdict"), priorities: mix(priorities, "priority"), people,
    indicators: [...indicators.values()].sort((a, b) => b.count - a.count || a.value.localeCompare(b.value)), health,
  };
}
export type ReportingSummary = ReturnType<typeof summarizeReporting>;
function csvCell(value: string | number) {
  let text = String(value);
  if (/^[=+@\-\t\r]/.test(text)) text = "'" + text;
  return `"${text.replaceAll('"', '""')}"`;
}
export function reportingCsv(range: DateRange, summary: ReportingSummary) {
  const rows: (string | number)[][] = [["FortMind demo report", "From", range.from, "To", range.to, "Timezone", "UTC"], ["Assumptions", "Analyst minutes per autonomous closure", summary.assumedAnalystMinutes, "Local preference or demo default"], ["Section", "Name / value", "Count / metric", "Details"]];
  for (const [key, value] of Object.entries(summary.metrics)) rows.push(["Metrics", key, value ?? "Unavailable", "Demo reporting events"]);
  for (const [section, mix] of [["Verdict", summary.verdicts], ["Priority", summary.priorities]] as const) for (const item of mix) rows.push([section, item.name, item.count, "Decided in range"]);
  for (const item of summary.indicators) rows.push(["Indicator", item.value, item.count, item.kind]);
  for (const item of summary.people) rows.push(["Needed a person", item.title, item.id, item.decidedAt!, item.priority, item.verdict]);
  for (const item of summary.health) rows.push(["Tool health", item.name, item.recovered ? "Recovered" : "Not responding", item.stoppedAt, item.integrationId]);
  return rows.map(row => row.map(csvCell).join(",")).join("\r\n");
}
