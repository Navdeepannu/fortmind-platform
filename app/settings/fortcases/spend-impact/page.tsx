import type { Metadata } from "next";
import { SpendSettings } from "@/components/settings/fortcases-settings";

export const metadata: Metadata = { title: "Spend & Impact" };
export default function Page() { return <SpendSettings />; }
