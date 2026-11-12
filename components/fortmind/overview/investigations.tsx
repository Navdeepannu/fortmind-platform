import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { monitoredInvestigations, operations } from "@/lib/overview-data";
import { caseHref } from "@/lib/platform-routes";
import { formatAge } from "@/lib/preview-data";
import { OscarMark } from "../oscar-mark";

const visibleRuns = monitoredInvestigations.slice(0, 3);

/**
 * Compact awareness of sample OSCAR activity. The detailed investigation
 * timeline belongs in the case workspace, not on Home.
 */
export function ActiveInvestigations() {
  return (
    <Card
      data-ui="card running"
      role="region"
      aria-labelledby="running-heading"
      className="min-w-0 gap-0 overflow-hidden rounded-lg border border-border bg-card py-0 shadow-none"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xs border border-border text-oscar-foreground">
            <OscarMark className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 id="running-heading" className="text-panel-title font-semibold">
              OSCAR working
            </h2>
            <p className="mt-1 text-caption text-muted-foreground">
              {operations.running} running in snapshot · {visibleRuns.length} examples below
            </p>
          </div>
        </div>
        <Link
          href="/platform/cases?queue=Running"
          className="inline-flex items-center gap-1.5 text-caption font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Running cases <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>

      <ul data-ui="oscar-activity-summary" className="grid min-w-0 divide-y divide-border md:grid-cols-3 md:divide-y-0">
        {visibleRuns.map(({ item, stage, elapsed }, index) => (
          <li
            key={item.id}
            data-case-id={item.id}
            className={`min-w-0 px-5 py-4 sm:px-6 ${index > 0 ? "md:border-l md:border-border" : ""}`}
          >
            <div className="flex items-center justify-between gap-3">
              <code className="font-mono text-caption text-muted-foreground">{item.id}</code>
              <span className="inline-flex min-w-0 shrink-0 items-center gap-1 text-caption text-muted-foreground">
                <Clock3 aria-hidden="true" className="size-3" />
                {elapsed ? `Sample ${elapsed}` : `Age ${formatAge(item.ageMinutes)}`}
              </span>
            </div>
            <Link
              href={caseHref(item.id)}
              className="mt-2 flex min-w-0 items-start gap-2 text-body font-medium text-foreground hover:underline hover:underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-label={`Open investigation ${item.id}: ${item.title}`}
            >
              <span className="line-clamp-2 min-w-0 flex-1">{item.title}</span>
              <ArrowUpRight aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            </Link>
            <div className="mt-2 flex items-center gap-2 text-caption">
              <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-oscar" />
              <span className="truncate text-oscar-foreground">{stage}</span>
              <span className="ml-auto shrink-0 text-muted-foreground">Recorded stage</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="border-t border-border px-5 py-2.5 text-caption text-muted-foreground sm:px-6">
        Demonstration snapshot, not live telemetry. Open a case for recorded investigation details.
      </p>
    </Card>
  );
}
