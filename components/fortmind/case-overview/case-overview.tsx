import { cn } from "@/lib/utils";
import { semanticStyles } from "@/lib/semantic-styles";
import Link from "next/link";
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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
} from "@/components/fortmind/semantic";
import type {
  CaseOverviewData,
  OverviewEntity,
  OverviewFinding,
} from "@/lib/case-overview-data";
import { overviewSectionIds } from "@/lib/case-sections";
import { CopyIdentifier } from "./copy-identifier";
import { InvestigationSection } from "./investigation-section";
import { ReviewVerdict } from "./review-verdict";
import { SectionNavigation } from "./section-navigation";
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
      className="flex-none min-w-0 pt-4.5 pr-9 pb-5 pl-9 border-b border-border bg-background @max-[641px]/case:pl-5 @max-[641px]/case:pr-5 @max-[501px]/case:pt-3.5 @max-[501px]/case:pr-4 @max-[501px]/case:pb-4 @max-[501px]/case:pl-4"
    >
      <div
        data-ui="breadcrumb-row"
        className="flex items-center justify-start gap-4.5 @max-[501px]/case:gap-3"
      >
        <Breadcrumb data-ui="breadcrumb" className="text-[13px]">
          <BreadcrumbList className="gap-2 text-[13px]">
            <BreadcrumbItem>
              <BreadcrumbLink
                render={<Link href="/platform/cases" />}
                className="whitespace-nowrap"
              >
                ← Back to Cases
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="@max-[501px]/case:hidden" />
            <BreadcrumbItem>
              <BreadcrumbPage className="@max-[501px]/case:hidden">
                Investigation
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div
          data-ui="header-id"
          className="flex items-center gap-2.25 pl-4.5 border-l border-border text-muted-foreground text-xs @max-[501px]/case:pl-3"
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
          className="ml-auto text-muted-foreground text-xs @max-[501px]/case:hidden"
        >
          Case preview
        </span>
      </div>
      <h1 className="mt-3 text-2xl leading-[1.3] font-semibold tracking-[-.03em]">
        {data.title}
      </h1>
      <p
        data-ui="description"
        className="mt-1 max-w-[88ch] text-muted-foreground text-sm leading-[1.55]"
      >
        {data.description}
      </p>
      <div
        data-ui="header-states"
        className="flex items-center flex-wrap gap-y-2 gap-x-3.5 mt-4.25 text-[13px] @max-[501px]/case:mt-3.5 @max-[501px]/case:gap-y-2 @max-[501px]/case:gap-x-0 @max-[501px]/case:[&>_:nth-child(n+3)]:basis-full @max-[501px]/case:[&>_:nth-child(n+3)]:pl-0 @max-[501px]/case:[&>_:nth-child(n+3)]:border-l-0"
        aria-label="Case assessment and workflow"
      >
        <CaseStatusBadge value={data.status} />
        <PriorityBadge value={data.priority} />
        <span
          data-ui="inline-verdict"
          className="inline-flex items-center gap-1.5 [&>_span:last-child]:text-muted-foreground [&>_span:last-child]:text-xs @max-[501px]/case:[flex-basis:50%]"
        >
          OSCAR: <VerdictBadge value={data.proposedVerdict} />
          <span className="pl-3.5 border-l border-border">
            Analyze 70 · Report 70
          </span>
        </span>
        <span
          data-ui="ai-state"
          className="text-muted-foreground text-[13px] [&_svg]:w-3.75 [&_svg]:h-3.75 @max-[501px]/case:[flex-basis:50%]"
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
          <dt className="mb-1 text-muted-foreground text-xs">
            Involved entities
          </dt>
          <dd className="flex items-center flex-wrap gap-y-0.75 gap-x-2.75 min-w-0 text-[13px]">
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
          <dt className="mb-1 text-muted-foreground text-xs">Received</dt>
          <dd className="flex items-center flex-wrap gap-y-0.75 gap-x-2.75 min-w-0 text-[13px]">
            <time dateTime={data.investigation.receivedAt}>
              {data.investigation.dateLabel} ·{" "}
              {data.investigation.receivedLabel}
            </time>
          </dd>
        </div>
        <div>
          <dt className="mb-1 text-muted-foreground text-xs">Assigned to</dt>
          <dd className="flex items-center flex-wrap gap-y-0.75 gap-x-2.75 min-w-0 text-[13px]">
            {data.owner ?? "Unassigned"}
          </dd>
        </div>
        <div>
          <dt className="mb-1 text-muted-foreground text-xs">Source</dt>
          <dd className="flex items-center flex-wrap gap-y-0.75 gap-x-2.75 min-w-0 text-[13px]">
            {data.source}
          </dd>
        </div>
        <div>
          <dt className="mb-1 text-muted-foreground text-xs">MITRE ATT&CK</dt>
          <dd className="flex items-center flex-wrap gap-y-0.75 gap-x-2.75 min-w-0 text-[13px]">
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

