import {
  ArrowUpRight,
  ArrowUpFromLine,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronUp,
  ChevronsUp,
  Circle,
  CircleAlert,
  CircleHelp,
  CircleX,
  Clock3,
  ClockAlert,
  FileClock,
  Hand,
  KeyRound,
  Lightbulb,
  LoaderCircle,
  Minus,
  OctagonAlert,
  Plug,
  PlugZap,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  ShieldX,
  SkipForward,
  Sparkles,
  TriangleAlert,
  UserRound,
  UserRoundCheck,
  UsersRound,
  X,
  createLucideIcon,
  type LucideIcon,
} from "lucide-react";
import type { CaseStatus, Priority, Tone, Verdict } from "./preview-data";

// User-supplied geometry, wrapped once with the same props/ref behavior as Lucide.
export const HandAlertIcon = createLucideIcon("HandAlert", [
  [
    "path",
    {
      d: "M10 6C10 5.46957 9.78929 4.96086 9.41421 4.58579C9.03914 4.21071 8.53043 4 8 4C7.46957 4 6.96086 4.21071 6.58579 4.58579C6.21071 4.96086 6 5.46957 6 6V14",
      key: "finger-left",
    },
  ],
  [
    "path",
    {
      d: "M14 10V4C14 3.46957 13.7893 2.96086 13.4142 2.58579C13.0391 2.21071 12.5304 2 12 2C11.4696 2 10.9609 2.21071 10.5858 2.58579C10.2107 2.96086 10 3.46957 10 4V10.5",
      key: "finger-center",
    },
  ],
  [
    "path",
    {
      d: "M18 11V6C18 5.46957 17.7893 4.96086 17.4142 4.58579C17.0391 4.21071 16.5304 4 16 4C15.4696 4 14.9609 4.21071 14.5858 4.58579C14.2107 4.96086 14 5.46957 14 6",
      key: "finger-right",
    },
  ],
  [
    "path",
    {
      d: "M18 8C18 7.46957 18.2107 6.96086 18.5858 6.58579C18.9609 6.21071 19.4696 6 20 6C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V10",
      key: "finger-outer",
    },
  ],
  [
    "path",
    {
      d: "M18.1651 20.83C16.9106 21.5951 15.4695 21.9999 14.0001 22H12.0001C9.2001 22 7.5001 21.14 6.0101 19.66L2.4101 16.06C2.06604 15.6789 1.88169 15.1802 1.89523 14.6669C1.90876 14.1537 2.11915 13.6653 2.48282 13.303C2.8465 12.9406 3.3356 12.7319 3.84888 12.7202C4.36215 12.7085 4.86027 12.8946 5.2401 13.24L7.0001 15",
      key: "palm",
    },
  ],
  ["path", { d: "M21.9902 14V18", key: "alert-stem" }],
  ["path", { d: "M21.9902 22H22.0002", key: "alert-dot" }],
]);

export interface SemanticState {
  label: string;
  tone: Tone;
  icon: LucideIcon;
  iconName: string;
  meaning: string;
  color: string;
}
function state(
  label: string,
  tone: Tone,
  icon: LucideIcon,
  iconName: string,
  meaning: string,
): SemanticState {
  return {
    label,
    tone,
    icon,
    iconName,
    meaning,
    color: `var(--semantic-${tone})`,
  };
}

