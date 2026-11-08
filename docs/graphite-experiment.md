# Graphite visual experiment

Historical note: the later [shared table surface contract](table-surfaces.md) supersedes this document's table surface, hover, floating, and border values in both themes. The experiment keeps its other gated foundation and geometry choices; it no longer defines a separate table palette. The original comparison captures remain historical.

Status: **unapproved visual experiment**, 2026-11-06. The default remains the current theme.

## Enable and restore

All experimental colors and geometry are in the marked block in `app/globals.css`. The existing `:root` and `.dark` foundation declarations remain intact. The existing next-themes provider still owns light/dark mode; no second theme provider, preference store, theme picker, or CSS file was added.

```sh
# Preview the experiment in dark mode.
FORTMIND_VISUAL_EXPERIMENT=graphite pnpm dev

# Restore the current palette and geometry.
FORTMIND_VISUAL_EXPERIMENT=current pnpm dev

# Build a production preview with the experiment enabled.
FORTMIND_VISUAL_EXPERIMENT=graphite pnpm build
pnpm start --port 3001
```

Restart the development server after changing the flag. The production HTML is prerendered, so rebuild without the graphite flag to restore the current production appearance. The flag sets `data-visual-experiment` on the root HTML element; only `.dark[data-visual-experiment="graphite"]` receives the overrides. Light mode retains its existing palette and geometry.

The explicitly requested workflow correction is shared by both versions: disabling the visual flag retains the corrected workflow icons and their dedicated ink roles.

## Audit

| Area | Current implementation / inconsistency | Experiment |
| --- | --- | --- |
| Workspace | Canvas and card surfaces are close in tone. The top bar correctly consumes `--shell`. | Darker canvas, distinct shell, surface, and elevated levels using existing roles. |
| Sidebar | Separate hover and selected roles already exist, with neutral selection. | Shell `#0C0C0E`, hover `#1E1E21`, selected `#26262B`, near-white selected text/icons, muted inactive text/icons. No mint fill or extra indicator. |
| Table container | A rounded-lg shell uses an inset ring instead of a physical boundary. | 4px corners and one physical 1px subtle border; inset ring removed. |
| Table rows | Local density utilities set 80px comfortable rows with 16px vertical padding. | 64px comfortable target with 10px padding; 52px compact target with 6px padding. Content can increase the minimum height. |
| Table header | A local `bg-muted` override shares the generic elevated role, with a 44px header. | Explicit elevated surface, 36px header, strong bottom separator, secondary ink. Existing columns and text alignment retained. |
| Row states | Hover and selected tokens are close in tone. | Hover `#1E1E21`; selected/previewed `#26262B`, retained during hover. No alternating fills. |
| Inspector | Latest implementation is an independent overlay at desktop widths and a full-screen sheet below 1024px. Header, footer, and body already consume elevated surfaces. | Same behavior and width; stronger 1px left boundary, square corners, 16px horizontal padding, compact section spacing and key/value rows. |
| Next action | Latest inspector uses a left-border section. | Neutral surface inset with a 1px strong boundary, compact heading, readable text, and no green panel treatment. |
| Controls | Outline buttons consume decorative `--border`; inputs share the same weak dark boundary. Rendered menu triggers replace `data-slot="button"`. | Dedicated brighter neutral `--input`; 2px corners and compact sizes. Button `data-variant`/`data-size` hooks survive Base UI trigger composition. |
| Popovers and floating UI | Popovers use rounded-lg plus a ring, select content retains shadow-sm, and the shared chart tooltip has shadow-xl and a background override. | Existing popover role, physical strong 1px boundaries, 4px corners, no shadows. Chart tooltip receives a stable data hook. |
| Separators | Decorative and interactive boundaries share one role. | Subtle `#2D2D31` separators, strong `#45454C` structural boundaries, separate accessible control ink. |
| Typography | Inter is already configured; technical IDs already use Geist Mono. | Inter retained. Case titles use the 13px label scale, supporting metadata stays 12px, and timestamps use mono. Ordinary headings, source labels, descriptions, and names stay sans-serif. |
| Semantic discrepancy | Source used LoaderCircle/CheckCircle2 and tone-based workflow icon colors. | Per user clarification, align the four specified workflow states. Preserve the existing verdict squares, priority bars, Escalated, Queued, and Closed by OSCAR. |

