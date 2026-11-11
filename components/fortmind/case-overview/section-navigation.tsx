"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  caseSectionGroups,
  caseViewForTarget,
  resolveCaseView,
  type CaseSectionId,
  type CaseViewSelection,
} from "@/lib/case-sections";
import { caseViewHref } from "@/lib/platform-routes";

const compactNames: Partial<Record<CaseSectionId, string>> = {
  conclusion: "Summary",
  "how-oscar-decided": "OSCAR trace",
  findings: "Findings",
  hypotheses: "Hypotheses",
  "attack-path": "Attack path",
  entities: "Entities",
  evidence: "Sources",
  "similar-cases": "Related",
  actions: "Actions",
  "analyst-notes": "Notes",
};

function readHash() {
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return "";
  }
}

/**
 * One prominent tab bar for the five case workspaces and one compact contextual
 * segmented control for mutually exclusive sibling views. Never show all eleven
 * source sections as a vertically stacked report.
 */
export function CaseCategoryTabs({
  views,
  counts,
  status,
}: {
  views: Record<CaseSectionId, ReactNode>;
  counts: Partial<Record<CaseSectionId, number>>;
  status: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const selection = resolveCaseView(searchParams);
  const [request, setRequest] = useState(0);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const focusTarget = useRef<string | null>(null);
  const initialLoad = useRef(true);

  function navigate(next: CaseViewSelection, target = "") {
    focusTarget.current = target || null;
    const href = caseViewHref(window.location.href, next, target);
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== href) {
      window.history.pushState(null, "", href);
    }
    // pushState doesn't emit hashchange, but the finding explorer listens here.
    if (target) window.dispatchEvent(new Event("fortmind:case-navigation"));
    setRequest((value) => value + 1);
  }

  useEffect(() => {
    const restore = () => {
      const target = readHash();
      const url = new URL(window.location.href);
      const selected = caseViewForTarget(target) ?? resolveCaseView(url.searchParams);
      const canonical = caseViewHref(url.href, selected, target);
      if (`${url.pathname}${url.search}${url.hash}` !== canonical) {
        window.history.replaceState(null, "", canonical);
      }
      setRequest((value) => value + 1);
    };
    const frame = requestAnimationFrame(restore);
    window.addEventListener("hashchange", restore);
    window.addEventListener("popstate", restore);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", restore);
      window.removeEventListener("popstate", restore);
    };
  }, [pathname, searchKey]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const root = workspaceRef.current;
      if (!root) return;

      const targetId = readHash();
      const current = caseViewForTarget(targetId) ??
        resolveCaseView(new URL(window.location.href).searchParams);
      // Wait until the App Router reflects the URL's selection.
      if (current.tab !== selection.tab || current.view !== selection.view) return;

      for (const track of root.querySelectorAll<HTMLElement>("[data-case-tab-scroll], [data-subview-scroll]")) {
        if (!track.getClientRects().length) continue;
        const active = track.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
        if (!active) continue;
        const box = track.getBoundingClientRect();
        const tabBox = active.getBoundingClientRect();
        if (tabBox.left < box.left || tabBox.right > box.right) {
          track.scrollBy({ left: tabBox.left - box.left - 12, behavior: "instant" });
        }
      }

      const viewPanel = [...root.querySelectorAll<HTMLElement>("[data-case-view]")]
        .find((panel) => panel.dataset.caseView === selection.view && panel.getClientRects().length);
      const section = viewPanel?.querySelector<HTMLElement>(`section[id="${selection.view}"]`);
      const linked = targetId ? document.getElementById(targetId) : null;
      const destination = linked && section?.contains(linked) ? linked : section;
      if (!destination) return;
      if (destination instanceof HTMLDetailsElement) destination.open = true;

      const nav = root.querySelector<HTMLElement>('[data-ui="page-nav"]');
      const navBottom = nav?.getBoundingClientRect().bottom ?? 0;
      const panelTop = viewPanel?.getBoundingClientRect().top ?? 0;
      const firstLoad = initialLoad.current;
      initialLoad.current = false;

      if (targetId) {
        destination.scrollIntoView({ block: "start", behavior: "instant" });
      } else if ((!firstLoad || selection.view !== "conclusion") && panelTop < navBottom) {
        // Changing tabs restores the compact view controls, but does not
        // scroll through or reveal the other panels.
        viewPanel?.scrollIntoView({ block: "start", behavior: "instant" });
      }

      if (focusTarget.current === targetId && targetId) {
        (destination instanceof HTMLDetailsElement
          ? destination.querySelector<HTMLElement>("summary")
          : destination
        )?.focus({ preventScroll: true });
      }
      focusTarget.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [selection.tab, selection.view, request]);

  function followReference(event: MouseEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
        event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    const target = link?.hash.slice(1);
    const next = target ? caseViewForTarget(target) : undefined;
    if (!next || !target) return;
    event.preventDefault();
    navigate(next, target);
  }

  return (
    <div
      ref={workspaceRef}
      onClick={followReference}
      data-ui="case-navigation"
      className="min-w-0 [--case-primary-nav-height:2.75rem]"
    >
      <Tabs
        value={selection.tab}
        onValueChange={(value) => {
          const group = caseSectionGroups.find((item) => item.id === value);
          if (group) navigate({ tab: group.id, view: group.sections[0].id });
        }}
        className="min-w-0 gap-0"
        data-ui="case-category-tabs"
      >
        <div
          data-ui="page-nav"
          className="sticky top-(--workspace-header-height) z-20 h-(--case-primary-nav-height) min-w-0 border-b border-border bg-background"
        >
          <div data-ui="primary-nav-inner" className="mx-auto flex h-full w-full max-w-[1120px] min-w-0 items-center gap-4">
            <div data-case-tab-scroll className="relative min-w-0 flex-1 overflow-x-auto [scrollbar-width:thin]">
              <TabsList
                variant="line"
                activateOnFocus
                aria-label="Case categories"
                className="min-w-max gap-5 border-0 p-0 group-data-horizontal/tabs:h-11"
              >
                {caseSectionGroups.map((group) => (
                  <TabsTrigger
                    key={group.id}
                    value={group.id}
                    className="h-11 flex-none rounded-none px-0 group-data-horizontal/tabs:after:bottom-0"
                  >
                    {group.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {status === "Needs you" && (
              <Button
                size="sm"
                aria-label="Review verdict"
                onClick={() => navigate({ tab: "decision", view: "conclusion" }, "decision-heading")}
              >
                <span className="@max-[641px]/case:hidden">Review verdict</span>
                <span className="hidden @max-[641px]/case:inline">Review</span>
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>

        {caseSectionGroups.map((group) => (
          <TabsContent
            key={group.id}
            value={group.id}
            keepMounted
            hidden={selection.tab !== group.id}
            data-case-category={group.id}
            className="min-w-0 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <div
              data-ui="case-section-workspace"
              className="mx-auto w-full max-w-[1120px] min-w-0 pb-12 pt-5 @max-[501px]/case:pt-4"
            >
              {group.sections.length > 1 ? (
                <Tabs
                  value={selection.tab === group.id ? selection.view : group.sections[0].id}
                  onValueChange={(value) => {
                    const view = group.sections.find((item) => item.id === value);
                    if (view) navigate({ tab: group.id, view: view.id });
                  }}
                  className="min-w-0 gap-0"
                  data-ui="case-view-tabs"
                >
                  <div data-ui="contextual-view-toolbar" className="flex min-w-0 items-center justify-between gap-3 pb-4">
                    <div data-subview-scroll className="min-w-0 overflow-x-auto [scrollbar-width:thin]">
                      <TabsList
                        aria-label={`${group.label} views`}
                        activateOnFocus
                        className="h-9 min-w-max shrink-0 border-border bg-muted/40 p-0.75 group-data-horizontal/tabs:h-9"
                      >
                        {group.sections.map((section) => (
                          <TabsTrigger
                            key={section.id}
                            value={section.id}
                            data-ui="case-subview-trigger"
                            data-section-id={section.id}
                            className="h-7 flex-none gap-2 rounded-[5px] border-transparent px-3 py-1 text-caption font-medium data-active:border-border data-active:bg-background data-active:text-foreground"
                          >
                            {compactNames[section.id] ?? section.label}
                            {counts[section.id] !== undefined && (
                              <span
                                aria-label={`${counts[section.id]} items`}
                                className="font-mono text-[11px] tabular-nums text-muted-foreground"
                              >
                                {counts[section.id]}
                              </span>
                            )}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>
                  </div>

                  {group.sections.map((section) => (
                    <TabsContent
                      key={section.id}
                      value={section.id}
                      keepMounted
                      hidden={selection.tab !== group.id || selection.view !== section.id}
                      data-case-view={section.id}
                      className="min-w-0 w-full pb-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {views[section.id]}
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <div data-case-view={group.sections[0].id} className="min-w-0">
                  {views[group.sections[0].id]}
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
