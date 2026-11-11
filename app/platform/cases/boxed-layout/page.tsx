import type { Metadata } from "next";
import Link from "next/link";
import { CaseSummaryCard } from "@/components/fortmind/case-lab/case-summary-card";
import { BoxedCaseWorkspace } from "@/components/fortmind/case-lab/boxed-case-workspace";
import { buildCaseOverviewViews } from "@/components/fortmind/case-overview/case-overview";
import { caseOverview } from "@/lib/case-overview-data";

export const metadata: Metadata = {
  title: "Boxed Case Detail Prototype | FortMind",
  description: "Case detail experiment: Vercel-inspired summary, tabs and contained accordion sections.",
  robots: { index: false, follow: false },
};

export default function BoxedCaseLayoutPage() {
  const data = caseOverview;

  return (
    <main className="@container/case min-w-0 bg-background px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1200px] min-w-0 flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-muted-foreground">Case detail · Layout experiment</p>
          <Link href="/platform/cases/case-detail"
            className="rounded-sm text-xs font-medium text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-ring">
            Original version
          </Link>
        </div>

        <CaseSummaryCard data={data} />

        <BoxedCaseWorkspace
          views={buildCaseOverviewViews(data)}
          counts={{
            findings: data.findings.length,
            hypotheses: data.hypotheses.length,
            entities: data.entities.length,
            evidence: data.evidence.length,
            "similar-cases": data.relatedCases.length,
            actions: data.actions.length,
            timeline: data.activity.length,
          }}
        />

        <p className="text-xs leading-5 text-muted-foreground">
          Screenshot-derived case · Research prototype · No decisions or response actions are persisted.
        </p>
      </div>
    </main>
  );
}
