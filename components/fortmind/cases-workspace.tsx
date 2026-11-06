"use client";

import { useSearchParams } from "next/navigation";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CaseTable } from "./case-table";
import { isCaseListView, type CaseListView } from "@/lib/case-list-views";
import type { Queue } from "@/lib/preview-data";
import { NewCase } from "./new-case";
import { useWorkspace } from "./workspace-shell";

function CasesContent({ queue, view }: { queue: Queue; view?: CaseListView }) {
  const { openPanel } = useWorkspace();
  return (
    <div
      data-ui="main cases-main"
      id="preview-main"
      className="mx-auto w-full min-w-0 p-5 md:p-8"
    >
      <div
        data-ui="page-heading"
        className="flex flex-wrap justify-between max-[1101px]:items-start max-md:items-start max-md:gap-3 items-end gap-5 max-[761px]:items-start"
      >
        <div>
          <h1 className="text-page-title">Cases</h1>
          <p className="mt-1 text-body text-muted-foreground">
            Review investigations and move the next decision forward.
          </p>
        </div>
        <div
          data-ui="heading-actions"
          className="flex items-center gap-2 flex-none max-[761px]:[align-self:flex-end]"
        >
          <Button
            variant="outline"
            onClick={() => openPanel("integrations")}
            size="lg"
          >
            <Link2 data-icon="inline-start" />
            Integrations{" "}
            <span
              data-ui="integration-count"
              className="ml-1.25 text-warning-foreground text-caption max-[761px]:hidden"
            >
              1 issue
            </span>
          </Button>
          <NewCase />
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
