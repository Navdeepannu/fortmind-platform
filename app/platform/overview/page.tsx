import type { Metadata } from "next";
import { Overview } from "@/components/fortmind/overview/overview";

export const metadata: Metadata = {
  title: "Overview",
  description: "What needs you, and what OSCAR has handled.",
  robots: { index: false, follow: false },
};

export default function OverviewPage() {
  return <Overview />;
}
