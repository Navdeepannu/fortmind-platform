import type { Tone } from "./preview-data";

// Complete class strings keep runtime states discoverable by Tailwind.
// The product vocabulary stays independent of the canonical palette names.
const danger = {
  foreground: "text-danger-foreground",
  icon: "[&>svg]:text-danger-foreground",
  badge: "border-danger-border bg-transparent text-danger-foreground",
  solid: "border-danger bg-danger text-danger-solid-foreground",
  color: "var(--semantic-danger)",
} as const;
const warning = {
  foreground: "text-warning-foreground",
  icon: "[&>svg]:text-warning-foreground",
  badge: "border-warning-border bg-transparent text-warning-foreground",
  solid: "border-warning bg-warning text-warning-solid-foreground",
  color: "var(--semantic-warning)",
} as const;
const success = {
  foreground: "text-success-foreground",
  icon: "[&>svg]:text-success-foreground",
  badge: "border-success-border bg-transparent text-success-foreground",
  solid: "border-success bg-success text-success-solid-foreground",
  color: "var(--semantic-positive)",
} as const;
const info = {
  foreground: "text-info-foreground",
  icon: "[&>svg]:text-info-foreground",
  badge: "border-info-border bg-transparent text-info-foreground",
  solid: "border-info bg-info text-info-solid-foreground",
  color: "var(--semantic-information)",
} as const;
const neutral = {
  foreground: "text-neutral-foreground",
  icon: "[&>svg]:text-neutral-foreground",
  badge: "border-neutral-border bg-transparent text-neutral-foreground",
  solid: "border-neutral bg-neutral text-neutral-solid-foreground",
  color: "var(--semantic-neutral)",
} as const;
const oscar = {
  foreground: "text-oscar-foreground",
  icon: "[&>svg]:text-oscar-foreground",
  badge: "border-oscar-border bg-transparent text-oscar-foreground",
  solid: "border-oscar bg-oscar text-oscar-solid-foreground",
  color: "var(--semantic-agent)",
} as const;

const escalation = {
  foreground: "text-escalation-foreground",
  icon: "[&>svg]:text-escalation-foreground",
  badge: "border-escalation-border bg-transparent text-escalation-foreground",
  solid: "border-escalation bg-escalation text-escalation-solid-foreground",
  color: "var(--semantic-escalation)",
} as const;

export const semanticStyles = {
  danger,
  warning,
  positive: success,
  information: info,
  failure: danger,
  neutral,
  agent: oscar,
  escalation,
} as const satisfies Record<
  Tone,
  | typeof danger
  | typeof warning
  | typeof success
  | typeof info
  | typeof neutral
  | typeof oscar
  | typeof escalation
>;

export function queueIconClass(tone?: Tone, label?: string, kind?: string) {
  if (kind === "Priority" && label === "Urgent")
    return "text-danger-foreground";
  if (kind === "Priority" && label === "Notable")
    return "text-warning-foreground";
  if (!tone) return "text-muted-foreground";
  if (kind === "Verdict") return semanticStyles[tone].foreground;
  return {
    danger: "text-danger",
    warning: "text-warning",
    positive: "text-success",
    information: "text-info",
    failure: "text-danger",
    neutral: "text-neutral",
    agent: "text-oscar",
    escalation: "text-escalation",
  }[tone];
}
