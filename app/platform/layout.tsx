import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/fortmind/workspace-shell";

export const metadata: Metadata = {
  title: { default: "FortMind", template: "%s · FortMind" },
  description: "FortMind security investigations workspace. Illustrative prototype data.",
  robots: { index: false, follow: false },
};

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
