> Current semantic presentation (2026-11-06): [design-foundation.md](design-foundation.md#semantic-indicators-6-november-refinement). It replaces the historical palette, badge styling and icon choices below. `app/globals.css` and `lib/semantic-states.ts` are the current source of truth.

> The finalized 2026-11-04 palette, icon registry and validation are in [semantic-system.md](semantic-system.md). The earlier implementation notes below are historical and superseded where they differ.

> Historical design/validation record. For current routes, file locations and checks, see [platform structure](platform-structure.md).

# FortMind dashboard foundation

Preview route: `/design-preview`. The latest semantic refinements, full token values, and complete icon/meaning registry are documented in [semantic-refinement.md](semantic-refinement.md). Static, synthetic data only. No authentication, database, migrations, remote investigations, or production data are involved.

## Architecture and preserved foundation

The project was already a Next.js 16.4.3 App Router application, React 19.3, Tailwind v4, and shadcn `base-nova` with Base UI 1.9. The existing `/`, `/dashboard`, and `/design` routes are preserved. Existing uncommitted work was retained.

`app/globals.css` was inspected and left unchanged by this implementation. Its Neutral background, foreground, card, popover, secondary, muted, accent, border, input, sidebar, primary, radii, and `@theme inline` mappings remain the foundation. The preview inherits the existing neutral `--primary` in both themes, so no temporary brand palette is introduced.

The existing `next/font/google` Inter and Geist Mono configuration is reused. The only root-layout edit removes the unused Geist import; no third font is loaded.

The light canvas uses the existing Neutral sidebar surface; the dark canvas uses the existing near-black background so cards remain one visible level above the page. Recharts axis ticks explicitly use the muted text token because its current default tick markup differs from the downloaded chart wrapper's selector.

`app/design-preview/preview.css` scopes the new foundation to `.fm-preview`, also applied to the portaled case sheet and column menu. It maps existing danger/warning/success/info tokens to the complete semantic vocabulary and adds failure, neutral, and agent families. It deliberately strengthens only the preview's muted text and focus ring (Neutral 600/500 in light, 400/400 in dark). Destructive UI actions use a separate red 700/400 token.

## Exact Tailwind color choices

All named shades below come from the installed Tailwind palette; no custom semantic hex values are introduced.

| Category    | Family  | Light: solid / text / background / border | Dark: solid / text / background / border |
| ----------- | ------- | ----------------------------------------- | ---------------------------------------- |
| Danger      | red     | 600 / 900 / 50 / 200                      | 400 / 300 / 400 at 10% / 400 at 20%      |
| Warning     | amber   | 600 / 900 / 50 / 200                      | 400 / 300 / 400 at 10% / 400 at 20%      |
| Positive    | green   | 600 / 900 / 50 / 200                      | 400 / 300 / 400 at 10% / 400 at 20%      |
| Information | blue    | 600 / 900 / 50 / 200                      | 400 / 300 / 400 at 10% / 400 at 20%      |
| Failure     | orange  | 600 / 900 / 50 / 200                      | 400 / 300 / 400 at 10% / 400 at 20%      |
| Neutral     | neutral | 500 / 700 / 100 / 200                     | 400 / 300 / 400 at 8% / 400 at 18%       |
| Agent       | violet  | 600 / 900 / 50 / 200                      | 400 / 300 / 400 at 10% / 400 at 20%      |

The light 900-on-50 foreground pairs and fully opaque dark 300 foregrounds on 10% tints prioritize ordinary-text contrast. Solid 600/400 shades define chart series and tint sources; semantic state icons inherit the corresponding readable foreground shade. Labels and Lucide icons accompany every semantic state. Neutral styling communicates confidence, assignment, and sources. “Closed by OSCAR” is represented by `status: "Closed"` plus `closedByOscar`, preserving the lifecycle distinction.

## Typography

Inter: page 24/32, 600, -2%; section 18/28, 600, -1%; card 16/24, 600, -1%; body 14/22, 400; case titles/body medium 14/20, 500; small 13/20, 400; label 12/16, 500, +1%; caption 12/18, 400; KPI 30/36, 600, -2%. KPI numerals use Inter with tabular figures.

Geist Mono: case IDs 12/18, 400; complete technical identifiers in the case sheet 13/20, 500. Full technical information is searchable and available in the details sheet. Compact rows keep titles on one line; comfortable rows permit two lines. Mobile rows stack essential badges rather than reduce the main text size.

Typeset guidance informed the readable OSCAR summary flow; no prose-wide stylesheet or extra rich-text dependency was added to this compact dashboard.

## Components and interactions

- `components/fortmind/dashboard-preview.tsx`: preview shell, theme menu, reporting-period selection, reusable KPI cards.
- `components/fortmind/charts.tsx`: shadcn ChartContainer with Recharts 3.8 area, stacked bar, and donut charts. No chart animation. Native expandable tables expose all plotted values.
- `components/fortmind/case-table.tsx`: local search, queue, priority, verdict, assignment, source, autonomous filters; sorting announcements; selection; pagination; column visibility; density; JSON export; accessible case sheet.
- `components/fortmind/semantic.tsx`: reusable verdict, priority, workflow, confidence, and phase components, driven by the canonical `lib/semantic-states.ts` vocabulary.
- `components/fortmind/showcase.tsx`: evidence, action, integration, hypothesis, button, and technical metadata reference.
- `lib/preview-data.ts`: explicit domain types, synthetic cases, independently labeled confidence levels, two coherent reporting snapshots, reusable filter logic.
- `app/design-preview/page.tsx` and `preview.css`: isolated entrypoint, metadata, theme tokens, responsive layout, typography, reduced-motion support.
- `components/ui/{card,table,chart,sheet,checkbox,tabs,toggle-group,toggle,input,native-select,empty,separator}.tsx`: official shadcn Base UI source. Existing button, theme infrastructure, and dropdown menu were reused. Badge has an additive opt-in 16px icon-size variant; its default behavior is preserved.
- `package.json`, `pnpm-lock.yaml`: Recharts is the only new application dependency; typecheck and data-test commands were added.
- `scripts/preview-data.test.mjs`: built-in Node test runner, using existing TypeScript tooling to load the domain fixtures. No test-framework dependency.
- `scripts/preview-browser-check.mjs`: repeatable Playwright checks using external browser tooling, without adding a browser dependency to the application.

## Deliberate scope and tradeoffs

This project had no TanStack Table setup, so the preview uses the official shadcn Table with small typed local-state operations instead of adding a second state engine for 12 static records. This can move to TanStack when the real product needs server pagination or larger datasets.

The reporting-period selector switches coherent 7-day and 14-day aggregate snapshots. The queue is a separate, explicitly labeled 12-case sample; queue counts reflect that sample, not aggregate reporting metrics. Running is illustrated as three aggregate investigations and one sample case. All dates and ages are fixed demo data.

Owner hides below 1280px, age below 1024px, and rows stack their essential fields below 768px. Every field remains available through the case sheet. Column controls describe the desktop table; mobile retains essential verdict, priority, and status for scanability. Source is optional and off by default.

Keyboard navigation, a focus-trapped Base UI dialog, Escape dismissal, focus restoration, visible focus, native selects, labeled checkboxes, `aria-sort`, live selection/sort feedback, textual chart alternatives, and reduced-motion rules are included. Icons use supported installed Lucide exports; no substitutions or custom icon assets were required.

Button variants in the reference demonstrate local activation feedback only. Export downloads JSON of selected cases, or filtered cases when none are selected. There is no investigation backend and no platform mutation.

## Official documentation consulted

- [shadcn theming](https://ui.shadcn.com/docs/theming): CSS-variable Neutral foundation.
- [Table](https://ui.shadcn.com/docs/components/base/table) and [Data Table](https://ui.shadcn.com/docs/components/base/data-table): semantic table composition and local table behavior. Current online Data Table documentation describes TanStack v9; this project has no TanStack dependency and does not mix those APIs into local state.
- [Charts](https://ui.shadcn.com/docs/components/base/chart): current Recharts v3 integration, ChartContainer, tooltips, and accessibilityLayer. The requested `/docs/charts` URL was unavailable; the official component documentation was used.
- [Typeset](https://ui.shadcn.com/docs/typeset): prose-specific rhythm, confined to summary content.
- [Tailwind colors](https://tailwindcss.com/docs/colors): official palette families and CSS-variable consumption.
- [Lucide](https://lucide.dev/icons): icon vocabulary, checked against installed exports through TypeScript compilation.
- Installed Next.js documentation for fonts, App Router pages/layouts, and CSS was read before implementation, as required by this repository's `AGENTS.md`.

## Validation

Run from `fortmind-platform`:

```sh
pnpm typecheck
pnpm lint
pnpm test:preview
pnpm build
pnpm dev
```

Then visit `http://localhost:3000/design-preview`.

The production preview can also be served with `pnpm start --port 3001` after a build.

Detailed browser verification results and semantic contrast ratios are recorded in `preview-validation.json` after the final browser run. This is a focused implementation check, not a complete WCAG conformance audit or a substitute for assistive-technology and product-user review.

The saved browser check uses an externally available Playwright installation. With `playwright` resolvable locally, run `PREVIEW_URL=http://localhost:3001/design-preview node scripts/preview-browser-check.mjs`. Otherwise set `PLAYWRIGHT_MODULE` to its absolute `index.mjs` path. Screenshots go to the system temporary folder, or `PREVIEW_SCREENSHOT_DIR` when specified.

Verified on October 26, 2026: production build, TypeScript, ESLint (no warnings), sixteen data and semantic contract tests, and twelve browser interaction checks passed. Both themes passed viewport checks at 1440, 1280, 1024, 768, and 390px with no page or table overflow. No browser console or hydration errors were reported. The latest composited semantic role contrast ranges from 8.21:1 to 12.31:1; chart axes, muted case metadata, and destructive button text were also checked against their rendered backgrounds and exceeded 4.5:1.

Focused checks also passed for mobile sheet sizing, reduced-motion transitions, focus trapping, Escape dismissal, checkbox selection without opening the sheet, and absence of nested buttons. The original `/`, `/dashboard`, and `/design` pages and the new preview all returned HTTP 200.
