export const priorities = ["Urgent", "Notable", "Informational"] as const;
export const verdicts = [
  "Malicious",
  "Suspicious",
  "Benign",
  "Inconclusive",
] as const;
export const statuses = [
  "Needs you",
  "Running",
  "Closed",
  "Failed",
  "Queued",
  "Escalated",
] as const;
export const sources = [
  "SIEM webhook",
  "Created by an analyst",
  "Escalated incident",
  "Other source",
] as const;
export const investigationPhases = ["Intake", "Plan", "Collect", "Analyze", "Report"] as const;
export type Priority = (typeof priorities)[number];
export type Verdict = (typeof verdicts)[number];
export type CaseStatus = (typeof statuses)[number];
export type Source = (typeof sources)[number];
export type ConfidenceLevel = "Low" | "Medium" | "High";
export type Queue = "Needs you" | "Running" | "Closed" | "Failed" | "All";
export type Tone =
  | "danger"
  | "warning"
  | "positive"
  | "information"
  | "failure"
  | "neutral"
  | "escalation"
  | "agent";
export interface SecurityCase {
  id: string;
  title: string;
  priority: Priority;
  verdict: Verdict;
  status: CaseStatus;
  closedByOscar?: boolean;
  // Independent source fields. Never substitute investigation confidence for a verdict score.
  verdictConfidence?: number | null;
  investigationPhase?: string | null;
  investigationPhases?: Partial<Record<(typeof investigationPhases)[number], "completed" | "active" | "pending" | "failed">>;
  recommendedNextAction?: string;
  outcomeDescription?: string | null;
  owner: string | null;
  source: Source;
  ageMinutes: number;
  // Investigation confidence; it is not the verdictConfidence score.
  confidence: { value: number; level: ConfidenceLevel };
  entities: {
    hostname: string;
    ip: string;
    user: string;
    file?: string;
    hash?: string;
    command?: string;
    domain?: string;
    process?: string;
  };
  summary: string;
}

