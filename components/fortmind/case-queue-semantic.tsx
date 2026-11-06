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
        <span
          data-ui="verdict-label"
          className="min-w-0 whitespace-nowrap tabular-nums leading-3.5"
        >
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
    <span
      data-ui="queue-status"
      className="inline-flex flex-col items-start gap-px max-w-full"
      data-queue-status={item.status}
    >
      <SemanticBadge
        definition={status.definition}
        compact
        showIcon={false}
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
          className="max-w-full truncate text-muted-foreground text-caption leading-3.75"
        >
          {status.description}
        </span>
      )}
    </span>
  );
}
