> Current semantic presentation (2026-11-06): [design-foundation.md](design-foundation.md#semantic-indicators-6-november-refinement). It replaces the historical palette, badge styling and icon choices below. `app/globals.css` and `lib/semantic-states.ts` are the current source of truth.

> The finalized 2026-11-04 palette, icon registry and validation are in [semantic-system.md](semantic-system.md). The earlier implementation notes below are historical and superseded where they differ.

> Historical design/validation record. For current routes, file locations and checks, see [platform structure](platform-structure.md).

# FortMind semantic refinement

Priority/workflow indicators were subsequently refined on October 27: 2.25 stroke, 6px spacing, and dedicated accessible light-mode icon ink. Filled badges retain the styles documented below. See [indicator-scanability.md](indicator-scanability.md) for current indicator details.

The existing layout, six-card reference grid, Inter/Geist Mono typography, compact/comfortable row density, routes, shadcn Neutral foundation, and mock-only data flow are preserved. No dependencies were added.

## Audit and changes

The earlier implementation duplicated priority/verdict color mappings in chart data and badge code. Several evidence, integration, and action states used a generic circle or an imprecise icon; evidence timeout was incorrectly categorized as orange failure. Dark badges used saturated 950 backgrounds and 800 borders.

All product state definitions now live in `lib/semantic-states.ts`: labels, meanings, tones, Lucide components, icon names, and derived CSS color references. Charts consume the same definitions as badges. The registry also covers assignment, investigation phases, and action kinds so neutral states never depend on a generic icon fallback.

Verdicts retain subtle tinted badges. Priority and workflow use neutral text with semantic icons, so one row no longer has three competing filled color treatments. All treatments keep the same 24px height, 16px icons, 12px medium text, 5px icon gap, and 1.75 stroke. Filled badges keep 2px/7px padding; text treatments remove horizontal padding and use transparent borders/backgrounds to preserve table density. KPI descriptions are neutral, and their icons and label/value alignment are consistent.

An opt-in `iconSize="compact"` shadcn Badge variant fixes its forced 12px icon utility. The default 12px behavior is preserved for existing consumers. Preview CSS no longer tries to override that important utility.

## Exact semantic color tokens

Every entry references installed Tailwind CSS palette variables. Dark tint percentages use `color-mix(in oklab, var(--semantic-ROLE) N%, transparent)`, composited over the actual neutral surface. Foregrounds remain fully opaque. Existing danger/warning/success/info aliases and global Neutral contracts are retained. No FortCases preset or additional verdict/priority contrast guardrails exist in this checkout; none were removed or weakened.

| Token                               | Light       | Dark              |
| ----------------------------------- | ----------- | ----------------- |
| `--semantic-danger`                 | red-600     | red-400           |
| `--semantic-danger-foreground`      | red-900     | red-300           |
| `--semantic-danger-background`      | red-50      | red-400 / 10%     |
| `--semantic-danger-border`          | red-200     | red-400 / 20%     |
| `--semantic-warning`                | amber-600   | amber-400         |
| `--semantic-warning-foreground`     | amber-900   | amber-300         |
| `--semantic-warning-background`     | amber-50    | amber-400 / 10%   |
| `--semantic-warning-border`         | amber-200   | amber-400 / 20%   |
| `--semantic-positive`               | green-600   | green-400         |
| `--semantic-positive-foreground`    | green-900   | green-300         |
| `--semantic-positive-background`    | green-50    | green-400 / 10%   |
| `--semantic-positive-border`        | green-200   | green-400 / 20%   |
| `--semantic-information`            | blue-600    | blue-400          |
| `--semantic-information-foreground` | blue-900    | blue-300          |
| `--semantic-information-background` | blue-50     | blue-400 / 10%    |
| `--semantic-information-border`     | blue-200    | blue-400 / 20%    |
| `--semantic-failure`                | orange-600  | orange-400        |
| `--semantic-failure-foreground`     | orange-900  | orange-300        |
| `--semantic-failure-background`     | orange-50   | orange-400 / 10%  |
| `--semantic-failure-border`         | orange-200  | orange-400 / 20%  |
| `--semantic-neutral`                | neutral-500 | neutral-400       |
| `--semantic-neutral-foreground`     | neutral-700 | neutral-300       |
| `--semantic-neutral-background`     | neutral-100 | neutral-400 / 8%  |
| `--semantic-neutral-border`         | neutral-200 | neutral-400 / 18% |
| `--semantic-agent`                  | violet-600  | violet-400        |
| `--semantic-agent-foreground`       | violet-900  | violet-300        |
| `--semantic-agent-background`       | violet-50   | violet-400 / 10%  |
| `--semantic-agent-border`           | violet-200  | violet-400 / 20%  |

Supporting tokens remain: `--muted-foreground` neutral-600/light and neutral-400/dark; `--ring` neutral-500/light and neutral-400/dark; `--destructive` red-700/light and red-400/dark. Destructive actions remain distinct from security verdicts. `--preview-canvas` continues to inherit `--sidebar` in light mode and `--background` in dark mode.

The inherited `--primary` is unchanged: shadcn Neutral `oklch(0.205 0 0)` in light and `oklch(0.922 0 0)` in dark. Cases per day uses it directly. Priority and verdict chart fills use each registry definition's `color`, which references the same `--semantic-*` base as badge tints. All card, divider, input, page, popover, sidebar, and foreground Neutral defaults in `app/globals.css` remain untouched.

## Complete state-to-icon and meaning registry

### Verdicts

| State        | Semantic family   | Lucide icon       | Meaning                                                              |
| ------------ | ----------------- | ----------------- | -------------------------------------------------------------------- |
| Malicious    | danger / red      | `shield-alert`    | Evidence supports malicious activity.                                |
| Suspicious   | warning / amber   | `shield-question` | Activity warrants further analyst assessment.                        |
| Benign       | positive / green  | `shield-check`    | Evidence supports legitimate or expected activity.                   |
| Inconclusive | neutral / neutral | `circle-help`     | Evidence does not establish a verdict; this is not a severity level. |

### Priorities

| State         | Semantic family   | Lucide icon   | Meaning                                                               |
| ------------- | ----------------- | ------------- | --------------------------------------------------------------------- |
| Urgent        | danger / red      | `chevrons-up` | Requires the most immediate review, independently of verdict.         |
| Notable       | warning / amber   | `chevron-up`  | Requires prioritized review, independently of verdict.                |
| Informational | neutral / neutral | `minus`       | Informational urgency; no positive or negative assessment is implied. |

### Workflow

| State           | Semantic family    | Lucide icon      | Meaning                                                                            |
| --------------- | ------------------ | ---------------- | ---------------------------------------------------------------------------------- |
| Needs you       | warning / amber    | `hand`           | An analyst decision or intervention is required.                                   |
| Running         | information / blue | `loader-circle`  | The investigation is actively processing.                                          |
| Closed          | neutral / neutral  | `check-circle-2` | The workflow is closed; this does not imply a benign verdict.                      |
| Closed by OSCAR | agent / violet     | `check-check`    | A closed case with autonomous OSCAR attribution; not a separate backend lifecycle. |
| Failed          | failure / orange   | `circle-x`       | Investigation processing failed; this is not a malicious verdict.                  |
| Queued          | neutral / neutral  | `clock-3`        | The investigation is waiting to start.                                             |
| Escalated       | warning / amber    | `arrow-up-right` | The case was referred for further attention.                                       |

### Evidence

| State     | Semantic family   | Lucide icon    | Meaning                                                                 |
| --------- | ----------------- | -------------- | ----------------------------------------------------------------------- |
| OK        | positive / green  | `check`        | Evidence collection completed successfully.                             |
| Error     | failure / orange  | `circle-x`     | Evidence collection encountered a processing error.                     |
| Timed out | warning / amber   | `clock-alert`  | Evidence collection exceeded its time limit and needs attention.        |
| Skipped   | neutral / neutral | `skip-forward` | Collection was intentionally omitted; no failure or success is implied. |

### Actions

| State    | Semantic family   | Lucide icon   | Meaning                                                                       |
| -------- | ----------------- | ------------- | ----------------------------------------------------------------------------- |
| Proposed | neutral / neutral | `file-clock`  | An action has been drafted and awaits a decision.                             |
| Approved | positive / green  | `check`       | An action has been authorized.                                                |
| Rejected | neutral / neutral | `x`           | The proposed action was declined; this is a decision, not a processing error. |
| Done     | positive / green  | `check-check` | The action completed successfully.                                            |
| Pending  | neutral / neutral | `clock-3`     | An action is awaiting execution or completion.                                |

### Integrations

| State         | Semantic family    | Lucide icon     | Meaning                                                          |
| ------------- | ------------------ | --------------- | ---------------------------------------------------------------- |
| Connected     | positive / green   | `plug-zap`      | The integration connection is established.                       |
| Not connected | neutral / neutral  | `plug`          | No connection is configured or established; no error is implied. |
| Testing       | information / blue | `loader-circle` | Connection validation is in progress.                            |
| Error         | failure / orange   | `circle-alert`  | The integration encountered a system or connection error.        |
| Key expired   | warning / amber    | `key-round`     | The credential has expired and requires attention.               |
| Key accepted  | positive / green   | `key-round`     | The supplied credential was accepted.                            |

### Hypotheses

| State        | Semantic family   | Lucide icon   | Meaning                                                                 |
| ------------ | ----------------- | ------------- | ----------------------------------------------------------------------- |
| Confirmed    | positive / green  | `check`       | Evidence supports the hypothesis; this does not imply a benign verdict. |
| Refuted      | neutral / neutral | `x`           | Evidence does not support the hypothesis; refutation is not a failure.  |
| Inconclusive | neutral / neutral | `circle-help` | Available evidence cannot confirm or refute the hypothesis.             |
| Primary      | agent / violet    | `sparkles`    | OSCAR's primary investigation hypothesis.                               |

### Assignment

| State                | Semantic family   | Lucide icon        | Meaning                                                    |
| -------------------- | ----------------- | ------------------ | ---------------------------------------------------------- |
| Anyone               | neutral / neutral | `users-round`      | Include cases regardless of assignment.                    |
| Assigned to me       | neutral / neutral | `user-round-check` | Cases assigned to the current analyst.                     |
| Unassigned           | neutral / neutral | `user-round`       | No analyst owns the case; this is not a security severity. |
| Other assigned users | neutral / neutral | `user-round`       | Cases assigned to other analysts.                          |

### Phases

| State     | Semantic family    | Lucide icon     | Meaning                                      |
| --------- | ------------------ | --------------- | -------------------------------------------- |
| Completed | neutral / neutral  | `check`         | This investigation phase has completed.      |
| Active    | information / blue | `loader-circle` | This investigation phase is processing.      |
| Pending   | neutral / neutral  | `circle`        | This investigation phase has not started.    |
| Failed    | failure / orange   | `circle-x`      | This phase encountered a processing failure. |

### Action kinds

| State       | Semantic family   | Lucide icon | Meaning                                                                  |
| ----------- | ----------------- | ----------- | ------------------------------------------------------------------------ |
| Containment | neutral / neutral | `shield`    | An action intended to limit exposure; no approval or outcome is implied. |
| Recommended | neutral / neutral | `lightbulb` | A suggested action; no approval or outcome is implied.                   |

All requested Lucide exports exist in installed `lucide-react` 1.61.0. The package supports aliases such as `CircleHelp`, `ShieldQuestion`, and `CheckCircle2`; no icon substitution was necessary.

## Deliberately neutral states

- Unassigned describes ownership, not urgency or a negative outcome. Its person icon is distinct from waiting or assessment icons.
- Proposed is a drafted action awaiting a decision (file-clock); Pending is an action waiting to run or finish (clock-3).
- Refuted is an evidential conclusion (x), not a processing error. Rejected is an analyst decision (x), not a system failure. Their labels and categories preserve the distinction.
- Inconclusive means evidence is insufficient (circle-help), not benign, malicious, successful, or failed.
- Not connected describes a connection state (plug) and does not presume a connection error (circle-alert).
- Closed describes a lifecycle outcome, not a benign verdict; Queued describes a waiting investigation. Informational priority communicates urgency only.
- Skipped is intentional omission (skip-forward). Assignment filters, action kinds, and pending/completed phases also remain neutral where no outcome or security severity is implied.

## Contrast and validation

No failing semantic text color pair was found in the baseline; the dark-mode issue was visual saturation. This refinement reduces background/border intensity while retaining opaque readable text. The previous contrast sampler treated transparent colors as standalone values; it now composites all ancestor surfaces before measuring, matching browser rendering.

Validation includes all seven semantic roles on page, card, and popover surfaces, every visible semantic badge, real muted metadata and chart axes, and destructive button text. It also checks 24px badge height and 16px rendered icons. Current measured results, screenshots, and checks are recorded in `semantic-refinement-validation.json`.

TypeScript, ESLint (no warnings), all 16 tests, and the production build passed. All 12 browser interactions, 10 viewport/theme combinations (1440, 1280, 1024, 768, 390px), focus trapping, Escape, reduced motion, and mobile-sheet checks passed. No console/hydration errors or page/table overflow were observed. Semantic token pairs measure 8.65–10.05:1 in light mode and 8.21–12.31:1 in dark mode across the three surfaces. Actual badge text, including neutral workflow treatments, remains at least 7.81:1 light and 6.94:1 dark. Destructive action text is 5.30:1 light / 4.64:1 dark.

The four required screenshots were inspected at both 1440px and 1280px, in light and dark themes. They are saved in `docs/screenshots/semantic-refinement/`. The original routes also returned HTTP 200.

## Files changed in this refinement

- `lib/semantic-states.ts`: canonical state registry (new).
- `lib/preview-data.ts`: removes duplicated tone mappings from chart fixtures.
- `components/fortmind/semantic.tsx`: one registry-driven badge primitive; no generic fallback icon.
- `components/fortmind/charts.tsx`: chart colors resolve through the registry.
- `components/fortmind/dashboard-preview.tsx`: registry workflow icons, neutral metric descriptions.
- `components/fortmind/case-table.tsx`: canonical Unassigned icon/label/meaning.
- `components/fortmind/showcase.tsx`: canonical reference and action-kind definitions; six-card grid preserved.
- `components/ui/badge.tsx`: opt-in 16px icon-size variant, existing defaults preserved.
- `app/design-preview/preview.css`: restrained dark tokens, consistent semantic treatments and KPI labels, 16px owner icon.
- `scripts/preview-semantics.test.mjs`: exact mapping, icon compatibility, meaning, token and neutral-state contracts (new).
- `scripts/preview-browser-check.mjs`: real composited contrast, rendered geometry, 1280px captures, reset visual-review state.
- `package.json`: includes semantic tests in the existing preview test command.
- `docs/design-system.md`, this report, validation JSON and desktop screenshots: updated evidence and implementation guidance.

## Official references

The palette and transparency approach follows [Tailwind colors](https://tailwindcss.com/docs/colors) and [color opacity](https://tailwindcss.com/docs/color). The neutral foundation follows [shadcn theming](https://ui.shadcn.com/docs/theming). Badge and chart APIs were checked against [shadcn Badge](https://ui.shadcn.com/docs/components/base/badge) and [Chart](https://ui.shadcn.com/docs/components/base/chart). [Lucide's clock-alert](https://lucide.dev/icons/clock-alert) is used for timeouts; every requested icon was also verified against the installed module.