// Synthetic examples only, including verdict scores; these are not real security findings.
// Investigation confidence labels are explicit fixtures, not inferred policy thresholds.
// Entity insertion order prioritizes the most relevant values in compact case metadata.
export const cases: SecurityCase[] = [
  {
    id: "FM-1048",
    title: "LSASS process accessed by mimikatz.exe",
    priority: "Urgent",
    verdict: "Malicious",
    verdictConfidence: 94,
    status: "Needs you",
    owner: null,
    source: "SIEM webhook",
    ageMinutes: 4,
    confidence: { value: 98, level: "High" },
    entities: {
      process: "mimikatz.exe",
      hostname: "WIN-FIN-042",
      user: "a.morgan",
      ip: "192.0.2.42",
      file: "C:\\Users\\Public\\mimikatz.exe",
      hash: "d41d8cd98f00b204e9800998ecf8427e000000000000000000000000000000000",
    },
    summary:
      "OSCAR correlated credential-access telemetry with an unsigned executable opening a handle to LSASS. The process lineage and memory access pattern support a malicious verdict. Review the proposed endpoint containment before taking action.",
    recommendedNextAction: "Review the proposed endpoint containment before taking action.",
  },
  {
    id: "FM-1047",
    title: "PowerShell executed a base64-encoded command",
    priority: "Urgent",
    verdict: "Malicious",
    verdictConfidence: 91,
    status: "Needs you",
    owner: "Alex Morgan",
    source: "SIEM webhook",
    ageMinutes: 12,
    confidence: { value: 96, level: "High" },
    entities: {
      process: "powershell.exe",
      hostname: "WIN-ENG-018",
      user: "j.chen",
      ip: "192.0.2.18",
      domain: "cdn-update.example",
      command: "powershell.exe -NoProfile -EncodedCommand SQBFAFgA",
    },
    summary:
      "An encoded PowerShell invocation followed an unexpected document process. OSCAR decoded the command and identified an execution pattern consistent with a staged payload. Analyst confirmation is required before containment.",
    recommendedNextAction: "Confirm the proposed containment after reviewing OSCAR’s findings.",
  },
  {
    id: "FM-1046",
    title: "Windows Audit Policy changed",
    priority: "Notable",
    verdict: "Suspicious",
    verdictConfidence: 75,
    status: "Needs you",
    owner: "Jamie Chen",
    source: "SIEM webhook",
    ageMinutes: 28,
    confidence: { value: 82, level: "High" },
    entities: {
      user: "svc.admin",
      process: "auditpol.exe",
      hostname: "DC-CORE-02",
      ip: "198.51.100.12",
      command: "auditpol /set /category:* /success:disable",
    },
    summary:
      "Audit logging was reduced outside the recorded maintenance window. OSCAR found no matching change request in the supplied evidence. Confirm whether the service account activity was authorized.",
    recommendedNextAction: "Confirm whether the service account activity was authorized.",
  },
  {
    id: "FM-1045",
    title: "Anomalous account activity detected across multiple regions",
    priority: "Notable",
    verdict: "Suspicious",
    verdictConfidence: 72,
    status: "Escalated",
    owner: "Alex Morgan",
    source: "Escalated incident",
    ageMinutes: 43,
    confidence: { value: 76, level: "Medium" },
    entities: {
      user: "r.patel",
      ip: "203.0.113.24",
      domain: "login.fortmind.example",
      hostname: "IDP-GATEWAY-01",
    },
    summary:
      "Two sign-in events for the same identity originated from geographically inconsistent network locations. A VPN remains a plausible explanation. The case has been escalated for identity verification.",
    recommendedNextAction: "Verify the identity activity with the case owner; a VPN remains a possible explanation.",
  },
  {
    id: "FM-1044",
    title: "Test alert created by an analyst",
    priority: "Informational",
    verdict: "Benign",
    verdictConfidence: 100,
    status: "Closed",
    closedByOscar: true,
    owner: null,
    source: "Created by an analyst",
    ageMinutes: 65,
    confidence: { value: 99, level: "High" },
    entities: {
      hostname: "SANDBOX-01",
      user: "test.analyst",
      ip: "192.0.2.100",
    },
    summary:
      "The alert was explicitly marked as a controlled validation exercise. OSCAR verified that the entities were within the supplied test environment and closed the case as benign.",
  },
  {
    id: "FM-1043",
    title: "Investigation lacked sufficient evidence",
    priority: "Informational",
    verdict: "Inconclusive",
    status: "Closed",
    owner: "Jamie Chen",
    source: "Other source",
    ageMinutes: 108,
    confidence: { value: 34, level: "Low" },
    entities: { hostname: "LINUX-APP-07", ip: "198.51.100.7", user: "deploy" },
    summary:
      "The retained telemetry did not include the original process tree or command line. OSCAR could not establish intent. An analyst closed the case as inconclusive; additional endpoint evidence would be needed to reassess it.",
  },
  {
    id: "FM-1042",
    title: "Unexpected outbound connection from a production host",
    priority: "Notable",
    verdict: "Inconclusive",
    status: "Running",
    investigationPhases: { Collect: "active" },
    owner: null,
    source: "SIEM webhook",
    ageMinutes: 134,
    confidence: { value: 48, level: "Low" },
    entities: {
      hostname: "APP-PROD-03",
      domain: "telemetry-sync.example",
      ip: "203.0.113.88",
      user: "app.worker",
      process: "node",
    },
    summary:
      "OSCAR is collecting connection history and process lineage. The destination has not yet been attributed, and the current evidence is insufficient for a final verdict.",
  },
  {
    id: "FM-1041",
    title: "Endpoint evidence collection interrupted",
    priority: "Notable",
    verdict: "Inconclusive",
    status: "Failed",
    investigationPhases: { Collect: "failed" },
    owner: "Sam Rivera",
    source: "SIEM webhook",
    ageMinutes: 186,
    confidence: { value: 21, level: "Low" },
    entities: { hostname: "WIN-HR-009", ip: "192.0.2.9", user: "s.rivera" },
    summary:
      "The endpoint connector timed out during evidence collection. This is a processing failure, not a malicious determination. Restore the connection and retry collection to continue the investigation.",
    recommendedNextAction: "Restore the connection and retry evidence collection.",
  },
  {
    id: "FM-1040",
    title: "Scheduled vulnerability scan triggered network detection",
    priority: "Informational",
    verdict: "Benign",
    verdictConfidence: 96,
    status: "Closed",
    closedByOscar: true,
    owner: null,
    source: "SIEM webhook",
    ageMinutes: 245,
    confidence: { value: 97, level: "High" },
    entities: {
      ip: "198.51.100.31",
      hostname: "SCAN-NODE-01",
      process: "nessusd",
      user: "svc.scanner",
    },
    summary:
      "Source host, timing, and scan signature match the approved scanner configuration supplied with the alert. OSCAR closed this case as expected administrative activity.",
  },
  {
    id: "FM-1039",
    title: "Suspicious archive written to a shared directory",
    priority: "Notable",
    verdict: "Suspicious",
    verdictConfidence: 67,
    status: "Needs you",
    owner: "Sam Rivera",
    source: "Created by an analyst",
    ageMinutes: 328,
    confidence: { value: 68, level: "Medium" },
    entities: {
      file: "D:\\Shared\\Exports\\finance-backup-2026.zip",
      user: "m.wilson",
      hostname: "FILE-SRV-04",
      ip: "192.0.2.64",
      process: "7z.exe",
    },
    summary:
      "An unusual archive was created on a shared directory by an interactive user. OSCAR identified a deviation from the supplied baseline but no confirmed exfiltration. Review the file contents and business context.",
    recommendedNextAction: "Review the file contents and business context.",
  },
  {
    id: "FM-1038",
    title: "New administrative session awaiting investigation",
    priority: "Informational",
    verdict: "Inconclusive",
    status: "Queued",
    owner: null,
    source: "Other source",
    ageMinutes: 412,
    confidence: { value: 15, level: "Low" },
    entities: { user: "ops.admin", hostname: "BASTION-02", ip: "203.0.113.15" },
    summary:
      "The alert is queued for intake. No investigation has completed, and the initial inconclusive label reflects insufficient evidence rather than a final assessment.",
  },
  {
    id: "FM-1037",
    title: "Credential access attempt blocked on engineering workstation",
    priority: "Urgent",
    verdict: "Malicious",
    verdictConfidence: 93,
    status: "Closed",
    owner: "Alex Morgan",
    source: "Escalated incident",
    ageMinutes: 1490,
    confidence: { value: 95, level: "High" },
    entities: {
      process: "procdump64.exe",
      hostname: "WIN-ENG-006",
      user: "t.brooks",
      ip: "192.0.2.6",
      file: "C:\\ProgramData\\Temp\\lsass.dmp",
    },
    summary:
      "Endpoint protection blocked the credential-access attempt. OSCAR correlated the block event with the originating process, and an analyst reviewed the evidence and closed the case after confirming remediation.",
  },
];

