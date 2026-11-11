import type { Metadata } from "next";
import { CaseNavigationLab } from "@/components/fortmind/case-lab/case-navigation-lab";

export const metadata: Metadata = {
  title: "Case Detail Layout Lab",
  description: "Compare case-detail navigation patterns using existing FortMind investigation data.",
  robots: { index: false, follow: false },
};

export default function CaseLayoutLabPage() {
  return <CaseNavigationLab />;
}
