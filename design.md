# FortMind visual contract

> **Client reference update — 11 November 2026:** The eight supplied platform screenshots define the page-layout baseline. See [client-reference-alignment.md](docs/client-reference-alignment.md) for the Home, Cases, Case Detail, Integrations, Reports and Settings implementation map and targeted prompts. This branch deliberately preserves the existing FortMind/OSCAR color identity and demo semantics instead of copying the production platform's monochrome treatment. It builds on the earlier Geist font alignment branch. Do not assume the live platform shares this repository's architecture.

Status: working design/engineering guidance for the **local demonstration prototype** (11 November 2026). This repository is not the client production application. Implemented styles, not this prose, determine current behavior.

## Sources of truth

- `app/globals.css`: theme tokens, responsive gutters, typography roles, surface roles, border and focus states.
- `lib/semantic-states.ts`: status, verdict, priority and OSCAR semantics. Never derive a verdict from UI styling.
- `components/ui/*`: existing accessible shadcn/Base UI primitives.
- `components/fortmind/*`: workflow-specific components.
- `docs/design-foundation.md`: detailed typography, spacing and palette implementation record.
- `docs/platform-structure.md`: route map and validation boundaries.
- `docs/fortmind-implementation-packs.md`: scoped design-to-code handoff prompts.

Avoid another stylesheet, component system or duplicate token map. Historical docs, including `docs/design-system.md`, may discuss superseded experiments.

## Visual intent

Use Vercel's Geist design principles as a **visual reference**, not a copy of Vercel's product layout.

1. **Neutral first.** The near-black canvas, understated borders and clear text hierarchy are the foundation. Prefer border-led cards over stacked tinted rectangles. Light and dark themes must both work.
2. **Typography.** Geist Sans is the interface face; Geist Mono is for IDs, command strings, timestamps and technical values. Use the size roles defined in `globals.css` rather than arbitrary one-off sizes.
3. **Restrained brand.** Green identifies OSCAR and deliberate brand actions. Do not use it for universal focus rings, backgrounds, navigation hover, or every metric.
4. **Semantic independence.** Malicious, suspicious, benign and inconclusive are verdicts. Urgent/notable/informational are priorities. Needs You/running/closed/failed are workflow states. Never conflate these palettes.
5. **Surfaces and geometry.** Use existing tokens (`bg-background`, `bg-card`, `bg-surface`, `bg-surface-floating`, `border-border`, `text-muted-foreground`) and existing radii. Avoid gradients, decorative rings, glass, shadows and arbitrary hex values.
6. **Hierarchy.** Put section headings and content in the same clearly bounded section when possible. Use whitespace before adding another shade or outline.
7. **Interaction.** Every actionable control needs an accessible label, clear focus state and responsive hit area. Preserve pointer, keyboard and screen-reader behavior.
8. **Progressive disclosure.** Compact queue rows show comparison data; previews reveal key context; full investigation pages expose deep evidence.

## Responsive contract

- Check at 320, 390, 768, 1024, 1440 and 1920 CSS pixels. The workspace gutters and max-width belong to `PageContainer`.
- Page headers, case IDs and button groups wrap rather than clipping outside the viewport.
- Filters may wrap; search remains usable and the most common filters stay discoverable.
- Table information must not silently disappear: mobile badges/context reveal fields hidden from the desktop comparison grid. Any horizontally scrollable region must be keyboard-accessible and visibly focusable.
- Preserve the fixed/overlay inspector behavior with a full-screen mobile presentation.

## OSCAR truthfulness

The demo has fixtures, **not live telemetry**. The recorded five phases are Intake → Plan → Collect → Analyze → Report. Only show a phase as complete/running/failed when a supplied fixture supports that state. Do not manufacture timers, confidence, events or automated response execution. Label samples and estimated impact explicitly.

## Review protocol

For each change, provide (1) the problem and observed screenshot/viewport, (2) proposed behavior, (3) edited components and unchanged business logic, (4) accessibility and responsive verification, and (5) before/after images in both themes.

Validate with `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and the appropriate browser checks in `README.md`. Keep implementation on a feature branch and request review before merging into the demo. In the client's codebase, inspect actual tokens/components first; do not assume this prototype shares the same implementation.
