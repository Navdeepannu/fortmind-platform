import type { Tone } from "./preview-data";

// Complete class strings keep runtime states discoverable by Tailwind.
// The product vocabulary stays independent of the canonical palette names.
const danger = {
  foreground: "text-danger-foreground",
  icon: "[&>svg]:text-danger-foreground",
  badge: "border-danger-border bg-transparent text-danger-foreground",
  muted: "bg-danger-muted",
  solid: "border-danger bg-danger text-danger-solid-foreground",
  color: "var(--semantic-danger)",
} as const;
const warning = {
  foreground: "text-warning-foreground",
  icon: "[&>svg]:text-warning-foreground",
  badge: "border-warning-border bg-transparent text-warning-foreground",
  muted: "bg-warning-muted",
  solid: "border-warning bg-warning text-warning-solid-foreground",
  color: "var(--semantic-warning)",
} as const;
const success = {
  foreground: "text-success-foreground",
  icon: "[&>svg]:text-success-foreground",
  badge: "border-success-border bg-transparent text-success-foreground",
  muted: "bg-success-muted",
  solid: "border-success bg-success text-success-solid-foreground",
  color: "var(--semantic-positive)",
} as const;
const info = {
  foreground: "text-info-foreground",
  icon: "[&>svg]:text-info-foreground",
  badge: "border-info-border bg-transparent text-info-foreground",
  muted: "bg-info-muted",
  solid: "border-info bg-info text-info-solid-foreground",
  color: "var(--semantic-information)",
} as const;
const neutral = {
  foreground: "text-neutral-foreground",
  icon: "[&>svg]:text-neutral-foreground",
  badge: "border-neutral-border bg-transparent text-neutral-foreground",
  muted: "bg-neutral-muted",
  solid: "border-neutral bg-neutral text-neutral-solid-foreground",
  color: "var(--semantic-neutral)",
} as const;
const oscar = {
  foreground: "text-oscar-foreground",
  icon: "[&>svg]:text-oscar-foreground",
  badge: "border-oscar-border bg-transparent text-oscar-foreground",
  muted: "bg-oscar-muted",
  solid: "border-oscar bg-oscar text-oscar-solid-foreground",
  color: "var(--semantic-agent)",
} as const;

const escalation = {
  foreground: "text-escalation-foreground",
  icon: "[&>svg]:text-escalation-foreground",
  badge: "border-escalation-border bg-transparent text-escalation-foreground",
  muted: "bg-escalation-muted",
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

export function queueIconClass(tone?: Tone) {
  return tone ? semanticStyles[tone].foreground : "text-muted-foreground";
}
