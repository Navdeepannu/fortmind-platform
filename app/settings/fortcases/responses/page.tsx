import type { Metadata } from "next";
import { ResponsesSettings } from "@/components/settings/fortcases-settings";

export const metadata: Metadata = { title: "Responses" };
export default function Page() { return <ResponsesSettings />; }
