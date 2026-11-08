"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  caseTimestamp,
  entityLabels,
  relativeCaseAge,
  usefulEntities,
} from "@/lib/case-context";
import { queueStatus, queueVerdict } from "@/lib/case-queue-presentation";
import { priorityStates } from "@/lib/semantic-states";
import { formatAge, type SecurityCase } from "@/lib/preview-data";
import { CopyTechnicalValue } from "./copy-technical-value";

const hintClass =
  "flex w-80 max-w-(--available-width) flex-col items-start gap-2 rounded-sm p-3 text-label data-open:animate-none data-closed:animate-none";
const focusClass =
  "inline-flex max-w-full rounded-xs outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function IconTooltip({
  label,
  children,
}: {
  label: string;
  children: ReactElement;
}) {
  return (
    <Tooltip>
      <TooltipTrigger delay={500} render={children} />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function CaseHint({
  children,
  content,
  kind,
}: {
  children: ReactNode;
  content: ReactNode;
  kind: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        delay={500}
        closeDelay={100}
        render={
          <span tabIndex={0} className={focusClass} data-ui={`${kind}-hint`} />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent
        data-ui={`${kind}-tooltip`}
        showArrow={false}
        className={hintClass}
        side="top"
        align="start"
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

export function CaseTitleTooltip({
  title,
  children,
}: {
  title: string;
  children: ReactElement;
}) {
  const ref = useRef<HTMLElement>(null);
  const [truncated, setTruncated] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let active = true;
    const measure = () => {
      if (active) setTruncated(element.scrollWidth > element.clientWidth + 1);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    void document.fonts.ready.then(measure);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [title]);
  return (
    <Tooltip disabled={!truncated}>
      <TooltipTrigger
        ref={(node) => {
          ref.current = node;
        }}
        delay={500}
        render={children}
      />
      <TooltipContent
        data-ui="case-title-tooltip"
        showArrow={false}
        className={hintClass}
        side="top"
        align="start"
      >
        {title}
      </TooltipContent>
    </Tooltip>
  );
}

function MetadataFields({
  item,
  copy = false,
}: {
  item: SecurityCase;
  copy?: boolean;
}) {
  const entities = usefulEntities(item);
  const order = [
    "hostname",
    "user",
    "process",
    "ip",
    "domain",
    "file",
    "command",
    "hash",
  ];
  const sorted = [...entities].sort(
    (a, b) => order.indexOf(a[0]) - order.indexOf(b[0]),
  );
  const rows = [
    ["Case ID", item.id],
    ["Source", item.source],
    ...sorted
      .slice(0, copy ? 8 : 4)
      .map(([key, value]) => [entityLabels[key], value]),
  ];
  return (
    <>
      <dl className="flex min-w-0 flex-col gap-2.5">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid min-w-0 grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-3"
          >
            <dt className="text-caption text-muted-foreground">{label}</dt>
            <dd className="min-w-0 text-caption wrap-anywhere">
              {copy ? (
                <CopyTechnicalValue label={label.toLowerCase()} value={value} technical={label !== "Source" && label !== "Owner"} />
              ) : (
                <span className={label === "Source" ? undefined : "font-mono"}>
                  {value}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
      {!copy && sorted.length > 4 && (
        <p className="mt-3 text-caption text-muted-foreground">
          {sorted.length - 4} more context values
        </p>
      )}
    </>
  );
}

export function CaseMetadataPreview({
  item,
  children,
}: {
  item: SecurityCase;
  children: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  return (
    <Popover
      open={pinned}
      onOpenChange={(open) => {
        setPinned(open);
        if (open) setHovered(false);
      }}
    >
      <HoverCard open={hovered && !pinned} onOpenChange={setHovered}>
        <PopoverTrigger
          render={
            <HoverCardTrigger
              delay={500}
              closeDelay={150}
              render={
                <button
                  type="button"
                  data-ui="case-metadata-trigger"
                  aria-label={`View context for ${item.id}`}
                  className="flex min-w-0 max-w-full flex-1 items-baseline gap-1.5 overflow-hidden rounded-xs text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              }
            />
          }
        >
          {children}
        </PopoverTrigger>
        <HoverCardContent
          data-ui="case-metadata-hover"
          align="start"
          side="bottom"
          sideOffset={8}
          onClick={(event) => event.stopPropagation()}
        >
          <MetadataFields item={item} />
          <p className="mt-3 border-t pt-2 text-caption text-muted-foreground">
            Click for copyable values
          </p>
        </HoverCardContent>
      </HoverCard>
      <PopoverContent
        ref={popoverRef}
        initialFocus={popoverRef}
        data-ui="case-metadata-popover"
        align="start"
        sideOffset={8}
        className="w-84 max-w-(--available-width) max-h-(--available-height) overflow-y-auto rounded-sm p-3 data-open:animate-none data-closed:animate-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2">
          <PopoverTitle className="text-label">Case context</PopoverTitle>
          <IconTooltip label="Close case context">
            <Button
              size="icon-xs"
              variant="ghost"
              aria-label="Close case context"
              onClick={() => setPinned(false)}
            >
              <X />
            </Button>
          </IconTooltip>
        </div>
        <MetadataFields item={item} copy />
      </PopoverContent>
    </Popover>
  );
}

export function CaseVerdictTooltip({
  item,
  children,
}: {
  item: SecurityCase;
  children: ReactNode;
}) {
  const verdict = queueVerdict(item);
  return (
    <CaseHint
      kind="verdict"
      content={
        <>
          <strong className="font-medium">{verdict.definition.label}</strong>
          <p className="text-muted-foreground">{verdict.definition.meaning}</p>
          {verdict.score !== undefined && (
            <p className="text-caption text-muted-foreground">
              Verdict score{" "}
              <span className="tabular-nums text-foreground">
                {verdict.score}/100
              </span>
            </p>
          )}
        </>
      }
    >
      {children}
    </CaseHint>
  );
}

export function CasePriorityTooltip({
  item,
  children,
}: {
  item: SecurityCase;
  children: ReactNode;
}) {
  const priority = priorityStates[item.priority];
  return (
    <CaseHint
      kind="priority"
      content={
        <>
          <strong className="font-medium">{priority.label}</strong>
          <p className="text-muted-foreground">{priority.meaning}</p>
        </>
      }
    >
      {children}
    </CaseHint>
  );
}

export function CaseWorkflowTooltip({
  item,
  children,
}: {
  item: SecurityCase;
  children: ReactNode;
}) {
  const status = queueStatus(item);
  return (
    <CaseHint
      kind="workflow"
      content={
        <>
          <strong className="font-medium">{status.label}</strong>
          <p className="text-muted-foreground">{status.definition.meaning}</p>
          {status.description && (
            <p className="text-muted-foreground">{status.description}</p>
          )}
          {item.status === "Closed" ? (
            <p>No analyst decision is pending.</p>
          ) : (
            item.recommendedNextAction?.trim() && (
              <p>{item.recommendedNextAction}</p>
            )
          )}
        </>
      }
    >
      {children}
    </CaseHint>
  );
}

export function CaseTimestampTooltip({
  ageMinutes,
  timestamp,
}: {
  ageMinutes: number;
  timestamp?: string;
}) {
  const exact = caseTimestamp(timestamp);
  return (
    <CaseHint
      kind="timestamp"
      content={
        <>
          {exact && (
            <>
              <time dateTime={exact.iso} className="font-medium">
                {exact.date}
              </time>
              <span>{exact.time}</span>
            </>
          )}
          <span className="text-muted-foreground">
            {relativeCaseAge(ageMinutes)}
          </span>
        </>
      }
    >
      <span className="text-caption font-normal text-muted-foreground tabular-nums">
        {formatAge(ageMinutes)}
      </span>
    </CaseHint>
  );
}
