# Case-detail layout lab

**Route:** `/platform/cases/layout-lab`  
**Scope:** isolated preview. The existing case details remain the baseline, accessible from the lab and via a quiet "Compare layouts" link on the screenshot-derived case.

## Reference research

- [Sanity Studio field groups](https://www.sanity.io/docs/studio/field-groups) uses groups to control complexity without requiring a user to read every field at once.
- [Sanity expandable fieldsets and UI state](https://www.sanity.io/docs/studio/focus-and-ui-state-in-custom-inputs) supports independently opening and closing data regions.
- [Sanity Structure tool](https://www.sanity.io/docs/studio/structure-introduction) combines document navigation with collapsible panes.
- [Sentry issue details](https://sentry.io/changelog/new-issue-details-ui-now-available/) uses progressive disclosure and grouped issue-specific actions.
- [shadcn Sidebar](https://ui.shadcn.com/docs/components/base/sidebar) is the design-system-compatible foundation for contextual navigation; the lab reuses the already installed `Sheet` instead of nesting another global SidebarProvider.

These are references to interaction patterns, **not copies of source code or screenshots**. The actual investigation views are imported directly from `CaseOverview`.

## Three experiments

| Variant | Navigation | Strength | Cost |
| --- | --- | --- | --- |
| **Expandable** | Five labeled groups, eleven independent disclosure blocks | Analysts may keep multiple observations open and compare content side by side in the same document | A very long expanded document requires scrolling |
| **Focus** | One active view with a modal, searchable-by-eye grouped section directory and previous/next actions | No double sidebar and no reading through unrelated sections | Directory is temporarily hidden until user opens the Sections button |
| **Docked** | Eleven direct destinations in a contextual directory next to one full-width active section | Every view discoverable and accessible in one click | Costs 216px of workspace width on extra-wide screens |

The Docked treatment **automatically becomes the Focus/drawer treatment** below the XL breakpoint; it never forces two permanent sidebars into a mobile or narrow laptop layout.

## Real data and implementation details

- Uses the **same eleven source-backed React views** as the production case detail page, through `buildCaseOverviewViews(data)`.
- All totals and text originate in `caseOverview`: five findings, two hypotheses, four entities, five lookup results, two related cases, four response proposals and twelve transcribed activity events.
- The lab does not create, modify, persist, approve, contain or execute anything. Existing local preview review controls remain local.
- Each mode renders one instance of the source sections, so there are no duplicate element IDs across simultaneously mounted variants.
- Each disclosure has independent open state, preserved while switching design variants. Expand all and Collapse all operate on all eleven items.
- Focus and Docked share a single selected-view state, with grouped navigation and previous/next actions. A Base UI Sheet provides accessible modal behavior and focus management for the directory.
- Hash references to an existing section or source record open/activate its owner section; the original canonical case deep links are untouched.
- The lab route is no-indexed; the top breadcrumb says **Cases / Layout lab**.

## Suggested evaluation

1. Navigate to **Related cases** starting from Findings. Count interactions and note whether the path is discoverable.
2. Compare the alert report and missing-corroboration source result without losing orientation.
3. Open several sections at once in Expandable mode. Determine whether comparison is worth the extra vertical navigation.
4. Test pinned navigation at 1440px with the main FortMind sidebar expanded; note the effective reading width. Repeat at 900px (the pinned sidebar should be absent).
5. Review keyboard navigation, visible focus, non-decorative counts, readable long titles, and actions that could be mistaken for real approvals.

## QA gates

- `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.
- `node scripts/case-layout-lab-browser-check.mjs`: mode switching, independent expandable state, drawer selection, focus view/next/previous, pinned layout responsiveness, original case link, horizontal overflow and light/dark screenshots.
- `node scripts/case-overview-browser-check.mjs`: regression on untouched primary case-detail navigation.
- Do not merge until the rendered previews have been inspected at 390, 900, 1280, and 1440px.

The lab is intentionally experimental. Use it to choose the final design **before changing production navigation again**.
