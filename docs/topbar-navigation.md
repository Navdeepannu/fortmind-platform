# Centered top-bar navigation

## Decision

Use the top utility bar as the **only breadcrumb location**. The sidebar is primary navigation, the centered breadcrumbs are route context, and content headings describe the page. Duplicating Back / Breadcrumb UI inside detail views wastes vertical space.

## Route behavior

| Route | Top bar context |
| --- | --- |
| `/platform/overview` | Workspace / Overview |
| `/platform/cases` | Workspace / Cases |
| `/platform/cases/FM-1048` | Workspace / Cases / FM-1048 |
| `/platform/cases/case-detail` | Workspace / Cases / Investigation |
| `/platform/integrations/microsoft-365` | Workspace / Integrations / Microsoft 365 |
| `/platform/knowledge` | Workspace / OSCAR Context |
| `/platform/reports` | Workspace / Reports |
| `/settings/fortcases/investigations` | Settings / FortCases / Investigations |
| `/settings/trust-data` | Settings / Trust & Data |

- Breadcrumb ancestors are real links using implemented destinations. Current item has `aria-current="page"`.
- The center occupies its own middle grid column, balanced by flexible left and right regions. Responsive truncation prevents horizontal overflow; at narrow widths the redundant Workspace/Settings root is visually hidden for three-level paths.
- The sidebar open/collapse control stays left; search and notifications remain right. Settings preserve the back-to-product navigation in the sidebar.
- Page headings, case IDs, classification badges, and information tabs stay. Only redundant in-page breadcrumbs/back-links on investigation and integration detail were removed.
- Route mapping is centralized in `lib/workspace-breadcrumbs.ts`. Integration detail names derive from the existing fixture list; the case breadcrumb uses an identifier, not a long title.
- The existing PR branch already moved full search into the sidebar and kept the compact search icon in the top bar.

## Checks

- `node --test scripts/workspace-breadcrumbs.test.mjs`
- `node scripts/topbar-breadcrumb-browser-check.mjs` (Playwright, server at `http://localhost:3000`, with dark/light at 390, 768, 1024, 1440 px)
- `node scripts/platform-browser-check.mjs` and `node scripts/content-width-browser-check.mjs` for existing navigation and spacing
- `pnpm typecheck && pnpm lint && pnpm build`

The PR remains draft pending local/browser QA.
