# FortMind surface hierarchy

This is the canonical surface contract for FortMind's workspace chrome, overview cards, case tables, filters, and floating controls. All theme values are defined in `app/globals.css`; primitives consume semantic Tailwind v4 aliases via `@theme inline`. Dark mode uses restrained cool graphite (subtle blue undertone), not vivid tinted surfaces. Semantic severity/verdict/OSCAR tokens are separate and unchanged.

## Color roles

| Role | CSS variable / utility | Light | Dark | Usage |
| --- | --- | --- | --- | --- |
| Workspace canvas | `--background` / `bg-background` | `#F4F6F8` | `#0D0F12` | Main application background |
| Workspace chrome | `--shell` / `bg-shell` | `#E9EEF2` | `#16191E` | Sidebar and top navigation |
| Card/table | `--surface` / `bg-surface`, also `--card` | `#FFFFFF` | `#1E2329` | Overview cards, case table rows, panels |
| Toolbar | `--muted` / `bg-muted` | `#F0F4F7` | `#252B32` | Case queue tabs and filter-row backdrop |
| Interactive control | `--control` / `bg-control`, also `--secondary` | `#EFF3F6` | `#2A3038` | Search inputs, select triggers, outline and secondary buttons |
| Row/control hover | `--surface-hover` / `bg-surface-hover` | `#E7EDF3` | `#313942` | Table hover, preview-selected, focused controls |
| Floating surface | `--surface-floating` / `bg-surface-floating`, also `--popover` | `#FBFCFE` | `#373F49` | Tooltips, hover cards, dropdowns, popovers, inspector |
| Floating item hover | `--floating-hover` / `bg-floating-hover` | `#E8EEF4` | `#45505B` | Hover/focus selection inside portaled menus |
| Structural border | `--border` / `border-border` | `#D8E0E7` | `#3B444E` | Dividers and card/table boundaries |
| Elevated border | `--border-strong` / `ring-border-strong` | `#B9C6D2` | `#535F6C` | Floating menus and stronger separators |
| Input outline | `--input` / `border-input` | `#B8C5D1` | `#4C5865` | Controls that require a visible boundary |

Hex values are human-readable design references converted to OKLCH values in CSS. Actual browsers may differ by a few RGB values due to precision/rounding.

## Implementation map

- `components/fortmind/workspace-shell.tsx`: sidebar uses `bg-sidebar` (which aliases `--shell`); top utility bar uses `bg-shell`; workspace inset uses `bg-background`.
- `components/fortmind/overview/overview.tsx`: metric cards continue to use `bg-card` and therefore automatically receive the revised surface.
- `components/fortmind/case-table.tsx`: the table shell and rows use `bg-surface`; queue tabs and filter toolbar use `bg-muted`; filter buttons and search inputs use `bg-control`.
- `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/textarea.tsx`, `components/ui/native-select.tsx`, `components/ui/select.tsx`: control fill and interaction states are shared across the platform.
- `components/ui/dropdown-menu.tsx`, `components/ui/popover.tsx`, `components/ui/hover-card.tsx`, `components/ui/tooltip.tsx`: floating panels use `bg-surface-floating` and `ring-border-strong`; nested menu focus uses `bg-floating-hover`.
- `components/ui/table.tsx`: hover/selected rows use `bg-surface-hover`. Do not add separate per-table palettes.

Avoid introducing raw hex colors in components. For existing components, prefer `bg-card`, `bg-surface`, `bg-control`, `bg-surface-floating`, `bg-surface-hover`, or `bg-floating-hover` according to the layer.

## Light mode and graphite experiment

Light mode uses the same hierarchy in a restrained cool-gray range rather than an unrelated palette. The optional `FORTMIND_VISUAL_EXPERIMENT=graphite` now changes **geometry/density only**; it must not override backgrounds, surfaces, controls, text or navigation colors. This prevents the same route from rendering different palettes depending on deployment flags. Automatic system light/dark selection via `next-themes` remains unchanged.

## Accessibility and semantics

- Keep focus outlines and `--ring` intact. They are functional focus indicators, not decorative accents.
- Text, iconography and semantic statuses remain keyed to their existing roles. In particular, `Closed` must not imply `Benign`, and OSCAR's brand accent must not replace danger/warning indicators.
- Keyboard focus/hover should remain perceivable inside floating panels. Do not use only background color to convey selection.
- Borders are intentionally understated. Verify keyboard focus and control affordances on real displays and in both color modes.

## Validation checklist

Run `pnpm test:colors`, `pnpm test:preview`, `pnpm typecheck`, and `pnpm build` in the checkout. Then inspect Overview and Cases at desktop and mobile widths in both themes: sidebar vs canvas, card vs canvas, filter control vs table, row hover/selection, floating dropdown vs filter, tooltip and inspector. Confirm that compiled Tailwind CSS includes `bg-control` and `bg-floating-hover`, and compare computed CSS variables for the same deployment on mobile and desktop.

These steps are verification requirements for the PR; they are not claims that browser or build checks were executed in this environment.