export function formatAge(minutes: number) {
  return minutes < 60
    ? `${minutes}m`
    : minutes < 1440
      ? `${Math.floor(minutes / 60)}h`
      : `${Math.floor(minutes / 1440)}d`;
}
export function matchesQueue(item: SecurityCase, queue: Queue) {
  if (queue === "All") return true;
  if (queue === "Needs you")
    return item.status === "Needs you" || item.status === "Escalated";
  return item.status === queue;
}
export interface CaseFilters {
  queue: Queue;
  search: string;
  priority: string;
  verdict: string;
  assignment: string;
  source: string;
  autonomous: boolean;
}
export function filterCases(data: SecurityCase[], filters: CaseFilters) {
  const query = filters.search.trim().toLowerCase();
  return data.filter(
    (item) =>
      matchesQueue(item, filters.queue) &&
      (!query ||
        [
          item.title,
          item.id,
          item.source,
          item.owner ?? "",
          ...Object.values(item.entities),
        ].some((value) => value.toLowerCase().includes(query))) &&
      (!filters.priority || item.priority === filters.priority) &&
      (!filters.verdict || item.verdict === filters.verdict) &&
      (!filters.source || item.source === filters.source) &&
      (!filters.autonomous || (item.status === "Closed" && item.closedByOscar === true)) &&
      (!filters.assignment ||
        (filters.assignment === "unassigned"
          ? item.owner === null
          : item.owner === filters.assignment)),
  );
}
export const dailyCases = [
  { day: "Oct 20", cases: 22 },
  { day: "Oct 21", cases: 31 },
  { day: "Oct 22", cases: 26 },
  { day: "Oct 23", cases: 39 },
  { day: "Oct 24", cases: 32 },
  { day: "Oct 25", cases: 46 },
  { day: "Oct 26", cases: 36 },
];
export const priorityMix: { name: Priority; value: number }[] = [
  { name: "Urgent", value: 38 },
  { name: "Notable", value: 84 },
  { name: "Informational", value: 110 },
];
export const verdictMix: { name: Verdict; value: number }[] = [
  { name: "Malicious", value: 28 },
  { name: "Suspicious", value: 64 },
  { name: "Benign", value: 118 },
  { name: "Inconclusive", value: 22 },
];

export type ReportingPeriod = "7d" | "14d";
export interface ReportSnapshot {
  days: number;
  dates: string;
  daily: typeof dailyCases;
  priorities: typeof priorityMix;
  verdicts: typeof verdictMix;
  needsYou: string;
  running: string;
  closed: string;
  saved: string;
  median: string;
  improvement: string;
}
export const reports: Record<ReportingPeriod, ReportSnapshot> = {
  "7d": {
    days: 7,
    dates: "Oct 20 – 26, 2026",
    daily: dailyCases,
    priorities: priorityMix,
    verdicts: verdictMix,
    needsYou: "119",
    running: "3",
    closed: "47",
    saved: "124",
    median: "18",
    improvement: "6",
  },
  "14d": {
    days: 14,
    dates: "Oct 13 – 26, 2026",
    daily: [
      { day: "Oct 13", cases: 25 },
      { day: "Oct 14", cases: 20 },
      { day: "Oct 15", cases: 28 },
      { day: "Oct 16", cases: 34 },
      { day: "Oct 17", cases: 30 },
      { day: "Oct 18", cases: 33 },
      { day: "Oct 19", cases: 39 },
      ...dailyCases,
    ],
    priorities: priorityMix.map((item, index) => ({
      ...item,
      value: [69, 167, 205][index],
    })),
    verdicts: verdictMix.map((item, index) => ({
      ...item,
      value: [51, 119, 231, 40][index],
    })),
    needsYou: "146",
    running: "3",
    closed: "88",
    saved: "238",
    median: "20",
    improvement: "4",
  },
};
