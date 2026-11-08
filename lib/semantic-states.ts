import {
  ArrowUpFromLine,
  Check,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Info,
  CircleCheck,
  CircleDashed,
  ShieldAlert,
  Circle,
  CircleAlert,
  CircleHelp,
  CircleX,
  Clock3,
  ClockAlert,
  FileClock,
  KeyRound,
  Lightbulb,
  LoaderCircle,
  OctagonAlert,
  Plug,
  PlugZap,
  Shield,
  SkipForward,
  ScanLine,
  Target,
  TriangleAlert,
  UserRound,
  UserRoundCheck,
  UsersRound,
  X,
  type LucideIcon,
  UserRoundPen,
} from "lucide-react";
import type { CaseStatus, Priority, Tone, Verdict } from "./preview-data";

export interface SemanticState {
  label: string;
  tone: Tone;
  icon: LucideIcon;
  iconName: string;
  meaning: string;
  color: string;
  iconClassName?: string;
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
    ShieldAlert,
    "shield-alert",
    "Evidence supports malicious activity.",
  ),
  Suspicious: state(
    "Suspicious",
    "warning",
    CircleHelp,
    "circle-help",
    "Activity warrants further analyst assessment.",
  ),
  Benign: state(
    "Benign",
    "positive",
    CircleCheck,
    "circle-check",
    "Evidence supports legitimate or expected activity.",
  ),
  Inconclusive: state(
    "Inconclusive",
    "neutral",
    CircleDashed,
    "circle-dashed",
    "Evidence does not establish a verdict; this is not a severity level.",
  ),
} satisfies Record<Verdict, SemanticState>;
export const priorityStates = {
  Urgent: state(
    "Urgent",
    "danger",
    AlertTriangle,
    "alert-triangle",
    "Requires the most immediate review, independently of verdict.",
  ),
  Notable: state(
    "Notable",
    "warning",
    Bell,
    "bell",
    "Requires prioritized review, independently of verdict.",
  ),
  Informational: state(
    "Informational",
    "information",
    Info,
    "info",
    "Informational urgency; no positive or negative assessment is implied.",
  ),
} satisfies Record<Priority, SemanticState>;
export const lifecycleStates = {
  "Needs you": {
    ...state(
      "Needs you",
      "warning",
      UserRoundPen,
      "user-round-pen",
      "An analyst decision or intervention is required.",
    ),
    iconClassName: "text-workflow-attention",
  },
  Running: {
    ...state(
      "Running",
      "information",
      CircleDashed,
      "circle-dashed",
      "The investigation is actively processing.",
    ),
    iconClassName: "text-workflow-neutral",
  },
  Closed: {
    ...state(
      "Closed",
      "positive",
      CircleCheck,
      "circle-check",
      "The workflow is closed; this does not imply a benign verdict.",
    ),
    iconClassName: "text-workflow-neutral",
  },
  Failed: {
    ...state(
      "Failed",
      "failure",
      CircleX,
      "circle-x",
      "Investigation processing failed; this is not a malicious verdict.",
    ),
    iconClassName: "text-workflow-failure",
  },
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
    "positive",
    CheckCircle2,
    "check-circle-2",
    "A closed case with autonomous OSCAR attribution; not a separate backend lifecycle.",
  ),
  Escalated: state(
    "Escalated",
    "escalation",
    ArrowUpFromLine,
    "arrow-up-from-line",
    "The case was referred for further attention.",
  ),
  "Investigation complete": state(
    "Investigation complete",
    "positive",
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

// Queue labels share the same workflow colors and Lucide glyphs as case details.
export const queueStatusStates = {
  ...workflowStates,
  "Needs you": { ...lifecycleStates["Needs you"], label: "Needs You" },
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
    ScanLine,
    "scan-line",
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
    Target,
    "target",
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
    "positive",
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
