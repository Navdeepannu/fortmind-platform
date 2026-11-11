import type { CaseStatus, ConfidenceLevel, Priority, Verdict } from "@/lib/preview-data";
import { casePreviewId } from "./case-preview-id";
import type { phaseStates } from "@/lib/semantic-states";

export interface OverviewEntity {
  id: string;
  kind: "user" | "host" | "process";
  name: string;
  role: string;
  findingCount?: number;
  otherCaseCount?: number;
  sources: string[];
  // Preserve source terminology without interpreting involvement as compromise.
  sourceClassification?: "Confirmed affected";
}

export interface OverviewFinding {
  id: string;
  title: string;
  summary: string;
  severity?: "Critical" | "High" | "Low";
  evidenceState: "Alert report · unverified" | "Tool result" | "Missing corroboration";
  relationship: "Supports concern" | "Context · unresolved" | "Limits corroboration";
  provenance: string;
  detail: string;
}

export interface RelatedCaseSummary {
  id: string;
  caseId?: string;
  href?: string;
  title: string;
  sharedEntity: string;
  receivedAt: string;
  receivedLabel: string;
  verdict: Verdict;
  status: CaseStatus;
}

export interface CaseOverviewData {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: CaseStatus;
  owner: string | null;
  proposedVerdict: Verdict;
  assessment: string;
  reviewReason: string;
  decisionSummary: string;
  unresolved: { question: string; resolution: string }[];
  investigation: {
    receivedAt: string;
    concludedAt: string;
    dateLabel: string;
    receivedLabel: string;
    concludedLabel: string;
    durationLabel: string;
    phases: { name: "Intake" | "Plan" | "Collect" | "Analyze" | "Report"; state: keyof typeof phaseStates }[];
    confidence: { phase: "Plan" | "Analyze" | "Report"; value: number; level: ConfidenceLevel }[];
  };
  technique: { id: string; name: string; tactic: string };
  entities: OverviewEntity[];
  findings: OverviewFinding[];
  relatedCases: RelatedCaseSummary[];
  nextSteps: string[];
  source: string;
  hypotheses: {
    title: string;
    score?: number;
    level?: ConfidenceLevel;
    result: string;
    explanation: string;
    supportingEvidence?: string;
    limitations?: string;
  }[];
  actions: { title: string; condition?: string }[];
  evidence: { source: string; result: string; context: string }[];
  activity: { actor: string; event: string; time: string }[];
}

