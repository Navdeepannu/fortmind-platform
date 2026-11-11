import { previewIntegrations } from "./preview-integrations";
import { casePreviewId } from "./case-preview-id";
import { platformRoutes } from "./platform-routes";

export type NavigationCrumb = {
  label: string;
  href?: string;
};

function section(label: string, href?: string): NavigationCrumb {
  return { label, ...(href ? { href } : {}) };
}

/** Route state is the source of truth; never duplicate navigation state per page. */
export function platformBreadcrumbs(pathname: string): NavigationCrumb[] {
  const parts = pathname.split("/").filter(Boolean);
  const root = section("Workspace", platformRoutes.overview);
  const area = parts[1] ?? "overview";
  const item = parts[2];

  if (area === "overview") return [root, section("Overview")];
  if (area === "cases") {
    if (!item) return [root, section("Cases")];
    const caseLabel =
      item === "layout-lab"
        ? "Layout lab"
        : item === "case-detail"
          ? `Case ${casePreviewId.slice(0, 8)}`
          : decodeURIComponent(item);
    return [root, section("Cases", platformRoutes.cases), section(caseLabel)];
  }
  if (area === "integrations") {
    if (!item) return [root, section("Integrations")];
    const known = previewIntegrations.find(
      (integration) => integration.slug === decodeURIComponent(item),
    );
    return [root, section("Integrations", platformRoutes.integrations), section(known?.name ?? "Integration")];
  }
  if (area === "knowledge") return [root, section("OSCAR Context")];
  if (area === "reports") return [root, section("Reports")];
  return [root, section("Workspace")];
}

/** Settings use their own shell, but share the same top-bar breadcrumb styling. */
export function settingsBreadcrumbs(pathname: string): NavigationCrumb[] {
  const parts = pathname.split("/").filter(Boolean);
  const root = section("Settings", "/settings");
  const category = parts[1];
  if (!category) return [section("Settings")];
  if (category === "fortcases") {
    const labels: Record<string, string> = {
      investigations: "Investigations",
      alerts: "Alerts",
      escalation: "Escalation",
      responses: "Responses",
      "spend-impact": "Spend & Impact",
    };
    return [
      root,
      section("FortCases", "/settings/fortcases/investigations"),
      section(labels[parts[2] ?? ""] ?? "Settings"),
    ];
  }
  if (category === "notifications") return [root, section("Notifications")];
  if (category === "trust-data") return [root, section("Trust & Data")];
  return [root, section("Settings")];
}
