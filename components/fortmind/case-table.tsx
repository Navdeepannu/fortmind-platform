"use client";

import { cn } from "@/lib/utils";
import { queueIconClass, semanticStyles } from "@/lib/semantic-styles";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { caseHref } from "@/lib/platform-routes";
import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Columns3,
  Download,
  ListFilter,
  Rows3,
  AlignJustify,
  ChevronLeft,
  ChevronRight,
  Search,
  Copy,
  Check,
  CircleHelp,
  Network,
  Server,
  UserRound,
  Globe,
  Hash,
  File,
  Terminal,
  Eye,
  MoreHorizontal,
  ArrowUpRight,
  Clock3,
  ChevronDown,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePreviewCases } from "@/lib/preview-case-store";
import { assignmentStates } from "@/lib/semantic-states";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  cases,
  priorities,
  verdicts,
  sources,
  filterCases,
  matchesQueue,
  formatAge,
  investigationPhases,
  type SecurityCase,
  type Queue,
  type CaseFilters,
  type Source,
  type Tone,
} from "@/lib/preview-data";
import {
  oscarStates,
  phaseStates,
  priorityStates,
  queueStatusStates,
  verdictStates,
} from "@/lib/semantic-states";
import { QueueStatusIndicator, QueueVerdictBadge } from "./case-queue-semantic";
import {
  PriorityBadge,
  CaseStatusBadge,
  ConfidenceIndicator,
  SemanticIcon,
} from "./semantic";

const queues: Queue[] = ["Needs you", "Running", "Closed", "Failed", "All"];
const initialFilters: CaseFilters = {
  queue: "All",
  search: "",
  priority: "",
  verdict: "",
  assignment: "",
  source: "",
  autonomous: false,
};
const optionalColumns = [
  "priority",
  "verdict",
  "status",
  "owner",
  "age",
  "source",
] as const;
type OptionalColumn = (typeof optionalColumns)[number];
type SortKey = OptionalColumn | "title" | "attention";
const columnClasses: Record<OptionalColumn, string> = {
  priority: "w-28 max-[1201px]:w-25 max-md:hidden",
  verdict: "w-40 max-md:hidden",
  status: "w-[147px] max-[1201px]:w-[138px] max-md:hidden",
  owner: "w-31 max-[1201px]:w-[111px] max-[1101px]:hidden",
  age: "w-16 max-[1101px]:hidden",
  source: "w-37.5 text-xs max-md:hidden",
};
const currentAnalyst = "Navdeep Annu";
const sourceOptionIcons: Record<Source, LucideIcon> = {
  "SIEM webhook": Network,
  "Created by an analyst": UserRound,
  "Escalated incident": ArrowUpRight,
  "Other source": File,
};

function Owner({ name }: { name: string | null }) {
  const UnassignedIcon = assignmentStates.Unassigned.icon;
  return (
    <span
      data-ui="owner"
      className="inline-flex items-center gap-1.5 text-xs leading-4.5 whitespace-nowrap"
    >
      {name ? (
        <>
          <span
            data-ui="avatar"
            className="inline-flex items-center justify-center shrink-0 bg-secondary border border-border rounded-full font-medium w-5.5 h-5.5 text-[8px]"
            aria-hidden="true"
          >
            {name
              .split(" ")
              .map((part) => part[0])
              .join("")}
          </span>
          <span>
            {name.split(" ")[0]} {name.split(" ")[1][0]}.
          </span>
        </>
      ) : (
        <>
          <UnassignedIcon
            aria-hidden="true"
            className="w-4 h-4 text-muted-foreground"
          />
          <span
            className="text-muted-foreground"
            title={assignmentStates.Unassigned.meaning}
          >
            {assignmentStates.Unassigned.label}
          </span>
        </>
      )}
    </span>
  );
}
type FilterOption = {
  value: string;
  label: string;
  icon?: LucideIcon;
  tone?: Tone;
};