// The sole product vocabulary. Charts, badges, metrics and the reference consume these definitions.
export const verdictStates = {
  Malicious: state(
    "Malicious",
    "danger",
    ShieldX,
    "shield-x",
    "Evidence supports malicious activity.",
  ),
  Suspicious: state(
    "Suspicious",
    "warning",
    ShieldAlert,
    "shield-alert",
    "Activity warrants further analyst assessment.",
  ),
  Benign: state(
    "Benign",
    "positive",
    ShieldCheck,
    "shield-check",
    "Evidence supports legitimate or expected activity.",
  ),
  Inconclusive: state(
    "Inconclusive",
    "neutral",
    ShieldQuestion,
    "shield-question",
    "Evidence does not establish a verdict; this is not a severity level.",
  ),
} satisfies Record<Verdict, SemanticState>;
export const priorityStates = {
  Urgent: state(
    "Urgent",
    "danger",
    ChevronsUp,
    "chevrons-up",
    "Requires the most immediate review, independently of verdict.",
  ),
  Notable: state(
    "Notable",
    "warning",
    ChevronUp,
    "chevron-up",
    "Requires prioritized review, independently of verdict.",
  ),
  Informational: state(
    "Informational",
    "neutral",
    Minus,
    "minus",
    "Informational urgency; no positive or negative assessment is implied.",
  ),
} satisfies Record<Priority, SemanticState>;
export const lifecycleStates = {
  "Needs you": state(
    "Needs you",
    "warning",
    Hand,
    "hand",
    "An analyst decision or intervention is required.",
  ),
  Running: state(
    "Running",
    "information",
    LoaderCircle,
    "loader-circle",
    "The investigation is actively processing.",
  ),
  Closed: state(
    "Closed",
    "neutral",
    CheckCircle2,
    "check-circle-2",
    "The workflow is closed; this does not imply a benign verdict.",
  ),
  Failed: state(
    "Failed",
    "failure",
    CircleX,
    "circle-x",
    "Investigation processing failed; this is not a malicious verdict.",
  ),
  Queued: state(
    "Queued",
    "neutral",
    Clock3,
    "clock-3",
    "The investigation is waiting to start.",
  ),
};
export const outcomeStates = {
  "Closed by OSCAR": state(
    "Closed by OSCAR",
    "agent",
    CheckCheck,
    "check-check",
    "A closed case with autonomous OSCAR attribution; not a separate backend lifecycle.",
  ),
  Escalated: state(
    "Escalated",
    "warning",
    ArrowUpRight,
    "arrow-up-right",
    "The case was referred for further attention.",
  ),
  "Investigation complete": state(
    "Investigation complete",
    "neutral",
    Check,
    "check",
    "The investigation finished; the case may still require an analyst decision.",
  ),
  "Human review required": state(
    "Human review required",
    "warning",
    UserRoundCheck,
    "user-round-check",
    "An analyst must review the assessment before a decision is made.",
  ),
  Unresolved: state(
    "Unresolved",
    "neutral",
    CircleHelp,
    "circle-help",
    "A question remains open; no severity or adverse verdict is implied.",
  ),
};
// Preserve the existing CaseStatus vocabulary, including legacy Escalated records.
export const workflowStates = {
  ...lifecycleStates,
  "Closed by OSCAR": outcomeStates["Closed by OSCAR"],
  Escalated: outcomeStates.Escalated,
} satisfies Record<CaseStatus | "Closed by OSCAR", SemanticState>;

// Queue-only presentation: lifecycle/outcome meanings elsewhere remain unchanged.
export const queueStatusStates = {
  ...workflowStates,
  "Needs you": {
    ...lifecycleStates["Needs you"],
    label: "Needs You",
    icon: HandAlertIcon,
    iconName: "hand-alert",
  },
  Escalated: {
    ...outcomeStates.Escalated,
    icon: ArrowUpFromLine,
    iconName: "arrow-up-from-line",
    tone: "escalation",
    color: "var(--oscar)",
  },
  Closed: {
    ...lifecycleStates.Closed,
    tone: "positive",
    color: "var(--success)",
  },
  "Closed by OSCAR": {
    ...outcomeStates["Closed by OSCAR"],
    icon: Sparkles,
    iconName: "sparkles",
    tone: "positive",
    color: "var(--success)",
  },
} satisfies Record<CaseStatus | "Closed by OSCAR", SemanticState>;

