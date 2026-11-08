"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronDown, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { monitoredInvestigations, operations } from "@/lib/overview-data";
import { caseHref } from "@/lib/platform-routes";
import { formatAge } from "@/lib/preview-data";
import { investigationProgress } from "@/lib/investigation-progress";
import { cn } from "@/lib/utils";
import { InvestigationProgress } from "../investigation-progress";

export function ActiveInvestigations() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  return (
    <Card
      data-ui="card running"
      role="region"
      aria-labelledby="running-heading"
      className="h-full gap-0 overflow-hidden rounded-lg border border-border bg-card py-0 shadow-none max-xl:order-first"
    >
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b px-6 py-5">
        <div className="flex min-w-0 flex-col gap-1">
          <CardTitle>
            <h2
              id="running-heading"
              className="flex items-center gap-2 text-panel-title"
            >
              <ScanLine
                aria-hidden="true"
                className="size-4 shrink-0 text-oscar-foreground"
              />
              OSCAR is investigating
            </h2>
          </CardTitle>
          <CardDescription className="text-caption">
            {operations.running} running · activity snapshot
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ul className="divide-y divide-border">
          {monitoredInvestigations.map(({ item, stage, elapsed, activity }) => {
            const expanded = expandedId === item.id;
            const progress = investigationProgress(item);
            const panelId = `activity-${item.id}`;
            const triggerId = `activity-trigger-${item.id}`;
            return (
              <li
                key={item.id}
                data-ui="active-investigation"
                data-case-id={item.id}
              >
                <button
                  id={triggerId}
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  aria-label={`Activity for ${item.id}: ${item.title}`}
                  onClick={() => setExpandedId(expanded ? null : item.id)}
                  className="flex w-full cursor-pointer flex-col gap-2 px-6 py-4 text-left hover:bg-surface-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                >
                  <span className="flex w-full items-start justify-between gap-3">
                    <span className="line-clamp-2 text-body font-medium">
                      {item.title}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 size-3.5 shrink-0 text-muted-foreground",
                        expanded && "rotate-180",
                      )}
                    />
                  </span>
                  <span className="flex w-full flex-wrap items-baseline gap-x-2 gap-y-1 text-caption text-muted-foreground">
                    <code className="font-mono">{item.id}</code>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{item.entities.hostname}</span>
                    <span className="ml-auto whitespace-nowrap tabular-nums">
                      {elapsed
                        ? `Elapsed ${elapsed}`
                        : `Case age ${formatAge(item.ageMinutes)}`}
                    </span>
                  </span>
                  <span className="flex w-full flex-wrap items-center justify-between gap-2 text-caption">
                    <span className="text-oscar-foreground">{stage}</span>
                    {progress.completed !== null && (
                      <span className="text-muted-foreground">
                        {progress.completed}/{progress.total} completed
                      </span>
                    )}
                  </span>
                  {activity && (
                    <span className="line-clamp-2 text-caption text-muted-foreground">
                      {activity}
                    </span>
                  )}
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  hidden={!expanded}
                  className="px-6 pb-4"
                >
                  {expanded && (
                    <div className="flex flex-col gap-4 border-t pt-4">
                      <InvestigationProgress item={item} />
                      <div className="flex flex-col gap-1 text-caption">
                        <h3 className="font-medium">Available activity</h3>
                        <p className="text-muted-foreground">{item.summary}</p>
                        <p className="text-muted-foreground">
                          Event history and step durations are not recorded in
                          this sample.
                          {!elapsed &&
                            " Investigation elapsed time is unavailable."}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        nativeButton={false}
                        role="link"
                        render={<Link href={caseHref(item.id)} />}
                        className="self-start"
                      >
                        Open investigation{" "}
                        <ArrowUpRight data-icon="inline-end" />
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
      <CardFooter className="mt-auto border-t px-6 py-4">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          role="link"
          render={<Link href="/platform/cases?queue=Running" />}
          className="h-auto w-full justify-between px-0"
        >
          {monitoredInvestigations.length} shown · view running cases{" "}
          <ArrowRight data-icon="inline-end" />
        </Button>
      </CardFooter>
    </Card>
  );
}
