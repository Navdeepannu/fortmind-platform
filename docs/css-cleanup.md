# Styling architecture after the Tailwind migration

`app/globals.css` is the only application stylesheet. It holds Tailwind and shadcn imports, the dark variant, `@theme inline` mappings, the shadcn Neutral light and dark canvas, the FortMind brand primary, semantic palettes, font and radius definitions, and a small base layer. It is about 345 lines after the route and token consolidation. There are no page selectors in it.

## Audit and migration

- Overview, Cases, case details, OSCAR Context, Reports, Integrations, and Settings were inspected at their rendered routes. Desktop, tablet, mobile, light, and dark baselines were captured before migration.
- The old `.fm-*`, `.ov-*`, `.cases-*`, `.case-*`, and `.in-*` layout, spacing, typography, surface, responsive, and state rules moved into component Tailwind classes. Cases no longer overrides the global background, card, sidebar, or related surface tokens.
- Runtime tone choices use `lib/semantic-styles.ts`, whose complete class strings are discoverable by Tailwind. Semantic state definitions retain the product meanings for priorities, verdicts, lifecycle, escalation, OSCAR, and evidence.
- The existing shadcn Base UI components remain the primitives: Sidebar, Card, Table, Tabs, Badge, Button, Input, Native Select, Dropdown Menu, Sheet, Dialog, Alert, Separator, Tooltip, Scroll Area, and Chart. No external registry component or new dependency was added.
- `data-ui` attributes give browser checks stable element targets without adding presentation selectors. Old browser checks were migrated from deleted class selectors.

## Token contract

- The shadcn Neutral foundation supplies canvas, foreground, card, popover, secondary surfaces, borders, ring, sidebar, charts, and radius in both modes. `--primary` keeps the FortMind brand blue, `oklch(0.5488 0.1378 266.04)`.
- Danger, warning, success, info, neutral and escalation retain their semantic light and dark palettes. OSCAR aliases the FortMind primary so automated provenance carries the actual brand color. Escalation keeps its separate violet cue.
- `--semantic-*` product-role aliases resolve to those canonical palettes. They do not define a second theme. Complex page-specific surface aliases were removed.

## Retained CSS

The base layer sets document font and surface defaults, tap highlight and pointer affordances, a shared keyboard focus outline, and reduced motion across regular and portaled UI. The `!important` declarations exist only inside the user preference reduced-motion media query so component transitions cannot override it. All page presentation and component sizing live in Tailwind classes.

## Validation

`pnpm typecheck`, `pnpm lint`, `pnpm test`, and the default Turbopack `pnpm build` pass. The test suite has 52 passing tests. Production browser checks cover 85 established-route visits, all nine new sections in light and dark, semantic contrast and drawer dismissal, queue states, case navigation, sidebar collapse, mobile navigation, local persistence and CSV export. The Cases desktop row remains 62px and the mobile row 135.5px. Semantic samples meet at least 4.5:1 text contrast and 3:1 icon contrast.
