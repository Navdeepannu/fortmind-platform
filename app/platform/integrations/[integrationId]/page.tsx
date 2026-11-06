import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { IntegrationDetail } from "@/components/fortmind/integrations/integrations-view";
import { previewIntegrationBySlug, previewIntegrations } from "@/lib/preview-integrations";

export const instant = false;

export function generateStaticParams() {
  return previewIntegrations.map((integration) => ({ integrationId: integration.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ integrationId: string }> }): Promise<Metadata> {
  const { integrationId } = await params;
  const integration = previewIntegrationBySlug(integrationId);
  return {
    title: `${integration?.name ?? "Integration"}`,
    robots: { index: false, follow: false },
  };
}

async function DetailContent({ params }: { params: Promise<{ integrationId: string }> }) {
  const { integrationId } = await params;
  const integration = previewIntegrationBySlug(integrationId);
  if (!integration) notFound();
  return <IntegrationDetail integration={integration} />;
}

export default function IntegrationDetailPage({ params }: { params: Promise<{ integrationId: string }> }) {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted-foreground">Loading integration…</p>}>
      <DetailContent params={params} />
    </Suspense>
  );
}
