# FortMind targeted implementation packs

These are scoped design-engineering handoffs for the **prototype** and can be adapted to the client's implementation after inspecting its current code. Do not give an LLM a screenshot and ask it to rebuild the entire page. Use one package at a time, compare the output at specified viewports, and reject unrelated changes.

Shared constraints: read `design.md`, `docs/design-foundation.md`, `app/globals.css`, `lib/semantic-states.ts` and relevant components before making edits. Reuse shadcn/Base UI primitives; preserve navigation, fixture semantics, filters and case actions. No new design dependency, animation library or backend integration. Do not claim this is a live SOC.

## Pack 01 — Case queue: density, filters, responsiveness

**Observe:** At 390px, search and toolbar controls need usable widths and touch targets. At desktop widths, column headings must line up with values, not leading icon gutters. Case titles and technical entities must remain inspectable when truncated.

**Implementation prompt**

> Audit `components/fortmind/case-table.tsx` and `components/ui/table.tsx` against `design.md`. Keep the four work views (Needs attention, Assigned to me, Unassigned, All cases), direct Verdict filter, remaining filters in More filters, and the Display menu. Improve responsive wrapping without changing filter logic, sorting, export or row behavior. Keep header/cell padding aligned for every optional column. Preserve title, metadata and semantic badges in responsive layouts. Tooltips may supplement truncated data but must not be the only access path for keyboard and touch users. Retain the quick preview and open-investigation actions. Verify 320/390/768/1440px in light and dark mode and report exactly what was changed.

**Acceptance:** No off-screen toolbar; filters remain clickable; no horizontal page overflow; keyboard access to table scrolling; verdict/priority visible or available through accessible row context; case data and exports unchanged.

## Pack 02 — Overview: OSCAR activity without decorative chrome

**Observe:** The demo previously used a green-tinted feature hero with ornamental concentric rings. The production screenshot suggests a simpler, neutral outlined investigation timeline.

**Implementation prompt**

> Audit `components/fortmind/overview/investigations.tsx`, `investigation-progress.tsx` and `overview/attention.tsx`. Use restrained Geist-like bordered surfaces, neutral text and a limited OSCAR semantic accent. Keep the current running-case list, run selection, recorded phase rail, meaningful unknown states, agent notes and links intact. On mobile, ensure the user knows details appear below the list; on larger viewports preserve the split inspection layout. Avoid decorative circles, unnecessary colored panels and invented live data. Do not change the source of progress completion or elapsed time.

**Acceptance:** Selection works with pointer and keyboard; unknown phases remain unknown; light/dark contrast passes manual check; the focused run remains identifiable; sample-data disclosure is visible.

## Pack 03 — Investigation preview: mobile header

**Observe:** With a long identifier, the case ID and the previous/next/close buttons can compete for the same horizontal space.

**Implementation prompt**

> In `components/fortmind/investigation-inspector.tsx`, allow ID and action groups to wrap cleanly at narrow widths, maintain 40px-or-larger mobile touch targets for navigation buttons, and keep title and classification readable. Preserve the mobile full-screen Sheet, desktop anchored inspector, focus restoration, tooltips, and Open investigation link. Do not replace the preview with a separate navigation route.

**Acceptance:** At 320/390px, no clipped buttons, case IDs or titles; Escape and close restore focus; previous/next actions remain operable; body scroll stays inside the inspector.

## Pack 04 — Case Detail: hold until existing PR review

There is already a stacked draft PR for a boxed Case Detail prototype. Do **not** silently overwrite it or migrate the experiment to the canonical route before review. Compare its summary surface, boxed tabs, in-panel headings and independent accordions against the intended UX; test deep-links, focus and long content. Keep its current 11 underlying data views until the client approves a new information architecture.

## Before/after handoff template

For every pack attach:
- **Before:** route, viewport width, light/dark mode, and screenshot of the current behavior.
- **Proposed:** local screenshot or Figma frame, plus a 2–3 sentence rationale.
- **Diff scope:** exact files/components touched, UI-only vs behavior change, risks and rollback.
- **Verification:** visible overflow, keyboard/touch, focus management, loading/error/empty states and app checks.
- **Decision:** accepted, revise, or defer; record owner and approval.

### Demo video support (optional)

Use a truthful 60–90-second storyboard: 1) show incoming signal and operational overview, 2) open an example OSCAR investigation, 3) explain the recorded plan/collect/analyze stages and evidence, 4) show a sample verdict requiring human review, 5) return to the impact snapshot. Keep mock states labeled as demonstration data; don't portray local fixtures as actual automatic incident response.