// Screenshot-derived fixture, reconstructed immediately before the captured
// analyst confirmation. The owner follows the latest "Took this case" event.
// No live case service, mutation, invented process arguments, IPs, or raw responses.
export const caseOverview: CaseOverviewData = {
  id: casePreviewId,
  title: "FortMind smoke: LSASS memory access",
  description: "A SIEM alert reports procdump.exe attempting to access lsass.exe memory on fmlab-ws1 under lab.bob.",
  priority: "Urgent",
  status: "Needs you",
  owner: "navdeepannu0",
  proposedVerdict: "Suspicious",
  assessment: "The activity could be authorized testing, but authorization has not been verified. The reported LSASS access and six active host alerts warrant review; testing tags alone do not establish that the activity is safe.",
  reviewReason: "OSCAR’s Analyze and Report confidence fell below the autonomy threshold. The memory-access claim rests on the alert alone.",
  decisionSummary: "Analyze and Report confidence is below the autonomy threshold; the reported memory access was not independently confirmed.",
  unresolved: [
    {
      question: "Was this an authorized test?",
      resolution: "Confirm procdump.exe execution with the penetration testing or emulation team. The alert’s synthetic-testing tags are untrusted metadata.",
    },
    {
      question: "Can endpoint telemetry corroborate the alert?",
      resolution: "Review local endpoint logs or EDR telemetry for the process command line and memory-access activity. No tool independently confirmed it in this investigation.",
    },
  ],
  investigation: {
    receivedAt: "2026-11-03T05:57:00-05:00",
    concludedAt: "2026-11-03T05:58:00-05:00",
    dateLabel: "Nov 3, 2026",
    receivedLabel: "05:57 EST",
    concludedLabel: "05:58 EST",
    // The original UI reports 2 min; timestamps have only minute precision.
    durationLabel: "2 min reported",
    phases: [
      { name: "Intake", state: "completed" },
      { name: "Plan", state: "completed" },
      { name: "Collect", state: "completed" },
      { name: "Analyze", state: "completed" },
      { name: "Report", state: "completed" },
    ],
    confidence: [
      { phase: "Plan", value: 90, level: "High" },
      { phase: "Analyze", value: 70, level: "Medium" },
      { phase: "Report", value: 70, level: "Medium" },
    ],
  },
  technique: {
    id: "T1003.001",
    name: "OS Credential Dumping: LSASS Memory",
    tactic: "Credential Access",
  },
  entities: [
    { id: "host-fmlab-ws1", kind: "host", name: "fmlab-ws1", role: "Host named in the alert", findingCount: 2, otherCaseCount: 2, sources: ["Wazuh", "Elasticsearch"], sourceClassification: "Confirmed affected" },
    { id: "user-lab-bob", kind: "user", name: "lab.bob", role: "User named in the alert", findingCount: 2, otherCaseCount: 0, sources: ["Wazuh", "Elasticsearch", "Entra ID"], sourceClassification: "Confirmed affected" },
    { id: "process-procdump", kind: "process", name: "procdump.exe", role: "Reported initiating process", sources: ["SIEM alert"] },
    { id: "process-lsass", kind: "process", name: "lsass.exe", role: "Reported memory-access target", sources: ["SIEM alert"] },
  ],
  findings: [
    {
      id: "memory-access",
      title: "LSASS memory access reported",
      summary: "procdump.exe → lsass.exe, under lab.bob on fmlab-ws1.",
      severity: "Critical",
      evidenceState: "Alert report · unverified",
      relationship: "Supports concern",
      provenance: "SIEM alert · not independently confirmed",
      detail: "No sources were queried for this finding. The alert reports the attempt; process execution and memory access were not independently verified.",
    },
    {
      id: "host-alerts",
      title: "Six active security alerts on the host",
      summary: "OSCAR reports six active alerts for fmlab-ws1 in Elasticsearch.",
      severity: "High",
      evidenceState: "Tool result",
      relationship: "Supports concern",
      provenance: "Elasticsearch · 1 host query",
      detail: "OSCAR recommends investigating the other five alerts to assess wider compromise. Their contents and relation to this activity have not been established; the alert count alone does not confirm compromise.",
    },
    {
      id: "user-alerts",
      title: "One matching security alert for lab.bob",
      summary: "Elasticsearch returned one hit for the user lookup; its contents are not shown in the source capture.",
      severity: "Low",
      evidenceState: "Tool result",
      relationship: "Context · unresolved",
      provenance: "Elasticsearch · 1 user query",
      detail: "The matching record cannot be assessed for relevance to this memory-access alert from the available response summary. The hit count alone does not establish account compromise.",
    },
    {
      id: "wazuh-alerts",
      title: "No recent Wazuh alerts matched",
      summary: "Host and user lookups returned no recent Wazuh alerts.",
      severity: "Low",
      evidenceState: "Missing corroboration",
      relationship: "Limits corroboration",
      provenance: "Wazuh · 2 queries",
      detail: "The captured Wazuh response summaries report no alerts for fmlab-ws1 or lab.bob in the queried window. Empty results do not verify that the reported endpoint activity was benign.",
    },
    {
      id: "entra-signins",
      title: "No Entra ID sign-ins matched",
      summary: "The Entra ID user lookup returned zero matching sign-ins for lab.bob.",
      severity: "Low",
      evidenceState: "Missing corroboration",
      relationship: "Limits corroboration",
      provenance: "Entra ID · 1 query",
      detail: "No sign-ins matched the query in the captured response. This provides no direct evidence of account compromise, but does not rule out endpoint activity or establish an authorized test.",
    },
  ],
  relatedCases: [
    { id: "related-powershell", title: "Powershell.exe spawned a powershell process which executed a base64 encoded command", sharedEntity: "fmlab-ws1", receivedAt: "2026-10-21T11:33:00-04:00", receivedLabel: "Oct 21 · 11:33 EDT", verdict: "Suspicious", status: "Needs you" },
    { id: "related-startup", title: "Possible addition of new item to Windows startup registry", sharedEntity: "fmlab-ws1", receivedAt: "2026-10-21T11:31:00-04:00", receivedLabel: "Oct 21 · 11:31 EDT", verdict: "Suspicious", status: "Needs you" },
  ],
  nextSteps: [
    "Confirm authorization with the testing or emulation team.",
    "Review the other five host alerts and endpoint telemetry.",
    "If the activity is unauthorized, consider the recommended host isolation.",
  ],
  source: "SIEM security alert",
  hypotheses: [
    {
      title: "Authorized adversary emulation or synthetic smoke testing activity",
      score: 40,
      level: "Medium",
      result: "Inconclusive",
      explanation: "Alert metadata suggests synthetic testing, but these fields are untrusted and no external authorization source was found in the logs.",
      supportingEvidence: "Alert metadata suggests synthetic testing.",
      limitations: "These fields are untrusted and no external authorization source was found in the logs.",
    },
    {
      title: "Compromised local user executing procdump.exe for LSASS credential dumping",
      score: 75,
      level: "Medium",
      result: "Inconclusive",
      explanation: "The reported LSASS access and six active host alerts support concern, but Entra logs supplied no direct evidence of account compromise.",
      supportingEvidence: "The reported LSASS access and six active host alerts support concern.",
      limitations: "Entra logs supplied no direct evidence of account compromise.",
    },
  ],
  actions: [
    { title: "Confirm authorization with the penetration testing or emulation team regarding procdump.exe execution on fmlab-ws1." },
    { title: "Isolate host fmlab-ws1", condition: "If the activity is determined to be unauthorized." },
    { title: "Investigate the other five active security alerts identified on fmlab-ws1 to rule out wider compromise." },
    { title: "Review local endpoint logs or EDR telemetry to inspect command-line arguments and memory-access activity." },
  ],
  evidence: [
    { source: "Wazuh", result: "No recent alerts for host fmlab-ws1 in the queried window.", context: "Host lookup" },
    { source: "Elasticsearch", result: "Six active security alert hits for fmlab-ws1.", context: "Host lookup" },
    { source: "Wazuh", result: "No recent alerts for user lab.bob in the queried window.", context: "User lookup" },
    { source: "Elasticsearch", result: "One security alert hit for lab.bob; record contents were not supplied.", context: "User lookup" },
    { source: "Entra ID", result: "Zero matching sign-ins for lab.bob.", context: "User lookup" },
  ],
  activity: [
    { actor: "navdeepannu0", event: "Verdict confirmed", time: "Nov 3, 2026 · 09:36 EST" },
    { actor: "navdeepannu0", event: "Took this case", time: "Nov 3, 2026 · 09:36 EST" },
    { actor: "navdeepannu0", event: "Unassigned this case", time: "Nov 3, 2026 · 09:36 EST" },
    { actor: "navdeepannu0", event: "Took this case", time: "Nov 3, 2026 · 09:36 EST" },
    { actor: "OSCAR", event: "Reached a conclusion", time: "Nov 3, 2026 · 05:58 EST" },
    { actor: "OSCAR", event: "Flagged this case for review", time: "Nov 3, 2026 · 05:58 EST" },
    { actor: "OSCAR", event: "Completed the Report phase", time: "Nov 3, 2026 · 05:58 EST" },
    { actor: "OSCAR", event: "Started the Report phase", time: "Nov 3, 2026 · 05:58 EST" },
    { actor: "OSCAR", event: "Completed the Analyze phase", time: "Nov 3, 2026 · 05:58 EST" },
    { actor: "OSCAR", event: "Started the Analyze phase", time: "Nov 3, 2026 · 05:57 EST" },
    { actor: "OSCAR", event: "Completed the Collect phase", time: "Nov 3, 2026 · 05:57 EST" },
    { actor: "OSCAR", event: "Started the Collect phase", time: "Nov 3, 2026 · 05:57 EST" },
  ],
};

export interface PreviewVerdictReview {
  verdict: Verdict;
  rationale: string;
  originalVerdict: Verdict;
}
