import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  ChevronDown,
  Crosshair,
  FileSearch,
  Monitor,
  Terminal,
  UserRound,
} from "lucide-react";
import {
  outcomeStates,
  phaseStates,
  verdictStates,
} from "@/lib/semantic-states";
import {
  CaseStatusBadge,
  ConfidenceIndicator,
  PriorityBadge,
  SemanticBadge,
  SemanticIcon,
  SeverityBadge,
  VerdictBadge,
  VerdictMarker,
} from "@/components/fortmind/semantic";
import type {
  CaseOverviewData,
  OverviewEntity,
  OverviewFinding,
} from "@/lib/case-overview-data";
import { CopyIdentifier } from "./copy-identifier";
import { InvestigationSection } from "./investigation-section";
import { ReviewVerdict } from "./review-verdict";
import { CaseCategoryTabs } from "./section-navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function CaseHeader({ data }: { data: CaseOverviewData }) {
  return (
    <header
      data-ui="header"
      className="flex-none min-w-0 py-5 border-b border-border bg-background @max-[501px]/case:py-4"
    >
      <div
        data-ui="header-meta"
        className="flex min-w-0 items-center justify-between gap-3"
      >
        <div
          data-ui="header-id"
          className="flex items-center gap-2 text-muted-foreground text-caption"
        >
          <span>Case ID</span>
          <CopyIdentifier
            value={data.id}
            display={data.id.slice(0, 8)}
            label="case ID"
          />
        </div>
        <span
          data-ui="fixture-label"
          className="text-muted-foreground text-caption @max-[501px]/case:hidden"
        >
          Case preview
        </span>
      </div>
      <h1 className="mt-2 text-page-title">
        {data.title}
      </h1>
      <p
        data-ui="description"
        className="mt-1 max-w-[88ch] text-muted-foreground text-prose"
      >
        {data.description}
      </p>
      <div
        data-ui="header-states"
        className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-label"
        aria-label="Case assessment and workflow"
      >
        <CaseStatusBadge value={data.status} />
        <PriorityBadge value={data.priority} />
        <span
          data-ui="inline-verdict"
          className="inline-flex items-center gap-1.5"
        >
          OSCAR: <VerdictBadge value={data.proposedVerdict} />
        </span>
        <span
          data-ui="ai-state"
          className="text-muted-foreground text-label [&_svg]:size-3.75"
        >
          <SemanticBadge
            definition={outcomeStates["Investigation complete"]}
            treatment="inline"
            label="Investigation completed"
          />
        </span>
      </div>
      <dl
        data-ui="header-context"
        className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,.8fr)_minmax(0,.8fr)_minmax(0,1.1fr)] gap-y-3 gap-x-5.5 mt-3.5 pt-3.25 border-t border-border [&_a]:inline-flex [&_a]:items-center [&_a]:gap-1.25 @max-[861px]/case:grid-cols-2 @max-[501px]/case:grid-cols-2 @max-[501px]/case:mt-3 @max-[501px]/case:pt-2.5 [&_a:hover]:underline [&_a:hover]:underline-offset-3 @max-[501px]/case:[&>_div:first-child]:col-span-full @max-[501px]/case:[&>_div:last-child]:col-span-full"
      >
        <div>
          <dt className="mb-1 text-muted-foreground text-caption">
            Involved entities
          </dt>
          <dd className="flex items-center flex-wrap gap-y-0.75 gap-x-2.75 min-w-0 text-label">
            <span className="inline-flex items-center gap-1">
              <Monitor
                aria-hidden="true"
                className="w-3.25 h-3.25 text-muted-foreground"
              />
              <CopyIdentifier value="fmlab-ws1" label="host fmlab-ws1" />
            </span>
            <span className="inline-flex items-center gap-1">
              <UserRound
                aria-hidden="true"
                className="w-3.25 h-3.25 text-muted-foreground"
              />
              <CopyIdentifier value="lab.bob" label="user lab.bob" />
            </span>
          </dd>
        </div>
        <div>
          <dt className="mb-1 text-muted-foreground text-caption">Received</dt>
          <dd className="flex items-center flex-wrap gap-y-0.75 gap-x-2.75 min-w-0 text-label">
            <time dateTime={data.investigation.receivedAt}>
              {data.investigation.dateLabel} ·{" "}
              {data.investigation.receivedLabel}
            </time>
          </dd>
        </div>
        <div>
          <dt className="mb-1 text-muted-foreground text-caption">Assigned to</dt>
          <dd className="flex items-center flex-wrap gap-y-0.75 gap-x-2.75 min-w-0 text-label">
            {data.owner ?? "Unassigned"}
          </dd>
        </div>
        <div>
          <dt className="mb-1 text-muted-foreground text-caption">Source</dt>
          <dd className="flex items-center flex-wrap gap-y-0.75 gap-x-2.75 min-w-0 text-label">
            {data.source}
          </dd>
        </div>
        <div>
          <dt className="mb-1 text-muted-foreground text-caption">MITRE ATT&CK</dt>
          <dd className="flex items-center flex-wrap gap-y-0.75 gap-x-2.75 min-w-0 text-label">
            <Crosshair
              aria-hidden="true"
              className="w-3.25 h-3.25 text-muted-foreground"
            />
            <CopyIdentifier value={data.technique.id} label="MITRE technique" />
            <span
              data-ui="muted"
              className="text-muted-foreground inline-flex items-center gap-1"
            >
              {data.technique.tactic}
            </span>
          </dd>
        </div>
      </dl>
    </header>
  );
}

