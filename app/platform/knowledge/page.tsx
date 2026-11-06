import type { Metadata } from "next";
import { Knowledge } from "@/components/fortmind/knowledge";
export const metadata: Metadata = { title: "OSCAR Context" };
export default function KnowledgePage() { return <Knowledge />; }
