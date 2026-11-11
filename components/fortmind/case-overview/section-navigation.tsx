"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  caseSectionGroups,
  caseViewForTarget,
  resolveCaseView,
  type CaseSectionId,
  type CaseViewSelection,
} from "@/lib/case-sections";
import { caseViewHref } from "@/lib/platform-routes";

function hashTarget() {
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return "";
  }
}

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

  function navigate(next: CaseViewSelection, target = "") {
    focusTarget.current = target || null;
    const href = caseViewHref(window.location.href, next, target);
    if (`${location.pathname}${location.search}${location.hash}` !== href) {
      // App Router supports the History API for local query state. This avoids
      // fetching the case again or remounting forms when a view changes.
      window.history.pushState(null, "", href);
    }
    setRequest((value) => value + 1);
  }

  useEffect(() => {
    const restore = () => {
      const target = hashTarget();
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
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", restore);
    };
  }, [pathname, searchKey]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const workspace = workspaceRef.current;
      if (!workspace) return;
      const targetId = hashTarget();
      const current = caseViewForTarget(targetId) ?? resolveCaseView(new URL(location.href).searchParams);
      // The App Router may publish new query state after our local request.
      // Wait for that selection before focusing content in a different panel.
      if (current.tab !== selection.tab || current.view !== selection.view) return;
      for (const track of workspace.querySelectorAll<HTMLElement>("[data-case-tab-scroll]")) {
        if (!track.getClientRects().length) continue;
        const tab = track.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
        if (!tab) continue;
        const tabBox = tab.getBoundingClientRect();
        const trackBox = track.getBoundingClientRect();
        if (tabBox.left < trackBox.left || tabBox.right > trackBox.right) {
          track.scrollBy({ left: tabBox.left - trackBox.left - 12, behavior: "instant" });
        }
      }
      const target = workspace.querySelector<HTMLElement>(`section[id="${selection.view}"]`);
      const linked = targetId ? document.getElementById(targetId) : null;
      const destination = linked && target?.contains(linked) ? linked : target;
      if (!destination) return;
      if (destination instanceof HTMLDetailsElement) destination.open = true;
      if (focusTarget.current === targetId && targetId) {
        const focus = destination instanceof HTMLDetailsElement ? destination.querySelector("summary") : destination;
        focus?.focus({ preventScroll: true });
      }
      focusTarget.current = null;
      // Only the primary category row sits above the content. Contextual
      // subnavigation is a side rail, not a second sticky horizontal bar.
      const nav = workspace.querySelector<HTMLElement>('[data-ui="page-nav"]');
      const boundary = nav?.getBoundingClientRect().bottom ?? 0;
      // Switching a workspace never scrolls through other views. Only recover
      // its heading when a previously long view left the document scrolled down.
      if (targetId || destination.getBoundingClientRect().top < boundary) {
        destination.scrollIntoView({ block: "start", behavior: "instant" });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [selection.tab, selection.view, request]);

  function followReference(event: MouseEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    const target = link?.hash.slice(1);
    const next = target ? caseViewForTarget(target) : undefined;
    if (!target || !next) return;
    event.preventDefault();
    navigate(next, target);
  }

  return (
    <div ref={workspaceRef} onClick={followReference} data-ui="case-navigation" className="min-w-0 [--case-primary-nav-height:2.75rem]">
      <Tabs
        value={selection.tab}
        onValueChange={(value) => {
          const group = caseSectionGroups.find((group) => group.id === value);
          if (group) navigate({ tab: group.id, view: group.sections[0].id });
        }}
        className="min-w-0 gap-0"
        data-ui="case-category-tabs"
      >
        <div data-ui="page-nav" className="sticky top-(--workspace-header-height) z-20 flex h-(--case-primary-nav-height) min-w-0 items-center gap-5 border-b bg-background @max-[501px]/case:gap-3">
          <div data-case-tab-scroll className="relative min-w-0 flex-1 overflow-x-auto [scrollbar-width:thin]">
            <TabsList variant="line" activateOnFocus aria-label="Case categories" className="min-w-max gap-4 border-0 p-0 group-data-horizontal/tabs:h-11 sm:gap-5">
              {caseSectionGroups.map((group) => (
                <TabsTrigger key={group.id} value={group.id} className="h-11 flex-none rounded-none px-0 group-data-horizontal/tabs:after:bottom-0">
                  {group.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {status === "Needs you" && (
            <Button size="sm" onClick={() => navigate({ tab: "decision", view: "conclusion" }, "decision-heading")} aria-label="Review verdict">
              <span className="@max-[641px]/case:hidden">Review verdict</span>
              <span className="hidden @max-[641px]/case:inline">Review</span>
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          )}
        </div>
        {caseSectionGroups.map((group) => (
          <TabsContent key={group.id} value={group.id} keepMounted hidden={selection.tab !== group.id} data-case-category={group.id} className="min-w-0 focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2">
            {group.sections.length > 1 ? (
              <Tabs
                orientation="vertical"
                value={selection.tab === group.id ? selection.view : group.sections[0].id}
                onValueChange={(value) => {
                  const view = group.sections.find((section) => section.id === value);
                  if (view) navigate({ tab: group.id, view: view.id });
                }}
                className="min-w-0 flex-col items-stretch gap-0 @min-[760px]/case:flex-row @min-[760px]/case:items-start"
                data-ui="case-subview-layout"
              >
                <div
                  data-ui="mobile-section-nav"
                  className="min-w-0 border-b border-border py-3 @min-[760px]/case:hidden"
                >
                  <div className="flex items-center gap-3">
                    <span className="shrink-0 text-caption font-medium text-muted-foreground">
                      View
                    </span>
                    <Select
                      value={selection.tab === group.id ? selection.view : group.sections[0].id}
                      onValueChange={(value) => {
                        const view = group.sections.find((section) => section.id === value);
                        if (view) navigate({ tab: group.id, view: view.id });
                      }}
                    >
                      <SelectTrigger
                        size="sm"
                        aria-label={`${group.label} section`}
                        className="min-w-0 flex-1 justify-between bg-background text-label"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent align="end">
                        {group.sections.map((section) => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.label}
                            {counts[section.id] !== undefined
                              ? ` · ${counts[section.id]}`
                              : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <aside
                  data-ui="secondary-nav"
                  aria-label={`${group.label} sections`}
                  className="hidden min-w-0 @min-[760px]/case:sticky @min-[760px]/case:top-[calc(var(--workspace-header-height)+var(--case-primary-nav-height)+1rem)] @min-[760px]/case:block @min-[760px]/case:w-44 @min-[760px]/case:flex-none @min-[760px]/case:border-r @min-[760px]/case:border-border @min-[760px]/case:py-5 @min-[760px]/case:pr-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-2 px-3">
                    <p className="text-caption font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      {group.label}
                    </p>
                    <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                      {group.sections.length} views
                    </span>
                  </div>
                  <TabsList
                    variant="line"
                    activateOnFocus
                    aria-label={`${group.label} views`}
                    className="flex h-auto w-full flex-col items-stretch gap-1 border-0 bg-transparent p-0"
                  >
                    {group.sections.map((section) => (
                      <TabsTrigger
                        key={section.id}
                        value={section.id}
                        data-ui="case-section-link"
                        data-section-id={section.id}
                        className="group/subview relative h-9 w-full flex-none justify-between rounded-md border-0 px-3 text-left text-label font-normal after:hidden before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-transparent hover:bg-muted/50 data-active:bg-muted/70 data-active:font-medium data-active:text-foreground data-active:before:bg-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="min-w-0 truncate">{section.label}</span>
                        {counts[section.id] !== undefined && (
                          <span
                            data-ui="section-count"
                            aria-label={`${counts[section.id]} items`}
                            className="ml-2 shrink-0 rounded-md bg-background px-1.5 py-0.5 text-caption font-normal tabular-nums text-muted-foreground"
                          >
                            {counts[section.id]}
                          </span>
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </aside>

                {group.sections.map((section) => (
                  <TabsContent
                    key={section.id}
                    value={section.id}
                    keepMounted
                    hidden={selection.tab !== group.id || selection.view !== section.id}
                    data-case-view={section.id}
                    className="min-w-0 w-full flex-1 pb-12 pt-5 focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2 @min-[760px]/case:pl-6 @max-[501px]/case:pt-4"
                  >
                    {views[section.id]}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div data-case-view={group.sections[0].id} className="min-w-0 pb-12 pt-6 @max-[501px]/case:pt-5">
                {views[group.sections[0].id]}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