/** Data provenance is a distribution of finding types, never a confidence score. */
function FindingProvenance({ findings }: { findings: OverviewFinding[] }) {
  const rows = [
    { label: "Reported only", value: findings.filter((item) => item.evidenceState === "Alert report · unverified").length, color: "bg-warning" },
    { label: "Tool results", value: findings.filter((item) => item.evidenceState === "Tool result").length, color: "bg-oscar" },
    { label: "No corroboration", value: findings.filter((item) => item.evidenceState === "Missing corroboration").length, color: "bg-muted-foreground/50" },
  ];
  const total = findings.length;
  return (
    <div data-ui="finding-provenance" className="min-w-0">
      <div
        role="img"
        aria-label={`${total} findings: ${rows.map((item) => `${item.value} ${item.label.toLowerCase()}`).join(", ")}`}
        className="flex h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        {rows.map(({ label, value, color }) => (
          value > 0 ? <span key={label} className={color} style={{ width: `${(value / total) * 100}%` }} /> : null
        ))}
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-3">
        {rows.map(({ label, value, color }) => (
          <div key={label} className="min-w-0">
            <dt className="flex items-center gap-1.5 text-caption text-muted-foreground">
              <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${color}`} />
              {label}
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Conclusion({ data }: { data: CaseOverviewData }) {
  const concern = data.findings.filter((item) => item.relationship === "Supports concern");
  const analyze = data.investigation.confidence.find((item) => item.phase === "Analyze");
  const report = data.investigation.confidence.find((item) => item.phase === "Report");

  return (
    <InvestigationSection
      id="conclusion"
      title="Decision briefing"
      description="A conclusion to review, not a confirmed compromise"
      contentClassName="px-5 py-5 @max-[501px]/case:px-4 @min-[760px]/case:px-6"
    >
      <div
        data-ui="conclusion-top"
        className="grid min-w-0 grid-cols-1 items-start gap-5 @min-[760px]/case:grid-cols-[minmax(0,1fr)_minmax(250px,32%)] @min-[760px]/case:gap-6"
      >
        <div className="min-w-0">
          <div data-ui="assessment">
            <p className="text-caption font-medium text-muted-foreground">OSCAR proposes</p>
            <h3
              data-ui="proposed-verdict"
              className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight"
              data-tone={verdictStates[data.proposedVerdict].tone}
            >
              <VerdictMarker value={data.proposedVerdict} />
              {data.proposedVerdict}
            </h3>
            <p data-ui="assessment-summary" className="mt-2 max-w-[68ch] text-prose">
              {data.assessment}
            </p>
            <div
              data-ui="confidence-summary"
              className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-muted-foreground"
            >
              <span className="font-medium text-warning-foreground">Human review required</span>
              {analyze && report && (
                <span>Stage confidence · Analyze {analyze.value} · Report {report.value}</span>
              )}
              <a
                href="#how-oscar-decided"
                className="font-medium text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                Why OSCAR stopped
              </a>
            </div>
          </div>

          <div data-ui="supporting" className="mt-5 border-t border-border pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-panel-title">Evidence at a glance</h4>
                <p className="mt-0.5 text-caption text-muted-foreground">
                  Source status, not a reliability score
                </p>
              </div>
              <a
                href="#findings"
                className="inline-flex items-center gap-1 text-label font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
              >
                All findings <ArrowRight aria-hidden="true" className="size-3.5" />
              </a>
            </div>
            <div className="mt-4">
              <FindingProvenance findings={data.findings} />
            </div>
            <div className="mt-5 border-t border-border pt-4">
              <h4 className="text-label font-semibold">Signals supporting concern</h4>
              <ul className="mt-1 divide-y divide-border">
                {concern.map((finding) => (
                  <li key={finding.id} className="flex min-w-0 items-start gap-3 py-2.5">
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 size-1.5 shrink-0 rounded-full ${finding.evidenceState === "Tool result" ? "bg-oscar" : "bg-warning"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-label font-medium">{finding.title}</p>
                      <p className="mt-0.5 text-caption text-muted-foreground">
                        {finding.provenance}
                      </p>
                    </div>
                    <a
                      href={`#finding-${finding.id}`}
                      className="shrink-0 rounded-sm text-caption font-medium text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      View finding
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <ReviewVerdict
          proposedVerdict={data.proposedVerdict}
          reason={data.decisionSummary}
          status={data.status}
        />
      </div>

      <div data-ui="conclusion-detail" className="mt-5 grid min-w-0 gap-5 border-t border-border pt-5 @min-[700px]/case:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section data-ui="unresolved" aria-labelledby="open-questions-heading" className="min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h4 id="open-questions-heading" className="text-panel-title">Before you decide</h4>
            <span className="text-caption text-muted-foreground">{data.unresolved.length} open questions</span>
          </div>
          <div className="mt-2 divide-y divide-border">
            {data.unresolved.map((item) => (
              <details key={item.question} data-ui="question" className="group/question">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-label font-medium [&::-webkit-details-marker]:hidden focus-visible:outline-2 focus-visible:outline-ring">
                  {item.question}
                  <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform group-open/question:rotate-180" />
                </summary>
                <p className="pb-3 text-label text-muted-foreground">{item.resolution}</p>
              </details>
            ))}
          </div>
        </section>
        <section aria-labelledby="next-step-heading" className="min-w-0 rounded-md border border-border bg-muted/40 px-4 py-4">
          <p className="text-caption font-medium text-muted-foreground">Next recommended action</p>
          <h4 id="next-step-heading" className="mt-1 text-body font-semibold">
            {data.nextSteps[0]}
          </h4>
          <p data-ui="limitation" className="mt-2 text-caption text-muted-foreground">
            Recommendation only. No response has been approved or executed here.
          </p>
          <a
            href="#actions"
            className="mt-3 inline-flex items-center gap-1 text-label font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
          >
            See response plan <ArrowRight aria-hidden="true" className="size-3.5" />
          </a>
        </section>
      </div>
    </InvestigationSection>
  );
}

function EntityRow({ entity }: { entity: OverviewEntity }) {
  const Icon = entity.kind === "host" ? Monitor : entity.kind === "user" ? UserRound : Terminal;
  return (
    <li
      data-ui="entity-row"
      id={`entity-${entity.id}`}
      tabIndex={-1}
      className="min-w-0 scroll-mt-40 bg-card p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <span data-ui="entity-kind" className="inline-flex items-center gap-1.5 text-caption capitalize text-muted-foreground">
          <Icon aria-hidden="true" className="size-3.5" />
          {entity.kind}
        </span>
        {entity.findingCount !== undefined && (
          <span data-ui="entity-context" className="text-caption text-muted-foreground">
            {entity.findingCount} {entity.findingCount === 1 ? "finding" : "findings"}
          </span>
        )}
      </div>
      <div data-ui="entity-identity" className="mt-2 text-label font-semibold [&_code]:text-body [&_code]:text-foreground">
        <CopyIdentifier value={entity.name} label={entity.name} />
      </div>
      <p data-ui="entity-description" className="mt-1 text-label text-muted-foreground">
        {entity.role}
      </p>
      <div className="mt-3 border-t border-border pt-3">
        <p className="text-caption text-muted-foreground">Reported sources</p>
        <p data-ui="entity-sources" className="mt-1 text-caption">{entity.sources.join(" · ")}</p>
        {entity.otherCaseCount !== undefined && (
          <p className="mt-2 text-caption text-muted-foreground">
            {entity.otherCaseCount > 0
              ? `${entity.otherCaseCount} related ${entity.otherCaseCount === 1 ? "case" : "cases"}`
              : "No other recorded cases"}
          </p>
        )}
      </div>
    </li>
  );
}

function Entities({ data }: { data: CaseOverviewData }) {
  return (
    <InvestigationSection
      id="entities"
      title="Involved entities"
      count={data.entities.length}
      description="Identifiers named or queried during investigation"
      footer={
        <p className="text-caption text-muted-foreground">
          Source wording such as “Confirmed affected” identifies the referenced entity, not a confirmed compromise.
        </p>
      }
      contentClassName="p-0"
    >
      <ul
        data-ui="entity-list"
        className="grid min-w-0 grid-cols-1 gap-px overflow-hidden rounded-[inherit] bg-border @min-[620px]/case:grid-cols-2"
      >
        {data.entities.map((entity) => (
          <EntityRow entity={entity} key={entity.id} />
        ))}
      </ul>
    </InvestigationSection>
  );
}

function SimilarCases({ data }: { data: CaseOverviewData }) {
  return (
    <InvestigationSection
      id="similar-cases"
      title="Similar past cases"
      count={data.relatedCases.length}
      description="Earlier investigations sharing the host named in this alert"
    >
      <div
        data-ui="related-list"
        className="grid grid-cols-2 @max-[641px]/case:grid-cols-1"
      >
        {data.relatedCases.map((item) => (
          <article
            data-ui="related-item"
            key={item.id}
            className="flex flex-col gap-2.5 min-w-0 pt-px pr-0 pb-0.5 pl-5.5 border-l border-border @max-[641px]/case:pt-4.5 @max-[641px]/case:pr-0 @max-[641px]/case:pb-0 @max-[641px]/case:pl-0 @max-[641px]/case:border-t @max-[641px]/case:border-border @max-[641px]/case:border-l-0 [&_h3_a:hover]:text-primary [&_h3_a:hover]:underline [&_h3_a:hover]:underline-offset-3"
          >
            <div
              data-ui="related-topline"
              className="flex justify-between flex-wrap gap-y-0.75 gap-x-3 text-muted-foreground text-caption"
            >
              <span>
                {item.caseId ? `Case ${item.caseId}` : "Case ID unavailable"}
              </span>
              <time dateTime={item.receivedAt}>{item.receivedLabel}</time>
            </div>
            <h3 className="text-panel-title">
              {item.href ? (
                <Link href={item.href}>{item.title}</Link>
              ) : (
                item.title
              )}
            </h3>
            <div
              data-ui="related-states"
              className="flex items-center flex-wrap gap-1.75"
            >
              <VerdictBadge value={item.verdict} />
              <CaseStatusBadge value={item.status} />
            </div>
            <p className="mt-auto text-muted-foreground text-caption">
              Similar because both cases name <code>{item.sharedEntity}</code>.
              No analyst-confirmed outcome is supplied.
            </p>
          </article>
        ))}
      </div>
      <p
        data-ui="section-note"
        className="mt-5 pt-3.5 border-t border-border text-muted-foreground text-caption"
      >
        A shared host does not establish this case’s intent. Historical case IDs
        and direct links were not present in the supplied capture.
      </p>
    </InvestigationSection>
  );
}

function FindingRow({
  finding,
  index,
}: {
  finding: OverviewFinding;
  index: number;
}) {
  return (
    <details
      data-ui="finding"
      id={`finding-${finding.id}`}
      className="group/finding scroll-mt-40 border-t border-border first:border-t-0 [&_summary::-webkit-details-marker]:hidden [&_summary:hover]:bg-muted/35 [&_summary:focus-visible]:outline-2 [&_summary:focus-visible]:outline-ring [&_summary:focus-visible]:-outline-offset-2"
    >
      <summary className="flex cursor-pointer list-none items-start gap-3 px-4 py-3.5 sm:px-5">
        <span data-ui="finding-number" className="pt-0.5 font-mono text-caption text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span data-ui="finding-content" className="flex min-w-0 flex-1 flex-col gap-1">
          <span data-ui="finding-title-row" className="flex flex-wrap items-center gap-2">
            <strong className="text-label font-semibold">{finding.title}</strong>
            {finding.relationship === "Supports concern" && finding.severity && (
              <SeverityBadge value={finding.severity} />
            )}
          </span>
          <span data-ui="finding-summary" className="text-label text-muted-foreground">
            {finding.summary}
          </span>
          <span data-ui="finding-metadata" className="mt-0.5 text-caption text-muted-foreground">
            {finding.evidenceState}
          </span>
        </span>
        <ChevronDown
          data-ui="finding-chevron"
          aria-hidden="true"
          className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-open/finding:rotate-180"
        />
      </summary>
      <div data-ui="finding-expanded" className="grid min-w-0 gap-4 border-t border-border bg-muted/30 px-4 py-4 sm:px-5 @min-[620px]/case:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div>
          <h4 className="text-caption font-semibold text-muted-foreground">Interpretation and limits</h4>
          <p className="mt-1.5 text-label">{finding.detail}</p>
        </div>
        <div>
          <h4 className="text-caption font-semibold text-muted-foreground">Provenance</h4>
          <p className="mt-1.5 flex items-start gap-1.5 text-label">
            <FileSearch aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            {finding.provenance}
          </p>
        </div>
      </div>
    </details>
  );
}

function Findings({ data }: { data: CaseOverviewData }) {
  const groups = [
    { relationship: "Supports concern", label: "Signals supporting concern", note: "A reported claim is not confirmed execution" },
    { relationship: "Context · unresolved", label: "Context still unresolved", note: "Related data does not establish a connection" },
    { relationship: "Limits corroboration", label: "Missing corroboration", note: "Empty lookups do not mean benign activity" },
  ] as const;

  return (
    <InvestigationSection
      id="findings"
      title="Investigation findings"
      count={data.findings.length}
      description="Grouped by how each result informs the investigation"
      contentClassName="p-0"
    >
      <div data-ui="findings-list">
        {groups.map((group) => {
          const rows = data.findings.filter((finding) => finding.relationship === group.relationship);
          if (!rows.length) return null;
          return (
            <section
              key={group.relationship}
              data-ui="finding-group"
              aria-label={group.label}
              className="min-w-0 border-b border-border last:border-b-0"
            >
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-3 sm:px-5">
                <h3 className="text-label font-semibold">{group.label} <span className="ml-1 font-normal text-muted-foreground">{rows.length}</span></h3>
                <p className="text-caption text-muted-foreground">{group.note}</p>
              </header>
              {rows.map((finding) => (
                <FindingRow key={finding.id} finding={finding} index={data.findings.indexOf(finding)} />
              ))}
            </section>
          );
        })}
      </div>
    </InvestigationSection>
  );
}

function InvestigationSummary({ data }: { data: CaseOverviewData }) {
  return (
    <InvestigationSection
      id="how-oscar-decided"
      title="OSCAR investigation trace"
      description="Execution completed; the analyst decision is still outstanding"
      metadata={
        <SemanticBadge
          definition={outcomeStates["Investigation complete"]}
          treatment="inline"
          label="Completed"
        />
      }
      contentClassName="px-5 py-5 @max-[501px]/case:px-4 @min-[760px]/case:px-6"
    >
      <div data-ui="completed-phases">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-panel-title">Investigation phases</h3>
          <span className="text-caption text-muted-foreground">
            {data.investigation.durationLabel}
          </span>
        </div>
        <ol className="mt-4 grid grid-cols-5 gap-1.5 sm:gap-3">
          {data.investigation.phases.map((phase, index) => (
            <li key={phase.name} data-phase-state={phase.state} className="min-w-0">
              <div className={`mb-2 h-1.5 rounded-sm ${phase.state === "completed" ? "bg-oscar" : phase.state === "failed" ? "bg-danger" : "bg-muted"}`} />
              <div className="flex items-center gap-1 text-caption">
                <SemanticIcon definition={phaseStates[phase.state]} />
                <span className="min-w-0 truncate">{phase.name}</span>
              </div>
              <span className="sr-only">Step {index + 1}: {phase.state}</span>
            </li>
          ))}
        </ol>
      </div>

      <div data-ui="investigation-summary" className="mt-5 grid min-w-0 gap-6 border-t border-border pt-5 @min-[700px]/case:grid-cols-2">
        <section data-ui="stage-confidence" aria-labelledby="stage-confidence-heading" className="min-w-0">
          <h3 id="stage-confidence-heading" className="text-panel-title">Confidence by phase</h3>
          <p className="mt-1 text-caption text-muted-foreground">
            Stage assessments, not verdict probabilities
          </p>
          <dl className="mt-4 flex flex-col gap-4">
            {data.investigation.confidence.map((stage) => (
              <div key={stage.phase} className="flex min-w-0 flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3 text-label">
                  <dt>{stage.phase}</dt>
                  <dd className="flex items-center gap-2 text-caption">
                    <ConfidenceIndicator level={stage.level} />
                    <strong className="font-medium tabular-nums text-foreground">{stage.value}/100</strong>
                  </dd>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="meter" aria-label={`${stage.phase} stage score`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={stage.value}>
                  <div className="h-full rounded-full bg-oscar" style={{ width: `${Math.min(100, Math.max(0, stage.value))}%` }} />
                </div>
              </div>
            ))}
          </dl>
        </section>
        <section data-ui="process-summary" aria-labelledby="handoff-heading" className="min-w-0">
          <h3 id="handoff-heading" className="text-panel-title">Why it was handed off</h3>
          <p className="mt-2 text-label text-muted-foreground">
            {data.reviewReason}
          </p>
          <dl data-ui="investigation-times" className="mt-4 divide-y divide-border border-t border-border text-caption">
            <div className="grid grid-cols-[105px_minmax(0,1fr)] gap-3 py-2.5">
              <dt className="text-muted-foreground">Received</dt>
              <dd><time dateTime={data.investigation.receivedAt}>{data.investigation.dateLabel} · {data.investigation.receivedLabel}</time></dd>
            </div>
            <div className="grid grid-cols-[105px_minmax(0,1fr)] gap-3 py-2.5">
              <dt className="text-muted-foreground">Concluded</dt>
              <dd><time dateTime={data.investigation.concludedAt}>{data.investigation.dateLabel} · {data.investigation.concludedLabel}</time></dd>
            </div>
            <div className="grid grid-cols-[105px_minmax(0,1fr)] gap-3 py-2.5">
              <dt className="text-muted-foreground">Duration</dt>
              <dd>{data.investigation.durationLabel}</dd>
            </div>
          </dl>
        </section>
      </div>
    </InvestigationSection>
  );
}

function AttackPath({ data }: { data: CaseOverviewData }) {
  return (
    <InvestigationSection
      id="attack-path"
      title="Attack path"
      description="Relationship reported by the alert; event time not stated"
    >
      <div
        data-ui="attack-path"
        className="flex items-center flex-wrap gap-y-2.5 gap-x-3.5"
      >
        <span className="inline-flex items-center gap-2 pt-2.25 pr-3 pb-2.25 pl-3 border border-border rounded-md bg-background">
          <UserRound
            aria-hidden="true"
            className="w-3.75 h-3.75 text-muted-foreground"
          />
          <CopyIdentifier value="lab.bob" label="attack path user lab.bob" />
        </span>
        <ArrowRight
          aria-hidden="true"
          className="text-muted-foreground w-4 h-4"
        />
        <span className="inline-flex items-center gap-2 pt-2.25 pr-3 pb-2.25 pl-3 border border-border rounded-md bg-background">
          <Terminal
            aria-hidden="true"
            className="w-3.75 h-3.75 text-muted-foreground"
          />
          <CopyIdentifier value="procdump.exe" label="attack path process procdump.exe" />
        </span>
        <ArrowRight
          aria-hidden="true"
          className="text-muted-foreground w-4 h-4"
        />
        <span className="inline-flex items-center gap-2 pt-2.25 pr-3 pb-2.25 pl-3 border border-border rounded-md bg-background">
          <Terminal
            aria-hidden="true"
            className="w-3.75 h-3.75 text-muted-foreground"
          />
          <CopyIdentifier value="lsass.exe" label="attack path target lsass.exe" />
        </span>
      </div>
      <p
        data-ui="section-note"
        className="mt-5 pt-3.5 border-t border-border text-muted-foreground text-caption"
      >
        The alert describes an attempt to access LSASS memory on{" "}
        <code>fmlab-ws1</code>, classified as {data.technique.id}{" "}
        {data.technique.name}. Process execution and memory access were not
        independently verified.
      </p>
    </InvestigationSection>
  );
}

function Hypotheses({ data }: { data: CaseOverviewData }) {
  return (
    <InvestigationSection
      id="hypotheses"
      title="Competing explanations"
      count={data.hypotheses.length}
      description="Compare supporting and missing evidence; neither hypothesis is confirmed"
    >
      <div data-ui="record-list" className="grid min-w-0 gap-3 @min-[680px]/case:grid-cols-2">
        {data.hypotheses.map((item, index) => (
          <article
            data-ui="record"
            key={item.title}
            className="flex min-w-0 flex-col rounded-md border border-border bg-muted/25 p-4"
          >
            <div data-ui="record-top" className="flex flex-wrap items-center justify-between gap-2 text-caption text-muted-foreground">
              <span className="font-mono">Hypothesis {String(index + 1).padStart(2, "0")}</span>
              <span>{item.result}</span>
            </div>
            <h3 className="mt-2 text-body font-semibold">{item.title}</h3>
            {item.score !== undefined && (
              <div className="mt-3 flex items-center justify-between gap-2 border-y border-border py-2 text-caption text-muted-foreground">
                <span>Agent score · not probability</span>
                <strong className="font-medium tabular-nums text-foreground">
                  {item.score}/100 {item.level ? `· ${item.level}` : ""}
                </strong>
              </div>
            )}
            <div className="mt-3 flex flex-1 flex-col gap-3 text-label">
              {item.supportingEvidence && (
                <div>
                  <h4 className="text-caption font-semibold text-foreground">Supporting signal</h4>
                  <p className="mt-1 text-muted-foreground">{item.supportingEvidence}</p>
                </div>
              )}
              {item.limitations && (
                <div className="border-t border-border pt-3">
                  <h4 className="text-caption font-semibold text-foreground">Evidence missing or disputed</h4>
                  <p className="mt-1 text-muted-foreground">{item.limitations}</p>
                </div>
              )}
              {!item.supportingEvidence && !item.limitations && (
                <p className="text-muted-foreground">{item.explanation}</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </InvestigationSection>
  );
}

function Evidence({ data }: { data: CaseOverviewData }) {
  const sources = [...new Set(data.evidence.map((item) => item.source))];
  return (
    <InvestigationSection
      id="evidence"
      title="Source responses"
      count={data.evidence.length}
      description="Captured lookup summaries grouped by source"
      footer={
        <p className="text-caption text-muted-foreground">
          Raw requests and responses were not supplied. No matching records does not prove benign activity.
        </p>
      }
      contentClassName="p-0"
    >
      <div data-ui="evidence-list">
        {sources.map((source) => {
          const results = data.evidence.filter((item) => item.source === source);
          return (
            <section
              key={source}
              data-ui="evidence-source"
              aria-label={`${source} lookups`}
              className="border-b border-border last:border-b-0"
            >
              <header className="flex items-baseline justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3 sm:px-5">
                <h3 className="text-label font-semibold">{source}</h3>
                <span className="text-caption text-muted-foreground">
                  {results.length} {results.length === 1 ? "lookup" : "lookups"}
                </span>
              </header>
              <ul className="divide-y divide-border">
                {results.map((item, index) => (
                  <li
                    key={`${item.context}-${index}`}
                    data-ui="evidence-result"
                    className="grid min-w-0 grid-cols-1 gap-1 px-4 py-3 text-label sm:px-5 @min-[550px]/case:grid-cols-[minmax(100px,0.35fr)_minmax(0,1fr)] @min-[550px]/case:gap-4"
                  >
                    <span className="text-caption font-medium text-muted-foreground">{item.context}</span>
                    <span>{item.result}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </InvestigationSection>
  );
}

function Actions({ data }: { data: CaseOverviewData }) {
  return (
    <InvestigationSection
      id="actions"
      title="Recommended response"
      count={data.actions.length}
      description="Proposals from OSCAR, not executed controls"
      footer={
        <p className="text-caption text-muted-foreground">
          Only an authorized administrator can approve or reject these recommendations in the source interface. This preview does not execute any response.
        </p>
      }
      contentClassName="p-0"
    >
      <ol data-ui="record-list" className="divide-y divide-border">
        {data.actions.map((item, index) => (
          <li
            data-ui="action-row"
            key={item.title}
            className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 px-4 py-4 sm:px-5 @min-[720px]/case:grid-cols-[2rem_minmax(0,1fr)_8rem]"
          >
            <span className="flex size-7 items-center justify-center rounded-md border border-border bg-muted/40 font-mono text-caption text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <p className="text-label font-medium">{item.title}</p>
              {item.condition && (
                <p className="mt-1 text-caption font-medium text-warning-foreground">
                  Condition: {item.condition}
                </p>
              )}
            </div>
            <span className="col-start-2 self-start text-caption text-muted-foreground @min-[720px]/case:col-start-3 @min-[720px]/case:text-right">
              Not executed
            </span>
          </li>
        ))}
      </ol>
    </InvestigationSection>
  );
}

function AnalystNotes() {
  return (
    <InvestigationSection
      id="analyst-notes"
      title="Analyst notes"
      description="Recorded analyst context"
    >
      <p data-ui="empty-state" className="text-muted-foreground text-label">
        No notes had been written on this case in the supplied capture.
      </p>
    </InvestigationSection>
  );
}

function TimelineEvent({
  item,
  index,
}: {
  item: CaseOverviewData["activity"][number];
  index: number;
}) {
  return (
    <li className="grid min-w-0 grid-cols-[14px_minmax(0,1fr)] gap-3 border-b border-border py-3 last:border-b-0 @min-[650px]/case:grid-cols-[14px_190px_minmax(0,1fr)]">
      <span className="relative flex justify-center pt-1.5" aria-hidden="true">
        <span className={`size-2 rounded-full ${item.actor === "OSCAR" ? "bg-oscar" : "bg-muted-foreground"}`} />
      </span>
      <time className="text-caption tabular-nums text-muted-foreground">
        {item.time}
      </time>
      <div className="min-w-0">
        <p className="text-label">
          <strong className="font-semibold">{item.actor}</strong>
          <span className="ml-2 text-muted-foreground">{item.event}</span>
        </p>
      </div>
      <span className="sr-only">Event {index + 1}</span>
    </li>
  );
}

function Timeline({ data }: { data: CaseOverviewData }) {
  const recent = data.activity.slice(0, 5);
  const earlier = data.activity.slice(5);
  return (
    <InvestigationSection
      id="timeline"
      title="Case activity"
      description="Newest first · OSCAR execution and later analyst events"
    >
      <div data-ui="timeline-summary" className="mb-3 flex flex-wrap items-center justify-between gap-2 text-caption text-muted-foreground">
        <span>{data.activity.length} visible events</span>
        <span className="inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2 rounded-full bg-oscar" /> OSCAR
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2 rounded-full bg-muted-foreground" /> Analyst
          </span>
        </span>
      </div>
      <ol data-ui="timeline" className="border-t border-border">
        {recent.map((item, index) => (
          <TimelineEvent key={`${index}-${item.event}`} item={item} index={index} />
        ))}
      </ol>
      {earlier.length > 0 && (
        <details data-ui="timeline-history" className="group/history border-b border-border">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-3 text-label font-medium hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
            Show {earlier.length} earlier events
            <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform group-open/history:rotate-180" />
          </summary>
          <ol start={recent.length + 1} className="border-t border-border">
            {earlier.map((item, index) => (
              <TimelineEvent key={`${index + recent.length}-${item.event}`} item={item} index={index + recent.length} />
            ))}
          </ol>
        </details>
      )}
      <p data-ui="section-note" className="mt-4 text-caption text-muted-foreground">
        The source lists 17 events; only the 12 legible events are reproduced. Historical analyst confirmation is not applied to this pre-confirmation preview.
      </p>
    </InvestigationSection>
  );
}

export function CaseOverview({ data }: { data: CaseOverviewData }) {
  return (
    <div
      data-ui="case workspace"
      className="@container/case w-full min-w-0 flex-1 bg-background text-body"
      id="preview-main"
      data-case-workspace
      data-inspector-open="false"
    >
      <div data-ui="layout" className="flex flex-col min-h-0">
        <CaseHeader data={data} />
        <Suspense fallback={
          <div className="flex min-w-0 flex-col gap-5 py-6" aria-label="Loading case workspace" aria-busy="true">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        }>
          <CaseCategoryTabs
            status={data.status}
            counts={{
              entities: data.entities.length,
              "similar-cases": data.relatedCases.length,
              hypotheses: data.hypotheses.length,
              findings: data.findings.length,
              evidence: data.evidence.length,
              actions: data.actions.length,
            }}
            views={{
              conclusion: <Conclusion data={data} />,
              "how-oscar-decided": <InvestigationSummary data={data} />,
              findings: <Findings data={data} />,
              hypotheses: <Hypotheses data={data} />,
              "attack-path": <AttackPath data={data} />,
              entities: <Entities data={data} />,
              evidence: <Evidence data={data} />,
              "similar-cases": <SimilarCases data={data} />,
              actions: <Actions data={data} />,
              "analyst-notes": <AnalystNotes />,
              timeline: <Timeline data={data} />,
            }}
          />
        </Suspense>
        <p
          data-ui="preview-footnote"
          className="pb-8 text-caption text-muted-foreground"
        >
          Screenshot-derived case · reconstructed before analyst confirmation · local preview interactions
        </p>
      </div>
    </div>
  );
}
