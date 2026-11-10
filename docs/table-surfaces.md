# FortMind — neutral-first workspace system

The workspace follows a deliberately small, coherent surface system inspired by Vercel Geist's roles and interaction guidelines, Linear's calm navigation and density, and Supabase's separation of brand green from neutral UI chrome. This is a FortMind implementation, **not a copy of another company's palette**.

Source references:
- https://vercel.com/geist/colors — two backgrounds, default/hover/active component roles, and border hierarchy
- https://vercel.com/geist/materials — lowest useful elevation; elevated menus and tooltips are separate from resting cards
- https://vercel.com/design/guidelines — visible focus, interaction contrast, responsive controls
- https://linear.app/now/behind-the-latest-design-refresh — quieter sidebar, less redundant iconography and borders
- https://supabase.com/design-system/docs/color-usage — keep bright green accents separate from default neutral chrome

## Core roles (dark / light)

| Role | Token | Dark | Light | Primary use |
| --- | --- | --- | --- | --- |
| Canvas and workspace chrome | `--background`, `--shell: var(--background)` | `#0C0D0F` | `#FAFAFA` | Main area, sidebar, topbar |
| Border-led cards | `--card: var(--background)` | canvas color | canvas color | Dashboard cards/panels with an outline instead of another filled layer |
| Selectively filled surface | `--surface` | `#111315` | `#FFFFFF` | Cases table, dense data sections |
| Subtle alternate case row | `--table-stripe` | `#141619` | approximately `#F8F8F9` | Even rows in FortCases only |
| Inputs and filters | `--control` | `#181A1E` | `#F7F7F8` | Text inputs, selects, secondary controls |
| Hover or selected | `--surface-hover` | `#1B1E22` | `#F0F1F2` | Hovered/selected rows and controls |
| Floating material | `--surface-floating` | `#202328` | `#FFFFFF` | Popovers, dropdowns, tooltips |
| Floating hover | `--floating-hover` | `#2A2D32` | `#F0F1F2` | Items inside floating menus |
| Default border | `--border` | `#2A2D32` | `#E5E6E8` | Cards, separators, table lines |
| Interactive / elevated border | `--border-strong` | `#3A3D43` | `#D1D3D6` | Outline buttons and floating menus |
| Primary text | `--foreground` | `#F2F2F3` | `#17181B` | Reading and hierarchy |
| Supporting text | `--muted-foreground` | `#A2A5AA` | `#62676F` | Descriptions and metadata |

Hex references are for design review; actual source values remain precision-safe OKLCH literals or `var()` aliases in `app/globals.css`. CSS comments may include hex equivalents but components must not hardcode values.

### Role behavior

- One shared canvas: `--shell`, `--sidebar`, and `--background` intentionally resolve to the **same fill**. Thin borders and spacing distinguish navigation from content.
- **Border first:** `bg-card border border-border` is the default for overview and most content panels. Use `bg-surface` only when a table or information-dense surface benefits from a subtle fill.
- **Do not stack shades for decoration:** toolbar tabs, filters, table headings and rows share `bg-surface` with structural dividers. Filter inputs and secondary buttons have `bg-control`. Outline buttons use a transparent background and a stronger border.
- **Rows:** Only `[data-ui="case-table"] tbody tr:nth-child(even)` receives a very subtle alternating fill; hover, selected and previewed rows supersede it. Do not add striping to unrelated tables or severity cards.
- **Overlays:** dropdowns, tooltips, hover cards, popovers and inspectors use a distinct floating surface. Item hover/keyboard focus uses `--floating-hover`, with border and focus indicators preserved.
- **Color and meaning:** Green remains the FortMind / OSCAR brand and agent accent, not a generic highlight on every navigation item. Security verdicts, priority, workflow, failures and escalation keep their independent `--semantic-*`, `--verdict-*` and `--priority-*` mappings. "Closed" must never imply "Benign".
- **Density:** Overview metrics are tighter, but not hidden; primary values remain visible. Case filters, sorting, previews, responsive tables, and keyboard actions retain their behavior.

### Accessibility and responsive validation

- Preserve `focus-visible` outlines and the shared `--ring`; neutral colors alone do not indicate keyboard focus.
- Compare text, secondary text, disabled controls, filters and badges in light/dark themes; test WCAG contrast for text and meaningful control boundaries.
- At 390px and 1440px, inspect page width/overflow, card labels, table actions, mobile navigation, and dropdown positioning.
- At a real deployed URL, inspect computed `--background`, `--shell`, `--surface`, `--card`, `--table-stripe`, and `--surface-floating` on **both mobile and desktop**. Confirm they are on the same deployment.
- Optional `FORTMIND_VISUAL_EXPERIMENT=graphite` remains a geometry experiment only; it cannot fork colors.

## Verification

Run `pnpm test:colors`, `pnpm test:preview`, `pnpm typecheck`, `pnpm lint`, and `pnpm build`. Review the resulting Vercel preview for Overview, Cases, Details, both themes, hover/selection, keyboard focus and small screens.

The PR intentionally avoids changing platform information architecture, case logic, semantic decisions or API contracts. A source-level review does not substitute for production build and browser checks.
