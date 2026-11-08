# Platform content width

## Cause and correction

`app/platform/layout.tsx` rendered `WorkspaceShell`, which passed page children directly into the flexible `SidebarInset` below the utility bar. The inset correctly occupied the available width beside the sidebar. Page roots used full width with local padding, and the Case Details header, navigation levels, panels, and footnote each supplied separate gutters. The source had no shared container or 1620/914 px tokens. At 2560 px the case workspace measured 2304 px expanded and 2496 px collapsed, with `max-width: none` in both states.

Both shells now render one `PageContainer` below their top bar. Its outer element supplies gutters. Its inner element centers the content and caps its width. Standard pages use 1620 px, including both tabbed case entry points and the wider Trust & Data document. Settings forms use the 914 px compact option. The gutter breakpoints follow the existing `md` and `2xl` widths, giving 16 px below 768 px, 24 px through 1535 px, and 32 px from 1536 px.

Page roots now supply vertical spacing and inherit horizontal geometry. The Graphite `cases-main` rules use block padding. Loading, error, and missing integration views share the same boundary. Both case tab bars and their active content use the same horizontal edges as the breadcrumb, header, and footnote. Existing table scroll containers handle wide table content.

## Browser measurements

Measurements are CSS pixels. The standard columns apply to platform pages beside the 256 px expanded or 64 px collapsed workspace sidebar. Settings uses its own 240 px desktop sidebar.

| Viewport | Before, Case Details expanded / collapsed | Standard expanded | Standard collapsed | Compact Settings | Trust & Data | Gutter |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1280 | 1024 / 1216 | 976 | 1168 | 914 | 992 | 24 |
| 1440 | 1184 / 1376 | 1136 | 1328 | 914 | 1152 | 24 |
| 1920 | 1664 / 1856 | 1600 | 1620 | 914 | 1616 | 32 |
| 2560 | 2304 / 2496 | 1620 | 1620 | 914 | 1620 | 32 |

At 2560 px the standard content begins at x=598 with the sidebar expanded and x=502 when collapsed. The matching margins within the workspace are 342 px and 438 px per side. At 390 px the content measures 358 px with 16 px gutters.

## Changed files

| Area | Files |
| --- | --- |
| Shared configuration and primitive | `app/globals.css`, `components/layout/page-container.tsx` |
| Shell integration | `components/fortmind/workspace-shell.tsx`, `components/settings/settings-shell.tsx` |
| Overview, FortCases, Context, Reports, Integrations | `components/fortmind/overview/overview.tsx`, `components/fortmind/cases-workspace.tsx`, `components/fortmind/knowledge.tsx`, `components/fortmind/reports.tsx`, `components/fortmind/integrations/integrations-view.tsx` |
| Case headers, navigation, panels, and footer | `components/fortmind/case-overview/case-overview.tsx`, `components/fortmind/case-overview/case-details.tsx`, `components/fortmind/case-overview/section-navigation.tsx` |
| Settings page roots | `components/settings/settings-form.tsx`, `components/settings/trust-data.tsx` |
| Route fallbacks | `app/platform/cases/page.tsx`, `app/platform/cases/[caseId]/page.tsx`, `app/platform/integrations/loading.tsx`, `app/platform/integrations/error.tsx`, `app/platform/integrations/[integrationId]/page.tsx`, `app/platform/integrations/[integrationId]/not-found.tsx`, `app/platform/reports/page.tsx` |
| Verification and layout guidance | `scripts/content-width-browser-check.mjs`, `docs/content-width-layout.md`, `docs/design-foundation.md`, `docs/platform-structure.md` |

## Verification

The browser script measures rendered bounding boxes, computed padding, and page overflow. It exercises all seven Settings routes, the main workspace routes, Integration details, lightweight Case Details, and all five primary tabs and 11 views at both tabbed Case Details entry points. It runs in light and dark themes and checks desktop sidebar expansion and collapse. The table check gives the case table a 1900 px test width and verifies horizontal scrolling inside the existing table scroller.

Run `node scripts/content-width-browser-check.mjs` with `PREVIEW_ORIGIN` pointing at the local preview. Set `PLAYWRIGHT_MODULE` and `PLAYWRIGHT_EXECUTABLE` when Playwright is supplied externally. The script writes `measurements.json` and screenshots under `WIDTH_OUTPUT`, which defaults to `/tmp/fortmind-content-width/after`.

The long-running development server initially served a stale stylesheet that omitted the new layout tokens. Restarting that server restored the same measured 1620 px cap seen in the Graphite production build.

The Graphite production run passed 208 page measurements and 374 Case Details view measurements with zero page errors. The 1900 px test table scrolled locally while the page container measured 976 px. The restarted development preview matched the eight desktop viewport and sidebar combinations. TypeScript, lint, all 68 unit tests, the Graphite production build, and `git diff --check` passed.
