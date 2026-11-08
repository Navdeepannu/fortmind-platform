import type { SecurityCase } from "@/lib/preview-data";
import { queueStatus, queueVerdict } from "@/lib/case-queue-presentation";
import { SemanticBadge, VerdictBadge } from "./semantic";

export function QueueVerdictBadge({ item }: { item: SecurityCase }) {
  return (
    <VerdictBadge
      value={item.verdict}
      score={queueVerdict(item).score}
      compact
    />
  );
}

export function QueueStatusIndicator({ item }: { item: SecurityCase }) {
  const status = queueStatus(item);
  return (
    <span
      data-ui="queue-status"
      className="inline-flex flex-col items-start gap-px max-w-full"
      data-queue-status={item.status}
    >
      <SemanticBadge
        definition={status.definition}
        compact
        treatment={status.treatment}
        label={
          <span data-ui="status-label" className="whitespace-nowrap">
            {status.label}
          </span>
        }
      />
      {status.description && (
        <span
          data-ui="queue-outcome"
          title={status.description}
          className="max-w-full truncate text-muted-foreground text-caption"
        >
          {status.description}
        </span>
      )}
    </span>
  );
}
