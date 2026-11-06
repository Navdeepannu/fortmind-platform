import type { Tone } from "./preview-data";

// Complete class strings keep runtime states discoverable by Tailwind.
// The product vocabulary stays independent of the canonical palette names.
const danger = {
  foreground: "text-danger-foreground",
  icon: "[&>svg]:text-danger-foreground",
  solidIcon: "[&>svg]:text-danger",
  badge: "border-danger-border bg-danger-muted text-danger-foreground",
  solid: "border-danger bg-danger text-danger-solid-foreground",
  interactive: "hover:bg-danger-accent",
  color: "var(--semantic-danger)",
} as const;
const warning = {
  foreground: "text-warning-foreground",
  icon: "[&>svg]:text-warning-foreground",
  solidIcon: "[&>svg]:text-warning",
  badge: "border-warning-border bg-warning-muted text-warning-foreground",
  solid: "border-warning bg-warning text-warning-solid-foreground",
  interactive: "hover:bg-warning-accent",
  color: "var(--semantic-warning)",
} as const;
const success = {
  foreground: "text-success-foreground",
  icon: "[&>svg]:text-success-foreground",
  solidIcon: "[&>svg]:text-success",
  badge: "border-success-border bg-success-muted text-success-foreground",
  solid: "border-success bg-success text-success-solid-foreground",
  interactive: "hover:bg-success-accent",
  color: "var(--semantic-positive)",
} as const;
const info = {
  foreground: "text-info-foreground",
  icon: "[&>svg]:text-info-foreground",
  solidIcon: "[&>svg]:text-info",
  badge: "border-info-border bg-info-muted text-info-foreground",
  solid: "border-info bg-info text-info-solid-foreground",
  interactive: "hover:bg-info-accent",
  color: "var(--semantic-information)",
} as const;
const neutral = {
  foreground: "text-neutral-foreground",
  icon: "[&>svg]:text-neutral-foreground",
  solidIcon: "[&>svg]:text-neutral",
  badge: "border-neutral-border bg-neutral-muted text-neutral-foreground",
  solid: "border-neutral bg-neutral text-neutral-solid-foreground",
  interactive: "hover:bg-neutral-accent",
  color: "var(--semantic-neutral)",
} as const;
const oscar = {
  foreground: "text-oscar-foreground",
  icon: "[&>svg]:text-oscar-foreground",
  solidIcon: "[&>svg]:text-oscar",
  badge: "border-oscar-border bg-oscar-muted text-oscar-foreground",
  solid: "border-oscar bg-oscar text-oscar-solid-foreground",
  interactive: "hover:bg-oscar-accent",
  color: "var(--semantic-agent)",
} as const;

const escalation = {
  foreground: "text-escalation-foreground",
  icon: "[&>svg]:text-escalation-foreground",
  solidIcon: "[&>svg]:text-escalation",
  badge: "border-escalation-border bg-escalation-muted text-escalation-foreground",
  solid: "border-escalation bg-escalation text-escalation-solid-foreground",
  interactive: "[a]:hover:bg-escalation-accent [button]:hover:bg-escalation-accent",
  color: "var(--semantic-escalation)",
} as const;

export const semanticStyles = {
  danger, warning, positive: success, information: info, failure: danger,
  neutral, agent: oscar, escalation,
} as const satisfies Record<Tone, typeof danger | typeof warning | typeof success | typeof info | typeof neutral | typeof oscar | typeof escalation>;

export function queueIconClass(tone?: Tone, label?: string, kind?: string) {
  if (kind === "Priority" && label === "Urgent") return "text-danger-foreground dark:text-danger";
  if (!tone) return "text-muted-foreground";
  if (kind === "Verdict") return semanticStyles[tone].foreground;
  return {
    danger: "text-danger", warning: "text-warning", positive: "text-success",
    information: "text-info", failure: "text-danger", neutral: "text-neutral",
    agent: "text-oscar", escalation: "text-escalation",
  }[tone];
}
