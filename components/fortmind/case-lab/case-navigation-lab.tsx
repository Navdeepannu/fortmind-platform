"use client";

import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, ChevronDown, ChevronLeft, ChevronRight,
  ListTree, PanelLeft, PanelLeftClose, Rows3, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CaseStatusBadge, PriorityBadge, VerdictBadge } from "@/components/fortmind/semantic";
import { buildCaseOverviewViews } from "@/components/fortmind/case-overview/case-overview";
import {
  caseSectionGroups, caseViewForTarget,
  type CaseSectionId,
} from "@/lib/case-sections";
import { caseOverview, type CaseOverviewData } from "@/lib/case-overview-data";
import { cn } from "@/lib/utils";

type LabMode = "expandable" | "focus" | "docked";
type View = { id: CaseSectionId; label: string; group: string };
const allViews: View[] = caseSectionGroups.flatMap((group) =>
  group.sections.map((section) => ({
    id: section.id,
    label: section.label,
    group: group.label,
  })),
);

const shortLabels: Partial<Record<CaseSectionId, string>> = {
  conclusion: "Decision summary",
  "how-oscar-decided": "OSCAR reasoning",
  "similar-cases": "Related cases",
  evidence: "Source responses",
  actions: "Recommended actions",
};

function sectionName(view: View) {
  return shortLabels[view.id] ?? view.label;
}

function countsFor(data: CaseOverviewData): Partial<Record<CaseSectionId, number>> {
  return {
    findings: data.findings.length,
    hypotheses: data.hypotheses.length,
    entities: data.entities.length,
    evidence: data.evidence.length,
    "similar-cases": data.relatedCases.length,
    actions: data.actions.length,
    timeline: data.activity.length,
  };
}