export const severityStates = {
  Critical: state(
    "Critical",
    "danger",
    OctagonAlert,
    "octagon-alert",
    "Critical finding severity; independent of the case verdict and confidence.",
  ),
  High: state(
    "High",
    "warning",
    TriangleAlert,
    "triangle-alert",
    "High finding severity; independent of the case verdict and confidence.",
  ),
  Low: state(
    "Low",
    "neutral",
    Circle,
    "circle",
    "Low finding severity; this does not establish a benign verdict.",
  ),
};
export const confidenceStates = {
  Low: {
    label: "Low",
    tone: "neutral",
    activeBars: 1,
    meaning:
      "Low investigation confidence; no safe or malicious assessment is implied.",
  },
  Medium: {
    label: "Medium",
    tone: "neutral",
    activeBars: 2,
    meaning:
      "Medium investigation confidence; no safe or malicious assessment is implied.",
  },
  High: {
    label: "High",
    tone: "neutral",
    activeBars: 3,
    meaning:
      "High investigation confidence; no safe or malicious assessment is implied.",
  },
} as const;
export const oscarStates = {
  OSCAR: state(
    "OSCAR",
    "agent",
    Sparkles,
    "sparkles",
    "OSCAR attribution identifies automated provenance, not a security verdict.",
  ),
};
export const evidenceStates = {
  OK: state(
    "OK",
    "positive",
    Check,
    "check",
    "Evidence collection completed successfully.",
  ),
  Error: state(
    "Error",
    "failure",
    CircleX,
    "circle-x",
    "Evidence collection encountered a processing error.",
  ),
  "Timed out": state(
    "Timed out",
    "warning",
    ClockAlert,
    "clock-alert",
    "Evidence collection exceeded its time limit and needs attention.",
  ),
  Skipped: state(
    "Skipped",
    "neutral",
    SkipForward,
    "skip-forward",
    "Collection was intentionally omitted; no failure or success is implied.",
  ),
};
export const actionStates = {
  Proposed: state(
    "Proposed",
    "neutral",
    FileClock,
    "file-clock",
    "An action has been drafted and awaits a decision.",
  ),
  Approved: state(
    "Approved",
    "positive",
    Check,
    "check",
    "An action has been authorized.",
  ),
  Rejected: state(
    "Rejected",
    "neutral",
    X,
    "x",
    "The proposed action was declined; this is a decision, not a processing error.",
  ),
  Done: state(
    "Done",
    "positive",
    CheckCheck,
    "check-check",
    "The action completed successfully.",
  ),
  Pending: state(
    "Pending",
    "neutral",
    Clock3,
    "clock-3",
    "An action is awaiting execution or completion.",
  ),
};
export const integrationStates = {
  Connected: state(
    "Connected",
    "positive",
    PlugZap,
    "plug-zap",
    "The integration connection is established.",
  ),
  "Not connected": state(
    "Not connected",
    "neutral",
    Plug,
    "plug",
    "No connection is configured or established; no error is implied.",
  ),
  Testing: state(
    "Testing",
    "information",
    LoaderCircle,
    "loader-circle",
    "Connection validation is in progress.",
  ),
  Error: state(
    "Error",
    "failure",
    CircleAlert,
    "circle-alert",
    "The integration encountered a system or connection error.",
  ),
  "Key expired": state(
    "Key expired",
    "warning",
    KeyRound,
    "key-round",
    "The credential has expired and requires attention.",
  ),
  "Key accepted": state(
    "Key accepted",
    "positive",
    KeyRound,
    "key-round",
    "The supplied credential was accepted.",
  ),
};
export const hypothesisStates = {
  Confirmed: state(
    "Confirmed",
    "positive",
    Check,
    "check",
    "Evidence supports the hypothesis; this does not imply a benign verdict.",
  ),
  Refuted: state(
    "Refuted",
    "neutral",
    X,
    "x",
    "Evidence does not support the hypothesis; refutation is not a failure.",
  ),
  Inconclusive: state(
    "Inconclusive",
    "neutral",
    CircleHelp,
    "circle-help",
    "Available evidence cannot confirm or refute the hypothesis.",
  ),
  Primary: state(
    "Primary",
    "agent",
    Sparkles,
    "sparkles",
    "OSCAR's primary investigation hypothesis.",
  ),
};
export const assignmentStates = {
  Anyone: state(
    "Anyone",
    "neutral",
    UsersRound,
    "users-round",
    "Include cases regardless of assignment.",
  ),
  "Assigned to me": state(
    "Assigned to me",
    "neutral",
    UserRoundCheck,
    "user-round-check",
    "Cases assigned to the current analyst.",
  ),
  Unassigned: state(
    "Unassigned",
    "neutral",
    UserRound,
    "user-round",
    "No analyst owns the case; this is not a security severity.",
  ),
  "Other assigned users": state(
    "Other assigned users",
    "neutral",
    UserRound,
    "user-round",
    "Cases assigned to other analysts.",
  ),
};
export const phaseStates = {
  completed: state(
    "Completed",
    "neutral",
    Check,
    "check",
    "This investigation phase has completed.",
  ),
  active: state(
    "Active",
    "information",
    LoaderCircle,
    "loader-circle",
    "This investigation phase is processing.",
  ),
  pending: state(
    "Pending",
    "neutral",
    Circle,
    "circle",
    "This investigation phase has not started.",
  ),
  failed: state(
    "Failed",
    "failure",
    CircleX,
    "circle-x",
    "This phase encountered a processing failure.",
  ),
};
export const actionKinds = {
  Containment: state(
    "Containment",
    "neutral",
    Shield,
    "shield",
    "An action intended to limit exposure; no approval or outcome is implied.",
  ),
  Recommended: state(
    "Recommended",
    "neutral",
    Lightbulb,
    "lightbulb",
    "A suggested action; no approval or outcome is implied.",
  ),
};
export const semanticCatalog = {
  Verdicts: verdictStates,
  Priorities: priorityStates,
  Workflow: lifecycleStates,
  Outcomes: outcomeStates,
  Severity: severityStates,
  OSCAR: oscarStates,
  Evidence: evidenceStates,
  Actions: actionStates,
  Integrations: integrationStates,
  Hypotheses: hypothesisStates,
  Assignment: assignmentStates,
  Phases: phaseStates,
  "Action kinds": actionKinds,
};
export const referenceStates = [
  { title: "Evidence", items: Object.values(evidenceStates) },
  { title: "Actions", items: Object.values(actionStates) },
  { title: "Integrations", items: Object.values(integrationStates) },
  { title: "Hypotheses", items: Object.values(hypothesisStates) },
];
