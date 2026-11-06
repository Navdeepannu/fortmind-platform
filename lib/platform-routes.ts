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

export const integrationHref = (integrationId: string) =>
  `${platformRoutes.integrations}/${encodeURIComponent(integrationId)}`;

export const impactReportHref = (period: string) => `${platformRoutes.reports}?period=${encodeURIComponent(period)}`;
