# Case Queue refinement

> Historical design/validation record. For current routes, file locations and checks, see [platform structure](platform-structure.md).

Scope: only Case Queue rows, status tabs and related filters. The shared palette in `app/globals.css`, page structure, column widths, owners and fixture values are unchanged.

## Rendering

- Priority uses the existing ChevronsUp / ChevronUp / Minus mappings with neutral text. Icons consume the existing danger / warning / neutral solid tokens for clear red and amber ink. Inline states have no pill backgrounds, borders or circles.
- Every queue status uses the existing compact shadcn semantic badge with a subtle tinted background and coordinated foreground for both icon and text. Needs You uses the supplied hand-with-exclamation geometry, rendered with currentColor in the existing amber treatment in both the table and tab. Running uses a static blue LoaderCircle in both the table and tab; Failed uses a red CircleX; Queued uses a neutral clock. Explicit investigation phases extend only Running and Failed labels.
- Closed uses a subtle green badge with the normal check-circle in the queue. Closed by OSCAR requires both `status === "Closed"` and `closedByOscar === true`, and uses a green Sparkles badge. Escalated uses a muted violet badge with ArrowUpFromLine to distinguish it from amber Needs You. Its dedicated escalation role reuses the established violet palette without implying automated provenance. The shared lifecycle mappings on other pages remain unchanged.
- Verdicts use compact, lightly tinted badges. A supplied score renders as `Verdict · score/100`; the score can wrap inside the existing badge to preserve column widths and the 62px compact row height. Icons remain 16px with a 2px stroke.
- Supplied outcome descriptions such as Closed as noise or Internal error render as secondary text in the existing status cell.
- Status tabs reuse queue mappings and retain counts, neutral labels, and the neutral active underline. Filter options reuse the same priority/verdict icons and ink as the corresponding row representation. Active filters retain selected radio states and emphasize the existing trigger border.

## Data fidelity

The current queue is backed by demonstration data in `lib/preview-data.ts`, not a connected case API. Existing `confidence` describes investigation confidence and is never relabeled as verdict confidence. No fixture values were added or changed.

The model accepts optional `verdictConfidence`, `investigationPhase` and `outcomeDescription` fields. Missing scores, phases and reasons are omitted. Verdict scores must be finite numbers in 0–100, including a genuine zero. Invalid values are not clamped or replaced with investigation confidence. No phase is inferred from a summary, and investigation completion never closes a case.

## Ownership

- `lib/semantic-states.ts`: queue-specific status presentation derived from the shared registry.
- `lib/case-queue-presentation.ts`: independent-field formatting and explicit attribution checks.
- `components/fortmind/case-queue-semantic.tsx`: shared queue verdict/status renderers.
- `components/fortmind/case-table.tsx`: table, tabs and filter integration; the drawer keeps its existing implementation.
- `app/design-preview/cases/cases-workspace.css`: token-only scoped styling.

## Validation

`node --test scripts/preview-data.test.mjs scripts/preview-semantics.test.mjs scripts/overview-data.test.mjs scripts/color-audit.test.mjs scripts/case-queue.test.mjs`: 39 passing tests. ESLint and TypeScript pass after the status badge change. The Webpack production build passed before this presentation-only refinement.

`scripts/case-queue-browser-check.mjs` compares both themes against the recorded baseline and verifies unchanged page/table geometry, column widths and compact row height. It checks actual rows, closed/OSCAR distinctions, filter selection, matching icon colors, neutral active underline, reduced motion and 1280px page overflow. Explicit test props exercise supplied verdict scores, phases and descriptions without adding invented values to product records.

[Browser validation](case-queue/dev-validation/validation.json) · [Light queue](case-queue/dev-validation/queue-light.png) · [Dark queue](case-queue/dev-validation/queue-dark.png) · [OSCAR and manual closure](case-queue/dev-validation/closed-dark.png) · [Selected filter](case-queue/dev-validation/filter-dark.png)

Final browser result: 554 rendered samples; minimum text contrast 5.721:1 and meaningful-icon contrast 4.601:1. Zero runtime errors, console errors, warnings or failed resource requests. Table column widths and 62px compact row height match the baseline in both themes.

Light-mode Urgent and Needs You icons use the existing deeper danger/warning foreground shades (#BE123C and #805B08). Dark-mode Urgent and the Needs You tab retain #FB7185 and #E4B744. The Needs You badge uses the coordinated warning foreground (#F2CF70 in dark mode) against the warning-muted background. These roles come from globals.css; no palette values were added or changed for the status badges.

The priority and tab icon rules fall back to the established danger/warning foreground tokens if an older development stylesheet lacks the queue aliases. Status badges consume the existing semantic foreground/background tokens directly. This prevents neutral-gray inheritance during CSS refreshes. The change was verified directly on `http://localhost:3000` in both themes, including simulated missing aliases, with no browser errors or warnings.
