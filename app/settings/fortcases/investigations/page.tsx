import type { Metadata } from "next";
import { InvestigationsSettings } from "@/components/settings/fortcases-settings";

export const metadata: Metadata = { title: "Investigations" };
export default function Page() { return <InvestigationsSettings />; }