function Conclusion({ data }: { data: CaseOverviewData }) {
  return (
    <InvestigationSection
      id="conclusion"
      title="OSCAR decision summary"
      description="Proposed assessment, evidence limits, and the analyst decision"
      footer={
        <div className="grid grid-cols-1 gap-3.75 @min-[760px]/case:grid-cols-[170px_minmax(0,1fr)]">
          <div>
            <h3 className="text-base leading-6 font-semibold tracking-[-.015em]">
              Recommended next steps
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Suggestions only; no response has been approved or executed here.
            </p>
          </div>
          <ol className="grid grid-cols-3 gap-x-6 gap-y-3.5 pl-4.5 list-decimal text-[13px] leading-5.25 marker:text-muted-foreground @max-[641px]/case:grid-cols-1">
            {data.nextSteps.map((step) => (
              <li className="pl-0.5" key={step}>
                {step}
              </li>
            ))}
          </ol>
        </div>
      }
    >
      <div
        data-ui="conclusion-top"
        className="grid grid-cols-1 gap-6.25 @min-[760px]/case:grid-cols-[minmax(0,1fr)_248px] @min-[760px]/case:gap-6.25"
      >
        <div data-ui="assessment">
          <p
            data-ui="eyebrow"
            className="text-muted-foreground text-xs font-medium"
          >
            OSCAR’s proposed verdict
          </p>
          <h3
            data-ui="proposed-verdict"
            className={cn(
              "mt-1.25 flex items-center gap-2.25 text-[26px] leading-8.75 font-semibold tracking-[-.03em] [&>svg]:size-5.5 [&>svg]:stroke-[1.7]",
              semanticStyles[verdictStates[data.proposedVerdict].tone]
                .foreground,
            )}
            data-tone={verdictStates[data.proposedVerdict].tone}
          >
            <SemanticIcon definition={verdictStates[data.proposedVerdict]} />
            {data.proposedVerdict}
          </h3>
          <p
            data-ui="assessment-summary"
            className="mt-3 max-w-[68ch] text-[15px] leading-6.25"
          >
            {data.assessment}
          </p>
          <p
            data-ui="confidence-summary"
            className="flex flex-wrap gap-y-1 gap-x-2.25 mt-4.5 text-muted-foreground text-xs [&_span:last-child]:basis-full"
          >
            <span>Investigation confidence</span>
            <strong className="text-foreground font-medium">
              Analyze 70 · Report 70
            </strong>
            <span>Medium by stage, not verdict confidence</span>
          </p>
          <div
            data-ui="supporting"
            className="mt-6 pt-5 border-t border-border [&_li_+_li]:border-t [&_li_+_li]:border-border [&_li_span:not([data-ui~='evidence-index'])]:block [&_li_span:not([data-ui~='evidence-index'])]:mt-1 [&_li_span:not([data-ui~='evidence-index'])]:text-muted-foreground [&_li_span:not([data-ui~='evidence-index'])]:text-xs [&_a:hover]:decoration-current"
          >
            <h3 className="text-base leading-6 [font-weight:550] tracking-[-.015em]">
              Key evidence
            </h3>
            <ul className="flex flex-col gap-0 mt-1.75">
              <li className="flex gap-3 pt-2.75 pb-2.75 text-sm leading-5.5">
                <span
                  data-ui="evidence-index"
                  className="pt-px text-muted-foreground font-mono text-xs"
                >
                  01
                </span>
                <div className="min-w-0">
                  <p>
                    The SIEM alert reports <code>procdump.exe</code> attempting
                    to access <code>lsass.exe</code> memory.
                  </p>
                  <span>Alert report · not independently confirmed</span>
                  <a
                    href="#finding-memory-access"
                    className="inline-flex items-center gap-1 mt-1 text-foreground text-xs font-medium underline decoration-border underline-offset-3"
                  >
                    View finding{" "}
                    <ArrowRight aria-hidden="true" className="w-3.25 h-3.25" />
                  </a>
                </div>
              </li>
              <li className="flex gap-3 pt-2.75 pb-2.75 text-sm leading-5.5">
                <span
                  data-ui="evidence-index"
                  className="pt-px text-muted-foreground font-mono text-xs"
                >
                  02
                </span>
                <div className="min-w-0">
                  <p>
                    Elasticsearch returned six active security alerts for{" "}
                    <code>fmlab-ws1</code>.
                  </p>
                  <span>
                    Tool result · relationship to this activity unresolved
                  </span>
                  <a
                    href="#finding-host-alerts"
                    className="inline-flex items-center gap-1 mt-1 text-foreground text-xs font-medium underline decoration-border underline-offset-3"
                  >
                    View finding{" "}
                    <ArrowRight aria-hidden="true" className="w-3.25 h-3.25" />
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <ReviewVerdict
          proposedVerdict={data.proposedVerdict}
          owner={data.owner}
          reason={data.decisionSummary}
          status={data.status}
        />
      </div>
      <div
        data-ui="conclusion-detail"
        className="mt-6 pt-5.5 border-t border-border"
      >
        <div
          data-ui="unresolved"
          className="grid grid-cols-2 gap-y-0 gap-x-6.25 @max-[501px]/case:grid-cols-1"
        >
          <h3 className="col-span-full text-base leading-6 [font-weight:550] tracking-[-.015em]">
            What remains uncertain
          </h3>
          <p
            data-ui="limitation"
            className="flex items-start gap-2 mt-3.5 text-sm leading-5.75 col-span-full"
          >
            <FileSearch
              aria-hidden="true"
              className="flex-none w-4 h-4 mt-0.75 text-muted-foreground"
            />
            The memory-access claim rests on the alert alone. No tool
            independently confirmed it.
          </p>
          {data.unresolved.map((item) => (
            <div
              data-ui="question"
              className="flex items-start gap-2 mt-3.75 [&>_svg]:flex-none [&>_svg]:w-3.75 [&>_svg]:h-3.75 [&>_svg]:mt-0.75 [&>_svg]:text-muted-foreground"
              key={item.question}
            >
              <SemanticIcon definition={outcomeStates.Unresolved} />
              <div>
                <h4 className="text-sm font-medium">{item.question}</h4>
                <p className="mt-0.75 text-muted-foreground text-[13px] leading-5.25">
                  {item.resolution}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </InvestigationSection>
  );
}

function EntityRow({ entity }: { entity: OverviewEntity }) {
  const Icon =
    entity.kind === "host"
      ? Monitor
      : entity.kind === "user"
        ? UserRound
        : Terminal;
  return (
    <TableRow
      data-ui="entity-row"
      id={`entity-${entity.id}`}
      className="scroll-mt-34 outline-none min-h-15.5 text-[13px]"
      tabIndex={-1}
    >
      <TableCell>
        <span
          data-ui="entity-kind"
          className="inline-flex items-center gap-1.75 text-muted-foreground capitalize"
        >
          <Icon aria-hidden="true" className="w-3.75 h-3.75" />
          {entity.kind}
        </span>
      </TableCell>
      <TableCell
        data-ui="entity-identity"
        className="[&_code]:text-foreground [&_code]:text-[13px]"
      >
        <CopyIdentifier value={entity.name} label={entity.name} />
      </TableCell>
      <TableCell data-ui="entity-description" className="min-w-0">
        {entity.role}
      </TableCell>
      <TableCell
        data-ui="entity-sources"
        className="text-muted-foreground text-xs leading-4.75"
      >
        {entity.sources.join(" · ")}
      </TableCell>
      <TableCell>
        <span
          data-ui="entity-context"
          className="text-muted-foreground text-xs leading-4.75 flex flex-col"
        >
          {entity.findingCount !== undefined && (
            <span>{entity.findingCount} findings</span>
          )}
          {entity.otherCaseCount !== undefined && (
            <span>
              {entity.otherCaseCount
                ? `${entity.otherCaseCount} other cases`
                : "Only this case"}
            </span>
          )}
        </span>
      </TableCell>
    </TableRow>
  );
}

function Entities({ data }: { data: CaseOverviewData }) {
  return (
    <InvestigationSection
      id="entities"
      title="Entities"
      count={data.entities.length}
      description="Identifiers and relationships recorded in this investigation"
      footer={
        <p className="text-xs leading-5 text-muted-foreground">
          The source classifies the host and user as “Confirmed affected.” That
          label does not establish compromise.
        </p>
      }
    >
      <Table
        data-ui="entity-table"
        className="min-w-187.5 table-fixed [&_:is(th,td)]:pt-3.25 [&_:is(th,td)]:pr-3 [&_:is(th,td)]:pb-3.25 [&_:is(th,td)]:pl-3 [&_:is(th,td)]:whitespace-normal [&_:is(th,td)]:align-middle [&_th:nth-child(1)]:w-26.25 [&_th:nth-child(2)]:w-46.25 [&_th:nth-child(4)]:w-42.5 [&_th:nth-child(5)]:w-31.25"
      >
        <TableHeader>
          <TableRow>
            <TableHead
              scope="col"
              className="text-muted-foreground text-xs font-medium"
            >
              Type
            </TableHead>
            <TableHead
              scope="col"
              className="text-muted-foreground text-xs font-medium"
            >
              Identifier
            </TableHead>
            <TableHead
              scope="col"
              className="text-muted-foreground text-xs font-medium"
            >
              Relationship
            </TableHead>
            <TableHead
              scope="col"
              className="text-muted-foreground text-xs font-medium"
            >
              Source
            </TableHead>
            <TableHead
              scope="col"
              className="text-muted-foreground text-xs font-medium"
            >
              Related
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.entities.map((entity) => (
            <EntityRow entity={entity} key={entity.id} />
          ))}
        </TableBody>
      </Table>
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
              className="flex justify-between flex-wrap gap-y-0.75 gap-x-3 text-muted-foreground text-[11px]"
            >
              <span>
                {item.caseId ? `Case ${item.caseId}` : "Case ID unavailable"}
              </span>
              <time dateTime={item.receivedAt}>{item.receivedLabel}</time>
            </div>
            <h3 className="text-sm leading-5.25 [font-weight:550]">
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
            <p className="mt-auto text-muted-foreground text-xs leading-4.75">
              Similar because both cases name <code>{item.sharedEntity}</code>.
              No analyst-confirmed outcome is supplied.
            </p>
          </article>
        ))}
      </div>
      <p
        data-ui="section-note"
        className="mt-5 pt-3.5 border-t border-border text-muted-foreground text-xs"
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
      className="scroll-mt-34 outline-none border-t border-border [&_summary::-webkit-details-marker]:hidden [&_summary:hover]:bg-muted [&_summary:focus-visible]:outline-2 [&_summary:focus-visible]:outline-ring [&_summary:focus-visible]:-outline-offset-2"
      id={`finding-${finding.id}`}
    >
      <summary className="flex items-start gap-3.75 pt-4.25 pr-6 pb-4.25 pl-6 cursor-pointer list-none @max-[501px]/case:pl-3.25 @max-[501px]/case:pr-3.25">
        <span
          data-ui="finding-number"
          className="pt-0.5 text-muted-foreground font-mono text-[11px]"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          data-ui="finding-content"
          className="flex flex-1 flex-col gap-1 min-w-0"
        >
          <span
            data-ui="finding-title-row"
            className="flex items-center flex-wrap gap-2"
          >
            <strong className="text-sm leading-5.5 [font-weight:550]">
              {finding.title}
            </strong>
            {finding.severity && <SeverityBadge value={finding.severity} />}
          </span>
          <span
            data-ui="finding-summary"
            className="text-muted-foreground text-[13px] leading-5"
          >
            {finding.summary}
          </span>
          <span
            data-ui="finding-metadata"
            className="flex flex-wrap gap-y-0.75 gap-x-3.75 mt-0.5 text-muted-foreground text-[11px]"
          >
            <span>{finding.evidenceState}</span>
            <span>· {finding.relationship}</span>
          </span>
        </span>
        <ChevronDown
          data-ui="finding-chevron"
          className="flex-none w-4 h-4 mt-0.5 text-muted-foreground transition-transform duration-150 group-open/finding:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div
        data-ui="finding-expanded"
        className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-5.5 pt-4.75 pr-6 pb-5.25 pl-12.5 border-t border-border bg-muted @max-[641px]/case:grid-cols-1 @max-[641px]/case:gap-3.25 @max-[501px]/case:pl-10.25"
      >
        <div>
          <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-[.04em]">
            Evidence and interpretation
          </span>
          <p className="mt-1.5 text-[13px] leading-5.5">{finding.detail}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-[.04em]">
            Source / provenance
          </span>
          <p className="mt-1.5 text-[13px] leading-5.5">
            <FileSearch
              aria-hidden="true"
              className="inline w-3.25 h-3.25 mr-1.5 [vertical-align:-2px] text-muted-foreground"
            />
            {finding.provenance}
          </p>
        </div>
      </div>
    </details>
  );
}

