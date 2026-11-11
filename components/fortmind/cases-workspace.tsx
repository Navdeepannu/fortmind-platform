"use client";

import { useSearchParams } from "next/navigation";
import { CaseTable } from "./case-table";
import { isCaseListView, type CaseListView } from "@/lib/case-list-views";
import type { Queue } from "@/lib/preview-data";

function CasesContent({ queue, view }: { queue: Queue; view?: CaseListView }) {
  return (
    <div
      data-ui="main cases-main"
      id="preview-main"
      className="min-w-0 py-5 md:py-8"
    >
      <div
        data-ui="page-heading"
        className="flex flex-wrap justify-between max-[1101px]:items-start max-md:items-start max-md:gap-3 items-end gap-5 max-[761px]:items-start"
      >
        <div>
          <h1 className="text-page-title">Cases</h1>
          <p className="mt-1 text-prose text-muted-foreground">
            Review investigations and move the next decision forward.
          </p>
        </div>
      </div>
      <CaseTable
        key={`${queue}-${view ?? "legacy"}`}
        initialQueue={queue}
        initialView={view}
      />
    </div>
  );
}

export function CasesWorkspace() {
  const search = useSearchParams();
  const requested = search.get("queue") ?? "Needs you";
  const queue: Queue = [
    "All",
    "Needs you",
    "Running",
    "Closed",
    "Failed",
  ].includes(requested)
    ? (requested as Queue)
    : "Needs you";
  const requestedView = search.get("view");
  return (
    <CasesContent
      queue={isCaseListView(requestedView) ? "All" : queue}
      view={isCaseListView(requestedView) ? requestedView : undefined}
    />
  );
}
