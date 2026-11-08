# Overview mission-control refinement

Implemented November 6, 2026. This refines the existing Overview; its cards, stacked outcomes chart, vertical analytics cards, typography, palette, and theme mechanism remain in place. No package dependencies or color tokens were added.

## Audit and implementation choices

- The project uses Next.js 16, React 19, TypeScript, Tailwind 4, shadcn Base UI, and Recharts. Existing Card, Button, Table, Tabs, semantic badges, and `CaseQuickPreview` provide the needed surfaces and interactions.
- `SecurityCase` already defines phase states, recommended next action, summary, lifecycle, verdict, and priority. The established phase order is **Intake → Plan → Collect → Analyze → Report**. The longer conceptual lifecycle in the brief is not a validated replacement.
- Overview's original running fixtures supply a current activity label and static elapsed value, but no phase completion history or event timestamps. Direct collection/analysis labels map to active Collect/Analyze only. Correlation remains unmapped; earlier phases never become completed or pending by inference.
- The queue includes a running case with a more specific supplied summary about connection history and process lineage. It is now visible in the monitor alongside the original three Overview examples. The case table now uses the existing unified `platformCases` catalog so these cases also appear in the Running filter and All cases.
- Fortcases already has no prominent New Case action. Overview's action was removed. The underlying `new-case.tsx` component and browser-local case store were retained. Connect tools is a secondary link to the existing Integrations page.

## Changes by section

| Existing section | Refinement |
| --- | --- |
| Header/actions | Explicit demonstration/snapshot label; removed New Case; secondary Connect tools link. |
| Needs you / Running / Closed / Failed | Existing values and filtered destinations retained; concise descriptions explain human decisions, autonomous work, completed investigations, and recovery. Keyboard focus is visible. |
| OSCAR is investigating | Four supplied examples show ID, host, current stage, and supplied elapsed time. A case with no investigation clock shows case age explicitly. One investigation expands at a time into the established phase tracker, available activity, missing-telemetry explanation, and full investigation link. On narrower screens this panel precedes attention. |
| Needs your attention | Existing urgent-first/oldest-case ordering and compact table retained. Next-action text appears beneath each title. “Waiting” becomes “Case age” because the source contains no human-handoff timestamp. Existing quick previews retain the path to full review. |
| Escalations/recovery | An expansion inside the existing attention footer shows supplied escalation context, the connector timeout, and recovery guidance. These are review links/guidance; they do not execute containment or retry. |
| Investigation outcomes | Existing Recharts infrastructure, stacked bars, tooltip breakdown, series controls, and 7/30/90-day periods retained. An explicit equation reconciles OSCAR and analyst closures and defines OSCAR's closure share. Failures remain separate. |
| Performance | Autonomous closure count/share, estimated time saved, and recorded failures. Analyst closure count is already in the chart, so the duplicate row was removed. The configured minutes-per-case assumption is visible. No failure percentage is presented: case closures plus failed runs do not establish a verified unique run/retry denominator. |
| Priority mix | Existing neutral bars and semantic labels. The denominator explicitly includes Needs you + Running, excluding failed/queued cases. |
| Verdict mix | Existing semantic colors, counts, and percentages; explicitly fixed to the available Oct 28–Nov 3, 2026 closed-case sample. |

Chart and Performance selectors remain independent, as in the existing implementation. Their dates are visible and a section note explains this. Priority remains a snapshot and Verdict remains a fixed sample. Longer-period outcomes are existing illustrative generated fixtures, not measured production performance. Snapshot totals are illustrative aggregates; linked queues contain sample records rather than the full aggregate population.

## Components and data locations

| File | Responsibility |
| --- | --- |
| `components/fortmind/overview/overview.tsx` | Existing page composition, header, KPI navigation. |
| `components/fortmind/overview/investigations.tsx` | New compact activity list and single-investigation expansion. |
| `components/fortmind/overview/attention.tsx` | Extracted attention table and handoff/recovery expansion. |
| `components/fortmind/investigation-progress.tsx` | New reusable accessible five-phase tracker. |
| `lib/investigation-progress.ts` | Supplied-state interpretation; unknown fallback and guarded completion counts. |
| `lib/overview-data.ts` | Existing aggregates and running fixtures; typed monitor adapter and handoff selection. |
| `lib/preview-data.ts` | Recommended next actions extracted from existing supplied summaries. |
| `components/fortmind/overview/impact.tsx` | Existing reporting components and clarified metric definitions. |
| `components/fortmind/case-table.tsx` | Reused `CaseQuickPreview`; case-table data now uses the already-existing unified catalog. |

`Card`, `Button`, `Table`, `Tabs`, `ChartContainer`, `ChartTooltip`, priority/verdict/workflow rendering, `caseNextAction`, route helpers, settings assumptions, and the existing theme tokens are reused. Navigation buttons rendered as anchors explicitly expose the link role with Base UI.