## Central palette

HEX values below are authored as their exact OKLCH equivalents in the existing stylesheet.

| Role | Current | Graphite |
| --- | --- | --- |
| Canvas | `#0B0B0C` | `#080809` |
| Navigation shell | `#111112` | `#0C0C0E` |
| Surface | `#171718` | `#131315` |
| Elevated | `#202022` | `#1D1D20` |
| Hover | `#1D1D1F` (sidebar `#1C1C1F`) | `#1E1E21` |
| Selected | `#262628` (sidebar `#242426`) | `#26262B` |
| Subtle border | `#333336` | `#2D2D31` |
| Strong border | Shared border | `#45454C` |
| Foreground | `#F5F5F5` | `#F5F5F5` |
| Secondary | `#C2C3C6` | `#C2C3C6` |
| Muted | `#9FA0A6` | `#A3A6B2` |
| Brand | `#00D492` | `#00D492` |
| Interactive boundary | Shared border | Neutral `#797979` |

The additional interactive boundary is deliberate: `#45454C` against `#131315` is only 1.95:1. The achromatic `--input` role provides 4.26:1 against the table surface, 3.86:1 against elevated surfaces, 3.82:1 on hover, and 3.46:1 against selection. Decorative boundaries do not carry the focus affordance.

Primary foreground against selection is 13.81:1; secondary foreground against elevation is 9.54:1; muted foreground against the surface is 7.65:1. Full-strength mint focus outlines are 7.77:1 against selection. Disabled controls retain their intentionally reduced emphasis.

## Exact scope

- `app/layout.tsx`: environment flag to HTML attribute; routing and the theme provider are unchanged.
- `app/globals.css`: one opt-in override block for palette, geometry, density, inspector presentation, and keyboard outlines. Additive border/workflow roles support the existing system.
- `components/ui/button.tsx`: variant and size data hooks; existing behavior and public variants remain intact.
- `components/ui/chart.tsx`: tooltip data hook; chart series colors remain intact.
- `lib/semantic-states.ts` and `components/fortmind/semantic.tsx`: user-approved workflow alignment. Needs You uses UserRoundPen and `#FFC272`; Running uses CircleDashed and `#A3A6B2`; Closed uses CircleCheck and `#A3A6B2`; Failed retains CircleX and uses `#FF757B`. Tone meaning, additional real states, verdicts, and priorities remain intact.
- Existing semantic contract tests: update three workflow icon expectations.
- Contextual-preview integration: forward the trigger ref through a typed callback; allow ordinary copyable source/name values to use Inter while retaining copy behavior and technical monospace defaults.

No case data, content architecture, table columns, route definitions, filtering, sorting, selection logic, inspector navigation, or persistence behavior was changed by this experiment. Existing concurrent contextual-preview/inspector work was retained.

## Comparison and validation

The comparison artifact contains eight matched pairs: 1440×900 and 1280×800, each with expanded/collapsed navigation and inspector open/closed. Both sides use the latest inspector/contextual-preview source and the requested workflow correction; only the visual flag differs. The initial raw captures are retained separately under the `initial-` prefix.

Additional checks cover 1024×768 desktop overlay behavior, 900×800 and 390×844 full-screen inspector behavior, expanded/collapsed keyboard focus, neutral row selection during hover, compact density, verdict filtering, search, next-case boundaries, Escape focus return, full metadata and hashes, pinned contextual previews, and light-mode isolation. Opening the inspector leaves table geometry unchanged.

Validation artifacts are saved beside the screenshot comparison: `contrast.json`, `responsive.json`, and current/graphite computed-style measurements. Lint, explicit typecheck, unit tests, and the graphite production build are required before handoff. Visual approval remains pending.

Completed validation: `pnpm typecheck`, `pnpm lint`, all **61** unit tests through `pnpm test`, and `FORTMIND_VISUAL_EXPERIMENT=graphite pnpm build` passed. The standalone comparison was visually verified, including its viewport/sidebar/inspector selectors and Current/Graphite/Compare modes.
