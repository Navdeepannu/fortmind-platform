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

function readHash() {
  try { return decodeURIComponent(window.location.hash.slice(1)); }
  catch { return ""; }
}

/**
 * Exactly one navigational level: the five case workspaces.
 * All eleven source sections remain mounted, grouped as readable documents.
 * Old ?tab=&view= and #finding-* deep links still resolve to their section.
 */
export function CaseCategoryTabs({
  views,
  counts: _counts,
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
    if (`${location.pathname}${location.search}${location.hash}` !== href) {
      window.history.pushState(null, "", href);
    }
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
      if (current.tab !== selection.tab || current.view !== selection.view) return;

      const tabs = root.querySelector<HTMLElement>("[data-case-tab-scroll]");
      const selectedTab = tabs?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      if (tabs && selectedTab) {
        const box = tabs.getBoundingClientRect();
        const tabBox = selectedTab.getBoundingClientRect();
        if (tabBox.left < box.left || tabBox.right > box.right) {
          tabs.scrollBy({ left: tabBox.left - box.left - 12, behavior: "instant" });
        }
      }

      const group = caseSectionGroups.find((item) => item.id === selection.tab);
      const sectionId = group?.sections.find((section) => section.id === selection.view)?.id;
      const section = sectionId ? document.getElementById(sectionId) : null;
      const linked = targetId ? document.getElementById(targetId) : null;
      const destination = linked && section?.contains(linked) ? linked : section;
      if (!destination) return;
      if (destination instanceof HTMLDetailsElement) destination.open = true;

      // Avoid jumping past the case header on the default first view.
      const firstView = group?.sections[0].id;
      const shouldScroll = Boolean(targetId) || selection.view !== firstView || (!initialLoad.current && request > 0);
      initialLoad.current = false;
      if (shouldScroll) {
        destination.scrollIntoView({ block: "start", behavior: "instant" });
      }

      if (focusTarget.current === targetId && targetId) {
        (destination instanceof HTMLDetailsElement
          ? destination.querySelector<HTMLElement>("summary")
          : destination instanceof HTMLElement ? destination : null
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
              data-ui="case-section-stack"
              className="mx-auto flex w-full max-w-[1120px] min-w-0 flex-col gap-10 py-7 pb-16 @max-[501px]/case:gap-8 @max-[501px]/case:py-5"
            >
              {group.sections.map((section) => (
                <div key={section.id} data-case-view={section.id} className="min-w-0">
                  {views[section.id]}
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