function FilterMenu({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
}) {
  const selected = options.find((option) => option.value === value);
  const SelectedIcon = selected?.icon;
  const DefaultIcon = label === "Owner" ? UsersRound : ListFilter;
  const defaultLabel = label === "Owner" ? "All owners" : label;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            data-ui="filter-trigger"
            variant="outline"
            size="sm"
            className="w-30 justify-between gap-1.5 [&>_svg]:flex-none [&[data-filter-active='true']]:border-ring [&[data-filter-active='true']]:text-foreground"
            aria-label={`Filter by ${label.toLowerCase()}: ${selected?.label ?? defaultLabel}`}
            title={selected?.label ?? defaultLabel}
            data-filter-active={Boolean(value)}
            data-filter-kind={label}
          />
        }
      >
        {SelectedIcon && (
          <SelectedIcon
            data-ui="filter-option-icon"
            className={cn(
              "size-4 shrink-0 stroke-2",
              queueIconClass(selected?.tone, selected?.label, label),
            )}
            data-tone={selected?.tone}
            data-state={selected?.label}
            aria-hidden="true"
          />
        )}
        <span
          data-ui="filter-trigger-label"
          className="flex-1 min-w-0 overflow-hidden text-ellipsis text-left"
        >
          {selected?.label ?? defaultLabel}
        </span>
        <ChevronDown data-icon="inline-end" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        data-ui="preview filter-menu"
        align="start"
        className="text-sm leading-5.5 text-foreground min-w-52.5 max-w-[min(300px,_calc(100vw_-_32px))]"
        data-filter-kind={label}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(next) => onChange(String(next))}
          >
            <DropdownMenuRadioItem
              value=""
              closeOnClick
              className="min-h-8 gap-2"
            >
              <DefaultIcon
                data-ui="filter-option-icon"
                className="size-4 shrink-0 stroke-2"
                aria-hidden="true"
              />
              {label === "Owner" ? "All owners" : `Any ${label.toLowerCase()}`}
            </DropdownMenuRadioItem>
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <DropdownMenuRadioItem
                  key={option.value}
                  value={option.value}
                  closeOnClick
                  className="min-h-8 gap-2"
                >
                  {Icon && (
                    <Icon
                      data-ui="filter-option-icon"
                      className={cn(
                        "size-4 shrink-0 stroke-2",
                        queueIconClass(option.tone, option.label, label),
                      )}
                      data-tone={option.tone}
                      data-state={option.label}
                      aria-hidden="true"
                    />
                  )}
                  {option.label}
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export function CopyTechnicalValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <span
      data-ui="copy-value"
      className="inline-flex items-start gap-0.75 max-w-full min-w-0"
    >
      <code
        title={value}
        className="min-w-0 font-mono text-[11px] leading-4.5 wrap-anywhere whitespace-normal select-all tracking-normal font-medium text-foreground"
      >
        {value}
      </code>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={`Copy ${label}`}
        title={`Copy ${label}`}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setFailed(false);
          } catch {
            setFailed(true);
          }
        }}
        className="flex-none text-muted-foreground"
      >
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      </Button>
      <span className="sr-only" role="status">
        {copied ? `${label} copied` : failed ? `Could not copy ${label}` : ""}
      </span>
    </span>
  );
}

const entityIcons = {
  hostname: Server,
  ip: Network,
  user: UserRound,
  hash: Hash,
  file: File,
  command: Terminal,
  domain: Globe,
  process: Terminal,
};

function usefulEntities(item: SecurityCase) {
  return Object.entries(item.entities).filter(
    ([, value]) => value?.trim() && !/^(?:not supplied|not available|unknown|n\/a|-|—)$/i.test(value.trim()),
  );
}

