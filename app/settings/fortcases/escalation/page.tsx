import type { Metadata } from "next";
import { EscalationSettings } from "@/components/settings/fortcases-settings";

export const metadata: Metadata = { title: "Escalation" };
export default function Page() { return <EscalationSettings />; }
