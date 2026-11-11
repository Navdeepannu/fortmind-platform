"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { operations } from "@/lib/overview-data";
import { previewIntegrations } from "@/lib/preview-integrations";
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
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1.5">
          <h1 className="text-page-title">Cases</h1>
          <p className="text-caption text-muted-foreground">
            {previewIntegrations.filter((item) => item.availability === "connected").length} sample tools connected
            <span aria-hidden="true"> · </span>
            <Link href="/platform/cases?queue=Needs%20you" className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">
              {operations.needsYou} need attention
            </Link>
          </p>
        </div>
        <Button variant="outline" size="sm" nativeButton={false} role="link" render={<Link href="/platform/integrations" />} className="shrink-0">
          Connect tools <ArrowRight data-icon="inline-end" />
        </Button>
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
