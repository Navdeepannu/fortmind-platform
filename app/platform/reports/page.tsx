import type { Metadata } from "next";
import { Suspense } from "react";
import { Reports } from "@/components/fortmind/reports";
import { Skeleton } from "@/components/ui/skeleton";
export const metadata: Metadata = { title: "Reports" };
export default function ReportsPage() { return <Suspense fallback={<main id="preview-main" className="mx-auto w-full max-w-[1580px] px-8 pt-7.5 pb-5.5 max-[1360px]:px-6.5 max-[1360px]:pt-6.5 max-[1360px]:pb-5 max-md:px-4 max-md:pt-6 max-md:pb-4.5" aria-label="Loading reports" aria-busy="true"><Skeleton className="h-9 w-52" /><Skeleton className="mt-6 h-64 w-full" /></main>}><Reports /></Suspense>; }
