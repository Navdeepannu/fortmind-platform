"use client";

import { cn } from "@/lib/utils";
import { queueIconClass } from "@/lib/semantic-styles";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { caseHref } from "@/lib/platform-routes";
import { useMemo, useState, type ReactElement } from "react";
import {
  ChevronDown,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  ListFilter,
  ChevronLeft,
  ChevronRight,
  Search,
  Copy,
  Check,
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
  SlidersHorizontal,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePreviewCases } from "@/lib/preview-case-store";
import { assignmentStates } from "@/lib/semantic-states";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "@/components/ui/popover";
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
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
  statuses,
  formatAge,
  type SecurityCase,
  type Queue,
  type CaseStatus,
  type CaseFilters,
  type Source,
  type Tone,
} from "@/lib/preview-data";
import { priorityStates, queueStatusStates } from "@/lib/semantic-states";
import {
  caseListViews,
  caseListEntry,
  matchesCaseListView,
  type CaseListView,
} from "@/lib/case-list-views";
import { QueueStatusIndicator, QueueVerdictBadge } from "./case-queue-semantic";
import { PriorityBadge, CaseStatusBadge } from "./semantic";

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
  "verdict",
  "priority",
  "status",
  "owner",
  "age",
  "source",
] as const;
type OptionalColumn = (typeof optionalColumns)[number];
type SortKey = OptionalColumn | "title" | "attention";
const columnClasses: Record<OptionalColumn, string> = {
  priority: "w-34 max-[1200px]:hidden",
  verdict: "w-46 max-[1000px]:hidden",
  status: "w-36 max-[1000px]:hidden",
  owner: "w-28 max-[1399px]:hidden",
  age: "w-16 max-[1100px]:hidden",
  source: "w-40 text-xs max-[1000px]:hidden",
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
          <span className="inline-flex size-5.5 shrink-0 items-center justify-center">
            <UnassignedIcon
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
          </span>
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

function CaseFilterSubmenu({
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
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        {label}
        {selected && (
          <span className="ml-auto max-w-24 truncate text-caption text-muted-foreground">
            {selected.label}
          </span>
        )}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent
        data-ui="filter-menu"
        data-filter-kind={label}
        className="min-w-56"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(next) => onChange(String(next))}
          >
            <DropdownMenuRadioItem value="" closeOnClick>
              {label === "Owner" ? "All owners" : `Any ${label.toLowerCase()}`}
            </DropdownMenuRadioItem>
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <DropdownMenuRadioItem
                  key={option.value}
                  value={option.value}
                  closeOnClick
                >
                  {Icon && (
                    <Icon
                      className={queueIconClass(
                        option.tone,
                        option.label,
                        label,
                      )}
                      aria-hidden="true"
                    />
                  )}
                  {option.label}
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
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
        className="min-w-0 font-mono text-caption leading-4.5 wrap-anywhere whitespace-normal select-all tracking-normal font-medium text-foreground"
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
    ([, value]) =>
      value?.trim() &&
      !/^(?:not supplied|not available|unknown|n\/a|-|—)$/i.test(value.trim()),
  );
}

