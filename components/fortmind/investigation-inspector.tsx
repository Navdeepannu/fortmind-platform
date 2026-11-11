"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { caseHref } from "@/lib/platform-routes";
import {
  caseNextAction,
  entityLabels,
  usefulEntities,
} from "@/lib/case-context";
import type { SecurityCase } from "@/lib/preview-data";
import { QueueStatusIndicator, QueueVerdictBadge } from "./case-queue-semantic";
import { PriorityBadge } from "./semantic";
import { CopyTechnicalValue } from "./copy-technical-value";
import { IconTooltip } from "./case-contextual-preview";
import { OscarCaseLifecyclePreview } from "./overview/oscar-case-lifecycle-preview";

const narrowQuery = "(max-width: 1023px)";
function subscribe(listener: () => void) {
  const media = window.matchMedia(narrowQuery);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}
const narrowSnapshot = () => window.matchMedia(narrowQuery).matches;
const serverSnapshot = () => false;

function InspectorDetails({ item }: { item: SecurityCase }) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const [allContext, setAllContext] = useState(false);
  const summaryRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const element = summaryRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      if (!expanded)
        setOverflows(element.scrollHeight > element.clientHeight + 1);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [expanded]);
  const order = [
    "process",
    "hostname",
    "user",
    "ip",
    "command",
    "domain",
    "file",
    "hash",
  ];
  const context = [...usefulEntities(item)].sort(
    (a, b) => order.indexOf(a[0]) - order.indexOf(b[0]),
  );
  return (
    <div
      data-ui="investigation-preview-scroll"
      tabIndex={0}
      role="region"
      aria-label="Investigation preview details"
      className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-5 py-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      <OscarCaseLifecyclePreview
        item={item}
        stage={item.investigationPhase ?? item.status}
        mode="timeline"
      />
      <Separator />
      <section
        aria-label="OSCAR investigation"
        className="flex shrink-0 flex-col gap-2"
      >
        <h3 className="text-label font-medium">OSCAR summary</h3>
        {item.status === "Queued" && (
          <p className="text-caption text-muted-foreground">
            Not started · supplied context
          </p>
        )}
        <p
          ref={summaryRef}
          data-ui="preview-summary"
          className={cn(
            "text-prose text-muted-foreground wrap-anywhere",
            !expanded && "line-clamp-3",
          )}
        >
          {item.summary.trim() ||
            "No findings have been supplied for this investigation yet."}
        </p>
        {(overflows || expanded) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 self-start px-0"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "Show less" : "Read full summary"}
          </Button>
        )}
      </section>
      <section
        data-ui="preview-next-action"
        aria-label="Next action"
        className="flex shrink-0 flex-col gap-2 border-l-2 border-border pl-3"
      >
        <h3 className="text-label font-medium">
          {item.status === "Closed" ? "Investigation closed" : "Next action"}
        </h3>
        <p className="text-label text-foreground wrap-anywhere">
          {caseNextAction(item)}
        </p>
      </section>
      <Separator />
      <section
        aria-label="Supporting context"
        className="flex shrink-0 flex-col gap-3"
      >
        <h3 className="text-label font-semibold">Case details</h3>
        <dl className="flex flex-col gap-2">
          <div className="grid min-w-0 grid-cols-[5rem_minmax(0,1fr)] items-baseline gap-3">
            <dt className="text-caption text-muted-foreground">Priority</dt>
            <dd className="text-body">{item.priority}</dd>
          </div>
          <div className="grid min-w-0 grid-cols-[5rem_minmax(0,1fr)] items-baseline gap-3">
            <dt className="text-caption text-muted-foreground">Owner</dt>
            <dd className="text-body">{item.owner ?? "Unassigned"}</dd>
          </div>
          <div className="grid min-w-0 grid-cols-[5rem_minmax(0,1fr)] items-baseline gap-3">
            <dt className="text-caption text-muted-foreground">Case ID</dt>
            <dd className="min-w-0"><CopyTechnicalValue label="case ID" value={item.id} /></dd>
          </div>
          {(allContext ? context : context.slice(0, 4)).map(([key, value]) => (
            <div
              key={key}
              className="grid min-w-0 grid-cols-[5rem_minmax(0,1fr)] items-baseline gap-3"
            >
              <dt className="text-caption text-muted-foreground">
                {entityLabels[key]}
              </dt>
              <dd className="min-w-0">
                <CopyTechnicalValue
                  label={entityLabels[key].toLowerCase()}
                  value={value}
                />
              </dd>
            </div>
          ))}
          {item.source && (
            <div className="grid grid-cols-[5rem_minmax(0,1fr)] items-baseline gap-3">
              <dt className="text-caption text-muted-foreground">Source</dt>
              <dd className="text-caption">{item.source}</dd>
            </div>
          )}
        </dl>
        {context.length > 4 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 self-start px-0"
            aria-expanded={allContext}
            onClick={() => setAllContext((value) => !value)}
          >
            {allContext
              ? "Show fewer values"
              : `Show ${context.length - 4} more context values`}
          </Button>
        )}
      </section>
    </div>
  );
}

