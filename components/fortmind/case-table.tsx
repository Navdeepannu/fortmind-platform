"use client";

import { cn } from "@/lib/utils";
import { queueIconClass } from "@/lib/semantic-styles";

import Link from "next/link";
import { caseHref } from "@/lib/platform-routes";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type MouseEvent,
} from "react";
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
import { TooltipProvider } from "@/components/ui/tooltip";
import { CopyTechnicalValue } from "./copy-technical-value";
import { usefulEntities } from "@/lib/case-context";
import { InvestigationInspector } from "./investigation-inspector";
import {
  CaseTitleTooltip,
  CaseMetadataPreview,
  CaseVerdictTooltip,
  CasePriorityTooltip,
  CaseWorkflowTooltip,
  CaseTimestampTooltip,
  IconTooltip,
} from "./case-contextual-preview";
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
  priorities,
  verdicts,
  sources,
  filterCases,
  statuses,
  formatAge,
  type Priority,
  type SecurityCase,
  type Queue,
  type CaseStatus,
  type CaseFilters,
  type Source,
  type Tone,
} from "@/lib/preview-data";
import { platformCases } from "@/lib/platform-cases";
import { queueStatusStates, type SemanticState } from "@/lib/semantic-states";
import {
  caseListViews,
  caseListEntry,
  matchesCaseListView,
  type CaseListView,
} from "@/lib/case-list-views";
import { QueueStatusIndicator, QueueVerdictBadge } from "./case-queue-semantic";
import {
  PriorityBadge,
  PriorityBars,
  CaseStatusBadge,
  VerdictMarker,
} from "./semantic";

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
  "source",
  "verdict",
  "status",
  "owner",
  "age",
] as const;
type OptionalColumn = (typeof optionalColumns)[number];
type SortKey = OptionalColumn | "title" | "attention";
const columnClasses: Record<OptionalColumn, string> = {
  priority: "w-28 @max-[680px]/case-grid:hidden",
  verdict: "w-43 @max-[520px]/case-grid:hidden",
  status: "w-37 @max-[600px]/case-grid:hidden",
  owner: "w-28 @max-[1080px]/case-grid:hidden",
  age: "w-17 @max-[960px]/case-grid:hidden",
  source: "w-36 text-caption @max-[1200px]/case-grid:hidden",
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
      className="inline-flex items-center gap-1.5 text-caption whitespace-nowrap"
    >
      {name ? (
        <>
          <span
            data-ui="avatar"
            className="inline-flex items-center justify-center shrink-0 bg-secondary border border-border rounded-full font-medium size-6 text-caption"
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
          <span className="inline-flex size-6 shrink-0 items-center justify-center">
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
  priority?: Priority;
  iconClassName?: string;
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
                  {option.priority ? (
                    <PriorityBars value={option.priority} />
                  ) : (
                    Icon && (
                      <Icon
                        className={cn(
                          "size-3.5 stroke-[1.75]",
                          option.iconClassName ?? queueIconClass(option.tone),
                        )}
                        aria-hidden="true"
                      />
                    )
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

export { CopyTechnicalValue } from "./copy-technical-value";

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
            <div className="flex items-baseline gap-2 text-caption text-muted-foreground">
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
            className="line-clamp-3 shrink-0 text-prose"
          >
            {item.summary}
          </p>
          {item.recommendedNextAction?.trim() && (
            <div
              data-ui="preview-next-action"
              className="flex shrink-0 flex-col gap-1 rounded-md bg-surface p-3 border border-border"
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
  const sectionRef = useRef<HTMLElement>(null);
  const previewRegionRef = useRef<HTMLElement>(null);
  const previewTriggerRef = useRef<HTMLElement | null>(null);
  const focusPreviewRef = useRef(false);
  const previewRegionId = useId();
  const previewHeadingId = useId();
  const created = usePreviewCases();
  const tableCases = useMemo(() => [...created, ...platformCases], [created]);
  const entry = caseListEntry(initialQueue);
  const [view, setView] = useState<CaseListView>(initialView ?? entry.view);
  const [caseStatus, setCaseStatus] = useState<CaseStatus | "">(entry.status);
  const [filters, setFilters] = useState<CaseFilters>(initialFilters);
  const [density, setDensity] = useState("compact");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [columns, setColumns] = useState<Record<OptionalColumn, boolean>>({
    priority: true,
    verdict: true,
    status: false,
    owner: true,
    age: true,
    source: true,
  });
  const [sort, setSort] = useState<{ key: SortKey; descending: boolean }>({
    key: "attention",
    descending: false,
  });
  const [page, setPage] = useState(0);
  const [preview, setPreview] = useState<SecurityCase | null>(null);
  const [announcement, setAnnouncement] = useState("");
  function previewFocusTarget() {
    return previewTriggerRef.current?.isConnected
      ? previewTriggerRef.current
      : (sectionRef.current?.querySelector<HTMLInputElement>(
          '[data-ui="search"] input',
        ) ?? null);
  }
  useEffect(() => {
    if (!preview) return;
    if (focusPreviewRef.current || document.activeElement === document.body) {
      previewRegionRef.current?.focus({ preventScroll: true });
      focusPreviewRef.current = false;
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (
        event.key !== "Escape" ||
        event.defaultPrevented ||
        (event.target instanceof Element &&
          event.target.closest('[role="menu"], [role="dialog"]')) ||
        document.querySelector(
          '[role="menu"], [role="dialog"], [data-slot="tooltip-content"][data-open], [data-slot="hover-card-content"][data-open], [aria-haspopup="menu"][aria-expanded="true"]',
        )
      )
        return;
      event.preventDefault();
      setPreview(null);
      previewFocusTarget()?.focus({ preventScroll: true });
    };
    window.addEventListener("keydown", closeOnEscape, true);
    return () => window.removeEventListener("keydown", closeOnEscape, true);
  }, [preview]);
  function openPreview(
    item: SecurityCase,
    trigger?: HTMLElement | null,
    keyboard = false,
  ) {
    previewTriggerRef.current =
      trigger ??
      sectionRef.current?.querySelector<HTMLElement>(
        `[data-case-id="${item.id}"] [data-ui="case-title"]`,
      ) ??
      null;
    focusPreviewRef.current = keyboard;
    setPreview(item);
    setAnnouncement(`Previewing ${item.id}: ${item.title}.`);
  }
  function closePreview() {
    setPreview(null);
    previewFocusTarget()?.focus({ preventScroll: true });
  }
  function previewFromTitle(
    event: MouseEvent<HTMLAnchorElement>,
    item: SecurityCase,
  ) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    openPreview(item, event.currentTarget, event.detail === 0);
  }
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
  const pageCount = Math.max(1, Math.ceil(filtered.length / 20));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(currentPage * 20, currentPage * 20 + 20);
  const previewIndex = preview
    ? filtered.findIndex((item) => item.id === preview.id)
    : -1;
  function navigatePreview(offset: -1 | 1) {
    if (previewIndex < 0) return;
    const next = filtered[previewIndex + offset];
    if (!next) return;
    // Inspector navigation follows the entire result order without paging or scrolling the table.
    setPreview(next);
    setAnnouncement(
      `Previewing ${next.id}: ${next.title}. ${previewIndex + offset + 1} of ${filtered.length}.`,
    );
  }
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
          key === "verdict" && "pl-4",
          key === "priority" && "pl-6",
          key === "status" && "pl-4.5",
          key === "owner" && "pl-7.5",
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
    <TooltipProvider delay={500} closeDelay={100} timeout={0}>
      <section
        ref={sectionRef}
        data-ui="case-section"
        className="mt-5 scroll-mt-5"
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
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            <div data-ui="queue-top" className="border-b border-border bg-card px-3 sm:px-4">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain">
                <TabsList
                  variant="line"
                  aria-label="Case queue views"
                  className="gap-5 border-0 p-0 group-data-horizontal/tabs:h-14"
                >
                  {caseListViews.slice(0, 5).map((option) => (
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
                <div className="flex shrink-0 flex-wrap items-center gap-1.5 py-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="sm" aria-label="Analyst work views" />}>
                      Work views <ChevronDown data-icon="inline-end" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Analyst views</DropdownMenuLabel>
                        {caseListViews.slice(5).map((option) => (
                          <DropdownMenuItem key={option.value} onClick={() => { setView(option.value); setPage(0); setPreview(null); }}>
                            {option.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div role="group" aria-label="Row density" className="inline-flex rounded-md border border-border p-0.5">
                    <Button variant={density === "comfortable" ? "secondary" : "ghost"} size="xs" onClick={() => setDensity("comfortable")}>Comfortable</Button>
                    <Button variant={density === "compact" ? "secondary" : "ghost"} size="xs" onClick={() => setDensity("compact")}>Compact</Button>
                  </div>
                </div>
              </div>
            </div>
            <div
              data-ui="filter-row"
              className="flex flex-col items-stretch gap-3 border-b border-border bg-surface px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:px-5"
            >
              <div
                data-ui="search"
                className="relative w-full min-w-0 flex-1 sm:w-auto sm:min-w-48 sm:max-w-80"
              >
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground"
                />
                <Input
                  aria-label="Search titles, case IDs, IPs, hosts, or users"
                  placeholder="Search by title, identifier or address"
                  value={filters.search}
                  onChange={(event) =>
                    updateFilter("search", event.target.value)
                  }
                  className="pl-9"
                />
              </div>
              <div data-ui="quick-filters" className="flex min-w-0 flex-wrap items-center gap-2">
                <select aria-label="Filter by owner" value={filters.assignment} onChange={(event) => updateFilter("assignment", event.target.value)} className="h-9 min-w-28 rounded-md border border-input bg-background px-2.5 text-label text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Owner</option>
                  <option value={currentAnalyst}>Assigned to me</option>
                  <option value="unassigned">Unassigned</option>
                  {owners.filter((name) => name !== currentAnalyst).map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
                <select aria-label="Filter by priority" value={filters.priority} onChange={(event) => updateFilter("priority", event.target.value)} className="h-9 min-w-28 rounded-md border border-input bg-background px-2.5 text-label text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Priority</option>
                  {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                </select>
                <select aria-label="Filter by source" value={filters.source} onChange={(event) => updateFilter("source", event.target.value)} className="h-9 min-w-28 rounded-md border border-input bg-background px-2.5 text-label text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Source</option>
                  {sources.map((source) => <option key={source} value={source}>{source}</option>)}
                </select>
                <Button variant={filters.autonomous ? "secondary" : "outline"} aria-pressed={filters.autonomous} size="sm" onClick={() => updateFilter("autonomous", !filters.autonomous)}>Autonomous only</Button>
              </div>
              <div
                data-ui="table-view-tools"
                className="flex w-full flex-wrap items-center gap-2 max-sm:justify-between max-sm:[&_button]:min-h-10 sm:ml-auto sm:w-auto"
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
                            <VerdictMarker value={value} />
                            {value}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="outline" aria-label="More filters" />
                    }
                  >
                    <ListFilter data-icon="inline-start" />
                    <span className="max-sm:hidden">More filters</span>
                    <span className="sm:hidden">Filters</span>
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
                          priority: value,
                        }))}
                      />
                      <CaseFilterSubmenu
                        label="Status"
                        value={caseStatus}
                        onChange={(value) => {
                          setCaseStatus(value as CaseStatus | "");
                          setPage(0);
                        }}
                        options={statuses.map((value) => ({
                          label: queueStatusStates[value].label,
                          value,
                          icon: queueStatusStates[value].icon,
                          tone: queueStatusStates[value].tone,
                          iconClassName: (
                            queueStatusStates[value] as SemanticState
                          ).iconClassName,
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
                      <Button
                        variant="outline"
                        aria-label="Display preferences"
                      />
                    }
                  >
                    <SlidersHorizontal data-icon="inline-start" />
                    <span>Display</span>
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
                              onValueChange={(value) =>
                                setDensity(String(value))
                              }
                            >
                              <DropdownMenuRadioItem
                                value="comfortable"
                                closeOnClick
                              >
                                Comfortable
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem
                                value="compact"
                                closeOnClick
                              >
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
                            <DropdownMenuLabel>
                              Visible columns
                            </DropdownMenuLabel>
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
                      variant="outline"
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
                className="flex items-center gap-2.25 mt-3 mr-4.5 mb-3 ml-4.5 pt-1.75 pr-2.5 pb-1.75 pl-2.5 border border-border rounded-md bg-surface"
                role="toolbar"
                aria-label="Selected case actions"
              >
                <strong className="text-caption font-semibold mr-1">
                  {selected.size} selected
                </strong>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportCases("selection")}
                >
                  <Download data-icon="inline-start" />
                  Export selection
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected(new Set())}
                >
                  Clear selection
                </Button>
              </div>
            )}
            <TabsContent data-ui="table-panel" value={view} className="m-0">
              <div data-ui="investigation-workspace" className="min-w-0">
                <div
                  data-ui="case-grid"
                  className="@container/case-grid flex min-h-0 min-w-0 flex-col"
                >
                  <div
                    data-ui="case-table-scroll"
                    role="region"
                    aria-label="Cases table, scroll horizontally to access additional columns"
                    tabIndex={0}
                    className="min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-auto overscroll-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring [&>[data-slot=table-container]]:overflow-visible"
                  >
                    <Table
                      data-ui="case-table"
                      className="group/queue min-w-0 table-fixed [&_tbody_td]:h-16 [&_tbody_td]:py-3 data-[density=comfortable]:[&_tbody_td]:h-20 data-[density=comfortable]:[&_tbody_td]:py-4"
                      data-density={density}
                    >
                      <caption className="sr-only">
                        {viewDefinition.label}. Select a case to preview its
                        investigation. Use Open investigation for full technical
                        details. {density} density.
                      </caption>
                      <TableHeader className="sticky top-0 z-10">
                        <TableRow className="hover:bg-transparent">
                          <TableHead data-ui="col-select" className="w-9 pl-3">
                            <Checkbox
                              aria-label="Select all cases on this page"
                              checked={
                                visible.length > 0 &&
                                visibleSelected === visible.length
                              }
                              indeterminate={
                                visibleSelected > 0 &&
                                visibleSelected < visible.length
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
                              scope="col"
                              className={cn("px-3", columnClasses.priority)}
                              aria-sort={sort.key === "priority" ? sort.descending ? "descending" : "ascending" : "none"}
                            >
                              {sortHeader("priority", "Priority")}
                            </TableHead>
                          )}
                          <TableHead
                            data-ui="col-case"
                            className="px-3"
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
                            .filter((column) => columns[column] && column !== "priority")
                            .map((column) => (
                              <TableHead
                                key={column}
                                data-ui={`col-${column}`}
                                scope="col"
                                className={cn("px-3", columnClasses[column])}
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
                            className="w-18 pl-0 pr-2 text-left whitespace-nowrap"
                          >
                            <span className="sr-only">Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visible.map((item) => (
                          <TableRow
                            key={item.id}
                            data-case-id={item.id}
                            data-preview-selected={preview?.id === item.id}
                            data-state={
                              selected.has(item.id) ? "selected" : undefined
                            }
                            className="cursor-pointer"
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
                              openPreview(item);
                            }}
                          >
                            <TableCell
                              data-ui="col-select"
                              className="w-9 pl-3"
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
                                className={cn("px-3", columnClasses.priority)}
                              >
                                <CasePriorityTooltip item={item}>
                                  <PriorityBadge value={item.priority} queue />
                                </CasePriorityTooltip>
                              </TableCell>
                            )}
                            <TableCell
                              data-ui="case-cell col-case"
                              className="px-3"
                            >
                              <CaseTitleTooltip title={item.title}>
                                <Link
                                  data-ui="case-title"
                                  href={caseHref(item.id)}
                                  prefetch={false}
                                  onClick={(event) =>
                                    previewFromTitle(event, item)
                                  }
                                  aria-label={`Preview investigation ${item.id}: ${item.title}`}
                                  aria-expanded={preview?.id === item.id}
                                  aria-controls={
                                    preview?.id === item.id
                                      ? previewRegionId
                                      : undefined
                                  }
                                  className="block w-full truncate rounded-xs text-left text-body font-medium text-foreground outline-none hover:underline hover:underline-offset-3 focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                  {item.title}
                                </Link>
                              </CaseTitleTooltip>
                              <div
                                data-ui="case-meta"
                                className="@container mt-1 flex min-w-0 items-baseline gap-1.5 overflow-hidden text-caption whitespace-nowrap text-muted-foreground"
                              >
                                <CaseMetadataPreview item={item}>
                                  <span
                                    data-ui="mono"
                                    className="shrink-0 font-mono text-caption font-normal"
                                  >
                                    {item.id}
                                  </span>
                                  <span
                                    data-ui="source-meta"
                                    className="inline-flex min-w-0 max-w-32 items-baseline gap-1 @max-[360px]:hidden"
                                  >
                                    <span
                                      className="shrink-0"
                                      aria-hidden="true"
                                    >
                                      ·
                                    </span>
                                    {(() => {
                                      const SourceIcon =
                                        sourceOptionIcons[item.source];
                                      return (
                                        <SourceIcon
                                          className="size-3.25 shrink-0 self-center"
                                          aria-hidden="true"
                                        />
                                      );
                                    })()}
                                    <span className="truncate">
                                      {item.source}
                                    </span>
                                  </span>
                                  {usefulEntities(item)
                                    .slice(0, 2)
                                    .map(([key, value], index) => {
                                      const Icon =
                                        entityIcons[
                                          key as keyof typeof entityIcons
                                        ];
                                      const label =
                                        key === "ip" ? "IP address" : key;
                                      return (
                                        <span
                                          key={key}
                                          data-ui="entity-meta"
                                          className={cn(
                                            "inline-flex min-w-0 items-baseline gap-1.5 @min-[520px]/case-grid:@max-[680px]/case-grid:hidden",
                                            index === 1 &&
                                              "@max-[520px]:hidden",
                                          )}
                                          aria-label={`${label}: ${value}`}
                                        >
                                          <span
                                            className="shrink-0"
                                            aria-hidden="true"
                                          >
                                            ·
                                          </span>
                                          <Icon
                                            className="size-3.25 shrink-0 self-center"
                                            aria-hidden="true"
                                          />
                                          <span
                                            data-ui="mono"
                                            className="truncate font-mono text-caption font-normal"
                                          >
                                            {key === "file"
                                              ? value.split(/[\\/]/).pop()
                                              : value}
                                          </span>
                                        </span>
                                      );
                                    })}
                                </CaseMetadataPreview>
                                {columns.priority && (
                                  <span className="ml-auto hidden @min-[520px]/case-grid:inline-flex @min-[680px]/case-grid:hidden">
                                    <CasePriorityTooltip item={item}>
                                      <PriorityBadge
                                        value={item.priority}
                                        queue
                                      />
                                    </CasePriorityTooltip>
                                  </span>
                                )}
                              </div>
                              <div
                                data-ui="mobile-badges"
                                className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 @min-[600px]/case-grid:hidden"
                              >
                                {columns.priority && (
                                  <span className="@min-[520px]/case-grid:hidden">
                                    <CasePriorityTooltip item={item}>
                                      <PriorityBadge
                                        value={item.priority}
                                        queue
                                      />
                                    </CasePriorityTooltip>
                                  </span>
                                )}
                                {columns.verdict && (
                                  <span className="@min-[520px]/case-grid:hidden">
                                    <CaseVerdictTooltip item={item}>
                                      <QueueVerdictBadge item={item} />
                                    </CaseVerdictTooltip>
                                  </span>
                                )}
                                {columns.status && (
                                  <span className="@min-[600px]/case-grid:hidden">
                                    <CaseWorkflowTooltip item={item}>
                                      <QueueStatusIndicator item={item} />
                                    </CaseWorkflowTooltip>
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            {columns.source && (
                              <TableCell
                                data-ui="col-source"
                                className={cn("px-3", columnClasses.source)}
                              >
                                {item.source}
                              </TableCell>
                            )}
                            {columns.verdict && (
                              <TableCell
                                data-ui="col-verdict"
                                className={cn("px-3", columnClasses.verdict)}
                              >
                                <CaseVerdictTooltip item={item}>
                                  <QueueVerdictBadge item={item} />
                                </CaseVerdictTooltip>
                              </TableCell>
                            )}
                            {columns.status && (
                              <TableCell
                                data-ui="col-status"
                                className={cn("px-3", columnClasses.status)}
                              >
                                <CaseWorkflowTooltip item={item}>
                                  <QueueStatusIndicator item={item} />
                                </CaseWorkflowTooltip>
                              </TableCell>
                            )}
                            {columns.owner && (
                              <TableCell
                                data-ui="col-owner"
                                className={cn("px-3", columnClasses.owner)}
                              >
                                <Owner name={item.owner} />
                              </TableCell>
                            )}
                            {columns.age && (
                              <TableCell
                                data-ui="col-age"
                                className={cn("px-3", columnClasses.age)}
                              >
                                <CaseTimestampTooltip
                                  ageMinutes={item.ageMinutes}
                                />
                              </TableCell>
                            )}
                            <TableCell
                              data-ui="col-actions"
                              className="w-18 pl-0 pr-2 text-left whitespace-nowrap"
                            >
                              <IconTooltip label="Quick preview">
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label={`Quick preview ${item.id}`}
                                  aria-expanded={preview?.id === item.id}
                                  aria-controls={
                                    preview?.id === item.id
                                      ? previewRegionId
                                      : undefined
                                  }
                                  onClick={(event) =>
                                    openPreview(
                                      item,
                                      event.currentTarget,
                                      event.detail === 0,
                                    )
                                  }
                                >
                                  <Eye aria-hidden="true" />
                                </Button>
                              </IconTooltip>
                              <DropdownMenu>
                                <IconTooltip label="More actions">
                                  <DropdownMenuTrigger
                                    render={
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label={`More actions for ${item.id}`}
                                      />
                                    }
                                  >
                                    <MoreHorizontal aria-hidden="true" />
                                  </DropdownMenuTrigger>
                                </IconTooltip>
                                <DropdownMenuContent
                                  data-ui="preview menu"
                                  align="end"
                                  className="text-body text-foreground min-w-45"
                                >
                                  <DropdownMenuGroup>
                                    <DropdownMenuItem
                                      render={<Link href={caseHref(item.id)} />}
                                    >
                                      <ArrowUpRight aria-hidden="true" />
                                      Open investigation
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => openPreview(item)}
                                    >
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
                  </div>
                  <div
                    data-ui="table-footer"
                    className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t bg-surface px-4 py-3 border-border @max-[520px]/case-grid:[&_[data-ui~=preview-note]]:w-full @max-[520px]/case-grid:[&_[data-ui~=preview-note]]:order-3"
                  >
                    <span
                      data-ui="caption"
                      role="status"
                      className="text-caption font-normal text-muted-foreground"
                    >
                      {selected.size ? `${selected.size} selected · ` : ""}
                      {filtered.length
                        ? `${currentPage * 8 + 1}–${Math.min(currentPage * 8 + 8, filtered.length)} of ${filtered.length} cases`
                        : "0 cases"}
                    </span>
                    <span
                      data-ui="caption preview-note"
                      className="text-caption font-normal text-muted-foreground"
                    >
                      Local preview · no live data
                    </span>
                    <div className="flex items-center gap-3 max-md:gap-1.75">
                      <span
                        data-ui="caption"
                        className="text-caption font-normal text-muted-foreground"
                      >
                        Page {currentPage + 1} of {pageCount}
                      </span>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Previous page"
                        disabled={currentPage === 0}
                        onClick={() => setPage(currentPage - 1)}
                      >
                        <ChevronLeft />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Next page"
                        disabled={currentPage >= pageCount - 1}
                        onClick={() => setPage(currentPage + 1)}
                      >
                        <ChevronRight />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        <span className="sr-only" role="status">
          {announcement}
        </span>
        {preview && (
          <InvestigationInspector
            item={preview}
            regionRef={previewRegionRef}
            regionId={previewRegionId}
            headingId={previewHeadingId}
            restoreFocus={previewFocusTarget}
            onClose={closePreview}
            position={previewIndex}
            total={filtered.length}
            onPrevious={
              previewIndex > 0 ? () => navigatePreview(-1) : undefined
            }
            onNext={
              previewIndex >= 0 && previewIndex < filtered.length - 1
                ? () => navigatePreview(1)
                : undefined
            }
          />
        )}
      </section>
    </TooltipProvider>
  );
}
