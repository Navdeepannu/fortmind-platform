"use client";

import {
  useCallback, useEffect, useRef, useState,
  type MouseEvent, type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  caseSectionGroups, caseViewForTarget, resolveCaseView,
  type CaseCategoryId, type CaseSectionId,
} from "@/lib/case-sections";
import { cn } from "@/lib/utils";

const panelInfo: Record<CaseCategoryId, { title: string; description: string }> = {
  decision: {
    title: "Assessment and analyst review",
    description: "Understand OSCAR's conclusion, uncertainty, and the decision waiting for you.",
  },
  investigation: {
    title: "What OSCAR found",
    description: "Inspect findings, consider alternative explanations, and trace reported activity.",
  },
  evidence: {
    title: "Supporting records",
    description: "Review the entities, source results, and related investigations.",
  },
  response: {
    title: "Response and ownership",
    description: "Review proposed actions and add analyst context.",
  },
  timeline: {
    title: "Activity history",
    description: "See the recorded sequence of investigation and analyst events.",
  },
};

const sectionTitles: Partial<Record<CaseSectionId, string>> = {
  conclusion: "Decision summary",
  "how-oscar-decided": "How OSCAR decided",
  evidence: "Source responses",
  "similar-cases": "Related cases",
  actions: "Recommended actions",
};

const initialOpen = caseSectionGroups.map((group) => group.sections[0].id);

function locationSelection() {
  const url = new URL(window.location.href);
  let hash = "";
  try { hash = decodeURIComponent(url.hash.slice(1)); } catch { /* Ignore malformed fragments. */ }
  return {
    group: caseViewForTarget(hash)?.tab ?? resolveCaseView(url.searchParams).tab,
    section: caseViewForTarget(hash)?.view ?? resolveCaseView(url.searchParams).view,
    hash,
  };
}

export function BoxedCaseWorkspace({
  views,
  counts,
}: {
  views: Record<CaseSectionId, ReactNode>;
  counts?: Partial<Record<CaseSectionId, number>>;
}) {
  const [active, setActive] = useState<CaseCategoryId>("decision");
  const [open, setOpen] = useState<Set<CaseSectionId>>(() => new Set(initialOpen));
  const pendingTarget = useRef<string | null>(null);

  const openTarget = useCallback((target: string, updateHistory = false) => {
    const view = caseViewForTarget(target);
    if (!view) return;
    setActive(view.tab);
    setOpen((current) => new Set([...current, view.view]));
    pendingTarget.current = target;
    if (updateHistory) {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", view.tab);
      url.searchParams.set("view", view.view);
      url.hash = target;
      window.history.pushState(null, "", url);
    }
  }, []);

  useEffect(() => {
    const restore = () => {
      const current = locationSelection();
      setActive(current.group);
      if (current.hash) openTarget(current.hash);
      else setOpen((previous) => new Set([...previous, current.section]));
    };
    restore();
    window.addEventListener("popstate", restore);
    window.addEventListener("hashchange", restore);
    return () => {
      window.removeEventListener("popstate", restore);
      window.removeEventListener("hashchange", restore);
    };
  }, [openTarget]);

  useEffect(() => {
    const target = pendingTarget.current;
    if (!target) return;
    const frame = requestAnimationFrame(() => {
      const node = document.getElementById(target);
      node?.scrollIntoView({ block: "start", behavior: "instant" });
      if (node?.hasAttribute("tabindex")) node.focus({ preventScroll: true });
      pendingTarget.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [active, open]);

  function changeCategory(category: CaseCategoryId) {
    setActive(category);
    const section = caseSectionGroups.find((group) => group.id === category)!.sections[0].id;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", category);
    url.searchParams.set("view", section);
    url.hash = "";
    window.history.pushState(null, "", url);
  }

  function toggleSection(section: CaseSectionId) {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }

  function handleInternalLink(event: MouseEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey ||
      event.metaKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    const target = anchor?.hash.slice(1);
    if (!target || !caseViewForTarget(target)) return;
    event.preventDefault();
    openTarget(decodeURIComponent(target), true);
  }

  return (
    <div data-ui="boxed-case-workspace" onClick={handleInternalLink}
      className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
      <Tabs value={active} onValueChange={(value) => changeCategory(value as CaseCategoryId)}
        className="min-w-0 gap-0">
        <div className="border-b border-border bg-muted/20 px-3 py-3 sm:px-5">
          <div className="min-w-0 overflow-x-auto [scrollbar-width:thin]">
            <TabsList aria-label="Case detail categories" activateOnFocus
              className="h-auto min-w-max gap-1 border border-border bg-muted/60 p-1">
              {caseSectionGroups.map((group) => (
                <TabsTrigger key={group.id} value={group.id}
                  className="h-11 flex-none rounded-md border-transparent px-4 text-sm font-medium sm:px-5 data-active:border-border data-active:bg-card data-active:shadow-sm">
                  {group.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {caseSectionGroups.map((group) => (
          <TabsContent key={group.id} value={group.id} keepMounted
            hidden={active !== group.id}
            className="min-w-0 p-0"
            data-ui="boxed-case-panel">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-5 sm:px-6">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-foreground">{panelInfo[group.id].title}</h2>
                <p className="mt-1 max-w-[70ch] text-sm leading-5 text-muted-foreground">
                  {panelInfo[group.id].description}
                </p>
              </div>
              <span className="rounded-md border border-border px-2.5 py-1 text-xs tabular-nums text-muted-foreground">
                {group.sections.length} {group.sections.length === 1 ? "section" : "sections"}
              </span>
            </div>

            <div className="min-w-0 p-3 sm:p-5">
              <div className="min-w-0 divide-y divide-border overflow-hidden rounded-lg border border-border">
                {group.sections.map((section, index) => {
                  const expanded = open.has(section.id);
                  return (
                    <details key={section.id} open={expanded}
                      data-ui="case-accordion" data-section={section.id}
                      className="group/section min-w-0 bg-card">
                      <summary onClick={(event) => {
                        event.preventDefault();
                        toggleSection(section.id);
                      }}
                        className={cn(
                          "flex min-h-16 cursor-pointer list-none items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/30 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-5 [&::-webkit-details-marker]:hidden",
                          expanded && "bg-muted/25",
                        )}>
                        <span aria-hidden="true"
                          className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-background font-mono text-xs tabular-nums text-muted-foreground">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">
                          {sectionTitles[section.id] ?? section.label}
                        </span>
                        {counts?.[section.id] !== undefined && (
                          <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                            {counts[section.id]}
                          </span>
                        )}
                        <ChevronDown aria-hidden="true"
                          className="size-4 shrink-0 text-muted-foreground transition-transform group-open/section:rotate-180" />
                      </summary>
                      <div
                        data-ui="case-accordion-body"
                        className="min-w-0 border-t border-border bg-background px-4 py-5 sm:px-6
                          [&_[data-ui=section-header]]:hidden
                          [&_[data-ui=section-card]]:border-0
                          [&_[data-ui=section-card]]:bg-transparent
                          [&_[data-ui=section-card]]:shadow-none
                          [&_[data-ui=section-card]]:rounded-none
                          [&_[data-ui=section-body]]:!p-0
                          [&_[data-ui=section-footer]]:mt-4"
                      >
                        {views[section.id]}
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