type InspectorProps = {
  item: SecurityCase;
  onClose: () => void;
  headingId: string;
  regionId: string;
  regionRef: RefObject<HTMLElement | null>;
  restoreFocus: () => HTMLElement | null;
  position: number;
  total: number;
  onPrevious?: () => void;
  onNext?: () => void;
};

export function InvestigationInspector(props: InspectorProps) {
  const {
    item,
    onClose,
    headingId,
    regionId,
    regionRef,
    restoreFocus,
    position,
    total,
    onPrevious,
    onNext,
  } = props;
  const narrow = useSyncExternalStore(
    subscribe,
    narrowSnapshot,
    serverSnapshot,
  );
  const contents = (
    <>
      <header className="sticky top-0 flex shrink-0 flex-col gap-3 bg-background px-4 py-3 sm:px-5">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <CopyTechnicalValue label="case ID" value={item.id} />
          <div className="ml-auto flex shrink-0 items-center gap-1">
            {position >= 0 && (
              <span
                data-ui="inspector-position"
                className="mr-2 text-caption tabular-nums text-muted-foreground"
              >
                {position + 1} of {total}
              </span>
            )}
            <IconTooltip label="Previous case">
              <Button
                variant="ghost"
                size="icon-sm"
                className="max-sm:size-10"
                aria-label="Previous case"
                disabled={!onPrevious}
                onClick={onPrevious}
              >
                <ChevronUp />
              </Button>
            </IconTooltip>
            <IconTooltip label="Next case">
              <Button
                variant="ghost"
                size="icon-sm"
                className="max-sm:size-10"
                aria-label="Next case"
                disabled={!onNext}
                onClick={onNext}
              >
                <ChevronDown />
              </Button>
            </IconTooltip>
            <Separator orientation="vertical" className="mx-1 h-4" />
            <IconTooltip label="Close investigation preview">
              <Button
                variant="ghost"
                size="icon-sm"
                className="max-sm:size-10"
                aria-label="Close investigation preview"
                onClick={onClose}
              >
                <X />
              </Button>
            </IconTooltip>
          </div>
        </div>
        {narrow ? (
          <SheetTitle id={headingId} className="text-body font-medium wrap-anywhere">
            {item.title}
          </SheetTitle>
        ) : (
          <h2 id={headingId} className="text-body font-medium wrap-anywhere">
            {item.title}
          </h2>
        )}
        <section
          aria-label="Classification"
          className="flex flex-wrap items-center gap-x-3 gap-y-1"
        >
          <PriorityBadge value={item.priority} />
          <QueueStatusIndicator item={item} />
          <QueueVerdictBadge item={item} />
        </section>
        {narrow && (
          <SheetDescription className="sr-only">
            OSCAR findings, next action and supporting case context.
          </SheetDescription>
        )}
        {position < 0 && (
          <p className="text-caption text-muted-foreground">
            Outside current results
          </p>
        )}
      </header>
      <Separator />
      <InspectorDetails key={item.id} item={item} />
      <Separator />
      <footer className="sticky bottom-0 flex shrink-0 justify-end border-t border-border bg-background px-5 py-3">
        <Button
          nativeButton={false}
          variant="outline"
          size="sm"
          role="link"
          render={<Link prefetch={false} href={caseHref(item.id)} />}
          className="min-w-28 rounded-md"
        >
          Open case <ArrowUpRight data-icon="inline-end" />
        </Button>
      </footer>
    </>
  );
  if (narrow)
    return (
      <Sheet
        open
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <SheetContent
          id={regionId}
          data-ui="case-investigation-preview"
          data-presentation="fullscreen"
          showCloseButton={false}
          initialFocus={regionRef}
          finalFocus={restoreFocus}
          ref={(node) => {
            regionRef.current = node;
          }}
          className="gap-0 bg-background shadow-none p-0 transition-none data-[side=right]:w-full data-[side=right]:sm:max-w-none data-[side=right]:rounded-none data-[side=right]:data-starting-style:translate-x-0 data-[side=right]:data-ending-style:translate-x-0"
        >
          {contents}
        </SheetContent>
      </Sheet>
    );
  return (
    <aside
      ref={(node) => {
        regionRef.current = node;
      }}
      id={regionId}
      data-ui="case-investigation-preview"
      data-presentation="overlay"
      aria-labelledby={headingId}
      tabIndex={-1}
      className="fixed right-0 bottom-0 top-(--workspace-header-height) z-20 flex w-110 max-w-full min-h-0 min-w-0 flex-col overflow-hidden border-l border-border bg-background shadow-none outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      {contents}
    </aside>
  );
}
