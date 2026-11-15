# FortMind UI foundation

This exploration keeps the existing routes, data, component hierarchy and workflows. Shared colors, geometry and typography live in `app/globals.css`.

## Typography

Geist Sans is the interface font (November 11 visual alignment). Technical identifiers retain Geist Mono. Sizes stay stable at laptop and mobile widths; headings and actions wrap instead of shrinking the body copy.

| Role | Utility | Size / line height | Weight |
| --- | --- | --- | --- |
| Page title, H1 | `text-page-title` | 24 / 32 px | 600 |
| Section title, H2 | `text-section-title` | 20 / 28 px | 600 |
| Panel title, H3 | `text-panel-title` | 16 / 24 px | 600 |
| Body / data rows | `text-body` | 14 / 20 px | 400–500 |
| Reading paragraphs | `text-prose` | 14 / 24 px | 400 |
| Controls and labels | `text-label` | 13 / 20 px | 400–500 |
| Metadata and captions | `text-caption` | 12 / 16 px | 400 |
| Metric | `text-metric` | 32 / 40 px | 600 |

The UI starts at 13 px. Each hierarchy step multiplies the preceding size by 1.25 and rounds to the nearest 4 px, with half-steps rounded upward: **13 → 16 → 20 → 24 → 32**. The 12 px caption and 14 px reading/data sizes are deliberate supporting roles. Every line height follows a 4 px rhythm. Font weights use 400, 500 and 600 for ordinary content, emphasis and headings.

12 px is the minimum rendered dashboard text, including avatar initials and chart labels. Standard shadcn/Tailwind size aliases resolve to these tokens. Inputs retain a 16 px mobile value to avoid mobile-browser zoom; desktop inputs use the body role.

Geist Sans and Geist Mono share the same size and line-height roles. Inline code inherits the surrounding text size and aligns on the baseline. Mixed metadata uses baseline-aligned flex rows; leading icons are centered independently so their SVG boxes cannot shift text. Copy controls align to their technical value, and numbered investigation items no longer rely on pixel padding offsets. Chart tooltip labels and monospace values share one baseline row. Intentional stacked field labels remain stacked.

`lib/utils.ts` registers these font-size utilities with the existing class merger. Components use that shared helper so a typography override cannot remove semantic text colors.

## Neutral surfaces and restrained branding

The interface uses a neutral, high-contrast focus ring in dark mode (`--ring`), distinct from the OSCAR/brand accent. This improves keyboard discoverability without turning every focus treatment green.

The foundation uses the requested sRGB palette, converted to OKLCH in `app/globals.css`. Brand green is `#30D398` (`oklch(0.7720123 0.1554456 163.0539)`) in **both** dark and light themes, including brand-mark rendering. Brand green is not suitable as small foreground text on white (approximately 1.93:1 contrast); use high-contrast neutral text there. Filled green controls use the existing dark `--brand-foreground` ink. The workspace-inspector refinement adopts **#30D398** for brand actions, superseding the earlier #01CC88 override. Neutral surfaces and the independent semantic palette are retained.

| Role / token mapping | Light | Dark (sRGB reference) |
| --- | --- | --- |
| Workspace / `background` | Existing clean-white canvas | #0B0B0C |
| Navigation / `shell`, `sidebar` | Existing neutral-gray navigation | #111112 |
| Content / `surface`, `card` | White | #171718 |
| Elevated / `surface-elevated`, `popover` | White | #202022 |
| Border / `border`, `input` | Existing light-theme roles | #333336 |
| Primary text / `foreground`, `card-foreground`, `popover-foreground` | Existing dark text | #F5F5F5 |
| Secondary text / `secondary-foreground`, `sidebar-foreground` | Existing dark/muted text | #C2C3C6 |
| Muted text / `muted-foreground` | Existing muted text | #9FA0A6 |
| Brand / `brand`, dark `primary` | Brand buttons use #30D398 | #30D398 |
| Text on brand / `brand-foreground`, dark `primary-foreground` | #09251B | #09251B |
| Secondary / `secondary`, `muted` | Existing neutral surfaces | Elevated surface |
| Neutral hover / `surface-hover` | Existing subtle hover | #1D1D1F |
| Neutral selection / `accent`, `sidebar-accent` | Existing neutral selections | #262628 / elevated surface |

