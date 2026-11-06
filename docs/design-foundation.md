# FortMind UI foundation

This exploration keeps the existing routes, data, component hierarchy and workflows. Shared colors, geometry and typography live in `app/globals.css`.

## Typography

Inter is the interface font. Technical identifiers retain the existing monospace font. Sizes stay stable at laptop and mobile widths; headings and actions wrap instead of shrinking the body copy.

| Role | Utility | Size / line height | Weight |
| --- | --- | --- | --- |
| Page title, H1 | `text-page-title` | 24 / 32 px | 600 |
| Section title, H2 | `text-section-title` | 16 / 24 px | 600 |
| Panel title, H3 | `text-panel-title` | 14 / 20 px | 600 |
| Body | `text-body` | 14 / 24 px | 400 |
| Controls and labels | `text-label` | 13 / 20 px | 400–500 |
| Metadata and captions | `text-caption` | 12 / 18 px | 400 |
| Metric | `text-metric` | 32 / 40 px | 600 |

`lib/utils.ts` registers these font-size utilities with the existing class merger. Components use that shared helper so a typography override cannot remove semantic text colors.

## Neutral surfaces and restrained branding

All authored design colors use OKLCH or semantic `var()` aliases. Low-chroma graphite surfaces keep the interface neutral; larger lightness steps distinguish the canvas, panels and overlays.

| Role | Light | Dark |
| --- | --- | --- |
| Shell / sidebar | `oklch(0.955 0.003 265)` | `var(--background)` |
| Background / workspace | `oklch(0.985 0.001 265)` | `oklch(0.193532 0.01849 274.8082)` |
| Table / card surface | `oklch(1 0 0)` | `oklch(0.2204 0.0198 275.84)` |
| Elevated surface | `oklch(1 0 0)` | `oklch(0.265 0.019 275.84)` |
| Border | `oklch(0.865 0.006 265)` | `oklch(0.335 0.018 275.84)` |
| Foreground | `oklch(0.2 0.006 265)` | `oklch(0.965 0.003 265)` |
| Muted foreground | `oklch(0.46 0.012 265)` | `oklch(0.73 0.012 265)` |
| Focus ring | `oklch(0.49 0.01 265)` | `oklch(0.73 0.012 265)` |
| Brand action | `oklch(0.8 0.17 163)` | `oklch(0.8 0.17 163)` |

Hover surfaces use a small lightness step from their resting surface, including navigation, menu highlights and primary actions. Ordinary controls use neutral `primary`, `accent` and `ring` tokens. The explicit Button `brand` variant is used for New Case. Emerald also appears in the logo and OSCAR-specific roles. Selected navigation, tabs, inputs, ordinary labels and borders stay neutral.

Security semantics retain their separate red, amber, blue, green, purple and gray roles. Status badges use color and text only; priority and verdict icons remain distinct. Queue tabs use neutral text and counts without icons. Priority and verdict filter icons keep their existing meanings.

## Geometry and shell

- Badges: 4 px. Controls: 6 px. Cards and sheets: 8 px. The application workspace sits flush against the sidebar.
- The existing shadcn `sidebar` variant uses a 1 px vertical divider, with the sidebar header and workspace toolbar sharing a 48 px baseline. Mobile uses the existing drawer.
- Page gutters are 32 px on desktop and 20 px on mobile. Dashboard and Cases content stay fluid, including when the sidebar collapses.
- Cards use 24 px padding (20 px for compact cards), larger section gaps and 36–40 px primary controls. Cases starts in comfortable density with an 80 px minimum row height; compact density remains available.
- Sidebar header and footer do not shrink; only navigation scrolls. The header stays sticky at the top.
- FortCases tabs, toolbar and grid share one crisp ring and aligned internal dividers. Neutral tabs show Needs attention, Assigned to me, Unassigned and All cases. Search and Verdict stay visible; More filters groups status, owner, priority, source and OSCAR closure. Additional filters become removable chips. View contains sorting, density, column visibility and export.
- Case quick preview is a nonmodal, anchored popover reused on Overview, Cases and workspace search. It contains the current assessment, a short summary, next action, owner and key asset. Complete evidence and investigation details remain on the case route.
- Surfaces use solid fills, 1 px borders/rings and neutral hover/focus states. The darker canvas is the OKLCH conversion of the requested background; the table/card token uses the supplied surface value exactly.

## Comparison

The exploration is on `design/emerald-precision`. Its unchanged starting point is commit `0ea126b45394676746fa010a7dde151b454266df` on `main`; `git diff main` shows the current exploration without modifying the baseline.

The researched FortCases hierarchy, work-view rules and alternatives are documented in [case-queue-design-brief.md](case-queue-design-brief.md).
