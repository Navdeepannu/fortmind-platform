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
      const nav = [...workspace.querySelectorAll<HTMLElement>('[data-ui="secondary-nav"]')].find((node) => node.getClientRects().length)
        ?? workspace.querySelector<HTMLElement>('[data-ui="page-nav"]');
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
    <div ref={workspaceRef} onClick={followReference} data-ui="case-navigation" className="min-w-0 [--case-primary-nav-height:3.0625rem]">
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
            <TabsList variant="line" activateOnFocus aria-label="Case categories" className="min-w-max gap-6 border-0 p-0 group-data-horizontal/tabs:h-12">
              {caseSectionGroups.map((group) => (
                <TabsTrigger key={group.id} value={group.id} className="h-12 flex-none rounded-none px-0 group-data-horizontal/tabs:after:bottom-0">
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
                value={selection.tab === group.id ? selection.view : group.sections[0].id}
                onValueChange={(value) => {
                  const view = group.sections.find((section) => section.id === value);
                  if (view) navigate({ tab: group.id, view: view.id });
                }}
                className="min-w-0 gap-0"
              >
                <div data-ui="secondary-nav" className="sticky top-[calc(var(--workspace-header-height)+var(--case-primary-nav-height))] z-10 border-b bg-background">
                  <div data-case-tab-scroll className="relative min-w-0 overflow-x-auto [scrollbar-width:thin]">
                    <TabsList variant="line" activateOnFocus aria-label={`${group.label} views`} className="min-w-max gap-5 border-0 p-0 group-data-horizontal/tabs:h-10">
                      {group.sections.map((section) => (
                        <TabsTrigger key={section.id} value={section.id} className="h-10 flex-none rounded-none px-0 group-data-horizontal/tabs:after:bottom-0">
                          {section.label}
                          {counts[section.id] !== undefined && <span className="text-caption tabular-nums"> ({counts[section.id]})</span>}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                </div>
                {group.sections.map((section) => (
                  <TabsContent key={section.id} value={section.id} keepMounted hidden={selection.tab !== group.id || selection.view !== section.id} data-case-view={section.id} className="min-w-0 pb-12 pt-6 focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2 @max-[501px]/case:pt-5">
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