The canvas sits behind headings and spacing. Tables, chart panels, metrics, information sections and integration cards consume `card`, which aliases `surface`. The Cases inspector consumes `surface-elevated`; menus, popovers, dialogs and shared sheets consume `popover`, which aliases that same elevated role. Navigation sheets retain their explicit sidebar surface. Shared overlays use borders/rings without prominent shadows.

Dark-mode `primary` is brand mint. Existing `brand` button variants share the same brand source for compatibility. Ordinary hover and selection states consume neutral `accent` and `surface-hover`, not `primary`. Light-mode canvas, text, borders, neutral primary/link ink and focus behavior are retained for legibility; explicit brand buttons and marks use the same new mint in both modes. All color literals and theme mappings remain in the one global stylesheet; no additional CSS files or dependencies are introduced.

Security semantics retain their separate red, amber, blue, green, purple and gray roles. Priority and workflow indicators use the existing Lucide vocabulary; verdicts use colored squares and neutral labels. Queue tabs use neutral text and counts without icons. Priority and verdict remain separate concepts, with independent labels and visual treatments.

## Semantic indicators: 6 November refinement

Verdict marker update: OSCAR verdicts now use an 8 px square with 2 px corners and plain foreground labels. Dark marker colors are Malicious #FF757B, Suspicious #FFC272, Benign #54D6AC and Inconclusive #B5BED0; light mode uses the existing contrast-tuned semantic ink. Values live in `globals.css` under `--verdict-*`. `VerdictMarker` and the existing `VerdictBadge` API share this presentation across table cells, previews, filters, case details and legends. Verdicts have no glyph, badge fill, outline or hover treatment; supplied verdict confidence remains separate muted text. Workflow and priority presentations are retained.

Danger, Warning, Success and Info expose `--{role}-primary`, `--{role}-accent` and `--{role}-muted`. Unresolved exposes the same three roles as aliases of neutral gray. These reuse the existing palette values; `foreground` tokens remain the contrast-tuned ink for small text/icons. Closed and successful completion use Success across queue and case details; this never changes the verdict or autonomous attribution. Brand and neutral surfaces are unchanged.

Static semantic badges use the existing shadcn outline Badge: transparent background, a quiet role-colored 1 px border, 12 px medium text, 4 px corners, and 14 px icons at 1.75 stroke. Regular badges are 24 px high; compact queue badges have a 22 px minimum. Static indicators have no hover fill, color shift, transition, or tooltip. Accessible descriptions retain the meaning of each state. Actual controls retain their hover and keyboard-focus feedback.

The Cases workspace uses plain verdict labels with a small colored square. Priority and workflow status use small icons and colored text without colored borders or fills. Overview and global search use the same verdict marker treatment. Icons are 14 px at 1.75 stroke; filters consume the same registry. Static semantic indicators have no hover changes.

| Field | Presentation | Meaning preserved |
| --- | --- | --- |
| Malicious | Small red square and neutral text | Adverse assessment supported by evidence |
| Suspicious | Small amber square and neutral text | Further assessment is needed |
| Benign | Small green square and neutral text | Evidence supports legitimate or expected activity |
| Inconclusive | Small gray square and neutral text | An assessment is not established |
| Priority | Urgent: red `AlertTriangle`; Notable: amber `Bell`; Informational: blue `Info` | Urgency stays separate from verdict |
| Status | Needs You: amber `Hand`; Running: blue `LoaderCircle`; Closed: green `CheckCircle2`; Failed: red `CircleX` | Processing, closure and escalation stay separate from assessment |
| OSCAR | Small scan-line icon and restrained emerald | Automated provenance, independent of verdict |
| Primary hypothesis | Target icon | The working hypothesis, without an automated-provenance sparkle |

