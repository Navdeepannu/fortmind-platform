"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  usePreviewCases,
  usePreviewCasesReady,
} from "@/lib/preview-case-store";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAge } from "@/lib/preview-data";
import { platformCases } from "@/lib/platform-cases";
import { oscarStates } from "@/lib/semantic-states";
import {
  SemanticIcon,
  CaseStatusBadge,
  ConfidenceIndicator,
  PriorityBadge,
  VerdictBadge,
} from "../semantic";
import { CopyTechnicalValue } from "../case-table";

export function CaseDetails({ id }: { id: string }) {
  const created = usePreviewCases();
  const ready = usePreviewCasesReady();
  const item = [...created, ...platformCases].find((entry) => entry.id === id);
  if (!item && !ready)
    return (
      <main
        data-ui="main cases-main"
        id="preview-main"
        className="min-w-0 py-5 md:py-8"
        aria-busy="true"
        aria-label="Loading investigation"
      >
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-4 h-5 w-96 max-w-full" />
      </main>
    );
  return (
    <div
      data-ui="main cases-main investigation"
      id="preview-main"
      className="min-w-0 py-5 md:py-8"
    >
      <Link
        data-ui="back-link"
        href="/platform/cases"
        className="inline-flex items-center gap-1.75 text-muted-foreground text-caption [&:hover]:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="w-3.5 h-3.5" /> Cases
      </Link>
      {!item ? (
        <div
          data-ui="investigation-missing"
          className="max-w-117.5 mt-15 mr-auto mb-15 ml-auto text-center"
        >
          <h1 className="text-page-title">Case unavailable</h1>
          <p className="mt-2.25 mr-0 mb-5 ml-0 text-muted-foreground">
            This case is not in the prototype fixtures or this browser tab’s
            saved cases. Return to the case queue to continue.
          </p>
          <Button nativeButton={false} render={<Link href="/platform/cases" />}>
            Return to cases
          </Button>
        </div>
      ) : (
        <>
          <header
            data-ui="investigation-header"
            className="mt-6 mr-0 mb-7 ml-0"
          >
            <div
              data-ui="investigation-id"
              className="flex items-center gap-2 text-caption text-muted-foreground [&_code]:text-caption"
            >
              <span>Investigation</span>
              <CopyTechnicalValue label="case ID" value={item.id} />
            </div>
            <h1 className="max-w-225 mt-2.25 mr-0 mb-4 ml-0 text-page-title">
              {item.title}
            </h1>
            <div
              data-ui="investigation-states"
              className="flex flex-wrap items-center gap-4.25"
            >
              <PriorityBadge value={item.priority} />
              <CaseStatusBadge
                value={item.status}
                closedByOscar={item.closedByOscar}
              />
              <span
                data-ui="investigation-proposal"
                className="inline-flex items-center gap-1.75 text-caption text-muted-foreground"
              >
                {item.status === "Closed"
                  ? "Final verdict"
                  : item.status === "Needs you" || item.status === "Escalated"
                    ? "OSCAR proposes"
                    : "Current assessment"}
                <VerdictBadge value={item.verdict} />
              </span>
            </div>
          </header>
          <div
            data-ui="investigation-grid"
            className="grid grid-cols-[minmax(0,_1fr)_300px] gap-4 items-start max-[1001px]:grid-cols-1"
          >
            <section
              data-ui="investigation-panel"
              className="min-w-0 pt-6 pr-6 pb-6 pl-6 border border-border rounded-lg bg-card"
            >
              <div
                data-ui="investigation-panel-heading"
                className="flex items-center gap-2 [&_svg]:w-4.25 [&_svg]:h-4.25 [&_svg]:text-oscar-foreground"
              >
                <SemanticIcon definition={oscarStates.OSCAR} />
                <h2 className="text-section-title">
                  OSCAR assessment
                </h2>
              </div>
              <p className="mt-3.5 text-prose">{item.summary}</p>
              <div
                data-ui="investigation-limitation"
                className="mt-4.5 mr-0 mb-6.25 ml-0 pt-2.75 pr-3.25 pb-2.75 pl-3.25 border border-border rounded-md bg-muted text-muted-foreground text-caption"
              >
                This is illustrative case data. Review the underlying evidence
                before confirming a verdict or taking action.
              </div>
              <h3 className="pb-2.5 border-b border-border text-panel-title">
                Technical entities
              </h3>
              <dl
                data-ui="investigation-entities"
                className="grid gap-0 [&>_div:last-child]:border-b-0"
              >
                {Object.entries(item.entities).map(([name, value]) => (
                  <div
                    key={name}
                    className="grid grid-cols-[110px_minmax(0,_1fr)] gap-3 pt-2.5 pr-0 pb-2.5 pl-0 border-b border-border text-caption"
                  >
                    <dt className="text-muted-foreground capitalize">
                      {name === "ip" ? "IP address" : name}
                    </dt>
                    <dd>
                      <CopyTechnicalValue label={name} value={value} />
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
            <aside
              data-ui="investigation-panel investigation-facts"
              className="min-w-0 pt-6 pr-6 pb-6 pl-6 border border-border rounded-lg bg-card [&_h3]:pb-2.5 [&_h3]:border-b [&_h3]:border-border [&_h3]:text-panel-title [&_dl_>_div:last-child]:border-b-0"
            >
              <h2 className="text-section-title">
                Case details
              </h2>
              <dl className="mt-3.75">
                <div className="grid grid-cols-[86px_minmax(0,_1fr)] gap-3 pt-2.5 pr-0 pb-2.5 pl-0 border-b border-border text-caption">
                  <dt className="text-muted-foreground capitalize">Owner</dt>
                  <dd>{item.owner ?? "Unassigned"}</dd>
                </div>
                <div className="grid grid-cols-[86px_minmax(0,_1fr)] gap-3 pt-2.5 pr-0 pb-2.5 pl-0 border-b border-border text-caption">
                  <dt className="text-muted-foreground capitalize">Source</dt>
                  <dd>{item.source}</dd>
                </div>
                <div className="grid grid-cols-[86px_minmax(0,_1fr)] gap-3 pt-2.5 pr-0 pb-2.5 pl-0 border-b border-border text-caption">
                  <dt className="text-muted-foreground capitalize">Age</dt>
                  <dd>{formatAge(item.ageMinutes)} ago</dd>
                </div>
                {item.status !== "Queued" &&
                  item.status !== "Running" &&
                  item.status !== "Failed" && (
                    <div className="grid grid-cols-[86px_minmax(0,_1fr)] gap-3 pt-2.5 pr-0 pb-2.5 pl-0 border-b border-border text-caption">
                      <dt className="text-muted-foreground capitalize">
                        Illustrative confidence
                      </dt>
                      <dd>
                        <ConfidenceIndicator {...item.confidence} />
                      </dd>
                    </div>
                  )}
              </dl>
              <p className="mt-3.5 flex gap-1.5 pt-3.75 border-t border-border text-muted-foreground text-caption">
                <ArrowUpRight
                  aria-hidden="true"
                  className="w-3.25 h-3.25 flex-none"
                />{" "}
                This preview does not include raw evidence or analyst decisions.
              </p>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