function Findings({ data }: { data: CaseOverviewData }) {
  return (
    <InvestigationSection
      id="findings"
      title="Findings"
      count={data.findings.length}
      description="What the alert and source lookups reported, and what they leave unresolved"
    >
      <div
        data-ui="findings-list"
        className="overflow-hidden rounded-[inherit]"
      >
        {data.findings.map((finding, index) => (
          <FindingRow key={finding.id} finding={finding} index={index} />
        ))}
      </div>
    </InvestigationSection>
  );
}

function InvestigationSummary({ data }: { data: CaseOverviewData }) {
  return (
    <InvestigationSection
      id="how-oscar-decided"
      title="How OSCAR decided"
      description="Investigation completion, confidence by stage, and review handoff"
      metadata={
        <SemanticBadge
          definition={outcomeStates["Investigation complete"]}
          treatment="inline"
          label="Complete"
        />
      }
      footer={
        <p className="text-xs">
          OSCAR completed its investigation. The case workflow still requires
          analyst review.
        </p>
      }
    >
      <div
        data-ui="investigation-summary"
        className="grid grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] gap-8.5 @max-[861px]/case:grid-cols-1 @max-[861px]/case:gap-5.75"
      >
        <div data-ui="process-summary">
          <h3 className="text-base leading-6 [font-weight:550] tracking-[-.015em]">
            Investigation handoff
          </h3>
          <p className="max-w-[65ch] mt-2 text-muted-foreground text-[13px] leading-5.5">
            {data.reviewReason}
          </p>
          <dl
            data-ui="investigation-times"
            className="flex flex-col gap-2.25 mt-4.25 text-xs"
          >
            <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2.5">
              <dt className="text-muted-foreground">Received</dt>
              <dd>
                <time dateTime={data.investigation.receivedAt}>
                  {data.investigation.dateLabel} ·{" "}
                  {data.investigation.receivedLabel}
                </time>
              </dd>
            </div>
            <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2.5">
              <dt className="text-muted-foreground">Concluded</dt>
              <dd>
                <time dateTime={data.investigation.concludedAt}>
                  {data.investigation.dateLabel} ·{" "}
                  {data.investigation.concludedLabel}
                </time>
              </dd>
            </div>
            <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2.5">
              <dt className="text-muted-foreground">Reported duration</dt>
              <dd>{data.investigation.durationLabel}</dd>
            </div>
          </dl>
        </div>
        <div
          data-ui="stage-confidence"
          className="[&_:is(th,td)]:pt-1.75 [&_:is(th,td)]:pr-1.75 [&_:is(th,td)]:pb-1.75 [&_:is(th,td)]:pl-1.75 [&_:is(th,td)]:border-b [&_:is(th,td)]:border-border [&_:is(th,td)]:text-left [&_th:first-child]:pl-0 [&_td:nth-child(2)]:tabular-nums"
        >
          <table className="w-full border-collapse text-xs">
            <caption className="mb-1.5 text-left text-base [font-weight:550]">
              Confidence by stage
            </caption>
            <thead className="text-muted-foreground">
              <tr>
                <th scope="col" className="font-normal">
                  Stage
                </th>
                <th scope="col" className="font-normal">
                  Score
                </th>
                <th scope="col" className="font-normal">
                  Level
                </th>
              </tr>
            </thead>
            <tbody>
              {data.investigation.confidence.map((stage) => (
                <tr key={stage.phase}>
                  <th scope="row" className="font-normal">
                    {stage.phase}
                  </th>
                  <td>{stage.value}</td>
                  <td>
                    <ConfidenceIndicator level={stage.level} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2.25 text-muted-foreground text-xs leading-5">
            Plan is a pre-lookup estimate. Analyze and Report are the scores
            relevant to OSCAR’s review handoff.
          </p>
        </div>
      </div>
      <div
        data-ui="completed-phases"
        className="mt-6 pt-5 border-t border-border [&_svg]:w-3.25 [&_svg]:h-3.25"
      >
        <h3 className="text-base leading-6 [font-weight:550] tracking-[-.015em]">
          Investigation phases
        </h3>
        <ol className="flex flex-wrap gap-y-1.75 gap-x-4.5 mt-2.25">
          {data.investigation.phases.map((phase) => (
            <li
              key={phase.name}
              className="inline-flex items-center gap-1.25 text-muted-foreground text-xs"
            >
              <SemanticIcon definition={phaseStates[phase.state]} />
              <span>
                {phase.name}
                <span className="sr-only">: {phase.state}</span>
              </span>
            </li>
          ))}
        </ol>
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
          <code>lab.bob</code>
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
          <code>procdump.exe</code>
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
          <code>lsass.exe</code>
        </span>
      </div>
      <p
        data-ui="section-note"
        className="mt-5 pt-3.5 border-t border-border text-muted-foreground text-xs"
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
      title="Hypotheses"
      count={data.hypotheses.length}
      description="Alternative explanations considered by OSCAR"
    >
      <div data-ui="record-list" className="flex flex-col">
        {data.hypotheses.map((item, index) => (
          <article
            data-ui="record"
            className="pt-4.25 mt-4.25 border-t border-border"
            key={item.title}
          >
            <div
              data-ui="record-top"
              className="flex items-center justify-between gap-3 text-muted-foreground text-xs"
            >
              <span>
                H{index + 1} · {item.result}
              </span>
              <strong className="text-foreground font-medium">
                Medium · {item.score}
              </strong>
            </div>
            <h3 className="mt-1.25 text-[15px] leading-5.75 [font-weight:550]">
              {item.title}
            </h3>
            <p className="max-w-[90ch] mt-1.5 text-muted-foreground text-[13px] leading-5.25">
              {item.explanation}
            </p>
          </article>
        ))}
      </div>
    </InvestigationSection>
  );
}

function Evidence({ data }: { data: CaseOverviewData }) {
  return (
    <InvestigationSection
      id="evidence"
      title="Evidence"
      count={data.evidence.length}
      description="Captured source response summaries; raw requests and responses were not supplied"
    >
      <div
        data-ui="table-scroll"
        className="max-w-full overflow-x-auto [&:focus-visible]:outline-2 [&:focus-visible]:outline-ring [&:focus-visible]:-outline-offset-2 [&_[data-slot='table-container']]:w-[max-content] [&_[data-slot='table-container']]:min-w-full [&_[data-slot='table-container']]:overflow-visible"
        role="region"
        aria-label="Evidence results"
        tabIndex={0}
      >
        <Table
          data-ui="evidence-table"
          className="min-w-162.5 [&_:is(th,td)]:pt-2.75 [&_:is(th,td)]:pr-3.5 [&_:is(th,td)]:pb-2.75 [&_:is(th,td)]:pl-3.5 [&_:is(th,td)]:align-top [&_:is(th,td)]:text-[13px] [&_:is(th,td)]:leading-5 [&_th:first-child]:w-32.5 [&_th:nth-child(2)]:w-38.75"
        >
          <TableHeader>
            <TableRow>
              <TableHead
                scope="col"
                className="text-muted-foreground text-xs font-medium"
              >
                Source
              </TableHead>
              <TableHead
                scope="col"
                className="text-muted-foreground text-xs font-medium"
              >
                Lookup
              </TableHead>
              <TableHead
                scope="col"
                className="text-muted-foreground text-xs font-medium"
              >
                Response summary
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.evidence.map((item, index) => (
              <TableRow key={`${item.source}-${index}`}>
                <TableCell>{item.source}</TableCell>
                <TableCell>{item.context}</TableCell>
                <TableCell>{item.result}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p
        data-ui="section-note"
        className="mt-5 pt-3.5 border-t border-border text-muted-foreground text-xs"
      >
        Successful lookups establish only the response shown. Empty results do
        not establish benign activity.
      </p>
    </InvestigationSection>
  );
}

function Actions({ data }: { data: CaseOverviewData }) {
  return (
    <InvestigationSection
      id="actions"
      title="Actions"
      count={data.actions.length}
      description="OSCAR recommendations awaiting approval in the captured case"
    >
      <div data-ui="record-list" className="flex flex-col">
        {data.actions.map((item, index) => (
          <div
            data-ui="action-row"
            className="grid grid-cols-[22px_minmax(0,1fr)_auto] items-start gap-2.5 text-[13px] pt-4.25 mt-4.25 border-t border-border @max-[501px]/case:grid-cols-[22px_minmax(0,1fr)] [&>_span:last-child]:text-muted-foreground [&>_span:last-child]:text-xs [&>_span:last-child]:whitespace-nowrap @max-[501px]/case:[&>_span:last-child]:col-start-2"
            key={item.title}
          >
            <span
              data-ui="evidence-index"
              className="pt-px text-muted-foreground font-mono text-xs"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <strong className="text-sm leading-5.5 font-medium">
                {item.title}
              </strong>
              {item.condition && (
                <p className="mt-0.75 text-muted-foreground">
                  {item.condition}
                </p>
              )}
            </div>
            <span>Waiting for approval</span>
          </div>
        ))}
      </div>
      <p
        data-ui="section-note"
        className="mt-5 pt-3.5 border-t border-border text-muted-foreground text-xs"
      >
        The source interface says only an administrator can approve or reject
        these recommendations. No response has been approved or executed in this
        preview.
      </p>
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
      <p data-ui="empty-state" className="text-muted-foreground text-[13px]">
        No notes had been written on this case in the supplied capture.
      </p>
    </InvestigationSection>
  );
}

function Timeline({ data }: { data: CaseOverviewData }) {
  return (
    <InvestigationSection
      id="timeline"
      title="Timeline"
      description="Visible events from the captured investigation and later analyst activity"
    >
      <ol
        data-ui="timeline"
        className="flex flex-col [&_li:first-child]:pt-0 [&_li:last-child]:pb-0 [&_li:last-child]:border-b-0"
      >
        {data.activity.map((item, index) => (
          <li
            key={`${item.event}-${index}`}
            className="grid grid-cols-[190px_minmax(0,1fr)] gap-4 pt-2.5 pr-0 pb-2.5 pl-0 border-b border-border text-[13px] @max-[501px]/case:grid-cols-1 @max-[501px]/case:gap-0.5"
          >
            <time className="text-muted-foreground tabular-nums">
              {item.time}
            </time>
            <span>
              <strong className="[font-weight:550]">{item.actor}</strong> ·{" "}
              {item.event}
            </span>
          </li>
        ))}
      </ol>
      <p
        data-ui="section-note"
        className="mt-5 pt-3.5 border-t border-border text-muted-foreground text-xs"
      >
        The captured interface lists 17 events; the 12 legible events are
        reproduced here. The later analyst confirmation is historical and is not
        applied to this pre-confirmation preview.
      </p>
    </InvestigationSection>
  );
}

export function CaseOverview({ data }: { data: CaseOverviewData }) {
  return (
    <div
      data-ui="case workspace"
      className="@container/case w-full min-w-0 flex-1 bg-background text-sm leading-[1.55]"
      id="preview-main"
      data-case-workspace
      data-inspector-open="false"
    >
      <div data-ui="layout" className="flex flex-col min-h-0">
        <CaseHeader data={data} />
        <SectionNavigation
          sections={overviewSectionIds}
          caseId={data.id}
          status={data.status}
          counts={{
            entities: data.entities.length,
            "similar-cases": data.relatedCases.length,
            hypotheses: data.hypotheses.length,
            findings: data.findings.length,
            evidence: data.evidence.length,
            actions: data.actions.length,
          }}
        />
        <div data-ui="scroll-region" className="min-w-0 overflow-visible">
          <div
            data-ui="document"
            className="flex flex-col gap-10.5 min-w-0 max-w-370 mt-0 mr-auto mb-0 ml-auto pt-7 pr-9 pb-18 pl-9 @max-[641px]/case:pl-5 @max-[641px]/case:pr-5 @max-[501px]/case:pt-5 @max-[501px]/case:pr-4 @max-[501px]/case:pb-10 @max-[501px]/case:pl-4 @max-[501px]/case:gap-11"
          >
            <div
              data-ui="section-group"
              className="flex flex-col gap-9 min-w-0 pt-6.75 border-t border-border @max-[501px]/case:gap-9"
              role="group"
              aria-labelledby="case-decision-group"
            >
              <p
                data-ui="group-label"
                id="case-decision-group"
                className="-mb-5 text-muted-foreground text-xs leading-4.5 font-medium"
              >
                Decision
              </p>
              <Conclusion data={data} />
            </div>
            <div
              data-ui="section-group"
              className="flex flex-col gap-9 min-w-0 pt-6.75 border-t border-border @max-[501px]/case:gap-9"
              role="group"
              aria-labelledby="case-investigation-group"
            >
              <p
                data-ui="group-label"
                id="case-investigation-group"
                className="-mb-5 text-muted-foreground text-xs leading-4.5 font-medium"
              >
                Investigation
              </p>
              <AttackPath data={data} />
              <Hypotheses data={data} />
              <Findings data={data} />
              <InvestigationSummary data={data} />
            </div>
            <div
              data-ui="section-group"
              className="flex flex-col gap-9 min-w-0 pt-6.75 border-t border-border @max-[501px]/case:gap-9"
              role="group"
              aria-labelledby="case-context-group"
            >
              <p
                data-ui="group-label"
                id="case-context-group"
                className="-mb-5 text-muted-foreground text-xs leading-4.5 font-medium"
              >
                Context and evidence
              </p>
              <Entities data={data} />
              <SimilarCases data={data} />
              <Evidence data={data} />
            </div>
            <div
              data-ui="section-group"
              className="flex flex-col gap-9 min-w-0 pt-6.75 border-t border-border @max-[501px]/case:gap-9"
              role="group"
              aria-labelledby="case-response-group"
            >
              <p
                data-ui="group-label"
                id="case-response-group"
                className="-mb-5 text-muted-foreground text-xs leading-4.5 font-medium"
              >
                Response and history
              </p>
              <Actions data={data} />
              <AnalystNotes />
              <Timeline data={data} />
            </div>
            <p
              data-ui="preview-footnote"
              className="text-muted-foreground text-[11px]"
            >
              Screenshot-derived case · reconstructed before analyst
              confirmation · local preview interactions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
