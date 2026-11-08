import type { Metadata } from "next";
import { Suspense } from "react";
import { CaseOverview } from "@/components/fortmind/case-overview/case-overview";
import { CaseDetails } from "@/components/fortmind/case-overview/case-details";
import { caseOverview } from "@/lib/case-overview-data";
import { platformCases, findPlatformCase } from "@/lib/platform-cases";

export const instant = false;

export function generateStaticParams() {
  return [
    ...platformCases.map((item) => ({ caseId: item.id })),
    { caseId: caseOverview.id },
  ];
}

export async function generateMetadata({
  params,
}: PageProps<"/platform/cases/[caseId]">): Promise<Metadata> {
  const { caseId } = await params;
  return {
    title:
      caseId === caseOverview.id
        ? caseOverview.title
        : (findPlatformCase(caseId)?.title ??
          (caseId.startsWith("FM-LOCAL-")
            ? "Case investigation"
            : "Case unavailable")),
  };
}

async function CaseContent({ params }: PageProps<"/platform/cases/[caseId]">) {
  const { caseId } = await params;
  if (caseId === caseOverview.id) return <CaseOverview data={caseOverview} />;
  // Locally created cases are resolved by the existing client fixture store.
  return <CaseDetails id={caseId} />;
}

export default function CasePage(props: PageProps<"/platform/cases/[caseId]">) {
  return (
    <Suspense
      fallback={
        <p className="py-8 text-sm text-muted-foreground">
          Loading investigation…
        </p>
      }
    >
      <CaseContent {...props} />
    </Suspense>
  );
}
