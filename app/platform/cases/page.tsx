import { Suspense } from "react";
import type { Metadata } from "next";
import { CasesWorkspace } from "@/components/fortmind/cases-workspace";

export const metadata: Metadata = {
  title: "Cases",
  robots: { index: false, follow: false },
};
export default function CasesPage() {
  return (
    <Suspense
      fallback={
        <p className="p-8 text-sm text-muted-foreground">
          Loading case workspace…
        </p>
      }
    >
      <CasesWorkspace />
    </Suspense>
  );
}
