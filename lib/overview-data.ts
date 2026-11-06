import { cases, type SecurityCase, type Priority } from "./preview-data";

// Local design fixtures. The 7-day aggregate follows the supplied Paper screenshot.
// Operations are a current snapshot; the period selector changes impact only.
export const operations = {
  needsYou: 133,
  urgent: 34,
  running: 8,
  closed: 54,
  failed: 4,
};
export const openPriorities: { name: Priority; value: number }[] = [
  { name: "Urgent", value: 34 },
  { name: "Notable", value: 79 },
  { name: "Informational", value: 28 },
];
const priorityRank: Record<Priority, number> = {
  Urgent: 0,
  Notable: 1,
  Informational: 2,
};
export function attentionOrder(items: SecurityCase[]) {
  return items
    .filter(
      (item) => item.status === "Needs you" || item.status === "Escalated",
    )
    .sort(
      (a, b) =>
        priorityRank[a.priority] - priorityRank[b.priority] ||
        b.ageMinutes - a.ageMinutes,
    );
}
export const attentionCases = attentionOrder(cases).slice(0, 3);
export const runningCases = [
  {
    id: "FM-1051",
    title: "New service in Windows root",
    stage: "Collecting evidence",
    elapsed: "1m 12s",
    host: "WIN-PATCH01",
  },
  {
    id: "FM-1050",
    title: "Suspicious Microsoft 365 sign-in",
    stage: "Correlating evidence",
    elapsed: "42s",
    host: "lab.bob",
  },
  {
    id: "FM-1049",
    title: "DNS query to a watchlisted domain",
    stage: "Analyzing evidence",
    elapsed: "28s",
    host: "fmlab-ws1",
  },
];
export function runningCaseDetails(
  item: (typeof runningCases)[number],
): SecurityCase {
  return {
    id: item.id,
    title: item.title,
    priority: "Notable",
    verdict: "Inconclusive",
    status: "Running",
    owner: null,
    source: "SIEM webhook",
    ageMinutes: 1,
    confidence: { value: 48, level: "Low" },
    entities: {
      hostname: item.host,
      ip: "Not available",
      user: "Not available",
    },
    summary: `OSCAR is ${item.stage.toLowerCase()}. The investigation is still running; no final verdict is available.`,
  };
}
export type ImpactPeriod = "7d" | "30d" | "90d";
export interface OutcomeDay {
  day: string;
  oscar: number;
  analyst: number;
  failed: number;
  closed: number;
}
export type VerdictCount = { name: "Malicious" | "Suspicious" | "Benign" | "Inconclusive"; value: number };
export interface ImpactReport {
  label: string;
  dates: string;
  daily: OutcomeDay[];
  oscar: number;
  analyst: number;
  failed: number;
  closed: number;
  verdicts?: readonly VerdictCount[];
}
// A configurable preview assumption, not a measured analyst time study.
export const assumedMinutesPerAutonomousClosure = 20;
function makeReport(days: number): ImpactReport {
  const oscarWeek = [2, 3, 2, 4, 3, 2, 2],
    analystWeek = [4, 5, 4, 7, 6, 5, 5],
    failedWeek = [0, 1, 0, 1, 0, 1, 1];
  const daily = Array.from({ length: days }, (_, i) => {
    const date = new Date(Date.UTC(2026, 10, 3 - (days - 1 - i)));
    const day = new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(date);
    const oscar = days === 7 ? oscarWeek[i] : 2 + (i % 4),
      analyst = days === 7 ? analystWeek[i] : 3 + (i % 5),
      failed = days === 7 ? failedWeek[i] : Number(i % 11 === 0);
    return { day, oscar, analyst, failed, closed: oscar + analyst };
  });
  const total = (key: "oscar" | "analyst" | "failed") =>
    daily.reduce((sum, d) => sum + d[key], 0);
  return {
    label: `${days} days`,
    dates:
      days === 7
        ? "Oct 28 – Nov 3, 2026"
        : days === 30
          ? "Oct 5 – Nov 3, 2026"
          : "Aug 6 – Nov 3, 2026",
    daily,
    oscar: total("oscar"),
    analyst: total("analyst"),
    failed: total("failed"),
    closed: total("oscar") + total("analyst"),
    // Only the supplied seven-day preview has a verdict breakdown. The longer
    // synthetic series cannot support one without inventing case verdicts.
    verdicts: days === 7 ? [
      { name: "Malicious", value: 8 },
      { name: "Suspicious", value: 12 },
      { name: "Benign", value: 30 },
      { name: "Inconclusive", value: 4 },
    ] : undefined,
  };
}
export const impactReports: Record<ImpactPeriod, ImpactReport> = {
  "7d": makeReport(7),
  "30d": makeReport(30),
  "90d": makeReport(90),
};
export function impactSummary(
  report: ImpactReport,
  minutesPerClosure = assumedMinutesPerAutonomousClosure,
) {
  const share = report.closed > 0 ? Math.round((report.oscar / report.closed) * 100) : null;
  return {
    share,
    finished: report.closed + report.failed,
    estimatedMinutesSaved: report.oscar * minutesPerClosure,
    estimatedHoursSaved: Math.round((report.oscar * minutesPerClosure / 60) * 10) / 10,
  };
}
