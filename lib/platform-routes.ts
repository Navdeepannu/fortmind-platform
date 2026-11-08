import type { CaseViewSelection } from "@/lib/case-sections";

/** Canonical destinations for implemented platform screens. */
export const platformRoutes = {
  entry: "/platform",
  overview: "/platform/overview",
  cases: "/platform/cases",
  caseDetailReview: "/platform/cases/case-detail",
  integrations: "/platform/integrations",
  knowledge: "/platform/knowledge",
  reports: "/platform/reports",
  settings: "/settings",
} as const;

export const caseHref = (caseId: string) =>
  `${platformRoutes.cases}/${encodeURIComponent(caseId)}`;

/** Preserve the current case route and unrelated query state when changing views. */
export function caseViewHref(currentHref: string, selection: CaseViewSelection, target = "") {
  const url = new URL(currentHref, "http://fortmind.local");
  url.searchParams.set("tab", selection.tab);
  url.searchParams.set("view", selection.view);
  url.hash = target;
  return `${url.pathname}${url.search}${url.hash}`;
}

export const integrationHref = (integrationId: string) =>
  `${platformRoutes.integrations}/${encodeURIComponent(integrationId)}`;

export const impactReportHref = (period: string) => `${platformRoutes.reports}?period=${encodeURIComponent(period)}`;
