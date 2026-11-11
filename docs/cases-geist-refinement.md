# Cases — Geist alignment and inset-shell QA

Reference: user-supplied screenshots from November 11, 2026 (production Cases, local dark/light Cases and case preview). Authenticated production interaction and pixel-level layout were **not** independently inspected.

## Implementation

- **Shell:** existing shadcn/Base UI `Sidebar variant="inset"` with a rounded, bordered sidebar container and complementary `SidebarInset`; collapsible state and mobile sheet retained.
- **Breadcrumbs:** contextual case ID and copy affordance appear in the global top navigation. Mobile keeps a Cases → Case breadcrumb; the redundant breadcrumb inside the Case Detail page has been removed.
- **Typography:** shared `--text-body` and `--text-label` use 14px; UI body stays 400, important case names/verdicts use 500. Metadata/captions remain 12px, headings use 16/20/24px roles.
- **Cases toolbar:** lifecycle tabs are separated from the table border; the search and primary filters form one horizontal row at wide viewports and wrap responsively. Owner/Priority/Source/Verdict use the established accessible Base UI radio-menu primitive, replacing native `select` elements. The More filters menu retains only the advanced Status filter (plus clear), removing duplicate primary filters and duplicate autonomous toggle. Display owns density, columns, sort and export.
- **Cases table:** first data column remains Priority after the selection checkbox. Queue priorities use directional chevrons; verdict markers are 8px with subtle 2px corners, not pill badges. Header/cell content offsets stay aligned. A minimum-width table scrolls **inside** its bounded region instead of silently hiding Source, Verdict, Owner or Age.
- **Preview:** the Cases overlay renders the same recorded OSCAR lifecycle component as Home, shows a bounded metadata section and restores a restrained outline Open case CTA. Dark floating and hover roles now track near-black surfaces, not elevated blue-gray panels. The lifecycle does not invent step completion or timestamps.

## Static contrast check (WCAG relative luminance)

Values were computed from current OKLCH token definitions converted to sRGB, clipped to gamut for the luminance calculation. Ratios are approximate, not a substitute for browser pixel sampling and state QA.

| Combination | Contrast | Requirement |
| --- | ---: | --- |
| Light body text / canvas | 17.01:1 | ≥4.5:1 normal text |
| Light muted text / canvas | 5.45:1 | ≥4.5:1 normal text |
| Dark body text / canvas | 17.38:1 | ≥4.5:1 normal text |
| Dark muted text / canvas | 7.87:1 | ≥4.5:1 normal text |
| Light text / hover surface | 16.09:1 | ≥4.5:1 |
| Dark text / hover surface | 15.91:1 | ≥4.5:1 |
| Light OSCAR brand ink / canvas | 7.08:1 | ≥4.5:1 |
| Dark mint brand ink / canvas | 10.03:1 | ≥4.5:1 |
| Mint button foreground / mint fill | 8.38:1 | ≥4.5:1 |
| Light verdict markers / canvas | 6.06–6.83:1 | ≥3:1 non-text indicators |
| Dark verdict markers / canvas | 7.48–12.23:1 | ≥3:1 non-text indicators |

## Still required before merge

1. GitHub Actions: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.
2. Real browser checks at 390, 768, 1280, 1440 and 1920px in both themes, with sidebar expanded/collapsed and a case preview open.
3. Verify keyboard filtering, menu focus return, table horizontal scrolling, tab state, controls and table header/row alignment.
4. Confirm the Vercel deployment is no longer rate-limited. A successful local/CI build does not prove Vercel deployment.
5. Merge stacked foundations first (PRs #17 and #19) to avoid reintroducing stale Case Detail/OSCAR changes.
