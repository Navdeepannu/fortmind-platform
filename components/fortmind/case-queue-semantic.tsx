import type { SecurityCase } from "@/lib/preview-data";
import { queueStatus, queueVerdict } from "@/lib/case-queue-presentation";
import { SemanticBadge } from "./semantic";

export function QueueVerdictBadge({ item }: { item: SecurityCase }) {
  const verdict = queueVerdict(item);
  return (
    <SemanticBadge
      definition={verdict.definition}
      compact
      label={
        <span className="min-w-0 whitespace-nowrap tabular-nums leading-3.5">
          {verdict.definition.label}
          {verdict.score !== undefined && <> · {verdict.score}/100</>}
        </span>
      }
    />
  );
}

export function QueueStatusIndicator({ item }: { item: SecurityCase }) {
  const status = queueStatus(item);
  return (
    <span data-ui="queue-status" className="inline-flex flex-col items-start gap-px max-w-full" data-queue-status={item.status}>
      <SemanticBadge
        definition={status.definition}
        compact
        treatment={status.treatment}
        label={status.label}
      />
      {status.description && <span data-ui="queue-outcome" className="max-w-full text-muted-foreground text-[11px] leading-3.75 wrap-anywhere">{status.description}</span>}
    </span>
  );
}