The palette keeps red, amber, green, blue, violet and neutral roles, with lower-chroma foregrounds and borders in both themes. Inline priority/status indicators are transparent; verdict labels stay neutral while callouts retain existing muted fills. Semantic palette values are unchanged by the Phase 1 foundation update above. Escalated uses the violet role across the shared registry, including charts and queue indicators.

Overview metrics use plain labels instead of redundant status icons. Context navigation uses a book icon for Rules/Facts. Integration connection badges are text-only. Existing navigation and action glyphs stay within the installed Lucide family; no new icon library or font is introduced. Table headers retain alignment with value text after the smaller glyphs.

### Research and design judgment

[Linear's 2026 interface refresh](https://linear.app/now/behind-the-latest-design-refresh) describes reducing icon frequency and size, removing unnecessary colored icon backgrounds, and making supporting navigation less prominent. We apply those principles to FortMind's existing components; the verdict squares follow the supplied product reference, not a claim that Linear uses this exact vocabulary.

[Linear's issue-property guidance](https://linear.app/docs/issue-property) distinguishes workflow status, urgency and categorization. [Microsoft Defender's incident-case guidance](https://learn.microsoft.com/en-us/defender-xdr/prioritize-incident-cases) similarly exposes priority, investigation state, ownership and classification as separate attributes. That supports keeping those concepts independent rather than making every indicator a colored security shield.

The [shadcn Badge outline treatment](https://ui.shadcn.com/docs/components/base/badge) provides the component foundation. Labels remain explicit, and shapes remain distinct even without color. The intended scanning sequence is case identity, assessment, urgency, processing state, then responsibility. This is a design judgment for the current product; it has not been validated through a production SOC usability study.

### Verification

TypeScript, lint and the existing unit checks cover the changed registry and presentation. Browser checks verify semantic contrast on actual surfaces in both themes, unchanged static badge styles under hover, four distinct verdict marker colors, matching queue/detail workflow icons, responsive case rows and the anchored preview. Full-case data and verdict/investigation confidence remain unchanged.

## Geometry and shell

- Badges: 4 px. Controls: 6 px. Cards and sheets: 8 px. The application workspace sits flush against the sidebar.
- The existing shadcn `sidebar` variant uses a 1 px vertical divider, with the sidebar header and workspace toolbar sharing a 48 px baseline. Mobile uses the existing drawer.
- The utility toolbar contains case search and notifications without an organization/page breadcrumb. It stays sticky on every workspace page. Search aligns with the page gutter; all toolbar controls are 32 px high.
- Sidebar brand, navigation labels and account details share one text alignment. Navigation uses regular 13 px Inter, 40 px rows, 16 px icons and neutral selected surfaces with a subtle inset ring. Workspace and management groups have one quiet separator. Settings uses the same navigation treatment and sticky toolbar.
- Main-page widths and gutters are owned by the shared `PageContainer` in the workspace/settings shells: standard content stops at 1620 px; Settings forms use 914 px. Horizontal gutters are 16 px on mobile, 24 px from 768 px, and 32 px from 1536 px. Content centers inside the workspace beside the sidebar, including when it collapses. App chrome remains full-width in its own region. See [content-width layout](content-width-layout.md).
- Cards use 24 px padding (20 px for compact cards), larger section gaps and 36–40 px primary controls. Cases starts in comfortable density with an 80 px minimum row height; compact density remains available.
- Sidebar header and footer do not shrink; only navigation scrolls. The header stays sticky at the top.
- FortCases tabs, toolbar and grid share one crisp ring and aligned internal dividers. Neutral tabs show Needs attention, Assigned to me, Unassigned and All cases. Search and Verdict stay visible; More filters groups status, owner, priority, source and OSCAR closure. Additional filters become removable chips. Display contains sorting, density, column visibility and export.
- Cases uses a viewport-height overlay inspector below the utility bar. Overview and workspace search retain their existing anchored quick-preview popovers. Complete evidence and investigation details remain on the case route.
- Surfaces use solid fills, 1 px borders/rings and neutral hover/focus states. The canvas, navigation, card and elevated tokens use the exact Phase 1 neutral values above, represented in OKLCH.

## Cases investigation workspace

Selecting a case opens a non-modal, 440 px right-side inspector outside the table layout. It starts below the 48 px global toolbar and extends to the viewport bottom, using the shell's shared `--workspace-header-height`. The inspector temporarily covers the table's right side; covered information is not visible until it closes. Sidebar and global navigation remain unaffected on desktop. Below 1024 px, inspection uses a full-screen accessible Sheet. Desktop has no docked mode, resizing, backdrop, focus trap or scroll lock.

Opening and closing preserve the table's original width, column geometry, row height, title truncation, pagination and scroll position. Only the inspector body scrolls within the inspector; its header and footer remain pinned. It uses `surface-elevated`, distinct from the table's `surface`, a 1 px border and 4 px corners. Its CTA uses the shared brand button.

Existing responsive columns and user column preferences are retained. Their visibility depends only on the table width, never on inspector state. The inspector displays the complete title, shared verdict squares, ascending priority bars and workflow icons with neutral labels.

Clicking another uncovered row or title updates the inspector. Previous/next controls follow the entire filtered, sorted result set, including across page boundaries, without changing the table's current page. Controls disable at result boundaries or if the inspected case is outside current results. A result position appears beside the navigation. Checkboxes and row actions remain independent; modified title clicks retain their case URLs. Keyboard activation focuses the named aside. Escape or Close returns focus to the opener, or to table search if that opener was removed. Open menus and dialogs handle Escape before the inspector.

Filtering, sorting and pagination retain the inspected case. If it falls outside the filtered results, the inspector says so. Changing work-view tabs closes it. Content retains the case ID/copy action and groups classifications consistently. The OSCAR summary is displayed verbatim in three lines with expansion only when needed; no conclusions are generated or paraphrased. Next action precedes a compact, copyable context list with additional values available on demand. Missing recommendations use existing workflow guidance, while closed cases state that no analyst decision is pending. Open investigation links to the existing detail route; no data or backend actions are added.

Table discovery uses 500 ms tooltip/hover delays. Only actually truncated titles get a full-title tooltip. Metadata offers a structured HoverCard and a persistent, copyable Popover on click, Enter or tap. Verdict, priority and workflow hints reuse documented meanings; scores are not presented as probabilities. Icon-only actions retain accessible names. Context values omit empty and placeholder fields; counts describe supplied context values, not inferred related entities. No hover triggers a query or route prefetch.

Queue data currently provides relative ages without absolute timestamps, finding counts or backend score definitions. The UI does not invent those fields. The timestamp formatter supports an explicitly supplied, zoned instant, localizes date/time/time zone, and is tested across daylight-saving changes. Existing age cells therefore show a relative-age hint only. The global theme and data fixtures are unchanged by this discovery refinement.

`scripts/case-inspector-browser-check.mjs` checks expanded-sidebars at 1280, 1440 and 1920 px in both themes, unchanged table geometry/scrolling, pinned inspector chrome, result navigation, filtering/sorting, page retention, keyboard focus and the collapsed sidebar. It uses external Playwright tooling without adding an application dependency.

`scripts/case-discovery-browser-check.mjs` adds contextual-preview, copy, keyboard, dense-row and touch checks, with screenshots at 1280 and 1440 px and a 390 px full-screen inspection check. Synthetic long-title and absent-field inputs stay confined to the test browser's local session.

## Comparison

The exploration is on `design/emerald-precision`. Its unchanged starting point is commit `0ea126b45394676746fa010a7dde151b454266df` on `main`; `git diff main` shows the current exploration without modifying the baseline.

The researched FortCases hierarchy, work-view rules and alternatives are documented in [case-queue-design-brief.md](case-queue-design-brief.md).