export function CasePreview({
  item,
  onClose,
}: {
  item: SecurityCase | null;
  onClose: () => void;
}) {
  const verdictLabel =
    item?.status === "Closed"
      ? "Final verdict"
      : item?.status === "Needs you" || item?.status === "Escalated"
        ? "OSCAR proposes"
        : "Current assessment";
  const currentPhase =
    item?.status === "Running" || item?.status === "Failed"
      ? investigationPhases.find(
          (phase) => phase.toLowerCase() === item.investigationPhase?.trim().toLowerCase(),
        )
      : undefined;
  const hasPhaseData =
    Object.values(item?.investigationPhases ?? {}).some(Boolean) || Boolean(currentPhase);
  return (
    <Sheet
      open={Boolean(item)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        data-ui="preview workspace case-sheet preview-sheet"
        className="text-sm leading-5.5 text-foreground w-full max-w-[510px] gap-0 overflow-hidden p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[510px]"
      >
        {item && (
          <>
            <SheetHeader
              data-ui="preview-header"
              className="flex-none pt-5.5 pr-6 pb-4.25 pl-6 gap-0 border-b border-border"
            >
              <div
                data-ui="preview-eyebrow"
                className="flex items-center gap-2.25 pr-8 text-[10px] leading-4.5 [font-weight:650] tracking-[.075em] text-muted-foreground"
              >
                <span>CASE PREVIEW</span>
                <CopyTechnicalValue label="case ID" value={item.id} />
              </div>
              <SheetTitle className="mt-2.5 pr-6.5 text-xl leading-6.75 [font-weight:650] tracking-[-.025em]">
                {item.title}
              </SheetTitle>
              <SheetDescription className="sr-only">
                Preview of case {item.id}
              </SheetDescription>
              <div
                data-ui="preview-states"
                className="flex flex-wrap items-center gap-2 mt-4 [&_[data-ui~='badge'][data-treatment='priority']]:text-xs [&_[data-ui~='badge'][data-treatment='status']]:text-xs"
              >
                <PriorityBadge value={item.priority} queue />
                <span
                  data-ui="state-divider"
                  aria-hidden="true"
                  className="w-px h-3.75 bg-border"
                />
                <CaseStatusBadge
                  value={item.status}
                  closedByOscar={item.closedByOscar}
                />
                <span
                  data-ui="state-divider"
                  aria-hidden="true"
                  className="w-px h-3.75 bg-border"
                />
                <span
                  data-ui="preview-verdict"
                  className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
                >
                  <span>{verdictLabel}</span>
                  <QueueVerdictBadge item={item} />
                </span>
              </div>
            </SheetHeader>
            <div
              data-ui="sheet-body preview-body"
              className="flex flex-col [&_section:last-child]:border-b-0 flex-1 min-h-0 overflow-y-auto pt-0 pr-6 pb-5 pl-6 gap-0"
            >
              <section
                data-ui="preview-summary"
                className="[&_h3_svg]:w-3.75 [&_h3_svg]:h-3.75 [&_h3_svg]:flex-none [&_h3_svg]:text-oscar-foreground pt-4.75 pr-0 pb-4.75 pl-0 border-b border-border"
                aria-labelledby="cases-preview-summary-title"
              >
                <h3
                  id="cases-preview-summary-title"
                  className="text-xs leading-4.5 [font-weight:650] tracking-[-.005em] flex items-center gap-1.75"
                >
                  <SemanticIcon definition={oscarStates.OSCAR} /> OSCAR summary
                </h3>
                <p className="mt-2.25 text-[13px] leading-5.25 text-foreground">
                  {item.summary}
                </p>
                {item.recommendedNextAction?.trim() && (
                  <p data-ui="preview-next-action" className="mt-2.25 text-xs leading-4.5">
                    <span className="font-semibold">Next action</span>
                    <span className="text-muted-foreground"> · {item.recommendedNextAction.trim()}</span>
                  </p>
                )}
              </section>
              <section
                data-ui="preview-section"
                className="pt-4.75 pr-0 pb-4.75 pl-0 border-b border-border"
                aria-labelledby="cases-preview-facts-title"
              >
                <h3
                  id="cases-preview-facts-title"
                  className="text-xs leading-4.5 [font-weight:650] tracking-[-.005em]"
                >
                  At a glance
                </h3>
                <dl
                  data-ui="preview-facts"
                  className="grid grid-cols-2 gap-y-3 gap-x-4.5 mt-3"
                >
                  <div className="min-w-0">
                    <dt className="text-muted-foreground text-[11px] leading-4.25">
                      Owner
                    </dt>
                    <dd className="mt-0.75 text-xs leading-4.75 font-medium">
                      <Owner name={item.owner} />
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-muted-foreground text-[11px] leading-4.25">
                      Source
                    </dt>
                    <dd className="mt-0.75 text-xs leading-4.75 font-medium">
                      {item.source}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-muted-foreground text-[11px] leading-4.25">
                      Age
                    </dt>
                    <dd className="mt-0.75 text-xs leading-4.75 font-medium">
                      {formatAge(item.ageMinutes)} ago
                    </dd>
                  </div>
                  {item.status !== "Queued" &&
                    item.status !== "Running" &&
                    item.status !== "Failed" && (
                      <div className="min-w-0">
                        <dt className="text-muted-foreground text-[11px] leading-4.25">
                          Investigation confidence
                        </dt>
                        <dd className="mt-0.75 text-xs leading-4.75 font-medium">
                          <ConfidenceIndicator {...item.confidence} />
                        </dd>
                      </div>
                    )}
                </dl>
              </section>
              <section
                data-ui="preview-section preview-progress"
                className="pt-4.75 pr-0 pb-4.75 pl-0 border-b border-border"
                aria-labelledby="cases-preview-progress-title"
              >
                <h3
                  id="cases-preview-progress-title"
                  className="text-xs leading-4.5 [font-weight:650] tracking-[-.005em]"
                >
                  Investigation progress
                </h3>
                <ol className="mt-2.75 grid grid-cols-5 gap-1.5">
                  {investigationPhases.map((phase) => {
                    const status = item.investigationPhases?.[phase] ??
                      (phase === currentPhase
                        ? item.status === "Failed" ? "failed" : "active"
                        : undefined);
                    return (
                      <li
                        key={phase}
                        data-phase={phase}
                        data-state={status ?? "unavailable"}
                        className="flex min-w-0 flex-col items-center gap-1 text-center text-[11px] leading-4 text-muted-foreground"
                        title={`${phase}: ${status ?? "unavailable"}`}
                      >
                        {status ? (
                          <SemanticIcon definition={phaseStates[status]} />
                        ) : (
                          <CircleHelp className="size-4 text-muted-foreground" aria-hidden="true" />
                        )}
                        <span>{phase}<span className="sr-only">: {status ?? "unavailable"}</span></span>
                      </li>
                    );
                  })}
                </ol>
                {!hasPhaseData && (
                  <p className="mt-2 text-center text-[11px] leading-4 text-muted-foreground">
                    Phase data unavailable
                  </p>
                )}
              </section>
              <section
                data-ui="preview-section"
                className="pt-4.75 pr-0 pb-4.75 pl-0 border-b border-border"
                aria-labelledby="cases-preview-entities-title"
              >
                <h3
                  id="cases-preview-entities-title"
                  className="text-xs leading-4.5 [font-weight:650] tracking-[-.005em]"
                >
                  Technical entities
                </h3>
                <dl data-ui="preview-entities" className="grid gap-2.5 mt-2.75">
                  {usefulEntities(item).map(([key, value]) => {
                    const Icon = entityIcons[key as keyof typeof entityIcons];
                    const label = key === "ip" ? "IP address" : key;
                    return (
                      <div
                        key={key}
                        className="grid grid-cols-[92px_minmax(0,_1fr)] items-start gap-2"
                      >
                        <dt className="text-muted-foreground text-[11px] leading-4.25 inline-flex items-center gap-1.75 capitalize">
                          <Icon
                            aria-hidden="true"
                            className="w-3.25 h-3.25 flex-none"
                          />
                          {label}
                        </dt>
                        <dd className="min-w-0 text-xs leading-4.75">
                          <CopyTechnicalValue label={label} value={value} />
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </section>
            </div>
            <SheetFooter
              data-ui="preview-footer"
              className="flex-none pt-3 pr-6 pb-3 pl-6 border-t border-border bg-card"
            >
              <Button
                nativeButton={false}
                render={<Link href={caseHref(item.id)} />}
                onClick={onClose}
                className="w-full justify-center h-8.5 rounded-md"
              >
                Open investigation <ArrowUpRight data-icon="inline-end" />
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function CaseTable({ initialQueue = "All" }: { initialQueue?: Queue }) {
  const router = useRouter();
  const created = usePreviewCases();
  const tableCases = useMemo(() => [...created, ...cases], [created]);
  const [filters, setFilters] = useState<CaseFilters>({
    ...initialFilters,
    queue: initialQueue,
  });
  const [density, setDensity] = useState("compact");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [columns, setColumns] = useState<Record<OptionalColumn, boolean>>({
    priority: true,
    verdict: true,
    status: true,
    owner: true,
    age: true,
    source: false,
  });
  const [sort, setSort] = useState<{ key: SortKey; descending: boolean }>({
    key: "attention",
    descending: false,
  });
  const [page, setPage] = useState(0);
  const [preview, setPreview] = useState<SecurityCase | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const owners = useMemo(
    () =>
      [
        ...new Set(
          tableCases.flatMap((item) => (item.owner ? [item.owner] : [])),
        ),
      ].sort(),
    [tableCases],
  );
  function updateFilter<K extends keyof CaseFilters>(
    key: K,
    value: CaseFilters[K],
  ) {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setPage(0);
  }
  const filtered = useMemo(
    () =>
      filterCases(tableCases, filters).sort((a, b) => {
        if (sort.key === "attention") {
          const rank = (item: SecurityCase) =>
            item.status === "Needs you" || item.status === "Escalated"
              ? 0
              : item.status === "Failed"
                ? 1
                : item.status === "Running"
                  ? 2
                  : item.status === "Queued"
                    ? 3
                    : 4;
          const result =
            rank(a) - rank(b) ||
            priorities.indexOf(a.priority) - priorities.indexOf(b.priority) ||
            a.ageMinutes - b.ageMinutes;
          return sort.descending ? -result : result;
        }
        const first =
          sort.key === "age"
            ? a.ageMinutes
            : sort.key === "priority"
              ? priorities.indexOf(a.priority)
              : sort.key === "owner"
                ? (a.owner ?? "")
                : a[sort.key as "title" | "verdict" | "status" | "source"];
        const second =
          sort.key === "age"
            ? b.ageMinutes
            : sort.key === "priority"
              ? priorities.indexOf(b.priority)
              : sort.key === "owner"
                ? (b.owner ?? "")
                : b[sort.key as "title" | "verdict" | "status" | "source"];
        return (
          (typeof first === "number" && typeof second === "number"
            ? first - second
            : String(first).localeCompare(String(second))) *
          (sort.descending ? -1 : 1)
        );
      }),
    [tableCases, filters, sort],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / 8));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(currentPage * 8, currentPage * 8 + 8);
  const visibleSelected = visible.filter((item) =>
    selected.has(item.id),
  ).length;
  const activeFilters = Boolean(
    filters.search ||
    filters.priority ||
    filters.verdict ||
    filters.assignment ||
    filters.source ||
    filters.autonomous,
  );
  function selectCase(id: string, checked: boolean) {
    setSelected((previous) => {
      const next = new Set(previous);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }
  function sortBy(key: SortKey) {
    const descending = sort.key === key ? !sort.descending : false;
    setSort({ key, descending });
    setPage(0);
    setAnnouncement(
      `Sorted by ${key}, ${descending ? "descending" : "ascending"}`,
    );
  }
  async function copyCaseId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      setAnnouncement(`${id} copied to clipboard.`);
    } catch {
      setAnnouncement(
        `Could not copy ${id}. The full ID is visible in the row.`,
      );
    }
  }
  function exportCases(scope: "view" | "selection") {
    const data =
      scope === "selection"
        ? tableCases.filter((item) => selected.has(item.id))
        : filtered;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "fortmind-demo-cases.json";
    link.click();
    URL.revokeObjectURL(url);
    setAnnouncement(`Exported ${data.length} demo cases.`);
  }
  function sortHeader(key: SortKey, label: string) {
    const Icon =
      sort.key !== key ? ArrowUpDown : sort.descending ? ArrowDown : ArrowUp;
    return (
      <Button variant="ghost" size="sm" onClick={() => sortBy(key)}>
        {label}
        <Icon data-icon="inline-end" />
      </Button>
    );
  }
  return (
    <section
      data-ui="case-section"
      className="mt-5.75 scroll-mt-5"
      aria-label="Case queue"
    >
      <Tabs
        data-ui="queue-tabs"
        value={filters.queue}
        onValueChange={(value) => updateFilter("queue", value as Queue)}
        className="gap-0"
      >
        <div
          data-ui="queue-top"
          className="mb-3.75 flex min-h-13 max-w-full items-center justify-between gap-6 max-[1001px]:overflow-x-auto"
        >
          <div
            data-ui="tab-box"
            className="pt-0 pr-2.5 pb-0 pl-2.5 border border-border rounded-lg bg-card shadow-sm"
          >
            <TabsList variant="line" aria-label="Case queue views">
              {queues.map((queue) => {
                const definition =
                  queue === "All" ? null : queueStatusStates[queue];
                const Icon = definition?.icon;
                return (
                  <TabsTrigger key={queue} value={queue}>
                    {Icon && (
                      <Icon
                        data-ui="tab-icon"
                        className={cn(
                          "size-4 shrink-0 stroke-2",
                          definition.label === "Needs You"
                            ? "text-warning-foreground"
                            : definition.label === "Closed"
                              ? "text-success"
                              : semanticStyles[definition.tone].foreground,
                        )}
                        data-tone={definition.tone}
                        data-state={definition.label}
                        data-semantic-icon={definition.iconName}
                        aria-hidden="true"
                      />
                    )}
                    {definition?.label ?? queue}
                    <span
                      data-ui="tab-count"
                      className="rounded-sm border bg-muted px-1.25 text-[10px] leading-4 font-medium tabular-nums text-muted-foreground"
                    >
                      {
                        tableCases.filter((item) => matchesQueue(item, queue))
                          .length
                      }
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
          <div
            data-ui="table-view-tools"
            className="ml-auto flex flex-none items-center gap-2"
          >
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" size="sm" />}
              >
                <Clock3 data-icon="inline-start" />
                {sort.key === "attention"
                  ? "Action first"
                  : sort.key === "age"
                    ? sort.descending
                      ? "Oldest first"
                      : "Newest first"
                    : sort.key === "priority"
                      ? "Priority"
                      : "Sort"}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                data-ui="preview menu"
                align="end"
                className="text-sm leading-5.5 text-foreground min-w-45"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Sort cases</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => {
                      setSort({ key: "attention", descending: false });
                      setPage(0);
                    }}
                  >
                    Action first
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSort({ key: "age", descending: false });
                      setPage(0);
                    }}
                  >
                    Newest first
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSort({ key: "age", descending: true });
                      setPage(0);
                    }}
                  >
                    Oldest first
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSort({ key: "priority", descending: false });
                      setPage(0);
                    }}
                  >
                    Highest priority
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <ToggleGroup
              aria-label="Table density"
              value={[density]}
              onValueChange={(value) => {
                if (value[0]) setDensity(value[0]);
              }}
              spacing={0}
              variant="outline"
            >
              <ToggleGroupItem
                value="compact"
                aria-label="Compact density"
                title="Compact density"
              >
                <AlignJustify />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="comfortable"
                aria-label="Comfortable density"
                title="Comfortable density"
              >
                <Rows3 />
              </ToggleGroupItem>
            </ToggleGroup>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" size="sm" />}
              >
                <Columns3 data-icon="inline-start" />
                Columns
              </DropdownMenuTrigger>
              <DropdownMenuContent
                data-ui="preview column-menu"
                align="end"
                className="text-sm leading-5.5 text-foreground min-w-46.25"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                  {optionalColumns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column}
                      checked={columns[column]}
                      onCheckedChange={(checked) =>
                        setColumns((previous) => ({
                          ...previous,
                          [column]: checked,
                        }))
                      }
                    >
                      {column[0].toUpperCase() + column.slice(1)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div
          data-ui="table-shell"
          className="overflow-hidden border border-border rounded-lg bg-card shadow-sm"
        >
          <div
            data-ui="filter-row"
            className="flex min-h-15.75 items-center justify-between gap-3.5 border-b bg-card px-4.5 py-3.5 max-[1260px]:flex-wrap max-[1260px]:gap-y-2"
          >
            <div
              data-ui="filter-controls"
              className="flex items-center min-w-0 gap-1.75 flex-none max-[1360px]:min-[1260px]:gap-1.5 max-[1260px]:w-full max-[1001px]:flex-wrap [&>_[data-slot='dropdown-menu-trigger']]:w-30 max-[1360px]:min-[1260px]:[&>_[data-slot='dropdown-menu-trigger']]:w-27 max-[1360px]:min-[1260px]:[&>_[data-slot='dropdown-menu-trigger']:not([data-ui~='filter-trigger'])]:pl-1.5 max-[1360px]:min-[1260px]:[&>_[data-slot='dropdown-menu-trigger']:not([data-ui~='filter-trigger'])]:pr-1.5 max-[1360px]:min-[1260px]:[&>_[data-slot='dropdown-menu-trigger']:not([data-ui~='filter-trigger'])]:text-[11px] max-[1360px]:min-[1260px]:[&>_[data-slot='dropdown-menu-trigger']:not([data-ui~='filter-trigger'])]:gap-1"
            >
              <FilterMenu
                label="Owner"
                value={filters.assignment}
                onChange={(value) => updateFilter("assignment", value)}
                options={[
                  {
                    label: "Assigned to me",
                    value: currentAnalyst,
                    icon: UserRound,
                  },
                  {
                    label: "Unassigned",
                    value: "unassigned",
                    icon: assignmentStates.Unassigned.icon,
                  },
                  ...owners
                    .filter((owner) => owner !== currentAnalyst)
                    .map((owner) => ({
                      label: owner,
                      value: owner,
                      icon: UserRound,
                    })),
                ]}
              />
              <FilterMenu
                label="Priority"
                value={filters.priority}
                onChange={(value) => updateFilter("priority", value)}
                options={priorities.map((value) => ({
                  label: value,
                  value,
                  icon: priorityStates[value].icon,
                  tone: priorityStates[value].tone,
                }))}
              />
              <FilterMenu
                label="Verdict"
                value={filters.verdict}
                onChange={(value) => updateFilter("verdict", value)}
                options={verdicts.map((value) => ({
                  label: value,
                  value,
                  icon: verdictStates[value].icon,
                  tone: verdictStates[value].tone,
                }))}
              />
              <FilterMenu
                label="Source"
                value={filters.source}
                onChange={(value) => updateFilter("source", value)}
                options={sources.map((value) => ({
                  label: value,
                  value,
                  icon: sourceOptionIcons[value],
                }))}
              />
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="outline" size="sm" />}
                >
                  <ListFilter data-icon="inline-start" />
                  More filters{filters.autonomous ? " · 1" : ""}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  data-ui="preview menu"
                  align="start"
                  className="text-sm leading-5.5 text-foreground min-w-45"
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Investigation</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                      checked={filters.autonomous}
                      onCheckedChange={(checked) =>
                        updateFilter("autonomous", checked)
                      }
                    >
                      <SemanticIcon
                        definition={queueStatusStates["Closed by OSCAR"]}
                      />
                      Closed by OSCAR only
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              {activeFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilters((previous) => ({
                      ...initialFilters,
                      queue: previous.queue,
                    }));
                    setPage(0);
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
            <div
              data-ui="filter-actions"
              className="flex items-center min-w-0 gap-1.75 flex-1 justify-end max-[1360px]:min-[1260px]:gap-1.5 max-[1260px]:w-full [&>_[data-slot='button']:hover]:text-foreground"
            >
              <div
                data-ui="search"
                className="relative w-auto max-w-91.25 [flex:1_1_245px] min-w-30 max-md:w-full max-[1260px]:max-w-110 max-[761px]:w-full"
              >
                <Search
                  aria-hidden="true"
                  className="absolute w-4 h-4 left-2.75 top-2.25 text-muted-foreground"
                />
                <Input
                  aria-label="Search titles, case IDs, IPs, hosts, or users"
                  placeholder="Search title, ID, IP, host, or user"
                  value={filters.search}
                  onChange={(event) =>
                    updateFilter("search", event.target.value)
                  }
                  className="pl-8.5 text-[13px] h-8.5 rounded-md bg-card"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => exportCases("view")}
                className="flex-none text-muted-foreground"
              >
                <Download data-icon="inline-start" /> Export view
              </Button>
            </div>
          </div>
          {selected.size > 0 && (
            <div
              data-ui="selection-toolbar"
              className="flex items-center gap-2.25 mt-3 mr-4.5 mb-3 ml-4.5 pt-1.75 pr-2.5 pb-1.75 pl-2.5 border border-border rounded-md bg-muted"
              role="toolbar"
              aria-label="Selected case actions"
            >
              <strong className="text-xs font-semibold mr-1">
                {selected.size} selected
              </strong>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCases("selection")}
                className="h-6.75"
              >
                <Download data-icon="inline-start" />
                Export selection
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelected(new Set())}
                className="h-6.75"
              >
                Clear selection
              </Button>
            </div>
          )}
          <TabsContent
            data-ui="table-panel"
            value={filters.queue}
            className="mt-0 mr-0 mb-0 ml-0"
          >
            <Table
              data-ui="case-table"
              className="group/queue min-w-[850px] table-fixed [&_tbody_td]:h-15.5 [&_tbody_td]:py-2 data-[density=comfortable]:[&_tbody_td]:h-19 data-[density=comfortable]:[&_tbody_td]:py-3.5 max-md:min-w-0"
              data-density={density}
            >
              <caption className="sr-only">
                {filters.queue} cases. Select a case title to inspect full
                technical details. {density} density.
              </caption>
              <TableHeader>
                <TableRow>
                  <TableHead
                    data-ui="col-select"
                    className="w-10.5 pl-4.5 max-md:w-8.5 max-md:pl-3"
                  >
                    <Checkbox
                      aria-label="Select all cases on this page"
                      checked={
                        visible.length > 0 && visibleSelected === visible.length
                      }
                      indeterminate={
                        visibleSelected > 0 && visibleSelected < visible.length
                      }
                      onCheckedChange={(checked) =>
                        setSelected((previous) => {
                          const next = new Set(previous);
                          visible.forEach((item) => {
                            if (checked) next.add(item.id);
                            else next.delete(item.id);
                          });
                          return next;
                        })
                      }
                    />
                  </TableHead>
                  {columns.priority && (
                    <TableHead
                      data-ui="col-priority"
                      className="w-28 max-[1201px]:w-25 max-md:hidden"
                      aria-sort={
                        sort.key === "priority"
                          ? sort.descending
                            ? "descending"
                            : "ascending"
                          : "none"
                      }
                    >
                      {sortHeader("priority", "Priority")}
                    </TableHead>
                  )}
                  <TableHead
                    data-ui="col-case"
                    aria-sort={
                      sort.key === "title"
                        ? sort.descending
                          ? "descending"
                          : "ascending"
                        : "none"
                    }
                  >
                    {sortHeader("title", "Case")}
                  </TableHead>
                  {optionalColumns
                    .filter(
                      (column) => column !== "priority" && columns[column],
                    )
                    .map((column) => (
                      <TableHead
                        key={column}
                        className={columnClasses[column]}
                        aria-sort={
                          sort.key === column
                            ? sort.descending
                              ? "descending"
                              : "ascending"
                            : "none"
                        }
                      >
                        {sortHeader(
                          column,
                          column[0].toUpperCase() + column.slice(1),
                        )}
                      </TableHead>
                    ))}
                  <TableHead
                    data-ui="col-actions"
                    className="w-19 pr-2.5 text-right whitespace-nowrap max-md:w-17.5"
                  >
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((item) => (
                  <TableRow
                    key={item.id}
                    data-state={selected.has(item.id) ? "selected" : undefined}
                    onClick={(event) => {
                      if (
                        event.defaultPrevented ||
                        event.button !== 0 ||
                        event.metaKey ||
                        event.ctrlKey ||
                        event.shiftKey ||
                        event.altKey ||
                        (event.target instanceof Element &&
                          event.target.closest("a, button, input, select, textarea, [role='checkbox'], [role^='menuitem']"))
                      ) return;
                      router.push(caseHref(item.id));
                    }}
                  >
                    <TableCell
                      data-ui="col-select"
                      className="w-10.5 pl-4.5 max-md:w-8.5 max-md:pl-3"
                    >
                      <Checkbox
                        aria-label={`Select ${item.id}`}
                        checked={selected.has(item.id)}
                        onCheckedChange={(checked) =>
                          selectCase(item.id, checked)
                        }
                      />
                    </TableCell>
                    {columns.priority && (
                      <TableCell
                        data-ui="col-priority"
                        className="w-28 max-[1201px]:w-25 max-md:hidden"
                      >
                        <PriorityBadge value={item.priority} queue />
                      </TableCell>
                    )}
                    <TableCell
                      data-ui="case-cell col-case"
                      className="max-md:py-3.5 max-md:pr-3 max-md:pl-1.5 max-md:whitespace-normal max-md:group-data-[density=comfortable]/queue:py-6"
                    >
                      <Link
                        data-ui="case-title"
                        href={caseHref(item.id)}
                        className="block w-full truncate rounded-xs text-left text-[13px] leading-4.75 font-semibold text-foreground hover:underline hover:underline-offset-3 max-md:line-clamp-2 max-md:whitespace-normal group-data-[density=comfortable]/queue:line-clamp-2 group-data-[density=comfortable]/queue:whitespace-normal"
                        title={item.title}
                      >
                        {item.title}
                      </Link>
                      <div
                        data-ui="case-meta"
                        className="@container mt-0.5 flex min-w-0 items-center gap-1.5 overflow-hidden text-[11px] leading-4.25 whitespace-nowrap text-muted-foreground"
                      >
                        <span
                          data-ui="mono"
                          className="shrink-0 font-mono text-xs leading-4.5 font-normal"
                          title={item.id}
                        >
                          {item.id}
                        </span>
                        <span className="shrink-0" aria-hidden="true">·</span>
                        <span
                          data-ui="source-meta"
                          className="inline-flex min-w-0 max-w-32 items-center gap-1"
                          title={item.source}
                        >
                          {(() => {
                            const SourceIcon = sourceOptionIcons[item.source];
                            return <SourceIcon className="size-3.25 shrink-0" aria-hidden="true" />;
                          })()}
                          <span className="truncate">{item.source}</span>
                        </span>
                        {usefulEntities(item).slice(0, 3).map(([key, value], index) => {
                          const Icon = entityIcons[key as keyof typeof entityIcons];
                          const label = key === "ip" ? "IP address" : key;
                          return (
                            <span
                              key={key}
                              data-ui="entity-meta"
                              className={cn(
                                "inline-flex min-w-0 items-center gap-1.5",
                                index === 1 && "@max-[360px]:hidden",
                                index === 2 && "@max-[520px]:hidden",
                              )}
                              title={`${label}: ${value}`}
                              aria-label={`${label}: ${value}`}
                            >
                              <span className="shrink-0" aria-hidden="true">·</span>
                              <Icon className="size-3.25 shrink-0" aria-hidden="true" />
                              <span
                                data-ui="mono"
                                className="truncate font-mono text-xs leading-4.5 font-normal"
                              >
                                {key === "file" ? value.split(/[\\/]/).pop() : value}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                      <div
                        data-ui="mobile-badges"
                        className="mt-2.25 hidden flex-wrap items-center gap-1.5 max-md:flex"
                      >
                        <PriorityBadge value={item.priority} queue />
                        <QueueVerdictBadge item={item} />
                        <QueueStatusIndicator item={item} />
                      </div>
                    </TableCell>
                    {columns.verdict && (
                      <TableCell
                        data-ui="col-verdict"
                        className="w-40 max-md:hidden"
                      >
                        <QueueVerdictBadge item={item} />
                      </TableCell>
                    )}
                    {columns.status && (
                      <TableCell
                        data-ui="col-status"
                        className="w-[147px] max-[1201px]:w-[138px] max-md:hidden"
                      >
                        <QueueStatusIndicator item={item} />
                      </TableCell>
                    )}
                    {columns.owner && (
                      <TableCell
                        data-ui="col-owner"
                        className="w-31 max-[1201px]:w-[111px] max-[1101px]:hidden"
                      >
                        <Owner name={item.owner} />
                      </TableCell>
                    )}
                    {columns.age && (
                      <TableCell
                        data-ui="col-age"
                        className="w-16 max-[1101px]:hidden"
                      >
                        <span
                          data-ui="caption"
                          title={`${item.ageMinutes} minutes ago`}
                          className="text-xs leading-4.5 font-normal text-muted-foreground tabular-nums"
                        >
                          {formatAge(item.ageMinutes)}
                        </span>
                      </TableCell>
                    )}
                    {columns.source && (
                      <TableCell
                        data-ui="col-source"
                        className="w-37.5 text-xs max-md:hidden"
                      >
                        {item.source}
                      </TableCell>
                    )}
                    <TableCell
                      data-ui="col-actions"
                      className="w-19 pr-2.5 text-right whitespace-nowrap max-md:w-17.5"
                    >
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Quick preview ${item.id}`}
                        title="Quick preview"
                        onClick={() => setPreview(item)}
                      >
                        <Eye aria-hidden="true" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`More actions for ${item.id}`}
                              title="More actions"
                            />
                          }
                        >
                          <MoreHorizontal aria-hidden="true" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          data-ui="preview menu"
                          align="end"
                          className="text-sm leading-5.5 text-foreground min-w-45"
                        >
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              render={<Link href={caseHref(item.id)} />}
                            >
                              <ArrowUpRight aria-hidden="true" />
                              Open investigation
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPreview(item)}>
                              <Eye aria-hidden="true" />
                              Quick preview
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => copyCaseId(item.id)}
                            >
                              <Copy aria-hidden="true" />
                              Copy case ID
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!filtered.length && (
              <Empty className="py-14">
                <EmptyHeader>
                  <Search aria-hidden="true" />
                  <EmptyTitle>
                    {activeFilters
                      ? "No matching cases"
                      : `No ${filters.queue.toLowerCase()} cases`}
                  </EmptyTitle>
                  <EmptyDescription>
                    {activeFilters
                      ? "Try a broader search or clear the active filters."
                      : "Cases will appear here when their investigation reaches this state."}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
            <div
              data-ui="table-footer"
              className="flex items-center justify-between gap-3 border-t pt-2.5 pr-4.5 pb-2.5 pl-4.5 border-border max-md:pt-3 max-md:pr-3 max-md:pb-3 max-md:pl-3 max-md:[&_[data-ui~='caption']]:text-[11px]"
            >
              <span
                data-ui="caption"
                role="status"
                className="text-xs leading-4.5 font-normal text-muted-foreground"
              >
                {selected.size ? `${selected.size} selected · ` : ""}
                {filtered.length
                  ? `${currentPage * 8 + 1}–${Math.min(currentPage * 8 + 8, filtered.length)} of ${filtered.length} cases`
                  : "0 cases"}
              </span>
              <span
                data-ui="caption preview-note"
                className="text-xs leading-4.5 font-normal text-muted-foreground ml-auto mr-4.5"
              >
                Local preview · no live data
              </span>
              <div className="flex items-center gap-3 max-md:gap-1.75">
                <span
                  data-ui="caption"
                  className="text-xs leading-4.5 font-normal text-muted-foreground"
                >
                  Page {currentPage + 1} of {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Previous page"
                  disabled={currentPage === 0}
                  onClick={() => setPage(currentPage - 1)}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Next page"
                  disabled={currentPage >= pageCount - 1}
                  onClick={() => setPage(currentPage + 1)}
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
      <span className="sr-only" role="status">
        {announcement}
      </span>
      <CasePreview item={preview} onClose={() => setPreview(null)} />
    </section>
  );
}
