"use client";

import { useEffect, useState, type FocusEvent } from "react";
import { ArrowRight, CircleAlert, FileSearch, SearchCheck } from "lucide-react";
import type { OverviewFinding } from "@/lib/case-overview-data";
import { SeverityBadge } from "@/components/fortmind/semantic";
import { cn } from "@/lib/utils";

type Filter = "all" | OverviewFinding["relationship"];

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Supports concern", label: "Concern" },
  { id: "Context · unresolved", label: "Unresolved" },
  { id: "Limits corroboration", label: "Not corroborated" },
];

const classification: Record<
  OverviewFinding["evidenceState"],
  { label: string; meaning: string; tone: string }
> = {
  "Alert report · unverified": {
    label: "Alert only",
    meaning: "The original alert reports this event; no tool independently verified the activity.",
    tone: "text-warning-foreground",
  },
  "Tool result": {
    label: "Tool result",
    meaning: "A tool returned this result. Its relevance to the reported activity still needs assessment.",
    tone: "text-oscar-foreground",
  },
  "Missing corroboration": {
    label: "No matching records",
    meaning: "The supplied lookup returned no matches. This does not establish that the activity was benign.",
    tone: "text-muted-foreground",
  },
};

/**
 * Read-only master/detail evidence explorer. Source observations never become
 * confirmed findings just because an analyst selects or filters a row.
 */
