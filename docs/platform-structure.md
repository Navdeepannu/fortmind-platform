# FortMind application structure

Current route and implementation reference, November 5, 2026. Earlier design-preview notes and `platform-validation.json` document the pre-expansion baseline.

## Routes

| Section | Route | Behavior |
| --- | --- | --- |
| Platform entry | `/platform` | Redirects to Overview |
| Overview | `/platform/overview` | Existing security overview |
| Cases | `/platform/cases` | Existing queue, search, filters and local case drafts |
| Case detail client review | `/platform/cases/case-detail` | Direct standalone example using the existing 11-section investigation and screenshot-derived data |
| Case details | `/platform/cases/[caseId]` | Stable case ID, including the separate UUID investigation |
| OSCAR Context | `/platform/knowledge` | Admin-rule explanation and browser-saved taught facts |
| Reports | `/platform/reports` | Date-scoped illustrative analytics and CSV export |
| Integrations | `/platform/integrations` | Existing directory |
| Integration details | `/platform/integrations/[integrationId]` | Existing stable fixture slugs |
| Settings entry | `/settings` | Redirects to Investigations |
| Investigations | `/settings/fortcases/investigations` | Autonomy and investigation limits |
| Alerts | `/settings/fortcases/alerts` | Intake guidance and repeat detection configuration |
| Escalation | `/settings/fortcases/escalation` | Notification routing and recipients |
| Responses | `/settings/fortcases/responses` | Off and Measure Only policy |
| Spend & Impact | `/settings/fortcases/spend-impact` | Budget and impact assumptions |
| Trust & Data | `/settings/trust-data` | Source-based product policy reference |
| Notifications | `/settings/notifications` | Personal channel preferences and appearance |

`/platform/context` redirects to Knowledge and `/platform/settings` redirects to Investigations. Former `/design-preview` URLs redirect to their equivalent implemented platform URLs, preserving case IDs and supported query parameters. Active navigation links use the canonical routes. The retired `/design` and `/design-system` experiments are not application routes.

The marketing page remains at `/`. Unknown integration IDs use the existing not-found view. The detailed source-derived case is available at both `/platform/cases/case-detail` for client review and `/platform/cases/13845102-e81a-479e-87db-2cdb8ff21c1c` by ID; both reuse `CaseOverview`. It remains distinct from the synthetic `FM-1048` case.

The full 11-section investigation uses five primary tabs and contextual secondary tabs (November 6, 2026). Exactly one subsection is visible: **Decision** → Conclusion / How OSCAR decided; **Investigation** → Findings / Hypotheses / Attack path; **Evidence** → Entities / Evidence / Similar past cases; **Response** → Actions / Analyst notes; **Timeline** → Timeline, without redundant secondary navigation. The shared case header scrolls normally, while the two navigation levels remain below the utility bar. URLs use `?tab=investigation&view=findings`; refresh and browser history preserve the selected view, invalid combinations use the category's first view, and legacy section/finding/entity/review anchors select the corresponding workspace. All view components stay mounted to preserve local review drafts and finding disclosures. See [contextual navigation](case-contextual-navigation.md). Lightweight case previews retain their existing available data.

## Architecture

`app/platform/layout.tsx` owns the persistent workspace sidebar and top bar. `app/settings/layout.tsx` owns a separate settings sidebar, mobile sheet and page shell. Knowledge and Reports use the platform shell; none of the Settings routes render it. `lib/platform-routes.ts` centralizes platform destinations and ID-safe links.

Both shells apply `components/layout/page-container.tsx` once, below the full-width top bar. `app/globals.css` owns its 1620 px standard / 914 px compact caps and 16/24/32 px responsive gutters. All platform routes, including the complete case workspace and loading/error states, inherit that boundary. Settings forms use compact width; Trust & Data uses standard width. Page components retain vertical spacing and card-internal padding but do not add their own page gutters or competing width caps. See [content-width verification](content-width-layout.md).

`components/settings/settings-form.tsx` supplies shared headings, settings groups, responsive rows, dirty state and save feedback. The seven routes remain independent pages. `hooks/use-browser-record.ts` validates and persists local prototype preferences and taught facts; a failed write leaves edits visible and shows an error. It is not a production policy store. The source-derived Trust & Data page uses a wider document layout with an on-page index.

Knowledge keeps organization-managed Rules separate from user-taught Facts. No Rules service is connected, so no admin actions or counts are fabricated. One taught fact comes from the supplied product screenshot; other facts are explicitly browser-local. Teach, edit, retire, filters and search work locally.

Reports reuse existing stable case and integration IDs. Reporting timestamps and outcomes are illustrative demo events because the repository does not have reporting APIs. Every section uses the same UTC date range. The eight metrics, distributions, indicators, human-review cases and outage table share that range. Hours Saved uses the saved analyst-minutes assumption and is labeled an estimate. CSV export includes the selected range and escapes spreadsheet formulas. PDF export is visibly disabled.

`app/globals.css` remains the only authored global stylesheet and token source. The existing light and dark semantic palette is exposed through Tailwind utilities. Product role aliases resolve to that palette, and the OSCAR role resolves to the FortMind primary brand token. Existing shadcn/Base UI primitives are reused; no route stylesheet or second Tailwind/theme configuration was added.

## Connected data and required backend work

Case and integration screens retain their existing fixture interactions. Case drafts use session storage. Knowledge facts and Settings form values use local storage. Reports are demo analytics, not live production or billing data. The original Trust & Data screenshot is the reference for its product-policy wording; it does not certify this deployment.

Production work still needs authenticated organization and personal settings APIs, role checks, a Rules/Knowledge service, real reporting events and export service, notification delivery, secret management, alert intake provisioning, integration health telemetry and authorized response execution. The UI keeps signing secrets hidden and does not offer unimplemented rotation, action execution or PDF generation. A browser grant for notifications does not imply that push delivery is connected.

## Validation

Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build`. `scripts/platform-browser-check.mjs` covers the established platform fixtures and navigation. `scripts/sections-browser-check.mjs` covers the new routes, themes, redirects, persistence, failure feedback, CSV and mobile layout. Browser suites need Playwright supplied through `PLAYWRIGHT_MODULE` and optionally `PLAYWRIGHT_EXECUTABLE`; see the README. Visual captures for the four established screens and the nine new routes are in `/tmp/fortmind-structure-qa/` and `/tmp/fortmind-sections-qa/` for this local validation session.
