# Case detail: one navigation tier, five complete workspaces

## Why this replaces the contextual section rail

Feedback from the rendered screenshot demonstrated that the previous design was not solving orientation: **Evidence** appeared three times (primary tab, rail heading, section overline), the rail truncated `Similar past cases`, and technical case titles had too little space. A second navigation surface was the wrong abstraction; making it wider would steal still more width from the actual evidence.

New rule: **navigation explains location once; section headings explain content once**.

## Information architecture

| Primary tab | Visible sections, in reading order | Default first task |
| --- | --- | --- |
| Decision | Decision briefing, OSCAR investigation trace | Review proposed verdict, uncertainty and approval path |
| Investigation | Findings explorer, hypotheses, reported attack path | Assess evidence and alternative explanations |
| Evidence | Entities, source responses, related cases | Verify source records and context |
| Response | Recommended response, analyst notes | Review proposals and document response |
| Timeline | Case activity | Review historical events |

The 11 source sections are not removed or collapsed into undocumented data. They now appear as **sections in a single scrollable document for each of five top-level tabs**. This eliminates a second horizontal row, the 176px rail, its view-count heading and repeated category overlines.

### Layout

- One existing 44px sticky category tab row.
- Each selected workspace renders its complete set of sections below the tab row, with a readable **1120px maximum content width** and generous vertical spacing.
- Each section has a unique, concise title, optional subordinate description, and a subtle count only where useful. No repeated `EVIDENCE 03/03` preface.
- Card content uses `min-w-0` and word wrapping; source references remain intact.
- Related cases no longer use oversized side-by-side cards with repeated “Case ID unavailable.” Two compact stacked records show a readable title, shared host, date and statuses. The limitation about missing IDs and historical outcome appears **once** as a footer, not for every record.
- The top bar still provides the actual case identifier. The sidebar still provides global navigation. No extra breadcrumb rows.

### URL compatibility and navigation

- The `tab` parameter selects the parent workspace.
- Old `view` parameters select a **scroll destination** within that parent instead of hiding the other sections. The original query format is preserved for existing external links.
- Hash links such as `#finding-memory-access`, `#entity-host-fmlab-ws1`, `#actions`, `#decision-heading` select the containing workspace and scroll to the target.
- The existing local review dialog and finding selection persist when switching categories, because inactive tab content stays mounted.
- Browser back/forward and mobile primary-tab scrolling are retained.
- No additional component dependency, no new data, and no backend mutations.

### Design reference decision

shadcn/ui [dashboard blocks](https://ui.shadcn.com/blocks/dashboard) demonstrate how a page can use one shell and multiple content sections; [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines) emphasize accurate titles, not “shipping the schema,” and contextual next actions. Neither source requires nested tab bars for content-heavy screens. We reuse existing FortMind primitives instead of adding Tailark marketing blocks.

## Verification

- `node --test scripts/case-navigation.test.mjs` confirms legacy URL and anchor destinations.
- `node scripts/case-overview-browser-check.mjs` exercises all five tabs and eleven visible sections, two readable related-case rows, old ?view and hash links, filter re-selection, local verdict review, responsive widths and theme snapshots.
- `node scripts/content-width-browser-check.mjs` confirms each displayed section is inside the max-width workspace rather than offset by an extra rail.
- `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.
- Visual: 320/390/900/1280/1440px in light/dark; no horizontal document overflow, no nested nav, copyable technical values, sticky tabs and usable focus.

Do not merge without browser-level visual validation. Existing screenshot-based data remains explicitly preview-only.