export function FindingExplorer({ findings }: { findings: OverviewFinding[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState(findings[0]?.id ?? "");

  useEffect(() => {
    const selectHash = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      if (!hash.startsWith("finding-")) return;
      const target = hash.slice("finding-".length);
      if (!findings.some((finding) => finding.id === target)) return;
      setSelectedId(target);
      setFilter("all");
    };
    selectHash();
    window.addEventListener("hashchange", selectHash);
    window.addEventListener("popstate", selectHash);
    return () => {
      window.removeEventListener("hashchange", selectHash);
      window.removeEventListener("popstate", selectHash);
    };
  }, [findings]);

  const matches = findings.filter((finding) =>
    filter === "all" ? true : finding.relationship === filter,
  );
  const selected = matches.find((finding) => finding.id === selectedId) ?? matches[0];
  const selectedPosition = selected ? findings.findIndex((item) => item.id === selected.id) + 1 : 0;
  const selectedStatus = selected ? classification[selected.evidenceState] : null;

  function changeFilter(next: Filter) {
    setFilter(next);
    const first = findings.find((item) => next === "all" || item.relationship === next);
    if (first && !findings.some((item) => item.id === selectedId && (next === "all" || item.relationship === next))) {
      setSelectedId(first.id);
    }
  }

  function focusFinding(event: FocusEvent<HTMLDivElement>) {
    const row = (event.target as HTMLElement).closest<HTMLElement>("[data-finding-id]");
    const id = row?.dataset.findingId;
    if (id && findings.some((item) => item.id === id)) {
      setFilter("all");
      setSelectedId(id);
    }
  }

  return (
    <div data-ui="finding-explorer" className="@container/findings min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border px-4 py-3.5 @min-[760px]/findings:px-5">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-label font-semibold">Evidence index</span>
          <span className="text-caption text-muted-foreground">{findings.length} observations</span>
        </div>
        <p className="text-caption text-muted-foreground">
          Select a finding to inspect its source and limitations
        </p>
      </div>

      <div data-ui="finding-filters" role="group" aria-label="Filter findings by evidence relationship"
        className="flex flex-wrap items-center gap-1.5 border-b border-border px-4 py-2.5 @min-[760px]/findings:px-5"
      >
        {filters.map(({ id, label }) => {
          const count = id === "all"
            ? findings.length
            : findings.filter((finding) => finding.relationship === id).length;
          if (count === 0) return null;
          return (
            <button
              key={id}
              type="button"
              data-filter={id}
              aria-pressed={filter === id}
              onClick={() => changeFilter(id)}
              className={cn(
                "inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-caption font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                filter === id
                  ? "border-border-strong bg-muted text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              {label}
              <span className="font-mono text-[11px] tabular-nums opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid min-w-0 @min-[720px]/findings:grid-cols-[minmax(230px,0.9fr)_minmax(0,1.1fr)]">
        <div data-ui="finding-index" onFocusCapture={focusFinding}
          className="min-w-0 border-b border-border @min-[720px]/findings:border-r @min-[720px]/findings:border-b-0"
        >
          <ol aria-label="Findings" className="divide-y divide-border/80">
            {matches.map((finding) => {
              const active = selected?.id === finding.id;
              const index = findings.indexOf(finding) + 1;
              const source = classification[finding.evidenceState];
              return (
                <li key={finding.id} id={`finding-${finding.id}`}
                  data-ui="finding" data-finding-id={finding.id}
                  tabIndex={-1} className="scroll-mt-36 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <button
                    type="button"
                    aria-pressed={active}
                    aria-controls="selected-finding-detail"
                    data-ui="finding-select"
                    onClick={() => setSelectedId(finding.id)}
                    className={cn(
                      "group flex min-h-21 w-full cursor-pointer items-start gap-3 border-l-2 px-3.5 py-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring @min-[760px]/findings:px-4",
                      active
                        ? "border-l-foreground bg-muted/60"
                        : "border-l-transparent hover:bg-muted/40",
                    )}
                  >
                    <span className="mt-0.5 w-5 shrink-0 font-mono text-caption text-muted-foreground tabular-nums">
                      {String(index).padStart(2, "0")}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <span className="line-clamp-2 text-label font-semibold leading-snug">
                        {finding.title}
                      </span>
                      <span className={cn("text-caption", source.tone)}>{source.label}</span>
                    </span>
                    {finding.relationship === "Supports concern" && finding.severity && (
                      <span className="mt-0.5 shrink-0">
                        <SeverityBadge value={finding.severity} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <section
          id="selected-finding-detail"
          data-ui="finding-inspector"
          role="region"
          aria-label="Selected finding detail"
          className="min-w-0 bg-muted/20 p-4 @min-[760px]/findings:p-5"
        >
          {selected && selectedStatus ? (
            <div className="flex flex-col gap-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-caption font-medium text-muted-foreground">
                    Finding {String(selectedPosition).padStart(2, "0")} / {String(findings.length).padStart(2, "0")}
                  </span>
                  <span className={cn("inline-flex items-center gap-1.5 text-caption font-medium", selectedStatus.tone)}>
                    {selected.evidenceState === "Alert report · unverified" ? <CircleAlert className="size-3.5" aria-hidden="true" /> :
                      selected.evidenceState === "Tool result" ? <SearchCheck className="size-3.5" aria-hidden="true" /> :
                      <FileSearch className="size-3.5" aria-hidden="true" />}
                    {selectedStatus.label}
                  </span>
                </div>
                <h3 data-ui="selected-finding-title" className="mt-3 text-panel-title font-semibold">
                  {selected.title}
                </h3>
                <p className="mt-2 text-prose">{selected.summary}</p>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">
                  What this establishes
                </h4>
                <p className="mt-2 text-label text-foreground">{selected.detail}</p>
              </div>

              <dl className="grid min-w-0 gap-4 border-t border-border pt-4">
                <div className="min-w-0">
                  <dt className="text-caption font-semibold text-muted-foreground">Source</dt>
                  <dd className="mt-1 text-label">{selected.provenance}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-caption font-semibold text-muted-foreground">Evidence limitation</dt>
                  <dd className="mt-1 text-label">{selectedStatus.meaning}</dd>
                </div>
              </dl>

              <a href="#evidence"
                className="inline-flex w-fit items-center gap-1.5 text-label font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Review source responses <ArrowRight className="size-3.5" aria-hidden="true" />
              </a>
            </div>
          ) : (
            <p className="text-label text-muted-foreground">No findings match this filter.</p>
          )}
        </section>
      </div>
    </div>
  );
}
