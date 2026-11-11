"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CaseSectionId } from "@/lib/case-sections";

type CaseReferenceTab = "overview" | "evidence" | "actions" | "activity";
type SectionViews = Record<CaseSectionId, ReactNode>;
type SectionCounts = Partial<Record<CaseSectionId, number>>;

const tabs: { id: CaseReferenceTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "evidence", label: "Evidence" },
  { id: "actions", label: "Actions" },
  { id: "activity", label: "Activity" },
];

const overviewAccordions: { id: CaseSectionId; title: string }[] = [
  { id: "entities", title: "Entities" },
  { id: "attack-path", title: "Attack path" },
  { id: "hypotheses", title: "Hypotheses" },
  { id: "findings", title: "Findings" },
  { id: "similar-cases", title: "Similar past cases" },
];

function tabForSection(section: string): CaseReferenceTab {
  if (["evidence", "how-oscar-decided"].includes(section)) return "evidence";
  if (["actions", "analyst-notes"].includes(section)) return "actions";
  if (section === "timeline") return "activity";
  return "overview";
}

function initialTab(tab: string | null, view: string | null): CaseReferenceTab {
  if (tab === "overview" || tab === "actions" || tab === "activity") return tab;
  if (tab === "evidence") return view === "entities" || view === "similar-cases"
    ? "overview"
    : "evidence";
  if (tab === "response") return "actions";
  if (tab === "timeline") return "activity";
  return tabForSection(view ?? "");
}

function ContainedAccordion({
  title, count, children, initiallyOpen = false,
}: {
  title: string;
  count?: number;
  children: ReactNode;
  initiallyOpen?: boolean;
}) {
  return (
    <details className="group min-w-0 border-b border-border last:border-b-0" open={initiallyOpen ? true : undefined}>
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-label font-medium outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 items-center gap-2">
          <ChevronDown aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
          <span>{title}</span>
        </span>
        {count !== undefined && (
          <span className="shrink-0 font-mono text-caption tabular-nums text-muted-foreground">{count}</span>
        )}
      </summary>
      <div data-ui="client-accordion-body" className="min-w-0 border-t border-border px-4 py-4 sm:px-5 [&_[data-ui=section-header]]:sr-only [&_[data-ui=section-card]]:rounded-sm [&_[data-ui=section-card]]:border-border [&_[data-ui=section-body]]:px-4 [&_[data-ui=section-body]]:py-4">
        {children}
      </div>
    </details>
  );
}

/** Matches the client's four top-level investigative destinations without dropping the existing eleven evidence views. */
export function CaseReferenceTabs({
  views, counts, status,
}: {
  views: SectionViews;
  counts: SectionCounts;
  status: string;
}) {
  const search = useSearchParams();
  const [tab, setTab] = useState<CaseReferenceTab>(() => initialTab(search.get("tab"), search.get("view")));

  useEffect(() => {
    const sync = () => {
      const url = new URL(window.location.href);
      const hash = decodeURIComponent(url.hash.slice(1)).replace(/-heading$/, "");
      setTab(hash ? tabForSection(hash) : initialTab(url.searchParams.get("tab"), url.searchParams.get("view")));
    };
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  function select(next: CaseReferenceTab) {
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    url.searchParams.delete("view");
    url.hash = "";
    window.history.pushState(null, "", `${url.pathname}${url.search}`);
  }

  return (
    <Tabs data-ui="client-case-tabs" value={tab} onValueChange={(value) => select(value as CaseReferenceTab)} className="min-w-0 gap-0">
      <div data-ui="client-case-nav" className="sticky top-(--workspace-header-height) z-20 flex min-w-0 flex-wrap items-center justify-between gap-x-3 border-b border-border bg-background">
        <div className="min-w-0 max-w-full overflow-x-auto">
          <TabsList variant="line" aria-label="Case sections" className="h-12 min-w-max gap-5 border-0 p-0">
            {tabs.map((item) => (
              <TabsTrigger key={item.id} value={item.id} className="h-12 flex-none rounded-none px-1 group-data-horizontal/tabs:after:bottom-0">
                {item.label}
                {item.id === "evidence" && counts.evidence !== undefined && <span className="font-mono text-caption text-muted-foreground">{counts.evidence}</span>}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {status === "Needs you" && (
          <Button variant="outline" size="sm" onClick={() => select("overview")}>
            Review verdict <ArrowRight data-icon="inline-end" />
          </Button>
        )}
      </div>
      <TabsContent value="overview" keepMounted hidden={tab !== "overview"} className="min-w-0 pb-10 pt-5">
        <div data-ui="client-case-conclusion" className="min-w-0 [&_[data-ui=section-header]]:mb-3 [&_[data-ui=section-header]_h2]:text-panel-title">
          {views.conclusion}
        </div>
        <section aria-label="Investigation overview sections" className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
          {overviewAccordions.map((item) => (
            <ContainedAccordion key={item.id} title={item.title} count={counts[item.id]} initiallyOpen={item.id === "entities"}>
              {views[item.id]}
            </ContainedAccordion>
          ))}
        </section>
      </TabsContent>
      <TabsContent value="evidence" keepMounted hidden={tab !== "evidence"} className="min-w-0 space-y-4 pb-10 pt-5">
        {views.evidence}
        <section aria-label="OSCAR decision rationale" className="overflow-hidden rounded-lg border border-border bg-card">
          <ContainedAccordion title="How OSCAR decided">
            {views["how-oscar-decided"]}
          </ContainedAccordion>
        </section>
      </TabsContent>
      <TabsContent value="actions" keepMounted hidden={tab !== "actions"} className="min-w-0 space-y-4 pb-10 pt-5">
        {views.actions}
        <section aria-label="Analyst notes" className="overflow-hidden rounded-lg border border-border bg-card">
          <ContainedAccordion title="Analyst notes">{views["analyst-notes"]}</ContainedAccordion>
        </section>
      </TabsContent>
      <TabsContent value="activity" keepMounted hidden={tab !== "activity"} className="min-w-0 pb-10 pt-5">{views.timeline}</TabsContent>
    </Tabs>
  );
}
