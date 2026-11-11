import { Crosshair, Monitor, UserRound } from "lucide-react";
import { CaseStatusBadge, PriorityBadge, VerdictBadge } from "@/components/fortmind/semantic";
import type { CaseOverviewData } from "@/lib/case-overview-data";
import { CopyIdentifier } from "@/components/fortmind/case-overview/copy-identifier";

function Metadata({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="mb-1 text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-sm text-foreground">{children}</dd>
    </div>
  );
}

/** Vercel-inspired containment: heading, status, then a well-structured metadata grid. */
export function CaseSummaryCard({ data }: { data: CaseOverviewData }) {
  const host = data.entities.find((entity) => entity.kind === "host");
  const user = data.entities.find((entity) => entity.kind === "user");

  return (
    <section aria-labelledby="case-details-title"
      data-ui="boxed-case-summary"
      className="min-w-0 overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-6">
        <h2 id="case-details-title" className="text-sm font-semibold">Case details</h2>
        <span className="rounded-md border border-border bg-muted/30 px-2 py-1 text-xs text-muted-foreground">
          Preview · No changes persisted
        </span>
      </div>

      <div className="min-w-0 px-4 py-5 sm:px-6 sm:py-6">
        <h1 className="max-w-[60ch] text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {data.title}
        </h1>
        <p className="mt-2 max-w-[82ch] text-sm leading-6 text-muted-foreground">
          {data.description}
        </p>
        <div aria-label="Case workflow and assessment"
          className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <CaseStatusBadge value={data.status} />
          <PriorityBadge value={data.priority} />
          <span className="inline-flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">OSCAR</span>
            <VerdictBadge value={data.proposedVerdict} />
          </span>
        </div>
      </div>

      <dl className="grid min-w-0 grid-cols-1 gap-x-6 gap-y-5 border-t border-border px-4 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <Metadata label="Received">
          <time dateTime={data.investigation.receivedAt}>
            {data.investigation.dateLabel} · {data.investigation.receivedLabel}
          </time>
        </Metadata>
        <Metadata label="Assigned to">
          {data.owner ?? "Unassigned"}
        </Metadata>
        <Metadata label="Source">
          {data.source}
        </Metadata>
        <Metadata label="MITRE ATT&CK">
          <span className="inline-flex min-w-0 flex-wrap items-center gap-2">
            <Crosshair aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
            <CopyIdentifier value={data.technique.id} label="MITRE technique" />
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">
            {data.technique.tactic}
          </span>
        </Metadata>
      </dl>

      <div className="grid min-w-0 gap-3 border-t border-border bg-muted/15 px-4 py-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-start sm:px-6">
        <span className="text-xs font-medium text-muted-foreground">Involved entities</span>
        <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {host && (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Monitor aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
              <CopyIdentifier value={host.name} label="host" />
            </span>
          )}
          {user && (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <UserRound aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
              <CopyIdentifier value={user.name} label="user" />
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
