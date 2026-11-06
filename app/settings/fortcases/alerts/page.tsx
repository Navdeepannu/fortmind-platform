import type { Metadata } from "next";
import { AlertsSettings } from "@/components/settings/fortcases-settings";

export const metadata: Metadata = { title: "Alerts" };
export default function Page() { return <AlertsSettings />; }
