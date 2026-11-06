import type { Metadata } from "next";
import { IntegrationsDirectory } from "@/components/fortmind/integrations/integrations-view";

export const metadata: Metadata = {
  title: "Integrations",
  description: "Preview directory of security data and investigation tools for OSCAR.",
  robots: { index: false, follow: false },
};

export default function IntegrationsPage() {
  return <IntegrationsDirectory />;
}
