# Shared table surfaces

The FortCases surface contract is shared by light mode, dark mode, and the existing graphite experiment. Values live only in `app/globals.css`; components consume the same semantic utilities in either theme.

| Role | Token / utility | Light | Dark |
| --- | --- | --- | --- |
| Default | `--surface` / `bg-surface` | `#FFFFFF` | `#151518` |
| Interactive | `--surface-hover` / `bg-surface-hover` | `#F4F4F5` | `#202024` |
| Floating | `--surface-floating` / `bg-surface-floating` | `#FAFAFA` | `#25252A` |
| Subtle boundary | `--border` / `border-border`, `ring-border` | `#E4E4E7` | `#303036` |

HEX values are expressed as exact OKLCH equivalents to retain the existing color architecture. `:root` owns light values; `.dark` overrides the same roles. The existing `--card` alias points to `--surface`. Existing `--popover` and `--surface-elevated` names alias `--surface-floating`; they no longer define a fourth surface color.

## Table application

- Shell, tabs region, filter toolbar, column header and header row, default rows, selection toolbar, footer, search field, and outline filter buttons use the default surface.
- Hovered rows, checkbox-selected rows, rows with active investigation previews, and expanded/focused filter controls use the interactive surface. Checkboxes, preview state, and keyboard focus continue to communicate the distinct interaction states.
- Tooltip, hover-card, popover, dropdown, select-popup, and investigation-inspector surfaces use the floating role, including inspector header and footer. A subtle border/ring plus `shadow-sm` separates floating content from the flat table.
- The header's local `bg-muted` and shared `bg-muted/50` defaults were removed. Selected/previewed rows no longer use `bg-accent`. Active filter chips use the existing outline-button variant rather than introducing a secondary gray fill.
- Redundant contextual-tooltip background and ring overrides were removed so the shared Tooltip owns its surface and elevation.
- The graphite experiment no longer overrides the four shared token values or table-header/selected-row backgrounds. Its existing geometry remains gated by the same environment flag.

Typography, control sizes, row padding, column widths, filtering, sorting, pagination, selection logic, contextual discovery, inspector navigation, and overlay behavior are unchanged by this refactor. Semantic icon mappings, verdict colors, priority colors, workflow colors, and data remain intact. Existing concurrent edits are preserved.

## Accessibility

Input and outline-button focus rings now use the full shared `--ring` value. Dropdown and select items receive an inset 2px keyboard ring in addition to the interactive background. Existing contextual-trigger and inspector focus rings remain visible. Disabled controls retain their existing opacity and interaction restrictions.

The subtle `--border` role is decorative. The existing `--input` role remains available for stronger control boundaries, and focus continues to use its dedicated contrast-tuned role. No new component-specific color tokens were introduced.

## Shared impact

No unrelated page component was edited. These shared changes naturally apply wherever the affected primitives and tokens are already reused:

- Shared Table headers, footers, and row states.
- Inputs and outline/ghost buttons, including the workspace search control.
- Tooltips, popovers, hover cards, dropdown menus, select popups, and shared chart tooltips.
- Cards consuming `--card`, floating panels consuming `--popover` or the legacy elevated alias, and separators consuming `--border`.

The existing graphite experiment's other canvas, navigation, and geometry choices remain separate from this finalized surface contract. Its earlier screenshot comparison is historical; it is not a representation of these updated roles.

## Verification

- `pnpm typecheck`, `pnpm lint`, all 61 unit tests, and the production build pass.
- Rendered styles were checked in both themes: nine default table regions, four interactive states, and seven floating regions match the requested colors exactly.
- Search, menu-item, and inspector keyboard focus rings were inspected; Escape restores the opener, and disabled emphasis remains intact.
- Desktop overlays at 1280×800 and full-screen inspectors at 390×844 retain their existing behavior. No page overflow was observed, and the primary action remains visible.
- Screenshot and computed-style artifacts are saved in the chat's `shared-table-surfaces` output folder.
- Production builds and rendered palette checks also passed with the existing graphite flag enabled. Its table, preview-row, contextual-popover, and inspector surfaces resolve to the same shared roles. The standard build is restored for handoff.