function CaseLabNav({
  active,
  onSelect,
  counts,
}: {
  active: CaseSectionId;
  onSelect: (view: CaseSectionId) => void;
  counts: Partial<Record<CaseSectionId, number>>;
}) {
  return (
    <nav data-ui="lab-directory" aria-label="Case sections" className="min-w-0">
      {caseSectionGroups.map((group) => (
        <div key={group.id} className="mb-5 last:mb-0">
          <div className="mb-1.5 flex items-center justify-between px-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {group.label}
            </h3>
            <span className="text-caption tabular-nums text-muted-foreground/70">
              {group.sections.length}
            </span>
          </div>
          <ul className="space-y-0.5">
            {group.sections.map((section) => {
              const selected = section.id === active;
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    aria-current={selected ? "page" : undefined}
                    onClick={() => onSelect(section.id)}
                    data-ui="lab-directory-item"
                    data-view={section.id}
                    className={cn(
                      "flex min-h-9 w-full cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-label transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      selected
                        ? "bg-muted font-semibold text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    <span className="min-w-0 break-words">{sectionName({ id: section.id, label: section.label, group: group.label })}</span>
                    {counts[section.id] !== undefined && (
                      <span className="shrink-0 font-mono text-[11px] font-normal tabular-nums text-muted-foreground">
                        {counts[section.id]}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function ExpandableDocument({
  sections,
  counts,
  expanded,
  setExpanded,
}: {
  sections: Record<CaseSectionId, ReactNode>;
  counts: Partial<Record<CaseSectionId, number>>;
  expanded: Set<CaseSectionId>;
  setExpanded: (updater: (current: Set<CaseSectionId>) => Set<CaseSectionId>) => void;
}) {
  function toggle(id: CaseSectionId) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div data-ui="lab-expandable" className="mx-auto w-full max-w-[1080px] min-w-0">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-section-title font-semibold">Investigation document</h2>
          <p className="mt-1 max-w-[65ch] text-caption text-muted-foreground">
            Keep multiple blocks open. Expand only what you need to compare.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span data-ui="lab-open-count" className="mr-1 text-caption tabular-nums text-muted-foreground">
            {expanded.size} / {allViews.length} open
          </span>
          <Button size="sm" variant="outline"
            onClick={() => setExpanded(() => new Set(allViews.map((view) => view.id)))}>
            Expand all
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setExpanded(() => new Set())}>
            Collapse all
          </Button>
        </div>
      </div>
      <div className="space-y-7">
        {caseSectionGroups.map((group) => {
          const opened = group.sections.filter((section) => expanded.has(section.id)).length;
          return (
            <section key={group.id} aria-labelledby={`lab-group-${group.id}`} data-ui="lab-group">
              <div className="mb-2 flex items-center gap-3">
                <h3 id={`lab-group-${group.id}`}
                  className="text-caption font-semibold uppercase tracking-[0.09em] text-muted-foreground">
                  {group.label}
                </h3>
                <span className="text-caption tabular-nums text-muted-foreground">
                  {opened} / {group.sections.length} expanded
                </span>
                <span className="h-px flex-1 bg-border" aria-hidden="true" />
              </div>
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                {group.sections.map((section, index) => {
                  const open = expanded.has(section.id);
                  const count = counts[section.id];
                  return (
                    <details key={section.id} open={open}
                      data-ui="lab-disclosure" data-view={section.id}
                      className={cn("group/disclosure min-w-0", index > 0 && "border-t border-border")}
                    >
                      <summary
                        onClick={(event) => { event.preventDefault(); toggle(section.id); }}
                        className={cn(
                          "flex min-h-15 cursor-pointer list-none items-center gap-3 px-4 py-3 text-left outline-none transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5 [&::-webkit-details-marker]:hidden",
                          open && "bg-muted/30",
                        )}
                      >
                        <span className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-md border text-[11px] font-semibold tabular-nums",
                          open ? "border-border-strong bg-background text-foreground" : "border-border text-muted-foreground",
                        )}>{String(index + 1).padStart(2, "0")}</span>
                        <span className="min-w-0 flex-1 text-label font-medium">{sectionName({ ...section, group: group.label })}</span>
                        {count !== undefined && (
                          <span className="shrink-0 font-mono text-caption tabular-nums text-muted-foreground">
                            {count}
                          </span>
                        )}
                        <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform group-open/disclosure:rotate-180" />
                      </summary>
                      {open && (
                        <div
                          data-ui="lab-disclosure-content"
                          className="min-w-0 border-t border-border bg-background px-4 pb-5 pt-4 sm:px-5 [&_[data-ui=section-header]]:hidden [&_[data-ui=section-card]]:border-0 [&_[data-ui=section-card]]:bg-transparent"
                        >
                          {sections[section.id]}
                        </div>
                      )}
                    </details>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function FocusedWorkspace({
  sections,
  counts,
  active,
  select,
  docked,
}: {
  sections: Record<CaseSectionId, ReactNode>;
  counts: Partial<Record<CaseSectionId, number>>;
  active: CaseSectionId;
  select: (id: CaseSectionId) => void;
  docked: boolean;
}) {
  const [drawer, setDrawer] = useState(false);
  const index = allViews.findIndex((view) => view.id === active);
  const current = allViews[index] ?? allViews[0];

  function choose(id: CaseSectionId) {
    select(id);
    setDrawer(false);
  }

  return (
    <div data-ui={docked ? "lab-docked" : "lab-focused"}
      className={cn("mx-auto grid w-full max-w-[1320px] min-w-0 gap-5",
        docked && "xl:grid-cols-[216px_minmax(0,1fr)]"
      )}
    >
      {docked && (
        <aside data-ui="lab-pinned-directory"
          className="hidden min-w-0 border-r border-border pr-3 xl:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto py-2">
            <div className="mb-5 px-3">
              <p className="text-caption font-semibold">Case navigator</p>
              <p className="mt-1 text-caption text-muted-foreground">
                All 11 views, one click away
              </p>
            </div>
            <CaseLabNav active={active} onSelect={choose} counts={counts} />
          </div>
        </aside>
      )}
      <div className="min-w-0">
        <div className="mb-4 flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex min-w-0 items-center gap-2">
            <Sheet open={drawer} onOpenChange={setDrawer}>
              <Button
                size="sm" variant="outline" aria-label="Open case section navigator"
                onClick={() => setDrawer(true)}
              >
                <ListTree data-icon="inline-start" aria-hidden="true" />
                Sections <span className="text-caption text-muted-foreground">11</span>
              </Button>
              <SheetContent side="left" className="w-[min(360px,90vw)] max-w-none gap-0 overflow-hidden">
                <SheetHeader className="border-b border-border px-5 py-5">
                  <SheetTitle className="text-body">Case sections</SheetTitle>
                  <p className="text-caption text-muted-foreground">Choose any view without nesting</p>
                </SheetHeader>
                <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
                  <CaseLabNav active={active} onSelect={choose} counts={counts} />
                </div>
              </SheetContent>
            </Sheet>
            <span className="hidden text-caption text-muted-foreground sm:inline">
              {current.group} <ChevronRight aria-hidden="true" className="mx-1 inline size-3" />
              <span className="font-medium text-foreground">{sectionName(current)}</span>
            </span>
          </div>
          <div className="flex items-center gap-1" aria-label="Move between case sections">
            <span className="mr-2 hidden font-mono text-caption tabular-nums text-muted-foreground sm:inline">
              {String(index + 1).padStart(2, "0")} / 11
            </span>
            <Button size="icon-sm" variant="ghost" aria-label="Previous section"
              disabled={index <= 0} onClick={() => choose(allViews[index - 1].id)}>
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button size="icon-sm" variant="ghost" aria-label="Next section"
              disabled={index >= allViews.length - 1}
              onClick={() => choose(allViews[index + 1].id)}>
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </div>
        <div data-ui="lab-current-view" data-view={active} className="min-w-0 pb-10">
          {sections[active]}
        </div>
      </div>
    </div>
  );
}

export function CaseNavigationLab({ data = caseOverview }: { data?: CaseOverviewData }) {
  const [mode, setMode] = useState<LabMode>("expandable");
  const [active, setActive] = useState<CaseSectionId>("findings");
  const [expanded, setExpanded] = useState(() => new Set<CaseSectionId>(["conclusion", "findings"]));
  const counts = useMemo(() => countsFor(data), [data]);
  const sections = useMemo(() => buildCaseOverviewViews(data), [data]);

  useEffect(() => {
    const target = decodeURIComponent(window.location.hash.slice(1));
    const match = caseViewForTarget(target);
    if (!match) return;
    setActive(match.view);
    setExpanded((current) => new Set([...current, match.view]));
  }, []);

  function followReference(event: MouseEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
        event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const target = decodeURIComponent(link.hash.slice(1));
    const match = caseViewForTarget(target);
    if (!match) return;
    event.preventDefault();
    setActive(match.view);
    setExpanded((current) => new Set([...current, match.view]));
    window.history.pushState(null, "", `#${encodeURIComponent(target)}`);
    // The target may be inside a newly opened disclosure or selected view.
    requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({ block: "start" }));
  }

  return (
    <div data-ui="case-navigation-lab" className="@container/case min-w-0 bg-background px-4 pb-16 pt-6 text-foreground sm:px-6 lg:px-8" onClick={followReference}>
      <div className="mx-auto w-full max-w-[1320px] min-w-0">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/platform/cases/case-detail"
            className="inline-flex items-center gap-2 rounded-sm text-caption font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Original case details
          </Link>
          <span className="rounded-md border border-border bg-muted/30 px-2.5 py-1 text-caption text-muted-foreground">
            Navigation research · preview only
          </span>
        </div>

        <div className="mb-6 min-w-0 border-b border-border pb-5">
          <div className="mb-2 flex items-center gap-2 text-caption text-muted-foreground">
            <ShieldCheck aria-hidden="true" className="size-4 text-oscar-foreground" />
            FORTMIND / CASE {data.id.slice(0, 8)} / DESIGN LAB
          </div>
          <h1 className="text-page-title font-semibold">Investigation layout experiments</h1>
          <p className="mt-1 max-w-[78ch] text-label text-muted-foreground">
            Same case. Same 11 source sections. Three navigation treatments to compare before changing production.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-label">
            <span className="max-w-full break-words font-medium">{data.title}</span>
            <CaseStatusBadge value={data.status} />
            <PriorityBadge value={data.priority} />
            <VerdictBadge value={data.proposedVerdict} />
          </div>
        </div>

        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="text-label font-semibold">Choose a navigation model</h2>
            <p className="text-caption text-muted-foreground">
              Switch without changing the original investigation.
            </p>
          </div>
          <Tabs value={mode} onValueChange={(value) => setMode(value as LabMode)}>
            <TabsList aria-label="Case layout variations" className="h-auto min-h-9 flex-wrap">
              <TabsTrigger value="expandable" data-ui="lab-mode-expandable">
                <Rows3 aria-hidden="true" className="size-3.5" /> Expandable
              </TabsTrigger>
              <TabsTrigger value="focus" data-ui="lab-mode-focus">
                <ListTree aria-hidden="true" className="size-3.5" /> Focus
              </TabsTrigger>
              <TabsTrigger value="docked" data-ui="lab-mode-docked">
                <PanelLeft aria-hidden="true" className="size-3.5" /> Docked
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {mode === "expandable" ? (
          <ExpandableDocument sections={sections} counts={counts} expanded={expanded} setExpanded={setExpanded} />
        ) : (
          <FocusedWorkspace
            sections={sections} counts={counts} active={active}
            select={setActive} docked={mode === "docked"}
          />
        )}

        <div className="mt-10 border-t border-border pt-5 text-caption text-muted-foreground">
          Experimental UI using the existing screenshot-derived case. No case modifications,
          agent runs, containment actions, or approvals are persisted.
        </div>
      </div>
    </div>
  );
}
