import type { Metadata } from "next";
import { CaseOverview } from "@/components/fortmind/case-overview/case-overview";
import { caseOverview } from "@/lib/case-overview-data";

export const metadata: Metadata = {
  title: `${caseOverview.title} · Client review`,
  description: "Standalone review of the existing FortMind investigation workspace.",
  robots: { index: false, follow: false },
};

export default function CaseDetailReviewPage() {
  return <CaseOverview data={caseOverview} />;
}
