# FortMind color reference

> Historical design/validation record. For the current Neutral theme, token values, and CSS architecture, see [css-cleanup.md](css-cleanup.md).

Open **http://localhost:3000/design-system/colors** while `pnpm dev` is running. Use `localhost` with this dev server; Next.js blocks development resources requested from its unconfigured `127.0.0.1` origin.

The route returns HTTP 404 outside development, has no production navigation entry, and is marked `noindex, nofollow`. Source inspection and the client catalog are imported only in the development branch. No dependency or existing theme token was changed.

## Coverage

- 126 existing color tokens: global theme definitions, Tailwind utility mappings, scoped dashboard semantics, indicator inks, and surface overrides.
- 23 existing component recipes: hover, focus, selection, borders, inputs, overlays, transparent indicators, and the chart's 3.5% area fill. Recipe expressions are documented against their originating components; update this small manifest if those component recipes change.
- All 43 semantic definitions from the shared registry, rendered with the existing badge/indicator component.
- 86 Lucide references, including context-specific color and size variations. Light and dark samples appear together; copy controls always use the active theme.
- A case review composition using the existing cards, badges, indicators, and buttons.

The requested **Unresolved** section presents `--semantic-neutral`. The application has no separate unresolved token. Success presents the existing positive/success aliases. The page explains these mappings rather than introducing new colors.

## Resolution and copying

`lib/color-inventory.ts` reads `app/globals.css`, `app/design-preview/preview.css`, and the installed Tailwind `theme.css`. It keeps global and dashboard scopes separate. It also checks Lucide import coverage and reports undefined legacy semantic classes.

`lib/color-resolution.ts` resolves both source profiles in isolated DOM probes without switching the document theme. Native CSS resolution handles variable aliases, OKLCH, and color mixing. Canvas converts the resulting color into 8-bit sRGB HEX. RGB is sampled at full opacity, with alpha carried separately, preventing inaccurate RGB caused by unpremultiplying a low-opacity pixel.

Translucent values copy as `#RRGGBBAA`. The alpha byte necessarily rounds to 8-bit precision; the exact CSS alpha percentage remains visible. Authored light/dark expressions and source paths appear in each swatch's title. The full active palette can also be copied as JSON.

The brand remains exactly `oklch(0.5488 0.1378 266.04)` in both source profiles, resolving to `#4B6CC1`. Global primary hover values and the dashboard's separate 85% hover recipe are both presented.

## Validation

- TypeScript, ESLint, production build, 7 color-audit tests, and 16 existing preview tests passed.
- HTTP checks confirmed development 200 and production 404.
- Browser checks at 100% zoom covered 1440px, 1280px, and 390px, in light and dark themes. There was no page-level horizontal overflow. The icon table and section links scroll locally on narrow screens.
- Verified native clipboard output, active-theme changes, transparent HEX, JSON export, icon filtering, and keyboard copy with retained focus.
- Checked rendered priority icons: 16 × 16px with 2.25px stroke.
- Browser-resolved palette contrast: semantic badge text minimum **8.65:1 light / 8.20:1 dark**; unboxed indicator icon minimum **5.03:1 light / 9.34:1 dark**; primary action text **4.77:1** in both themes. JSON checks use rounded HEX alpha; the on-page ratios use exact CSS alpha.
- SHA-256 comparisons confirmed `globals.css`, `preview.css`, `semantic-states.ts`, and the shared button component were unchanged.

Evidence lives in `docs/screenshots/colors/`: desktop/mobile screenshots, paired icon reference, resolved palettes, and contrast results.

The audit found two existing undefined classes in `components/ui/sementic-color-provider.tsx`: `bg-destructuve-background` and `text-destructive-foreground`. These belong to the older `/design` example. They are reported in the reference footer and preserved as requested.

## Files added or updated for this page

- `app/design-system/colors/page.tsx` — development gate and source loading.
- `app/design-system/colors/colors.css` — scoped reference presentation.
- `components/color-audit/color-catalog.tsx` — swatches, copying, theme controls, state examples, and icon table.
- `components/color-audit/icon-reference.ts` — dashboard interface icon contexts; semantic icons come directly from the existing registry.
- `lib/color-inventory.ts` and `lib/color-resolution.ts` — extraction and native resolution.
- `scripts/color-audit.test.mjs` and the `test:colors` package script — extraction, alpha, brand preservation, and contrast helper checks.
- This document and the evidence files above.
