# Case detail navigation — compact contextual tabs

## User requirement

Keep **instant one-view-at-a-time tab switching**, with no need to scroll between Findings, Hypotheses, Attack path, Entities, Sources, and Related cases. Fix the *visual hierarchy* rather than replacing tabs with a scrolling report.

This supersedes both the old contextual left rail and the single continuous-page experiment. The five primary categories and eleven original subviews are retained.

## Implementation

### Primary navigation: one prominent row

The sticky primary tabs remain **Decision / Investigation / Evidence / Response / Timeline**, with the existing Geist/Linear-like understated text and active underline. The global topbar breadcrumb continues to identify the case.

### Secondary navigation: compact segmented control

Each category with two or three sibling views gets one **32–36px contextual pill tablist** in the page content, not a full-width secondary bar, separate sidebar, or permanently stacked report.

Examples:
- Decision: **Summary / OSCAR trace**
- Investigation: **Findings (5) / Hypotheses (2) / Attack path**
- Evidence: **Entities (4) / Sources (5) / Related (2)**
- Response: **Actions (4) / Notes**
- Timeline: no extra control

These are **Tabs**, not toggles. They retain accessible tablist/tabpanel semantics, focus and left/right key navigation, a distinct active state, visible focus outlines, and URL selection.

Only one secondary panel is visible at a time. The other panels stay mounted but inert to preserve unsaved local preview state, internal detail disclosures, and back/forward history. View changes do not require scrolling past another section.

Counts are shown as subordinate metadata inside controls, not as part of the title. Active panel headings use more descriptive titles, e.g. **Related cases**, rather than another repeated `EVIDENCE 03 / 03` overline.

### Layout and source content

- All content panels use the complete readable case workspace width (max 1120px), not a narrower column beside a rail.
- The case header, top-level tabs, subview switcher, and content share the same horizontal alignment.
- The redesigned Related cases component retains full titles and semantic statuses with natural text wrapping instead of the cramped oversized cards.
- FindingExplorer remains a compact list + selected evidence inspector (inline beneath the item on mobile).
- No new runtime dependencies, mutations, permissions, telemetry, or hidden source sections were introduced.

### Deep links and scroll behavior

- Canonical `?tab=...&view=...` still selects the specific tab and subview.
- Old anchors including `#finding-*`, `#entity-*`, `#hypotheses`, `#decision-heading`, and `#actions` still select their owner view and focus/scroll to the referenced target.
- Changes between tabs update the query without navigating away or refetching the page.
- The selected tab stays visible in a small horizontal overflow track on narrow screens; the page itself never overflows horizontally.
- When switching away from a long view, the page may scroll back to the *compact control* if it has been scrolled out of view. There is **no scroll-as-navigation** between sibling views.
- Contents of a single especially long source record may naturally scroll; this redesign does not hide technical data just to claim every record fits in one screen.

## Research basis

- [Geist Tabs](https://vercel.com/geist/tabs): sibling view selection, URL-backed active state, short noun labels, badges separate from tab names, 5–7 maximum primary items and accessible keyboard interaction.
- [Geist Switch](https://vercel.com/geist/switch): quiet segmented visual treatment for 2–3 mutually exclusive views; implemented with semantic Tabs because they navigate panels.
- [Linear UI refresh, March 2026](https://linear.app/changelog/2026-03-12-ui-refresh): consistent view controls and headers with quieter navigation chrome.
- [shadcn Base UI Tabs](https://ui.shadcn.com/docs/components/base/tabs): existing project primitives and panel semantics, no new library.

## QA

- `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
- `node scripts/case-overview-browser-check.mjs`: 5 primary tabs, 11 subviews, 1 visible detail at a time; keyboard, URL restore, findings, verdict review, dark/light and mobile widths.
- `node scripts/content-width-browser-check.mjs`: one content alignment axis, no secondary rail, no horizontal page overflow.
- Validate at 320, 390, 900, 1280, 1440 and 1920px, with the sidebar expanded/collapsed.
- Review screenshots before merging; deployment success alone is not visual QA.

**This supersedes the earlier `docs/case-single-workspace-layout.md` specification.**
