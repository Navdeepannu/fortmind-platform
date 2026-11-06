"use client";

import { useSearchParams } from "next/navigation";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CaseTable } from "./case-table";
import type { Queue } from "@/lib/preview-data";
import { NewCase } from "./new-case";
import { useWorkspace } from "./workspace-shell";

function CasesContent({ queue }: { queue: Queue }) {
  const { openPanel } = useWorkspace();
  return (
    <div
      data-ui="main cases-main"
      id="preview-main"
      className="mx-auto w-full p-6"
    >
      <div
        data-ui="page-heading"
        className="flex justify-between max-[1101px]:items-start max-md:items-start max-md:gap-3 items-end gap-5 max-[761px]:items-start"
      >
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.035em] max-md:text-2xl max-md:leading-8">
            Cases
          </h1>
          <p className="mt-0.75 text-sm leading-5.5 text-muted-foreground max-[1101px]:max-w-95 max-md:max-w-70 max-md:text-xs max-md:leading-4.75">
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
            className="h-8 rounded-md"
          >
            <Link2 data-icon="inline-start" />
            Integrations{" "}
            <span
              data-ui="integration-count"
              className="ml-1.25 text-warning-foreground text-[11px] max-[761px]:hidden"
            >
              1 issue
            </span>
          </Button>
          <NewCase />
        </div>
      </div>
      <CaseTable key={queue} initialQueue={queue} />
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
  return <CasesContent queue={queue} />;
}