## External references

All references in the brief were reviewed before implementation. These patterns informed the final composition; no third-party source code or paid components were installed/copied:

- [affectUI Agent Monitor](https://www.affectui.com/components/agent-monitor): concise current activity/time with expandable detail. Omitted its cost/tool-command features because FortMind has no supporting telemetry.
- [shadcn Trace](https://ui.shadcn.com/docs/components/base/trace) and [Task](https://ui.shadcn.com/docs/ai-elements/base/task): progressive disclosure of an agent's work and a path to detail. The final small composition uses existing controls rather than adding the full Trace family.
- [shadcn Plan](https://ui.shadcn.com/docs/ai-elements/base/plan): distinguish known ordered phases from recorded completion. Unlike the example, FortMind never pre-fills missing pending/completed states.
- [ReUI Timeline](https://reui.io/components/timeline): compact ordered milestones; progress is supplied by data rather than advanced by user clicks.
- [shadcn Chart](https://ui.shadcn.com/docs/components/base/chart): keep the existing Recharts wrapper, explicit series, tooltips, and accessible chart layer.

Agent Lanes, Agent Recap, Tool, Confirmation, Progress, AI Elements, and React Flow were also reviewed. A multi-agent timeline, tool log, approval execution surface, graph, or numerical investigation progress would exceed the available data or scope.

## Data needed for production monitoring

Reuse existing fields wherever supplied. Production telemetry should provide:

| Data | Purpose |
| --- | --- |
| Case/run identifier and `startedAt` | Reliable investigation elapsed time, distinct from case age. |
| Current phase, current activity, observed-at timestamp | Specific, fresh work context without deriving tool calls from a stage name. Correlation requires an explicitly validated mapping if it belongs to a phase. |
| Explicit state for each phase; start/completion timestamps | Truthful completion counts and durations. Unknown must stay distinct from pending. |
| Latest event text, event timestamp, and provenance | A meaningful last update. No synthetic ticker, polling, or WebSocket system was introduced. |
| Human-handoff timestamp, reason, required decision, recommended next action | Actual waiting duration and actionable human context. |
| Failure reason, retry state/count, supported recovery action, permissions | Explain recovery and expose only permitted operations. |
| Resolution attribution and timestamps, reporting window, population definition | Defensible autonomous closure share and aligned distributions. |
| Run-level terminal outcomes with stable identities and retry relationships | A valid failure/retry rate; closed case totals are insufficient alone. |
| Measured analyst effort or a documented configurable assumption | Separate observed efficiency from estimated time saved. |

## Verification

`scripts/investigation-progress.test.mjs` covers missing/partial phase histories, complete histories with failures, source elapsed-time preservation, unmapped correlation, and linked case identity. Existing reporting tests reconcile each period's daily values, closed totals, verdict denominator, snapshot priority counts, and configurable savings assumptions.

`scripts/overview-browser-check.mjs` covers dark/light themes at 1440, 1280, 1024, 768, and 390 pixels; collapsed navigation; keyboard expansion; one open investigation; unknown phases; recovery quick preview and Escape; independent report controls; integration/KPI navigation; case routes; and horizontal overflow. Screenshots and the run's JSON result are written to `OVERVIEW_OUTPUT` (default `/tmp/fortmind-overview-mission/screens`).

Run with an available Playwright installation via `PLAYWRIGHT_MODULE` and, if needed, `PLAYWRIGHT_EXECUTABLE`. Production builds can preserve the existing opt-in Graphite flag with `FORTMIND_VISUAL_EXPERIMENT=graphite pnpm build`.

Remaining limitations are deliberate source-data boundaries: local demonstration records, no live telemetry, no invented completion/events, no measured time savings, no reliable handoff clocks, and no executable retry/containment from Overview.

Verified results:

- `pnpm typecheck` and `pnpm lint` passed with no warnings.
- `pnpm test`: all **64** tests passed.
- `FORTMIND_VISUAL_EXPERIMENT=graphite pnpm build`: production build passed.
- Overview browser checks passed across all five widths in both themes on the current development theme and on the Graphite production build. No page errors or horizontal overflow were observed. Running-filter checks verify all four monitored IDs are present.
- Existing case-inspector regression passed at 1280, 1440, and 1920 pixels in both themes, including sorted navigation across all 15 unified sample cases, pagination retention, focus return, and unchanged table geometry.
- The stacked chart tooltip reconciled the first bucket: 2 OSCAR + 4 analyst = 6 closed cases. Expanded monitoring text sampled above 7.5:1 contrast in Graphite dark mode. Default and expanded desktop/mobile screenshots were visually reviewed.
- `git diff --check` passed. Existing unrelated working-tree edits were preserved.
