import type { Metadata } from "next";
import { TrustData } from "@/components/settings/trust-data";
export const metadata: Metadata = { title: "Trust & Data" };
export default function TrustDataPage() { return <TrustData />; }