/** A nonmodal preview stays anchored to the case that opened it. */
export function CaseQuickPreview({
  item,
  children,
  open,
  onOpenChange,
}: {
  item: SecurityCase;
  children: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [localOpen, setLocalOpen] = useState(false);
  const changeOpen = onOpenChange ?? setLocalOpen;
  const verdictLabel =
    item.status === "Closed"
      ? "Final verdict"
      : item.status === "Needs you" || item.status === "Escalated"
        ? "OSCAR proposes"
        : "Current assessment";
  const context = usefulEntities(item)
    .filter(([key]) => ["hostname", "user", "ip"].includes(key))
    .slice(0, 1);
  return (
    <Popover open={open ?? localOpen} onOpenChange={changeOpen} modal={false}>
      <PopoverTrigger render={children} />
      <PopoverContent
        data-ui="case-preview"
        align="end"
        sideOffset={8}
        className="w-[440px] max-w-[calc(100vw-32px)] max-h-[min(480px,calc(100dvh-32px))] gap-0 overflow-hidden p-0"
        onClick={(event) => event.stopPropagation()}
      >
        <PopoverHeader className="shrink-0 gap-2 border-b p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-caption text-muted-foreground">
              <CopyTechnicalValue label="case ID" value={item.id} />
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {formatAge(item.ageMinutes)} ago
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Close case preview"
              onClick={() => changeOpen(false)}
            >
              <X />
            </Button>
          </div>
          <PopoverTitle className="pr-2 text-panel-title">
            {item.title}
          </PopoverTitle>
          <PopoverDescription className="sr-only">
            Quick assessment and next action for {item.id}.
          </PopoverDescription>
          <div className="flex flex-wrap items-center gap-3">
            <PriorityBadge value={item.priority} queue />
            <CaseStatusBadge
              value={item.status}
              closedByOscar={item.closedByOscar}
            />
          </div>
        </PopoverHeader>
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-label text-muted-foreground">
              {verdictLabel}
            </span>
            <QueueVerdictBadge item={item} />
          </div>
          <p
            data-ui="preview-summary"
            className="line-clamp-3 shrink-0 text-body"
          >
            {item.summary}
          </p>
          {item.recommendedNextAction?.trim() && (
            <div
              data-ui="preview-next-action"
              className="flex shrink-0 flex-col gap-1 rounded-md bg-muted p-3 ring-1 ring-inset ring-border"
            >
              <span className="text-label font-medium">Next action</span>
              <p className="line-clamp-2 text-label text-muted-foreground">
                {item.recommendedNextAction.trim()}
              </p>
            </div>
          )}
          <dl className="grid grid-cols-2 gap-x-5 gap-y-3 text-label">
            <div className="min-w-0">
              <dt className="text-caption text-muted-foreground">Owner</dt>
              <dd className="mt-1">
                <Owner name={item.owner} />
              </dd>
            </div>
            {context.map(([key, value]) => (
              <div key={key} className="min-w-0">
                <dt className="text-caption capitalize text-muted-foreground">
                  {key === "ip"
                    ? "IP address"
                    : key === "hostname"
                      ? "Host"
                      : key}
                </dt>
                <dd
                  className="mt-1 truncate font-mono text-caption"
                  title={value}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex shrink-0 items-center justify-end border-t px-4 py-3">
          <Button
            nativeButton={false}
            role="link"
            variant="outline"
            size="sm"
            render={<Link href={caseHref(item.id)} />}
          >
            Open investigation <ArrowUpRight data-icon="inline-end" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function CaseTable({
  initialQueue = "All",
  initialView,
}: {
  initialQueue?: Queue;
  initialView?: CaseListView;
}) {
  const router = useRouter();
  const created = usePreviewCases();
  const tableCases = useMemo(() => [...created, ...cases], [created]);
  const entry = caseListEntry(initialQueue);
  const [view, setView] = useState<CaseListView>(initialView ?? entry.view);
  const [caseStatus, setCaseStatus] = useState<CaseStatus | "">(entry.status);
  const [filters, setFilters] = useState<CaseFilters>(initialFilters);
  const [density, setDensity] = useState("comfortable");
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
    setPreview(null);
  }
  const filtered = useMemo(
    () =>
      filterCases(tableCases, filters)
        .filter(
          (item) =>
            matchesCaseListView(item, view, currentAnalyst) &&
            (!caseStatus || item.status === caseStatus),
        )
        .sort((a, b) => {
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
    [tableCases, filters, sort, view, caseStatus],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / 8));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(currentPage * 8, currentPage * 8 + 8);
  const visibleSelected = visible.filter((item) =>
    selected.has(item.id),
  ).length;
  const activeFilters = Boolean(
    caseStatus ||
    filters.search ||
    filters.priority ||
    filters.verdict ||
    filters.assignment ||
    filters.source ||
    filters.autonomous,
  );
  const filterChips: {
    key: "priority" | "assignment" | "source" | "autonomous" | "status";
    label: string;
  }[] = [
    ...(filters.assignment
      ? [
          {
            key: "assignment" as const,
            label: `Owner: ${filters.assignment === currentAnalyst ? "Me" : filters.assignment === "unassigned" ? "Unassigned" : filters.assignment}`,
          },
        ]
      : []),
    ...(filters.priority
      ? [{ key: "priority" as const, label: `Priority: ${filters.priority}` }]
      : []),
    ...(caseStatus
      ? [
          {
            key: "status" as const,
            label: `Status: ${queueStatusStates[caseStatus].label}`,
          },
        ]
      : []),
    ...(filters.source
      ? [{ key: "source" as const, label: `Source: ${filters.source}` }]
      : []),
    ...(filters.autonomous
      ? [{ key: "autonomous" as const, label: "Closed by OSCAR" }]
      : []),
  ];
  function clearFilters() {
    setFilters((previous) => ({
      ...initialFilters,
      queue: previous.queue,
      search: previous.search,
    }));
    setCaseStatus("");
    setPage(0);
  }
  const sortOptions: {
    value: string;
    label: string;
    key: SortKey;
    descending: boolean;
  }[] = [
    {
      value: "attention",
      label: "Action first",
      key: "attention",
      descending: false,
    },
    { value: "newest", label: "Newest first", key: "age", descending: false },
    { value: "oldest", label: "Oldest first", key: "age", descending: true },
    {
      value: "priority",
      label: "Highest priority",
      key: "priority",
      descending: false,
    },
  ];
  const sortOption = sortOptions.find(
    (option) =>
      option.key === sort.key && option.descending === sort.descending,
  );
  const sortValue = sortOption?.value ?? "";
  const sortLabel = sortOption?.label ?? "Custom";
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
      <Button
        variant="ghost"
        size="sm"
        onClick={() => sortBy(key)}
        className={cn(
          "h-8 justify-start gap-1 rounded-sm border-0 px-0",
          // Match the semantic value text after each leading icon or badge inset.
          key === "verdict" && "pl-6",
          key === "priority" && "pl-5",
          key === "status" && "pl-1.5",
          key === "owner" && "pl-7",
        )}
      >
        <span data-ui="sort-label">{label}</span>
        <Icon
          data-icon="inline-end"
          className={cn(
            sort.key !== key &&
              "opacity-0 group-hover/button:opacity-100 group-focus-visible/button:opacity-100",
          )}
        />
      </Button>
    );
  }
  const viewDefinition = caseListViews.find((option) => option.value === view)!;
  return (
    <section
      data-ui="case-section"
      className="mt-8 scroll-mt-5"
      aria-label="Case queue"
    >
      <Tabs
        data-ui="queue-tabs"
        value={view}
        onValueChange={(value) => {
          setView(value as CaseListView);
          setPage(0);
          setPreview(null);
        }}
        className="gap-0"
      >
        <div
          data-ui="table-shell"
          className="overflow-hidden rounded-lg bg-card ring-1 ring-inset ring-border"
        >
          <div data-ui="queue-top" className="border-b px-5 max-md:px-3">
            <div className="max-w-full overflow-x-auto">
              <TabsList
                variant="line"
                aria-label="Case queue views"
                className="gap-5 border-0 p-0 group-data-horizontal/tabs:h-14"
              >
                {caseListViews.map((option) => (
                  <TabsTrigger
                    key={option.value}
                    value={option.value}
                    title={option.description}
                    className="h-full rounded-none px-1 group-data-horizontal/tabs:after:bottom-0 group-data-horizontal/tabs:after:h-px"
                  >
                    {option.label}
                    <span
                      data-ui="tab-count"
                      className="text-caption tabular-nums text-muted-foreground"
                    >
                      {
                        tableCases.filter((item) =>
                          matchesCaseListView(
                            item,
                            option.value,
                            currentAnalyst,
                          ),
                        ).length
                      }
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>
          <div
            data-ui="filter-row"
            className="flex flex-wrap items-center gap-3 border-b px-5 py-4 max-md:px-3"
          >
            <div
              data-ui="search"
              className="relative min-w-40 flex-1 sm:max-w-80 max-sm:basis-full"
            >
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground"
              />
              <Input
                aria-label="Search titles, case IDs, IPs, hosts, or users"
                placeholder="Search cases…"
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                className="pl-9"
              />
            </div>
            <div
              data-ui="table-view-tools"
              className="ml-auto flex flex-wrap items-center gap-2 max-sm:w-full"
            >
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      aria-label={`Filter by verdict: ${filters.verdict || "All verdicts"}`}
                    />
                  }
                >
                  <span className={cn(filters.verdict && "max-sm:hidden")}>
                    Verdict{filters.verdict ? ":" : ""}
                  </span>
                  {filters.verdict && <span>{filters.verdict}</span>}
                  <ChevronDown data-icon="inline-end" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-52">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Verdict</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={filters.verdict}
                      onValueChange={(value) =>
                        updateFilter("verdict", String(value))
                      }
                    >
                      <DropdownMenuRadioItem value="" closeOnClick>
                        All verdicts
                      </DropdownMenuRadioItem>
                      {verdicts.map((value) => (
                        <DropdownMenuRadioItem
                          key={value}
                          value={value}
                          closeOnClick
                        >
                          {value}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" />}>
                  <ListFilter data-icon="inline-start" /> More filters
                  {filterChips.length > 0 && (
                    <Badge variant="secondary">{filterChips.length}</Badge>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Filter cases</DropdownMenuLabel>
                    <CaseFilterSubmenu
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
                    <CaseFilterSubmenu
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
                    <CaseFilterSubmenu
                      label="Status"
                      value={caseStatus}
                      onChange={(value) => {
                        setCaseStatus(value as CaseStatus | "");
                        setPage(0);
                        setPreview(null);
                      }}
                      options={statuses.map((value) => ({
                        label: queueStatusStates[value].label,
                        value,
                      }))}
                    />
                    <CaseFilterSubmenu
                      label="Source"
                      value={filters.source}
                      onChange={(value) => updateFilter("source", value)}
                      options={sources.map((value) => ({
                        label: value,
                        value,
                        icon: sourceOptionIcons[value],
                      }))}
                    />
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuCheckboxItem
                      checked={filters.autonomous}
                      onCheckedChange={(checked) =>
                        updateFilter("autonomous", checked)
                      }
                    >
                      Closed by OSCAR only
                    </DropdownMenuCheckboxItem>
                    {filterChips.length > 0 && (
                      <DropdownMenuItem onClick={clearFilters}>
                        Clear filters
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="outline" aria-label="View options" />
                  }
                >
                  <SlidersHorizontal data-icon="inline-start" />
                  <span className="max-sm:sr-only">View</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Display</DropdownMenuLabel>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        Sort{" "}
                        <span className="ml-auto text-caption text-muted-foreground">
                          {sortLabel}
                        </span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="min-w-48">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Sort cases</DropdownMenuLabel>
                          <DropdownMenuRadioGroup
                            value={sortValue}
                            onValueChange={(value) => {
                              const option = sortOptions.find(
                                (option) => option.value === value,
                              );
                              if (option) {
                                setSort({
                                  key: option.key,
                                  descending: option.descending,
                                });
                                setPage(0);
                              }
                            }}
                          >
                            {sortOptions.map((option) => (
                              <DropdownMenuRadioItem
                                key={option.value}
                                value={option.value}
                                closeOnClick
                              >
                                {option.label}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        Row density{" "}
                        <span className="ml-auto text-caption capitalize text-muted-foreground">
                          {density}
                        </span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="min-w-44">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Row density</DropdownMenuLabel>
                          <DropdownMenuRadioGroup
                            value={density}
                            onValueChange={(value) => setDensity(String(value))}
                          >
                            <DropdownMenuRadioItem
                              value="comfortable"
                              closeOnClick
                            >
                              Comfortable
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="compact" closeOnClick>
                              Compact
                            </DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Columns</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="min-w-44">
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
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => exportCases("view")}>
                      <Download />
                      Export view
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {filterChips.length > 0 && (
              <div
                data-ui="active-filters"
                className="flex w-full flex-wrap items-center gap-2 pt-1"
              >
                {filterChips.map(({ key, label }) => (
                  <Button
                    key={key}
                    variant="secondary"
                    size="sm"
                    aria-label={`Remove ${label} filter`}
                    onClick={() => {
                      if (key === "status") {
                        setCaseStatus("");
                        setPage(0);
                      } else
                        updateFilter(key, key === "autonomous" ? false : "");
                    }}
                  >
                    {label}
                    <X data-icon="inline-end" />
                  </Button>
                ))}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            )}
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
            value={view}
            className="mt-0 mr-0 mb-0 ml-0"
          >
            <Table
              data-ui="case-table"
              className="group/queue min-w-[660px] table-fixed [&_tbody_td]:h-16 [&_tbody_td]:py-3 data-[density=comfortable]:[&_tbody_td]:h-20 data-[density=comfortable]:[&_tbody_td]:py-4 max-[1000px]:min-w-0"
              data-density={density}
            >
              <caption className="sr-only">
                {viewDefinition.label}. Select a case title to inspect full
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
                  <TableHead
                    data-ui="col-case"
                    className="px-4 max-[1000px]:pl-2"
                    scope="col"
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
                    .filter((column) => columns[column])
                    .map((column) => (
                      <TableHead
                        key={column}
                        data-ui={`col-${column}`}
                        scope="col"
                        className={cn("px-4", columnClasses[column])}
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
                    className="w-20 pl-0 pr-3 text-left whitespace-nowrap"
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
                          event.target.closest(
                            "a, button, input, select, textarea, [role='checkbox'], [role^='menuitem']",
                          ))
                      )
                        return;
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
                    <TableCell
                      data-ui="case-cell col-case"
                      className="px-4 max-[1000px]:py-4 max-[1000px]:pl-2"
                    >
                      <Link
                        data-ui="case-title"
                        href={caseHref(item.id)}
                        className="block w-full truncate rounded-xs text-left text-sm leading-5 font-medium text-foreground hover:underline hover:underline-offset-3 "
                        title={item.title}
                      >
                        {item.title}
                      </Link>
                      <div
                        data-ui="case-meta"
                        className="@container mt-0.5 flex min-w-0 items-center gap-1.5 overflow-hidden text-caption leading-4.25 whitespace-nowrap text-muted-foreground"
                      >
                        <span
                          data-ui="mono"
                          className="shrink-0 font-mono text-xs leading-4.5 font-normal"
                          title={item.id}
                        >
                          {item.id}
                        </span>
                        <span className="shrink-0" aria-hidden="true">
                          ·
                        </span>
                        <span
                          data-ui="source-meta"
                          className="inline-flex min-w-0 max-w-32 items-center gap-1 @max-[360px]:hidden"
                          title={item.source}
                        >
                          {(() => {
                            const SourceIcon = sourceOptionIcons[item.source];
                            return (
                              <SourceIcon
                                className="size-3.25 shrink-0"
                                aria-hidden="true"
                              />
                            );
                          })()}
                          <span className="truncate">{item.source}</span>
                        </span>
                        {usefulEntities(item)
                          .slice(0, 2)
                          .map(([key, value], index) => {
                            const Icon =
                              entityIcons[key as keyof typeof entityIcons];
                            const label = key === "ip" ? "IP address" : key;
                            return (
                              <span
                                key={key}
                                data-ui="entity-meta"
                                className={cn(
                                  "inline-flex min-w-0 items-center gap-1.5",
                                  index === 1 && "@max-[520px]:hidden",
                                )}
                                title={`${label}: ${value}`}
                                aria-label={`${label}: ${value}`}
                              >
                                <span className="shrink-0" aria-hidden="true">
                                  ·
                                </span>
                                <Icon
                                  className="size-3.25 shrink-0"
                                  aria-hidden="true"
                                />
                                <span
                                  data-ui="mono"
                                  className="truncate font-mono text-xs leading-4.5 font-normal"
                                >
                                  {key === "file"
                                    ? value.split(/[\\/]/).pop()
                                    : value}
                                </span>
                              </span>
                            );
                          })}
                      </div>
                      <div
                        data-ui="mobile-badges"
                        className="mt-2.5 hidden flex-wrap items-center gap-1.5 max-[1000px]:flex"
                      >
                        <PriorityBadge value={item.priority} queue />
                        <QueueVerdictBadge item={item} />
                        <QueueStatusIndicator item={item} />
                      </div>
                    </TableCell>
                    {columns.verdict && (
                      <TableCell
                        data-ui="col-verdict"
                        className={cn("px-4", columnClasses.verdict)}
                      >
                        <QueueVerdictBadge item={item} />
                      </TableCell>
                    )}
                    {columns.priority && (
                      <TableCell
                        data-ui="col-priority"
                        className={cn("px-4", columnClasses.priority)}
                      >
                        <PriorityBadge value={item.priority} queue />
                      </TableCell>
                    )}
                    {columns.status && (
                      <TableCell
                        data-ui="col-status"
                        className={cn("px-4", columnClasses.status)}
                      >
                        <QueueStatusIndicator item={item} />
                      </TableCell>
                    )}
                    {columns.owner && (
                      <TableCell
                        data-ui="col-owner"
                        className={cn("px-4", columnClasses.owner)}
                      >
                        <Owner name={item.owner} />
                      </TableCell>
                    )}
                    {columns.age && (
                      <TableCell
                        data-ui="col-age"
                        className={cn("px-4", columnClasses.age)}
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
                        className={cn("px-4", columnClasses.source)}
                      >
                        {item.source}
                      </TableCell>
                    )}
                    <TableCell
                      data-ui="col-actions"
                      className="w-20 pl-0 pr-3 text-left whitespace-nowrap"
                    >
                      <CaseQuickPreview
                        item={item}
                        open={preview?.id === item.id}
                        onOpenChange={(open) => setPreview(open ? item : null)}
                      >
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Quick preview ${item.id}`}
                          title="Quick preview"
                        >
                          <Eye aria-hidden="true" />
                        </Button>
                      </CaseQuickPreview>
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
                      : view === "mine"
                        ? "No cases assigned to you"
                        : view === "unassigned"
                          ? "No unassigned cases"
                          : view === "attention"
                            ? "Nothing needs attention"
                            : "No cases yet"}
                  </EmptyTitle>
                  <EmptyDescription>
                    {activeFilters
                      ? "Try a broader search or clear the active filters."
                      : view === "mine"
                        ? "Open cases assigned to you will appear here."
                        : "Cases will appear here when they match this work view."}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
            <div
              data-ui="table-footer"
              className="flex flex-wrap items-center justify-between gap-4 border-t px-6 py-4 border-border max-md:pt-3 max-md:pr-3 max-md:pb-3 max-md:pl-3 max-md:[&_[data-ui~='caption']]:text-caption"
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
                className="text-caption font-normal text-muted-foreground max-md:order-3 max-md:w-full max-md:text-center"
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
    </section>
  );
}
